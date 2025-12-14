const tapis = document.getElementById("tapis");

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

// ---------- 0 à gauche ----------
const zeroCell = document.createElement("div");
zeroCell.className = "case-zero";
zeroCell.innerText = "0";
zeroCell.dataset.number = "0";
// il doit commencer à la ligne 2 et occuper les lignes 2 à 4
zeroCell.style.gridRow = "2 / 5";
tapis.appendChild(zeroCell);

// ---------- cases "1 à 18" et "19 à 36" en haut ----------
function addTopHalves() {
  const low = document.createElement("div");
  low.className = "case-top-half";
  low.innerText = "1 à 18";
  low.style.gridRow = 1;          // ligne 1
  low.style.gridColumn = "2 / 8"; // moitié gauche des 12 colonnes
  tapis.appendChild(low);

  const high = document.createElement("div");
  high.className = "case-top-half";
  high.innerText = "19 à 36";
  high.style.gridRow = 1;          // ligne 1
  high.style.gridColumn = "8 / 14"; // moitié droite
  tapis.appendChild(high);
}

// ---------- 3 rangées de numéros ----------
const topRow    = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36];
const middleRow = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35];
const bottomRow = [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34]; // 1ère colonne[web:2][web:39]


function addRow(numbersArray, gridRow) {
  numbersArray.forEach((n, index) => {
    const cell = document.createElement("div");
    cell.classList.add("case-number");
    cell.dataset.number = String(n);
    cell.innerText = n;

    const color = numberColors[n];
    if (color === "red") cell.classList.add("case-red");
    if (color === "black") cell.classList.add("case-black");

    cell.style.gridRow = gridRow;          // ICI: 2, 3, 4
    cell.style.gridColumn = index + 2;     // colonnes 2–13

    tapis.appendChild(cell);
  });
}

addTopHalves();
addRow(topRow, 2);     // au lieu de 1
addRow(middleRow, 3);  // au lieu de 2
addRow(bottomRow, 4);  // au lieu de 3


// ---------- cases "2 à 1" en bout de colonne ----------
function addColumnBet(text, row) {
  const cell = document.createElement("div");
  cell.className = "case-column-bet";
  cell.innerText = text; // "2 à 1"
  cell.style.gridRow = row;
  cell.style.gridColumn = 14; // dernière colonne
  tapis.appendChild(cell);
}

addColumnBet("2 à 1", 2); // colonne du haut
addColumnBet("2 à 1", 3); // colonne du milieu
addColumnBet("2 à 1", 4); // colonne du bas

// ---------- ligne des douzaines ----------
function addOutsideCell(text, colStart, colEnd, row, extraClass = "") {
  const cell = document.createElement("div");
  cell.className = "case-outside";
  if (extraClass) cell.classList.add(extraClass);
  cell.innerText = text;
  cell.style.gridRow = row;
  cell.style.gridColumn = `${colStart} / ${colEnd}`;
  tapis.appendChild(cell);
}

// douzaines en row 5
addOutsideCell("1ers 12", 2, 6, 5);
addOutsideCell("2nde 12", 6, 10, 5);
addOutsideCell("3ème 12", 10, 14, 5);

// chances simples en row 6
addOutsideCell("Pair",   2, 6, 6);
addOutsideCell("",       6, 8, 6, "case-outside-red");
addOutsideCell("",       8, 10, 6, "case-outside-black");
addOutsideCell("Impair", 10, 14, 6);


// ---------- surbrillance depuis la roue ----------
window.highlightTableNumber = function (number) {
  const allCells = tapis.querySelectorAll(".case-number, .case-zero");
  allCells.forEach((c) => c.classList.remove("active"));

  const target = tapis.querySelector(`[data-number="${number}"]`);
  if (target) {
    target.classList.add("active");
  }
};
