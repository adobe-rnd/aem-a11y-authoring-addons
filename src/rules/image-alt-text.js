/**
 * @fileoverview Rule to check for missing alt text on images.
 */

/**
 * Finds all image elements within a given parent element.
 * @param {GoogleAppsScript.Document.Element} parentElement The element to search.
 * @return {GoogleAppsScript.Document.InlineImage[]} An array of image elements.
 */
function findImages(parentElement) {
  const images = [];
  if (!parentElement || typeof parentElement.getNumChildren !== 'function') {
    return images;
  }
  for (let i = 0; i < parentElement.getNumChildren(); i++) {
    const child = parentElement.getChild(i);
    if (child.getType() === DocumentApp.ElementType.PARAGRAPH) {
      const paragraph = child.asParagraph();
      for (let j = 0; j < paragraph.getNumChildren(); j++) {
        const grandChild = paragraph.getChild(j);
        if (grandChild.getType() === DocumentApp.ElementType.INLINE_IMAGE) {
          images.push(grandChild.asInlineImage());
        }
      }
    } else if (child.getType() === DocumentApp.ElementType.TABLE) {
      // Recursively check inside table cells
      const table = child.asTable();
      for (let r = 0; r < table.getNumRows(); r++) {
        for (let c = 0; c < table.getRow(r).getNumCells(); c++) {
          images.push(...findImages(table.getCell(r, c)));
        }
      }
    }
  }
  return images;
}

/**
 * The main function for the image alt text validation rule.
 * It checks every image in the document to ensure it has alt text.
 * @param {GoogleAppsScript.Document.Document} doc The active Google Document.
 * @return {Object[]} A list of validation results.
 */
export function checkImageAltText(doc) {
  const results = [];
  const allImages = findImages(doc.getBody());

  if (allImages.length === 0) {
    return []; // No images, no issues from this rule.
  }

  allImages.forEach((image, index) => {
    const altText = image.getAltDescription();
    // An alt text of "" is the standard for decorative images.
    // We flag null, undefined, or strings containing only whitespace.
    if (altText === null || altText === undefined || altText.trim() === '') {
      // Only check for empty string if it's not explicitly decorative
      if (altText !== '""') {
        results.push({
          status: 'Warning',
          message: `Image ${index + 1} appears to be missing a meaningful description. For decorative images, please set the alt text to "".`,
        });
      }
    }
  });

  if (results.length === 0) {
    results.push({
      status: 'Success',
      message: 'All images have alternative text.',
    });
  }

  return results;
} 