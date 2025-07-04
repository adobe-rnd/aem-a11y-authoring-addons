# AEM Accessibility Checker for Microsoft Word

A Word add-in to check for common accessibility issues before content is published to AEM (Adobe Experience Manager). This tool helps authors identify and fix problems directly in their editing environment.

## Features

This add-in provides a taskpane within Word to check for accessibility rules tailored for AEM components.

## Development

### Prerequisites

-   **Node.js and npm**: Ensure you have Node.js and npm installed.
-   **Microsoft Word**: The desktop client for Windows or macOS.
-   **AEM Environment** (Optional): For testing content integration.

### Step 1: Installation

From the root of the repository, install all dependencies:

```bash
npm install
```

### Step 2: Trust Development Certificates

To run the add-in in a local development environment, you must trust the development certificates. This allows Office to load your add-in from `localhost` over HTTPS.

Run the following command from the `packages/word-addin` directory:

```bash
npx office-addin-dev-certs install
```

### Step 3: Run the Development Server

Start the local development server, which will also launch Microsoft Word and sideload the add-in for you. Run this command from the `packages/word-addin` directory:

```bash
npm start
```

If Word does not open automatically, you can manually sideload the add-in by following the instructions for your platform. The manifest file to use is `manifest.xml`.

### Usage

Once the add-in is running, you can access it from the **Home** tab in the Word ribbon. Click the **AEM Accessibility Checker** button to open the taskpane.

The taskpane will display a list of accessibility issues found in the document.

### Building for Production

To create a production-ready build, run the following command from the `packages/word-addin` directory:

```bash
npm run build:prod
```

This will generate optimized and minified files in the `dist/` directory, ready for deployment to a web server.

## Publishing

For instructions on how to package and publish the add-in to Microsoft AppSource, please see [PUBLISHING.md](./PUBLISHING.md). 