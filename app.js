import {initializeApp} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {getAuth,signInWithEmailAndPassword,createUserWithEmailAndPassword,onAuthStateChanged,signOut} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {getDatabase,ref,push,onValue,set} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
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

// LOGIN
window.login=()=>signInWithEmailAndPassword(auth,email.value,password.value)
.then(()=>location="feed.html");
window.signup=()=>createUserWithEmailAndPassword(auth,email.value,password.value)
.then(()=>location="feed.html");
window.logout=()=>signOut(auth).then(()=>location="index.html");

// AUTH CHECK
onAuthStateChanged(auth,u=>{
if(!u && !location.pathname.includes("index")) location="index.html";
if(u && location.pathname.includes("profile")) loadProfile(u);
if(u && location.pathname.includes("feed")) loadFeed();
});

// POSTS
window.addPost=()=>{
push(ref(db,"posts"),{
uid:auth.currentUser.uid,
text:postText.value,
likes:0
});
postText.value="";
};

function loadFeed(){
onValue(ref(db,"posts"),s=>{
feed.innerHTML="";
s.forEach(p=>{
let d=p.val(),k=p.key;
feed.innerHTML+=`
<div class="post">
${d.text}<br>
<button onclick="likePost('${k}',${d.likes})">❤️ ${d.likes}</button>
</div>`;
});
});
}

window.likePost=(id,c)=>set(ref(db,"posts/"+id+"/likes"),c+1);

// PROFILE
function loadProfile(u){
name.innerText=u.email;
onValue(ref(db,"users/"+u.uid),s=>{
if(s.val()){
bio.value=s.val().bio||"";
photo.src=s.val().photo||"";
}
});
onValue(ref(db,"posts"),s=>{
myPosts.innerHTML="";
s.forEach(p=>{
if(p.val().uid===u.uid){
myPosts.innerHTML+=`<div class="post">${p.val().text}</div>`;
}
});
});
}

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

window.goProfile=()=>location="profile.html";
