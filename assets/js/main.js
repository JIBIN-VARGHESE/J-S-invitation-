/* =============================================================================
   Jibin & Sofi — main script
   1. Content binding from config.js
   2. Scroll engine  (sets --p on [data-scrub] elements, one rAF per frame)
   3. Reveal-on-enter (IntersectionObserver)
   4. Countdown (Asia/Kolkata, IST = UTC+05:30)
   5. Gallery lightbox
   6. Music control
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
    var names = (C.couple ? C.couple.groom + " & " + C.couple.bride : "") + " · " + derived.weddingDateShort;
    if (C.couple) doc.title = names;
  }

  /* Lists rendered from config */
  function renderLists() {
    // Invitation lines
    var lines = doc.querySelector('[data-list="invitation.lines"]');
    if (lines && C.invitation) {
      C.invitation.lines.forEach(function (t) { lines.appendChild(el("p", "reveal", t)); });
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

    // Story chapters
    var story = doc.querySelector('[data-list="story.chapters"]');
    if (story && C.story) {
      C.story.chapters.forEach(function (ch) {
        var li = el("li", "chapter");
        var fig = el("figure", "chapter__fig reveal");
        fig.setAttribute("data-reveal", "clip");
        var img = el("img");
        img.src = ch.image; img.alt = ch.alt || ""; img.loading = "lazy"; img.decoding = "async";
        img.width = 960; img.height = 1200;
        fig.appendChild(img);
        var txt = el("div", "chapter__text");
        txt.appendChild(el("p", "chapter__num reveal", ch.numeral));
        txt.appendChild(el("h3", "chapter__title reveal", ch.title));
        var body = el("p", "chapter__body reveal", ch.text);
        if (/^\s*\[/.test(ch.text)) body.classList.add("is-placeholder");
        txt.appendChild(body);
        li.appendChild(fig); li.appendChild(txt);
        story.appendChild(li);
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

    // Gallery
    var grid = doc.querySelector('[data-list="gallery"]');
    if (grid && C.gallery) {
      var total = pad(C.gallery.length);
      C.gallery.forEach(function (g, i) {
        var fig = el("figure", "g-item g-item--" + (g.shape || "tall"));
        var btn = el("button", "g-btn reveal");
        btn.type = "button";
        btn.setAttribute("data-reveal", "clip");
        btn.setAttribute("data-index", i);
        btn.setAttribute("aria-label", "Open photograph " + (i + 1) + " of " + C.gallery.length);
        var par = el("div", "parallax");
        par.setAttribute("data-scrub", "view");
        var img = el("img");
        img.src = g.src; img.alt = g.alt || ""; img.loading = "lazy"; img.decoding = "async";
        par.appendChild(img); btn.appendChild(par); fig.appendChild(btn);
        var cap = el("figcaption", "g-cap reveal");
        cap.appendChild(el("span", null, pad(i + 1)));
        cap.appendChild(el("span", null, "/ " + total));
        fig.appendChild(cap);
        grid.appendChild(fig);
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
  function frame() {
    ticking = false;
    active.forEach(measure);
    if (progressBar) {
      var max = root.scrollHeight - window.innerHeight;
      progressBar.style.setProperty("--progress", max > 0 ? (window.scrollY / max).toFixed(4) : 0);
    }
  }
  function requestFrame() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }

  function initScroll() {
    progressBar = doc.querySelector(".progress span");
    scrubs = Array.prototype.slice.call(doc.querySelectorAll("[data-scrub]"));
    if (reduceMotion.matches) return; // CSS supplies calm static states
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

  /* ------------------------------------------------ 3. reveal on enter */
  function initReveals() {
    var items = doc.querySelectorAll(".reveal");
    // Stagger siblings that share a parent
    var counts = new Map();
    items.forEach(function (n) {
      var parent = n.parentElement;
      var c = counts.get(parent) || 0;
      counts.set(parent, c + 1);
      if (c) n.style.setProperty("--d", (Math.min(c, 6) * 0.12).toFixed(2) + "s");
    });
    if (reduceMotion.matches || !("IntersectionObserver" in window)) {
      items.forEach(function (n) { n.classList.add("is-in"); });
      return;
    }
    // A fully clip-pathed element never reports as intersecting, so clip/draw
    // reveals are triggered by their parent instead.
    var targets = new Map();
    items.forEach(function (n) {
      var t = n.hasAttribute("data-reveal") ? n.parentElement : n;
      if (!targets.has(t)) targets.set(t, []);
      targets.get(t).push(n);
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        targets.get(e.target).forEach(function (n) { n.classList.add("is-in"); });
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0 });
    targets.forEach(function (_, t) { io.observe(t); });
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

  /* ----------------------------------------------------- 5. lightbox */
  function initLightbox() {
    var box = doc.querySelector(".lightbox");
    var grid = doc.querySelector(".gallery__grid");
    if (!box || !grid || !C.gallery || !C.gallery.length) return;
    var img = box.querySelector("img"), count = box.querySelector(".lightbox__count");
    var index = 0, lastFocus = null, startX = null;

    function show(i) {
      index = (i + C.gallery.length) % C.gallery.length;
      var g = C.gallery[index];
      img.classList.add("is-swapping");
      var next = new Image();
      next.onload = next.onerror = function () {
        img.src = g.src; img.alt = g.alt || "";
        requestAnimationFrame(function () { img.classList.remove("is-swapping"); });
      };
      next.src = g.src;
      count.textContent = pad(index + 1) + " / " + pad(C.gallery.length);
    }
    function open(i) {
      lastFocus = doc.activeElement;
      box.hidden = false;
      doc.body.classList.add("no-scroll");
      show(i);
      requestAnimationFrame(function () { box.classList.add("is-open"); });
      box.querySelector(".lightbox__close").focus();
    }
    function close() {
      box.classList.remove("is-open");
      doc.body.classList.remove("no-scroll");
      setTimeout(function () { box.hidden = true; }, reduceMotion.matches ? 0 : 600);
      if (lastFocus) lastFocus.focus();
    }

    grid.addEventListener("click", function (e) {
      var b = e.target.closest(".g-btn");
      if (b) open(Number(b.getAttribute("data-index")));
    });
    box.querySelector(".lightbox__close").addEventListener("click", close);
    box.querySelector(".lightbox__prev").addEventListener("click", function () { show(index - 1); });
    box.querySelector(".lightbox__next").addEventListener("click", function () { show(index + 1); });
    box.addEventListener("click", function (e) { if (e.target === box || e.target.classList.contains("lightbox__stage")) close(); });
    doc.addEventListener("keydown", function (e) {
      if (box.hidden) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") show(index + 1);
      else if (e.key === "ArrowLeft") show(index - 1);
      else if (e.key === "Tab") { // keep focus inside the dialog
        var f = box.querySelectorAll("button"), first = f[0], last = f[f.length - 1];
        if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    // Swipe
    box.addEventListener("touchstart", function (e) { startX = e.touches[0].clientX; }, { passive: true });
    box.addEventListener("touchend", function (e) {
      if (startX == null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
      startX = null;
    });
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
  initReveals();
  initCountdown();
  initLightbox();
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
