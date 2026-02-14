
// Use namespaced Firebase imports to fix "no exported member" errors
import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

// Placeholder configuration. In a real-world scenario, 
// these would be your actual project keys from the Firebase Console.
const firebaseConfig = {
  apiKey: "AIzaSy-Mock-Key-For-Persistence",
  authDomain: "bloodbank-management.firebaseapp.com",
  projectId: "bloodbank-management",
  storageBucket: "bloodbank-management.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase using namespaced pattern
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const db = firebase.firestore();
export const auth = firebase.auth();
