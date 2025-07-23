/**
 * Validates "Tabs" components within the document's HTML representation.
 * @param {Document} doc The HTML content converted from the document.
 * @returns {Promise<Object[]>} A list of validation results.
 */
export async function checkTabs(doc) {
  const results = [];
  if (!doc) {
    return results;
  }

  const tables = doc.querySelectorAll('table');
  let tabsBlocksFound = 0;

  tables.forEach((table) => {
    // Check if the first cell of the first row contains the text "Tabs"
    const firstCell = table.querySelector('tr:first-child td:first-child');
    if (!firstCell || firstCell.textContent.trim().toLowerCase() !== 'tabs') {
      return; // Not a tabs block, so we skip it.
    }

    tabsBlocksFound += 1;

    const rows = Array.from(table.querySelectorAll('tr'));
    if (rows.length < 2) {
      return; // Not enough rows to be a valid tabs block
    }

    // Find all unique links in the second row.
    const controlRow = rows[1];
    const links = Array.from(controlRow.querySelectorAll('a'));
    const uniqueLinks = links.filter((link, index, self) =>
      index === self.findIndex(l => l.href === link.href)
    );

    // Rule 1: Make sure there are links in the second row.
    if (uniqueLinks.length === 0) {
      results.push({
        status: 'Warning',
        message: 'A "Tabs" block was found, but the second row contains no links to act as tab controls.',
      });
      return; // Stop checking this block
    }

    // Rule 2: Make sure the number of links matches the number of panel rows.
    const linkCount = uniqueLinks.length;
    const panelCount = rows.length - 2; // Subtract header and control rows.

    if (linkCount !== panelCount) {
      results.push({
        status: 'Error',
        message: `The number of tab controls (${linkCount}) does not match the number of tab panels (${panelCount}).`,
      });
    }
  });

  if (results.length === 0 && tabsBlocksFound > 0) {
    results.push({
      status: 'Success',
      message: 'All "Tabs" blocks have validly linked controls and panels.',
    });
  }

  return results;
} 