const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  try {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize || '100', 10)));
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('leaderboard_public')
      .select('pseudo, score', { count: 'exact' })
      .order('score', { ascending: false })
      .order('pseudo', { ascending: true })
      .range(from, to);

    if (error) return res.status(500).json({ error: error.message });

    const total = count || 0;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const players = (data || []).map((player, index) => ({
      position: from + index + 1,
      pseudo: player.pseudo,
      score: player.score
    }));

    return res.status(200).json({ page, pageSize, total, totalPages, players });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Server error' });
  }
};
