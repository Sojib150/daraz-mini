// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyB6b93A_HeU4FADs3o2Ysw6-dlRRS2TbZk",
  authDomain: "telegram-miniapp-e8cc0.firebaseapp.com",
  databaseURL: "https://telegram-miniapp-e8cc0-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "telegram-miniapp-e8cc0",
  storageBucket: "telegram-miniapp-e8cc0.appspot.com",
  messagingSenderId: "827930913054",
  appId: "1:827930913054:web:502b56e0c198d8e9ff410f"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

/* ======================
   AUTH SYSTEM
====================== */
function signup() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.createUserWithEmailAndPassword(email, password)
    .then(cred => {
      return db.collection("users").doc(cred.user.uid).set({
        name: name,
        email: email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    })
    .then(() => window.location.href = "feed.html")
    .catch(err => alert(err.message));
}

function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, password)
    .then(() => window.location.href = "feed.html")
    .catch(err => alert(err.message));
}

function logout() {
  auth.signOut().then(() => window.location.href = "index.html");
}

/* ======================
   POST + FEED + LIKE + COMMENT
====================== */
function addPost() {
  const text = document.getElementById("postText").value;
  const user = auth.currentUser;
  if (!text) return alert("কিছু লিখো 😄");

  db.collection("posts").add({
    text: text,
    userId: user.uid,
    userEmail: user.email,
    likes: [],
    time: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => document.getElementById("postText").value = "");
}

function toggleLike(postId, likeBtn) {
  const userId = auth.currentUser.uid;
  const postRef = db.collection("posts").doc(postId);

  postRef.get().then(doc => {
    const likes = doc.data().likes || [];
    if (likes.includes(userId)) {
      postRef.update({ likes: likes.filter(id => id !== userId) });
      likeBtn.classList.remove("liked");
    } else {
      likes.push(userId);
      postRef.update({ likes: likes });
      likeBtn.classList.add("liked");
    }
  });
}

function addComment(postId, input) {
  const text = input.value;
  const user = auth.currentUser;
  if (!text) return;
  db.collection("comments").doc(postId).collection("commentList").add({
    text: text,
    userEmail: user.email,
    time: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => input.value = "");
}

function loadPosts() {
  const feed = document.getElementById("feed");
  if (!feed) return;

  db.collection("posts")
    .orderBy("time", "desc")
    .onSnapshot(snapshot => {
      feed.innerHTML = "";
      snapshot.forEach(doc => {
        const data = doc.data();
        const postId = doc.id;
        const div = document.createElement("div");
        div.className = "post";
        const likesCount = data.likes ? data.likes.length : 0;

        div.innerHTML = `
          <b>${data.userEmail}</b>
          <p>${data.text}</p>
          <span class="like-btn ${data.likes.includes(auth.currentUser.uid) ? 'liked':''}" onclick="toggleLike('${postId}', this)">❤️ Like (${likesCount})</span>
          <span class="comment-btn">💬 Comment</span>
          <div class="comment-box">
            <input type="text" placeholder="Write a comment..." id="comment-${postId}">
            <button onclick="addComment('${postId}', document.getElementById('comment-${postId}'))">Send</button>
            <div id="comments-${postId}"></div>
          </div>
        `;
        feed.appendChild(div);

        db.collection("comments").doc(postId).collection("commentList")
          .orderBy("time")
          .onSnapshot(commentSnap => {
            const commentsDiv = document.getElementById(`comments-${postId}`);
            commentsDiv.innerHTML = "";
            commentSnap.forEach(cDoc => {
              const cData = cDoc.data();
              const p = document.createElement("p");
              p.innerHTML = `<b>${cData.userEmail}:</b> ${cData.text}`;
              commentsDiv.appendChild(p);
            });
          });
      });
    });
}

auth.onAuthStateChanged(user => {
  if (user) loadPosts();
});