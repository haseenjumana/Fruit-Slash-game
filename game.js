// Game Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const timeElement = document.getElementById('time');
const gameOverElement = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');
const restartButton = document.getElementById('restart');

// Game State
let score = 0;
let timeLeft = 60;
let gameActive = true;
let fruits = [];
let lastSpawnTime = 0;
const spawnInterval = 1000; // 1 second

// Resize canvas
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Fruit Class
class Fruit {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = canvas.height + 50;
    this.speed = 2 + Math.random() * 3;
    this.radius = 30 + Math.random() * 20;
    this.type = Math.random() > 0.2 ? 'fruit' : 'bomb';
    this.color = this.type === 'fruit' ? 
      `hsl(${Math.random() * 360}, 70%, 60%)` : 'black';
    this.angle = 0;
  }

  update() {
    this.y -= this.speed;
    this.angle += 0.05;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    
    // Draw fruit or bomb
    if (this.type === 'fruit') {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Fruit details
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.beginPath();
      ctx.arc(-this.radius * 0.3, -this.radius * 0.3, this.radius * 0.1, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Bomb
      ctx.fillStyle = 'black';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = 'red';
      ctx.beginPath();
      ctx.moveTo(0, -this.radius * 0.7);
      ctx.lineTo(this.radius * 0.3, -this.radius * 0.4);
      ctx.lineTo(this.radius * 0.7, -this.radius * 0.7);
      ctx.fill();
    }
    
    ctx.restore();
  }

  isOffScreen() {
    return this.y < -this.radius * 2;
  }

  isHit(x, y) {
    const distance = Math.sqrt((x - this.x) ** 2 + (y - this.y) ** 2);
    return distance < this.radius;
  }
}

// Game Loop
function gameLoop(timestamp) {
  if (!gameActive) return;
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Spawn new fruits
  if (timestamp - lastSpawnTime > spawnInterval) {
    fruits.push(new Fruit());
    lastSpawnTime = timestamp;
  }
  
  // Update and draw fruits
  fruits = fruits.filter(fruit => {
    fruit.update();
    fruit.draw();
    return !fruit.isOffScreen();
  });
  
  // Update UI
  scoreElement.textContent = score;
  timeElement.textContent = Math.ceil(timeLeft);
  
  // Countdown
  timeLeft -= 1/60; // 60fps
  
  if (timeLeft <= 0) {
    endGame();
  }
  
  requestAnimationFrame(gameLoop);
}

// Touch Controls
const hammer = new Hammer(canvas);
hammer.get('swipe').set({ direction: Hammer.DIRECTION_ALL });

hammer.on('swipe', (e) => {
  if (!gameActive) return;
  
  const x = e.center.x;
  const y = e.center.y;
  
  // Create slash effect
  const slash = document.createElement('div');
  slash.className = 'swipe-effect';
  slash.style.left = `${x}px`;
  slash.style.top = `${y}px`;
  document.body.appendChild(slash);
  
  setTimeout(() => {
    slash.remove();
  }, 500);
  
  // Check fruit hits
  fruits.forEach((fruit, index) => {
    if (fruit.isHit(x, y)) {
      if (fruit.type === 'fruit') {
        score += Math.floor(fruit.radius / 10);
      } else {
        score = Math.max(0, score - 10);
      }
      fruits.splice(index, 1);
    }
  });
});

// Game Controls
function endGame() {
  gameActive = false;
  finalScoreElement.textContent = score;
  gameOverElement.style.display = 'flex';
}

restartButton.addEventListener('click', () => {
  score = 0;
  timeLeft = 60;
  fruits = [];
  gameActive = true;
  gameOverElement.style.display = 'none';
  requestAnimationFrame(gameLoop);
});

// Start game
requestAnimationFrame(gameLoop);