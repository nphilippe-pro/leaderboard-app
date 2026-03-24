const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, gameKey, attempts } = req.body || {};

    if (!userId || !gameKey || !Number.isInteger(attempts) || attempts < 1) {
      return res.status(400).json({ error: 'userId, gameKey and integer attempts >= 1 are required' });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data, error } = await supabase.rpc('submit_game_points', {
      p_user_id: userId,
      p_game_key: gameKey,
      p_attempts: attempts
    });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const result = Array.isArray(data) ? data[0] : data;

    if (!result) {
      return res.status(500).json({ error: 'Empty result from submit_game_points' });
    }

    return res.status(200).json({
      ok: true,
      accepted: !!result.accepted,
      alreadyPlayed: !!result.already_played,
      pointsAwarded: Number(result.points_awarded || 0),
      attempts: Number(result.attempts || attempts),
      totalScore: Number(result.total_score || 0)
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Server error' });
  }
};
