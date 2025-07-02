/**
 * @fileoverview Jest test for the image-alt-text rule.
 */

import { checkImageAltText } from '../../src/rules/image-alt-text.js';
import { MockDocumentApp, MockElementType, MockParagraphHeading, MockParagraph } from '../mocks/document-app.js';

// Mock the global DocumentApp object before each test
beforeAll(() => {
  global.DocumentApp = {
    ...MockDocumentApp,
    ParagraphHeading: MockParagraphHeading,
    ElementType: MockElementType,
  };
});

describe('Image Alt Text Validation Rule', () => {

  let mockDocument;

  beforeEach(() => {
    mockDocument = global.DocumentApp.createTestDocument();
  });

  test('should return success if all images have alt text', () => {
    // Arrange: Create a paragraph with an image that has alt text
    const body = mockDocument.getBody();
    const p = body.addParagraph('This is a paragraph with an image.');
    p.addImage('A cute dog smiling.');

    // Act: Run the validation rule
    const results = checkImageAltText(mockDocument);

    // Assert: Check for a success message
    expect(results).toHaveLength(1);
    expect(results[0].status).toBe('Success');
  });

  test('should return an error for an image missing alt text', () => {
    // Arrange: Create a paragraph with an image that has no alt text
    const body = mockDocument.getBody();
    const p = body.addParagraph('This image is missing alt text.');
    p.addImage(''); // Empty alt text

    // Act: Run the validation rule
    const results = checkImageAltText(mockDocument);

    // Assert: Check for the specific error message
    expect(results).toHaveLength(1);
    expect(results[0].status).toBe('Error');
    expect(results[0].message).toContain('Image 1 is missing alternative text');
  });
  
  test('should return success for an image explicitly marked as decorative', () => {
    // Arrange: Create an image with alt text set to ""
    const body = mockDocument.getBody();
    const p = body.addParagraph('This image is decorative.');
    p.addImage('""');

    // Act: Run the validation rule
    const results = checkImageAltText(mockDocument);

    // Assert: Check for a success message
    expect(results).toHaveLength(1);
    expect(results[0].status).toBe('Success');
  });

  test('should return an error for an image with only whitespace as alt text', () => {
    // Arrange: Create an image with only spaces in the alt text
    const body = mockDocument.getBody();
    const p = body.addParagraph('This image has only whitespace.');
    p.addImage('   '); // Whitespace alt text

    // Act: Run the validation rule
    const results = checkImageAltText(mockDocument);

    // Assert: Check for the specific error message
    expect(results).toHaveLength(1);
    expect(results[0].status).toBe('Warning');
    expect(results[0].message).toContain('Image 1 appears to be missing a meaningful description');
  });

  test('should return no results if there are no images', () => {
    // Arrange: Create a document with no images
    mockDocument.getBody().addParagraph('This is a paragraph with no images.');

    // Act: Run the validation rule
    const results = checkImageAltText(mockDocument);

    // Assert: Check that no results are returned
    expect(results).toHaveLength(0);
  });
  
  test('should find images inside tables', () => {
    // Arrange: Create a table containing an image with no alt text
    const body = mockDocument.getBody();
    const pWithImage = new MockParagraph('');
    pWithImage.addImage(''); // The image to be found
    
    body.addTable([
      ['Cell with text', pWithImage],
    ]);
    
    // Act: Run the validation rule
    const results = checkImageAltText(mockDocument);
    
    // Assert: Check for the specific error message
    expect(results).toHaveLength(1);
    expect(results[0].status).toBe('Error');
    expect(results[0].message).toContain('Image 1 is missing alternative text');
  });
}); 