/**
 * @OnlyCurrentDoc
 *
 * The above comment directs Apps Script to limit the scope of file access for
 * this add-on. It specifies that the add-on will only have access to the
 * current document that the user has open. This is a crucial security measure
 * to protect user data and privacy.
 */

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
 * Creates the main add-on card with a button to trigger the check.
 * @param {Object} options
 * @param {String} options.text The text to display in the card.
 * @param {Object[]} [options.results] A list of results to display.
 * @return {CardService.Card}
 */
function createAccessibilityCard({ text, results = [] }) {
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
  return card.build();
}

/**
 * Main function to run all registered accessibility checks.
 * @return {CardService.Navigation} A navigation object to a new card.
 */
global.runAccessibilityCheck = () => {
  const doc = DocumentApp.getActiveDocument();
  let allResults = [];

  RULES.forEach((rule) => {
    try {
      const ruleResults = rule(doc);
      if (ruleResults && ruleResults.length > 0) {
        allResults = allResults.concat(ruleResults);
      }
    } catch (e) {
      allResults.push({ status: 'Error', message: `A critical error occurred while running a rule: ${e.message}` });
    }
  });

  const resultCard = createAccessibilityCard({
    text: allResults.length > 0 ? 'Accessibility check complete. See results below.' : 'Accessibility check complete! No issues found.',
    results: allResults,
  });

  return CardService.newNavigation().updateCard(resultCard);
};