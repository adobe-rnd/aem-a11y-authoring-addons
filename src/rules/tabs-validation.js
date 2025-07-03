/**
 * @fileoverview Rule to validate the structure of "Tabs" blocks using DocumentApp.
 */

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
 * Validates a "Tabs" block by ensuring the number of tab links matches the number of panels.
 * @param {GoogleAppsScript.Document.Table} table The "Tabs" block table.
 * @return {Object[]} An array of result objects for this block.
 */
function validateTabsBlock(table) {
  const results = [];

  // A valid tabs block needs at least a header row, a control row, and one panel row.
  if (table.getNumRows() < 3) {
    // This case is handled by the count mismatch check below, but we can exit early.
    // Let's check for links first to give a more specific message.
  }

  const tabControlsCell = table.getRow(1).getCell(0);
  if (!tabControlsCell || tabControlsCell.getNumChildren() === 0) {
    // Not a valid tabs block, but we won't flag it since there are no controls to be wrong.
    return results;
  }

  // 1. Find all unique links in the tab controls cell (row 2).
  const tabLinks = [];
  for (let c = 0; c < tabControlsCell.getNumChildren(); c += 1) {
    const child = tabControlsCell.getChild(c);
    let textElement;

    if (child.getType() === DocumentApp.ElementType.PARAGRAPH) {
      textElement = child.asParagraph().editAsText();
    } else if (child.getType() === DocumentApp.ElementType.LIST_ITEM) {
      textElement = child.asListItem().editAsText();
    }

    if (textElement && typeof textElement.getLinkUrl === 'function') {
      const textLength = textElement.getText().length;
      for (let i = 0; i < textLength; i += 1) {
        const url = textElement.getLinkUrl(i);
        if (url) {
          if (!tabLinks.some(l => l.url === url)) {
            // We only need the URL for counting unique links.
            tabLinks.push({ url });
          }
          // Skip to the end of this link to avoid re-counting.
          let end = i;
          while (end + 1 < textLength && textElement.getLinkUrl(end + 1) === url) {
            end += 1;
          }
          i = end;
        }
      }
    }
  }

  // Rule 1: Make sure there are links in the second row.
  if (tabLinks.length === 0) {
    results.push({
      status: 'Warning',
      message: 'A "Tabs" block was found, but the second row contains no links to act as tab controls.',
    });
    return results;
  }

  // Rule 2: Make sure the number of links matches the number of panel rows.
  const linkCount = tabLinks.length;
  const panelCount = table.getNumRows() - 2; // Subtract header and control rows.

  if (linkCount !== panelCount) {
    results.push({
      status: 'Error',
      message: `The number of tab controls (${linkCount}) does not match the number of tab panels (${panelCount}).`,
    });
  }

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

  if (results.length === 0 && tabsBlocks.length > 0) {
    results.push({
      status: 'Success',
      message: 'All "Tabs" blocks have validly linked controls and panels.',
    });
  }

  return results;
} 