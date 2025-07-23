/**
 * @fileoverview Rule to check for missing alt text on images.
 * @param {Document} doc The HTML content converted from the document.
 * @return {Promise<Object[]>} An array of validation results.
 */
export async function checkImageAltText(doc) {
  const results = [];
  if (!doc) {
    return results;
  }

  const images = doc.querySelectorAll('img');
  if (images.length === 0) {
    return [];
  }

  images.forEach((image, index) => {
    const altText = image.getAttribute('alt');
    const imagePosition = index + 1;

    if (altText === null) {
      results.push({
        status: 'Error',
        message: `Image ${imagePosition} is missing alternative text.`,
      });
    } else if (altText.trim() === '') {
      results.push({
        status: 'Warning',
        message: `Image ${imagePosition} has empty alternative text. If the image is decorative, this is acceptable. Otherwise, please provide a meaningful description.`,
      });
    }
  });

  if (results.length === 0 && images.length > 0) {
    return [{ status: 'Success', message: 'All images have alternative text.' }];
  }

  return results;
} 