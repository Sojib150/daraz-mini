// js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBeCWMtjRiLaHhWiP-grW_8QDTRxf8ULLs",
  authDomain: "sojida.firebaseapp.com",
  databaseURL: "https://sojida-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "sojida",
  storageBucket: "sojida.firebasestorage.app",
  messagingSenderId: "194824640211",
  appId: "1:194824640211:web:2149cd020f898f40996626",
  measurementId: "G-6JVLZVLH7Q"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const googleProvider = new GoogleAuthProvider();
