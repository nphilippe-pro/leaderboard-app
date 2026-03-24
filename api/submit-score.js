const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { userId, score } = req.body || {};

    if (!userId || typeof score !== 'number') {
      return res.status(400).json({ error: 'userId and numeric score are required' });
    }

    const { error } = await supabase.from('profiles').update({ score }).eq('id', userId);
    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Server error' });
  }
};
