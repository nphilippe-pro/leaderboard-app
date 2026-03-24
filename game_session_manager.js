
const GAME_MODE_BY_ID = {
  jeu1: "scan",
  jeu2: "scan",
  jeu3: "scan",
  jeu4: "scan",
  jeu5: "anime",
  jeu6: "anime",
  jeu7: "anime",
  jeu8: "anime",
};

let supabaseClient = null;

async function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;

  const response = await fetch("/api/public-config");
  const config = await response.json();

  if (!response.ok || !config.supabaseUrl || !config.supabaseAnonKey) {
    throw new Error(config.error || "Impossible de charger la configuration Supabase");
  }

  supabaseClient = window.supabase.createClient(
    config.supabaseUrl,
    config.supabaseAnonKey
  );

  return supabaseClient;
}

async function getCurrentUser() {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error("Session error:", error.message);
    return null;
  }

  return data.session?.user || null;
}

async function canPlayGame(gameId) {
  const supabase = await getSupabaseClient();
  const user = await getCurrentUser();

  if (!user) {
    return { allowed: false, reason: "not_logged_in" };
  }

  const mode = GAME_MODE_BY_ID[gameId];

  const { data, error } = await supabase.rpc("can_play_today", {
    uid: user.id,
    mode,
  });

  if (error) {
    console.error("can_play_today error:", error.message);
    return { allowed: false, reason: "server_error" };
  }

  return { allowed: !!data, reason: data ? null : "daily_limit_or_wrong_mode" };
}

async function recordGameSession(gameId, attempts) {
  const supabase = await getSupabaseClient();
  const user = await getCurrentUser();

  if (!user) {
    return { ok: false, reason: "not_logged_in" };
  }

  const mode = GAME_MODE_BY_ID[gameId];

  const { data: points, error: pointsError } = await supabase.rpc("calculate_points", {
    attempts,
  });

  if (pointsError) {
    console.error("calculate_points error:", pointsError.message);
    return { ok: false, reason: "points_error" };
  }

  const { error: insertError } = await supabase.from("game_sessions").insert({
    user_id: user.id,
    game_mode: mode,
    game_id: gameId,
    attempts,
    points,
  });

  if (insertError) {
    console.error("game_sessions insert error:", insertError.message);
    return { ok: false, reason: "insert_error", error: insertError.message };
  }

  const { error: addScoreError } = await supabase.rpc("add_score", {
    uid: user.id,
    attempts,
  });

  if (addScoreError) {
    console.error("add_score error:", addScoreError.message);
    return { ok: false, reason: "score_error", error: addScoreError.message };
  }

  return { ok: true, points };
}

window.GameSessionManager = {
  GAME_MODE_BY_ID,
  getSupabaseClient,
  getCurrentUser,
  canPlayGame,
  recordGameSession
};
