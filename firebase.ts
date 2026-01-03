// firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBIwEO6tcprD-tid_7vyWT3VEEnYdUrxVs",
  authDomain: "list-efa91.firebaseapp.com",
  projectId: "list-efa91",
  storageBucket: "list-efa91.firebasestorage.app",
  messagingSenderId: "505946163846",
  appId: "1:505946163846:web:87e5c1dcc07309d56d1f07",
  measurementId: "G-B0TPCFR9PL"
};

// Singleton Pattern pentru Next.js
// (Asta previne eroarea: "Firebase App named '[DEFAULT]' already exists")
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };