import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

import {
  getDatabase,
  ref,
  set
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-database.js";

import {
  getStorage,
  ref as sRef,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-storage.js";

// 🔹 Firebase config (unchanged)
const firebaseConfig = {
  apiKey: "AIzaSyB6b93A_HeU4FADs3o2Ysw6-dlRRS2TbZk",
  authDomain: "telegram-miniapp-e8cc0.firebaseapp.com",
  databaseURL: "https://telegram-miniapp-e8cc0-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "telegram-miniapp-e8cc0",
  storageBucket: "telegram-miniapp-e8cc0.firebasestorage.app",
  messagingSenderId: "827930913054",
  appId: "1:827930913054:web:502b56e0c198d8e9ff410f"
};

// Init
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);

// Inputs
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const photoInput = document.getElementById("photo");
const signupBtn = document.getElementById("signupBtn");

signupBtn.onclick = async () => {
  const name = nameInput.value;
  const email = emailInput.value;
  const password = passwordInput.value;
  const photoFile = photoInput.files[0];

  if (!name || !email || !password || !photoFile) {
    return alert("All fields required!");
  }

  try {
    // 1️⃣ Create user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // 2️⃣ Upload profile photo
    const storageRef = sRef(storage, `profile_photos/${uid}`);
    await uploadBytes(storageRef, photoFile);
    const photoURL = await getDownloadURL(storageRef);

    // 3️⃣ Save user data in Realtime DB
    await set(ref(db, `users/${uid}`), {
      name,
      email,
      photo: photoURL
    });

    alert("Signup successful! ✅");
    location.href = "feed.html";

  } catch (err) {
    alert(err.message);
  }
};
