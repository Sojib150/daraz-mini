// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB6b93A_HeU4FADs3o2Ysw6-dlRRS2TbZk",
  authDomain: "telegram-miniapp-e8cc0.firebaseapp.com",
  databaseURL: "https://telegram-miniapp-e8cc0-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "telegram-miniapp-e8cc0",
  storageBucket: "telegram-miniapp-e8cc0.appspot.com",
  messagingSenderId: "827930913054",
  appId: "1:827930913054:web:502b56e0c198d8e9ff410f"
};

// Init
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// LOGIN
window.login = function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      location.href = "feed.html";
    })
    .catch(err => alert(err.message));
};

// LOGOUT
window.logout = function () {
  signOut(auth).then(() => location.href = "index.html");
};

// AUTH CHECK
onAuthStateChanged(auth, user => {
  if (!user && location.pathname.includes("feed")) {
    location.href = "index.html";
  }
});

// ADD POST
window.addPost = function () {
  const text = document.getElementById("postText").value;
  if (!text) return;

  const postRef = ref(db, "posts");
  push(postRef, {
    text: text,
    likes: 0,
    comments: {}
  });

  document.getElementById("postText").value = "";
};

// LOAD POSTS
const feed = document.getElementById("feed");
if (feed) {
  const postRef = ref(db, "posts");
  onValue(postRef, snapshot => {
    feed.innerHTML = "";
    snapshot.forEach(child => {
      const post = child.val();
      const postId = child.key;

      const div = document.createElement("div");
      div.className = "post";

      div.innerHTML = `
        <p>${post.text}</p>
        <button onclick="likePost('${postId}')">❤️ ${post.likes || 0}</button>
        <div>
          <input placeholder="Comment..." id="c-${postId}">
          <button onclick="addComment('${postId}')">💬</button>
        </div>
      `;

      // comments
      if (post.comments) {
        Object.values(post.comments).forEach(c => {
          const p = document.createElement("p");
          p.style.fontSize = "13px";
          p.innerText = "💬 " + c;
          div.appendChild(p);
        });
      }

      feed.appendChild(div);
    });
  });
}

// LIKE
window.likePost = function (id) {
  const likeRef = ref(db, "posts/" + id + "/likes");
  onValue(likeRef, snap => {
    likeRef.set((snap.val() || 0) + 1);
  }, { onlyOnce: true });
};

// COMMENT
window.addComment = function (id) {
  const input = document.getElementById("c-" + id);
  if (!input.value) return;

  const cRef = ref(db, "posts/" + id + "/comments");
  push(cRef, input.value);
  input.value = "";
};
