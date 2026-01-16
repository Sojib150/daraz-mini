import { auth } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

let coins = 0;

onAuthStateChanged(auth, user => {
  if(!user){
    location.href="index.html";
  }else{
    document.getElementById("userEmail").innerText = user.email;
  }
});

window.playLottery = () => {
  const win = Math.floor(Math.random()*50)+1;
  coins += win;
  update();
  alert("🎉 You won "+win+" coins!");
};

window.watchAd = () => {
  coins += 20;
  update();
  alert("📺 Ad watched! +20 coins");
};

window.dailyBonus = () => {
  coins += 30;
  update();
  alert("🎁 Daily bonus +30 coins");
};

window.logout = () => {
  signOut(auth).then(()=>{
    location.href="index.html";
  });
};

function update(){
  document.getElementById("coinCount").innerText = coins;
}