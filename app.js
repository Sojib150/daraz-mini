// Firebase App (compat version for normal JS)
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

// Services
const auth = firebase.auth();
const db = firebase.firestore();

/* ======================
   AUTH FUNCTIONS
====================== */

// Signup
function signup() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.createUserWithEmailAndPassword(email, password)
    .then((cred) => {
      return db.collection("users").doc(cred.user.uid).set({
        email: email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    })
    .then(() => {
      window.location.href = "feed.html";
    })
    .catch((error) => {
      alert(error.message);
    });
}

// Login
function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      window.location.href = "feed.html";
    })
    .catch((error) => {
      alert(error.message);
    });
}

// Logout (later use)
function logout() {
  auth.signOut().then(() => {
    window.location.href = "index.html";
  });
}
/* ======================
   POST SYSTEM
====================== */

function addPost() {
  const text = document.getElementById("postText").value;
  const user = auth.currentUser;

  if (!text) return alert("কিছু লিখো বস 😄");

  db.collection("posts").add({
    text: text,
    userEmail: user.email,
    time: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    document.getElementById("postText").value = "";
    loadPosts();
  });
}

function loadPosts() {
  const feed = document.getElementById("feed");
  if (!feed) return;

  feed.innerHTML = "";

  db.collection("posts")
    .orderBy("time", "desc")
    .onSnapshot(snapshot => {
      feed.innerHTML = "";
      snapshot.forEach(doc => {
        const data = doc.data();
        const div = document.createElement("div");
        div.className = "post";
        div.innerHTML = `<b>${data.userEmail}</b><p>${data.text}</p>`;
        feed.appendChild(div);
      });
    });
}

auth.onAuthStateChanged(user => {
  if (user) {
    loadPosts();
  }
});