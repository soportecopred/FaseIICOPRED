// Importaciones necesarias (SDK modular v9)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore, collection, doc, getDocs, getDoc, addDoc, setDoc, query, where, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-storage.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

// 🔥 REEMPLAZA ESTOS DATOS CON LOS DE TU PROYECTO FIREBASE 🔥
const firebaseConfig = {
    apiKey: "AIzaSyBlVNCFiorRmKgUuzPbbiLHAatsBiDl2G0",
    authDomain: "fase-ii-copred.firebaseapp.com",
    projectId: "fase-ii-copred",
    storageBucket: "fase-ii-copred.firebasestorage.app",
    messagingSenderId: "941466034940",
    appId: "1:941466034940:web:9c0ba8e97e4022b03bed79"
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
