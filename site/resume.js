(() => {
  'use strict';
  const print = document.querySelector('.resume-print');
  print.hidden = false;
  print.addEventListener('click', () => window.print());
  const language = document.querySelector('.resume-language');
  const target = language.getAttribute('href');
  const syncHash = () => { language.href = target + window.location.hash; };
  syncHash();
  window.addEventListener('hashchange', syncHash);
})();
