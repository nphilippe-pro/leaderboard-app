
(function () {
  const DOPSessionNav = {
    async ensureSupabaseLoaded() {
      if (window.supabase && window.supabase.createClient) return;
      await new Promise((resolve, reject) => {
        const existing = document.querySelector('script[data-dop-supabase="1"]');
        if (existing) {
          existing.addEventListener('load', resolve, { once: true });
          existing.addEventListener('error', reject, { once: true });
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
        script.async = true;
        script.dataset.dopSupabase = '1';
        script.addEventListener('load', resolve, { once: true });
        script.addEventListener('error', reject, { once: true });
        document.head.appendChild(script);
      });
    },

    async getClient() {
      if (window.__dopSupabaseClient) return window.__dopSupabaseClient;
      await this.ensureSupabaseLoaded();
      const response = await fetch('/api/public-config');
      const config = await response.json();
      if (!response.ok || !config.supabaseUrl || !config.supabaseAnonKey) {
        throw new Error(config.error || 'Supabase config unavailable');
      }
      window.__dopSupabaseClient = window.supabase.createClient(
        config.supabaseUrl,
        config.supabaseAnonKey
      );
      return window.__dopSupabaseClient;
    },

    getLang() {
      const q = new URLSearchParams(window.location.search).get('lang');
      return q || localStorage.getItem('dop_lang') || (document.documentElement.lang || 'fr').slice(0,2);
    },

    withLang(page, lang) {
      return `${page}?lang=${encodeURIComponent(lang || this.getLang())}`;
    },

    async getCurrentUser() {
      try {
        const client = await this.getClient();
        const { data, error } = await client.auth.getSession();
        if (error) throw error;
        return data.session?.user || null;
      } catch (error) {
        return null;
      }
    },

    async getCurrentProfile() {
      try {
        const user = await this.getCurrentUser();
        if (!user) return null;
        const client = await this.getClient();
        const { data } = await client
          .from('profiles')
          .select('pseudo, email, score')
          .eq('id', user.id)
          .maybeSingle();
        if (data) {
          localStorage.setItem('dop_user', JSON.stringify({
            pseudo: data.pseudo || '',
            email: data.email || user.email || '',
            score: data.score || 0
          }));
        }
        return data || null;
      } catch (error) {
        return null;
      }
    },

    async signOut() {
      try {
        const client = await this.getClient();
        await client.auth.signOut();
      } catch (error) {}
      localStorage.removeItem('dop_user');
    },

    async applyTopbar() {
      const lang = this.getLang() === 'en' ? 'en' : 'fr';
      localStorage.setItem('dop_lang', lang);

      const labels = {
        fr: { home: 'Accueil', leaderboard: 'Classement', login: 'Connexion', account: 'Mon compte', lang: 'FR' },
        en: { home: 'Home', leaderboard: 'Leaderboard', login: 'Login', account: 'My account', lang: 'EN' }
      };
      const t = labels[lang];

      const user = await this.getCurrentUser();
      await this.getCurrentProfile();

      const homeBtn = document.getElementById('homeBtn');
      const leaderboardBtn = document.getElementById('leaderboardBtn');
      const loginBtn = document.getElementById('loginBtn');
      const langToggle = document.getElementById('langToggle');

      if (homeBtn) {
        homeBtn.textContent = t.home;
        homeBtn.onclick = () => { window.location.href = this.withLang('Homepage.html', lang); };
      }
      if (leaderboardBtn) {
        leaderboardBtn.textContent = t.leaderboard;
        leaderboardBtn.onclick = () => { window.location.href = this.withLang('Leaderboard.html', lang); };
      }
      if (loginBtn) {
        loginBtn.textContent = user ? t.account : t.login;
        loginBtn.onclick = () => {
          window.location.href = this.withLang(user ? 'Account.html' : 'Login.html', lang);
        };
      }
      if (langToggle) {
        langToggle.textContent = t.lang;
        langToggle.onclick = () => {
          const next = lang === 'fr' ? 'en' : 'fr';
          localStorage.setItem('dop_lang', next);
          const params = new URLSearchParams(window.location.search);
          params.set('lang', next);
          window.location.search = params.toString();
        };
      }

      if (window.location.pathname.endsWith('/Account.html') || window.location.pathname.endsWith('Account.html')) {
        if (!user) {
          window.location.href = this.withLang('Login.html', lang);
        }
      }
    },

    async init() {
      await this.applyTopbar();
      try {
        const client = await this.getClient();
        client.auth.onAuthStateChange(async () => {
          await this.applyTopbar();
        });
      } catch (error) {}
    }
  };

  window.DOPSessionNav = DOPSessionNav;
  document.addEventListener('DOMContentLoaded', () => {
    DOPSessionNav.init();
  });
})();
