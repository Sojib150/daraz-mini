// Firebase CDN already loaded in HTML (script src)
const auth = firebase.auth();
const db = firebase.database();

// LOGIN / SIGNUP
const loginBtn = document.getElementById("loginBtn");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

loginBtn.addEventListener("click", ()=>{
    const email = emailInput.value;
    const password = passwordInput.value;

    if(!email || !password) return alert("Fill email & password");

    auth.signInWithEmailAndPassword(email,password)
    .then(()=>location.href="feed.html")
    .catch(()=>{
        // if login fails, create account
        auth.createUserWithEmailAndPassword(email,password)
        .then(res=>{
            db.ref("users/"+res.user.uid).set({ email });
            location.href="feed.html";
        })
        .catch(e=>alert(e.message));
    });
});

// AUTH CHECK
auth.onAuthStateChanged(user=>{
    if(!user && window.location.pathname.includes("feed")) location.href="index.html";
});

// LOGOUT
function logout(){ auth.signOut().then(()=>location.href="index.html"); }
window.logout = logout;

// POST
function addPost(){
    const text = document.getElementById("postText").value;
    if(!text) return;
    db.ref("posts").push({ text, likes:0, comments:{} });
    document.getElementById("postText").value="";
}
window.addPost = addPost;

// LOAD POSTS
function loadFeed(){
    const feedDiv = document.getElementById("feed");
    if(!feedDiv) return;

    db.ref("posts").on("value",snap=>{
        feedDiv.innerHTML = "";
        snap.forEach(p=>{
            const post = p.val();
            const id = p.key;
            const div = document.createElement("div");
            div.className = "post";

            div.innerHTML = `
                <p>${post.text}</p>
                <button onclick="likePost('${id}')">❤️ ${post.likes||0}</button>
                <div>
                    <input placeholder="Comment..." id="c-${id}">
                    <button onclick="addComment('${id}')">💬</button>
                </div>
            `;

            if(post.comments){
                Object.values(post.comments).forEach(c=>{
                    const p = document.createElement("p");
                    p.style.fontSize="13px";
                    p.innerText = "💬 "+c;
                    div.appendChild(p);
                });
            }

            feedDiv.appendChild(div);
        });
    });
}
window.loadFeed = loadFeed;

// LIKE
function likePost(id){
    const likeRef = db.ref("posts/"+id+"/likes");
    likeRef.transaction(val => (val||0)+1);
}
window.likePost = likePost;

// COMMENT
function addComment(id){
    const input = document.getElementById("c-"+id);
    if(!input.value) return;
    db.ref("posts/"+id+"/comments").push(input.value);
    input.value="";
}
window.addComment = addComment;
