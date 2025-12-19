let currentChipValue = 1;
let bets = []; // { type, value, amount }

const totalBetSpan = document.getElementById("total-bet");
const spinButton = document.getElementById("spin-button");
const balanceSpan = document.getElementById("balance-value"); // le solde unique

// sélection jeton
document.querySelectorAll(".chip").forEach((btn) => {
  btn.addEventListener("click", () => {
    currentChipValue = parseInt(btn.dataset.value, 10);
  });
});

// mapping d'une case du tapis vers un type de mise
function mapCellToBet(cell) {
  if (cell.classList.contains("case-number")) {
    return {
      type: "STRAIGHT",
      value: cell.dataset.number,
    };
  }

  if (cell.classList.contains("case-zero")) {
    return {
      type: "STRAIGHT",
      value: "0",
    };
  }

  if (cell.classList.contains("case-top-half")) {
    if (cell.innerText.includes("1 à 18")) {
      return { type: "LOWHIGH", value: "LOW" };
    }
    if (cell.innerText.includes("19 à 36")) {
      return { type: "LOWHIGH", value: "HIGH" };
    }
  }

  if (cell.classList.contains("case-outside-red")) {
    return { type: "COLOR", value: "RED" };
  }

  if (cell.classList.contains("case-outside-black")) {
    return { type: "COLOR", value: "BLACK" };
  }

  if (cell.innerText.includes("Pair")) {
    return { type: "EVENODD", value: "EVEN" };
  }

  if (cell.innerText.includes("Impair")) {
    return { type: "EVENODD", value: "ODD" };
  }

  if (cell.innerText.includes("1ers 12")) {
    return { type: "DOZEN", value: "1ST12" };
  }
  if (cell.innerText.includes("2nde 12")) {
    return { type: "DOZEN", value: "2ND12" };
  }
  if (cell.innerText.includes("3ème 12")) {
    return { type: "DOZEN", value: "3RD12" };
  }

  if (cell.classList.contains("case-column-bet")) {
    const row = parseInt(cell.style.gridRow, 10);
    if (row === 4) return { type: "COLUMN", value: "COL1" };
    if (row === 3) return { type: "COLUMN", value: "COL2" };
    if (row === 2) return { type: "COLUMN", value: "COL3" };
  }

  return null;
}

// clic sur tapis pour poser une mise
tapis.addEventListener("click", (e) => {
  const cell = e.target.closest("div");
  if (!cell) return;

  const betInfo = mapCellToBet(cell);
  if (!betInfo) return;

  bets.push({
    type: betInfo.type,
    value: betInfo.value,
    amount: currentChipValue,
  });

  const currentTotal = bets.reduce((sum, b) => sum + b.amount, 0);
  totalBetSpan.textContent = currentTotal;
});

// bouton Lancer
spinButton.addEventListener("click", () => {
  if (bets.length === 0) return;

  fetch("/bet-spin/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": window.CSRF_TOKEN,
    },
    body: JSON.stringify({ bets }),
  })
    .then((res) => res.json())
    .then((data) => {
      const number = data.number;

      if (typeof spinRouletteAnimation === "function") {
        spinRouletteAnimation(number);
      } else {
        resultDisplay.innerText = number;
      }

      // MAJ du solde unique renvoyé par le back
      if (typeof data.balance !== "undefined") {
        balanceSpan.textContent = data.balance;
      }

      // reset les mises après le tour
      bets = [];
      totalBetSpan.textContent = "0";
    });
});
