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

// Init Firebase
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.database();

// Elements
const loginBtn = document.getElementById("loginBtn");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

// Login / Signup
loginBtn.addEventListener("click", () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  if (!email || !password) return alert("Fill both fields");

  // Try login
  auth.signInWithEmailAndPassword(email, password)
  .then(() => { location.href = "feed.html"; })
  .catch(err => {
    // If login fails, signup
    auth.createUserWithEmailAndPassword(email, password)
    .then(res => {
      db.ref("users/" + res.user.uid).set({
        email: email,
        name: "New User",
        bio: "",
        profilePic: "",
        coverPic: ""
      });
      location.href = "feed.html";
    })
    .catch(e => alert(e.message));
  });
});

// Auth State check
auth.onAuthStateChanged(user => {
  if (!user && window.location.pathname.includes("feed.html")) {
    location.href = "index.html";
  }
});

// Logout
function logout() {
  auth.signOut().then(() => location.href = "index.html");
}
window.logout = logout;
