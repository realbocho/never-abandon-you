const { getSupabase } = require('../../_lib/supabase');
const { getWebPush }  = require('../../_lib/webpush');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { code } = req.query;
  const { senderRole, text, tag } = req.body;

  const supabase = getSupabase();
  const { data: room, error } = await supabase
    .from('rooms').select('*').eq('code', code).maybeSingle();

  if (error || !room) return res.status(404).json({ error: '방 없음' });
  if (room.status !== 'active') return res.status(400).json({ error: '비활성 방' });

  const isHost = senderRole === 'host';

  // pulse 증가 (폴링용)
  const pulseCol = isHost ? 'host_notif_pulse' : 'guest_notif_pulse';
  const textCol  = isHost ? 'host_notif_text'  : 'guest_notif_text';
  const curPulse = (isHost ? room.host_notif_pulse : room.guest_notif_pulse) || 0;

  await supabase.from('rooms').update({
    [pulseCol]: curPulse + 1,
    [textCol]:  text || (isHost ? room.host_notif_text : room.guest_notif_text),
  }).eq('code', code);

  // Web Push
  const targetSub  = isHost ? room.guest_subscription : room.host_subscription;
  const senderName = isHost ? room.host_name : room.guest_name;
  const notifText  = text || (isHost ? room.host_notif_text : room.guest_notif_text);

  if (!targetSub) return res.json({ ok: true, pushed: false });

  try {
    const wp = getWebPush();
    await wp.sendNotification(
      targetSub,
      JSON.stringify({
        title: `${senderName}이(가) 눌렀어요!`,
        body:  notifText,
        icon:  '/icon.png',
        tag:   tag || `push-${Date.now()}`, // 고유 tag → 알림 묶음 방지
      })
    );
    res.json({ ok: true, pushed: true });
  } catch (err) {
    if (err.statusCode === 410) {
      const subCol = isHost ? 'guest_subscription' : 'host_subscription';
      await supabase.from('rooms').update({ [subCol]: null }).eq('code', code);
    }
    res.status(500).json({ error: 'push 실패', detail: err.body });
  }
};
