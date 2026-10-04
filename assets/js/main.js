/* =============================================================================
   Jibin & Sofi — main script
   1. Content binding from config.js
   2. Scroll engine  (sets --p on [data-scrub] elements, one rAF per frame)
   3. Fade-in on enter (IntersectionObserver) + polaroid "magic" scatter
   4. Countdown (Asia/Kolkata, IST = UTC+05:30)
   5. Music control
   No wedding details live here — edit config.js instead.
   ========================================================================== */
(function () {
  "use strict";

  var C = window.WEDDING || {};
  var doc = document;
  var root = doc.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* -------------------------------------------------------------- helpers */
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  function get(path) {
    return path.split(".").reduce(function (o, k) { return o == null ? undefined : o[k]; }, C);
  }
  function parseDate(iso) {           // "2027-04-25" → parts, independent of the visitor's timezone
    var p = (iso || "").split("-").map(Number);
    var d = new Date(Date.UTC(p[0], p[1] - 1, p[2]));
    return { y: p[0], m: p[1], d: p[2], weekday: DAYS[d.getUTCDay()], month: MONTHS[p[1] - 1] };
  }
  function pad(n, len) { n = String(n); while (n.length < (len || 2)) n = "0" + n; return n; }
  function formatTime(hhmm) {         // "16:00" → "4:00 pm"
    if (!hhmm) return "";
    var p = hhmm.split(":").map(Number);
    var h = p[0] % 12 || 12;
    return h + ":" + pad(p[1] || 0) + (p[0] < 12 ? " am" : " pm");
  }
  function tba(text) { return { tba: text }; }
  function el(tag, cls, text) {
    var e = doc.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  /* ---------------------------------------------- 1. derived display values */
  var W = C.wedding || {}, E = C.engagement || {}, R = C.rsvp || {};
  var wd = parseDate(W.date), ed = parseDate(E.date);

  var derived = {
    "monogram.0": (C.couple && C.couple.monogram || [])[0],
    "monogram.1": (C.couple && C.couple.monogram || [])[1],
    weddingDateShort: wd.d + " " + wd.month + " " + wd.y,
    weddingDateLong: wd.weekday + " · " + wd.d + " " + wd.month + " " + wd.y,
    weddingDateDots: pad(wd.d) + "." + pad(wd.m) + "." + wd.y,
    weddingD: pad(wd.d), weddingM: pad(wd.m), weddingY: String(wd.y), weddingWeekday: wd.weekday,
    engagementDay: String(ed.d), engagementWeekday: ed.weekday, engagementMonth: ed.month, engagementYear: String(ed.y),
    engagementDateLong: ed.weekday + " · " + ed.d + " " + ed.month + " " + ed.y,
    engagementTime: E.time ? formatTime(E.time) : tba("To be announced"),
    engagementVenue: E.venueName || tba("To be announced"),
    engagementAddress: E.address || [E.town, E.region].filter(Boolean).join(", "),
    engagementVenueFull: [E.venueName, E.address].filter(Boolean).join(", ") || tba("Venue details to follow"),
    churchName: W.churchName || tba("Church to be announced"),
    ceremonyTime: W.ceremonyTime ? formatTime(W.ceremonyTime) : tba("Time to be announced"),
    churchAddress: W.churchAddress || [W.town, W.region].filter(Boolean).join(", "),
    receptionVenue: W.receptionVenue || tba("Venue to be announced"),
    receptionTime: W.receptionTime ? formatTime(W.receptionTime) : tba("Time to be announced"),
    receptionAddress: W.receptionAddress || [W.town, W.region].filter(Boolean).join(", "),
    receptionMapsUrl: W.receptionMapsUrl || W.churchMapsUrl,
    weddingVenueFull: [W.churchName, W.churchAddress].filter(Boolean).join(", ") || tba("Venue details to follow"),
    rsvpDeadline: R.deadline ? "Kindly reply by " + (function (d) { return d.d + " " + d.month + " " + d.y; })(parseDate(R.deadline)) + "." : "We would be grateful for your reply.",
    countdownNote: wd.weekday + ", " + wd.d + " " + wd.month + " " + wd.y + " · " + (W.town || ""),
  };

  function valueFor(key) { return key in derived ? derived[key] : get(key); }

  function bindContent() {
    doc.querySelectorAll("[data-bind]").forEach(function (node) {
      var v = valueFor(node.getAttribute("data-bind"));
      if (v == null || v === "") return;
      if (typeof v === "object" && v.tba) {
        node.textContent = v.tba;
        node.classList.add("tba");
      } else {
        node.textContent = v;
      }
    });
    doc.querySelectorAll("[data-href-bind]").forEach(function (a) {
      var v = valueFor(a.getAttribute("data-href-bind"));
      if (v) a.href = v; else a.classList.add("is-muted");
    });
    doc.querySelectorAll("[data-src-bind]").forEach(function (img) {
      var v = valueFor(img.getAttribute("data-src-bind"));
      if (v) img.src = v;
      var alt = img.getAttribute("data-alt-bind");
      if (alt) img.alt = valueFor(alt) || "";
    });
    var scenes = C.scenes || {};
    doc.querySelectorAll("[data-scene]").forEach(function (img) {
      var src = scenes[img.getAttribute("data-scene")];
      if (src) img.src = src;
      img.decoding = "async";
    });
    doc.querySelectorAll("[data-scene-srcset]").forEach(function (src) {
      var v = scenes[src.getAttribute("data-scene-srcset")];
      if (v) src.srcset = v; else src.remove();
    });
    var names = (C.couple ? (C.couple.groomFull || C.couple.groom) + " & " + (C.couple.brideFull || C.couple.bride) : "") + " · " + derived.weddingDateShort;
    if (C.couple) doc.title = names;
  }

  /* Lists rendered from config */
  function renderLists() {
    // Invitation lines
    var lines = doc.querySelector('[data-list="invitation.lines"]');
    if (lines && C.invitation) {
      C.invitation.lines.forEach(function (t) { lines.appendChild(el("p", null, t)); });
    }

    // Verse: one span per word so they can light up as you scroll
    var verse = doc.querySelector('[data-words="verse.text"]');
    if (verse && C.verse) {
      var words = C.verse.text.split(/\s+/);
      verse.style.setProperty("--n", words.length);
      words.forEach(function (w, i) {
        var s = el("span", "w", w);
        s.style.setProperty("--i", i);
        verse.appendChild(s);
        if (i < words.length - 1) verse.appendChild(doc.createTextNode(" "));
      });
    }

    // Timeline
    var tl = doc.querySelector('[data-list="timeline"]');
    if (tl && C.timeline) {
      tl.style.setProperty("--n", C.timeline.length);
      C.timeline.forEach(function (t, i) {
        var li = el("li", "tl");
        li.style.setProperty("--i", i);
        li.style.setProperty("--n", C.timeline.length);
        var time = el("p", "tl__time", t.time ? formatTime(t.time) : "Time to follow");
        li.appendChild(time);
        li.appendChild(el("h3", "tl__title", t.title));
        if (t.note) li.appendChild(el("p", "tl__note", t.note));
        tl.appendChild(li);
      });
    }

  }

  /* --------------------------------------------- 2. scroll engine (--p) */
  // data-scrub="pin":  0 when the section top meets the viewport top,
  //                    1 when its bottom meets the viewport bottom.
  // data-scrub="view": 0 when the element enters at the bottom,
  //                    1 when it leaves at the top.
  var scrubs = [], active = new Set(), ticking = false, progressBar;

  function measure(node) {
    var r = node.getBoundingClientRect(), vh = window.innerHeight, p;
    if (node.getAttribute("data-scrub") === "pin") {
      var dist = r.height - vh;
      p = dist > 0 ? -r.top / dist : 0;
    } else {
      p = (vh - r.top) / (vh + r.height);
    }
    p = Math.min(1, Math.max(0, p));
    if (node._p !== p) { node._p = p; node.style.setProperty("--p", p.toFixed(4)); }
  }
  var hero, heroVisible = true, lastY = -1;
  function frame() {
    ticking = false;
    active.forEach(measure);
    // Feature 1 · three-layer parallax: one number drives every layer's speed (see CSS)
    if (hero && heroVisible) {
      var y = Math.round(Math.min(window.scrollY, window.innerHeight * 1.2));
      if (y !== lastY) { lastY = y; hero.style.setProperty("--y", y); }
    }
    if (progressBar) {
      var max = root.scrollHeight - window.innerHeight;
      progressBar.style.setProperty("--progress", max > 0 ? (window.scrollY / max).toFixed(4) : 0);
    }
  }
  function requestFrame() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }

  function initScroll() {
    progressBar = doc.querySelector(".progress span");
    hero = doc.querySelector(".hero");
    scrubs = Array.prototype.slice.call(doc.querySelectorAll("[data-scrub]"));
    if (reduceMotion.matches) return; // CSS supplies calm static states
    new IntersectionObserver(function (entries) {
      heroVisible = entries[0].isIntersecting;
    }).observe(hero);
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) active.add(e.target);
        else { measure(e.target); active.delete(e.target); } // settle at 0 or 1 when leaving
      });
      requestFrame();
    }, { rootMargin: "20% 0px 20% 0px" });
    scrubs.forEach(function (s) { io.observe(s); });
    window.addEventListener("scroll", requestFrame, { passive: true });
    window.addEventListener("resize", requestFrame, { passive: true });
  }

  /* ----------------------- 3. Feature 2 · fade + float up on enter */
  // Every <section> and <article> floats up 40px and fades in as it enters.
  // Pinned scenes (data-nofade) animate with the scroll engine instead.
  function initFades() {
    var items = doc.querySelectorAll("main section:not([data-nofade]), main article");
    if (reduceMotion.matches || !("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-in");
        io.unobserve(e.target);
        // drop the transform afterwards so the element stops being its own layer
        e.target.addEventListener("transitionend", function done(ev) {
          if (ev.target !== e.target || ev.propertyName !== "transform") return;
          e.target.classList.remove("fade", "is-in");
          e.target.removeEventListener("transitionend", done);
        });
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0 });
    items.forEach(function (n) { n.classList.add("fade"); io.observe(n); });
  }

  /* ------------------------------ Feature 3 · "Touch here for magic" */
  function initMoments() {
    var M = C.moments || {};
    var section = doc.getElementById("moments");
    var stage = doc.querySelector(".polaroids");
    var btn = doc.querySelector(".btn--magic");
    if (!section || !stage || !btn) return;
    if (!M.enabled || !M.photos || !M.photos.length) { section.hidden = true; return; }

    var cards = [], scattered = false, topZ = 10;
    M.photos.slice(0, 8).forEach(function (ph, i) {
      var fig = el("figure", "polaroid");
      var img = el("img");
      img.src = ph.src; img.alt = ph.caption || "Photograph " + (i + 1); img.loading = "lazy"; img.decoding = "async";
      fig.appendChild(img);
      fig.appendChild(el("figcaption", null, ph.caption || ""));
      fig.style.zIndex = i + 1;
      fig.addEventListener("click", function () { if (scattered) fig.style.zIndex = ++topZ; });
      stage.appendChild(fig);
      cards.push(fig);
    });

    function rand(a, b) { return a + Math.random() * (b - a); }
    function set(card, x, y, r, delay) {
      card.style.setProperty("--sx", x.toFixed(1) + "px");
      card.style.setProperty("--sy", y.toFixed(1) + "px");
      card.style.setProperty("--r", r.toFixed(1) + "deg");
      card.style.setProperty("--delay", delay + "s");
    }
    function stack() {   // a neat, slightly untidy pile in the centre
      cards.forEach(function (c, i) { set(c, rand(-8, 8), rand(-6, 6), rand(-9, 9), i * .04); });
    }
    function scatter() { // fly apart to random spots inside the stage
      var W = stage.clientWidth, H = stage.clientHeight;
      var cw = cards[0].offsetWidth, ch = cards[0].offsetHeight;
      // leave room for the tilt so rotated corners stay on screen
      var maxX = Math.max(0, (W - cw) / 2 - cw * .2), maxY = Math.max(0, (H - ch) / 2 - ch * .1);
      var cols = W > 700 ? 3 : 2, rows = Math.ceil(cards.length / cols);
      // jittered grid keeps photos spread out instead of piling up by chance
      var order = cards.map(function (_, i) { return i; }).sort(function () { return Math.random() - .5; });
      cards.forEach(function (c, i) {
        var slot = order[i], cx = slot % cols, cy = Math.floor(slot / cols);
        var x = (cols === 1 ? 0 : (cx / (cols - 1)) * 2 - 1) * maxX + rand(-18, 18);
        var y = (rows === 1 ? 0 : (cy / (rows - 1)) * 2 - 1) * maxY + rand(-14, 14);
        set(c, Math.max(-maxX, Math.min(maxX, x)), Math.max(-maxY, Math.min(maxY, y)), rand(-18, 18), i * .07);
      });
    }
    stack();
    btn.addEventListener("click", function () {
      scattered = !scattered;
      stage.classList.toggle("is-scattered", scattered);
      btn.setAttribute("aria-pressed", String(scattered));
      btn.querySelector(".btn--magic__label").textContent = scattered ? "Gather them back" : "Touch here for magic";
      if (scattered) scatter(); else stack();
    });
    window.addEventListener("resize", function () { if (scattered) scatter(); });
  }

  /* -------------------------------------------------- 4. countdown (IST) */
  function initCountdown() {
    var nodes = {};
    doc.querySelectorAll("[data-cd]").forEach(function (n) { nodes[n.getAttribute("data-cd")] = n; });
    if (!nodes.days) return;
    // Kerala is UTC+05:30 all year (no daylight saving). The explicit offset
    // makes the target identical for guests anywhere in the world.
    var time = W.ceremonyTime || "00:00";
    var target = new Date(W.date + "T" + time + ":00+05:30").getTime();
    var timer;

    function tick() {
      var diff = target - Date.now();
      if (diff <= 0) {
        nodes.days.textContent = "000"; nodes.hours.textContent = nodes.minutes.textContent = nodes.seconds.textContent = "00";
        var note = doc.querySelector(".countdown__note");
        if (note) note.textContent = "Today, by the grace of God, we are married.";
        clearInterval(timer);
        return;
      }
      var s = Math.floor(diff / 1000);
      nodes.days.textContent = pad(Math.floor(s / 86400), 3);
      nodes.hours.textContent = pad(Math.floor(s % 86400 / 3600));
      nodes.minutes.textContent = pad(Math.floor(s % 3600 / 60));
      nodes.seconds.textContent = pad(s % 60);
    }
    tick();
    // Only tick while the countdown is on screen
    var section = doc.getElementById("countdown");
    new IntersectionObserver(function (entries) {
      clearInterval(timer);
      if (entries[0].isIntersecting) { tick(); timer = setInterval(tick, 1000); }
    }).observe(section);
  }

  /* -------------------------------------------------------- 6. music */
  function initMusic() {
    var M = C.music || {};
    var btn = doc.querySelector(".music"), audio = doc.querySelector(".music__audio");
    if (!btn || !audio || !M.enabled || !M.src) return;

    function enable() {
      btn.hidden = false;
      audio.src = M.src;
      audio.volume = M.volume != null ? M.volume : 0.5;
    }
    // Only show the control if the file actually exists (skipped on file://).
    if (location.protocol.indexOf("http") === 0 && window.fetch) {
      fetch(M.src, { method: "HEAD" }).then(function (r) { if (r.ok) enable(); }).catch(function () {});
    } else {
      enable();
    }

    function setState(playing) {
      btn.classList.toggle("is-playing", playing);
      btn.setAttribute("aria-pressed", String(playing));
      btn.querySelector(".music__label").textContent = playing ? "Pause" : "Music";
    }
    btn.addEventListener("click", function () {
      if (audio.paused) {
        var p = audio.play(); // user gesture — allowed by mobile browsers
        if (p && p.then) p.then(function () { setState(true); }).catch(function () { btn.classList.add("is-error"); });
        else setState(true);
      } else {
        audio.pause(); setState(false);
      }
    });
    audio.addEventListener("error", function () { btn.classList.add("is-error"); setState(false); });
    // Pause politely when the tab is hidden
    doc.addEventListener("visibilitychange", function () { if (doc.hidden && !audio.paused) { audio.pause(); setState(false); } });
  }

  /* ------------------------------------------------------------- boot */
  function ready() {
    root.classList.add("is-ready");
    requestFrame();
  }

  bindContent();
  renderLists();
  initScroll();
  initFades();
  initMoments();
  initCountdown();
  initMusic();
  if (window.RSVP) window.RSVP.init(doc.querySelector(".rsvp__form"), C.rsvp || {});

  // Lift the curtain once fonts are ready (or after 1.6s, whichever is first)
  var lifted = false;
  function lift() { if (!lifted) { lifted = true; setTimeout(ready, 350); } }
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(lift);
  setTimeout(lift, 1600);

  // Return to the opening on reload so the cinematic intro plays from the start
  if ("scrollRestoration" in history && !location.hash) history.scrollRestoration = "manual";
})();
