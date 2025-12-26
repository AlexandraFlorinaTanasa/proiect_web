// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { 
  getFirestore, 
  enableIndexedDbPersistence // <--- 1. Importăm funcția magică
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBIwEO6tcprD-tid_7vyWT3VEEnYdUrxVs", // (Cheia ta)
  authDomain: "list-efa91.firebaseapp.com",
  projectId: "list-efa91",
  storageBucket: "list-efa91.firebasestorage.app",
  messagingSenderId: "505946163846",
  appId: "1:505946163846:web:87e5c1dcc07309d56d1f07",
  measurementId: "G-B0TPCFR9PL"
};

// Inițializăm aplicația
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// --- 2. ACTIVĂM PERSISTENȚA OFFLINE (IndexedDB) ---
// Acest cod rulează doar în browser (client-side)
if (typeof window !== "undefined") {
  enableIndexedDbPersistence(db)
    .catch((err) => {
      if (err.code == 'failed-precondition') {
        // Se întâmplă dacă ai mai multe tab-uri deschise (doar unul poate avea acces la IndexedDB)
        console.log("Persistența a eșuat: Mai multe tab-uri deschise.");
      } else if (err.code == 'unimplemented') {
        // Browserul nu suportă (ex: mod Incognito strict)
        console.log("Browserul nu suportă persistența.");
      }
    });
}

// Exportăm serviciile
export { db, auth };