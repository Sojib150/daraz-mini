let coins = 100;
const rewards = [0, 5, 10, 20, 50, 0];

const coinText = document.getElementById("coins");
const result = document.getElementById("result");
const wheel = document.getElementById("wheel");

function spin() {
  if (coins < 10) {
    result.innerText = "❌ Not enough coins";
    return;
  }

  coins -= 10;
  update();

  const reward = rewards[Math.floor(Math.random() * rewards.length)];

  wheel.style.transform = `rotate(${Math.random()*360 + 720}deg)`;

  setTimeout(() => {
    coins += reward;
    update();

    result.innerText =
      reward > 0
        ? `🎉 You won ${reward} coins`
        : `😢 No luck! Try again`;
  }, 800);
}

function update() {
  coinText.innerText = coins;
}