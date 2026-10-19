// RawReel site config. The ONE switch for the PeerTube hookup at video.rawreel.org.
// false = the site behaves exactly as before (mailto submissions, no sign-in).
// true  = header Sign in / Sign up, real file upload on upload.html, real channel pages.
window.RR_CONFIG = {
  PEERTUBE_ENABLED: false,
  PEERTUBE_URL: 'https://video.rawreel.org',     // fixed forever after PeerTube's first start (FRIDAY-GUIDE §5)
  PEERTUBE_MUSIC_CHANNEL: 'rawreplay',           // RawReplay music channel (FRIDAY-GUIDE §15)
  // Default avatars for the picker on signup.html and account.html. Drop square PNGs in avatars/ and list them here.
  AVATARS: [
    { file: 'avatars/orb.png', label: 'Green orb' },
    { file: 'avatars/01-fox.png', label: 'Red fox' },
    { file: 'avatars/02-owl.png', label: 'Owl' },
    { file: 'avatars/03-cat.png', label: 'Cat' },
    { file: 'avatars/04-goldfish.png', label: 'Goldfish' },
    { file: 'avatars/05-jupiter.png', label: 'Jupiter' },
    { file: 'avatars/06-saturn.png', label: 'Saturn' },
    { file: 'avatars/07-film-reel.png', label: 'Film reel' },
    { file: 'avatars/08-movie-camera.png', label: 'Movie camera' },
    { file: 'avatars/10-headphones.png', label: 'Headphones' },
    { file: 'avatars/11-mountain-lake.png', label: 'Mountain lake' },
    { file: 'avatars/12-hedgehog.png', label: 'Hedgehog' },
  ]
};
