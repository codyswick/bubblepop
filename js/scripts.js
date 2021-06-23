//variables

//canvas setup

const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 500; //same width and height as css

let score = 0; //current score
let winScore = 1; // score required to win level
let nextLevelScoreAdd = 1; //increase the score needed per level
let gameFrame = 0;
let gameSpeed = 1;
ctx.font = "40px Gerogia";
let gameOver = false;
let nextLevel = false;
let level = 1;
let playerSpeed = 90;
let bgMusic = new sound("sfx/bgmusic2.mp3");
docReady(function() {
    bgMusic.play()
});
const winReq = document.getElementById('winRq')

console.log(bgMusic.volume);


function docReady(fn) {
    // see if DOM is already available
    if (document.readyState === "complete" || document.readyState === "interactive") {
        // call on next available tick
        setTimeout(fn, 1);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}








//mouse input
let canvasPosition = canvas.getBoundingClientRect();
const mouse = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  click: false
}
canvas.addEventListener("mousedown", function(event) {
  mouse.click = true;
  mouse.x = event.x - canvasPosition.left;
  mouse.y = event.y - canvasPosition.top
  if (gameOver == true) {
    if (mouse.x > 351 && mouse.x < 546 && mouse.y > 183 && mouse.y < 255) {
      gameOver = false;
      nextLevel = false;
      score = 0;
      playerSpeed = 90;
      
      bgMusic.play();
      animate()
    }

  }
  if (nextLevel == true) {
    if (mouse.x > 351 && mouse.x < 546 && mouse.y > 183 && mouse.y < 255) {
      level++;
      winScore = winScore + nextLevelScoreAdd;
      gameOver = false;
      nextLevel = false;
      score = 0;
      playerSpeed = 90;
      bgMusic.play();
      animate()

    }
  }
});

canvas.addEventListener("mouseup", function(event) {
  mouse.click = false;
});

//player
const playerLeft = new Image();
playerLeft.src = "img/playerFishLeft.png"
const playerRight = new Image();
playerRight.src = "img/playerFishRight.png"
class Player {
  constructor() {
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
    this.radius = 0;
    this.angle = 20;
    this.framex = 0;
    this.framey = 0;
    this.spriteWidth = 498;
    this.spriteHeight = 327;
  }
  update() {
    const dx = this.x - mouse.x;
    const dy = this.y - mouse.y;
    const theta = Math.atan2(dy, dx)
    this.angle = theta;
    if (mouse.x != this.x) {
      this.x -= dx / playerSpeed; // change values here for movment speed
    }
    if (mouse.y != this.y) {
      this.y -= dy / playerSpeed;
    }
    if (gameFrame % 5 == 0) {
      this.framex++;
      this.framey += this.frameX == 4
        ? 1
        : 0;
      this.framex %= 4;
      this.framey %= 3;
    }
  }
  draw() { //draw the line between clicks

    ctx.fillStyle = 'red';
    ctx.beginPath(); //draw the player
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
    ctx.fillRect(this.x, this.y, this.radius, 10);

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    if (this.x >= mouse.x) {
      ctx.drawImage(playerLeft, this.framex * this.spriteWidth, this.framey * this.spriteHeight, this.spriteWidth, this.spriteHeight, 0 - 60, 0 - 50, this.spriteWidth / 4, this.spriteHeight / 4)
    } else {
      ctx.drawImage(playerRight, this.framex * this.spriteWidth, this.framey * this.spriteHeight, this.spriteWidth, this.spriteHeight, 0 - 60, 0 - 50, this.spriteWidth / 4, this.spriteHeight / 4)
    }
    ctx.restore();
  }
}
const player = new Player(); //create new player

const bubbleFull = new Image();
bubbleFull.src = "img/bubble.png";
const bubbleImage = new Image()
bubbleImage.src = "img/bubble.png"
//bubbles
const bubblesArray = [];
class Bubble {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = canvas.height + 100;
    this.radius = 50;
    this.speed = Math.random() * 5 + 1;
    this.distance;
    this.counted = false;
    this.sound = Math.random() <= 0.5
      ? "sound1"
      : "sound2";
  }
  update() {
    this.y -= this.speed;
    const dx = this.x - player.x;
    const dy = this.y - player.y
    this.distance = Math.sqrt(dx * dx + dy * dy)
  }
  draw() {

    ctx.drawImage(bubbleImage, this.x - 60, this.y - 70, this.radius * 2.5, this.radius * 2.5);

  }
}
const bubblePop1 = document.createElement("audio")
bubblePop1.src = "sfx/plop.ogg";
const bubblePop2 = document.createElement("audio")
bubblePop2.src = "sfx/pop.mp3";

function handleBubbles() {
  if (gameFrame % 50 == 0) {
    bubblesArray.push(new Bubble());
  }
  for (let i = 0; i < bubblesArray.length; i++) {
    bubblesArray[i].update();
    bubblesArray[i].draw();
    if (bubblesArray[i].y < 0 - bubblesArray[i].radius * 2) {
      bubblesArray.splice(i, 1);
      i--;
    } else if (bubblesArray[i].distance < bubblesArray[i].radius + player.radius) {

      if (!bubblesArray[i].counted) {
        if (bubblesArray[i].sound == 'sound1') {
          bubblePop1.play();
        } else {
          bubblePop2.play();
        }
        score++;
        bubblesArray[i].counted = true;
        bubblesArray.splice(i, 1);
        i--
        if (score >= winScore) {
          goNextLevel()
        }
      }
    }

  }
}
// food

const foodImage = new Image()
foodImage.src = "img/powerpill.png"
const foodArray = [];
class Food {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = canvas.height + 100;
    this.radius = 20;
    this.speed = Math.random() * 0.5 + 1;
    this.distance;
    this.counted = false;
    this.sound = Math.random() <= 0.5
      ? "sound1"
      : "sound2";
  }
  update() {
    this.y -= this.speed;
    const dx = this.x - player.x;
    const dy = this.y - player.y
    this.distance = Math.sqrt(dx * dx + dy * dy)
  }
  draw() {
    /*ctx.fillStyle = "red"
    ctx.beginPath();
    ctx.arc(this.x,this.y,this.radius, 0, Math.PI * 2);
    ctx.fill()*/

    ctx.drawImage(foodImage, this.x - 10, this.y - 10, this.radius, this.radius);

  }
}
const foodPop1 = document.createElement("audio")
foodPop1.src = "sfx/eat.mp3";
const foodPop2 = document.createElement("audio")
foodPop2.src = "sfx/eat.mp3";

function handleFood() {
  if (gameFrame % 990 == 0) {
    foodArray.push(new Food());
  }
  for (let i = 0; i < foodArray.length; i++) {
    foodArray[i].update();
    foodArray[i].draw();
    if (foodArray[i].y < 0 - foodArray[i].radius * 2) {
      foodArray.splice(i, 1);
      i--;
    } else if (foodArray[i].distance < foodArray[i].radius + player.radius) {

      if (!foodArray[i].counted) {
        if (foodArray[i].sound == 'sound1') {
          foodPop1.play();
        } else {
          foodPop2.play();
        }
        score = score + 10;
        if (!playerSpeed == 0) {
          if (playerSpeed > 10) {
            playerSpeed = playerSpeed - 10;
          }

        }

        foodArray[i].counted = true;
        foodArray.splice(i, 1);
        i--;
        if (score >= winScore) {
          goNextLevel()
        }
      }
    }

  }
}

const background = new Image();
background.src = "img/background1.png";
const bg = {
  x1: 0,
  x2: canvas.width,
  y: 0,
  width: canvas.width,
  height: canvas.height

}

//enemy

const enemyImage = new Image();
enemyImage.src = "img/enemy4.png"

class Enemy {
  constructor() {
    this.x = canvas.width + 200;
    this.y = Math.random() * (canvas.height - 150) + 90;
    this.radius = 60;
    this.speed = Math.random() * 2 + 2;
    this.frame = 0;
    this.framex = 0;
    this.framey = 0;
    this.spritewidth = 418; //width of spritesheet / number of collumns / 4
    this.spriteHeight = 397; //height of spritesheet / # rows
  }
  draw() {
    /*ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    ctx.fill();*/
    ctx.drawImage(enemyImage, this.framex * this.spritewidth, this.framey * this.spriteHeight, this.spritewidth, this.spriteHeight, this.x - 60, this.y - 70, this.spritewidth / 3, this.spriteHeight / 3)
  }
  update() {
    this.x -= this.speed;
    if (this.x < 0 - this.radius * 2) {
      this.x = canvas.width + 200;
      this.y = Math.random() * (canvas.height - 150) + 90;
      this.speed = Math.random() * 3 + 2;
    }
    if (gameFrame % 5 == 0) {
      this.framex++;
      this.framey += this.frameX == 4
        ? 1
        : 0;
      this.framex %= 4;
      this.framey %= 3;

    }
    //collision with player
    const dx = this.x - player.x;
    const dy = this.y - player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < this.radius + player.radius) {
      handleGameOver();
    }

  }

}

const enemy1 = new Enemy();
const enemy2 = new Enemy();
const enemy3 = new Enemy();

function handleEnemies() {
  if (level == 1) {
    enemy1.draw();
    enemy1.update();
  }
  if (level == 2) {
    enemy1.draw();
    enemy1.update();
    enemy2.draw();
    enemy2.update();
  } else if (level >= 3) {
    enemy1.draw();
    enemy1.update();
    enemy2.draw();
    enemy2.update();
    enemy3.draw();
    enemy3.update();
  }

}

function handleGameOver() {
  ctx.fillStyle = "white";
  ctx.fillText(`Game Over: your score is ${score}`, 190, 150);
  gameOver = true;
  Playbutton();
  bgMusic.stop()
}

function goNextLevel() {
  ctx.fillStyle = "white";
  ctx.fillText(`Level One Complete: your score is ${score}`, 190, 150);
  nextLevel = true;

  nextLevelButton();
  bgMusic.stop()
}

function nextLevelButton() {
  ctx.beginPath();
  ctx.fillStyle = "blue"
  ctx.fillRect(350, 180, 200, 75)
  ctx.fillStyle = "white";
  ctx.fillText(`Next Level`, 365, 230)
  ctx.fill();
}

function Playbutton() {

  ctx.beginPath();
  ctx.fillStyle = "blue"
  ctx.fillRect(350, 180, 200, 75)

  ctx.fillStyle = "white";
  ctx.fillText(`Play Again`, 365, 230)
  ctx.fill();

}

function handleBackground() {
  bg.x1 -= gameSpeed;
  if (bg.x1 < -bg.width)
    bg.x1 = bg.width
  ctx.drawImage(background, bg.x1, bg.y, bg.width, bg.height)
  bg.x2 -= gameSpeed;
  if (bg.x2 < -bg.width)
    bg.x2 = bg.width
  ctx.drawImage(background, bg.x2, bg.y, bg.width, bg.height)
}

// background bgMusic
function sound(src) {
  this.sound = document.createElement("audio");
  this.sound.src = src;
  this.sound.setAttribute("preload", "auto");
  this.sound.setAttribute("controls", "none");
  this.sound.style.display = "none";
  this.volume = .1;
  document.body.appendChild(this.sound);
  this.play = function() {
    this.sound.play();

  }
  this.stop = function() {
    this.sound.pause();
  }
}
//animation loop

function animate() { //animate movment to mouse click
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  handleBackground();
  handleBubbles();
  handleFood();
  player.update();
  player.draw();
  handleEnemies();
  winReq.innerHTML = (`Welcome to Level: ${level} Score ${winScore} points to complete this Level`)
  ctx.fillStyle = "black"
  ctx.fillText(`score:` + score, 20, 50)
  gameFrame++;

  if (!gameOver && !nextLevel)
    requestAnimationFrame(animate); //loop animate function

  }
animate();
window.addEventListener("resize", function() {
  canvasPosition = canvas.getBoundingClientRect();
})
