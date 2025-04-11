// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-analytics.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA0wmUiGJ90sy0h0RTF9Q9BsVMlXoKrs04",
  authDomain: "simplewebdb.firebaseapp.com",
  projectId: "simplewebdb",
  storageBucket: "simplewebdb.firebasestorage.app",
  messagingSenderId: "757799625418",
  appId: "1:757799625418:web:3fa10727ad1ffb9e9e4a33",
  measurementId: "G-G6PBLPTHMG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);

// Export Firestore instance to use in other files
export { db };
