import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { ref, get, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

let uid, coins = 0;

onAuthStateChanged(auth, user => {
  if (!user) location.href = "index.html";
  uid = user.uid;
  userEmail.innerText = user.email;

  get(ref(db, "users/" + uid)).then(snap => {
    coins = snap.val().coins;
    updateUI();
  });
});

function save() {
  update(ref(db, "users/" + uid), { coins });
  updateUI();
}

function updateUI() {
  document.getElementById("coins").innerText = coins;
}

window.playGame = () => {
  gameArea.classList.remove("hidden");
  gameArea.innerHTML = `
    <h3>Simple Game</h3>
    <button onclick="win(10)">Win 10 Coins</button>
  `;
};

window.spin = () => {
  const win = Math.floor(Math.random() * 50) + 1;
  coins += win;
  alert("You won " + win + " coins");
  save();
};

window.watchAds = () => {
  coins += 20; // later ad logic
  alert("Ad watched! +20 coins");
  save();
};

window.daily = () => {
  coins += 50;
  alert("Daily bonus +50");
  save();
};

window.lottery = () => {
  gameArea.classList.remove("hidden");
  gameArea.innerHTML = `
    <h3>Lottery</h3>
    <p>Your Numbers:</p>
    <div>${Math.floor(Math.random()*9999)}</div>
  `;
};

window.win = (c) => {
  coins += c;
  save();
};