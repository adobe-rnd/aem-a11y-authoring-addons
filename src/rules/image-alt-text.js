/**
 * @fileoverview Rule to check for missing alt text on images.
 */

/**
 * Recursively finds all image elements within a given parent element.
 * @param {GoogleAppsScript.Document.Element} element The element to search.
 * @return {GoogleAppsScript.Document.InlineImage[]} An array of image elements.
 */
function findImages(element) {
  let images = [];
  if (!element) {
    return images;
  }

  // If the element is an image, add it to the list.
  if (element.getType && element.getType() === DocumentApp.ElementType.INLINE_IMAGE) {
    images.push(element.asInlineImage());
  }

  // If the element is a container, recursively search its children.
  if (typeof element.getNumChildren === 'function') {
    for (let i = 0; i < element.getNumChildren(); i++) {
      images = images.concat(findImages(element.getChild(i)));
    }
  }

  return images;
}

/**
 * The main function for the image alt text validation rule.
 * It finds all images in the document and checks for alt text.
 * @param {GoogleAppsScript.Document.Document} doc The Google Document to check.
 * @return {Object[]} An array of result objects.
 */
export function checkImageAltText(doc) {
  const results = [];
  const body = doc.getBody();
  let allImages = [];

  // findImages expects an element, so we iterate through the body's children.
  for (let i = 0; i < body.getNumChildren(); i++) {
    allImages = allImages.concat(findImages(body.getChild(i)));
  }

  if (allImages.length === 0) {
    return [];
  }

  allImages.forEach((image, index) => {
    const altText = image.getAltDescription();
    const imagePosition = index + 1;

    if (!altText) {
      results.push({
        status: 'Error',
        message: `Image ${imagePosition} is missing alternative text. For decorative images, please set the alt text to "".`,
        element: image,
      });
    } else if (altText.trim() === '') {
      results.push({
        status: 'Warning',
        message: `Image ${imagePosition} appears to be missing a meaningful description. For decorative images, please set the alt text to "".`,
        element: image,
      });
    }
  });

  if (results.length === 0) {
    return [{ status: 'Success', message: 'All images have alternative text.' }];
  }

  return results;
} 