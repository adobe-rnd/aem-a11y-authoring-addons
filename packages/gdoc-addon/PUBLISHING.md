# Publishing to the Google Workspace Marketplace

This guide outlines the steps required to take this private add-on and publish it publicly for anyone to install from the Google Workspace Marketplace.

The process involves configuring the add-on in the Google Cloud Platform (GCP) and submitting it for verification.

## Step 1: Associate with a Google Cloud Platform (GCP) Project

To publish an add-on, it must be linked to a standard GCP project that you control, rather than the default, hidden project Apps Script uses.

1.  **Create or Select a GCP Project**: If you don't already have one, create a new project in the [Google Cloud Console](https://console.cloud.google.com/).
2.  **Switch the Script's Project**:
    *   Open the Apps Script editor for this add-on.
    *   Navigate to **Project Settings** (the gear icon ⚙️ on the left).
    *   Under the "Google Cloud Platform (GCP) Project" section, click **Change project**.
    *   Enter your GCP project number (or ID) and click **Set project**.

## Step 2: Configure the OAuth Consent Screen

The consent screen is what users see when authorizing the add-on. A well-configured screen is essential for user trust.

1.  In the [Google Cloud Console](https://console.cloud.google.com/), go to **APIs & Services > OAuth consent screen**.
2.  **Set User Type**: Choose **External**. This allows any Google user to install the add-on, not just users within your organization.
3.  **Fill out App Information**:
    *   **App name**: `AEM Accessibility Checker`
    *   **User support email**: Provide an email address for user support inquiries.
    *   **App logo**: Add the public URL to the add-on's logo. The one from `appsscript.json` is suitable: `https://icons.iconarchive.com/icons/alecive/flatwoken/128/Apps-Accessibility-icon.png`
4.  **Provide App Domain Links**:
    *   **Application home page**: A landing page for your add-on. For this project, the GitHub repository URL is a good option.
    *   **Application privacy policy URL**: **(Required)**. You must link to a page detailing your data handling practices. A simple privacy policy hosted on GitHub Pages is sufficient for an add-on that doesn't store user data.
    *   **Application terms of service URL**: **(Required)**. Similar to the privacy policy, this is a required link for public applications.
5.  **Add Scopes**:
    *   Click "Add or Remove Scopes".
    *   Ensure all scopes listed in `appsscript.json` are present here. The platform will usually detect them automatically upon deployment, but it's best to verify.
6.  **Add Test Users (Optional)**: While the app is in "testing" mode (before verification), you can add specific Google accounts that are authorized to use it.

## Step 3: Configure the Google Workspace Marketplace SDK

This SDK manages your public store listing—the text, images, and configuration that users see.

1.  In the GCP Console, go to the API Library and **enable the "Google Workspace Marketplace SDK"**.
2.  Navigate to the SDK's configuration page (you can search for it in the console's top search bar).
3.  **App Configuration**:
    *   Fill out the app name, short description, and a detailed description.
    *   Choose an appropriate category (e.g., "Productivity").
    *   Under **App Integration**, select **Google Workspace add-on**.
    *   In the **Add-on extension** section that appears, check the box for **Docs**.
4.  **Graphics**:
    *   Upload the required promotional graphics. This is crucial for attracting users.
    *   **Banner**: A `480x270` banner image.
    *   **Screenshots**: At least three `1280x800` screenshots that clearly show your add-on in use.

## Step 4: Submit for Verification and Publish

Because the add-on reads document content, it uses "sensitive" scopes and must be verified by Google's Trust & Safety team.

1.  **Prepare for Verification**: Once the consent screen and marketplace listing are fully configured, you can submit the app for verification from the OAuth consent screen page.
2.  **Provide Justification**: You will likely need to:
    *   Provide clear justifications for why your add-on needs each sensitive scope.
    *   **Record a video** demonstrating the complete user experience. This video must show:
        *   The user login flow.
        *   The OAuth consent screen (clearly showing the app name).
        *   A walkthrough of how the add-on uses the requested permissions to provide its features (e.g., show it reading the doc and displaying accessibility results).
3.  **Wait for Approval**: The verification process can take several days to a few weeks. Monitor your email for any communication from the Google review team.
4.  **Publish**: After your app is verified, return to the **Google Workspace Marketplace SDK** page and click **Publish**. Your listing will go through a final, brief review and then become publicly available on the Marketplace. 