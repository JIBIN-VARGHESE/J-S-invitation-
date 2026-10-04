/* =============================================================================
   JIBIN & SOFI — WEDDING CONFIGURATION
   -----------------------------------------------------------------------------
   This is the ONLY file you need to edit to change wedding information.

   • Leave a value as "" (empty) when you don't know it yet. The site will
     show a graceful "to be announced" line instead — nothing is invented.
   • Dates use ISO format: "YYYY-MM-DD".  Times use 24h "HH:MM" (Kerala time).
   • Photo paths are relative to the site root. To replace a photo, either
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

  /* ---------------------------------------------------------------- PHOTOS */
  // Full-bleed photographs. Use high-resolution originals for the best result
  // (at least 2000 px on the long side), saved as WebP or JPG under ~400 KB.
  //   hero    – opening screen. Landscape works; the tower/cross is kept in view.
  //   verse   – behind the Bible verse. Portrait suits phones best.
  //   closing – the final scene (church interior / aisle).
  photos: {
    hero:    "assets/images/photos/kerala-tower.webp",
    verse:   "assets/images/photos/gold-tower.webp",
    closing: "assets/images/photos/nave.webp",
    // Where the subject sits in each photo (CSS object-position), so phones crop well.
    focus: { hero: "48% 30%", verse: "50% 35%", closing: "52% 60%" },
    // Shown in small type at the very bottom. Fill in if your photo licence asks for credit,
    // e.g. "Photographs: Name / Unsplash". Leave "" to show nothing.
    credits: "",
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
