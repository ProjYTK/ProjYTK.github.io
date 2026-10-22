// RawReel site config. The ONE switch for the PeerTube hookup at video.rawreel.org.
// false = the site behaves exactly as before (mailto submissions, no sign-in).
// true  = header Sign in / Sign up, real file upload on upload.html, real channel pages.
window.RR_CONFIG = {
  PEERTUBE_ENABLED: false,
  PEERTUBE_URL: 'https://video.rawreel.org',     // fixed forever after PeerTube's first start (FRIDAY-GUIDE §5)
  PEERTUBE_MUSIC_CHANNEL: 'rawreplay',           // RawReplay music channel (FRIDAY-GUIDE §15)
  // EXTRA_ALLOWED_IDS: Internet Archive IDs that watch.html may play even though they are not in videos.js.
  // watch.html plays ONLY ids in videos.js (not held) plus this list; any other ?v= shows "Video not found".
  // Kept by hand: add an Archive upload made before Friday here until it gets its own videos.js entry.
  // (rawreel-upload-test, the permanent upload test clip, is already in videos.js, so it is not repeated here.)
  EXTRA_ALLOWED_IDS: [],
  // DEFAULT_AVATAR: pre-selected in the pickers and used as the fallback wherever no avatar is chosen (style.css .avatar).
  DEFAULT_AVATAR: 'avatars/13-head-grey.png',
  // Default avatars for the picker on signup.html and account.html. Drop square PNGs in avatars/ and list them here.
  AVATARS: [
    // Hidden on purpose: the green orb is the RawReel logo, so it is not offered as a profile picture.
    // Remove hidden: true to re-enable it in the signup and account pickers.
    { file: 'avatars/orb.png', label: 'Green orb', hidden: true },
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
    { file: 'avatars/13-head-grey.png', label: 'Grey head' },
    { file: 'avatars/14-head-blue.png', label: 'Blue head' },
    { file: 'avatars/15-head-green.png', label: 'Green head' },
    { file: 'avatars/16-head-navy.png', label: 'Navy head' },
  ]
};
