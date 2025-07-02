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
 * @return {Object[]} An array of result objects for this block.
 */
function validateTabsBlock(table) {
  const results = [];
  const tabControlsRow = table.getRow(1);
  const tabContentRows = table.getNumRows() > 2;

  // 1. Check if the tab controls row has any links
  const tabControlText = tabControlsRow.getCell(0).getChild(0).asText();
  let hasLinks = false;
  if (tabControlText && typeof tabControlText.getLinkUrl === 'function') {
    for (let i = 0; i < tabControlText.getText().length; i++) {
      if (tabControlText.getLinkUrl(i)) {
        hasLinks = true;
        break;
      }
    }
  }

  if (!hasLinks) {
    results.push({
      status: 'Warning',
      message: 'A "Tabs" block was found, but the second row contains no links to act as tab controls.',
    });
    return results;
  }

  const panelHeadings = [];
  for (let i = 2; i < table.getNumRows(); i++) {
    const row = table.getRow(i);
    for (let j = 0; j < row.getNumCells(); j++) {
      panelHeadings.push.apply(panelHeadings, findHeadings(row.getCell(j)));
    }
  }

  const panelHeadingIds = new Set(panelHeadings.map(h => slugify(h.getText())));
  const tabLinks = [];
  if (tabControlText && typeof tabControlText.getLinkUrl === 'function') {
    for (let i = 0; i < tabControlText.getText().length; i++) {
      const url = tabControlText.getLinkUrl(i);
      if (url) {
        // Find the full text of the link
        let start = i;
        let end = i;
        while (tabControlText.getLinkUrl(start - 1) === url) {
          start--;
        }
        while (tabControlText.getLinkUrl(end + 1) === url) {
          end++;
        }
        const text = tabControlText.getText().substring(start, end + 1);
        tabLinks.push({ url, text });
        i = end; // Skip to the end of this link
      }
    }
  }

  const uniqueLinks = Array.from(new Set(tabLinks.map(l => l.url)));

  uniqueLinks.forEach((linkUrl) => {
    if (!panelHeadingIds.has(linkUrl.substring(1))) {
      results.push({
        status: 'Error',
        message: `The tab control "${tabLinks.find(l => l.url === linkUrl).text}" links to an anchor "#${linkUrl.substring(1)}" that does not match any heading inside the tab panels.`,
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