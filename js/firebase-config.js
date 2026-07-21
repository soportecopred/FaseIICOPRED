// Importaciones necesarias (SDK modular v9)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore, collection, doc, getDocs, getDoc, addDoc, setDoc, query, where, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-storage.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

// 🔥 REEMPLAZA ESTOS DATOS CON LOS DE TU PROYECTO FIREBASE 🔥
const firebaseConfig = {
    apiKey: "TU_API_KEY",
    authDomain: "TU_PROJECT.firebaseapp.com",
    projectId: "TU_PROJECT",
    storageBucket: "TU_PROJECT.appspot.com",
    messagingSenderId: "XXXXXXXXXX",
    appId: "1:XXXXXXXXXX:web:XXXXXXXXXXXX"
};

// Inicializar
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

// Funciones de utilidad exportadas para usar en toda la app
export { 
    collection, doc, getDocs, getDoc, addDoc, setDoc, query, where, orderBy, serverTimestamp,
    ref, uploadBytes, getDownloadURL, deleteObject,
    signInAnonymously, onAuthStateChanged
};

// Iniciar sesión anónima automáticamente al cargar
signInAnonymously(auth).catch((error) => {
    console.warn("Error en autenticación anónima:", error);
});