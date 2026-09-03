/* ==========================================================
   firebase-config.js — shared Firebase project configuration
   ----------------------------------------------------------
   Get these values from: Firebase Console → Project settings
   → General → "Your apps" → SDK setup and configuration.

   This file is loaded on both index.html (public storefront,
   read-only) and admin.html (product management, gated by
   login). It is safe for these values to be visible in the
   browser — Firestore security rules (see firestore.rules) are
   what actually control who can read/write data, not this file.
   ========================================================== */

const firebaseConfig = {
  apiKey: "REPLACE_WITH_YOUR_API_KEY",
  authDomain: "REPLACE_WITH_YOUR_PROJECT.firebaseapp.com",
  projectId: "REPLACE_WITH_YOUR_PROJECT_ID",
  storageBucket: "REPLACE_WITH_YOUR_PROJECT.appspot.com",
  messagingSenderId: "REPLACE_WITH_SENDER_ID",
  appId: "REPLACE_WITH_APP_ID",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
