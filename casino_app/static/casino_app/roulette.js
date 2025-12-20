const wheel = document.getElementById("roulette-wheel");
const ballTrack = document.getElementById("ball-track");
const resultDisplay = document.getElementById("result-number");
let historique = [];
const wheelnumbersAC = [
  0, 26, 3, 35, 12, 28, 7, 29, 18, 22, 9, 31, 14, 20, 1, 33, 16, 24, 5, 10, 23,
  8, 30, 11, 36, 13, 27, 6, 34, 17, 25, 2, 21, 4, 19, 15, 32,
];
// ordre visuel réel de la roue (sens horaire)
const rouletteOrder = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24,
  16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
];
const numRed = [
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
];

// construire la roue camembert
function buildWheelSegments() {
  wheelnumbersAC.forEach((n, i) => {
    const a = i + 1;
    const spanClass = n < 10 ? "single" : "double";

    const sect = document.createElement("div");
    sect.id = "sect" + a;
    sect.className = "sect";

    const span = document.createElement("span");
    span.className = spanClass;
    span.innerText = n;
    sect.appendChild(span);

    const block = document.createElement("div");
    block.className = "block";
    sect.appendChild(block);

    wheel.appendChild(sect);
  });

  // couleurs et rotation des secteurs
  for (let i = 1; i <= 37; i++) {
    const sect = document.getElementById("sect" + i);
    const block = sect.querySelector(".block");
    const n = wheelnumbersAC[i - 1];
    const deg = 9.73; // angle utilisé dans le CodePen

    if (n === 0) {
      block.style.backgroundColor = "#016D29"; // vert
    } else if (numRed.includes(n)) {
      block.style.backgroundColor = "#E0080B"; // rouge
    } else {
      block.style.backgroundColor = "#000"; // noir
    }
    block.style.transform = `rotate(${deg}deg)`;

    sect.style.transform = `rotate(${(i - 1) * deg}deg)`;
  }
}

buildWheelSegments();

function spinRouletteAnimation(winningNumber) {
  resultDisplay.innerText = winningNumber;

  let index = rouletteOrder.indexOf(winningNumber);
  if (index === -1) index = 0;

  const segmentDeg = 360 / rouletteOrder.length; // ~9.73

  // angle pour placer la boule au centre du segment
  let degree = index * segmentDeg + segmentDeg / 2;

  // --- petit offset pour corriger le décalage visuel ---
  // si la boule est un peu "trop loin" dans le sens de rotation,
  // enlève quelques degrés (ex: 2 ou 3). Si elle est "trop avant", ajoute.
  const pixelOffsetDeg = -3; // à ajuster: -2, -3, -4 selon ce que tu observes
  degree += pixelOffsetDeg;
  // ------------------------------------------------------

  wheel.style.animation = "wheelRotate 2s linear infinite";
  ballTrack.style.animation = "ballRotate 1s linear infinite";

  const freeSpinDuration = 3000;

  setTimeout(() => {
    const computedWheelStyle = window.getComputedStyle(wheel);
    const wheelMatrix = computedWheelStyle.transform;

    wheel.style.animation = "none";
    if (wheelMatrix && wheelMatrix !== "none") {
      wheel.style.transform = wheelMatrix;
    }

    ballTrack.style.animation = "none";

    const style = document.createElement("style");
    style.type = "text/css";
    style.innerText =
      "@keyframes ballStopExact {from {transform: rotate(0deg);} to {transform: rotate(-" +
      degree +
      "deg);}}";
    document.head.appendChild(style);

    ballTrack.style.transform = "rotate(0deg)";
    ballTrack.style.animation = "ballStopExact 2.5s ease-out forwards";

    setTimeout(() => {
      ballTrack.style.animation = "none";
      ballTrack.style.transform = "rotate(-" + degree + "deg)";

      if (window.highlightTableNumber) {
        window.highlightTableNumber(winningNumber);
      }
      if (window.showResultModal) {
        window.showResultModal(winningNumber);
      }

      style.remove();
    }, 2500);
  }, freeSpinDuration);
  console.log(winningNumber);
  // Met à jour l'historique des résultats
  historique.unshift(winningNumber);
  if (historique.length > 10) {
    historique.pop(); // garde seulement les 10 derniers résultats
  }
  console.log("Historique des résultats :", historique);

  // Met à jour l'affichage des derniers numéros
  const lastNumbersDiv = document.getElementById("last-numbers");
  if (lastNumbersDiv) {
    lastNumbersDiv.innerHTML = "";
    historique.forEach((num) => {
      const numDiv = document.createElement("div");
      numDiv.classList.add("last-number");

      // couleur roulette
      if (num === 0) {
        numDiv.classList.add("green");
      } else if (numRed.includes(num)) {
        numDiv.classList.add("red");
      } else {
        numDiv.classList.add("black");
      }

      numDiv.innerText = num;
      lastNumbersDiv.appendChild(numDiv);
    });
  }
}
// exposer pour bets.js
window.spinRouletteAnimation = spinRouletteAnimation;
