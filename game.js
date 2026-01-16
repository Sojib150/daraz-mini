let coins = 100;

const coinText = document.getElementById("coins");
const screen = document.getElementById("screen");

function show(html) {
  screen.classList.remove("hidden");
  screen.innerHTML = html;
}

function updateCoins() {
  coinText.innerText = coins;
}

/* PLAY GAME */
function playGame() {
  show(`
    <h3>🎮 Simple Game</h3>
    <p>Click to win coins</p>
    <button onclick="win(10)">Win 10 Coins</button>
  `);
}

/* SPIN */
function spin() {
  const winCoin = Math.floor(Math.random() * 50) + 1;
  coins += winCoin;
  updateCoins();

  show(`<h3>🎰 You won ${winCoin} coins!</h3>`);
}

/* WATCH AD */
function watchAd() {
  show(`
    <h3>📺 Watch Ad</h3>
    <p>Wait 15 seconds</p>
    <button onclick="finishAd()">Finish Ad</button>
  `);
}

function finishAd() {
  coins += 20;
  updateCoins();
  show(`<h3>✅ Ad completed! +20 Coins</h3>`);
}

/* DAILY */
function daily() {
  coins += 30;
  updateCoins();
  show(`<h3>🎁 Daily Bonus +30 Coins</h3>`);
}

/* LOTTERY */
function lottery() {
  const number = Math.floor(1000 + Math.random() * 9000);
  show(`
    <h3># Lottery</h3>
    <p>Your Lucky Number:</p>
    <h2>${number}</h2>
  `);
}

function win(n) {
  coins += n;
  updateCoins();
  show(`<h3>🎉 You earned ${n} coins</h3>`);
}