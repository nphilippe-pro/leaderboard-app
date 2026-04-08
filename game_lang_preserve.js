
(function () {
  function isGamePage() {
    return /jeu[1-8]\.html$/i.test(window.location.pathname);
  }

  function applyLanguageWithoutReload(next) {
    if (typeof window.state === 'undefined') return false;
    if (typeof window.saveState !== 'function') return false;
    if (typeof window.renderTexts !== 'function') return false;

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

    const btn = document.getElementById('langToggle');
    if (btn) btn.textContent = next.toUpperCase();

    return true;
  }

  function installCaptureHandler() {
    if (!isGamePage()) return;
    if (window.__dopGameLangCaptureInstalled) return;
    window.__dopGameLangCaptureInstalled = true;

    document.addEventListener('click', function (event) {
      const btn = event.target.closest('#langToggle');
      if (!btn) return;
      if (!isGamePage()) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      const current = (window.state && window.state.lang) ? window.state.lang : (localStorage.getItem('dop_lang') || 'fr');
      const next = current === 'fr' ? 'en' : 'fr';
      applyLanguageWithoutReload(next);
      return false;
    }, true);
  }

  function exposeHelpers() {
    if (!isGamePage()) return;
    installCaptureHandler();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', exposeHelpers);
  } else {
    exposeHelpers();
  }

  window.DOPGameLangPreserve = { applyLanguageWithoutReload };
})();
