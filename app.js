import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  push,
  set,
  onValue,
  get
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyB6b93A_HeU4FADs3o2Ysw6-dlRRS2TbZk",
  authDomain: "telegram-miniapp-e8cc0.firebaseapp.com",
  databaseURL: "https://telegram-miniapp-e8cc0-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "telegram-miniapp-e8cc0",
  storageBucket: "telegram-miniapp-e8cc0.appspot.com",
  messagingSenderId: "827930913054",
  appId: "1:827930913054:web:502b56e0c198d8e9ff410f"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

/* ---------- LOGIN ---------- */
window.login = function () {
  const email = emailInput.value;
  const password = passwordInput.value;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => location.href = "feed.html")
    .catch(() => signup(email, password));
};

/* ---------- SIGNUP ---------- */
function signup(email, password) {
  createUserWithEmailAndPassword(auth, email, password)
    .then(res => {
      set(ref(db, "users/" + res.user.uid), {
        email: email
      });
      location.href = "feed.html";
    })
    .catch(err => alert(err.message));
}

/* ---------- AUTH CHECK ---------- */
onAuthStateChanged(auth, user => {
  if (!user && location.pathname.includes("feed")) {
    location.href = "index.html";
  }
});

/* ---------- LOGOUT ---------- */
window.logout = function () {
  signOut(auth).then(() => location.href = "index.html");
};

/* ---------- POST ---------- */
window.addPost = function () {
  if (!postText.value) return;

  push(ref(db, "posts"), {
    text: postText.value,
    likes: 0
  });

  postText.value = "";
};

/* ---------- LOAD POSTS ---------- */
if (feed) {
  onValue(ref(db, "posts"), snap => {
    feed.innerHTML = "";
    snap.forEach(p => {
      const post = p.val();
      const id = p.key;

      feed.innerHTML += `
        <div class="post">
          <p>${post.text}</p>
          <button onclick="likePost('${id}')">❤️ ${post.likes || 0}</button>
        </div>
      `;
    });
  });
}

/* ---------- LIKE ---------- */
window.likePost = function (id) {
  const likeRef = ref(db, "posts/" + id + "/likes");
  get(likeRef).then(s => {
    set(likeRef, (s.val() || 0) + 1);
  });
};
