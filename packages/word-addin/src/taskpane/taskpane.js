/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

import { checkTabs } from "../rules/tabs-validation.js";
import * as mammoth from "mammoth";

/* global console, document, Office, Word */

Office.onReady((info) => {
  if (info.host === Office.HostType.Word) {
    document.getElementById("run").onclick = runAccessibilityCheck;

    // Set the theme
    setTheme();

    // Register an event handler for theme changes, if supported by the host.
    if (Office.context.officeTheme && Office.context.officeTheme.onThemeChanged) {
      Office.context.officeTheme.onThemeChanged(handleThemeChange);
    }
  }
});

/**
 * Handles the theme change event.
 * @param {Office.ThemeChangedEventArgs} args The event arguments.
 */
function handleThemeChange(args) {
  setTheme(args.theme);
}

/**
 * Sets the add-in's theme based on the Office theme.
 * @param {Office.OfficeTheme} [theme] The Office theme. If not provided, the current theme is used.
 */
function setTheme(theme) {
  const currentTheme = theme || Office.context.officeTheme;

  // A simple heuristic to determine if the theme is dark.
  // The background color is a hex string, e.g., "#ffffff".
  // We can check the brightness of the color.
  const backgroundColor = currentTheme.bodyBackgroundColor;
  const r = parseInt(backgroundColor.substr(1, 2), 16);
  const g = parseInt(backgroundColor.substr(3, 2), 16);
  const b = parseInt(backgroundColor.substr(5, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  if (brightness < 128) {
    document.body.classList.add("dark-mode");
  } else {
    document.body.classList.remove("dark-mode");
  }
}

/**
 * Runs all accessibility checks on the document.
 */
export async function runAccessibilityCheck() {
  const runButton = document.getElementById("run");
  const runButtonLabel = runButton.querySelector(".ms-Button-label");
  const originalButtonText = runButtonLabel.textContent;

  try {
    runButton.disabled = true;
    runButtonLabel.textContent = "Checking...";

    // First, ensure the Word application context is ready and synchronized.
    await Word.run(async (context) => {
      // This is a sacrificial call to ensure the context is ready.
      context.document.body.load("font");
      await context.sync();
    });

    console.log('Context synchronized. Now getting file...');

    // Now that the context is warm, get the document file.
    const fileBase64 = await getFileAsBase64();
    if (!fileBase64) {
      throw new Error('Could not retrieve document.');
    }

    // Decode the base64 string into a buffer-like array.
    const fileContent = Uint8Array.from(atob(fileBase64), c => c.charCodeAt(0));

    // Convert the document to HTML using mammoth.js
    const htmlResult = await mammoth.convertToHtml({ arrayBuffer: fileContent.buffer });
    
    // Run the rules against the HTML.
    const results = await checkTabs(htmlResult.value);
    
    displayResults(results);

  } catch (error) {
    console.error(error);
    // Handle the specific error that occurs on empty documents.
    if (error.message && error.message.includes('An internal error has occurred')) {
      displayResults([]); // Treat as "no issues found"
    } else {
      displayResults([{ status: 'Error', message: `A critical error occurred: ${error.message}` }]);
    }
  } finally {
    runButton.disabled = false;
    runButtonLabel.textContent = originalButtonText;
  }
}

/**
 * Gets the document from the Office host as a base64 encoded string by reading it in slices.
 * @returns {Promise<string>}
 */
function getFileAsBase64() {
  return new Promise((resolve, reject) => {
    Office.context.document.getFileAsync(Office.FileType.Compressed, { sliceSize: 65536 /* 64 KB */ }, (result) => {
      if (result.status === "failed" || result.status === Office.AsyncResultStatus.Failed) {
        reject(new Error(`Error getting file: ${result.error.message}`));
        return;
      }

      const myFile = result.value;
      const sliceCount = myFile.sliceCount;

      if (sliceCount <= 0) {
        myFile.closeAsync();
        resolve(""); // Resolve with empty string for empty file.
        return;
      }

      const slices = [];
      let slicesProcessed = 0;

      // Processes slices sequentially, one after another, to avoid overwhelming the host.
      const processSlice = (sliceIndex) => {
        myFile.getSliceAsync(sliceIndex, (sliceResult) => {
          if (sliceResult.status === "succeeded" || sliceResult.status === Office.AsyncResultStatus.Succeeded) {
            slices[sliceIndex] = sliceResult.value.data;
            slicesProcessed++;

            if (slicesProcessed === sliceCount) {
              // All slices are received, combine them and resolve the promise.
              myFile.closeAsync();

              const docdata = slices.reduce((acc, slice) => {
                const chunk = new Uint8Array(slice);
                const newAcc = new Uint8Array(acc.length + chunk.length);
                newAcc.set(acc, 0);
                newAcc.set(chunk, acc.length);
                return newAcc;
              }, new Uint8Array(0));

              let binary = "";
              for (let i = 0; i < docdata.length; i++) {
                binary += String.fromCharCode(docdata[i]);
              }
              resolve(btoa(binary));
            } else {
              // Request the next slice in the sequence.
              processSlice(sliceIndex + 1);
            }
          } else {
            myFile.closeAsync();
            reject(new Error(`Error getting slice ${sliceIndex}: ${sliceResult.error.message}`));
          }
        });
      };

      // Start the sequential process by requesting the first slice.
      processSlice(0);
    });
  });
}

/**
 * Displays the validation results in the task pane.
 * @param {Object[]} results An array of result objects.
 */
function displayResults(results) {
  const messageContainer = document.getElementById('run-message');
  if (!messageContainer) return;
  
  // Clear previous results
  while (messageContainer.firstChild) {
    messageContainer.removeChild(messageContainer.firstChild);
  }

  if (results.length === 0) {
    messageContainer.innerText = 'No issues found.';
    return;
  }
  
  const statusColors = {
    Error: '#FF0000',
    Warning: '#FFD700',
    Success: '#008000',
    Info: '#1E90FF',
  };

  results.forEach((result) => {
    const resultElement = document.createElement('p');
    const color = statusColors[result.status] || '#000000';
    resultElement.innerHTML = `<font color="${color}"><b>${result.status}:</b></font> ${result.message}`;
    messageContainer.appendChild(resultElement);
  });
}
