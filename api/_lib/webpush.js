const webpush = require('web-push');

let _init = false;
function getWebPush() {
  if (!_init) {
    webpush.setVapidDetails(
      process.env.VAPID_MAILTO,
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
    _init = true;
  }
  return webpush;
}

module.exports = { getWebPush };
