import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, memoryLocalCache, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBIwEO6tcprD-tid_7vyWT3VEEnYdUrxVs",
  authDomain: "list-efa91.firebaseapp.com",
  projectId: "list-efa91",
  storageBucket: "list-efa91.firebasestorage.app",
  messagingSenderId: "505946163846",
  appId: "1:505946163846:web:87e5c1dcc07309d56d1f07"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Configurare pentru a reduce erorile de tip "unavailable"
const db = initializeFirestore(app, {
  localCache: memoryLocalCache(), // Schimbă în persistentLocalCache() dacă vrei și cache nativ Firebase
  experimentalForceLongPolling: true, // ACEASTA ESTE CHEIA: forțează un mod de comunicare mai simplu care trece de firewall
});

const auth = getAuth(app);
export { db, auth };