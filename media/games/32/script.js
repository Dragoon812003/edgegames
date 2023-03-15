const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const restartBtn = document.getElementById("restart-button");
const mainMenuScreen = document.getElementById("main-menu");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const birdImage = new Image()
const obstacleImage = new Image()
const backgroundImage = new Image()

birdImage.src = "https://edgegames.pythonanywhere.com/file/flappy-birds/bird.png"
backgroundImage.src = "https://edgegames.pythonanywhere.com/file/flappy-birds/background.png"
obstacleImage.src = "https://edgegames.pythonanywhere.com/file/flappy-birds/obstacle.png"

const pointSFX = new Audio('https://edgegames.pythonanywhere.com/file/flappy-birds/point.mp3')
const hitSFX = new Audio('https://edgegames.pythonanywhere.com/file/flappy-birds/hit.mp3')
const backgroundMusic = new Audio('https://edgegames.pythonanywhere.com/file/flappy-birds/FlappyBirdsBackgroundMusic.mp3')

backgroundMusic.loop = true

const bird = {
    x: 75,
    y: canvas.height / 2,
    width: 70,
    height: 50,
    velocity: 0,
    gravity: 0.5,
    jump: 10,

    draw: function() {
        ctx.drawImage(birdImage, this.x, this.y, this.width, this.height)
    },

    update: function() {
      this.velocity += this.gravity;
      this.y += this.velocity;
    },

    flap: function() {
      this.velocity = -this.jump;
    }
};

const pipes = [];
const gap = 175;
const pipeWidth = 75;
const pipeSpeed = 4;
const pipeCreationSpeed = 100

function createPipe() {
    let randomPos = Math.floor(Math.random() * (canvas.height - gap * 2)) + gap
    const pipe = {
      x: canvas.width,
      y: randomPos,
      width: pipeWidth,
      height: canvas.height - this.y,
  
      topPipe: {
          x: canvas.width,
          y: 0,
          width: pipeWidth,
          height: randomPos,
      },
  
      bottomPipe: {
          x: canvas.width,
          y: randomPos + gap,
          width: pipeWidth,
          height: canvas.height - (randomPos + gap),
      },
  
      draw: function() {
          ctx.drawImage(obstacleImage, this.x, 0, this.width, this.y)
          ctx.save();
          ctx.translate(this.x + this.width / 2, this.y + gap + (canvas.height - (this.y + gap)) / 2);
          ctx.rotate(Math.PI);
          ctx.drawImage(obstacleImage, -this.width / 2, -(canvas.height - (this.y + gap)) / 2, this.width, canvas.height - (this.y + gap));
          ctx.restore();
      },
  
      update: function() {
          this.x -= pipeSpeed;
          this.topPipe.x = this.x;
          this.bottomPipe.x = this.x;
      }
  
    };
    
    pipes.push(pipe);
}

function removePipe() {
	if (pipes.length > 0 && pipes[0].x + pipeWidth < 0) {
		pipes.shift();
	}
}

let score = 0;
let gameOver = false;

function update() {
    bird.update();
    
    pipes.forEach(pipe => {
        pipe.update();
        if (pipe.x + pipeWidth < bird.x && !pipe.passed) {
            pipe.passed = true;
            score++;
            pointSFX.play()
        }

        if (collisionDetection(pipe.topPipe, bird) || collisionDetection(pipe.bottomPipe, bird))  {
            gameOverfunc()
        }

        if (bird.y < 0 || bird.y + bird.height > canvas.height) {
            gameOverfunc()
        }
    });
}

removePipe();

if (bird.y + bird.radius > canvas.height || bird.y - bird.radius < 0) {
    gameOver = true;
}

function draw() {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height)

    bird.draw();

    pipes.forEach(pipe => {
        pipe.draw();
    });

    ctx.fillStyle = "black";
    ctx.font = "36px Arial";
    ctx.fillText(`Score: ${score}`, 10, 50);

    if (gameOver) {
        ctx.fillStyle = "black";
        ctx.font = "48px Arial";
        ctx.fillText("Game Over", canvas.width / 2 - 120, canvas.height / 2);
    }
}

let counter = 0
function loop() {
    update();
    draw();

	if (counter % pipeCreationSpeed == 0) {
		createPipe()
	}
	counter++

	if (!gameOver) {
		requestAnimationFrame(loop);
	}
}

function collisionDetection(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.height + rect1.y > rect2.y
}  

function restartGame() {
    bird.velocity = 0;
    bird.y = canvas.height / 2;
    score = 0;
    pipes.splice(0, pipes.length);
    gameOver = false;
    restartBtn.classList.add('hidden')
    loop()
}
  
function gameOverfunc() {
    gameOver = true
    restartBtn.classList.remove('hidden')
    hitSFX.play()
}

window.addEventListener("keydown", event => {
    if (event.keyCode == 32) {
        bird.flap();
    }
});

window.addEventListener('touchstart', () => {
    bird.flap()
})

function startGame() {
    backgroundMusic.play()
    mainMenuScreen.classList.add('hidden')
    loop();
}
  
