const { getSupabase } = require('../_lib/supabase');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { code } = req.query;
  const supabase = getSupabase();

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('rooms').select('*').eq('code', code).maybeSingle();
    if (error || !data) return res.status(404).json({ error: '방 없음' });
    return res.json(data);
  }

  if (req.method === 'DELETE') {
    await supabase.from('rooms').update({ status: 'closed' }).eq('code', code);
    return res.json({ ok: true });
  }

  res.status(405).end();
};
