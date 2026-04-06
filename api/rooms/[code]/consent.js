const { getSupabase } = require('../../_lib/supabase');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { code } = req.query;
  const { role, notifText, subscription } = req.body;
  if (!role || !notifText) return res.status(400).json({ error: '필드 누락' });

  const supabase = getSupabase();
  const { data: room, error } = await supabase
    .from('rooms').select('*').eq('code', code).maybeSingle();
  if (error || !room) return res.status(404).json({ error: '방 없음' });

  const isHost = role === 'host';
  const update = {
    [isHost ? 'host_consent'      : 'guest_consent']:      true,
    [isHost ? 'host_notif_text'   : 'guest_notif_text']:   notifText,
    [isHost ? 'host_subscription' : 'guest_subscription']: subscription || null,
  };

  const otherConsent = isHost ? room.guest_consent : room.host_consent;
  if (otherConsent) update.status = 'active';

  const { error: e2 } = await supabase.from('rooms').update(update).eq('code', code);
  if (e2) return res.status(500).json({ error: e2.message });
  res.json({ ok: true });
};
