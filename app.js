// app.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.6.1/firebase-auth.js";

import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/10.6.1/firebase-database.js";
import { firebaseConfig } from "./firebase-config.js";

// INIT
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const provider = new GoogleAuthProvider();

// ELEMENTS
const email = document.getElementById("email");
const password = document.getElementById("password");
const msg = document.getElementById("msg");

// REGISTER
document.getElementById("registerBtn").onclick = () => {
  createUserWithEmailAndPassword(auth, email.value, password.value)
    .then(res => {
      set(ref(db, "users/" + res.user.uid), {
        email: res.user.email,
        coins: 0
      });
      msg.innerText = "✅ Account created successfully";
    })
    .catch(err => {
      msg.innerText = err.message;
    });
};

// LOGIN
document.getElementById("loginBtn").onclick = () => {
  signInWithEmailAndPassword(auth, email.value, password.value)
    .then(() => {
      msg.innerText = "✅ Login successful";
    })
    .catch(err => {
      msg.innerText = err.message;
    });
};

// GOOGLE LOGIN
document.getElementById("googleBtn").onclick = () => {
  signInWithPopup(auth, provider)
    .then(res => {
      set(ref(db, "users/" + res.user.uid), {
        email: res.user.email,
        coins: 0
      });
      msg.innerText = "✅ Google login successful";
    })
    .catch(err => {
      msg.innerText = err.message;
    });
};
