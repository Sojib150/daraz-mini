const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const W = canvas.width, H = canvas.height;
const colors = ["red","yellow","cyan","lime","orange","violet"];

let bubbles = [];
let flying = null;
let shooter;
let coins = 200;

const shootSound = document.getElementById("shootSound");
const winSound = document.getElementById("winSound");

document.getElementById("withdraw").onclick = ()=>{
  alert("Withdraw demo only 😄");
};

function randColor(){
  return colors[Math.floor(Math.random()*colors.length)];
}

function startGame(level){
  bubbles=[];
  shooter = {x:W/2,y:H-30,r:14,color:randColor()};

  for(let y=40;y<120+level*20;y+=30){
    for(let x=30;x<W;x+=40){
      bubbles.push({x,y,r:14,color:randColor()});
    }
  }
}

canvas.addEventListener("mousedown", shoot);
canvas.addEventListener("touchstart", shoot);

function shoot(e){
  if(flying) return;
  shootSound.play();

  let r = canvas.getBoundingClientRect();
  let tx = (e.touches?e.touches[0].clientX:e.clientX)-r.left;
  let ty = (e.touches?e.touches[0].clientY:e.clientY)-r.top;

  let dx = tx-shooter.x, dy = ty-shooter.y;
  let len = Math.hypot(dx,dy);

  flying = {
    x:shooter.x,y:shooter.y,
    vx:dx/len*6,vy:dy/len*6,
    r:14,color:shooter.color
  };
  shooter.color = randColor();
}

function checkMatch(x,y,color){
  let matches = bubbles.filter(b =>
    Math.hypot(b.x-x,b.y-y)<30 && b.color===color
  );
  if(matches.length>=2){
    bubbles = bubbles.filter(b=>!matches.includes(b));
    coins+=10;
    document.getElementById("coins").innerText=coins;
    winSound.play();
  }
}

function update(){
  if(flying){
    flying.x+=flying.vx;
    flying.y+=flying.vy;

    if(flying.x<14||flying.x>W-14) flying.vx*=-1;

    for(let b of bubbles){
      if(Math.hypot(flying.x-b.x,flying.y-b.y)<28){
        bubbles.push({...flying});
        checkMatch(flying.x,flying.y,flying.color);
        flying=null; break;
      }
    }
    if(flying && flying.y<20){
      bubbles.push({...flying});
      flying=null;
    }
  }
}

function draw(){
  ctx.clearRect(0,0,W,H);
  bubbles.forEach(b=>{
    ctx.beginPath();
    ctx.fillStyle=b.color;
    ctx.arc(b.x,b.y,b.r,0,Math.PI*2);
    ctx.fill();
  });

  if(flying){
    ctx.beginPath();
    ctx.fillStyle=flying.color;
    ctx.arc(flying.x,flying.y,14,0,Math.PI*2);
    ctx.fill();
  }

  ctx.beginPath();
  ctx.fillStyle=shooter.color;
  ctx.arc(shooter.x,shooter.y,14,0,Math.PI*2);
  ctx.fill();
}

function loop(){
  update(); draw();
  requestAnimationFrame(loop);
}

startGame(1);
loop();