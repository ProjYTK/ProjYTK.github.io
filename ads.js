// RawReel sponsor pre-roll config. House ads only, no outside ad network.
// One pre-roll at most, never a mid-roll, and always skippable.
// Preview with &ads=1 on any watch.html link, even while enabled is false.
window.RR_ADS = {
  enabled: false,
  skipAfter: 5,   // seconds before "Skip ad" appears (clamped so it can never exceed maxLength)
  maxLength: 15,  // seconds; the ad ends on its own after this (hard cap 15)
  sponsors: [
    { name: 'RawReel', message: 'Your ad here: sponsor RawReel', link: 'about.html' }
  ]
};
