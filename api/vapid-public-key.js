module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({ key: process.env.VAPID_PUBLIC_KEY });
};
