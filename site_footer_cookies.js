(function () {
  function getLang() {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('lang');
    const saved = localStorage.getItem('dop_lang');
    const htmlLang = document.documentElement.lang;
    return q || saved || (htmlLang && htmlLang.toLowerCase().startsWith('en') ? 'en' : 'fr');
  }

  function setLang(lang) {
    localStorage.setItem('dop_lang', lang);
  }

  function getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem('dop_user') || 'null');
    } catch {
      return null;
    }
  }

  function withLang(page, lang) {
    return `${page}?lang=${encodeURIComponent(lang)}`;
  }

  function privacyPage(lang) {
    return lang === 'en' ? 'Privacy_en.html' : 'Privacy.html';
  }

  function legalPage(lang) {
    return lang === 'en' ? 'Legal_en.html' : 'Legal.html';
  }

  function termsPage(lang) {
    return lang === 'en' ? 'Terms_en.html' : 'Terms.html';
  }

  function ensureStickyFooterLayout() {
    document.documentElement.style.minHeight = '100%';
    document.body.style.minHeight = '100vh';
    document.body.style.display = 'flex';
    document.body.style.flexDirection = 'column';
    document.body.style.alignItems = 'stretch';
    document.body.style.width = '100%';
  }

  function injectFooter() {
    if (document.getElementById('dop-footer')) return;
    const lang = getLang();
    const labels = {
      fr: {
        copyright: '© Daily One Piece',
        privacy: 'Politique de confidentialité',
        legal: 'Mentions légales',
        terms: 'CGU'
      },
      en: {
        copyright: '© Daily One Piece',
        privacy: 'Privacy Policy',
        legal: 'Legal Notice',
        terms: 'Terms of Use'
      }
    };
    const t = labels[lang] || labels.fr;
    const footer = document.createElement('footer');
    footer.id = 'dop-footer';
    footer.style.width = '100%';
    footer.style.background = 'rgba(17,24,39,0.95)';
    footer.style.borderTop = '1px solid rgba(255,255,255,.12)';
    footer.style.boxShadow = '0 -1px 0 rgba(255,255,255,.05) inset, 0 0 8px rgba(37,99,235,.35)';
    footer.style.marginTop = 'auto';
    footer.innerHTML = `
      <div style="max-width:1100px;margin:0 auto;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;color:#f8fafc;font-size:14px;gap:16px;flex-wrap:wrap;">
        <span>${t.copyright}</span>
        <div style="display:flex;gap:16px;flex-wrap:wrap;">
          <a href="${withLang(privacyPage(lang), lang)}" style="color:#93c5fd;text-decoration:none;">${t.privacy}</a>
          <a href="${withLang(legalPage(lang), lang)}" style="color:#93c5fd;text-decoration:none;">${t.legal}</a>
          <a href="${withLang(termsPage(lang), lang)}" style="color:#93c5fd;text-decoration:none;">${t.terms}</a>
        </div>
      </div>
    `;
    document.body.appendChild(footer);
  }

  function injectCookieBanner() {
    if (document.getElementById('dop-cookie-banner')) return;
    const existing = localStorage.getItem('dop_cookie_choice');
    if (existing === 'accepted' || existing === 'rejected') return;

    const lang = getLang();
    const labels = {
      fr: {
        text: "Ce site utilise des cookies techniques et pourra utiliser des cookies publicitaires pour financer le service. Vous pouvez accepter ou refuser les cookies non essentiels.",
        accept: "Accepter",
        reject: "Refuser",
        privacy: "En savoir plus"
      },
      en: {
        text: "This site uses technical cookies and may use advertising cookies to support the service. You can accept or reject non-essential cookies.",
        accept: "Accept",
        reject: "Reject",
        privacy: "Learn more"
      }
    };
    const t = labels[lang] || labels.fr;

    const banner = document.createElement('div');
    banner.id = 'dop-cookie-banner';
    banner.style.position = 'fixed';
    banner.style.left = '16px';
    banner.style.right = '16px';
    banner.style.bottom = '16px';
    banner.style.zIndex = '9999';
    banner.style.background = 'rgba(17,24,39,0.98)';
    banner.style.border = '1px solid rgba(255,255,255,.12)';
    banner.style.borderRadius = '16px';
    banner.style.boxShadow = '0 12px 30px rgba(0,0,0,.35)';
    banner.style.padding = '16px';
    banner.style.color = '#f8fafc';
    banner.innerHTML = `
      <div style="max-width:1100px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;">
        <div style="flex:1 1 520px;font-size:14px;line-height:1.5;">
          ${t.text}
          <a href="${withLang(privacyPage(lang), lang)}" style="color:#93c5fd;text-decoration:none;margin-left:6px;">${t.privacy}</a>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          <button id="dop-cookie-accept" style="border:0;border-radius:12px;padding:10px 16px;font-weight:700;cursor:pointer;background:#2563eb;color:white;">${t.accept}</button>
          <button id="dop-cookie-reject" style="border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:10px 16px;font-weight:700;cursor:pointer;background:rgba(255,255,255,.06);color:#f8fafc;">${t.reject}</button>
        </div>
      </div>
    `;
    document.body.appendChild(banner);

    document.getElementById('dop-cookie-accept').addEventListener('click', function () {
      localStorage.setItem('dop_cookie_choice', 'accepted');
      banner.remove();
    });

    document.getElementById('dop-cookie-reject').addEventListener('click', function () {
      localStorage.setItem('dop_cookie_choice', 'rejected');
      banner.remove();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    const lang = getLang();
    setLang(lang);
    ensureStickyFooterLayout();
    injectFooter();
    injectCookieBanner();
  });
})();