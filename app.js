// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.6.1/firebase-auth.js";
import { getDatabase, ref, set, get, update } from "https://www.gstatic.com/firebasejs/10.6.1/firebase-database.js";
import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const provider = new GoogleAuthProvider();

let uid = null;
let spinning = false;

// -------- LOGIN & REGISTER --------
document.addEventListener("DOMContentLoaded",()=>{
  const loginBtn = document.getElementById("loginBtn");
  const registerBtn = document.getElementById("registerBtn");
  const googleBtn = document.getElementById("googleBtn");

  if(loginBtn){
    loginBtn.addEventListener("click", ()=>{
      const email = document.getElementById("email").value;
      const pass = document.getElementById("password").value;
      signInWithEmailAndPassword(auth,email,pass)
        .then(userCredential=>{
          uid = userCredential.user.uid;
          window.location.href="home.html";
        })
        .catch(err=>alert(err.message));
    });
  }

  if(registerBtn){
    registerBtn.addEventListener("click", ()=>{
      const email = document.getElementById("email").value;
      const pass = document.getElementById("password").value;
      createUserWithEmailAndPassword(auth,email,pass)
        .then(userCredential=>{
          uid = userCredential.user.uid;
          set(ref(db,'users/'+uid),{coins:0,lastSpin:"1970-01-01T00:00:00Z"});
          window.location.href="home.html";
        })
        .catch(err=>alert(err.message));
    });
  }

  if(googleBtn){
    googleBtn.addEventListener("click", ()=>{
      signInWithPopup(auth,provider)
        .then(result=>{
          uid = result.user.uid;
          const userRef = ref(db,'users/'+uid);
          get(userRef).then(snapshot=>{
            if(!snapshot.exists()){
              set(userRef,{coins:0,lastSpin:"1970-01-01T00:00:00Z"});
            }
            window.location.href="home.html";
          });
        })
        .catch(err=>alert(err.message));
    });
  }
});

// -------- LOAD DASHBOARD DATA --------
onAuthStateChanged(auth,(user)=>{
  if(user){
    uid = user.uid;
    const coinDisplay = document.getElementById("coinDisplay");
    if(coinDisplay){
      const userRef = ref(db,'users/'+uid);
      get(userRef).then(snapshot=>{
        if(snapshot.exists()){
          coinDisplay.innerText = "🪙 Coins: "+snapshot.val().coins;
          const welcome = document.getElementById("welcomeText");
          if(welcome) welcome.innerText = "Welcome, "+(user.email || "Player") + "!";
        }
      });
    }
  }else{
    if(window.location.pathname.includes("dashboard.html") || window.location.pathname.includes("home.html")){
      window.location.href="index.html";
    }
  }
});

// -------- GAME SPIN LOGIC --------
window.spin = function(){
  if(!uid) return alert("Login first!");
  if(spinning) return;

  spinning = true;
  const wheel = document.getElementById("wheel");
  const result = document.getElementById("result");
  const coinDisplay = document.getElementById("coinDisplay");

  result.innerText = "⏳ Spinning...";
  const rewards = [5,10,20,50,0];
  const reward = rewards[Math.floor(Math.random()*rewards.length)];

  let deg = 360*6 + Math.floor(Math.random()*360);
  wheel.style.transform = "rotate("+deg+"deg)";

  setTimeout(()=>{
    const userRef = ref(db,'users/'+uid);
    get(userRef).then(snapshot=>{
      const userData = snapshot.val();
      const today = new Date().toISOString().split("T")[0];
      const lastSpinDate = userData.lastSpin.split("T")[0];

      if(today === lastSpinDate){
        result.innerText="😢 You already spun today!";
        spinning=false;
        return;
      }

      const newCoins = userData.coins + reward;
      update(userRef,{coins:newCoins,lastSpin:new Date().toISOString()});
      coinDisplay.innerText = "🪙 Coins: "+newCoins;
      result.innerText = reward>0 ? "🎉 You won "+reward+" coins!" : "😢 Try again!";
      spinning=false;
    });
  },4000);
}

// -------- NAVIGATION --------
window.goDashboard = function(){
  window.location.href="dashboard.html";
}
