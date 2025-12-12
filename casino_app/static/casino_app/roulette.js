function getRandomNumber() {
    return Math.floor(Math.random() * 37);
}

function animateNumber(number) {
    const display = document.getElementById('roulette-number');
    let current = parseInt(display.innerText);
    let step = current < number ? 1 : -1;

    const interval = setInterval(() => {
        if(current === number) clearInterval(interval);
        else {
            current += step;
            display.innerText = current;
        }
    }, 50);
}

setInterval(() => {
    const number = getRandomNumber();
    animateNumber(number);
}, 45000);

animateNumber(getRandomNumber());
