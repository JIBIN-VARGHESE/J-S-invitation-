/* =============================================================================
   JIBIN & SOFI — WEDDING CONFIGURATION
   -----------------------------------------------------------------------------
   This is the ONLY file you need to edit to change wedding information.

   • Leave a value as "" (empty) when you don't know it yet. The site will
     show a graceful "to be announced" line instead — nothing is invented.
   • Dates use ISO format: "YYYY-MM-DD".  Times use 24h "HH:MM" (Kerala time).
   • Image paths are relative to the site root. To replace an image, either
     overwrite the file with the same name, or change the path here.
   • The only things NOT controlled from here are the link-preview tags
     (WhatsApp / iMessage preview) at the top of index.html — see README.
   ========================================================================== */

window.WEDDING = {

  /* ---------------------------------------------------------------- COUPLE */
  couple: {
    groom: "Jibin",                 // short names: opening screen & closing
    bride: "Sofi",
    groomFull: "Jibin Varghese",    // full names: invitation card
    brideFull: "Sofia John",
    // Small monogram letters shown in the corner and on the closing screen.
    monogram: ["J", "S"],
  },

  /* ---------------------------------------------------------------- INVITE */
  invitation: {
    eyebrow: "Together with our families",
    // Each array item is rendered as its own line.
    lines: [
      "By the grace of God,",
      "and with hearts full of gratitude,",
      "we invite you to share the day",
      "our two lives become one.",
    ],
  },

  /* ----------------------------------------------------------- BIBLE VERSE */
  // King James Version (public domain).
  // Alternative if you prefer:  "And a threefold cord is not quickly broken."
  //                             — Ecclesiastes 4:12
  verse: {
    text: "Many waters cannot quench love, neither can the floods drown it.",
    reference: "Song of Solomon 8:7",
  },

  /* ------------------------------------------------------------- ENGAGEMENT */
  engagement: {
    date: "2027-04-17",            // Saturday
    time: "",                      // e.g. "16:00"  (leave "" until confirmed)
    venueName: "",                 // e.g. church or hall name
    town: "Pandalam",
    region: "Kerala",
    address: "",                   // full street address
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Pandalam%2C+Kerala", // ← PLACEHOLDER: paste the venue's Google Maps link
    description:
      "A gathering of prayer and blessing, and the exchanging of rings, " +
      "shared with the families and friends who have shaped us.",
  },

  /* ---------------------------------------------------------------- WEDDING */
  wedding: {
    date: "2027-04-25",            // Sunday
    town: "Kozhikode",
    region: "Kerala",

    // Holy Matrimony
    ceremonyTime: "",              // e.g. "11:00" — also sets the countdown target
    churchName: "",                // e.g. "St. ___ Church"
    churchAddress: "",
    churchMapsUrl: "https://www.google.com/maps/search/?api=1&query=Kozhikode%2C+Kerala", // ← PLACEHOLDER

    // Reception
    receptionTime: "",             // e.g. "13:00"
    receptionVenue: "",
    receptionAddress: "",
    receptionMapsUrl: "",          // leave "" to reuse churchMapsUrl

  },

  /* ---------------------------------------------------- WEDDING DAY TIMELINE */
  // Times are optional — empty entries show "Time to follow".
  timeline: [
    { time: "", title: "Holy Matrimony",  note: "The wedding ceremony" },
    { time: "", title: "Photographs",     note: "With family and friends" },
    { time: "", title: "Reception",       note: "Lunch and fellowship" },
    { time: "", title: "Celebration",     note: "Toasts, music and blessings" },
  ],

  /* ------------------------------------------------------------------- RSVP */
  rsvp: {
    deadline: "",                  // e.g. "2027-04-01" — shown as "Kindly reply by …"
    maxGuests: 6,                  // upper limit in the "number of guests" field

    // Where responses are sent. See assets/js/rsvp.js for details.
    //   "demo"        – no backend; the response is only kept in this browser
    //   "formspree"   – endpoint: "https://formspree.io/f/XXXXXXX"
    //   "googleForm"  – endpoint: the form's ".../formResponse" URL + fields map
    //   "appsScript"  – endpoint: Google Apps Script web-app URL (writes to Sheets)
    //   "supabase"    – endpoint: "https://PROJECT.supabase.co/rest/v1/rsvps", key: anon key
    //   "firebase"    – endpoint: "https://PROJECT.firebaseio.com/rsvps.json"
    provider: "demo",
    endpoint: "",
    key: "",
    // Only for provider "googleForm": map our fields to your form's entry IDs.
    googleFormFields: { name: "entry.000000", guests: "entry.000001", attending: "entry.000002", message: "entry.000003" },
  },

  /* ------------------------------------------------------------ HERO VIDEO */
  // Background film behind the names. Phones get the portrait cut.
  // Keep each file under ~1 MB (H.264 MP4, no audio). Leave src "" to use the poster only.
  video: {
    portrait:        "assets/video/hero-portrait.mp4",
    portraitWebm:    "assets/video/hero-portrait.webm",   // smaller; used where supported (Chrome, Android, Firefox)
    portraitPoster:  "assets/video/hero-portrait-poster.webp",
    landscape:       "assets/video/hero-landscape.mp4",
    landscapeWebm:   "assets/video/hero-landscape.webm",
    landscapePoster: "assets/video/hero-landscape-poster.webp",
  },

  /* --------------------------------------------------------------- ARTWORK */
  // The church interior that sits behind the whole page (see main.js → initNave).
  art: {
    apse:   "assets/images/nave/apse.webp",     // far end: rose window, altar, candles
    pillar: "assets/images/nave/pillar.webp",   // stone column (transparent), repeated down the aisle
    shafts: "assets/images/nave/shafts.webp",   // light beams from the high windows (screen-blended)
    groom:  "assets/images/nave/groom.svg",     // silhouettes at the altar (same frame) — they slide together as you scroll
    bride:  "assets/images/nave/bride.svg",
    // Credit line shown at the very bottom of the page. Free licences of the
    // opening film (Vecteezy) and the couple silhouette (Freepik) require
    // attribution. Remove a credit only if you hold a premium licence for it.
    credits: "Opening film: Vecteezy · Couple silhouette: Freepik",
  },

  /* ------------------------------------------------------------- ANIMATIONS */
  // Lottie animations (.json). Each slot is optional — leave src "" to hide it.
  // To use one from LottieFiles: open the animation → Download → "Lottie JSON",
  // save it in assets/lottie/ and put its path here.
  //   loop: true  = plays continuously while on screen
  //   loop: false = plays once when it first comes into view, then holds
  lottie: {
    hero:        { src: "assets/lottie/rings.json",       loop: false }, // above the names
    countdown:   { src: "",                               loop: true  }, // small, above "Counting the days"
    rsvp:        { src: "assets/lottie/heart-burst.json", loop: false }, // plays when a reply is sent
    nave:        { src: "assets/lottie/light-motes.json", loop: true  }, // dust in the light, over the whole nave
  },

  /* ------------------------------------------------------------------ MUSIC */
  music: {
    enabled: true,                 // set false to hide the music button entirely
    src: "assets/music/wedding.mp3",
    volume: 0.5,
  },

  /* ---------------------------------------------------------------- CLOSING */
  closing: {
    line: "Your presence would make our celebration complete.",
    signoff: "With love and prayers",
  },
};
