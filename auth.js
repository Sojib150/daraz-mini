import { auth, provider } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

window.signup = () => {
  createUserWithEmailAndPassword(auth, email.value, password.value)
    .then(() => location.href = "dashboard.html")
    .catch(e => alert(e.message));
};

window.login = () => {
  signInWithEmailAndPassword(auth, email.value, password.value)
    .then(() => location.href = "dashboard.html")
    .catch(e => alert(e.message));
};

window.googleLogin = () => {
  signInWithPopup(auth, provider)
    .then(() => location.href = "dashboard.html")
    .catch(e => alert(e.message));
};