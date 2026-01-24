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

/* ======================
   AUTH + PROFILE
====================== */
function signup() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const profilePic = document.getElementById("profilePic").value || "";

  auth.createUserWithEmailAndPassword(email, password)
    .then(cred => {
      return db.collection("users").doc(cred.user.uid).set({
        name: name,
        email: email,
        profilePic: profilePic,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        online: true
      });
    })
    .then(() => window.location.href = "feed.html")
    .catch(err => alert(err.message));
}

function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, password)
    .then(cred => {
      db.collection("users").doc(cred.user.uid).update({ online: true });
      window.location.href = "feed.html";
    })
    .catch(err => alert(err.message));
}

function logout() {
  const user = auth.currentUser;
  if(user) db.collection("users").doc(user.uid).update({ online: false });
  auth.signOut().then(() => window.location.href = "index.html");
}

/* ======================
   PROFILE DISPLAY
====================== */
function loadProfile() {
  const user = auth.currentUser;
  db.collection("users").doc(user.uid).get().then(doc => {
    const data = doc.data();
    document.getElementById("profileName").innerText = data.name;
    document.getElementById("profileImage").src = data.profilePic || "https://via.placeholder.com/50";
    document.getElementById("onlineStatus").style.background = data.online ? "green":"red";
  });
}

/* ======================
   POST + LIKE + COMMENT
====================== */
function addPost() {
  const text = document.getElementById("postText").value;
  const user = auth.currentUser;
  if (!text) return alert("Write something!");

  db.collection("posts").add({
    text: text,
    userId: user.uid,
    userEmail: user.email,
    likes: [],
    time: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => document.getElementById("postText").value = "");
}

function toggleLike(postId, likeBtn) {
  const userId = auth.currentUser.uid;
  const postRef = db.collection("posts").doc(postId);

  postRef.get().then(doc => {
    const likes = doc.data().likes || [];
    if (likes.includes(userId)) {
      postRef.update({ likes: likes.filter(id => id!==userId) });
      likeBtn.classList.remove("liked");
    } else {
      likes.push(userId);
      postRef.update({ likes: likes });
      likeBtn.classList.add("liked");
    }
  });
}

function addComment(postId, input) {
  const text = input.value;
  const user = auth.currentUser;
  if(!text) return;
  db.collection("comments").doc(postId).collection("commentList").add({
    text: text,
    userEmail: user.email,
    time: firebase.firestore.FieldValue.serverTimestamp()
  }).then(()=> input.value="");
}

/* ======================
   FRIEND SYSTEM
====================== */
function sendFriendRequest(toUserId) {
  const fromUser = auth.currentUser;
  db.collection("friendRequests").add({
    from: fromUser.uid,
    to: toUserId,
    status: "pending",
    time: firebase.firestore.FieldValue.serverTimestamp()
  });
}

function loadFriendRequests() {
  const user = auth.currentUser;
  db.collection("friendRequests")
    .where("to","==",user.uid)
    .where("status","==","pending")
    .onSnapshot(snapshot=>{
      const container = document.getElementById("friendRequests");
      container.innerHTML="";
      snapshot.forEach(doc=>{
        const data = doc.data();
        const div = document.createElement("div");
        div.innerHTML=`${data.from} <button onclick="acceptFriend('${doc.id}','${data.from}')">Accept</button>`;
        container.appendChild(div);
      });
    });
}

function acceptFriend(requestId, friendId){
  const user = auth.currentUser;
  db.collection("friendRequests").doc(requestId).update({ status:"accepted" });
  db.collection("users").doc(user.uid).collection("friends").doc(friendId).set({ friendId });
  db.collection("users").doc(friendId).collection("friends").doc(user.uid).set({ friendId:user.uid });
}

function loadFriends() {
  const user = auth.currentUser;
  const container = document.getElementById("friendsList");
  const select = document.getElementById("chatFriendSelect");
  container.innerHTML="";
  select.innerHTML=`<option value="">Select Friend</option>`;
  db.collection("users").doc(user.uid).collection("friends")
    .onSnapshot(snapshot=>{
      snapshot.forEach(doc=>{
        const friendId=doc.data().friendId;
        container.innerHTML+=`<div>${friendId}</div>`;
        select.innerHTML+=`<option value="${friendId}">${friendId}</option>`;
      });
    });
}

/* ======================
   PRIVATE CHAT
====================== */
function loadChat(friendId){
  const userId=auth.currentUser.uid;
  const chatId=[userId,friendId].sort().join("_");
  const chatDiv=document.getElementById("chatMessages");
  chatDiv.innerHTML="";
  db.collection("chats").doc(chatId).collection("messages")
    .orderBy("time")
    .onSnapshot(snapshot=>{
      chatDiv.innerHTML="";
      snapshot.forEach(doc=>{
        const msg=doc.data();
        const p=document.createElement("p");
        p.innerHTML=`<b>${msg.senderId}:</b> ${msg.text}`;
        chatDiv.appendChild(p);
      });
    });
}

function sendMessage(){
  const userId=auth.currentUser.uid;
  const friendId=document.getElementById("chatFriendSelect").value;
  if(!friendId) return alert("Select a friend first!");
  const chatId=[userId,friendId].sort().join("_");
  const text=document.getElementById("chatInput").value;
  if(!text) return;
  db.collection("chats").doc(chatId).collection("messages").add({
    text:text,
    senderId:userId,
    time:firebase.firestore.FieldValue.serverTimestamp()
  }).then(()=> document.getElementById("chatInput").value="");
}

/* ======================
   LOAD POSTS + FRIENDS + PROFILE
====================== */
function loadPosts(){
  const feed=document.getElementById("feed");
  if(!feed) return;

  db.collection("posts")
    .orderBy("time","desc")
    .onSnapshot(snapshot=>{
      feed.innerHTML="";
      snapshot.forEach(doc=>{
        const data=doc.data();
        const postId=doc.id;
        const div=document.createElement("div");
        div.className="post";
        const likesCount=data.likes?data.likes.length:0;

        div.innerHTML=`
          <b>${data.userEmail}</b>
          <p>${data.text}</p>
          <span class="like-btn ${data.likes.includes(auth.currentUser.uid)?'liked':''}" onclick="toggleLike('${postId}',this)">❤️ Like (${likesCount})</span>
          <span class="comment-btn">💬 Comment</span>
          <div class="comment-box">
            <input type="text" placeholder="Write a comment..." id="comment-${postId}">
            <button onclick="addComment('${postId}',document.getElementById('comment-${postId}'))">Send</button>
            <div id="comments-${postId}"></div>
          </div>
        `;
        feed.appendChild(div);

        db.collection("comments").doc(postId).collection("commentList")
          .orderBy("time")
          .onSnapshot(commentSnap=>{
            const commentsDiv=document.getElementById(`comments-${postId}`);
            commentsDiv.innerHTML="";
            commentSnap.forEach(cDoc=>{
              const cData=cDoc.data();
              const p=document.createElement("p");
              p.innerHTML=`<b>${cData.userEmail}:</b> ${cData.text}`;
              commentsDiv.appendChild(p);
            });
          });
      });
    });
}

auth.onAuthStateChanged(user=>{
  if(user){
    loadPosts();
    loadFriendRequests();
    loadFriends();
    loadProfile();
  }
});