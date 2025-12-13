/* Tableau logique (3 colonnes × 12 lignes, dans l'ordre visuel) */
const rouletteTable = [
  [3,6,9,12,15,18,21,24,27,30,33,36],
  [2,5,8,11,14,17,20,23,26,29,32,35],
  [1,4,7,10,13,16,19,22,25,28,31,34]
];

/* Références DOM */
const numbersArea = document.getElementById('numbersArea');
const twoToOneCol = document.getElementById('twoToOneCol');
const betsList = document.getElementById('betsList');
const betAmountInput = document.getElementById('betAmount');
const spinBtn = document.getElementById('spinBtn');
const clearBetsBtn = document.getElementById('clearBetsBtn');
const resultBox = document.getElementById('resultBox');
const collapseBtn = document.getElementById('collapseBtn');


/* Etat des mises */
let bets = []; // { type: "straight"|"column"|"dozen"|"low"..., value: number|string, amount: number }

/* Création grille de numéros */
function createGrid(){
  // create 12 rows * 3 columns in visual order: rows top->bottom, columns left->right
  // The rouletteTable arrays are columns; for visual row-wise, we loop rows 0..11 and columns 0..2
  for(let row = 0; row < 12; row++){
    for(let col = 0; col < 3; col++){
      const num = rouletteTable[col][row];
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.type = 'straight';
      cell.dataset.value = String(num);

      // number circle
      const circle = document.createElement('div');
      circle.className = 'num-circle';
      circle.innerText = num;
      circle.style.backgroundColor = numberColors[num];
      // number color text contrast for green:
      if(numberColors[num] === 'green') circle.style.color = '#fff';

      cell.appendChild(circle);

      // click = place/remove straight bet on this number
      cell.addEventListener('click', () => toggleStraightBet(num, cell, circle));

      numbersArea.appendChild(cell);
    }
  }
}