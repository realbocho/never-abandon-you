const { getSupabase } = require('../_lib/supabase');

function makeCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { hostName } = req.body;
  if (!hostName) return res.status(400).json({ error: '이름 필요' });

  const supabase = getSupabase();
  let code, exists = true;
  while (exists) {
    code = makeCode();
    const { data } = await supabase.from('rooms').select('code').eq('code', code).maybeSingle();
    exists = !!data;
  }

  const { error } = await supabase.from('rooms').insert({
    code,
    host_name: hostName,
    host_consent: false,
    host_notif_text: '',
    host_subscription: null,
    host_notif_pulse: 0,
    guest_name: null,
    guest_consent: false,
    guest_notif_text: '',
    guest_subscription: null,
    guest_notif_pulse: 0,
    status: 'waiting',
  });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ code });
};
