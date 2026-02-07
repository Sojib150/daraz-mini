import {initializeApp} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {getAuth,signInWithEmailAndPassword,createUserWithEmailAndPassword,onAuthStateChanged,signOut} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {getDatabase,ref,push,onValue,set,remove,get} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import {getStorage,ref as sRef,uploadBytes,getDownloadURL} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const firebaseConfig={
  apiKey:"AIzaSyB6b93A_HeU4FADs3o2Ysw6-dlRRS2TbZk",
  authDomain:"telegram-miniapp-e8cc0.firebaseapp.com",
  databaseURL:"https://telegram-miniapp-e8cc0-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId:"telegram-miniapp-e8cc0",
  storageBucket:"telegram-miniapp-e8cc0.firebasestorage.app",
  messagingSenderId:"827930913054",
  appId:"1:827930913054:web:502b56e0c198d8e9ff410f"
};

const app=initializeApp(firebaseConfig);
const auth=getAuth();
const db=getDatabase();
const storage=getStorage();

let viewUser = localStorage.getItem("viewUser");

// ---------- AUTH ----------
window.login=()=>signInWithEmailAndPassword(auth,email.value,password.value)
.then(()=>location="feed.html");
window.signup=()=>createUserWithEmailAndPassword(auth,email.value,password.value)
.then(()=>location="feed.html");
window.logout=()=>signOut(auth).then(()=>location="index.html");

// ---------- AUTH STATE ----------
onAuthStateChanged(auth,u=>{
  if(!u && !location.pathname.includes("index")) location="index.html";
  if(u){
    if(location.pathname.includes("feed")) loadFeed(u);
    if(location.pathname.includes("profile")) loadProfile(u);
  }
});

// ---------- POSTS ----------
window.addPost=()=>{
  push(ref(db,"posts"),{
    uid:auth.currentUser.uid,
    text:postText.value,
    time:Date.now()
  });
  postText.value="";
};

function loadFeed(u){
  loadUsers(u);
  onValue(ref(db,"posts"),s=>{
    feed.innerHTML="";
    s.forEach(p=>{
      feed.innerHTML+=`
      <div class="post">
        ${p.val().text}
      </div>`;
    });
  });
}

// ---------- USERS LIST ----------
function loadUsers(u){
  onValue(ref(db,"users"),s=>{
    users.innerHTML="";
    s.forEach(x=>{
      if(x.key!==u.uid){
        users.innerHTML+=`
        <div class="post">
          ${x.val().email}
          <button onclick="openProfile('${x.key}')">View</button>
        </div>`;
      }
    });
  });
}

window.openProfile=uid=>{
  localStorage.setItem("viewUser",uid);
  location="profile.html";
};

// ---------- PROFILE ----------
function loadProfile(u){
  const uid=viewUser || u.uid;

  get(ref(db,"users/"+uid)).then(s=>{
    if(s.val()){
      name.innerText=s.val().email;
      bio.value=s.val().bio||"";
      photo.src=s.val().photo||"";
    }
  });

  if(uid===u.uid){
    friendBtn.style.display="none";
  }else{
    setupFriendButton(u.uid,uid);
  }

  onValue(ref(db,"posts"),s=>{
    myPosts.innerHTML="";
    s.forEach(p=>{
      if(p.val().uid===uid){
        myPosts.innerHTML+=`<div class="post">${p.val().text}</div>`;
      }
    });
  });
}

// ---------- FRIEND LOGIC ----------
function setupFriendButton(me,other){
  const btn=friendBtn;
  get(ref(db,"friends/"+me+"/"+other)).then(f=>{
    if(f.exists()){
      btn.innerText="Friends";
      btn.disabled=true;
    }else{
      get(ref(db,"requests/"+other+"/"+me)).then(r=>{
        if(r.exists()){
          btn.innerText="Accept Friend";
          btn.onclick=()=>acceptFriend(me,other);
        }else{
          btn.innerText="Add Friend";
          btn.onclick=()=>sendRequest(me,other);
        }
      });
    }
  });
}

function sendRequest(me,other){
  set(ref(db,"requests/"+other+"/"+me),true);
  alert("Friend request sent");
}

function acceptFriend(me,other){
  set(ref(db,"friends/"+me+"/"+other),true);
  set(ref(db,"friends/"+other+"/"+me),true);
  remove(ref(db,"requests/"+me+"/"+other));
  alert("Friend added");
}

// ---------- PROFILE UPDATE ----------
window.saveProfile=()=>{
  set(ref(db,"users/"+auth.currentUser.uid+"/bio"),bio.value);
};

window.uploadPhoto=e=>{
  const r=sRef(storage,"profiles/"+auth.currentUser.uid);
  uploadBytes(r,e.target.files[0])
  .then(()=>getDownloadURL(r))
  .then(url=>{
    set(ref(db,"users/"+auth.currentUser.uid+"/photo"),url);
    photo.src=url;
  });
};

window.goProfile=()=>{
  localStorage.removeItem("viewUser");
  location="profile.html";
};
