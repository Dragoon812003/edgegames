const screen = document.getElementById('screen');
const displayingTime = document.getElementById('displayingTime');
let noOfTimesClicked = 0;
let isCheater = false
let isTimer = true
    
setTimeout(function() {

    let previoustime = new Date()
    let lastTime = previoustime.getTime()
    screen.style.background = "rgb(" + Math.floor(Math.random()*200) + "," + Math.floor(Math.random()*200) + ","  + Math.floor(Math.random()*200) + ")";
    
    isTimer = false
    
    window.addEventListener('keydown' ,function (event) {
        if (event.keyCode == 32 && noOfTimesClicked == 0 && !isCheater) {
            const nowtime = new Date()
            let currentTime = nowtime.getTime()
            displayingTime.innerText = "Your Reaction Time is: " + (currentTime - lastTime) + "ms"
            noOfTimesClicked++
        }
    })

    if (isCheater) {
        displayingTime.innerText = "You are a Cheater!"
    }
}, Math.random()*7*1000 + 3000)


window.addEventListener('keydown' , function (event) {
    if (event.keyCode == 32 && isTimer) {
        isCheater = true
    }
})
