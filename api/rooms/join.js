const { getSupabase } = require('../_lib/supabase');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { code, guestName } = req.body;
  if (!code || !guestName) return res.status(400).json({ error: '코드/이름 필요' });

  const supabase = getSupabase();
  const { data: room, error } = await supabase
    .from('rooms').select('*').eq('code', code.toUpperCase()).maybeSingle();

  if (error || !room) return res.status(404).json({ error: '방을 찾을 수 없어요' });
  if (room.guest_name) return res.status(409).json({ error: '이미 누군가 참가한 방이에요' });
  if (room.status === 'closed') return res.status(410).json({ error: '닫힌 방이에요' });

  const { error: e2 } = await supabase
    .from('rooms')
    .update({ guest_name: guestName, status: 'consent' })
    .eq('code', code.toUpperCase());

  if (e2) return res.status(500).json({ error: e2.message });
  res.json({ hostName: room.host_name });
};
