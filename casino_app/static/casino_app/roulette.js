const roulette = document.getElementById("roulette");
const resultDisplay = document.getElementById("result-number");

// ordre officiel de la roue européenne (sens horaire)[web:1][web:11]
const rouletteOrder = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24,
  16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
];

// ----- création des cases autour du cercle -----
const radius = 160; // rayon du cercle des numéros
const center = 200; // centre du div 400x400
const itemRadius = 20; // rayon visuel de chaque case

rouletteOrder.forEach((num, i) => {
  const div = document.createElement("div");
  div.className = "number";
  div.innerText = num;

  // angle autour du cercle (en radians)
  const angle = (i / rouletteOrder.length) * 2 * Math.PI;
  div.style.left = `${center + radius * Math.cos(angle) - itemRadius}px`;
  div.style.top = `${center + radius * Math.sin(angle) - itemRadius}px`;

  div.style.backgroundColor = numberColors[num];

  roulette.appendChild(div);
});

// ----- fonction qui lance un tirage -----
function spinRoulette() {
  // nombre aléatoire entre 0 et 36
  const number = Math.floor(Math.random() * 37);
  resultDisplay.innerText = number;

  // index de ce numéro dans l'ordre de la roue
  const index = rouletteOrder.indexOf(number);

  // angle d'arrêt : on veut que le numéro gagnant arrive en haut, sous la flèche
  // + quelques tours complets pour l'animation
  const baseAngle = 360 - (index / rouletteOrder.length) * 360;
  const extraSpins = 5; // nombre de tours complets
  const stopAngle = baseAngle - 360 * extraSpins;

  roulette.style.transform = `rotate(${stopAngle}deg)`;

  // si le tapis existe, on le met à jour
  if (window.highlightTableNumber) {
    window.highlightTableNumber(number);
  }
}

// tirage toutes les 45 secondes
setInterval(spinRoulette, 45000);

// tirage initial au chargement
spinRoulette();
