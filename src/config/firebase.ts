// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBy1NLTiNlYD9lmednfqFfLBRN4cjqRJPI",
  authDomain: "krishi-sakhi-7896e.firebaseapp.com",
  projectId: "krishi-sakhi-7896e",
  storageBucket: "krishi-sakhi-7896e.firebasestorage.app",
  messagingSenderId: "795173273192",
  appId: "1:795173273192:web:4a326095846d129a46c5dd",
  measurementId: "G-K1P32TZ2Z2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Configure auth settings
auth.languageCode = 'en';

export default app;
