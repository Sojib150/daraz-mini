// 🔹 Firebase imports (v12)
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

// 🔹 YOUR Firebase Config (unchanged)
const firebaseConfig = {
  apiKey: "AIzaSyB6b93A_HeU4FADs3o2Ysw6-dlRRS2TbZk",
  authDomain: "telegram-miniapp-e8cc0.firebaseapp.com",
  databaseURL: "https://telegram-miniapp-e8cc0-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "telegram-miniapp-e8cc0",
  storageBucket: "telegram-miniapp-e8cc0.firebasestorage.app",
  messagingSenderId: "827930913054",
  appId: "1:827930913054:web:502b56e0c198d8e9ff410f"
};

// 🔹 Init
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// 🔹 SIGN UP
window.signup = function () {
  const email = email.value;
  const password = password.value;

  createUserWithEmailAndPassword(auth, email, password)
    .then(() => {
      alert("Signup success ✅");
      location.href = "feed.html";
    })
    .catch(err => alert(err.message));
};

// 🔹 LOGIN
window.login = function () {
  const email = email.value;
  const password = password.value;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      alert("Login success ✅");
      location.href = "feed.html";
    })
    .catch(err => alert(err.message));
};

// 🔹 CREATE POST
window.createPost = function () {
  const text = postText.value;
  if (!text) return alert("Empty post!");

  const postRef = push(ref(db, "posts"));

  set(postRef, {
    text: text,
    time: Date.now()
  }).then(() => {
    postText.value = "";
  });
};

// 🔹 LOAD POSTS
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
