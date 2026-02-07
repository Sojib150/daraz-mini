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
  set,
  push,
  onValue,
  get
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

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

// DOM Elements
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const feedDiv = document.getElementById("feed");
const postText = document.getElementById("postText");

// LOGIN / SIGNUP
document.getElementById("loginBtn")?.addEventListener("click", () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  if(!email || !password) return alert("Fill email & password");

  // Try login
  signInWithEmailAndPassword(auth, email, password)
  .then(() => { location.href = "feed.html"; })
  .catch(err => {
    // if login fails, create account
    createUserWithEmailAndPassword(auth,email,password)
    .then(res => {
      set(ref(db, "users/" + res.user.uid), { email });
      location.href = "feed.html";
    })
    .catch(e => alert(e.message));
  });
});

// AUTH STATE
onAuthStateChanged(auth,user=>{
  if(!user && location.pathname.includes("feed")) location.href="index.html";
  if(user && feedDiv) loadFeed();
});

// LOGOUT
window.logout = () => signOut(auth).then(()=>location.href="index.html");

// ADD POST
window.addPost = () => {
  if(!postText.value) return;
  push(ref(db,"posts"),{ text: postText.value, likes:0, comments:{} });
  postText.value="";
};

// LOAD POSTS
function loadFeed(){
  const postRef = ref(db,"posts");
  onValue(postRef, snapshot => {
    feedDiv.innerHTML = "";
    snapshot.forEach(p=>{
      const data = p.val();
      const id = p.key;

      const div = document.createElement("div");
      div.className = "post";
      div.innerHTML = `
        <p>${data.text}</p>
        <button onclick="likePost('${id}')">❤️ ${data.likes || 0}</button>
        <div>
          <input placeholder="Comment..." id="c-${id}">
          <button onclick="addComment('${id}')">💬</button>
        </div>
      `;

      // show comments
      if(data.comments){
        Object.values(data.comments).forEach(c=>{
          const p = document.createElement("p");
          p.style.fontSize="13px";
          p.innerText="💬 "+c;
          div.appendChild(p);
        });
      }

      feedDiv.appendChild(div);
    });
  });
}

// LIKE
window.likePost = (id)=>{
  const likeRef = ref(db,"posts/"+id+"/likes");
  get(likeRef).then(s=>set(likeRef,(s.val()||0)+1));
};

// COMMENT
window.addComment = (id)=>{
  const input = document.getElementById("c-"+id);
  if(!input.value) return;
  push(ref(db,"posts/"+id+"/comments"),input.value);
  input.value="";
};
