/**
 * @fileoverview Jest test for the tabs-validation rule.
 */

import { checkTabs } from '../../src/rules/tabs-validation.js';
import { MockDocumentApp, MockParagraph, MockText, MockParagraphHeading, MockElementType } from '../mocks/document-app.js';

// Mock the global DocumentApp object before each test
beforeAll(() => {
  global.DocumentApp = {
    ...MockDocumentApp,
    ParagraphHeading: MockParagraphHeading,
    ElementType: MockElementType,
  };
});

describe('Tabs Validation Rule', () => {

  let mockDocument;

  beforeEach(() => {
    mockDocument = global.DocumentApp.createTestDocument();
  });

  test('should return success for a correctly structured Tabs block', () => {
    const body = mockDocument.getBody();
    
    const tabControlsText = new MockText('Tab One | Tab Two');
    tabControlsText.setLink(0, 6, '#tab-one-content');
    tabControlsText.setLink(10, 16, '#tab-two-content');

    body.addTable([
      ['Tabs'],
      [tabControlsText],
      [new MockParagraph('Tab One Content', MockParagraphHeading.HEADING1)],
      [new MockParagraph('Tab Two Content', MockParagraphHeading.HEADING2)],
    ]);

    const results = checkTabs(mockDocument);

    expect(results).toHaveLength(1);
    expect(results[0].status).toBe('Success');
  });

  test('should return an error for a Tabs block with a broken link', () => {
    const body = mockDocument.getBody();
    
    const tabControlsText = new MockText('Tab One | Broken Tab');
    tabControlsText.setLink(0, 6, '#tab-one-content');
    tabControlsText.setLink(10, 19, '#this-anchor-does-not-exist');

    body.addTable([
      ['Tabs'],
      [tabControlsText],
      [new MockParagraph('Tab One Content', MockParagraphHeading.HEADING1)],
    ]);

    const results = checkTabs(mockDocument);

    expect(results).toHaveLength(1);
    expect(results[0].status).toBe('Error');
    expect(results[0].message).toContain('links to an anchor "#this-anchor-does-not-exist"');
  });

  test('should return a warning if no links are found in the tab controls row', () => {
    mockDocument.getBody().addTable([
      ['Tabs'],
      ['This row has no links'],
      [new MockParagraph('Some Content', MockParagraphHeading.HEADING1)],
    ]);

    const results = checkTabs(mockDocument);

    expect(results).toHaveLength(1);
    expect(results[0].status).toBe('Warning');
    expect(results[0].message).toContain('contains no links');
  });
}); 