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
const storage = firebase.storage();

/* SIDEBAR PANEL SWITCH */
function showPanel(panelId) {
  const panels = document.querySelectorAll(".panel");
  panels.forEach(p => p.style.display = "none");
  document.getElementById(panelId).style.display = "block";
}

/* PROFILE UPLOAD */
function uploadProfilePic(e) {
  const file = e.target.files[0];
  const user = auth.currentUser;
  if(!file) return;
  const storageRef = storage.ref().child(`profiles/${user.uid}`);
  storageRef.put(file).then(snapshot=>{
    snapshot.ref.getDownloadURL().then(url=>{
      db.collection("users").doc(user.uid).update({ profilePic: url });
      document.getElementById("profileImage").src = url;
    });
  });
}

/* AUTH + PROFILE */
function signup() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  auth.createUserWithEmailAndPassword(email, password)
    .then(cred=>{
      return db.collection("users").doc(cred.user.uid).set({
        name: name,
        email: email,
        profilePic: "",
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        online: true
      });
    })
    .then(()=> window.location.href="feed.html")
    .catch(err=> alert(err.message));
}

function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  auth.signInWithEmailAndPassword(email,password)
    .then(cred=>{
      db.collection("users").doc(cred.user.uid).update({online:true});
      window.location.href="feed.html";
    })
    .catch(err=>alert(err.message));
}

function logout() {
  const user = auth.currentUser;
  if(user) db.collection("users").doc(user.uid).update({ online:false });
  auth.signOut().then(()=> window.location.href="index.html");
}

/* LOAD PROFILE */
function loadProfile() {
  const user = auth.currentUser;
  db.collection("users").doc(user.uid).get().then(doc=>{
    const data=doc.data();
    document.getElementById("profileName").innerText=data.name;
    document.getElementById("profileImage").src=data.profilePic || "https://via.placeholder.com/50";
    document.getElementById("onlineStatus").style.background=data.online?"green":"red";
  });
}

/* POSTS + FEED + LIKE + COMMENT */
function addPost(){
  const text=document.getElementById("postText").value;
  const user=auth.currentUser;
  if(!text) return alert("Write something!");
  db.collection("posts").add({
    text:text,
    userId:user.uid,
    userEmail:user.email,
    time:firebase.firestore.FieldValue.serverTimestamp()
  }).then(()=> document.getElementById("postText").value="");
}

function loadPosts(){
  const feed=document.getElementById("feed");
  if(!feed) return;
  db.collection("posts").orderBy("time","desc").onSnapshot(snapshot=>{
    feed.innerHTML="";
    snapshot.forEach(doc=>{
      const data=doc.data();
      const postId=doc.id;
      // Load user info
      db.collection("users").doc(data.userId).get().then(userDoc=>{
        const u=userDoc.data();
        const div=document.createElement("div");
        div.className="post";
        div.innerHTML=`
          <div class="user-info">
            <img src="${u.profilePic || 'https://via.placeholder.com/35'}" />
            <b>${u.name}</b>
          </div>
          <p>${data.text}</p>
        `;
        feed.appendChild(div);
      });
    });
  });
}

/* FRIEND SYSTEM + CHAT */
function loadFriends(){
  const user=auth.currentUser;
  const container=document.getElementById("friendsList");
  const select=document.getElementById("chatFriendSelect");
  container.innerHTML="";
  select.innerHTML=`<option value="">Select Friend</option>`;
  db.collection("users").doc(user.uid).collection("friends")
    .onSnapshot(snapshot=>{
      snapshot.forEach(doc=>{
        const friendId=doc.data().friendId;
        db.collection("users").doc(friendId).get().then(friendDoc=>{
          const f=friendDoc.data();
          const div=document.createElement("div");
          div.className="friend-item";
          div.innerHTML=`<img src="${f.profilePic || 'https://via.placeholder.com/35'}" /> <b>${f.name}</b>`;
          container.appendChild(div);
          select.innerHTML+=`<option value="${friendId}">${f.name}</option>`;
        });
      });
    });
}

function loadFriendRequests(){
  const user=auth.currentUser;
  db.collection("friendRequests").where("to","==",user.uid)
    .where("status","==","pending")
    .onSnapshot(snapshot=>{
      const container=document.getElementById("friendRequests");
      container.innerHTML="";
      snapshot.forEach(doc=>{
        const data=doc.data();
        db.collection("users").doc(data.from).get().then(fDoc=>{
          const f=fDoc.data();
          const div=document.createElement("div");
          div.className="friend-item";
          div.innerHTML=`<img src="${f.profilePic || 'https://via.placeholder.com/35'}" /> <b>${f.name}</b> <button onclick="acceptFriend('${doc.id}','${data.from}')">Accept</button>`;
          container.appendChild(div);
        });
      });
    });
}

function acceptFriend(requestId, friendId){
  const user=auth.currentUser;
  db.collection("friendRequests").doc(requestId).update({status:"accepted"});
  db.collection("users").doc(user.uid).collection("friends").doc(friendId).set({friendId});
  db.collection("users").doc(friendId).collection("friends").doc(user.uid).set({friendId:user.uid});
}

/* AUTH STATE CHANGE */
auth.onAuthStateChanged(user=>{
  if(user){
    loadProfile();
    loadPosts();
    loadFriends();
    loadFriendRequests();
  }
});