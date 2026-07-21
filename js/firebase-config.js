// js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { 
  getFirestore, 
  collection, doc, getDocs, getDoc, addDoc, setDoc, query, where, orderBy, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBlVNCFiorRmKgUuzPbbiLHAatsBiDl2G0",
  authDomain: "fase-ii-copred.firebaseapp.com",
  projectId: "fase-ii-copred",
  storageBucket: "fase-ii-copred.firebasestorage.app",
  messagingSenderId: "941466034940",
  appId: "1:941466034940:web:9c0ba8e97e4022b03bed79",
  measurementId: "G-328HRS2HXK"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export { 
  collection, doc, getDocs, getDoc, addDoc, setDoc, query, where, orderBy, serverTimestamp
};
