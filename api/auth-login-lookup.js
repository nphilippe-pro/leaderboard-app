const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  try {
    const pseudo = String(req.query.pseudo || '').trim();
    if (!pseudo) {
      return res.status(400).json({ error: 'pseudo is required' });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data, error } = await supabase
      .from('profiles')
      .select('email')
      .ilike('pseudo', pseudo)
      .limit(1)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    if (!data?.email) {
      return res.status(404).json({ error: 'Pseudo introuvable' });
    }

    return res.status(200).json({ email: data.email });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Server error' });
  }
};
