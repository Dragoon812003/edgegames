const cvs = document.getElementById('canvas')
const ctx = cvs.getContext('2d')

const fighter1HealthBar = document.getElementById('fighter-1-health-bar-inner')
const fighter2HealthBar = document.getElementById('fighter-2-health-bar-inner')
const fighter1Score = document.getElementById('fighter-1-score')
const fighter2Score = document.getElementById('fighter-2-score')
const fighter1Attack1CooldownBar = document.getElementById('fighter-1-attack-1')
const fighter1Attack2CooldownBar = document.getElementById('fighter-1-attack-2')
const fighter2Attack1CooldownBar = document.getElementById('fighter-2-attack-1')
const fighter2Attack2CooldownBar = document.getElementById('fighter-2-attack-2')
const startBtn = document.getElementById('start-button')
const mainMenuItems = document.getElementsByClassName('main-menu-item')
const gameItems = document.getElementsByClassName('game-item')
const gameOverDisplay = document.getElementById('game-over-display')
const gameOverBtn = document.getElementById('game-over-btn')

cvs.width = window.innerWidth
cvs.height = window.innerHeight

const GRAVITY = 2
const GROUNDHEIGHT = cvs.height - 0.15549 * cvs.height

let mainMenu = true
let canMove = true
let lastTime, delta
let isroundOver = false
let AILastAttack = 0
let gameStarted = false

const wizardAnimationStates = [
    {
        name: 'idle',
        frames: 8,
    },
    {
        name: 'run',
        frames: 7,
    },
    {
        name: 'jump',
        frames: 2,
    },
    {
        name: 'attack-1',
        frames: 7,
    },
    {
        name: 'attack-2',
        frames: 7,
    },{
        name: 'hit',
        frames: 3,
    },{
        name: 'death',
        frames: 7,
    },
];

const warriorAnimationStates = [
    {
        name: 'idle',
        frames: 10,
    },
    {
        name: 'run',
        frames: 8,
    },
    {
        name: 'jump',
        frames: 1,
    },
    {
        name: 'attack-1',
        frames: 7,
    },
    {
        name: 'attack-2',
        frames: 7,
    },{
        name: 'hit',
        frames: 3,
    },{
        name: 'death',
        frames: 7,
    },
];

let fighter_1_attack_1 = {
    name: "Fireball",
    no: 0,
    damage: 10,
    range: [100, 200],
    cooldown: 500,
    key: 16,
    player: 1,
    animation: "attack-1",
    lastAttack: 500,
}

let fighter_1_attack_2 = {
    name: "Fire Blast",
    no: 1,
    damage: 30,
    range: [100, 200],
    cooldown: 10000,
    key: 90,
    player: 1,
    animation: "attack-2",
    lastAttack: 10000,
}

let fighter_2_attack_1 = {
    name: "Sword Attack",
    no: 0,
    damage: 10,
    range: [100, 200],
    cooldown: 500,
    key: 16, 
    player: 2,
    animation: "attack-1",
    lastAttack: 500,
}

let fighter_2_attack_2 = {
    name: "Sword Sweep",
    no: 1,
    damage: 40,
    range: [100, 200],
    cooldown: 10000,
    key: 90,
    player: 2,
    animation: "attack-2",
    lastAttack: 10000,
}

const BgImageBackground = new Image()
BgImageBackground.src = "https://edgegames.pythonanywhere.com/file/castle-fighter-2/background.png"
BgImageBackground.loaded = false

const BgImageForeground = new Image()
BgImageForeground.src = "https://edgegames.pythonanywhere.com/file/castle-fighter-2/foreground.png"
BgImageForeground.loaded = false

const playerImage = new Image();
playerImage.src = 'https://edgegames.pythonanywhere.com/file/castle-fighter-2//wizard.png';

const willainImage = new Image()
willainImage.src = 'https://edgegames.pythonanywhere.com/file/castle-fighter-2/warrior.png'

const backgroundMusic = new Audio("https://edgegames.pythonanywhere.com/file/castle-fighter-2/background_music.mp3")
const magicSFX = new Audio("https://edgegames.pythonanywhere.com/file/castle-fighter-2/magic.wav")
const swordSFX = new Audio("https://edgegames.pythonanywhere.com/file/castle-fighter-2/sword.wav")

backgroundMusic.loop = true

BgImageBackground.addEventListener('load', () => {
    BgImageBackground.loaded = true
})

BgImageForeground.addEventListener('load', () => {
    BgImageForeground.loaded = true
})

function isCollision(box_1, box_2) {
    return box_1.x < box_2.x + box_2.width && box_1.x + box_1.width > box_2.x && box_1.y < box_2.y + box_2.height && box_1.height + box_1.y > box_2.y
}

class Fighter{
    constructor(player, name, x, y, image, animationStates, attacks, healthBar, scoreBar, spriteSize, offset, scale) {
        this.player = player
        this.name = name
        this.image = image
        this.width = 80
        this.height = 180
        this.x = x
        this.y = y
        this.speed = 0
        this.constSpeed = 5
        this.jumpSpeed = 40
        this.speedX = 0
        this.speedY = 0
        this.delta = 0
        this.jumping = false
        this.spriteSize = spriteSize
        this.scale = scale
        this.offset = [offset[0] * this.scale, offset[1] * this.scale]
        this.frameX = 0
        this.frameY = 0
        this.genFrame = 0
        this.staggerFrame = 8
        this.gameFrame = 0
        this.spriteAnimations = []
        this.animationState = "idle"
        this.flip = false
        this.attacks = attacks
        this.attacking = false
        this.health = 500
        this.healthBar = healthBar
        this.score = 0
        this.scoreBar = scoreBar
        this.hasCountedScore = false
        this.isDead = false
        this.isGettingHit = false

        animationStates.forEach((state, index) => {
            let frames = {
                loc: []
            }
            for (let j = 0; j < state.frames; j++) {
                let positionX = j*this.spriteSize;
                let positionY = index*this.spriteSize;
                frames.loc.push({x: positionX, y: positionY,});
                this.spriteAnimations[state.name] = frames;
            }
        })
    }

    draw () {
        let position = Math.floor(this.gameFrame/this.staggerFrame) % this.spriteAnimations[this.animationState].loc.length;
        this.frameX = this.spriteSize*position;
        this.frameY = this.spriteAnimations[this.animationState].loc[position].y;
        if (this.flip) {
            ctx.save()
            ctx.scale(-1, 1);  
            ctx.drawImage(this.image, this.frameX, this.frameY, this.spriteSize, this.spriteSize, -this.x - this.offset[0] - this.width, this.y - this.offset[1], this.spriteSize * this.scale, this.spriteSize * this.scale);
            ctx.restore()
        } else {
            ctx.drawImage(this.image, this.frameX, this.frameY, this.spriteSize, this.spriteSize, this.x - this.offset[0], this.y - this.offset[1], this.spriteSize * this.scale, this.spriteSize * this.scale);
        }

        if (this.animationState == "attack-1" || this.animationState == "attack-2") {
            if (position + 1 >= this.spriteAnimations[this.animationState].loc.length) {
                this.frameX = 0
                this.animationState = "idle"
                this.attacking = false
            }
        }

        if (this.animationState == "hit") {
            if (position + 1 >= this.spriteAnimations[this.animationState].loc.length) {
                this.frameX = 0
                this.animationState = "idle"
                this.isGettingHit = false
            } else {
                this.isGettingHit = true
            }
        }

        if (this.animationState != "death") {
            this.gameFrame++
        } else {
            if (position + 1 != this.spriteAnimations[this.animationState].loc.length) this.gameFrame++
        }
    }

    move(opponent) {

        window.addEventListener('keydown', (event) => {
            if (!this.isDead && !opponent.isDead && gameStarted) {
                if (event.keyCode == 37) {
                    this.speedX = -this.constSpeed
                    this.frameX = 0
                    this.animationState = "run"
                } else if (event.keyCode == 39) {
                    this.speedX = this.constSpeed
                    this.frameX = 0
                    this.animationState = "run"
                }

                if (event.keyCode == 32 && !this.jumping) {
                    this.jumping = true
                    this.speedY = -this.jumpSpeed
                    this.frameX = 0
                    this.animationState = "jump"
                }
            }
        })

        window.addEventListener('keyup', (event) => {
            if (event.keyCode == 37 || event.keyCode == 39) {
                this.speedX = 0
                this.frameX = 0
                this.animationState = "idle"
            }
        })
    }

    handleAttack (opponent, attack) {
        let nowTime = Date.now()
        if (nowTime - attack.lastAttack > attack.cooldown) {
            attack.lastAttack = nowTime
            this.attacking = true
            let thisRect = {}

            if (this.flip) {
                thisRect = {x: this.x - attack.range[0], y: this.y, width: attack.range[0], height: attack.range[1]}
            } else {
                thisRect = {x: this.x + this.width, y: this.y, width: attack.range[0], height: attack.range[1]}
            }

            this.frameX = 0
            this.animationState = attack.animation
            if (isCollision(thisRect, opponent)) {
                if (opponent.attacking) {
                    opponent.health -= 2 * attack.damage
                } else {
                    opponent.health -= attack.damage
                }
                opponent.animationState = "hit"
                opponent.healthBar.style.width = `${opponent.health / 5}%`
                if (opponent.health <= 0) {
                    opponent.animationState = "death"
                    opponent.healthBar.style.width = "0px"
                    if (!this.hasCountedScore) {
                        this.score++
                        this.scoreBar.innerText = this.score
                        this.hasCountedScore = true
                        opponent.isDead = true
                        gameStarted = false
                        if (this.score >= 3 || (this.score == 2 && opponent.score == 0)) {
                            gameOver(this)
                        } else {
                            setTimeout(function () {
                                countdown()
                            }, 3000)
                        }
                    }
                }
            }

            if (this.player == 1) {
                magicSFX.play()
            } else {
                swordSFX.play()
            }
        }
    }

    attack(opponent) {
        for (let attack of this.attacks) {
            window.addEventListener('keydown', (event) => {
                if (event.keyCode == attack.key && gameStarted && !opponent.isDead) {
                    this.handleAttack(opponent, attack)
                }
            })
        }  
    }

    update (opponent) {
        if (this.x >= 0 && this.x + this.width <= cvs.width) {
            this.x += this.speedX
        } else {
            if (this.x < 0) this.x = 0
            else if (this.x + this.width > cvs.width) this.x = cvs.width - this.width
        }

        if (this.y + this.height < GROUNDHEIGHT) {
            this.speedY += GRAVITY
            this.y += this.speedY
        } else {
            this.y = GROUNDHEIGHT - this.height
            this.jumping = false

            if (this.speedY < 0) {
                this.y += this.speedY
            }

            if (this.jumping) {
                this.frameX = 0
                this.animationState = "idle"
            }
        }

        if(this.x > opponent.x + opponent.width) {
            this.flip = true
        } else if (this.x + this.width < opponent.x) {
            this.flip = false
        }

        let nowTime = Date.now()
        fighter1Attack1CooldownBar.style.width = `${(nowTime - fighter_1_attack_1.lastAttack) * 100 / fighter_1_attack_1.cooldown}%`
        fighter1Attack2CooldownBar.style.width = `${(nowTime - fighter_1_attack_2.lastAttack) * 100 / fighter_1_attack_2.cooldown}%`
        fighter1Attack1CooldownBar.style.right = "25px"

        fighter2Attack1CooldownBar.style.width = `${(nowTime - fighter_2_attack_1.lastAttack) * 100 / fighter_2_attack_1.cooldown}%`
        fighter2Attack2CooldownBar.style.width = `${(nowTime - fighter_2_attack_2.lastAttack) * 100 / fighter_2_attack_2.cooldown}%`
    }

    AI(opponent) {
        if (!this.isDead && gameStarted) {
            if (opponent.x > this.x + 150) {
                this.speedX = this.constSpeed
                this.frameX = 0
                this.animationState = "run"
            } else if (opponent.x < this.x - 150) {
                this.speedX = -this.constSpeed
                this.frameX = 0
                this.animationState = "run"
            } else if (this.animationState != "attack-1" || this.animationState != "attack-2") {
                this.speedX = 0
                this.frameX = 0
            }
     
            if (Math.abs(opponent.x - this.x) < 150 && !opponent.isDead) {
                if (Date.now() - AILastAttack > 4000) {
                    this.handleAttack(opponent, fighter_2_attack_1)
                    AILastAttack = Date.now()
                } else if (opponent.attacking) {
                    if (Date.now() - fighter_2_attack_2.lastAttack >= fighter_2_attack_2.cooldown) {
                        this.handleAttack(opponent, fighter_2_attack_2)
                        AILastAttack = Date.now()
                    } else if (Date.now() - fighter_2_attack_1.lastAttack >= fighter_2_attack_1.cooldown) {
                        this.handleAttack(opponent, fighter_2_attack_1)
                        AILastAttack = Date.now()
                    }
                }
            }
        }
    }
}

player1 = new Fighter(1, "Caeso the Mighty", cvs.width - 180, -500, playerImage, wizardAnimationStates, [fighter_1_attack_1, fighter_1_attack_2], fighter1HealthBar, fighter1Score, 250, [112, 107], 3)
player2 = new Fighter(2, "Tiberious the Shadow", 50, -500, willainImage, warriorAnimationStates, [fighter_2_attack_1, fighter_2_attack_2], fighter2HealthBar, fighter2Score, 162, [72, 56], 4)
player1.move(player2)
player1.attack(player2)

function drawText(text, x, y, color, font) {
    ctx.fillStyle = color
    ctx.font = font
    ctx.fillText(text, x, y)
}

function startGame() {
    gameStarted = true
}

function resetRound() {
    player1.x = cvs.width - 180
    player2.x = 50
    player1.health = 500
    player2.health = 500
    player1.animationState = "idle"
    player2.animationState = "idle"
    player1.isDead = false
    player2.isDead = false
    player1.hasCountedScore = false
    player2.hasCountedScore = false
    player1.healthBar.style.width = "100%"
    player2.healthBar.style.width = "100%"
}

function countdown() {
    var counter = document.getElementById('counter');
    resetRound()
    counter.style.display = "block"
    var count = 3;
    counter.innerHTML = count;
    console.log("fucntion called")
    var interval = setInterval(function() {
      count--;
      if (count === 0) {
        counter.innerHTML = 'Go!';
        clearInterval(interval);
        setTimeout(function() {
            counter.style.display = 'none';
            startGame()
        }, 1000);
      } else {
        counter.innerHTML = count;
      }
    }, 1000);
  }

function roundOver() {
    countdown()
}

function gameOver(player) {
    gameOverDisplay.classList.remove("hidden")
    gameOverBtn.classList.remove("hidden")
    if (player.player == 1) {
        gameOverDisplay.innerText = `Congratulations! ${player.name} has successfully taken over the world`
    } else {
        gameOverDisplay.innerText = `${player.name} has prevented you from taking over the world!`
    }
}

startBtn.addEventListener('click', () => {
    roundOver()
    backgroundMusic.play()

    for (let item of mainMenuItems) {
        item.classList.add('hidden')
    }

    for (let item of gameItems) {
        item.classList.remove('hidden')
    }
})

gameOverBtn.addEventListener('click', () => {
    roundOver()
    player1.score = 0
    player2.score = 0
    gameOverBtn.classList.add('hidden')
    gameOverDisplay.classList.add('hidden')
})

function update(time) {
    if (lastTime != null) {
        delta = time - lastTime
    }

    if (BgImageBackground.loaded) {
        ctx.drawImage(BgImageBackground, 0, 0, cvs.width, cvs.height)
    }

    player1.update(player2)
    player1.draw()

    player2.update(player1)
    player2.draw()
    
    player2.AI(player1)

    if (BgImageForeground.loaded) {
        ctx.drawImage(BgImageForeground, 0, 0, cvs.width, cvs.height)
    }   

    lastTime = time
    window.requestAnimationFrame(update)
}

window.requestAnimationFrame(update)