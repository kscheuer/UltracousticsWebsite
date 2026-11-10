/* ==========================================================================
   Bandwidth explorer (BROADSONIC page)
   Measured spectra, each divided by its own background. It opens on an
   overview with every measurement overlaid on one 0-4.5 MHz axis and a legend
   in the empty high-frequency corner: pointing at a name or a curve colours
   that one and greys the rest, and a click opens it alone on an axis fitted
   to its own range.
   Laid out like the Technology film above it: text over the picture, a quiet
   row of names underneath, round controls in the corner.
   Data: assets/demos/data/bandwidth_spectra.json (built by
   assets/Data/build_bandwidth_spectra.py, which git ignores)
   ========================================================================== */
(function () {
  'use strict';

  var root = document.getElementById('bandwidthExplorer');
  if (!root) return;

  var canvas = root.querySelector('canvas');
  var ctx = canvas.getContext('2d');
  var stepList = root.querySelector('.tech-film__steps');
  var textEl = root.querySelector('.bw-film__text');
  var capEl = root.querySelector('.bw-film__cap');
  var captionEl = root.querySelector('[data-bw="caption"]');
  var linkEl = root.querySelector('[data-bw="link"]');
  var micButton = root.querySelector('.bw-film__mic');
  var infoToggle = root.querySelector('.tech-film__info-toggle');
  var info = document.getElementById('bwInfo');

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var HEAR = 0.02;   // MHz, upper limit of human hearing
  var CONV = 0.1;    // MHz, upper limit of a conventional ultrasonic microphone
  var MORPH_MS = 700;
  var AUTO_MS = 6500;      // time on each measurement when it plays by itself
  var TOUR_MS = 2000;      // time on each curve as the overview points them out
  var OVERVIEW = -1;
  var OVERVIEW_MAX = 80;   // dB, the overview's y-axis; the strongest curve peaks at 73
  var NEUTRAL = 0.6;       // emphasis of every curve while none is picked out
  var OVERVIEW_CAPTION = 'Leaks, sparks, cavitation, switching electronics and cutting tools all sound far above 100 kHz.';

  var data = null;
  var steps = [];          // the buttons under the picture: Overview, then one per measurement
  var active = null;       // OVERVIEW or an index into data.sources
  var lastSource = 0;      // the measurement last shown alone
  var shown = null;        // the single curve on screen (dB per bin), morphs between sources
  var shownMax = OVERVIEW_MAX;   // the y-axis maximum on screen
  var shownFx = 4.5;       // the right-hand end of the x-axis on screen, MHz
  var from = null, fromMax = 0, fromFx = 0, morphStart = 0;
  var ov = 1, ovTarget = 1;       // 1 = every curve overlaid, 0 = a single measurement
  var mask = 0, maskTarget = 0;   // 1 = "Conventional microphone" view
  var reveal = reducedMotion ? 1 : 0, revealStart = 0;
  var emphasis = [];       // per curve in the overview: 0 greyed out, 1 picked out
  var hoverPick = -1;      // the curve under the pointer, or whose legend entry is
  var tourPick = -1, tourTimer = null, pointerUsed = false;   // the overview pointing them out in turn
  var legend = [];         // hit boxes of the legend entries, set as they are drawn
  var hoverF = null;
  var visible = false, userTook = false, autoTimer = null, capTimer = null, raf = null;
  var W = 0, H = 0, pad = null, narrow = false;

  function resize() {
    var rect = canvas.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = rect.width;
    H = rect.height;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    narrow = W < 600;
    canvas.parentElement.style.setProperty('--bw-h', H + 'px');   // sizes the text over the chart
    // The top of the picture is left to the headline and caption, measured at its tallest so
    // the chart keeps its place as captions change; the bottom corners are left to the controls
    var tallest = 0;
    linkEl.hidden = false;
    [OVERVIEW_CAPTION].concat(data.sources.map(function (s) { return s.caption; })).forEach(function (text) {
      captionEl.textContent = text;
      tallest = Math.max(tallest, textEl.offsetHeight);
    });
    setCaption();
    var top = textEl.offsetTop + tallest + Math.max(10.5, Math.min(13, W / 95)) * 2.9 + (narrow ? 14 : 26);
    pad = narrow
      ? { l: W * 0.06 + 26, r: W * 0.06, t: top, b: 72 }
      : { l: W * 0.035 + 30, r: W * 0.035, t: top, b: 84 };
    draw();
  }

  function xOf(f) { return pad.l + (f / shownFx) * (W - pad.l - pad.r); }
  function yOf(db) { return H - pad.b - Math.max(0, db) * (H - pad.t - pad.b) / shownMax; }

  function ease(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

  function fmtFreq(f) {
    return f < 1 ? Math.round(f * 1000) + ' kHz' : f.toFixed(2) + ' MHz';
  }

  function binOf(f, arr) { return Math.round(f / data.fmax * (arr.length - 1)); }

  function picked() { return hoverPick >= 0 ? hoverPick : tourPick; }

  // A curve from 0 to the end of the x-axis, as far as the opening sweep has reached.
  // Returns the x it stopped at.
  function tracePath(arr) {
    var last = Math.max(1, Math.floor(binOf(shownFx, arr) * reveal));
    ctx.beginPath();
    for (var i = 0; i <= last; i++) {
      var x = xOf(data.fmax * i / (arr.length - 1)), y = yOf(arr[i]);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    return xOf(data.fmax * last / (arr.length - 1));
  }

  function magenta(x0, x1) {
    var grad = ctx.createLinearGradient(x0, 0, x1, 0);
    grad.addColorStop(0, '#FF4FC9');
    grad.addColorStop(0.55, '#c840e9');
    grad.addColorStop(1, '#a855f7');
    return grad;
  }

  // One curve at an emphasis from 0 (a grey line) to 1 (magenta, filled)
  function drawCurve(arr, e, alpha, x0, x1, y0, y1) {
    var lift = Math.max(0, (e - NEUTRAL) / (1 - NEUTRAL));
    var endX = tracePath(arr);
    ctx.lineJoin = 'round';
    ctx.lineWidth = (narrow ? 1.2 : 1.4) + 0.6 * lift;
    ctx.globalAlpha = alpha * 0.2 * (1 - e);
    ctx.strokeStyle = '#fff';
    ctx.stroke();
    ctx.globalAlpha = alpha * e;
    ctx.strokeStyle = magenta(x0, x1);
    ctx.stroke();
    if (lift > 0.01) {
      ctx.lineTo(endX, y1); ctx.lineTo(x0, y1); ctx.closePath();
      var fill = ctx.createLinearGradient(0, y0, 0, y1);
      fill.addColorStop(0, 'rgba(255,79,201,0.30)');
      fill.addColorStop(1, 'rgba(255,79,201,0.02)');
      ctx.globalAlpha = alpha * lift;
      ctx.fillStyle = fill;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.lineWidth = 1;
  }

  function drawOverview(x0, x1, y0, y1, small, font) {
    // Greyed-out curves first, so the one picked out sits in front
    var order = data.sources.map(function (s, k) { return k; })
      .sort(function (a, b) { return emphasis[a] - emphasis[b]; });
    ctx.save();
    ctx.beginPath(); ctx.rect(x0, y0 - 2, x1 - x0, y1 - y0 + 2); ctx.clip();
    order.forEach(function (k) { drawCurve(data.sources[k].db, emphasis[k], ov, x0, x1, y0, y1); });
    ctx.restore();

    // Legend in the high-frequency corner, which every curve leaves empty: a column,
    // or one row along the top where the chart is too short for a column
    var row = small * (narrow ? 1.75 : 2.1);
    var across = (y1 - y0) < row * data.sources.length + 40 && !narrow;
    var right = x1;
    ctx.font = '500 ' + font;
    ctx.textBaseline = 'middle';
    legend = [];
    for (var n = data.sources.length - 1; n >= 0; n--) {
      var e = emphasis[n];
      var name = data.sources[n].name;
      var cy = y0 + small * 1.2 + (across ? 0 : row * n);
      var tw = ctx.measureText(name).width;
      ctx.textAlign = 'right';
      ctx.globalAlpha = ov * (0.4 + 0.6 * e);
      ctx.fillStyle = '#fff';
      ctx.fillText(name, right, cy);
      ctx.lineWidth = 2;
      ctx.globalAlpha = ov * 0.3 * (1 - e);
      ctx.strokeStyle = '#fff';
      ctx.beginPath(); ctx.moveTo(right - tw - 26, cy); ctx.lineTo(right - tw - 8, cy); ctx.stroke();
      ctx.globalAlpha = ov * e;
      ctx.strokeStyle = '#FF4FC9';
      ctx.stroke();
      legend.push({ k: n, x: right - tw - 32, y: cy - row / 2, w: tw + 36, h: row });
      if (across) right -= tw + 48;
    }
    ctx.globalAlpha = 1;
    ctx.lineWidth = 1;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  }

  function drawSingle(x0, x1, y0, y1, font, settled) {
    var src = data.sources[lastSource];
    drawCurve(shown, 1, 1 - ov, x0, x1, y0, y1);
    if (!settled || active === OVERVIEW || mask > 0.5) return;

    // Callouts on the features of this measurement
    ctx.font = '500 ' + font;
    (src.notes || []).forEach(function (note) {
      if ((narrow && note.wide) || note.f > shownFx) return;
      var nx = xOf(note.f), ny = yOf(shown[binOf(note.f, shown)]);
      var ly = Math.max(y0 + 14, ny - (note.lift || 26));
      ctx.strokeStyle = 'rgba(255,255,255,0.45)';
      ctx.beginPath(); ctx.moveTo(nx + 0.5, ny - 4); ctx.lineTo(nx + 0.5, ly + 4); ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(nx, ny, 2.5, 0, 6.3); ctx.fill();
      var tw = ctx.measureText(note.label).width;
      var tx = Math.min(Math.max(nx - tw / 2, xOf(CONV) + 6), x1 - tw - 2);
      ctx.fillText(note.label, tx, ly - 2);
    });

    // Pointer readout
    if (hoverF !== null) {
      var level = shown[binOf(hoverF, shown)];
      var hx = xOf(hoverF), hy = yOf(level);
      var text = fmtFreq(hoverF) + '  +' + Math.max(0, level).toFixed(0) + ' dB';
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.beginPath(); ctx.moveTo(hx + 0.5, y0); ctx.lineTo(hx + 0.5, y1); ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(hx, hy, 3.5, 0, 6.3); ctx.fill();
      var rw = ctx.measureText(text).width;
      ctx.fillText(text, hx + 10 + rw > x1 ? hx - 10 - rw : hx + 10, y1 - 8);
    }
  }

  function draw() {
    if (!data || !W || active === null) return;
    var x0 = pad.l, x1 = W - pad.r, y0 = pad.t, y1 = H - pad.b;
    var xHear = xOf(HEAR), xConv = xOf(CONV);
    var small = Math.max(10.5, Math.min(13, W / 95));
    var font = small + 'px Inter, sans-serif';
    var settled = reveal >= 1 && !from && Math.abs(ov - ovTarget) < 0.02;
    ctx.clearRect(0, 0, W, H);

    // Bands: hearing and the conventional microphone, at the left of the axis
    ctx.fillStyle = 'rgba(245,158,11,0.20)';
    ctx.fillRect(x0, y0, xConv - x0, y1 - y0);
    ctx.fillStyle = 'rgba(74,222,128,0.28)';
    ctx.fillRect(x0, y0, xHear - x0, y1 - y0);

    // Axes, fitted to what is on screen: quiet labels, no box
    var tick = shownFx > 3.2 ? 1 : (shownFx > 1.2 ? 0.5 : 0.2);
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.fillStyle = 'rgba(255,255,255,0.38)';
    for (var f = 0; f < shownFx - tick * 0.45; f += tick) {
      ctx.textAlign = f === 0 ? 'left' : 'center';
      ctx.fillText(String(Math.round(f * 10) / 10), xOf(f), y1 + 10);
    }
    ctx.textAlign = 'right';
    ctx.fillText((Math.round(shownFx * 10) / 10) + ' MHz', x1, y1 + 10);
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('dB above background', x1, y0 - 8);
    var step = shownMax > 45 ? 20 : (shownMax > 22 ? 10 : 5);
    ctx.textBaseline = 'middle';
    for (var d = 0; d <= shownMax + 0.01; d += step) {
      var gy = Math.round(yOf(d)) + 0.5;
      ctx.strokeStyle = d === 0 ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.045)';
      ctx.beginPath(); ctx.moveTo(x0, gy); ctx.lineTo(x1, gy); ctx.stroke();
      ctx.fillText(d === 0 ? '0' : '+' + d, x0 - 7, gy);
    }
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    if (ov > 0.01) drawOverview(x0, x1, y0, y1, small, font); else legend = [];
    if (ov < 0.99) drawSingle(x0, x1, y0, y1, font, settled);

    // "Conventional microphone" view: everything above 100 kHz is not recorded
    if (mask > 0.01) {
      ctx.fillStyle = 'rgba(0,0,0,' + (0.9 * mask) + ')';
      ctx.fillRect(xConv + 1, y0 - 1, x1 - xConv, y1 - y0 + 1);
      ctx.globalAlpha = mask;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.font = '500 ' + Math.max(15, Math.min(28, W * 0.019)) + 'px Inter, sans-serif';
      ctx.fillText('Not recorded', (xConv + x1) / 2, (y0 + y1) / 2);
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.font = font;
      ctx.fillText(Math.round((1 - CONV / shownFx) * 100) + '% of this axis is beyond a conventional microphone',
        (xConv + x1) / 2, (y0 + y1) / 2 + small * 1.9);
      ctx.globalAlpha = 1;
      ctx.textAlign = 'left';
    }

    // Band edges, named where they end
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = 'rgba(245,158,11,0.8)';
    ctx.beginPath(); ctx.moveTo(xConv + 0.5, y0 - small * 2.9); ctx.lineTo(xConv + 0.5, y1); ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = '500 ' + font;
    ctx.fillStyle = 'rgba(74,222,128,0.95)';
    ctx.fillText(narrow ? 'Hearing, 20 kHz' : 'Human hearing, to 20 kHz', xConv + 7, y0 - small * 1.9);
    ctx.fillStyle = 'rgba(245,158,11,0.95)';
    ctx.fillText(narrow ? 'Microphones, 100 kHz' : 'Conventional microphones, to 100 kHz', xConv + 7, y0 - small * 0.55);
  }

  function frame(now) {
    raf = null;
    var busy = false;
    if (reveal < 1) {
      if (!revealStart) revealStart = now;
      reveal = Math.min(1, (now - revealStart) / 1400);
      busy = true;
    }
    if (from) {
      var t = Math.min(1, (now - morphStart) / MORPH_MS), e = ease(t);
      var to = target();
      for (var i = 0; i < shown.length; i++) shown[i] = from[i] + (to.db[i] - from[i]) * e;
      shownMax = fromMax + (to.max - fromMax) * e;
      shownFx = fromFx + (to.fx - fromFx) * e;
      if (t >= 1) from = null; else busy = true;
    }
    if (Math.abs(ov - ovTarget) > 0.005) {
      ov += (ovTarget - ov) * 0.16;
      busy = true;
    } else {
      ov = ovTarget;
    }
    if (Math.abs(mask - maskTarget) > 0.005) {
      mask += (maskTarget - mask) * 0.18;
      busy = true;
    } else {
      mask = maskTarget;
    }
    var pick = picked();
    for (var k = 0; k < emphasis.length; k++) {
      var goal = pick < 0 ? NEUTRAL : (k === pick ? 1 : 0);
      if (Math.abs(emphasis[k] - goal) > 0.01) {
        emphasis[k] += (goal - emphasis[k]) * 0.2;
        busy = true;
      } else {
        emphasis[k] = goal;
      }
    }
    draw();
    if (busy) kick();
  }

  function kick() { if (!raf) raf = requestAnimationFrame(frame); }

  function refresh() {
    if (!reducedMotion) { kick(); return; }
    var pick = picked();
    emphasis = emphasis.map(function (e, k) { return pick < 0 ? NEUTRAL : (k === pick ? 1 : 0); });
    draw();
  }

  // What the single curve is heading for. In the overview it is the measurement last
  // shown alone, on the overview's axes, so it lines up with its curve there.
  function target() {
    if (active === OVERVIEW) return { db: data.sources[lastSource].db, max: OVERVIEW_MAX, fx: data.fmax };
    return data.sources[active];
  }

  function setCaption() {
    var src = active === OVERVIEW ? null : data.sources[active];
    captionEl.textContent = src ? src.caption : OVERVIEW_CAPTION;
    linkEl.hidden = !src;
    if (src) {
      linkEl.textContent = src.linkText;
      linkEl.href = src.link;
    }
    capEl.classList.remove('is-changing');
  }

  // Left alone, the overview points out each curve in turn
  function tour() {
    clearTimeout(tourTimer);
    if (active !== OVERVIEW || pointerUsed || reducedMotion || !visible) {
      if (tourPick !== -1) { tourPick = -1; refresh(); }
      return;
    }
    tourTimer = setTimeout(function () {
      tourPick = tourPick + 1 >= data.sources.length ? -1 : tourPick + 1;
      kick();
      tour();
    }, TOUR_MS);
  }

  function select(i, byUser) {
    if (byUser) { userTook = true; clearTimeout(autoTimer); }
    if (i === active) return;
    var first = active === null;
    var wasOverview = active === OVERVIEW;
    active = i;
    if (i !== OVERVIEW) lastSource = i;
    ovTarget = i === OVERVIEW ? 1 : 0;
    hoverPick = -1;
    tourPick = -1;
    hoverF = null;
    canvas.style.cursor = i === OVERVIEW ? 'default' : 'crosshair';
    steps.forEach(function (b, k) {
      b.classList.toggle('is-active', k === i + 1);
      b.setAttribute('aria-pressed', k === i + 1 ? 'true' : 'false');
    });
    canvas.setAttribute('aria-label', i === OVERVIEW
      ? 'Measured spectra from 0 to ' + data.fmax + ' MHz, overlaid: ' + data.sources.map(function (s) { return s.name; }).join(', ') + '. ' + OVERVIEW_CAPTION
      : 'Measured spectrum, ' + data.sources[i].name + '. ' + data.sources[i].caption);
    clearTimeout(capTimer);
    var to = target();
    if (reducedMotion || first) {
      setCaption();
      shown = to.db.slice();
      shownMax = to.max;
      shownFx = to.fx;
      from = null;
      ov = ovTarget;
      refresh();
      draw();
    } else {
      capEl.classList.add('is-changing');
      capTimer = setTimeout(setCaption, 300);
      // Out of the overview, the chosen curve grows from where it sat among the others
      if (wasOverview) shown = to.db.slice();
      from = shown.slice();
      fromMax = shownMax;
      fromFx = shownFx;
      morphStart = performance.now();
      kick();
    }
    tour();
  }

  function scheduleAuto() {
    clearTimeout(autoTimer);
    if (userTook || reducedMotion || !visible) return;
    // The overview stays long enough to point out every curve once
    var wait = active === OVERVIEW ? TOUR_MS * (data.sources.length + 2) : AUTO_MS;
    autoTimer = setTimeout(function () {
      select(active + 1 >= data.sources.length ? OVERVIEW : active + 1, false);
      scheduleAuto();
    }, wait);
  }

  function addStep(name, i) {
    var item = document.createElement('li');
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'tech-film__step';
    b.textContent = name;
    b.addEventListener('click', function () { select(i, true); });
    item.appendChild(b);
    stepList.appendChild(item);
    steps.push(b);
  }

  // The overview curve under the pointer: a legend entry, else the nearest curve within reach
  function pickAt(px, py) {
    for (var n = 0; n < legend.length; n++) {
      var box = legend[n];
      if (px >= box.x && px <= box.x + box.w && py >= box.y && py <= box.y + box.h) return box.k;
    }
    var f = (px - pad.l) / (W - pad.l - pad.r) * shownFx;
    if (f < 0 || f > shownFx || py < pad.t || py > H - pad.b + 6) return -1;
    var best = -1, reach = 16;
    data.sources.forEach(function (src, k) {
      var level = src.db[binOf(f, src.db)];
      var gap = Math.abs(yOf(level) - py);
      if (level > 1 && gap < reach) { reach = gap; best = k; }
    });
    return best;
  }

  function build() {
    emphasis = data.sources.map(function () { return NEUTRAL; });

    // The quiet row under the picture: the overview, then one name per measurement
    addStep('Overview', OVERVIEW);
    data.sources.forEach(function (src, i) { addStep(src.name, i); });

    micButton.addEventListener('click', function () {
      userTook = true;
      clearTimeout(autoTimer);
      maskTarget = maskTarget ? 0 : 1;
      micButton.setAttribute('aria-pressed', maskTarget ? 'true' : 'false');
      if (reducedMotion) { mask = maskTarget; draw(); } else kick();
    });

    infoToggle.addEventListener('click', function () {
      info.hidden = !info.hidden;
      infoToggle.setAttribute('aria-expanded', info.hidden ? 'false' : 'true');
    });

    function point(e) {
      var rect = canvas.getBoundingClientRect();
      var px = e.clientX - rect.left, py = e.clientY - rect.top;
      if (active === OVERVIEW) {
        var was = hoverPick;
        hoverPick = pickAt(px, py);
        if (hoverPick >= 0 && !pointerUsed) { pointerUsed = true; tour(); }
        canvas.style.cursor = hoverPick >= 0 ? 'pointer' : 'default';
        if (hoverPick !== was) refresh();
        return;
      }
      var f = (px - pad.l) / (rect.width - pad.l - pad.r) * shownFx;
      hoverF = f < 0 || f > shownFx ? null : f;
      draw();
    }
    canvas.addEventListener('pointermove', point);
    canvas.addEventListener('pointerdown', point);
    canvas.addEventListener('pointerleave', function () {
      hoverF = null;
      if (hoverPick !== -1) { hoverPick = -1; refresh(); } else draw();
    });
    // In the overview, a curve or its legend entry opens that measurement
    canvas.addEventListener('click', function () {
      if (active === OVERVIEW && hoverPick >= 0) select(hoverPick, true);
    });

    select(OVERVIEW, false);
    resize();
    window.addEventListener('resize', resize);
    // Text heights change once the web font arrives
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(resize);

    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible) { kick(); scheduleAuto(); } else clearTimeout(autoTimer);
      tour();
    }, { threshold: 0.25 }).observe(canvas);
  }

  fetch('assets/demos/data/bandwidth_spectra.json?v=20261110-overview')
    .then(function (r) { return r.json(); })
    .then(function (json) { data = json; build(); })
    .catch(function () { root.classList.add('bw--failed'); });
})();
