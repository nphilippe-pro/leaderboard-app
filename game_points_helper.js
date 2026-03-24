
(function () {
  let supabaseClientPromise = null;

  async function getPublicConfig() {
    const response = await fetch('/api/public-config');
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || 'Unable to load Supabase config');
    }
    if (!payload.supabaseUrl || !payload.supabaseAnonKey) {
      throw new Error('Missing Supabase public config');
    }
    return payload;
  }

  async function getSupabaseClient() {
    if (!window.supabase || !window.supabase.createClient) {
      throw new Error('Supabase client library not loaded');
    }
    if (!supabaseClientPromise) {
      supabaseClientPromise = getPublicConfig().then((cfg) => (
        window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey)
      ));
    }
    return supabaseClientPromise;
  }

  function getPointsForAttempts(attempts) {
    const table = {
      1: 100, 2: 100, 3: 100,
      4: 90, 5: 80, 6: 70, 7: 60, 8: 50, 9: 40, 10: 30,
      11: 20, 12: 10, 13: 5, 14: 3, 15: 2, 16: 1
    };
    return table[attempts] || 0;
  }

  async function getConnectedUser() {
    const client = await getSupabaseClient();
    const { data, error } = await client.auth.getSession();
    if (error) throw error;
    return data.session?.user || null;
  }

  async function submitGameScore(gameKey, attempts) {
    const user = await getConnectedUser();
    if (!user) {
      return {
        skipped: true,
        reason: 'not_logged_in',
        pointsAwarded: 0
      };
    }

    const response = await fetch('/api/submit-game-result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        gameKey,
        attempts
      })
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || 'Unable to submit score');
    }
    return payload;
  }

  window.DOPPoints = {
    getPointsForAttempts,
    getConnectedUser,
    submitGameScore
  };
})();
