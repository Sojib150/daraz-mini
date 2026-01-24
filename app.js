// ----------------------
// Firebase Config
// ----------------------
const firebaseConfig = {
  apiKey: "AIzaSyB6b93A_HeU4FADs3o2Ysw6-dlRRS2TbZk",
  authDomain: "telegram-miniapp-e8cc0.firebaseapp.com",
  databaseURL: "https://telegram-miniapp-e8cc0-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "telegram-miniapp-e8cc0",
  storageBucket: "telegram-miniapp-e8cc0.appspot.com",
  messagingSenderId: "827930913054",
  appId: "1:827930913054:web:502b56e0c198d8e9ff410f"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// ----------------------
// Global Variables
// ----------------------
let currentUser = null;

// ----------------------
// Auth State Listener
// ----------------------
auth.onAuthStateChanged(user => {
  if(user){
    currentUser = user;
    loadUserData();
    loadFeed();
    loadFriends();
    loadFriendRequests();
    loadChatFriends();
    loadMyProfile();
  } else {
    // Redirect to login page or show login
    window.location = "login.html";
  }
});

// ----------------------
// Logout
// ----------------------
function logout(){
  auth.signOut();
}

// ----------------------
// Show Panel
// ----------------------
function showPanel(panelId){
  const panels = document.querySelectorAll(".panel");
  panels.forEach(p => p.style.display = "none");
  document.getElementById(panelId).style.display = "block";
}

// ----------------------
// Profile Picture Upload
// ----------------------
function uploadProfilePic(event){
  const file = event.target.files[0];
  const ref = storage.ref(`profilePics/${currentUser.uid}`);
  ref.put(file).then(() => {
    ref.getDownloadURL().then(url => {
      db.collection("users").doc(currentUser.uid).set({profilePic:url},{merge:true});
      document.getElementById("profileImage").src = url;
      document.getElementById("myProfilePic").src = url;
    });
  });
}

// ----------------------
// Cover Photo Upload
// ----------------------
function uploadCoverPhoto(event){
  const file = event.target.files[0];
  const ref = storage.ref(`coverPhotos/${currentUser.uid}`);
  ref.put(file).then(() => {
    ref.getDownloadURL().then(url => {
      db.collection("users").doc(currentUser.uid).set({coverPhoto:url},{merge:true});
      document.getElementById("myCover").src = url;
    });
  });
}

// ----------------------
// Load User Data
// ----------------------
function loadUserData(){
  db.collection("users").doc(currentUser.uid).get().then(doc => {
    if(doc.exists){
      const data = doc.data();
      document.getElementById("profileName").innerText = data.name || currentUser.email;
      document.getElementById("profileImage").src = data.profilePic || "default.png";
      document.getElementById("myProfilePic").src = data.profilePic || "default.png";
      document.getElementById("myName").innerText = data.name || currentUser.email;
      document.getElementById("myEmail").innerText = currentUser.email;
      document.getElementById("myBio").innerText = data.bio || "";
      document.getElementById("myCover").src = data.coverPhoto || "cover-default.jpg";
    } else {
      // New user, create doc
      db.collection("users").doc(currentUser.uid).set({
        name: currentUser.email,
        bio:"",
        profilePic:"",
        coverPhoto:""
      });
    }
  });
}

// ----------------------
// Add Post
// ----------------------
function addPost(){
  const text = document.getElementById("postText").value;
  if(text.trim() === "") return;
  db.collection("posts").add({
    text:text,
    userId: currentUser.uid,
    time: firebase.firestore.FieldValue.serverTimestamp()
  });
  document.getElementById("postText").value = "";
}

// ----------------------
// Load Feed
// ----------------------
function loadFeed(){
  const feedDiv = document.getElementById("feed");
  db.collection("posts").orderBy("time","desc")
    .onSnapshot(snapshot => {
      feedDiv.innerHTML = "";
      snapshot.forEach(doc => {
        const post = doc.data();
        db.collection("users").doc(post.userId).get().then(userDoc => {
          const userData = userDoc.data();
          const div = document.createElement("div");
          div.className = "post";
          div.innerHTML = `
            <div class="user-info">
              <img src="${userData.profilePic || 'default.png'}">
              <b onclick="viewProfile('${post.userId}')" style="cursor:pointer">${userData.name || post.userId}</b>
            </div>
            <p>${post.text}</p>
          `;
          feedDiv.appendChild(div);
        });
      });
    });
}

// ----------------------
// View Profile
// ----------------------
function viewProfile(userId){
  localStorage.setItem("viewUserId",userId);
  window.location = "profile.html";
}

// ----------------------
// Friend System
// ----------------------
function loadFriends(){
  const friendsDiv = document.getElementById("friendsList");
  db.collection("users").doc(currentUser.uid).collection("friends")
    .onSnapshot(snapshot => {
      friendsDiv.innerHTML = "";
      snapshot.forEach(doc => {
        const friend = doc.data();
        const div = document.createElement("div");
        div.className = "friend-item";
        div.innerHTML = `<img src="${friend.profilePic || 'default.png'}"><span>${friend.name}</span>`;
        friendsDiv.appendChild(div);
      });
    });
}

function loadFriendRequests(){
  const requestsDiv = document.getElementById("friendRequests");
  db.collection("users").doc(currentUser.uid).collection("requests")
    .onSnapshot(snapshot => {
      requestsDiv.innerHTML = "";
      snapshot.forEach(doc => {
        const req = doc.data();
        const div = document.createElement("div");
        div.innerHTML = `${req.name} <button onclick="acceptFriend('${doc.id}','${req.userId}')">Accept</button>`;
        requestsDiv.appendChild(div);
      });
    });
}

function acceptFriend(requestId, friendId){
  db.collection("users").doc(currentUser.uid).collection("friends").doc(friendId).set({name:"friend"}); // simplified
  db.collection("users").doc(currentUser.uid).collection("requests").doc(requestId).delete();
}

// ----------------------
// Chat System
// ----------------------
function loadChatFriends(){
  const select = document.getElementById("chatFriendSelect");
  select.innerHTML = '<option value="">Select Friend</option>';
  db.collection("users").doc(currentUser.uid).collection("friends")
    .onSnapshot(snapshot=>{
      snapshot.forEach(doc=>{
        const friend = doc.data();
        const opt = document.createElement("option");
        opt.value = doc.id;
        opt.text = friend.name;
        select.appendChild(opt);
      });
    });
}

let chatFriendId = null;
function loadChat(friendId){
  chatFriendId = friendId;
  const chatDiv = document.getElementById("chatMessages");
  chatDiv.innerHTML = "";
  if(!friendId) return;
  db.collection("chats").doc(currentUser.uid).collection(friendId)
    .orderBy("time","asc")
    .onSnapshot(snapshot=>{
      chatDiv.innerHTML = "";
      snapshot.forEach(doc=>{
        const msg = doc.data();
        const div = document.createElement("div");
        div.innerHTML = `<b>${msg.sender===currentUser.uid?'Me':'Friend'}</b>: ${msg.text}`;
        chatDiv.appendChild(div);
      });
    });
}

function sendMessage(){
  const text = document.getElementById("chatInput").value;
  if(!chatFriendId || text.trim()==="") return;
  const message = {text, sender:currentUser.uid, time:firebase.firestore.FieldValue.serverTimestamp()};
  db.collection("chats").doc(currentUser.uid).collection(chatFriendId).add(message);
  db.collection("chats").doc(chatFriendId).collection(currentUser.uid).add(message);
  document.getElementById("chatInput").value = "";
}

// ----------------------
// My Profile Panel
// ----------------------
function loadMyProfile(){
  db.collection("users").doc(currentUser.uid).collection("posts")
    .onSnapshot(snapshot=>{
      const myPostsDiv = document.getElementById("myPosts");
      myPostsDiv.innerHTML = "";
      snapshot.forEach(doc=>{
        const post = doc.data();
        const div = document.createElement("div");
        div.className="post";
        div.innerHTML = `<p>${post.text}</p>`;
        myPostsDiv.appendChild(div);
      });
    });
}

function updateBio(){
  const bio = document.getElementById("editBio").value;
  db.collection("users").doc(currentUser.uid).set({bio},{merge:true});
  document.getElementById("myBio").innerText = bio;
}