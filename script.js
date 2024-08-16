// Cria um objeto de áudio para a música de fundo
const backgroundMusic = new Audio('sounds/background-music.mp3');
backgroundMusic.volume = 0.5;
backgroundMusic.loop = true;

// Função para iniciar a música
function startMusic() {
    backgroundMusic.play().catch(error => {
        console.error('Não foi possível reproduzir a música:', error);
    });
}

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const box = 40;  // Tamanho das células

let snake = [];
snake[0] = { x: 9 * box, y: 10 * box };
let food = { x: Math.floor(Math.random() * (canvas.width / box)) * box, y: Math.floor(Math.random() * (canvas.height / box)) * box };
let score = 0;
let d;
let interval;
let lives = 3;
let level = 1;
let fruitsNeeded = 1;
let gamePaused = false;
let gameStarted = false;

const snakeImg = new Image();
snakeImg.src = 'images/snake.png';

const foodImg = new Image();
foodImg.src = 'images/food.png';

document.addEventListener('keydown', direction);

function direction(event) {
    if (event.key === 'Enter') {
        if (!gameStarted) {
            startGame();
            gameStarted = true;
        }
    } else if (event.key === 'Shift') {
        if (interval) pauseGame();
    } else if (event.key === 'Control') {
        if (interval) restartGame();
    } else {
        if (event.key === 'ArrowRight' && d !== 'LEFT') d = 'RIGHT';
        else if (event.key === 'ArrowLeft' && d !== 'RIGHT') d = 'LEFT';
        else if (event.key === 'ArrowUp' && d !== 'DOWN') d = 'UP';
        else if (event.key === 'ArrowDown' && d !== 'UP') d = 'DOWN';
    }
}

function startGame() {
    level = 1;
    fruitsNeeded = 1;
    interval = setInterval(draw, 100);
    resetGame();
    document.getElementById('startScreen').style.display = 'none';
}

function pauseGame() {
    clearInterval(interval);
    gamePaused = true;
}

function restartGame() {
    clearInterval(interval);
    interval = setInterval(draw, 100);
    resetGame();
    gamePaused = false;
}

function resetGame() {
    lives = 3;
    score = 0;
    snake = [];
    snake[0] = { x: 9 * box, y: 10 * box };
    food = { x: Math.floor(Math.random() * (canvas.width / box)) * box, y: Math.floor(Math.random() * (canvas.height / box)) * box };
    d = null; // Reset direction
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.fillText(`Lives: ${lives}`, 10, 30);
    ctx.fillText(`Score: ${score}`, 10, 60);
    ctx.fillText(`Level: ${level}`, 10, 90);

    // Draw food
    ctx.drawImage(foodImg, food.x, food.y, box, box);

    // Draw snake
    for (let i = 0; i < snake.length; i++) {
        ctx.drawImage(snakeImg, snake[i].x, snake[i].y, box, box);
    }

    // Snake movement
    if (!d) return; // Prevent movement if no direction is set

    let headX = snake[0].x;
    let headY = snake[0].y;

    if (d === 'LEFT') headX -= box;
    if (d === 'RIGHT') headX += box;
    if (d === 'UP') headY -= box;
    if (d === 'DOWN') headY += box;

    // Wrap-around logic
    if (headX >= canvas.width) headX = 0;
    if (headX < 0) headX = canvas.width - box;
    if (headY >= canvas.height) headY = 0;
    if (headY < 0) headY = canvas.height - box;

    const newHead = { x: headX, y: headY };

    if (collision(newHead)) {
        lives--;
        if (lives > 0) {
            resetGame();
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'white';
            ctx.font = '50px Arial';
            ctx.fillText('GAME OVER', canvas.width / 2 - 150, canvas.height / 2);
            clearInterval(interval);
            interval = null;
            document.getElementById('startScreen').style.display = 'flex';
        }
        return;
    }

    snake.unshift(newHead);

    // Check collision with food
    if (headX === food.x && headY === food.y) {
        score++;
        snake.push({}); // Increase snake length only when food is eaten
        food = { x: Math.floor(Math.random() * (canvas.width / box)) * box, y: Math.floor(Math.random() * (canvas.height / box)) * box };

        // Increase level and number of fruits needed
        if (snake.length - 1 >= fruitsNeeded) {
            level++;
            if (level <= 3) {
                fruitsNeeded++;
                generateFood();
            }
        }
    } else {
        // Remove the tail if food is not eaten
        snake.pop();
    }

    // Game over conditions
    if (headX < 0 || headX >= canvas.width || headY < 0 || headY >= canvas.height) {
        lives--;
        if (lives > 0) {
            resetGame();
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'white';
            ctx.font = '50px Arial';
            ctx.fillText('GAME OVER', canvas.width / 2 - 150, canvas.height / 2);
            clearInterval(interval);
            interval = null;
            document.getElementById('startScreen').style.display = 'flex';
        }
    }
}

function collision(head) {
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    return false;
}

function generateFood() {
    food = { x: Math.floor(Math.random() * (canvas.width / box)) * box, y: Math.floor(Math.random() * (canvas.height / box)) * box };
}