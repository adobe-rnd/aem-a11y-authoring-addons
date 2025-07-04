/**
 * @fileoverview Jest setup file. This file is executed before all tests.
 *
 * This file is used to set up the global environment to simulate the
 * Google Apps Script environment.
 */

import { MockDocumentApp, MockParagraphHeading } from './mocks/document-app.js';

// Mock the global DocumentApp object
global.DocumentApp = new MockDocumentApp();
global.DocumentApp.ParagraphHeading = MockParagraphHeading; 