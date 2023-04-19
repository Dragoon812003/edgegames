const cvs = document.getElementById('canvas')
const ctx = cvs.getContext('2d')

const playAgainBtn = document.getElementById('play-again-btn')
const gameOverScreen = document.getElementById('game-over-screen')
const gameOverScreenItem = document.getElementsByClassName('game-over-screen-item')
const mainMenuItem = document.getElementsByClassName('main-menu-item')

cvs.width = window.innerWidth
cvs.height = window.innerHeight

backgroundImage = new Image()
backgroundImage.src = "https://edgegames.pythonanywhere.com/file/asteroids/background.png"
backgroundImage.width = cvs.width
backgroundImage.height = cvs.height

playerImage = new Image()
playerImage.src = "https://edgegames.pythonanywhere.com/file/asteroids/player.png"
playerImage.width = 75
playerImage.height = 75

bulletImage = new Image()
bulletImage.src = "https://edgegames.pythonanywhere.com/file/asteroids/bullet.png"
bulletImage.width = 25
bulletImage.height = 35

asteroidImage = new Image()
asteroidImage.src = "https://edgegames.pythonanywhere.com/file/asteroids/asteroid.png"

rocketFireImage = new Image()
rocketFireImage.src = "https://edgegames.pythonanywhere.com/file/asteroids/rocket-fire.png"

healthImage = new Image()
healthImage.src = "https://edgegames.pythonanywhere.com/file/asteroids/heart.png"
healthImage.size = 25

backgroundMusic = new Audio('https://edgegames.pythonanywhere.com/file/asteroids/background-music.mp3')
bulletFX = new Audio('https://edgegames.pythonanywhere.com/file/asteroids/laser.mp3')
explosionFX = new Audio('https://edgegames.pythonanywhere.com/file/asteroids/explosion.mp3')
healthDownFX = new Audio('https://edgegames.pythonanywhere.com/file/asteroids/health-down.mp3')
gameOverFx = new Audio('https://edgegames.pythonanywhere.com/file/asteroids/game-over-sound.mp3')

backgroundMusic.loop = true
healthDownFX.volume = 1
backgroundMusic.volume = 0.75

const bullets = []
const asteroids = []

const maxFuel = 1000
let fuel = maxFuel

let isGameOver = false

function generateRandom(min, max) {
    return Math.random() * (max - min) + min;
}

function generateRandomBoolean() {
    return Math.random() < 0.5;
}

function drawFuel (fuel, maxFuel) {
    ctx.fillStyle = "yellow"
    ctx.fillRect(cvs.width - 275, 25, 250, 25)
    ctx.fillStyle = "green"
    if (fuel > 0) {
        ctx.fillRect(cvs.width - 275, 25, fuel * 250 / maxFuel, 25)
    }
}

function drawHealth (health) {
    x = 25
    for (let i = 0; i < health; i++) {
        ctx.drawImage(healthImage, x, 75, healthImage.size, healthImage.size)
        x += healthImage.size + 10
    }
}

function drawText(text, x, y, color, font, center=false) {
    (center) ? ctx.textAlign = "center" : ctx.textAlign = "left"

    ctx.fillStyle = color
    ctx.font = font
    ctx.fillText(text, x, y)
}

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.height + rect1.y > rect2.y
} 

function gameOver() {
    if (!isGameOver) {
        gameOverFx.play()
    }
    isGameOver = true
    for (item of gameOverScreenItem) {
        item.classList.remove('hidden')
    }
}

function restartGame() {
    player.pos = [cvs.width/2, cvs.height/2]
    player.vel = [0, 0]
    player.accel = [0, 0]
    player.score = 0
    player.fuel = player.maxFuel
    player.health = 3
    player.rotation = Math.PI/2
    player.dead = false
    isGameOver = false
    asteroids.splice(0, asteroids.length)
    bullets.splice(0, bullets.length)
    for (item of gameOverScreenItem) {
        item.classList.add('hidden')
    }
}
  

class Bullet {
    constructor (image, x, y, rotation) {
        this.image = image
        this.width = this.image.width
        this.height = this.image.height
        this.pos = [x, y]
        this.rotation = rotation
        this.speed = 7
        this.collideRect = {x: this.pos[0], y: this.pos[1], width: this.width, height: this.height}
        bulletFX.pause()
        bulletFX.currentTime = 0
        bulletFX.play()
    }

    draw () {
        ctx.save();
        ctx.translate(this.pos[0], this.pos[1]);
        ctx.rotate(this.rotation - Math.PI/2);
        ctx.drawImage(bulletImage, -this.width/2, -this.height/2, this.width, this.height)
        ctx.restore();
    }

    update () {

        if (this.pos[0] < -cvs.width * 0.2 || this.pos[0] > cvs.width * 1.2 || this.pos[1] < -cvs.height * 0.2 || this.pos[1] > cvs.height * 1.2) {
            bullets.splice(bullets.indexOf(this), 1)
        }

        this.collideRect.x = this.pos[0] - this.width/2
        this.collideRect.y = this.pos[1] - this.height/2

        this.pos = [this.pos[0] - this.speed * Math.cos(this.rotation), this.pos[1] - this.speed * Math.sin(this.rotation)]
    }
}

class Asteroid {
    constructor () {
        this.image = asteroidImage
        this.size = generateRandom(150, 300) //150, 300
        this.width = this.size
        this.height = this.size
        this.x = (generateRandomBoolean()) ? generateRandom(-cvs.width * 0.5, -cvs.width) : generateRandom(cvs.width * 1.5, cvs.width * 2)
        this.y = (generateRandomBoolean()) ? generateRandom(-cvs.height * 0.5, -cvs.height) : generateRandom(cvs.height * 1.5, cvs.height * 2)
        this.pos = [this.x, this.y]
        this.angularSpeed = generateRandom(-0.02, 0.02)
        this.rotation = generateRandom(0, Math.PI)
        this.speedX = (this.pos[0] > cvs.width) ? -generateRandom(1,3) : generateRandom(1,3) //1,3
        this.speedY = (this.pos[1] > cvs.height) ? -generateRandom(1,3) : generateRandom(1,3)  //1, 3
        this.vel = [this.speedX, this.speedY]
        this.hasCollided = false
        this.collideRect = {x: this.pos[0], y: this.pos[1], width: this.size, height: this.size}
    }

    draw () {
        ctx.save();
        ctx.translate(this.pos[0], this.pos[1]);
        ctx.rotate(this.rotation - Math.PI/2);
        ctx.drawImage(this.image, -this.size/2, -this.size/2, this.size, this.size);
        ctx.restore();
    }

    destroy () {
        if (this.size > 250) {
            let asteroid1 = new Asteroid()
            asteroid1.pos = [this.pos[0], this.pos[1]]
            let randVel = [generateRandom(2, 5), generateRandom(2, 5)]
            asteroid1.vel = [randVel[0], randVel[1]]
            asteroid1.size = this.size/2
            asteroids.push(asteroid1)
            let asteroid2 = new Asteroid()
            asteroid2.pos = [this.pos[0], this.pos[1]]
            asteroid2.vel = [randVel[0] * -1, randVel[1] * [-1]]
            asteroid2.size = this.size/2
            asteroids.push(asteroid2)
            asteroids.splice(asteroids.indexOf(this), 1)
        } else {
            asteroids.splice(asteroids.indexOf(this), 1)
        }
    }

    update () {

        if (this.pos[0] < -cvs.width * 2.2 || this.pos[0] > cvs.width * 2.2 || this.pos[1] < -cvs.height * 2.2 || this.pos[1] > cvs.height * 2.2) {
            asteroids.splice(asteroids.indexOf(this), 1)
        }

        this.collideRect.x = this.pos[0] - this.size/2
        this.collideRect.y = this.pos[1] - this.size/2

        this.rotation += this.angularSpeed
        this.pos = [this.pos[0] + this.vel[0], this.pos[1] + this.vel[1]]
    }
}

class Player {
    constructor (image, x, y) {
        this.image = image
        this.width = this.image.width
        this.height = this.image.height
        this.pos = [x, y]
        this.vel = [0, 0]
        this.accel = 0
        this.friction = 0.00000005
        this.rotation = Math.PI/2
        this.rotationSpeed = 0.05
        this.keys = [false, false, false, false] //Up, Down, Left, Right
        this.isThrusting = false
        this.maxFuel = 1000
        this.fuel = this.maxFuel
        this.score = 0
        this.health = 3
        this.dead = false
        this.collideRect = {x: this.pos[0], y: this.pos[1], width: this.width, height: this.height}
    }

    move () {

        window.addEventListener('keydown', (event) => {
            if (event.keyCode == 38) {
                this.keys[0] = true
                this.isThrusting = true
            }

            if (event.keyCode == 37) {
                this.keys[2] = true
            } else if (event.keyCode == 39) {
                this.keys[3] = true
            }

            if (event.keyCode == 32) {
                if (bullets.length < 7 && !this.dead) {
                    bullets.push(new Bullet(bulletImage, this.pos[0], this.pos[1], this.rotation))
                }
            }
            
        })

        window.addEventListener('keyup', () => {
            if (event.keyCode == 38) {
                this.keys[0] = false
                this.isThrusting = false
            }

            if (event.keyCode == 37) {
                this.keys[2] = false
            } else if (event.keyCode == 39) {
                this.keys[3] = false
            }
        })
    } 

    collide (asteroid) {
        if (this.health > 0) {
            if (!asteroid.hasCollided) {
                this.health--
                healthDownFX.pause()
                healthDownFX.currentTime = 0
                healthDownFX.play()
            }
        } else {
            this.dead = true
            gameOver()
            this.vel = [0, 0]
        }

        asteroid.hasCollided = true
    }

    draw () {
        ctx.save();
        ctx.translate(this.pos[0], this.pos[1]);
        ctx.rotate(this.rotation - Math.PI/2);
        ctx.drawImage(this.image, -this.image.width / 2, -this.image.height / 2, this.image.width, this.image.height);
        ctx.rotate(Math.PI)
        if (this.isThrusting) {
            ctx.drawImage(rocketFireImage, -this.image.width/4, -this.image.height + 25, this.image.width/2, 25)
        }
        ctx.restore();
    }

    calculateFriction(velocity, acceleration, rotation, frictionCoefficient) {
        const velocityMagnitude = Math.sqrt(velocity[0] ** 2 + velocity[1] ** 2);
        const frictionMagnitude = frictionCoefficient * velocityMagnitude;
        const frictionX = -frictionMagnitude * Math.cos(rotation);
        const frictionY = -frictionMagnitude * Math.sin(rotation);
        const netForceX = acceleration * Math.cos(rotation) + frictionX;
        const netForceY = acceleration * Math.sin(rotation) + frictionY;
        const newVelocityX = velocity[0] + netForceX;
        const newVelocityY = velocity[1] + netForceY;
        if (newVelocityX * velocity[0] < 0) {
          newVelocityX = 0;
        }
        if (newVelocityY * velocity[1] < 0) {
          newVelocityY = 0;
        }
        return [newVelocityX, newVelocityY];
    }
      

    update () {

        if (this.keys[0] && this.fuel > 0 && !this.dead) {
            this.accel = -0.1
            this.isThrusting = true
        } else if (this.keys[1] && this.fuel > 0 && !this.dead) {
            this.accel = 0.1 
            this.isThrusting = true
        } else {
            this.isThrusting = false
            this.accel = 0
        }


        if (this.keys[3] && !this.dead) {
            this.rotation += this.rotationSpeed
        } else if (this.keys[2] && !this.dead) {
            this.rotation -= this.rotationSpeed
        }

        if (this.pos[0] + this.image.width > cvs.width) {
            this.pos[0] = 0
        } else if (this.pos[0] < 0) {
            this.pos[0] = cvs.width - this.image.width
        }

        if (this.pos[1] + this.image.height > cvs.height) {
            this.pos[1] = 0
        } else if (this.pos[1] < 0) {
            this.pos[1] = cvs.height - this.image.height
        }

        if (this.fuel < this.maxFuel) {
            this.fuel += 1
        }

        if (this.isThrusting) {
            this.fuel -= 5
        }

        this.collideRect.x = this.pos[0] - this.width/2
        this.collideRect.y = this.pos[1] - this.height/2

        this.vel = [this.vel[0] + this.accel * Math.cos(this.rotation), this.vel[1] + this.accel * Math.sin(this.rotation)]
        this.pos = [this.pos[0] + this.vel[0], this.pos[1] + this.vel[1]];
    }
}

let lastTime = 0

function update(currentTime) {

    let elapsedTime = currentTime - lastTime;
    lastTime = currentTime;

    // Calculate frame rate
    let frameRate = 1000 / elapsedTime;

    ctx.drawImage(backgroundImage, 0, 0, backgroundImage.width, backgroundImage.height)

    player.update()
    player.draw()

    for (let bullet of bullets) {
        bullet.update()
        bullet.draw()
    }

    for (let asteroid of asteroids) {
        asteroid.update()
        asteroid.draw()

        if (checkCollision(asteroid.collideRect, player.collideRect)) {
            player.collide(asteroid)
        }

        for (let bullet of bullets) {
            if (checkCollision(bullet.collideRect, asteroid.collideRect)) {
                asteroid.destroy()
                bullets.splice(bullets.indexOf(bullet, 1))
                explosionFX.pause()
                explosionFX.currentTime = 0
                explosionFX.play()
                player.score++
            }
        }

    }

    if (isGameOver) {
        drawText("Game Over!", cvs.width/2, cvs.height/2, 'white', "50px Georgia", true)
    }

    drawText(`Score: ${player.score}`, 25, 50, 'white', '35px Georgia')
    drawHealth(player.health)
    drawFuel(player.fuel, player.maxFuel)
    drawText('FPS: ' + frameRate.toFixed(2), cvs.width - 275, 85, "white", "35px Georgia")

    window.requestAnimationFrame(update)
}

function startGame() {
    player = new Player(playerImage, cvs.width/2, cvs.height/2)
    player.move()

    setInterval(() => {
        if (asteroids.length < 30) {
            asteroids.push(new Asteroid())
        }
    }, 500)

    backgroundMusic.play()

    for (item of mainMenuItem) {
        item.classList.add('hidden')
    }

    window.requestAnimationFrame(update)

}
