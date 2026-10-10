/* =============================================================================
   The journey — one continuous scene driven by one number.

   The page is a tall empty scroller; everything you see is fixed and placed
   here, every frame, from a single eased scroll position measured in
   "screens" (1 = one screen height of scrolling). Because the church camera,
   the cards, the light and the text all read that same number in the same
   frame, nothing can drift out of step.

     0    – 1.1   arrival: the statue, fading to black
     1.0  – 2.5   the church wakes: candles light down the aisle, then windows
     2.4  – 3.9   "Save the Date" hangs in the aisle; you walk through it
     3.9  – 15.6  stations: each card stands in the aisle; the camera turns
                  to it, it comes to the centre and holds, then you walk past
     5.6  – 7.4   (between stations) the verse under the rose window
     15.6 – 16.8  the light: the rose window floods the screen
     16.8 – 20.5  together: the photograph, the names, the verse, one candle

   Edit the timings in STATIONS / the keyframes below; the README explains.
   ========================================================================== */
(function () {
  "use strict";

  var TOTAL = 20.5;          // screens of scrolling
  var HOLD = 2.35;           // metres between camera and a card while you read it
  var CARD_Y = 1.5;          // card height above the floor (metres)

  // where each card stands (z along the aisle, x left/right) and when (screens):
  // s0 approach starts, a = arrives and holds, b = hold ends, s1 = walked past
  var STATIONS = [
    { id: "invitation", z: 8.0,  x: .7,  s0: 3.9,  a: 4.35,  b: 5.15, s1: 5.6 },
    { id: "engagement", z: 12.4, x: -.7, s0: 7.4,  a: 7.85,  b: 8.6,  s1: 9.0 },
    { id: "ceremony",   z: 15.0, x: .7,  s0: 9.0,  a: 9.45,  b: 10.2, s1: 10.6 },
    { id: "reception",  z: 17.4, x: -.7, s0: 10.6, a: 11.05, b: 11.8, s1: 12.2 },
    { id: "countdown",  z: 19.6, x: .6,  s0: 12.2, a: 12.65, b: 13.3, s1: 13.6 },
    { id: "rsvp",       z: 22.6, x: 0,   s0: 13.6, a: 14.1,  b: 15.6, s1: 16.1, stay: true },
  ];
  // camera position along the aisle (metres) at given scroll positions;
  // a smooth curve runs through these, so it eases into every stop
  var CAM = [
    [0, -1.5], [1.0, -1.5], [2.4, .4], [3.9, 5.0],
    [4.35, 5.65], [5.15, 5.9], [5.6, 8.0], [7.4, 9.8],
    [7.85, 10.05], [8.6, 10.3], [9.0, 12.2],
    [9.45, 12.65], [10.2, 12.9], [10.6, 14.6],
    [11.05, 15.05], [11.8, 15.3], [12.2, 16.8],
    [12.65, 17.25], [13.3, 17.5], [13.6, 18.6],
    [14.1, 20.25], [15.6, 20.45], [16.8, 21.3], [TOTAL + 1, 21.3],
  ];

  var doc = document, root = doc.documentElement;
  var el = {}, cards = [], camAt, unit = 1, sm = 0, last = 0, frozen = null, dust = null, opts = {};

  /* ---------------------------------------------------------- helpers */
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function ss(a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
  function bump(a, b, c, d, x) { return ss(a, b, x) * (1 - ss(c, d, x)); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  // monotone cubic interpolation (no overshoot, so the camera never walks backwards)
  function monotone(pts) {
    var n = pts.length, xs = [], ys = [], m = [], d = [];
    for (var i = 0; i < n; i++) { xs.push(pts[i][0]); ys.push(pts[i][1]); }
    for (i = 0; i < n - 1; i++) d.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]));
    m.push(d[0]);
    for (i = 1; i < n - 1; i++) m.push(d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2);
    m.push(d[n - 2]);
    for (i = 0; i < n - 1; i++) {
      if (d[i] === 0) { m[i] = m[i + 1] = 0; continue; }
      var a = m[i] / d[i], b = m[i + 1] / d[i], h = a * a + b * b;
      if (h > 9) { var t = 3 / Math.sqrt(h); m[i] = t * a * d[i]; m[i + 1] = t * b * d[i]; }
    }
    return function (x) {
      if (x <= xs[0]) return ys[0];
      if (x >= xs[n - 1]) return ys[n - 1];
      var k = 0; while (xs[k + 1] < x) k++;
      var hh = xs[k + 1] - xs[k], t = (x - xs[k]) / hh, t2 = t * t, t3 = t2 * t;
      return (2 * t3 - 3 * t2 + 1) * ys[k] + (t3 - 2 * t2 + t) * hh * m[k] + (-2 * t3 + 3 * t2) * ys[k + 1] + (t3 - t2) * hh * m[k + 1];
    };
  }

  /* ------------------------------------------------------------ setup */
  function measure() {
    unit = Math.max(1, el.scroller.offsetHeight / (TOTAL + 1));
  }

  function init(o) {
    opts = o || {};
    root.classList.add("journey");
    el.scroller = doc.querySelector(".scroller");
    el.scroller.style.setProperty("--screens", TOTAL + 1);
    el.hero = doc.querySelector(".hero");
    el.heroImg = doc.querySelector(".hero__film");
    el.heroText = doc.querySelector(".hero__content");
    el.cue = doc.querySelector(".scroll-cue");
    el.nave = doc.querySelector(".nave");
    el.wake = doc.getElementById("wake");
    el.save = doc.getElementById("save-the-date");
    el.verse = doc.getElementById("verse");
    el.presence = doc.getElementById("presence");
    el.finale = doc.getElementById("closing");
    el.photo = doc.querySelector(".finale__photo img");
    el.flash = doc.querySelector(".flash");
    el.progress = doc.querySelector(".progress span");
    el.mark = doc.querySelector(".topbar__mark");
    el.fin = {
      names: doc.querySelector(".finale__names"), full: doc.querySelector(".finale__full"),
      date: doc.querySelector(".finale__date"), quote: doc.querySelector(".finale__quote"),
      ref: doc.querySelector(".finale__ref"), candle: doc.querySelector(".finale__candle"),
    };
    STATIONS.forEach(function (st) {
      var node = doc.getElementById(st.id);
      if (node) cards.push({ st: st, node: node, o: -1, pe: null });
    });
    camAt = monotone(CAM);

    // the church
    var gl = window.Nave && window.Nave.init(el.nave, { art: opts.art || {} });
    if (!gl && window.Nave) window.Nave.initFallback(el.nave);

    measure();
    window.addEventListener("resize", measure, { passive: true });
    if (el.mark) el.mark.addEventListener("click", function (e) { e.preventDefault(); window.scrollTo(0, 0); });

    // typing in the reply form: hold the scene still while the keyboard is up
    var form = doc.querySelector(".rsvp__form");
    if (form) {
      form.addEventListener("focusin", function () { if (frozen == null) frozen = sm; });
      form.addEventListener("focusout", function () {
        setTimeout(function () {
          if (form.contains(doc.activeElement) || frozen == null) return;
          var keep = frozen; frozen = null;
          window.scrollTo(0, keep * unit); sm = keep;
        }, 250);
      });
    }

    dust = makeDust(doc.querySelector(".finale__dust"));
    sm = window.scrollY / unit;
    requestAnimationFrame(frame);
  }

  /* ------------------------------------------------------------ frame */
  var cache = {};
  function setStyle(node, key, prop, val) {          // write only when a value changes
    var id = key + prop;
    if (cache[id] === val) return;
    cache[id] = val;
    node.style.setProperty(prop, val);
  }

  function frame(now) {
    requestAnimationFrame(frame);
    var dt = last ? Math.min(.05, (now - last) / 1000) : .016;
    last = now;
    // one eased value for everything (glides gently after the finger stops)
    var target = frozen != null ? frozen : window.scrollY / unit;
    sm += (target - sm) * (1 - Math.exp(-dt / .09));
    if (Math.abs(target - sm) < .0004) sm = target;
    var s = sm;

    /* arrival */
    var heroOut = ss(.3, 1.05, s);
    setStyle(el.hero, "h", "opacity", (1 - heroOut).toFixed(3));
    setStyle(el.hero, "h", "visibility", heroOut >= 1 ? "hidden" : "visible");
    if (heroOut < 1) {
      setStyle(el.heroImg, "hi", "transform", "scale(" + (1 + .07 * clamp(s, 0, 1.1)).toFixed(4) + ")");
      setStyle(el.heroText, "ht", "transform", "translate3d(0," + (-60 * ss(0, .8, s)).toFixed(1) + "px,0)");
      setStyle(el.heroText, "ht", "opacity", (1 - ss(.05, .55, s)).toFixed(3));
      if (el.cue) setStyle(el.cue, "cu", "opacity", (1 - ss(0, .12, s)).toFixed(3));
    }
    if (el.mark) el.mark.classList.toggle("is-away", s > .8);
    if (el.progress) setStyle(el.progress, "pg", "--progress", clamp(s / TOTAL, 0, 1).toFixed(4));

    /* the church: camera, turn toward the card being read, light */
    var camZ = camAt(s), yaw = 0, holdAny = 0;
    var P = window.Nave && window.Nave.P;
    if (P) P.camZ = camZ;                            // so project() below uses this frame's camera
    cards.forEach(function (c) {
      var st = c.st;
      c.h = ss(lerp(st.s0, st.a, .25), st.a, s) * (st.stay ? 1 - ss(st.b, st.s1, s) : 1 - ss(st.b, lerp(st.b, st.s1, .55), s));
      if (c.h > 0 && st.x) yaw += c.h * Math.atan2(st.x, Math.max(.4, st.z - camZ));
      holdAny = Math.max(holdAny, c.h);
    });
    var lightUp = ss(1.0, 2.4, s);
    var bloom = ss(15.6, 16.7, s) + .18 * bump(5.7, 6.3, 6.9, 7.5, s);   // the rose window: brighter for the verse, then floods
    var finaleOn = s > 16.6;
    if (window.Nave) {
      window.Nave.P.yaw = yaw;
      if (!finaleOn || s < 17.6) window.Nave.draw(now, { camZ: camZ, yaw: yaw, expo: .04 + .96 * lightUp, ignite: ss(1.05, 2.6, s), win: ss(1.8, 2.9, s), bloom: bloom });
    }
    setStyle(el.nave, "nv", "visibility", s > 17.6 ? "hidden" : "visible");

    /* 2 · welcome */
    var w = bump(1.15, 1.45, 2.05, 2.35, s);
    setStyle(el.wake, "wk", "opacity", w.toFixed(3));
    setStyle(el.wake, "wk", "transform", "translate3d(0," + ((1 - ss(1.15, 1.6, s)) * 14 - ss(2.05, 2.35, s) * 14).toFixed(1) + "px,0)");

    /* 3 · Save the Date hangs in the aisle */
    anchor(el.save, "sv", 0, 2.05, 4.2, 2.7, ss(2.35, 2.9, s), 1.8);

    /* 4 · the cards */
    cards.forEach(function (c) { placeCard(c, s); });

    /* the verse, under the brightening rose window */
    var v = bump(5.65, 5.95, 7.1, 7.4, s);
    setStyle(el.verse, "vs", "opacity", v.toFixed(3));
    setStyle(el.verse, "vs", "--p", clamp((s - 5.85) / 1.05, 0, 1).toFixed(4));
    setStyle(el.verse, "vs", "visibility", v > 0 ? "visible" : "hidden");

    /* 5 · the light */
    var pr = bump(15.75, 16.05, 16.45, 16.75, s);
    setStyle(el.presence, "pr", "opacity", pr.toFixed(3));
    setStyle(el.presence, "pr", "visibility", pr > 0 ? "visible" : "hidden");
    var fl = ss(16.15, 16.75, s) * (1 - ss(16.8, 17.5, s));
    setStyle(el.flash, "fl", "opacity", fl.toFixed(3));

    /* 6 · together */
    setStyle(el.finale, "fn", "visibility", finaleOn ? "visible" : "hidden");
    if (finaleOn) {
      var f = clamp((s - 16.75) / (TOTAL - 16.75), 0, 1);
      setStyle(el.photo, "ph", "transform", "scale(" + (1.0 + .085 * f).toFixed(4) + ")");
      var wr = ss(17.25, 18.0, s);
      setStyle(el.fin.names, "fnn", "--write", wr.toFixed(4));
      setStyle(el.fin.full, "ff", "opacity", ss(17.9, 18.25, s).toFixed(3));
      setStyle(el.fin.date, "fd", "opacity", ss(18.05, 18.4, s).toFixed(3));
      setStyle(el.fin.quote, "fq", "opacity", ss(18.45, 18.9, s).toFixed(3));
      setStyle(el.fin.ref, "fr", "opacity", ss(18.7, 19.0, s).toFixed(3));
      setStyle(el.fin.candle, "fc", "opacity", ss(19.05, 19.5, s).toFixed(3));
      if (dust) dust.draw(now, ss(16.8, 17.6, s));
    }
  }

  // a page element hanging in the church at (x, y, z): it is drawn at its
  // CSS size when it is `at` metres away and grows/shrinks with distance
  function anchor(node, key, x, y, z, at, fadeIn, gone) {
    var p = window.Nave && window.Nave.project(x, y, z);
    var o = p ? fadeIn * ss(gone * .55, gone, p.dz) : 0;
    setStyle(node, key, "opacity", o.toFixed(3));
    setStyle(node, key, "visibility", o > .002 ? "visible" : "hidden");
    if (o > .002) setStyle(node, key, "transform", "translate3d(" + p.x.toFixed(1) + "px," + p.y.toFixed(1) + "px,0) translate(-50%,-50%) scale(" + (at / p.dz).toFixed(4) + ")");
  }

  function placeCard(c, s) {
    var st = c.st, node = c.node, key = "c" + st.id;
    var on = s > st.s0 - .7 && s < st.s1 + .3;
    if (!on) { setStyle(node, key, "visibility", "hidden"); setStyle(node, key, "opacity", "0"); return; }
    var p = window.Nave.project(st.x, CARD_Y, st.z), vw = root.clientWidth, vh = window.innerHeight;
    var h = c.h;
    var x, y, sc, o;
    if (p) {
      x = lerp(p.x, vw / 2, h); y = lerp(p.y, vh / 2, h); sc = lerp(HOLD / p.dz, 1, h);
      // appears in the distance just before its approach, gone before it grows past you
      o = ss(11, 7.5, p.dz) * ss(st.s0 - .6, st.s0 + .05, s) * (st.stay ? 1 : ss(1.5, 2.2, p.dz));
    } else { x = vw / 2; y = vh / 2; sc = 1; o = 0; }
    var away = st.stay ? 1 - ss(st.b + .02, st.b + .3, s) : 1;   // the reply card dissolves into the light
    o = Math.max(o, h) * away;
    setStyle(node, key, "visibility", o > .002 ? "visible" : "hidden");
    setStyle(node, key, "opacity", o.toFixed(3));
    setStyle(node, key, "transform", "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0) translate(-50%,-50%) scale(" + Math.min(sc, 1.3).toFixed(4) + ")");
    var pe = h > .6 ? "auto" : "none";
    if (pe !== c.pe) { c.pe = pe; node.style.pointerEvents = pe; }
  }

  /* ---------------------------------------------- gold dust over the photo */
  function makeDust(cv) {
    if (!cv || !cv.getContext) return null;
    var g = cv.getContext("2d"), parts = [], W = 0, H = 0;
    function size() { W = cv.width = cv.clientWidth || 1; H = cv.height = cv.clientHeight || 1; }
    for (var i = 0; i < 46; i++) parts.push({ x: Math.random(), y: Math.random(), r: .6 + Math.random() * 1.8, sp: .008 + Math.random() * .02, ph: Math.random() * 6.3 });
    var sprite = doc.createElement("canvas"); sprite.width = sprite.height = 32;
    var sg = sprite.getContext("2d"), rg = sg.createRadialGradient(16, 16, 0, 16, 16, 16);
    rg.addColorStop(0, "rgba(255,236,190,1)"); rg.addColorStop(.35, "rgba(255,206,130,.55)"); rg.addColorStop(1, "rgba(255,190,110,0)");
    sg.fillStyle = rg; sg.fillRect(0, 0, 32, 32);
    var lastT = 0;
    return {
      draw: function (now, a) {
        if (!W) size();
        if (now - lastT < 33) return;                 // 30 fps is plenty for drifting dust
        var dt = lastT ? Math.min(.1, (now - lastT) / 1000) : .03; lastT = now;
        g.clearRect(0, 0, W, H);
        if (a <= 0) return;
        g.globalCompositeOperation = "lighter";
        parts.forEach(function (q) {
          q.y -= q.sp * dt; if (q.y < -.05) { q.y = 1.05; q.x = Math.random(); }
          var x = (q.x + .02 * Math.sin(now / 1900 + q.ph)) * W, y = q.y * H;
          g.globalAlpha = a * (.35 + .35 * Math.sin(now / 700 + q.ph * 3));
          var d = q.r * 7; g.drawImage(sprite, x - d / 2, y - d / 2, d, d);
        });
        g.globalAlpha = 1;
      },
      resize: size,
    };
  }
  window.addEventListener("resize", function () { if (dust) dust.resize(); }, { passive: true });

  window.Journey = { init: init, TOTAL: TOTAL, STATIONS: STATIONS };
})();
