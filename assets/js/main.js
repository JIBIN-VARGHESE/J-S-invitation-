/* =============================================================================
   Jibin & Sofi — main script
   1. Content binding from config.js
   2. Scroll engine  (sets --p on [data-scrub] elements, one rAF per frame)
   3. Fade-in on enter (IntersectionObserver)
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
    artCredits: (C.art && C.art.credits) || "",
    weddingWeekdayShort: wd.weekday.slice(0, 3), weddingMonthShort: wd.month.slice(0, 3),
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
    var art = C.art || {};
    doc.querySelectorAll("[data-art]").forEach(function (img) {
      var v = art[img.getAttribute("data-art")];
      if (v) img.src = v;
      img.decoding = "async";
    });
    doc.querySelectorAll("[data-art-srcset]").forEach(function (src) {
      var v = art[src.getAttribute("data-art-srcset")];
      if (v) src.srcset = v; else src.remove();
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
    // opening film parallax
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

  /* ------------------------------------------------------- the nave */
  // The church interior is drawn by assets/js/nave.js (WebGL). It reads the
  // scroll position itself and eases toward it, so the walk feels fluid.
  function initNave() {
    var el = doc.querySelector(".nave");
    if (!el || !window.Nave) return;
    window.Nave.init(el, {
      hero: doc.querySelector(".hero"),
      closing: doc.querySelector(".closing"),
      reduce: reduceMotion.matches,
      art: C.art || {},
    });
  }

  /* --------------------------------------------------- hero video */
  // Picks the portrait or landscape cut, plays muted inline (allowed on
  // iOS/Android without a tap), pauses when scrolled away.
  function initVideo() {
    var V = C.video || {};
    var v = doc.querySelector("[data-video]");
    if (!v) return;
    var land = window.matchMedia("(min-aspect-ratio: 1/1)").matches;
    var webm = land ? V.landscapeWebm : V.portraitWebm;
    var src = land ? V.landscape : V.portrait, poster = land ? V.landscapePoster : V.portraitPoster;
    if (webm && v.canPlayType('video/webm; codecs="vp9"')) src = webm;
    if (poster) v.poster = poster;
    if (!src || reduceMotion.matches || (navigator.connection && navigator.connection.saveData)) return;
    v.src = src;
    v.muted = true;
    var tryPlay = function () { var p = v.play(); if (p && p.catch) p.catch(function () {}); };
    v.addEventListener("loadeddata", function () { v.classList.add("is-playing"); });
    new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) tryPlay(); else v.pause();
    }).observe(v);
  }

  /* ------------------------------------------- Lottie animations */
  // Slots: <div data-lottie="name">, configured in config.js → lottie.
  // The player (assets/js/vendor/lottie_light.min.js) is only downloaded
  // when the first animation is about to scroll into view.
  var playerPromise = null;
  function loadPlayer() {
    if (window.lottie) return Promise.resolve(window.lottie);
    if (!playerPromise) {
      playerPromise = new Promise(function (resolve, reject) {
        var sc = doc.createElement("script");
        sc.src = "assets/js/vendor/lottie_light.min.js";
        sc.onload = function () { resolve(window.lottie); };
        sc.onerror = reject;
        doc.head.appendChild(sc);
      });
    }
    return playerPromise;
  }
  // wait until the opening curtain has lifted before starting anything
  function whenReady(fn) {
    if (root.classList.contains("is-ready")) return setTimeout(fn, 600);
    setTimeout(function () { whenReady(fn); }, 200);
  }
  function initLottie() {
    var L = C.lottie || {};
    var slots = Array.prototype.slice.call(doc.querySelectorAll("[data-lottie]"));
    var still = reduceMotion.matches;
    slots.forEach(function (slot) {
      var cfg = L[slot.getAttribute("data-lottie")];
      if (!cfg || !cfg.src || (still && cfg.loop)) { slot.remove(); return; }
      var trigger = slot.getAttribute("data-lottie-play");    // custom event name, or play-on-view
      var anim = null, visible = false;
      function create() {
        if (anim) return;
        loadPlayer().then(function (lottie) {
          anim = lottie.loadAnimation({
            container: slot, renderer: "svg", loop: !!cfg.loop, autoplay: false, path: cfg.src,
            rendererSettings: { preserveAspectRatio: slot.classList.contains("lottie--overlay") ? "xMidYMid slice" : "xMidYMid meet", progressiveLoad: true },
          });
          anim.addEventListener("DOMLoaded", function () {
            slot.classList.add("is-loaded");
            if (still) anim.goToAndStop(anim.totalFrames - 1, true);   // show the finished frame
            else if (!trigger && visible) whenReady(function () { anim.play(); });
          });
        }).catch(function () { slot.remove(); });
      }
      if (trigger) {
        doc.addEventListener(trigger, function () {
          create();
          var go = function () { if (!anim) return setTimeout(go, 50); slot.classList.add("is-playing"); anim.goToAndPlay(0, true); };
          go();
        });
      }
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible) create();
        if (!anim || trigger || still) return;
        if (visible) whenReady(function () { anim.play(); }); else if (cfg.loop) anim.pause();
      }, { rootMargin: "300px 0px" }).observe(trigger ? slot.closest("form") || slot : slot);
    });
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
  initLottie();
  initVideo();
  initNave();
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
