// RawReel site config. The ONE switch for the PeerTube hookup at video.rawreel.org.
// false = the site behaves exactly as before (mailto submissions, no sign-in).
// true  = header Sign in / Sign up, real file upload on upload.html, real channel pages.
window.RR_CONFIG = {
  PEERTUBE_ENABLED: false,
  PEERTUBE_URL: 'https://video.rawreel.org',     // fixed forever after PeerTube's first start (FRIDAY-GUIDE §5)
  PEERTUBE_MUSIC_CHANNEL: 'rawreplay',           // RawReplay music channel (FRIDAY-GUIDE §15)
  // Default avatars for the picker on signup.html and account.html. Drop square PNGs in avatars/ and list them here.
  AVATARS: [
    { file: 'avatars/orb.png', label: 'Green orb' }
  ]
};
