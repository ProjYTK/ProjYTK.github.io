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
//   licenseUrl  link to the license deed (CC items)
//   credit      attribution text, shown as "Credit" in the Source and rights box (required for CC BY)
//   rightsLabel overrides the "Public domain" label, e.g. "US government work (public domain)"
//   mission     NASA films: mission name and year, e.g. "Apollo 11 (1969)"
//   contentWarning  full sentence shown before play (click to continue); the card gets a "Content warning" tag
//   musicCredit separate music credit shown next to the film credit
//   runtime     real runtime of this file, e.g. "21.8 min"; runtimeNote explains a difference from the original
//   fileOnly    true = play only `file` (no fallback to other .mp4s in the item); Download links only to it
//   hold        true = not shown anywhere (cards, Up next, watch page) until the rights check is done
//   classicsOnly true = listed only on classics.html (not Home or Up next); the watch link still works
//   silent      true = the added music isn't cleared: the player locks audio off and hides Download
//   holdReason  why it is held
//
// Adding a batch: one classic(...) line per item in CLASSICS:
//   classic("Archive_Id", "Title", 1925, "Director", US, { file: "Film.mp4", yearSource: "https://..." }),
// Use US for US films, FOREIGN("German") etc. for non-US films, or write your own rights sentence.
// Only add a classic after checking its rights: a US release from 1930 or earlier (US public domain),
// a verified Creative Commons license such as CC BY (e.g. the Blender films), a US government work
// (e.g. NASA films), or a Public Domain Mark on the Archive page. Watch for modern added soundtracks and later re-releases; mark those hold: true.
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
    classic("the-immigrant-1917_202304", "The Immigrant", 1917, "Charlie Chaplin", US, { date: "2023-04-30", file: "The Immigrant (1917).mp4", license: "Public Domain Mark 1.0", licenseUrl: "https://creativecommons.org/publicdomain/mark/1.0/", runtime: "about 24 min", rightsNote: "This copy has no audio track.", yearSource: "https://en.wikipedia.org/wiki/The_Immigrant_(1917_film)" }),
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
    classic("the-skeleton-dance_1929", "The Skeleton Dance", 1929, "Walt Disney", US, { date: "2024-12-18", file: "the-skeleton-dance_1929.mp4", yearSource: "https://en.wikipedia.org/wiki/The_Skeleton_Dance" }),
    // ---- Batch 2 (2026-10-19): Blender open movies (CC BY), NASA Apollo film (US government work), silent features ----
    classic("BigBuckBunny_124", "Big Buck Bunny", 2008, "Sacha Goedegebure", "Blender Foundation open movie, released under a Creative Commons Attribution (CC BY 3.0) license, so it can be shown free with credit.", { date: "2011-07-01", file: "Content/big_buck_bunny_720p_surround.mp4", yearSource: "https://en.wikipedia.org/wiki/Big_Buck_Bunny", license: "CC BY 3.0", licenseUrl: "http://creativecommons.org/licenses/by/3.0/", credit: "\"Big Buck Bunny\" (c) copyright 2008, Blender Foundation / www.bigbuckbunny.org, CC BY 3.0", fileOnly: true }),
    classic("Sintel", "Sintel", 2010, "Colin Levy", "Blender Foundation open movie, released under a Creative Commons Attribution (CC BY 3.0) license, so it can be shown free with credit.", { date: "2010-10-01", file: "sintel-2048-surround.mp4", yearSource: "https://en.wikipedia.org/wiki/Sintel", license: "CC BY 3.0", licenseUrl: "http://creativecommons.org/licenses/by/3.0/", credit: "\"Sintel\" (c) copyright Blender Foundation | durian.blender.org, CC BY 3.0", fileOnly: true }),
    classic("ElephantsDream", "Elephants Dream", 2006, "Bassam Kurdali", "Blender Foundation open movie, released under a Creative Commons Attribution (CC BY 3.0) license, so it can be shown free with credit.", { date: "2008-07-04", file: "ed_1024.mp4", yearSource: "https://en.wikipedia.org/wiki/Elephants_Dream", license: "CC BY 3.0", licenseUrl: "http://creativecommons.org/licenses/by/3.0/us/", credit: "\"Elephants Dream\" (c) copyright 2006, Blender Foundation / Netherlands Media Art Institute / www.elephantsdream.org, CC BY 3.0", rightsNote: "Shown in full, with its complete end credits as the license asks.", fileOnly: true }),
    classic("Tears-of-Steel", "Tears of Steel", 2012, "Ian Hubert", "Blender Foundation open movie, released under a Creative Commons Attribution (CC BY 3.0) license, so it can be shown free with credit.", { date: "2012-09-28", file: "tears_of_steel_720p.mp4", yearSource: "https://en.wikipedia.org/wiki/Tears_of_Steel", license: "CC BY 3.0", licenseUrl: "http://creativecommons.org/licenses/by/3.0/", credit: "\"Tears of Steel\" (CC) Blender Foundation | mango.blender.org, CC BY 3.0", fileOnly: true, musicCredit: "Music (C) Joram Letwory - www.tearsofsteel.org, CC BY-ND 3.0", rightsNote: "Shown unedited, in full." }),
    classic("CosmosLaundromatFirstCycle", "Cosmos Laundromat: First Cycle", 2015, "Mathieu Auvray", "Blender Foundation open movie, released under a Creative Commons Attribution (CC BY 4.0) license, so it can be shown free with credit.", { date: "2015-09-05", file: "Cosmos Laundromat - First Cycle (1080p).mp4", yearSource: "https://en.wikipedia.org/wiki/Cosmos_Laundromat", license: "CC BY 4.0", licenseUrl: "http://creativecommons.org/licenses/by/4.0/", credit: "\"Cosmos Laundromat\" (CC) Blender Foundation | gooseberry.blender.org, CC BY 4.0", fileOnly: true }),
    classic("Apollo07And0816mmOnboardFilm", "Apollo 7 and 8 16mm Onboard Film", 1968, "NASA", "Filmed by NASA. Works of the US federal government are in the public domain (17 U.S.C. § 105).", { date: "2009-05-29", file: "apollo07_2_1.mp4", yearSource: "https://en.wikipedia.org/wiki/Apollo_8", rightsLabel: "US government work (public domain)", mission: "Apollo 7 and 8 (1968)", credit: "Courtesy NASA" }),
    classic("Apollo1116mmOnboardFilm", "Apollo 11 16mm Onboard Film", 1969, "NASA", "Filmed by NASA. Works of the US federal government are in the public domain (17 U.S.C. § 105).", { date: "2009-05-30", file: "apollo11_6_1.mp4", yearSource: "https://en.wikipedia.org/wiki/Apollo_11", rightsLabel: "US government work (public domain)", mission: "Apollo 11 (1969)", credit: "Courtesy NASA" }),
    classic("Apollo1216mmOnboardFilm", "Apollo 12 16mm Onboard Film", 1969, "NASA", "Filmed by NASA. Works of the US federal government are in the public domain (17 U.S.C. § 105).", { date: "2009-05-30", file: "apollo12_7_1.mp4", yearSource: "https://en.wikipedia.org/wiki/Apollo_12", rightsLabel: "US government work (public domain)", mission: "Apollo 12 (1969)", credit: "Courtesy NASA" }),
    classic("Apollo15And1616mmOnboardFilm", "Apollo 15 16mm Onboard Film", 1971, "NASA", "Filmed by NASA. Works of the US federal government are in the public domain (17 U.S.C. § 105).", { date: "2009-05-31", file: "apollo15_10_1.mp4", yearSource: "https://en.wikipedia.org/wiki/Apollo_15", rightsLabel: "US government work (public domain)", mission: "Apollo 15 (1971)", credit: "Courtesy NASA" }),
    classic("Apollo1716mmonboardfilm", "Apollo 17 16mm Onboard Film", 1972, "NASA", "Filmed by NASA. Works of the US federal government are in the public domain (17 U.S.C. § 105).", { date: "2009-06-01", file: "apollo17_13_1.mp4", yearSource: "https://en.wikipedia.org/wiki/Apollo_17", rightsLabel: "US government work (public domain)", mission: "Apollo 17 (1972)", credit: "Courtesy NASA" }),
    classic("APOLLO16MMLAUNCHVIEWS", "Apollo 16mm Launch Views (Apollo 8, 11, 12)", 1968, "NASA", "Filmed by NASA. Works of the US federal government are in the public domain (17 U.S.C. § 105).", { date: "2009-06-01", file: "apollo_14_1.mp4", yearSource: "https://en.wikipedia.org/wiki/Apollo_program", rightsLabel: "US government work (public domain)", mission: "Apollo 8, 11 and 12 launches (1968–1969)", credit: "Courtesy NASA" }),
    classic("silent-the-big-parade", "The Big Parade", 1925, "King Vidor", US, { date: "2020-12-02", file: "The Big Parade.mp4", yearSource: "https://en.wikipedia.org/wiki/The_Big_Parade" }),
    classic("silent-ben-hur-a-tale-of-the-christ-1925", "Ben-Hur: A Tale of the Christ", 1925, "Fred Niblo", US, { date: "2020-12-02", file: "Ben Hur, A Tale Of The Christ (1925).mp4", yearSource: "https://en.wikipedia.org/wiki/Ben-Hur:_A_Tale_of_the_Christ_(1925_film)" }),
    classic("silent-go-west", "Go West", 1925, "Buster Keaton", US, { date: "2020-12-02", file: "Go West.mp4", yearSource: "https://en.wikipedia.org/wiki/Go_West_(1925_film)" }),
    classic("silent-seven-chances", "Seven Chances", 1925, "Buster Keaton", US, { date: "2020-12-02", file: "Seven Chances.mp4", yearSource: "https://en.wikipedia.org/wiki/Seven_Chances" }),
    classic("silent-girl-shy", "Girl Shy", 1924, "Fred C. Newmeyer, Sam Taylor", US, { date: "2020-12-04", file: "Girl Shy.mp4", yearSource: "https://en.wikipedia.org/wiki/Girl_Shy" }),
    classic("silent-hot-water", "Hot Water", 1924, "Fred C. Newmeyer, Sam Taylor", US, { date: "2020-12-04", file: "Hot Water.mp4", yearSource: "https://en.wikipedia.org/wiki/Hot_Water_(1924_film)" }),
    classic("silent-why-worry", "Why Worry?", 1923, "Fred C. Newmeyer, Sam Taylor", US, { date: "2020-12-05", file: "Why Worry?.mp4", yearSource: "https://en.wikipedia.org/wiki/Why_Worry%3F_(1923_film)" }),
    classic("silent-peter-pan", "Peter Pan", 1924, "Herbert Brenon", US, { date: "2020-12-04", file: "Peter Pan.mp4", yearSource: "https://en.wikipedia.org/wiki/Peter_Pan_(1924_film)", rightsNote: "This is the 1924 Paramount film. RawReel uses only the Archive's own poster, never Disney artwork." }),
    classic("silent-a-kiss-for-cinderella", "A Kiss for Cinderella", 1925, "Herbert Brenon", US, { date: "2020-12-02", file: "A Kiss for Cinderella.mp4", yearSource: "https://en.wikipedia.org/wiki/A_Kiss_for_Cinderella" }),
    classic("silent-don-q-son-of-zorro", "Don Q, Son of Zorro", 1925, "Donald Crisp", US, { date: "2020-12-02", file: "Don Q Son of Zorro.mp4", yearSource: "https://en.wikipedia.org/wiki/Don_Q,_Son_of_Zorro" }),
    classic("silent-the-toll-of-the-sea", "The Toll of the Sea", 1922, "Chester M. Franklin", US, { date: "2020-12-05", file: "The Toll of the Sea.mp4", yearSource: "https://en.wikipedia.org/wiki/The_Toll_of_the_Sea" }),
    classic("silent-within-our-gates", "Within Our Gates", 1920, "Oscar Micheaux", US, { date: "2020-12-05", file: "Within Our Gates.mp4", yearSource: "https://en.wikipedia.org/wiki/Within_Our_Gates", contentWarning: "Content warning: depicts racial violence, a lynching and an attempted rape." }),
    classic("silent-the-unholy-three", "The Unholy Three", 1925, "Tod Browning", US, { date: "2020-12-02", file: "The Unholy Three.mp4", yearSource: "https://en.wikipedia.org/wiki/The_Unholy_Three_(1925_film)" }),
    classic("silent-the-monster", "The Monster", 1925, "Roland West", US, { date: "2020-12-02", file: "The Monster.mp4", yearSource: "https://en.wikipedia.org/wiki/The_Monster_(1925_film)" }),
    classic("silent-the-plastic-age", "The Plastic Age", 1925, "Wesley Ruggles", US, { date: "2020-12-02", file: "The Plastic Age.mp4", yearSource: "https://en.wikipedia.org/wiki/The_Plastic_Age_(film)" }),
    classic("silent-riders-of-the-purple-sage", "Riders of the Purple Sage", 1925, "Lynn Reynolds", US, { date: "2020-12-02", file: "Riders of the Purple Sage.mp4", yearSource: "https://en.wikipedia.org/wiki/Riders_of_the_Purple_Sage_(1925_film)" }),
    classic("silent-the-last-laugh", "The Last Laugh", 1924, "F. W. Murnau", FOREIGN("German"), { date: "2020-12-03", file: "The Last Laugh.mp4", yearSource: "https://en.wikipedia.org/wiki/The_Last_Laugh" }),
    classic("silent-the-haunted-castle", "The Haunted Castle (Schloß Vogelöd)", 1921, "F. W. Murnau", FOREIGN("German"), { date: "2020-12-05", file: "The Haunted Castle.mp4", yearSource: "https://en.wikipedia.org/wiki/The_Haunted_Castle_(1921_film)" }),
    classic("silent-paris-qui-dort-aka-paris-asleep", "Paris qui dort (The Crazy Ray)", 1924, "René Clair", FOREIGN("French"), { date: "2020-12-02", file: "Paris qui dort AKA Paris Asleep.mp4", yearSource: "https://en.wikipedia.org/wiki/Paris_qui_dort" }),
    // Batch 3 (checked 2026-10-19, classics-batch3-check.md): US releases before 1931, no audio track. Tumbleweeds (CHECK) not added.
    classic("silent-the-sheik", "The Sheik", 1921, "George Melford", US, { date: "2020-12-05", file: "The Sheik.mp4", yearSource: "https://en.wikipedia.org/wiki/The_Sheik_(film)" }),
    classic("silent-broken-blossoms", "Broken Blossoms", 1919, "D. W. Griffith", US, { date: "2020-12-04", file: "Broken Blossoms.mp4", yearSource: "https://en.wikipedia.org/wiki/Broken_Blossoms", contentWarning: "Content warning: racial stereotypes." }),
    classic("silent-blind-husbands", "Blind Husbands", 1919, "Erich von Stroheim", US, { date: "2020-12-04", file: "Blind Husbands.mp4", yearSource: "https://en.wikipedia.org/wiki/Blind_Husbands" }),
    classic("silent-the-saphead", "The Saphead", 1920, "Herbert Blaché", US, { date: "2020-12-05", file: "The Saphead.mp4", yearSource: "https://en.wikipedia.org/wiki/The_Saphead" }),
    classic("silent-the-electric-house", "The Electric House", 1922, "Buster Keaton, Edward F. Cline", US, { date: "2020-12-05", file: "The Electric House.mp4", yearSource: "https://en.wikipedia.org/wiki/The_Electric_House" }),
    classic("silent-the-butcher-boy", "The Butcher Boy", 1917, "Roscoe Arbuckle", US, { date: "2020-12-05", file: "The Butcher Boy.mp4", yearSource: "https://en.wikipedia.org/wiki/The_Butcher_Boy_(1917_film)" }),
    classic("silent-the-fireman", "The Fireman", 1916, "Charlie Chaplin", US, { date: "2020-12-05", file: "The Fireman.mp4", yearSource: "https://en.wikipedia.org/wiki/The_Fireman_(1916_film)" }),
    classic("silent-the-floorwalker", "The Floorwalker", 1916, "Charlie Chaplin", US, { date: "2020-12-05", file: "The Floorwalker.mp4", yearSource: "https://en.wikipedia.org/wiki/The_Floorwalker", rightsNote: "Title card reads The Big Store (later reissue)." }),
    classic("silent-the-musketeers-of-pig-alley", "The Musketeers of Pig Alley", 1912, "D. W. Griffith", US, { date: "2020-12-05", file: "The Musketeers of Pig Alley.mp4", yearSource: "https://en.wikipedia.org/wiki/The_Musketeers_of_Pig_Alley" }),
    classic("silent-the-revenge-of-a-kinematograph-cameraman", "The Revenge of a Kinematograph Cameraman", 1912, "Władysław Starewicz", FOREIGN("Russian"), { date: "2020-12-05", file: "The Revenge of a Kinematograph Cameraman.mp4", yearSource: "https://en.wikipedia.org/wiki/The_Cameraman%27s_Revenge", classicsOnly: true, runtime: "21.8 min", runtimeNote: "This copy plays slower than the original (about 12-13 min)." })
  ];

  var CHANNELS = [
    { id: 'sSUJPQzV9V9ps2HR58rctR', date: '2026-10-19', host: 'clipplace', category: 'channel', title: 'RawReel test clip (clip.place backup)', creator: 'RawReel' },
    { id: 'rawreel-test-clip', date: '2026-10-19', category: 'channel', title: 'RawReel test clip', creator: 'RawReel', note: 'Our own CC0 test upload' },
    { id: 'rawreel-upload-test', date: '2026-10-19', category: 'channel', title: 'RawReel upload test', creator: 'RawReel', license: 'CC0', file: 'upload-test.mp4' }
  ];

  var all = CLASSICS.concat(CHANNELS).map(function (v) {
    v.host = v.host || 'archive';
    if (!v.source && v.host === 'archive') v.source = 'https://archive.org/details/' + encodeURIComponent(v.id);
    return v;
  });
  window.VIDEOS_HELD = all.filter(function (v) { return v.hold; });  // for the team only; never rendered
  window.VIDEOS = all.filter(function (v) { return !v.hold; });
})();
