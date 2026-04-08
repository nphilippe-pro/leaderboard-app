
(function () {
  function isGamePage() {
    return /jeu[1-8]\.html$/i.test(window.location.pathname);
  }

  function switchGameLanguageWithoutReload() {
    if (typeof window.state === 'undefined') return;
    if (typeof window.saveState !== 'function') return;
    if (typeof window.renderTexts !== 'function') return;

    const next = window.state.lang === 'fr' ? 'en' : 'fr';
    window.state.lang = next;
    localStorage.setItem('dop_lang', next);
    localStorage.setItem('op_guess_lang', next);

    try { window.saveState(); } catch (e) {}

    try {
      const url = new URL(window.location.href);
      url.searchParams.set('lang', next);
      window.history.replaceState({}, '', url.toString());
    } catch (e) {}

    try { window.renderTexts(); } catch (e) {}
  }

  function replaceToggleButton() {
    if (!isGamePage()) return;
    const btn = document.getElementById('langToggle');
    if (!btn) return;
    if (btn.dataset.dopLangFixed === '1') return;

    const clone = btn.cloneNode(true);
    clone.dataset.dopLangFixed = '1';
    clone.onclick = null;

    clone.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      if (typeof event.stopImmediatePropagation === 'function') {
        event.stopImmediatePropagation();
      }
      switchGameLanguageWithoutReload();
      return false;
    }, true);

    btn.replaceWith(clone);
  }

  function installRobustly() {
    replaceToggleButton();
    setTimeout(replaceToggleButton, 50);
    setTimeout(replaceToggleButton, 250);
    setTimeout(replaceToggleButton, 1000);
    setTimeout(replaceToggleButton, 2000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installRobustly);
  } else {
    installRobustly();
  }

  window.addEventListener('load', installRobustly);
})();
