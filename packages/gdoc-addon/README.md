# AEM Accessibility Checker for Google Docs

A Google Docs add-on to check for common accessibility issues before content is published to AEM (Adobe Experience Manager). This tool helps authors identify and fix problems directly in their editing environment, ensuring a more accessible and compliant final product.

## Features

This add-on currently checks for the following accessibility rules:

-   **Image Alt Text**: Verifies that all images have alternative text.
    -   `Error`: Triggered if an image is missing the alt text description entirely.
    -   `Warning`: Triggered if the alt text contains only whitespace, as this is often a placeholder and not a meaningful description.
-   **Tabs Component Validation**: Checks the structure of the AEM "Tabs" block component.
    -   Verifies that the second row of the block contains valid links that point to corresponding anchor headings within the document.
    -   Flags broken anchor links.
    -   Warns if no links are found in the tab controls row.

## Deployment

This project uses the [Google Apps Script Command Line Interface (clasp)](https://github.com/google/clasp) for managing deployments.

### Prerequisites

1.  **Node.js and npm**: Ensure you have Node.js and npm installed. You can download them from [nodejs.org](https://nodejs.org/).
2.  **Enable the Google Apps Script API**:
    -   Go to the [Google Apps Script API page](https://script.google.com/home/usersettings).
    -   Enable the "Google Apps Script API".

### Step 1: Installation

From the root of the repository, install all dependencies:

```bash
npm install
```

### Step 2: Log in to Clasp

Authorize `clasp` to manage your Google Scripts projects. This will open a browser window for you to log in to your Google account. This command should be run from the `packages/gdoc-addon` directory.

```bash
cd packages/gdoc-addon
npm run login
```

### Step 3: Create a New Project

1.  Open a new Google Doc that you will use for testing.
2.  In the menu, go to `Extensions > Apps Script`. This will create a new, empty Apps Script project bound to your document.
3.  In the Apps Script editor, go to `Project Settings` (the gear icon on the left).
4.  Copy the **Script ID**.
5.  Create a `.clasp.json` file in `packages/gdoc-addon` and add the copied Script ID:

    ```json
    {
      "scriptId": "YOUR_SCRIPT_ID_HERE"
    }
    ```

### Step 4: Build and Deploy

Run the deploy command from the `packages/gdoc-addon` directory. This will build the project using webpack and push all the local files to your Apps Script project on Google's servers.

```bash
npm run deploy
```

The `--force` flag in the script overwrites all files in the Apps Script project with your local versions.

## Usage

After deploying the script, refresh your Google Doc. You should now see a new menu item: **Accessibility Checker > Run Checks**.

Clicking "Run Checks" will open a sidebar and display a list of any accessibility issues found in the document. 