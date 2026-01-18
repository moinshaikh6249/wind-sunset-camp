# Firestore Backup & Recovery Reminders

This document is an internal developer reminder for disaster recovery and best practices.

## 1. Firestore Rules Backup

It is highly recommended to keep a versioned backup of your Firestore security rules.

**Action:**
- Save a copy of your final `firestore.rules` file and name it `firestore.rules.backup.txt` or similar.
- Commit this backup to your version control system (e.g., Git) in a `docs` or `backups` folder.

## 2. Firestore Structure Screenshot

A visual reference of your database structure is invaluable for onboarding new developers or for recovery.

**Action:**
- Navigate to the Firestore Database page in your Firebase Console.
- Take a clear screenshot of the root-level collections.
- If you have important subcollection structures, take screenshots of those as well.
- Store these screenshots in a secure, shared location accessible to the development team.

## 3. Firestore Rules Page Screenshot

A screenshot of the rules page can serve as a quick visual check.

**Action:**
- Navigate to the **Firestore Database > Rules** tab in your Firebase Console.
- Take a screenshot of the entire rules editor content.
- Store this with your other backup materials.

---

**Note:** While screenshots are helpful for quick reference, the text file backup of your rules is the most critical asset for programmatic restoration.
