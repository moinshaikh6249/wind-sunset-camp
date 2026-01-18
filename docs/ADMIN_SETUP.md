# Admin Setup Instructions

To gain admin access to the application, you need to add your user account to the `admins` collection in Cloud Firestore. This is a one-time setup for each administrator.

## How to Add an Admin

1.  **Create a User Account**:
    *   First, make sure you have signed up for a regular user account in the application with the email you want to designate as an admin (e.g., `admin@example.com`).

2.  **Get Your User UID**:
    *   Go to the [Firebase Console](https://console.firebase.google.com/).
    *   Select your project.
    *   Navigate to **Authentication** -> **Users** tab.
    *   Find the user account you just created and copy its **User UID**. It will look something like `n1XN7eF4AAMzq1d2sJnEew0bSQt2`.

3.  **Add the Admin Document in Firestore**:
    *   In the Firebase Console, go to **Firestore Database**.
    *   At the top of the data panel, click **+ Start collection**.
    *   For the **Collection ID**, enter `admins`.
    *   Click **Next**.
    *   For the **Document ID**, paste the **User UID** you copied from the Authentication page.
    *   Now, add the fields for the document:
        *   Field: `email` | Type: `string` | Value: The email address of the admin (e.g., `admin@example.com`).
        *   Field: `role` | Type: `string` | Value: `admin`.
        *   Field: `createdAt` | Type: `timestamp` | Value: The current date and time.
    *   Click **Save**.

---

## Final Step

After creating the admin document in Firestore, **log out and log back in** to the application through the `/admin/login` page. The application will now recognize your user as an administrator and grant you access to the admin dashboard.
