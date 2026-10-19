// RawReel video catalog. One object per video; order here is the order on the site.
//
// Entry format (only `id` is required):
//   id          Internet Archive identifier (archive.org/details/<id>), or a clip.place video id
//   host        "archive" (default) or "clipplace"
//   category    "classic" = public-domain / verified Creative Commons film (Home + classics.html)
//               "channel" = a creator's backed-up channel video ("Backed-up channels")
//   title       display title (falls back to the Archive title, then the id)
//   creator     director, studio or channel name
//   year        release year (classics)
//   date        YYYY-MM-DD the item was added (taken from the Archive item's publicdate/addeddate,
//               or clip.place publishedAt). Shown as "Added Oct 19, 2026" on channel/submitted videos only;
//               classics show just their year. Omit to show no date
//   rights      one short sentence: WHY it is free to show
//   rightsNote  optional extra caveat shown under the rights line
//   source      Archive page; defaults to https://archive.org/details/<id>
//   yearSource  optional link that backs up the year
//   file        optional exact .mp4 name inside the Archive item; the player tries it first
//   license     optional, e.g. "CC BY 4.0" for verified Creative Commons items
//   hold        true = not shown anywhere (cards, Up next, watch page) until the rights check is done
//   classicsOnly true = listed only on classics.html (not Home or Up next); the watch link still works
//   silent      true = the added music isn't cleared: the player locks audio off and hides Download
//   holdReason  why it is held
//
// Adding a batch: one classic(...) line per item in CLASSICS:
//   classic("Archive_Id", "Title", 1925, "Director", US, { file: "Film.mp4", yearSource: "https://..." }),
// Use US for US films, FOREIGN("German") etc. for non-US films, or write your own rights sentence.
// Only add a classic after checking it: published 1930 or earlier, or an explicit Creative Commons
// license on the Archive page. Watch for modern added soundtracks and later re-releases; mark those hold: true.
(function () {
  var US = 'US film published before 1931, so it is in the US public domain.';
  function FOREIGN(country) { return country + ' film published before 1931, so it is in the US public domain. Rights in other countries may differ.'; }
  function classic(id, title, year, creator, rights, extra) {
    var v = { id: id, category: 'classic', title: title, year: year, creator: creator, rights: rights };
    for (var k in (extra || {})) v[k] = extra[k];
    return v;
  }

  var CLASSICS = [
    classic('CC_1916_09_04_TheCount', 'The Count', 1916, 'Charlie Chaplin', US, { date: "2006-12-23", yearSource: 'https://en.wikipedia.org/wiki/The_Count_(1916_film)' }),
    classic("silent-the-great-train-robbery", "The Great Train Robbery", 1903, "Edwin S. Porter", US, { date: "2020-12-05", file: "The Great Train Robbery.mp4", yearSource: "https://en.wikipedia.org/wiki/The_Great_Train_Robbery_(1903_film)" }),
    classic("ATripToTheMoonGeorgeMelies", "A Trip to the Moon", 1902, "Georges Méliès", FOREIGN("French"), { date: "2017-04-10", file: "A Trip to the Moon-George Méliès.mp4", yearSource: "https://en.wikipedia.org/wiki/A_Trip_to_the_Moon", silent: true }),
    classic("CC_1917_06_17_TheImmigrant", "The Immigrant", 1917, "Charlie Chaplin", US, { date: "2006-12-23", file: "CC_1917_06_17_TheImmigrant_512kb.mp4", yearSource: "https://en.wikipedia.org/wiki/The_Immigrant_(1917_film)", silent: true }),
    classic("CC_1916_12_04_TheRink", "The Rink", 1916, "Charlie Chaplin", US, { date: "2006-12-23", file: "CC_1916_12_04_TheRink_512kb.mp4", yearSource: "https://en.wikipedia.org/wiki/The_Rink_(film)", silent: true }),
    classic("EasyStreet1917", "Easy Street", 1917, "Charlie Chaplin", US, { date: "2013-12-22", file: "Easy-Street-v2.mp4", yearSource: "https://en.wikipedia.org/wiki/Easy_Street_(film)" }),
    classic("CC_1917_10_22_TheAdventurer", "The Adventurer", 1917, "Charlie Chaplin", US, { date: "2006-12-23", file: "CC_1917_10_22_TheAdventurer_512kb.mp4", yearSource: "https://en.wikipedia.org/wiki/The_Adventurer_(1917_film)", silent: true }),
    classic("CC_1917_04_16_TheCure", "The Cure", 1917, "Charlie Chaplin", US, { date: "2006-12-26", file: "CC_1917_04_16_TheCure_512kb.mp4", yearSource: "https://en.wikipedia.org/wiki/The_Cure_(1917_film)", silent: true }),
    classic("TheTramp1915", "The Tramp", 1915, "Charlie Chaplin", US, { date: "2017-12-30", file: "The-Tramp (1915).mp4", yearSource: "https://en.wikipedia.org/wiki/The_Tramp_(film)" }),
    classic("the-gold-rush-film-1925", "The Gold Rush", 1925, "Charlie Chaplin", US, { date: "2025-09-16", file: "The-Gold-Rush-1925.mp4", yearSource: "https://en.wikipedia.org/wiki/The_Gold_Rush" }),
    classic("The_General_Buster_Keaton", "The General", 1926, "Buster Keaton, Clyde Bruckman", US, { date: "2008-04-15", file: "The_General.mp4", yearSource: "https://en.wikipedia.org/wiki/The_General_(1926_film)" }),
    classic("MyMovie_20190318", "Sherlock Jr.", 1924, "Buster Keaton", US, { date: "2019-03-18", file: "My Movie.mp4", yearSource: "https://en.wikipedia.org/wiki/Sherlock_Jr." }),
    classic("steamboat_bill_ipod", "Steamboat Bill, Jr.", 1928, "Charles Reisner", US, { date: "2007-06-04", file: "steamboat_bill.mp4", yearSource: "https://en.wikipedia.org/wiki/Steamboat_Bill,_Jr.", silent: true }),
    classic("OneWeek", "One Week", 1920, "Buster Keaton, Edward F. Cline", US, { date: "2006-08-12", file: "One_Week_512kb.mp4", yearSource: "https://en.wikipedia.org/wiki/One_Week_(1920_film)", silent: true }),
    classic("Cops1922", "Cops", 1922, "Buster Keaton, Edward F. Cline", US, { date: "2013-12-22", file: "Cops-v2.mp4", yearSource: "https://en.wikipedia.org/wiki/Cops_(1922_film)" }),
    classic("mymovie_202004", "The Navigator", 1924, "Buster Keaton, Donald Crisp", US, { date: "2020-04-05", file: "My Movie.ia.mp4", yearSource: "https://en.wikipedia.org/wiki/The_Navigator_(1924_film)" }),
    classic("SafetyLastHaroldLloyd1923.FullMovieexcellentQuality.", "Safety Last!", 1923, "Fred C. Newmeyer, Sam Taylor", US, { date: "2018-04-11", file: "Safety Last - Harold Lloyd 1923. Full movie,excellent quality..mp4", yearSource: "https://en.wikipedia.org/wiki/Safety_Last!", silent: true }),
    classic("CollegeDays", "The Freshman", 1925, "Fred C. Newmeyer, Sam Taylor", US, { date: "2020-04-20", file: "IMG_7817.mp4", yearSource: "https://en.wikipedia.org/wiki/The_Freshman_(1925_film)", silent: true }),
    classic("Nosferatu_most_complete_version_93_mins.", "Nosferatu", 1922, "F. W. Murnau", FOREIGN("German"), { date: "2007-04-10", file: "Nosferatu_1922_Symphony_of_Horror_512kb.mp4", yearSource: "https://en.wikipedia.org/wiki/Nosferatu", silent: true }),
    classic("metropolis-channing-pollock-cut", "Metropolis", 1927, "Fritz Lang", FOREIGN("German"), { date: "2024-04-28", file: "Metropolis (Channing Pollock Cut).mp4", yearSource: "https://en.wikipedia.org/wiki/Metropolis_(1927_film)", rightsNote: "Abridged 1927 US version (Channing Pollock cut).", classicsOnly: true }),
    classic("DasKabinettdesDoktorCaligariTheCabinetofDrCaligari", "The Cabinet of Dr. Caligari", 1920, "Robert Wiene", FOREIGN("German"), { date: "2005-07-18", file: "The_Cabinet_of_Dr._Caligari_512kb.mp4", yearSource: "https://en.wikipedia.org/wiki/The_Cabinet_of_Dr._Caligari", silent: true }),
    classic("ThePhantomoftheOpera", "The Phantom of the Opera", 1925, "Rupert Julian", US, { date: "2005-10-26", file: "Phantom_of_the_Opera_512kb.mp4", yearSource: "https://en.wikipedia.org/wiki/The_Phantom_of_the_Opera_(1925_film)", silent: true }),
    classic("BattleshipPotemkin", "Battleship Potemkin", 1925, "Sergei Eisenstein", FOREIGN("Soviet"), { date: "2005-10-22", file: "Battleship_Potemkin_512kb.mp4", yearSource: "https://en.wikipedia.org/wiki/Battleship_Potemkin", silent: true }),
    classic("sunrise-a-song-of-two-humans-f.-w.-murnau-1927", "Sunrise: A Song of Two Humans", 1927, "F. W. Murnau", US, { date: "2020-05-17", file: "Sunrise A Song of Two Humans - F.W. Murnau (1927).ia.mp4", yearSource: "https://en.wikipedia.org/wiki/Sunrise:_A_Song_of_Two_Humans", silent: true }),
    classic("lost_world", "The Lost World", 1925, "Harry O. Hoyt", US, { date: "2005-06-20", file: "lost_world.mp4", yearSource: "https://en.wikipedia.org/wiki/The_Lost_World_(1925_film)", silent: true }),
    classic("DrJekyllandMrHyde", "Dr. Jekyll and Mr. Hyde", 1920, "John S. Robertson", US, { date: "2006-11-26", file: "DrJekyllandMrHyde_512kb.mp4", yearSource: "https://en.wikipedia.org/wiki/Dr._Jekyll_and_Mr._Hyde_(1920_film)", silent: true }),
    classic("steamboat-willie_1928", "Steamboat Willie", 1928, "Walt Disney, Ub Iwerks", US, { date: "2024-01-02", file: "steamboat-willie_1928.mp4", yearSource: "https://en.wikipedia.org/wiki/Steamboat_Willie", rightsNote: "Only this original version is public domain. Mickey Mouse is still a Disney trademark, so RawReel never uses him in its branding." }),
    classic("Felix_inHollywood_NoAudio", "Felix in Hollywood", 1923, "Otto Messmer / Pat Sullivan", US, { date: "2006-01-29", file: "Felix_inHollywood_NoAudio_512kb.mp4", yearSource: "https://en.wikipedia.org/wiki/Felix_in_Hollywood" }),
    classic("Gertie", "Gertie the Dinosaur", 1914, "Winsor McCay", US, { date: "2007-10-26", file: "GertietheDinosaur.mp4", yearSource: "https://en.wikipedia.org/wiki/Gertie_the_Dinosaur", silent: true }),
    classic("PlaneCrazy_201511", "Plane Crazy", 1929, "Walt Disney, Ub Iwerks", US, { date: "2015-11-11", file: "Plane Crazy.mp4", yearSource: "https://en.wikipedia.org/wiki/Plane_Crazy", rightsNote: "Only this original version is public domain. Mickey Mouse is still a Disney trademark, so RawReel never uses him in its branding.", silent: true }),
    classic("the-skeleton-dance_1929", "The Skeleton Dance", 1929, "Walt Disney", US, { date: "2024-12-18", file: "the-skeleton-dance_1929.mp4", yearSource: "https://en.wikipedia.org/wiki/The_Skeleton_Dance" })
  ];

  var CHANNELS = [
    { id: 'sSUJPQzV9V9ps2HR58rctR', date: '2026-10-19', host: 'clipplace', category: 'channel', title: 'RawReel test clip (clip.place backup)', creator: 'RawReel' },
    { id: 'rawreel-test-clip', date: '2026-10-19', category: 'channel', title: 'RawReel test clip', creator: 'RawReel', note: 'Our own CC0 test upload' }
  ];

  var all = CLASSICS.concat(CHANNELS).map(function (v) {
    v.host = v.host || 'archive';
    if (!v.source && v.host === 'archive') v.source = 'https://archive.org/details/' + encodeURIComponent(v.id);
    return v;
  });
  window.VIDEOS_HELD = all.filter(function (v) { return v.hold; });  // for the team only; never rendered
  window.VIDEOS = all.filter(function (v) { return !v.hold; });
})();
