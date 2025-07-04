# AEM Accessibility Checker for Google Docs and Microsoft Word

This repository contains a suite of accessibility checkers designed to help content authors find and fix common accessibility issues directly within their authoring environments—Google Docs and Microsoft Word—before publishing content to Adobe Experience Manager (AEM).

By integrating accessibility checks into the editing workflow, this project aims to improve content compliance and ensure a better experience for all users.

## Packages

This project is a monorepo containing two separate packages:

-   [`packages/gdoc-addon`](./packages/gdoc-addon/README.md): A Google Docs add-on for checking accessibility within Google Docs.
-   [`packages/word-addin`](./packages/word-addin/README.md): A Microsoft Word add-in that provides an accessibility checking taskpane.

Please refer to the `README.md` file within each package for detailed instructions on setup, development, and deployment.

## Quick Start

To get started, clone the repository and install all dependencies from the root directory.

```bash
git clone https://github.com/adobe-rnd/aem-a11y-gdoc-addon.git
cd aem-a11y-gdoc-addon
npm install
```

After installation, follow the specific instructions in the README file for the package you wish to work on.