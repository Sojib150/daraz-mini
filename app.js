import {initializeApp} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {getAuth,signInWithEmailAndPassword,createUserWithEmailAndPassword,onAuthStateChanged,signOut} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {getDatabase,ref,set,push,onValue} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
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

window.signup=()=>createUserWithEmailAndPassword(auth,email.value,password.value).then(()=>location="feed.html");
window.login=()=>signInWithEmailAndPassword(auth,email.value,password.value).then(()=>location="feed.html");
window.logout=()=>signOut(auth).then(()=>location="index.html");

window.addPost=()=>{
const u=auth.currentUser;
push(ref(db,"posts"),{uid:u.uid,text:postText.value,likes:0});
postText.value="";
};

onAuthStateChanged(auth,u=>{
if(!u)return;
onValue(ref(db,"posts"),s=>{
feed&&(feed.innerHTML="");
s.forEach(p=>{
let d=p.val(),k=p.key;
feed&&(feed.innerHTML+=`
<div class="post">
${d.text}<br>
<button onclick="likePost('${k}',${d.likes||0})">❤️ ${d.likes||0}</button>
</div>`);
});
});
});

window.likePost=(id,c)=>set(ref(db,"posts/"+id+"/likes"),c+1);

window.uploadPic=e=>{
const u=auth.currentUser;
const r=sRef(storage,"profiles/"+u.uid);
uploadBytes(r,e.target.files[0]).then(()=>getDownloadURL(r).then(url=>{
set(ref(db,"users/"+u.uid+"/photo"),url);
profilePic.src=url;
}));
};

window.saveProfile=()=>{
const u=auth.currentUser;
set(ref(db,"users/"+u.uid+"/bio"),bio.value);
};

window.goProfile=()=>location="profile.html";
window.goChat=()=>location="chat.html";

window.sendMsg=()=>{
const u=auth.currentUser;
push(ref(db,"chats"),{uid:u.uid,msg:msg.value});
msg.value="";
};

onValue(ref(db,"chats"),s=>{
chatBox&&(chatBox.innerHTML="");
s.forEach(m=>chatBox&&(chatBox.innerHTML+=`<p>${m.val().msg}</p>`));
});