/**
 * @typedef {import('hast').Element} HastElement
 * @typedef {import('hast').Root} HastRoot
 * @typedef {import('hast').Text} HastText
 */

/**
 * Converts a Google Docs document in JSON format to a HAST tree.
 *
 * @param {Object} doc - The Google Docs document object.
 * @return {HastRoot} The HAST tree.
 */
export function gdocToHast(doc) {
  const { body } = doc;
  if (!body || !body.content) {
    return { type: 'root', children: [] };
  }

  const children = body.content.map(structuralElementToHast).flat();

  return {
    type: 'root',
    children,
  };
}

/**
 * Converts a StructuralElement to a HAST element.
 *
 * @param {Object} element - The StructuralElement.
 * @return {HastElement[]} An array of HAST elements.
 */
function structuralElementToHast(element) {
  if (element.paragraph) {
    return [paragraphToHast(element.paragraph)];
  }
  if (element.table) {
    return [tableToHast(element.table)];
  }
  // TODO: Add support for other structural elements.
  return [];
}

/**
 * Converts a Paragraph to a HAST element.
 *
 * @param {Object} paragraph - The Paragraph object.
 * @return {HastElement} The HAST element.
 */
function paragraphToHast(paragraph) {
  const { paragraphStyle, elements } = paragraph;
  let tagName = 'p';

  if (paragraphStyle && paragraphStyle.namedStyleType) {
    const styleType = paragraphStyle.namedStyleType;
    if (styleType.startsWith('HEADING_')) {
      tagName = `h${styleType.substring(8)}`;
    }
  }

  const children = elements.map(paragraphElementToHast).flat();

  const properties = {};
  if (paragraphStyle && paragraphStyle.headingId) {
    properties.id = paragraphStyle.headingId;
  }

  return {
    type: 'element',
    tagName,
    properties,
    children,
  };
}

/**
 * Converts a Table to a HAST element.
 *
 * @param {Object} table - The Table object.
 * @return {HastElement} The HAST element.
 */
function tableToHast(table) {
  const rows = table.tableRows.map((row) => {
    const cells = row.tableCells.map((cell) => {
      const children = cell.content.map(structuralElementToHast).flat();
      return { type: 'element', tagName: 'td', properties: {}, children };
    });
    return { type: 'element', tagName: 'tr', properties: {}, children: cells };
  });

  const tbody = { type: 'element', tagName: 'tbody', properties: {}, children: rows };
  return { type: 'element', tagName: 'table', properties: {}, children: [tbody] };
}

/**
 * Converts a ParagraphElement to a HAST element.
 *
 * @param {Object} element - The ParagraphElement object.
 * @return {(HastElement | import('hast').Text)[]} An array of HAST elements or text nodes.
 */
function paragraphElementToHast(element) {
  if (element.textRun) {
    return textRunToHast(element.textRun);
  }
  if (element.inlineObjectElement) {
    return [inlineObjectToHast(element.inlineObjectElement)];
  }
  // TODO: Handle other paragraph elements like horizontal rules.
  return [];
}

/**
 * Converts an InlineObjectElement to a HAST element.
 *
 * @param {Object} inlineObject - The InlineObjectElement.
 * @return {HastElement|null} The HAST element or null.
 */
function inlineObjectToHast(inlineObject) {
  const { inlineObjectId, textStyle } = inlineObject;
  if (!inlineObjectId) {
    return null;
  }
  // This requires the full document JSON to look up the object.
  // This function assumes `doc` is available in a wider scope or passed down.
  // For now, this part is a placeholder for full image support.
  // A robust implementation would need access to the `doc.inlineObjects` map.
  // Returning a placeholder for now.
  return {
    type: 'element',
    tagName: 'img',
    properties: { src: '', alt: 'Image placeholder' },
    children: [],
  };
}

/**
 * Converts a TextRun to an array of HAST elements or text nodes.
 * A single TextRun can be split into multiple nodes (e.g., bold, italic).
 *
 * @param {Object} textRun - The TextRun object.
 * @return {(HastElement | import('hast').Text)[]} An array of HAST elements or text nodes.
 */
function textRunToHast(textRun) {
  const { content, textStyle } = textRun;

  if (!content || content === '\n') {
    return [];
  }

  /** @type {import('hast').Text | HastElement} */
  let node = { type: 'text', value: content };

  if (textStyle) {
    if (textStyle.bold) {
      node = { type: 'element', tagName: 'strong', properties: {}, children: [node] };
    }
    if (textStyle.italic) {
      node = { type: 'element', tagName: 'em', properties: {}, children: [node] };
    }
    if (textStyle.underline) {
      node = { type: 'element', tagName: 'u', properties: {}, children: [node] };
    }
    if (textStyle.link) {
      node = {
        type: 'element',
        tagName: 'a',
        properties: { href: textStyle.link.url },
        children: [node],
      };
    }
  }

  return [node];
} 