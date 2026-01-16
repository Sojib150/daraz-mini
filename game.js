let coins = 90;

const coinsEl = document.getElementById("coins");
const gameArea = document.getElementById("gameArea");

coinsEl.innerText = coins;

function show(html) {
  gameArea.classList.remove("hidden");
  gameArea.innerHTML = html;
}

// 👇 MUST expose to window
window.playGame = function () {
  show(`
    <h3>🎮 Play Game</h3>
    <button onclick="addCoins(10)">Win 10 Coins</button>
  `);
};

window.spin = function () {
  const win = Math.floor(Math.random() * 50) + 1;
  coins += win;
  coinsEl.innerText = coins;

  show(`<h3>🎰 You won ${win} coins!</h3>`);
};

window.watchAds = function () {
  show(`
    <h3>📺 Watch Ad</h3>
    <p>Wait 15 seconds to earn 20 coins</p>
    <button onclick="addCoins(20)">Finish Ad</button>
  `);
};

window.daily = function () {
  coins += 30;
  coinsEl.innerText = coins;
  show(`<h3>🎁 Daily Bonus: +30 Coins</h3>`);
};

window.lottery = function () {
  const num = Math.floor(1000 + Math.random() * 9000);
  show(`<h3># Lottery</h3><p>Your Number: <b>${num}</b></p>`);
};

window.addCoins = function (n) {
  coins += n;
  coinsEl.innerText = coins;
  gameArea.innerHTML = `<h3>✅ +${n} coins added</h3>`;
};