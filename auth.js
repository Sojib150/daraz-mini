import { auth, db } from "./firebase-config.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

window.login = function () {
  const email = email.value;
  const password = password.value;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => location.href = "dashboard.html")
    .catch(e => alert(e.message));
};

window.register = function () {
  const email = email.value;
  const password = password.value;

  createUserWithEmailAndPassword(auth, email, password)
    .then(res => {
      set(ref(db, "users/" + res.user.uid), {
        email,
        coins: 0,
        level: 1
      });
      location.href = "dashboard.html";
    })
    .catch(e => alert(e.message));
};