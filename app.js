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

// Initialize Firebase
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
    if(!email || !password) return alert("Please fill email & password");

    auth.signInWithEmailAndPassword(email,password)
    .then(()=> location.href = "feed.html")
    .catch(()=>{
        auth.createUserWithEmailAndPassword(email,password)
        .then(res=>{
            db.ref("users/"+res.user.uid).set({ email, name: "New User" });
            location.href = "feed.html";
        })
        .catch(err=> alert(err.message));
    });
});
