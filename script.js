// Get canvas element and its context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game settings
const gridSize = 20;
let tileCount = 20;
let score = 0;
let snake = [{ x: 10, y: 10 }];
let direction = { x: 1, y: 0 };
let food = spawnFood();
let gameOver = false;
let touchStartX = 0;
let touchStartY = 0;

const foodImage = new Image();
foodImage.src = 'food.svg';

// Load SVG images
const headImg = new Image();
headImg.src = 'snake_head.svg';
const bodyImg = new Image();
bodyImg.src = 'snake_body.svg';
const tailImg = new Image();
tailImg.src = 'snake_tail.svg';

// Resize canvas based on window size
function resizeCanvas() {
    const size = Math.min(window.innerWidth, window.innerHeight) - 40;
    canvas.width = canvas.height = size;
    tileCount = Math.floor(canvas.width / gridSize);
    if (tileCount < 5) tileCount = 5;

    console.log('Canvas resized:', canvas.width, canvas.height, 'Tile count:', tileCount);
}

// Generate food position
function spawnFood() {
    let position;
    do {
        position = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
    } while (snake.some(segment => segment.x === position.x && segment.y === position.y)); // Avoid placing food on the snake
    console.log('Food spawned at:', position);
    return position;
}

// Start the game
function startGame() {
    // Hide the start screen
    const startScreen = document.getElementById('startScreen');
    if (startScreen) {
        startScreen.style.display = 'none';
    }

    // Show the canvas
    const gameCanvas = document.getElementById('gameCanvas');
    if (gameCanvas) {
        gameCanvas.style.display = 'block';
    }

    // Reset game variables
    gameOver = false;
    snake = [{ x: 10, y: 10 }];
    direction = { x: 1, y: 0 };
    food = spawnFood();
    console.log('Game Started');

    // Start the game loop
    gameLoop();
}

// Main game loop
function gameLoop() {
    if (gameOver) return;

    // Move the snake
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    // Check for border collisions
    if (
        head.x < 0 || head.x >= tileCount ||
        head.y < 0 || head.y >= tileCount
    ) {
        head.x = (head.x + tileCount) % tileCount;
        head.y = (head.y + tileCount) % tileCount;
    } else if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        // Check for self-collision
        gameOver = true;

        // Create a game-over overlay
        const gameOverOverlay = document.createElement('div');
        gameOverOverlay.style.position = 'fixed';
        gameOverOverlay.style.top = '0';
        gameOverOverlay.style.left = '0';
        gameOverOverlay.style.width = '100%';
        gameOverOverlay.style.height = '100%';
        gameOverOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        gameOverOverlay.style.display = 'flex';
        gameOverOverlay.style.flexDirection = 'column';
        gameOverOverlay.style.justifyContent = 'center';
        gameOverOverlay.style.alignItems = 'center';
        gameOverOverlay.style.color = 'white';
        gameOverOverlay.style.zIndex = '1000';

        // Add game-over message
        const gameOverMessage = document.createElement('h1');
        gameOverMessage.innerText = 'Game Over!';
        gameOverOverlay.appendChild(gameOverMessage);

        // Add score display
        const scoreDisplay = document.createElement('p');
        scoreDisplay.innerText = 'Your Score: ' + score;
        scoreDisplay.style.fontSize = '20px';
        gameOverOverlay.appendChild(scoreDisplay);

        // Add restart button
        const restartButton = document.createElement('button');
        restartButton.innerText = 'Restart Game';
        restartButton.style.padding = '10px 20px';
        restartButton.style.fontSize = '18px';
        restartButton.style.backgroundColor = 'limegreen';
        restartButton.style.color = 'white';
        restartButton.style.border = 'none';
        restartButton.style.borderRadius = '5px';
        restartButton.style.cursor = 'pointer';
        restartButton.addEventListener('click', () => {
            document.body.removeChild(gameOverOverlay);
            startGame();
        });
        gameOverOverlay.appendChild(restartButton);

        // Append the overlay to the body
        document.body.appendChild(gameOverOverlay);
    }

    snake.unshift(head);

    // Eat food
    if (head.x === food.x && head.y === food.y) {
        food = spawnFood();
        score++;
    } else {
        snake.pop(); // don't grow
    }

    // Draw the game elements
    draw();

    setTimeout(() => requestAnimationFrame(gameLoop), 100);
}

// Draw background, snake, and food
function draw() {
    console.log('Drawing frame...');
    ctx.fillStyle = "#222";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw food (SVG image)
    ctx.drawImage(foodImage, food.x * gridSize, food.y * gridSize, gridSize, gridSize);

    // Draw snake
    for (let i = 0; i < snake.length; i++) {
        const part = snake[i];
        const px = part.x * gridSize;
        const py = part.y * gridSize;

        let img = bodyImg;
        if (i === 0) {
            img = headImg;
        } else if (i === snake.length - 1) {
            img = tailImg;
        }

        if (img.complete) {
            ctx.drawImage(img, px, py, gridSize, gridSize);
        } else {
            ctx.fillStyle = "lime";
            ctx.fillRect(px, py, gridSize, gridSize);
        }
    }
}

// Change direction based on keyboard input
function changeDirection(e) {
    switch (e.key) {
        case "ArrowUp":
            if (direction.y === 0) direction = { x: 0, y: -1 };
            break;
        case "ArrowDown":
            if (direction.y === 0) direction = { x: 0, y: 1 };
            break;
        case "ArrowLeft":
            if (direction.x === 0) direction = { x: -1, y: 0 };
            break;
        case "ArrowRight":
            if (direction.x === 0) direction = { x: 1, y: 0 };
            break;
    }
}

function handleTouchStart(e) {
    e.preventDefault(); // Prevent scrolling
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
}

function handleTouchEnd(e) {
    e.preventDefault(); // Prevent scrolling
    const touch = e.changedTouches[0];
    const touchEndX = touch.clientX;
    const touchEndY = touch.clientY;

    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;

    // Determine swipe direction
    if (Math.abs(diffX) > Math.abs(diffY)) {
        // Horizontal swipe
        if (diffX > 0 && direction.x === 0) {
            direction = { x: 1, y: 0 }; // Swipe right
        } else if (diffX < 0 && direction.x === 0) {
            direction = { x: -1, y: 0 }; // Swipe left
        }
    } else {
        // Vertical swipe
        if (diffY > 0 && direction.y === 0) {
            direction = { x: 0, y: 1 }; // Swipe down
        } else if (diffY < 0 && direction.y === 0) {
            direction = { x: 0, y: -1 }; // Swipe up
        }
    }
}

// Add event listeners
document.addEventListener("keydown", changeDirection);
document.getElementById('startButton').addEventListener("click", startGame);
canvas.addEventListener("touchstart", handleTouchStart);
canvas.addEventListener("touchend", handleTouchEnd);
// Initial resize to match screen size
resizeCanvas();
window.addEventListener("resize", resizeCanvas);
