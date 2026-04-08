
(function () {
  function isGamePage() {
    return /jeu[1-8]\.html$/i.test(window.location.pathname);
  }

  function overrideGameLangToggle() {
    if (!isGamePage()) return;
    const btn = document.getElementById('langToggle');
    if (!btn) return;
    if (typeof window.saveState !== 'function' || typeof window.renderTexts !== 'function' || typeof window.state === 'undefined') {
      return;
    }

    btn.onclick = function (event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      const next = window.state.lang === 'fr' ? 'en' : 'fr';
      window.state.lang = next;
      localStorage.setItem('dop_lang', next);
      localStorage.setItem('op_guess_lang', next);
      try {
        window.saveState();
      } catch (e) {}
      try {
        window.renderTexts();
      } catch (e) {}
      const url = new URL(window.location.href);
      url.searchParams.set('lang', next);
      window.history.replaceState({}, '', url.toString());
      const langBtn = document.getElementById('langToggle');
      if (langBtn) langBtn.textContent = next.toUpperCase();
    };
  }

  document.addEventListener('DOMContentLoaded', function () {
    overrideGameLangToggle();
    setTimeout(overrideGameLangToggle, 50);
    setTimeout(overrideGameLangToggle, 250);
  });
})();
