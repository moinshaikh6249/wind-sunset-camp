
# Admin Setup Instructions

To gain admin access to the application, you need to set a custom claim on your user account in Firebase and add your UID to the admins list in the Realtime Database. This is a one-time setup.

There are two primary ways to do this:

## Method 1: Using the Firebase Admin SDK in a Script (Recommended)

This is the most common and complete method. You will need Node.js installed on your machine.

1.  **Create a User Account**: First, make sure you have signed up for a regular user account in the application with the email you want to be admin.

2.  **Get Your User UID**:
    *   Go to the [Firebase Console](https://console.firebase.google.com/).
    *   Select your project.
    *   Navigate to **Authentication** -> **Users** tab.
    *   Find your user account and copy the **User UID**.

3.  **Set up the Admin Script**:
    *   Create a new folder on your computer (e.g., `admin-scripts`).
    *   Inside that folder, create two files: `package.json` and `set-admin.js`.

4.  **`package.json` file**:
    ```json
    {
      "name": "admin-scripts",
      "version": "1.0.0",
      "main": "set-admin.js",
      "type": "module",
      "dependencies": {
        "firebase-admin": "^12.0.0"
      }
    }
    ```

5.  **`set-admin.js` file**:
    *   **IMPORTANT**: Replace `'<YOUR_USER_UID>'` with the UID you copied in step 2.
    *   **IMPORTANT**: You need to provide your service account credentials. See step 6.

    ```javascript
    import admin from 'firebase-admin';
    import { readFile } from 'fs/promises';

    // --- CONFIGURATION ---
    const serviceAccount = JSON.parse(
      await readFile(
        new URL('./serviceAccountKey.json', import.meta.url)
      )
    );
    const userUid = '<YOUR_USER_UID>'; // <-- ‼️ PASTE YOUR USER UID HERE
    // ---------------------


    // Initialize Firebase Admin SDK
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://<YOUR_PROJECT_ID>.firebaseio.com` // <-- ‼️ ADD YOUR DATABASE URL
    });

    async function setAdmin() {
      try {
        // Set admin custom claim
        await admin.auth().setCustomUserClaims(userUid, { isAdmin: true });
        console.log(`✅ Successfully set admin custom claim for user: ${userUid}`);

        // Add user to the /admins node in Realtime Database
        const db = admin.database();
        const adminRef = db.ref(`admins/${userUid}`);
        await adminRef.set(true);
        console.log(`✅ Successfully added user ${userUid} to the admins list in Realtime Database.`);

        console.log('\nSetup complete. You can now log in as an admin.');
        process.exit(0);

      } catch (error) {
        console.error('❌ Error during admin setup:', error);
        process.exit(1);
      }
    }

    setAdmin();
    ```

6.  **Get Service Account Key & Database URL**:
    *   In the Firebase Console, go to **Project settings** (click the gear icon ⚙️).
    *   Go to the **Service accounts** tab.
    *   Click **Generate new private key**.
    *   A JSON file will be downloaded. Rename this file to `serviceAccountKey.json` and place it in the same `admin-scripts` folder.
    *   Go to the **Realtime Database** section in the console. Your database URL (e.g., `https://my-project-123.firebaseio.com`) will be listed there. Copy it and paste it into the `databaseURL` field in `set-admin.js`.
    *   **WARNING**: Keep the service account file secure. Do not commit it to version control.

7.  **Run the Script**:
    *   Open your terminal in the `admin-scripts` folder.
    *   Run `npm install` to install the `firebase-admin` package.
    *   Run `node set-admin.js`.

    If successful, you will see two success messages.

## Method 2: Manually in the Firebase Console

If you prefer not to run a script, you can perform the necessary steps manually.

1.  **Set up Custom Claim (Follow Method 1)**: You still need to run the script from Method 1 to set the custom claim, as this cannot be done from the console. You can, however, ignore the database part if the script fails.

2.  **Add to Realtime Database Manually**:
    *   Go to the **Firebase Console**.
    *   Select your project.
    *   Navigate to **Build** -> **Realtime Database**.
    *   At the top level of your database, find the `admins` node. If it doesn't exist, create it by clicking the `+` icon next to your database name and entering `admins` as the key.
    *   Click the `+` icon next to the `admins` node.
    *   For the **Name (key)**, paste the **User UID** (`n1XN7eF4AAMzq1d2sJnEew0bSQt2`).
    *   For the **Value**, type `true` and press Enter.

---

## Final Step

After setting the claim and adding the database entry, you need to **log out and log back in** to the application. Firebase ID tokens are refreshed hourly, so logging back in will force a refresh and your new `isAdmin` status will be recognized.
