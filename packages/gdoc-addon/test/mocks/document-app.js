/**
 * @fileoverview Mock implementation of the Google Apps Script DocumentApp service.
 * This allows us to test rule logic locally without needing a live Google Doc.
 */

// --- Enums ---

export const MockElementType = {
  PARAGRAPH: 'PARAGRAPH',
  TABLE: 'TABLE',
  TEXT: 'TEXT',
  INLINE_IMAGE: 'INLINE_IMAGE',
};

export const MockParagraphHeading = {
  HEADING1: 'HEADING1',
  HEADING2: 'HEADING2',
  HEADING3: 'HEADING3',
  HEADING4: 'HEADING4',
  HEADING5: 'HEADING5',
  HEADING6: 'HEADING6',
  NORMAL: 'NORMAL',
};

// --- Mock Classes ---

class MockElement {
  constructor(type) {
    this.type = type;
    this.children = [];
  }
  getType() {
    return this.type;
  }
  getNumChildren() {
    return this.children.length;
  }
  getChild(childIndex) {
    return this.children[childIndex];
  }
  asText() {
    return this; // For chaining
  }
  asInlineImage() {
    return this; // For chaining
  }
}

export class MockText extends MockElement {
  constructor(text) {
    super(MockElementType.TEXT);
    this.text = text;
    this.links = {}; // Simulates link URLs at character indices
  }
  getText() {
    return this.text;
  }
  getLinkUrl(offset) {
    return this.links[offset] || null;
  }
  // Test helper to set a link on a substring
  setLink(start, end, url) {
    for (let i = start; i <= end; i++) {
      this.links[i] = url;
    }
  }
}

export class MockInlineImage extends MockElement {
  constructor() {
    super(MockElementType.INLINE_IMAGE);
    this.altDescription = '';
  }
  getAltDescription() {
    return this.altDescription;
  }
  setAltDescription(desc) {
    this.altDescription = desc;
  }
}

export class MockParagraph extends MockElement {
  constructor(text, headingType = MockParagraphHeading.NORMAL) {
    super(MockElementType.PARAGRAPH);
    this.heading = headingType;
    this.children.push(new MockText(text));
  }
  // Test helper to add an image
  addImage(altText) {
    const image = new MockInlineImage();
    image.setAltDescription(altText);
    this.children.push(image);
    return image;
  }
  asParagraph() {
    return this;
  }
  getHeading() {
    return this.heading;
  }
  getText() {
    return this.children.map(c => c.getText()).join('');
  }
}

class MockCell extends MockElement {
  constructor(content) {
    super('CELL'); // Not a real type, but useful for structure
    if (typeof content === 'string') {
      this.children.push(new MockParagraph(content));
    } else if (content instanceof MockElement) {
      this.children.push(content);
    }
  }
  getText() {
    return this.children.map(c => c.getText()).join('');
  }
}

class MockRow extends MockElement {
  constructor(cells) {
    super('ROW'); // Not a real type
    this.children = cells.map(c => new MockCell(c));
  }
  getNumCells() {
    return this.children.length;
  }
  getCell(cellIndex) {
    return this.children[cellIndex];
  }
}

class MockTable extends MockElement {
  constructor(rows) {
    super(MockElementType.TABLE);
    this.children = rows.map(r => new MockRow(r));
  }
  getNumRows() {
    return this.children.length;
  }
  getRow(rowIndex) {
    return this.children[rowIndex];
  }
  getCell(rowIndex, cellIndex) {
    return this.getRow(rowIndex).getCell(cellIndex);
  }
}

class MockBody {
  constructor() {
    this.children = [];
  }
  getTables() {
    return this.children.filter(c => c.getType() === MockElementType.TABLE);
  }
  getNumChildren() {
    return this.children.length;
  }
  getChild(childIndex) {
    return this.children[childIndex];
  }
  // Test helper to add elements
  addTable(rows) {
    const table = new MockTable(rows);
    this.children.push(table);
    return table;
  }
  addParagraph(text) {
    const p = new MockParagraph(text);
    this.children.push(p);
    return p;
  }
}

class MockDocument {
  constructor() {
    this.body = new MockBody();
  }
  getBody() {
    return this.body;
  }
}

export const MockDocumentApp = {
  createTestDocument: () => new MockDocument(),
}; 