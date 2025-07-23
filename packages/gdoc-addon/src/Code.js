/**
 * @OnlyCurrentDoc
 *
 * The above comment directs Apps Script to limit the scope of file access for
 * this add-on. It specifies that the add-on will only have access to the
 * current document that the user has open. This is a crucial security measure
 * to protect user data and privacy.
 */

import { toHast } from '@googleworkspace/google-docs-hast';
import { toHtml } from 'hast-util-to-html';
import { DOMParser } from 'linkedom';
import { RULES } from './rules/index.js';

/**
 * Creates the main add-on card.
 * @param {Object} e The event object.
 * @return {CardService.Card} The homepage card.
 */
global.onHomepage = (e) => {
  return createAccessibilityCard({
    text: 'Click the button to check for accessibility issues in your document.',
  });
};

/**
 * The trigger function that runs when file-scope authorization is granted.
 * @param {Object} e The event object.
 * @return {CardService.Card}
 */
global.onFileScopeGranted = (e) => {
  return createAccessibilityCard({
    text: 'Thank you for granting access. You can now check the document.',
  });
};

/**
 * Creates the main add-on card with a button to trigger the trigger the check.
 * @param {Object} options
 * @param {String} options.text The text to display in the card.
 * @param {Object[]} [options.results] A list of results to display.
 * @return {CardService.Card}
 */
function createAccessibilityCard({ text, results = [], debugHtml = '' }) {
  const card = CardService.newCardBuilder();
  card.setHeader(CardService.newCardHeader().setTitle('AEM Accessibility Checker'));

  const section = CardService.newCardSection();
  section.addWidget(CardService.newTextParagraph().setText(text));

  if (results.length > 0) {
    const statusColors = {
      Error: '#FF0000', // Red
      Warning: '#FFD700', // Gold
      Success: '#008000', // Green
      Info: '#1E90FF', // DodgerBlue
    };

    results.forEach((result) => {
      const color = statusColors[result.status] || '#000000'; // Default to black
      const resultText = `<font color="${color}"><b>${result.status}:</b></font> ${result.message}`;
      section.addWidget(CardService.newTextParagraph().setText(resultText));
    });
  }

  const button = CardService.newTextButton()
    .setText('Re-run Checks')
    .setOnClickAction(CardService.newAction().setFunctionName('runAccessibilityCheck'));
  section.addWidget(button);

  card.addSection(section);

  if (debugHtml) {
    const debugSection = CardService.newCardSection()
      .setHeader('Debug Info: Generated DOM')
      .setCollapsible(true);

    const escapedHtml = escapeHtml(debugHtml);
    const debugText = `<pre><code>${escapedHtml}</code></pre>`;
    debugSection.addWidget(CardService.newTextParagraph().setText(debugText));
    card.addSection(debugSection);
  }

  return card.build();
}

/**
 * Main function to run all registered accessibility checks.
 * @return {CardService.Navigation} A navigation object to a new card.
 */
global.runAccessibilityCheck = async () => {
  const documentId = DocumentApp.getActiveDocument().getId();

  // Fetch the full Google Doc as JSON using the Docs API (Advanced Service).
  // Note: The Google Docs API must be enabled for this script.
  const docJson = Docs.Documents.get(documentId);

  // Convert the Google Doc to a HAST tree.
  const hast = await toHast(docJson);

  // Convert the HAST tree to an HTML string.
  const html = toHtml(hast);

  // Parse the HTML string into a DOM tree.
  const dom = new DOMParser().parseFromString(html, 'text/html');

  let allResults = [];

  for (const rule of RULES) {
    try {
      const ruleResults = await rule(dom);
      if (ruleResults && ruleResults.length > 0) {
        allResults = allResults.concat(ruleResults);
      }
    } catch (e) {
      allResults.push({ status: 'Error', message: `A critical error occurred while running a rule: ${e.message}` });
    }
  }

  const resultCard = createAccessibilityCard({
    text: allResults.length > 0 ? 'Accessibility check complete. See results below.' : 'Accessibility check complete! No issues found.',
    results: allResults,
    debugHtml: html,
  });

  return CardService.newNavigation().updateCard(resultCard);
};

/**
 * Escapes HTML entities in a string.
 * @param {string} unsafe The string to escape.
 * @return {string} The escaped string.
 */
function escapeHtml(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}