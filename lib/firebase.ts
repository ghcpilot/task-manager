// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCdnD1eniP8lrBA6ZECfPfnSeR8rji3OZo",
  authDomain: "task-mates-1a798.firebaseapp.com",
  projectId: "task-mates-1a798",
  storageBucket: "task-mates-1a798.firebasestorage.app",
  messagingSenderId: "650000730020",
  appId: "1:650000730020:web:4fd9f2088b86a791402331",
  measurementId: "G-HWBS8099TM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics (only in browser)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app; 