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
    groom: "Jibin",
    bride: "Sofi",
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

  /* -------------------------------------------------------------- OUR STORY */
  // Replace the placeholder text with your own words (2–3 sentences each
  // reads best). Add or remove chapters freely.
  story: {
    intro: "A few pages from the story God has been writing for us.",
    chapters: [
      {
        numeral: "I",
        title: "The Beginning",
        text: "[Placeholder — a few lines about how you first met.]",
        image: "assets/images/story/01.jpg",
        alt: "Jibin and Sofi — the beginning",
      },
      {
        numeral: "II",
        title: "The Promise",
        text: "[Placeholder — a few lines about the moment you knew.]",
        image: "assets/images/story/02.jpg",
        alt: "Jibin and Sofi — the promise",
      },
      {
        numeral: "III",
        title: "Two Families, One Home",
        text: "[Placeholder — a few lines about your families and the road ahead.]",
        image: "assets/images/story/03.jpg",
        alt: "Jibin and Sofi with family",
      },
    ],
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
    image: "assets/images/events/engagement.jpg",
    imageAlt: "Engagement photograph of Jibin and Sofi",
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

    image: "assets/images/events/wedding.jpg",
    imageAlt: "Jibin and Sofi",
  },

  /* ---------------------------------------------------- WEDDING DAY TIMELINE */
  // Times are optional — empty entries show "Time to follow".
  timeline: [
    { time: "", title: "Holy Matrimony",  note: "The wedding ceremony" },
    { time: "", title: "Photographs",     note: "With family and friends" },
    { time: "", title: "Reception",       note: "Lunch and fellowship" },
    { time: "", title: "Celebration",     note: "Toasts, music and blessings" },
  ],

  /* ---------------------------------------------------------------- GALLERY */
  // Any number of photos. "shape" controls the editorial layout:
  //   "tall" (portrait), "wide" (landscape) or "square".
  gallery: [
    { src: "assets/images/gallery/01.jpg", alt: "Gallery photograph 1", shape: "tall"   },
    { src: "assets/images/gallery/02.jpg", alt: "Gallery photograph 2", shape: "wide"   },
    { src: "assets/images/gallery/03.jpg", alt: "Gallery photograph 3", shape: "tall"   },
    { src: "assets/images/gallery/04.jpg", alt: "Gallery photograph 4", shape: "square" },
    { src: "assets/images/gallery/05.jpg", alt: "Gallery photograph 5", shape: "tall"   },
    { src: "assets/images/gallery/06.jpg", alt: "Gallery photograph 6", shape: "wide"   },
    { src: "assets/images/gallery/07.jpg", alt: "Gallery photograph 7", shape: "tall"   },
    { src: "assets/images/gallery/08.jpg", alt: "Gallery photograph 8", shape: "wide"   },
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
