// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

import {
  getDatabase,
  ref,
  push,
  set,
  onValue
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-database.js";

// Firebase config (UNCHANGED)
const firebaseConfig = {
  apiKey: "AIzaSyB6b93A_HeU4FADs3o2Ysw6-dlRRS2TbZk",
  authDomain: "telegram-miniapp-e8cc0.firebaseapp.com",
  databaseURL: "https://telegram-miniapp-e8cc0-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "telegram-miniapp-e8cc0",
  storageBucket: "telegram-miniapp-e8cc0.firebasestorage.app",
  messagingSenderId: "827930913054",
  appId: "1:827930913054:web:502b56e0c198d8e9ff410f"
};

// Init
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// ===== LOGIN / SIGNUP =====
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const signupBtn = document.getElementById("signupBtn");
const loginBtn = document.getElementById("loginBtn");

if (signupBtn) {
  signupBtn.onclick = () => {
    const email = emailInput.value;
    const password = passwordInput.value;

    createUserWithEmailAndPassword(auth, email, password)
      .then(() => {
        alert("Signup successful ✅");
        location.href = "feed.html";
      })
      .catch(err => alert(err.message));
  };
}

if (loginBtn) {
  loginBtn.onclick = () => {
    const email = emailInput.value;
    const password = passwordInput.value;

    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        alert("Login successful ✅");
        location.href = "feed.html";
      })
      .catch(err => alert(err.message));
  };
}

// ===== POSTS =====
window.createPost = function () {
  const postText = document.getElementById("postText");
  if (!postText || !postText.value) return;

  const postRef = push(ref(db, "posts"));
  set(postRef, {
    text: postText.value,
    time: Date.now()
  }).then(() => postText.value = "");
};

const postsDiv = document.getElementById("posts");
if (postsDiv) {
  onValue(ref(db, "posts"), snapshot => {
    postsDiv.innerHTML = "";
    snapshot.forEach(child => {
      const p = document.createElement("p");
      p.innerText = child.val().text;
      postsDiv.prepend(p);
    });
  });
}
