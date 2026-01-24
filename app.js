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
    window.location = "login.html";
  }
});

// ----------------------
// Logout
// ----------------------
function logout(){ auth.signOut(); }

// ----------------------
// Show Panel
// ----------------------
function showPanel(panelId){
  document.querySelectorAll(".panel").forEach(p=>p.style.display="none");
  document.getElementById(panelId).style.display="block";
}

// ----------------------
// Profile Picture Upload
// ----------------------
function uploadProfilePic(event){
  const file = event.target.files[0];
  const ref = storage.ref(`profilePics/${currentUser.uid}`);
  ref.put(file).then(()=> ref.getDownloadURL().then(url=>{
    db.collection("users").doc(currentUser.uid).set({profilePic:url},{merge:true});
    document.getElementById("profileImage").src = url;
    document.getElementById("myProfilePic").src = url;
  }));
}

// ----------------------
// Cover Photo Upload
// ----------------------
function uploadCoverPhoto(event){
  const file = event.target.files[0];
  const ref = storage.ref(`coverPhotos/${currentUser.uid}`);
  ref.put(file).then(()=> ref.getDownloadURL().then(url=>{
    db.collection("users").doc(currentUser.uid).set({coverPhoto:url},{merge:true});
    document.getElementById("myCover").src = url;
  }));
}

// ----------------------
// Load User Data
// ----------------------
function loadUserData(){
  db.collection("users").doc(currentUser.uid).get().then(doc=>{
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
  const text = document.getElementById("postText").value.trim();
  if(text==="") return;

  // Get user data first
  db.collection("users").doc(currentUser.uid).get().then(doc=>{
    const user = doc.data();
    db.collection("posts").add({
      text,
      userId: currentUser.uid,
      name: user.name || currentUser.email,
      profilePic: user.profilePic || "",
      likes: [],
      comments: [],
      time: firebase.firestore.FieldValue.serverTimestamp()
    });
    document.getElementById("postText").value = "";
  });
}

// ----------------------
// Load Feed
// ----------------------
function loadFeed(){
  const feedDiv = document.getElementById("feed");
  db.collection("posts").orderBy("time","desc").onSnapshot(snapshot=>{
    feedDiv.innerHTML = "";
    snapshot.forEach(doc=>{
      const post = doc.data();
      const div = document.createElement("div");
      div.className="post";
      const likesCount = post.likes ? post.likes.length : 0;
      const commentsCount = post.comments ? post.comments.length : 0;
      div.innerHTML = `
        <div class="user-info">
          <img src="${post.profilePic || 'default.png'}">
          <b onclick="viewProfile('${post.userId}')" style="cursor:pointer">${post.name}</b>
        </div>
        <p>${post.text}</p>
        <button onclick="likePost('${doc.id}')">Like (${likesCount})</button>
        <button onclick="commentPost('${doc.id}')">Comment (${commentsCount})</button>
        <div id="comments-${doc.id}"></div>
      `;
      feedDiv.appendChild(div);
      loadComments(doc.id);
    });
  });
}

// ----------------------
// Like / Comment
// ----------------------
function likePost(postId){
  const postRef = db.collection("posts").doc(postId);
  postRef.get().then(doc=>{
    const post = doc.data();
    let likes = post.likes || [];
    if(likes.includes(currentUser.uid)){
      likes = likes.filter(id=>id!==currentUser.uid);
    } else {
      likes.push(currentUser.uid);
    }
    postRef.update({likes});
  });
}

function commentPost(postId){
  const commentText = prompt("Write a comment:");
  if(!commentText) return;
  const postRef = db.collection("posts").doc(postId);
  postRef.get().then(doc=>{
    const post = doc.data();
    let comments = post.comments || [];
    comments.push({userId: currentUser.uid, text: commentText});
    postRef.update({comments});
  });
}

function loadComments(postId){
  const postRef = db.collection("posts").doc(postId);
  postRef.onSnapshot(doc=>{
    const post = doc.data();
    const commentsDiv = document.getElementById(`comments-${postId}`);
    commentsDiv.innerHTML = "";
    if(post.comments){
      post.comments.forEach(c=>{
        db.collection("users").doc(c.userId).get().then(uDoc=>{
          const user = uDoc.data();
          const div = document.createElement("div");
          div.innerHTML = `<b>${user.name || c.userId}</b>: ${c.text}`;
          commentsDiv.appendChild(div);
        });
      });
    }
  });
}

// ----------------------
// View Profile
// ----------------------
function viewProfile(userId){
  localStorage.setItem("viewUserId",userId);
  window.location="profile.html";
}

// ----------------------
// Friend System
// ----------------------
function loadFriends(){
  const friendsDiv = document.getElementById("friendsList");
  db.collection("users").doc(currentUser.uid).collection("friends").onSnapshot(snapshot=>{
    friendsDiv.innerHTML="";
    snapshot.forEach(doc=>{
      const friend = doc.data();
      const div = document.createElement("div");
      div.className="friend-item";
      div.innerHTML=`<img src="${friend.profilePic || 'default.png'}"><span>${friend.name}</span>`;
      friendsDiv.appendChild(div);
    });
  });
}

function loadFriendRequests(){
  const requestsDiv = document.getElementById("friendRequests");
  db.collection("users").doc(currentUser.uid).collection("requests").onSnapshot(snapshot=>{
    requestsDiv.innerHTML="";
    snapshot.forEach(doc=>{
      const req = doc.data();
      const div = document.createElement("div");
      div.innerHTML=`${req.name} <button onclick="acceptFriend('${doc.id}','${req.userId}')">Accept</button>`;
      requestsDiv.appendChild(div);
    });
  });
}

function acceptFriend(requestId, friendId){
  db.collection("users").doc(currentUser.uid).collection("friends").doc(friendId).set({name:"friend"}); 
  db.collection("users").doc(currentUser.uid).collection("requests").doc(requestId).delete();
}

// ----------------------
// Chat System
// ----------------------
function loadChatFriends(){
  const select = document.getElementById("chatFriendSelect");
  select.innerHTML = '<option value="">Select Friend</option>';
  db.collection("users").doc(currentUser.uid).collection("friends").onSnapshot(snapshot=>{
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
  chatDiv.innerHTML="";
  if(!friendId) return;
  db.collection("chats").doc(currentUser.uid).collection(friendId).orderBy("time","asc").onSnapshot(snapshot=>{
    chatDiv.innerHTML="";
    snapshot.forEach(doc=>{
      const msg = doc.data();
      const div = document.createElement("div");
      div.innerHTML=`<b>${msg.sender===currentUser.uid?'Me':'Friend'}</b>: ${msg.text}`;
      chatDiv.appendChild(div);
    });
  });
}

function sendMessage(){
  const text = document.getElementById("chatInput").value.trim();
  if(!chatFriendId || text==="") return;
  const message = {text, sender:currentUser.uid, time:firebase.firestore.FieldValue.serverTimestamp()};
  db.collection("chats").doc(currentUser.uid).collection(chatFriendId).add(message);
  db.collection("chats").doc(chatFriendId).collection(currentUser.uid).add(message);
  document.getElementById("chatInput").value="";
}

// ----------------------
// My Profile Panel
// ----------------------
function loadMyProfile(){
  const myPostsDiv = document.getElementById("myPosts");
  db.collection("posts").where("userId","==",currentUser.uid).orderBy("time","desc").onSnapshot(snapshot=>{
    myPostsDiv.innerHTML="";
    snapshot.forEach(doc=>{
      const post = doc.data();
      const div = document.createElement("div");
      div.className="post";
      div.innerHTML=`
        <p>${post.text}</p>
        <button onclick="likePost('${doc.id}')">Like (${post.likes ? post.likes.length : 0})</button>
        <button onclick="commentPost('${doc.id}')">Comment (${post.comments ? post.comments.length : 0})</button>
        <div id="comments-${doc.id}"></div>
      `;
      myPostsDiv.appendChild(div);
      loadComments(doc.id);
    });
  });
}

function updateBio(){
  const bio = document.getElementById("editBio").value;
  db.collection("users").doc(currentUser.uid).set({bio},{merge:true});
  document.getElementById("myBio").innerText = bio;
}