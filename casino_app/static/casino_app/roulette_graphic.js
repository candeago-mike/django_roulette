const roulette = document.getElementById("roulette");
const resultDisplay = document.getElementById("result-number");

// Ordre réel roulette européenne
const rouletteOrder = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24,
  16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
];

// Couleurs officielles
const numberColors = {
  0: "green",
  1: "red",
  2: "black",
  3: "red",
  4: "black",
  5: "red",
  6: "black",
  7: "red",
  8: "black",
  9: "red",
  10: "black",
  11: "black",
  12: "red",
  13: "black",
  14: "red",
  15: "black",
  16: "red",
  17: "black",
  18: "red",
  19: "red",
  20: "black",
  21: "red",
  22: "black",
  23: "red",
  24: "black",
  25: "red",
  26: "black",
  27: "red",
  28: "black",
  29: "black",
  30: "red",
  31: "black",
  32: "red",
  33: "black",
  34: "red",
  35: "black",
  36: "red",
};

// Crée les cases sur le cercle dans l'ordre officiel
rouletteOrder.forEach((num, i) => {
  const div = document.createElement("div");
  div.className = "number";
  div.innerText = num;

  // Calcul de la position sur le cercle
  const angle = (i / rouletteOrder.length) * 2 * Math.PI;
  const radius = 160;
  div.style.left = `${200 + radius * Math.cos(angle) - 20}px`;
  div.style.top = `${200 + radius * Math.sin(angle) - 20}px`;

  // Couleur officielle
  div.style.backgroundColor = numberColors[num];

  roulette.appendChild(div);
});

// Fonction pour tirer un nombre aléatoire
function spinRoulette() {
  const number = Math.floor(Math.random() * 37);
  resultDisplay.innerText = number;

  // Calcul de l'angle où le numéro doit s'arrêter
  const index = rouletteOrder.indexOf(number);
  const stopAngle = 360 - (index / rouletteOrder.length) * 360 - 360 * 5; // 5 tours
  roulette.style.transform = `rotate(${stopAngle}deg)`;
}

// Tirage toutes les 45 secondes
setInterval(spinRoulette, 45000);

// Tirage initial
spinRoulette();
