/**
 * @fileoverview Rule to validate the structure of "Tabs" blocks using DocumentApp.
 */

/**
 * Generates a URL-friendly slug from a string.
 * This is used to create predictable IDs from heading text.
 * e.g., "My Awesome Heading" -> "my-awesome-heading"
 * @param {String} text The text to slugify.
 * @return {String} The slugified text.
 */
function slugify(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-'); // Replace multiple - with single -
}

/**
 * Finds all Paragraph elements that are headings within a given element.
 * @param {GoogleAppsScript.Document.Element} parentElement The element to search within.
 * @return {GoogleAppsScript.Document.Paragraph[]} An array of heading paragraphs.
 */
function findHeadings(parentElement) {
  const headings = [];
  if (!parentElement || typeof parentElement.getNumChildren !== 'function') {
    return headings;
  }
  for (let i = 0; i < parentElement.getNumChildren(); i++) {
    const child = parentElement.getChild(i);
    if (child.getType() === DocumentApp.ElementType.PARAGRAPH) {
      const paragraph = child.asParagraph();
      // Checking for normal heading types, excluding titles and subtitles.
      const headingType = paragraph.getHeading();
      if ([
        DocumentApp.ParagraphHeading.HEADING1,
        DocumentApp.ParagraphHeading.HEADING2,
        DocumentApp.ParagraphHeading.HEADING3,
        DocumentApp.ParagraphHeading.HEADING4,
        DocumentApp.ParagraphHeading.HEADING5,
        DocumentApp.ParagraphHeading.HEADING6,
      ].includes(headingType)) {
        headings.push(paragraph);
      }
    }
  }
  return headings;
}

/**
 * Checks if a table element is a "Tabs" block.
 * @param {GoogleAppsScript.Document.Table} table The table element.
 * @return {Boolean}
 */
function isTabsBlock(table) {
  if (table.getNumRows() === 0 || table.getRow(0).getNumCells() === 0) {
    return false;
  }
  return table.getCell(0, 0).getText().trim().toLowerCase() === 'tabs';
}

/**
 * Validates the links within a single "Tabs" block table.
 * @param {GoogleAppsScript.Document.Table} table The "Tabs" block table.
 * @return {Object[]} An array of result objects.
 */
function validateTabsBlock(table) {
  const results = [];
  if (table.getNumRows() < 2) {
    results.push({
      status: 'Error',
      message: 'A "Tabs" block was found with no second row for tab controls.',
    });
    return results;
  }

  const tabControlsRow = table.getRow(1);
  const panelHeadings = [];
  for (let i = 2; i < table.getNumRows(); i++) {
    const row = table.getRow(i);
    for (let j = 0; j < row.getNumCells(); j++) {
      panelHeadings.push(...findHeadings(row.getCell(j)));
    }
  }

  const panelHeadingIds = new Set(panelHeadings.map(h => slugify(h.getText())));
  const tabLinks = [];
  const tabControlText = tabControlsRow.getCell(0).getChild(0).asText();
  for (let i = 0; i < tabControlText.getText().length; i++) {
    const url = tabControlText.getLinkUrl(i);
    if (url) {
      // Find the full text of the link
      let start = i;
      while (start > 0 && tabControlText.getLinkUrl(start - 1) === url) {
        start--;
      }
      let end = i;
      while (end < tabControlText.getText().length - 1 && tabControlText.getLinkUrl(end + 1) === url) {
        end++;
      }
      const text = tabControlText.getText().substring(start, end + 1);
      tabLinks.push({ url, text });
      i = end; // Move past this link
    }
  }

  if (tabLinks.length === 0) {
    results.push({
      status: 'Warning',
      message: 'A "Tabs" block was found, but the second row contains no links to act as tab controls.',
    });
    return results;
  }

  tabLinks.forEach((link) => {
    const anchor = (link.url || '').startsWith('#') ? link.url.substring(1) : null;
    if (!anchor) {
      results.push({
        status: 'Error',
        message: `The tab control "${link.text}" does not link to a valid anchor (e.g., #some-id).`,
      });
    } else if (!panelHeadingIds.has(anchor)) {
      results.push({
        status: 'Error',
        message: `The tab control "${link.text}" links to an anchor "#${anchor}" that does not match any heading inside the tab panels.`,
      });
    }
  });

  return results;
}

/**
 * The main function for the "Tabs" validation rule.
 * @param {GoogleAppsScript.Document.Document} doc The active Google Document.
 * @return {Object[]} A list of validation results.
 */
export function checkTabs(doc) {
  let results = [];
  const tables = doc.getBody().getTables();
  const tabsBlocks = tables.filter(isTabsBlock);

  if (tabsBlocks.length === 0) {
    return [];
  }

  tabsBlocks.forEach((block) => {
    results = results.concat(validateTabsBlock(block));
  });

  if (results.length === 0) {
    results.push({
      status: 'Success',
      message: 'All "Tabs" blocks have validly linked controls and panels.',
    });
  }

  return results;
} 