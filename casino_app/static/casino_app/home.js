  document.addEventListener('DOMContentLoaded', () => {
    const jouer = document.getElementById('Jouer');
    const regles = document.getElementById('regles');

    if (!jouer) return;

    jouer.style.pointerEvents = 'bounding-box'; // optionnel mais utile pour capter le clic sur tout le groupe[web:1]

    jouer.addEventListener('click', () => {
      window.location.href = '/roulette';
    });

    if (!jouer) return;

    regles.style.pointerEvents = 'bounding-box'; // optionnel mais utile pour capter le clic sur tout le groupe[web:1]

    regles.addEventListener('click', () => {
      window.location.href = '/regles';
    });
  });