let currentChipValue = null; // aucun jeton sélectionné au début
let currentChipImageSrc = null;
let selectedChipButton = null;
const clearBetsButton = document.getElementById("clear-bets-button");
let bets = []; // { type, value, amount }
const modal = document.getElementById("result-modal");
const modalNumber = document.getElementById("modal-number");
const modalWin = document.getElementById("modal-win");
const modalClose = document.getElementById("modal-close");

const totalBetSpan = document.getElementById("total-bet");
const spinButton = document.getElementById("spin-button");
const balanceSpan = document.getElementById("balance-value"); // le solde unique
let clientBalance = parseInt(balanceSpan.textContent, 10) || 0;

// --- sélection / désélection des jetons ---

document.querySelectorAll(".chip").forEach((btn) => {
  btn.addEventListener("click", () => {
    // si on reclique sur le même jeton -> désélection
    if (selectedChipButton === btn) {
      btn.classList.remove("selected");
      selectedChipButton = null;
      currentChipValue = null;
      currentChipImageSrc = null;
      return;
    }

    // retirer la sélection de l'ancien
    if (selectedChipButton) {
      selectedChipButton.classList.remove("selected");
    }

    // sélectionner le nouveau
    selectedChipButton = btn;
    selectedChipButton.classList.add("selected");

    currentChipValue = parseInt(btn.dataset.value, 10);
    const img = btn.querySelector("img");
    currentChipImageSrc = img ? img.src : null;
  });
});

// --- mapping d'une case du tapis vers un type de mise ---
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

// --- clic sur tapis pour poser / annuler une mise ---

// pour pouvoir positionner les jetons en absolu
tapis.style.position = "relative";

tapis.addEventListener("click", (e) => {
  if (!currentChipValue || !currentChipImageSrc) return;

  const cell = e.target.closest("div");
  if (!cell) return;

  const betInfo = mapCellToBet(cell);
  if (!betInfo) return;

  const existingIndex = bets.findIndex(
    (b) => b.value === betInfo.value && b.type === betInfo.type
  );

  if (existingIndex !== -1) {
    // annuler la mise : retirer le jeton visuel et rembourser le solde client
    const existingBet = bets[existingIndex];

    // remise de la mise dans le solde instantané
    clientBalance += existingBet.amount;
    balanceSpan.textContent = clientBalance;

    if (existingBet.tokenElement && existingBet.tokenElement.parentNode) {
      existingBet.tokenElement.parentNode.removeChild(existingBet.tokenElement);
    }
    bets.splice(existingIndex, 1);
  } else {
    // vérifier que le solde client est suffisant
    if (currentChipValue > clientBalance) {
      // éventuellement afficher un message, ou juste ne rien faire
      return;
    }

    // débiter immédiatement le solde
    clientBalance -= currentChipValue;
    balanceSpan.textContent = clientBalance;

    // créer un visuel de jeton sur la case
    const token = document.createElement("img");
    token.src = currentChipImageSrc;
    token.classList.add("bet-token");

    const cellRect = cell.getBoundingClientRect();
    const tapisRect = tapis.getBoundingClientRect();
    const x = cellRect.left + cellRect.width / 2 - tapisRect.left;
    const y = cellRect.top + cellRect.height / 2 - tapisRect.top;

    token.style.left = `${x}px`;
    token.style.top = `${y}px`;

    tapis.appendChild(token);

    bets.push({
      type: betInfo.type,
      value: betInfo.value,
      amount: currentChipValue,
      tokenElement: token,
    });
  }

  const currentTotal = bets.reduce((sum, b) => sum + b.amount, 0);
  totalBetSpan.textContent = currentTotal;
});
// --- bouton Lancer --

spinButton.addEventListener("click", () => {
  if (bets.length === 0) return;

  // on envoie au back seulement les infos utiles
  const payloadBets = bets.map((b) => ({
    type: b.type,
    value: b.value,
    amount: b.amount,
  }));

  fetch("/bet-spin/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": window.CSRF_TOKEN,
    },
    body: JSON.stringify({ bets: payloadBets }),
  })
    .then((res) => res.json())
    .then((data) => {
      const number = data.number;

      // on garde les données du spin pour la pop-up
      window.lastSpinData = data;

      if (typeof spinRouletteAnimation === "function") {
        spinRouletteAnimation(number);
      } else {
        resultDisplay.innerText = number;
        // si jamais pas d'animation, on peut fallback et montrer la pop-up direct
        if (window.showResultModal) {
          window.showResultModal(number);
        }
      }

      if (typeof data.balance !== "undefined") {
        clientBalance = data.balance;
        balanceSpan.textContent = clientBalance;
      }

      // reset visuel des mises
      bets.forEach((b) => {
        if (b.tokenElement && b.tokenElement.parentNode) {
          b.tokenElement.parentNode.removeChild(b.tokenElement);
        }
      });
      bets = [];
      totalBetSpan.textContent = "0";
    });
});

clearBetsButton.addEventListener("click", () => {
  // rembourser toutes les mises au solde client
  const totalBet = bets.reduce((sum, b) => sum + b.amount, 0);
  clientBalance += totalBet;
  balanceSpan.textContent = clientBalance;

  // supprimer tous les jetons visuels du tapis
  bets.forEach((b) => {
    if (b.tokenElement && b.tokenElement.parentNode) {
      b.tokenElement.parentNode.removeChild(b.tokenElement);
    }
  });

  bets = [];
  totalBetSpan.textContent = "0";
});

modalClose.addEventListener("click", () => {
  modal.classList.add("hidden");
});

window.showResultModal = function (number) {
  if (!modal || !modalNumber || !modalWin || !window.lastSpinData) return;

  modalNumber.textContent = number;
  modalWin.textContent = window.lastSpinData.total_win || 0;
  modal.classList.remove("hidden");
};
