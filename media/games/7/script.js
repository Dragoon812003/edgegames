window.onload = function() {
let game = document.getElementById("game");
let player = document.getElementById("character");
let score = document.getElementById("score");
let gameOverScreen = document.getElementById("gameOverScreen");
let holes = document.getElementsByClassName('hole');
let blocks = document.getElementsByClassName('block');
let speedOfBlock = 2;
let button = document.getElementById("button");
let posOfBird = 200;
let speedOfBird = 0;
let jump = -10;
let gravity = 0.3;
let scoreValue = 0;
var hit = new Audio('http://127.0.0.1:8000/file/flappy-birds/hit.mp3');
var point = new Audio('http://127.0.0.1:8000/file/flappy-birds/point.mp3');
var backgroundMusic = new Audio('http://127.0.0.1:8000/file/flappy-birds/FlappyBirdsBackgroundMusic.mp3');

function getRandomNumber(min, max) {
    return Math.floor(Math.random()*(max - min) + min);
}

window.addEventListener('keydown', event => {
    if (event.keyCode == 32) {
        speedOfBird = jump;
        backgroundMusic.play();
        backgroundMusic.loop = true;
    }
})

window.addEventListener('click', function () {
    speedOfBird = jump;
    backgroundMusic.play();
    backgroundMusic.loop = true;
})

button.addEventListener('click', function() {
    gameOverScreen.style.display = 'none';
    gravity = 0.3;
    speedOfBird = 0;
    posOfBird = 200;
    scoreValue = 0;
    score.innerText = "Score: " + scoreValue;
    setTimeout(function() {
        jump = -10;
    }, 10);
})

const blockAndHole = setInterval(function() {
     var block = document.createElement('div');
     game.appendChild(block);
     block.classList.add('block')

}, 2000)


// Game Loop

setInterval(function () {
    // collisions
blocks = document.getElementsByClassName('block');
holes = document.getElementsByClassName('hole');
for (let i = 0; i < blocks.length; i++) {
    if (player.getBoundingClientRect().x > holes[i].getBoundingClientRect().x && player.getBoundingClientRect().x < holes[i].getBoundingClientRect().x + 43) {
        if (player.getBoundingClientRect().y > holes[i].getBoundingClientRect().y && player.getBoundingClientRect().y < holes[i].getBoundingClientRect().y + 140) {
             
        } else {
           gameOverScreen.style.display = '';
           gravity = 0;
           speedOfBird = 0;
           jump = 0;
           navigator.vibrate(250)
           hit.play();
        }
        
    }

    if (player.getBoundingClientRect().x > holes[i].getBoundingClientRect().x + 43) {
        scoreValue++;
        score.innerText = "Score: " + scoreValue;
        point.play();
    }

    //Moving Block and Hole
    let blockInd = blocks[i];
    let posOfBlock = blockInd.getBoundingClientRect().x;
    posOfBlock -= speedOfBlock;
    blockInd.style.left = posOfBlock + "px";
    if (posOfBlock < 50) {
        game.parentElement.removeChild('block')
    }

    let holeInd = holes[i];
    let posOfHole = holekInd.getBoundingClientRect().x;
    posOfHole -= speedOfHole;
    holekInd.style.left = holeOfBlock + "px";
    if (posOfHole < 50) {
        game.parentElement.removeChild('hole')
    }    

}

    if (player.getBoundingClientRect.y < 0 || player.getBoundingClientRect.y > window.innerHeight + 30) {
           gameOverScreen.style.display = '';
           gravity = 0;
           speedOfBird = 0;
           jump = 0;
           block.style.animation = 'none';
           hole.style.animation = 'none';

    }


    if(speedOfBird > 0) {
        player.classList.remove('go-up');
        player.classList.add('go-down');
    }
    if(speedOfBird < 0) {
        player.classList.remove('go-down');
        player.classList.add('go-up');
    }
   speedOfBird += gravity
   posOfBird += speedOfBird;
   player.style.top = posOfBird + "px";

}, 1000/60);
}
