// Game Variables
var game = document.getElementById('game');
var playBtn = document.getElementById('playBtn');
var gameOverScreen = document.getElementById('gameOverScreen')
var accuracy = document.getElementById('accuracy');
var startBtn = document.getElementById('start-btn');
var mainMenu = document.getElementById('main-menu');
var scoresElem = document.getElementById('scores-div')
var leaderboardScreen = document.getElementById('leaderboard-screen')
var mainMenuScreenImg = document.getElementById('main-menu-screen-img');
var highScoreMenuText = document.getElementById('high-score-menu-text');
var gameOverText = document.getElementById('game-over-text');
var gameOver = true;
var BackgroundMusic = new Audio('https://edgegames.pythonanywhere.com/file/space-invaders/BackgroundMusic.mp3');
var explosion = new Audio('https://edgegames.pythonanywhere.com/file/space-invaders/explosion.mp3');
var laser = new Audio('https://edgegames.pythonanywhere.com/file/space-invaders/laser.mp3');
var gameOverSound = new Audio('https://edgegames.pythonanywhere.com/file/space-invaders/gameOverSound.mp3')
var noOfTimesBulletTriggered = 0;
var enemyCreationSpeed = 1000;
var maxEnemies = 15
var lastEnemyCreationSpeed = enemyCreationSpeed;
var fastGameSpeed = 10000;
var slowGameSpeed = 1000;
document.addEventListener('contextmenu', event => event.preventDefault());

BackgroundMusic.loop = true

// Score
var score = document.getElementById("score");
var scoreValue = 0;

//Start Game

function handleDisplayScore(data) {
    if (data.is_authenticated) {
        highScoreMenuText.innerHTML = `Welcome ${data.username} <br> Your High Score: ${data.highest_score}`
    }
}

function handleHighScores(data) {
    highScores = data.high_scores
    
    for (score of highScores) {
        scoresElem.innerHTML += `<div class="score-item">${score.rank}) ${score.user}: ${score.score}</div>`
    }
}

get_high_scores(10, handleHighScores)

function showLeaderboard() {
    mainMenu.classList.add('hidden')
    leaderboardScreen.classList.remove('hidden')
}

function handleLeaderboardBack() {
    leaderboardScreen.classList.add('hidden')
    mainMenu.classList.remove('hidden')
}

get_info(handleDisplayScore)

startBtn.addEventListener('click', function () {
    mainMenu.classList.add('hidden')
    mainMenuScreenImg.style.width = "0px"
    leaderboardScreen.style.display = "none"
    game.classList.remove('hidden')
    gameOver = false
    BackgroundMusic.play()
})

// Play Again

function resetRound() {
    gameOver = false;
    gameOverScreen.style.display = 'none';
    let allEnemy = document.getElementsByClassName('enemy');
    player.style.left = 50 + "vw";
    scoreValue = 0;
    accuracyValue = 100;
    noOfTimesBulletTriggered = 0;
    score.innerText = "Score: " + scoreValue;
    for (let i = 0; i < allEnemy.length; i++) {
        let enemyAgainInd = allEnemy[i]
        enemyAgainInd.parentNode.removeChild(enemyAgainInd);
        i--;
    }
}

playBtn.addEventListener('click', resetRound)

// Player Variables
var player = document.getElementById('player');
var playerPos = player.getBoundingClientRect().x;
var playerInfo = player.getBoundingClientRect();
var playerXspeed = 10;
var speedOfPlayer = 0;

// Player Controlles
window.addEventListener('keydown', (event) => {
    if (event.keyCode == 37 && gameOver == false) {
        speedOfPlayer = -playerXspeed;
        BackgroundMusic.loop = true;
    }

    if (event.keyCode == 39 && gameOver == false) {
        speedOfPlayer = playerXspeed;
        BackgroundMusic.loop = true;
    }
})

window.addEventListener('keyup', (event) => {
    if (event.keyCode == 37) {
        speedOfPlayer = 0;
    }

    if (event.keyCode == 39) {
        speedOfPlayer = 0;
    }
})

//Enemy
var enemySpeedY = Math.random()*0.5 + 0.5;
var enemySpeedX = Math.random()*2 + 2;
var enemySide = []
var line = document.getElementById("dottedLine");

let time = 0
setInterval(enemyLoop, enemyCreationSpeed)

function enemyLoop() {
    let enemies = document.getElementsByClassName('enemy');
    if (gameOver == false && enemies.length < maxEnemies) {
    var enemyCreate = document.createElement("div");
    enemyCreate.classList.add("enemy");
    enemyCreate.style.left = Math.random()*window.innerWidth + "px";
    enemyCreate.style.top = -50 + "px";
    game.appendChild(enemyCreate)
    }
}

function handleScore(data) {
    if (data.is_highest_score) {
        gameOverText.innerText = "Congratulations! You set a global High Score!"
        gameOverText.classList.add("size-50")
    } else if (data.is_players_highest_score) {
        gameOverText.innerText = "Congratulations! You set your personal Best Score!"
    }
}

var enemyMoving = setInterval(function () {
    var enemy = document.getElementsByClassName("enemy");


    if (enemy != undefined && gameOver == false) {
        for (let i = 0; i < enemy.length; i++) {
            let enemyInd = enemy[i];
            let enemyPosY = enemyInd.getBoundingClientRect().y;
            enemyInd.style.top = enemyPosY + enemySpeedY + "px";
            
            enemySide.push(Math.random()*10 - Math.random()*10);
            let enemyPosX = enemyInd.getBoundingClientRect().x;
            if (enemySide[i] > 0) {
                enemySide[i] = 1
                enemyInd.style.left = enemyPosX + enemySide[i]*enemySpeedX + "px"; 
            } else {
                enemySide[i] = -1
                enemyInd.style.left = enemyPosX + enemySide[i]*enemySpeedX + "px";
            }

            //Enemy Collision
            if (enemyPosX <= 0) {
                if (enemySide[i] < 0) {
                    enemySide[i] = 1 
                } else {
                    enemySide[i] = -1;
                }
                enemyInd.style.left = enemyPosX + enemySide[i]*enemySpeedX + "px";
            }
            
            if (enemyPosX >= window.innerWidth - 30) {
                if (enemySide[i] < 0) {
                    enemySide[i] = 1  
                } else {
                    enemySide[i] = -1;
                }
                enemyInd.style.left = enemyPosX + enemySide[i]*enemySpeedX + "px";
            }

            //Game Over
            if (enemyPosY > line.getBoundingClientRect().bottom) {
                gameOver = true;
                gameOverScreen.style.display = '';
                gameOverSound.play()
                add_score(scoreValue, handleScore)
            }
        }

    }
},1000/60)

// Bullets
window.addEventListener('keydown', (event) => {
    if (event.keyCode == 32 && gameOver == false) {
        bulletCreate = document.createElement("div");
        bulletCreate.classList.add("bullet");
        game.appendChild(bulletCreate)
        bulletCreate.style.left = player.getBoundingClientRect().x + "px";
        bulletCreate.style.top = player.getBoundingClientRect().y + "px";
        noOfTimesBulletTriggered++;
        BackgroundMusic.play();
        BackgroundMusic.loop = true;
        laser.play();
    }
})

// Game Loop
setInterval(function () {
   // Player
   playerPos += speedOfPlayer;
   player.style.left = playerPos + "px";

   if (playerPos <= 0) {
       speedOfPlayer = 0;
       playerPos = 0
   }

   if (playerPos >= window.innerWidth - playerInfo.width) {
    speedOfPlayer = 0;
    playerPos = window.innerWidth - playerInfo.width;
}

// Bullets
let bullet = document.getElementsByClassName('bullet');

if (bullet != undefined && gameOver == false) {
    for (let i = 0; i < bullet.length; i++) {
        let bulletInd = bullet[i];
        bulletInd.style.top = bulletInd.getBoundingClientRect().y - 20 + "px";
    }
}

// Bullet Enemy Collision 
let enemyColl = document.getElementsByClassName("enemy")
for (let i = 0; i < enemyColl.length; i++) {
    for (let j = 0; j < bullet.length; j++) {
        let enemyCollInd = enemyColl[i]
        let bulletCollInd = bullet[j]
        let bulletInfo = bulletCollInd.getBoundingClientRect();
        let enemyInfo = enemyCollInd.getBoundingClientRect();
        if (Math.sqrt((bulletInfo.x - enemyInfo.x)*(bulletInfo.x - enemyInfo.x) + (bulletInfo.y - enemyInfo.y)*(bulletInfo.y - enemyInfo.y)) <= 30) {
                enemyCollInd.parentNode.removeChild(enemyCollInd)
                bulletCollInd.parentNode.removeChild(bulletCollInd)
                scoreValue++;
                score.innerText = "Score: " + scoreValue;
                explosion.play();
            }
        if (bulletInfo.top < -100) {
            bulletCollInd.parentNode.removeChild(bulletCollInd)
        }    
        if (enemyInfo.top > 2000) {
            enemyCollInd.parentNode.removeChild(enemyCollInd)
        } 
    }
}

//Accuracy
if (noOfTimesBulletTriggered == 0) {
    accuracyValue = 100
    } else {
        var accuracyValue = scoreValue/noOfTimesBulletTriggered*100;
    }
    accuracy.innerText = "Accuracy: " + Math.trunc(accuracyValue) + "%";

},1000/60)
