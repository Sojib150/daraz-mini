import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

import {
  getDatabase,
  ref,
  push,
  set,
  onValue,
  update,
  remove
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-database.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB6b93A_HeU4FADs3o2Ysw6-dlRRS2TbZk",
  authDomain: "telegram-miniapp-e8cc0.firebaseapp.com",
  databaseURL: "https://telegram-miniapp-e8cc0-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "telegram-miniapp-e8cc0",
  storageBucket: "telegram-miniapp-e8cc0.firebasestorage.app",
  messagingSenderId: "827930913054",
  appId: "1:827930913054:web:502b56e0c198d8e9ff410f"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

let currentUser = null;

onAuthStateChanged(auth, user => {
  if (!user) location.href = "index.html";
  currentUser = user;
});

// ===== CREATE POST =====
window.createPost = () => {
  const text = document.getElementById("postText").value;
  if (!text) return;

  const postRef = push(ref(db, "posts"));
  set(postRef, {
    text,
    uid: currentUser.uid,
    time: Date.now()
  });

  document.getElementById("postText").value = "";
};

// ===== LOAD POSTS =====
const postsDiv = document.getElementById("posts");

onValue(ref(db, "posts"), snap => {
  postsDiv.innerHTML = "";
  snap.forEach(postSnap => {
    const postId = postSnap.key;
    const post = postSnap.val();

    const div = document.createElement("div");
    div.className = "post";

    div.innerHTML = `
      <p>${post.text}</p>

      <div class="actions">
        <button onclick="likePost('${postId}')">❤️ Like</button>
        <button onclick="toggleComment('${postId}')">💬 Comment</button>
      </div>

      <div id="likes-${postId}"></div>

      <div id="comments-${postId}" style="display:none">
        <div id="commentList-${postId}"></div>
        <div class="comment-box">
          <input placeholder="Write a comment..."
            onkeydown="if(event.key==='Enter') addComment('${postId}', this)">
        </div>
      </div>
    `;

    postsDiv.prepend(div);

    loadLikes(postId);
    loadComments(postId);
  });
});

// ===== LIKE SYSTEM =====
window.likePost = postId => {
  const likeRef = ref(db, `likes/${postId}/${currentUser.uid}`);
  set(likeRef, true);
};

function loadLikes(postId) {
  onValue(ref(db, `likes/${postId}`), snap => {
    const count = snap.size || 0;
    document.getElementById(`likes-${postId}`).innerText =
      count + " likes";
  });
}

// ===== COMMENT SYSTEM =====
window.toggleComment = postId => {
  const el = document.getElementById(`comments-${postId}`);
  el.style.display = el.style.display === "none" ? "block" : "none";
};

window.addComment = (postId, input) => {
  if (!input.value) return;

  push(ref(db, `comments/${postId}`), {
    text: input.value,
    uid: currentUser.uid
  });

  input.value = "";
};

function loadComments(postId) {
  onValue(ref(db, `comments/${postId}`), snap => {
    const box = document.getElementById(`commentList-${postId}`);
    if (!box) return;

    box.innerHTML = "";
    snap.forEach(c => {
      const p = document.createElement("p");
      p.innerText = "• " + c.val().text;
      box.appendChild(p);
    });
  });
}
