/**
 * @fileoverview The central registry for all accessibility rules.
 *
 * To add a new rule, import its main function and add it to the `RULES` array.
 * Each rule function should accept an MDAST tree and return an array of
 * result objects, where each object has a `status` and a `message`.
 */

import { checkTabs } from './tabs-validation.js';
import { checkImageAltText } from './image-alt-text.js';

/**
 * A list of all registered accessibility rules to be run.
 */
export const RULES = [
  checkTabs,
  checkImageAltText,
  // Future rules will be added here.
]; 