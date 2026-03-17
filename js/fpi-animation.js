/* ==========================================================================
   Fabry-Perot Interferometer Animation — BROADSONIC "How It Works"
   ========================================================================== */

(function () {
  var canvas = document.getElementById('fpiCanvas');
  if (!canvas) return;

  var ctx = canvas.getContext('2d');
  var dpr = window.devicePixelRatio || 1;
  var W, H;
  var time = 0;
  var animId;

  // Colors
  var ACCENT = '#FF4FC9';
  var LASER_RED = '#ff3333';
  var FIBER_CORE = '#1a1a2e';
  var MIRROR = '#999';
  var MEMBRANE_COL = '#ccc';
  var TEXT_DIM = '#666';
  var TEXT_MED = '#999';
  var TEXT_BRIGHT = '#fff';
  var CAVITY_GLOW = 'rgba(255, 79, 201, 0.04)';

  // Step highlighting
  var steps = document.querySelectorAll('.fpi-step');
  var activeStep = 0;
  var stepTimer = 0;
  var STEP_DURATION = 120;

  function resize() {
    var rect = canvas.parentElement.getBoundingClientRect();
    W = rect.width;
    H = Math.min(rect.width * 0.8, 420);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function updateSteps() {
    stepTimer++;
    if (stepTimer >= STEP_DURATION) {
      stepTimer = 0;
      activeStep = (activeStep + 1) % 4;
    }
    steps.forEach(function (s, i) {
      s.classList.toggle('fpi-step--active', i === activeStep);
    });
  }

  // Helper: draw a thin leader line from (x1,y1) to (x2,y2)
  function leaderLine(x1, y1, x2, y2) {
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  function draw() {
    time++;
    updateSteps();
    ctx.clearRect(0, 0, W, H);

    // --- Layout ---
    var centerY = H * 0.40;
    var fiberLeft = W * 0.06;
    var fiberRight = W * 0.42;
    var fiberH = 10;
    var cavityLeft = fiberRight;
    var cavityRight = W * 0.68;
    var cavityW = cavityRight - cavityLeft;
    var mirrorH = 56;

    var soundPhase = time * 0.06;
    var membraneDeflection = Math.sin(soundPhase) * 6;
    var memX = cavityRight + membraneDeflection;
    var gapW = memX - cavityLeft;

    // === FIBER OPTIC ===
    // Cladding with rounded end
    var cladH = fiberH * 2 + 6;
    ctx.fillStyle = '#2a2a2a';
    ctx.beginPath();
    ctx.roundRect(fiberLeft, centerY - cladH / 2, fiberRight - fiberLeft + 2, cladH, [4, 0, 0, 4]);
    ctx.fill();
    // Subtle border
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Core
    ctx.fillStyle = FIBER_CORE;
    ctx.fillRect(fiberLeft + 6, centerY - fiberH / 2, fiberRight - fiberLeft - 4, fiberH);

    // Laser pulse
    var pulseX = fiberLeft + ((time * 2.5) % (fiberRight - fiberLeft));
    var grad = ctx.createRadialGradient(pulseX, centerY, 0, pulseX, centerY, 20);
    grad.addColorStop(0, 'rgba(255, 51, 51, 0.85)');
    grad.addColorStop(0.35, 'rgba(255, 51, 51, 0.25)');
    grad.addColorStop(1, 'rgba(255, 51, 51, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(fiberLeft + 6, centerY - fiberH - 2, fiberRight - fiberLeft - 4, fiberH * 2 + 4);

    // === CAVITY ===
    // Background glow
    ctx.fillStyle = CAVITY_GLOW;
    ctx.fillRect(cavityLeft + 3, centerY - mirrorH / 2 + 2, cavityW - 6, mirrorH - 4);

    // Subtle cavity border
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    ctx.strokeRect(cavityLeft + 3, centerY - mirrorH / 2 + 2, cavityW - 6, mirrorH - 4);

    // Back mirror (flat)
    ctx.fillStyle = MIRROR;
    ctx.beginPath();
    ctx.roundRect(cavityLeft - 2, centerY - mirrorH / 2, 5, mirrorH, [2, 0, 0, 2]);
    ctx.fill();

    // Front membrane (convex curve)
    ctx.fillStyle = MEMBRANE_COL;
    ctx.beginPath();
    ctx.moveTo(memX - 2, centerY - mirrorH / 2);
    ctx.quadraticCurveTo(memX + 12, centerY, memX - 2, centerY + mirrorH / 2);
    ctx.lineTo(memX + 1, centerY + mirrorH / 2);
    ctx.quadraticCurveTo(memX + 14, centerY, memX + 1, centerY - mirrorH / 2);
    ctx.closePath();
    ctx.fill();

    // Bouncing photons
    for (var b = 0; b < 6; b++) {
      var t = ((time * 3 + b * 35) % 210) / 210;
      var bx = cavityLeft + 6 + t * (gapW - 12);
      var by = centerY + Math.sin(t * Math.PI * 4) * 14;
      var alpha = 0.7 - t * 0.5;
      if (alpha <= 0) continue;
      // Glow
      var pg = ctx.createRadialGradient(bx, by, 0, bx, by, 6);
      pg.addColorStop(0, 'rgba(255, 51, 51, ' + (alpha * 0.5) + ')');
      pg.addColorStop(1, 'rgba(255, 51, 51, 0)');
      ctx.fillStyle = pg;
      ctx.fillRect(bx - 6, by - 6, 12, 12);
      // Dot
      ctx.beginPath();
      ctx.arc(bx, by, 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 51, 51, ' + alpha + ')';
      ctx.fill();
    }

    // Interference fringes
    var fringeY = centerY - mirrorH / 2 - 8;
    for (var f = 0; f < 8; f++) {
      var fx = cavityLeft + 14 + f * ((gapW - 28) / 7);
      var fIntensity = 0.2 + 0.8 * Math.pow(Math.cos((f + soundPhase * 2) * 0.8), 2);
      // Glow behind fringe
      ctx.fillStyle = 'rgba(255, 51, 51, ' + (fIntensity * 0.15) + ')';
      ctx.fillRect(fx - 3, fringeY - 1, 6, 10);
      ctx.fillStyle = 'rgba(255, 51, 51, ' + fIntensity + ')';
      ctx.fillRect(fx - 1, fringeY, 2, 8);
    }

    // === SOUND WAVES (Step 3) ===
    var waveStartX = W * 0.90;
    ctx.lineWidth = 1.5;
    for (var w = 0; w < 5; w++) {
      var waveR = 16 + ((time * 1.5 + w * 28) % 130);
      var waveAlpha = 1 - waveR / 150;
      if (waveAlpha <= 0) continue;
      ctx.strokeStyle = 'rgba(255, 79, 201, ' + (waveAlpha * 0.4) + ')';
      ctx.beginPath();
      ctx.arc(waveStartX, centerY, waveR, Math.PI * 0.6, Math.PI * 1.4);
      ctx.stroke();
    }

    // Arrow from sound to membrane
    ctx.strokeStyle = 'rgba(255, 79, 201, 0.35)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(waveStartX - 22, centerY);
    ctx.lineTo(memX + 22, centerY);
    ctx.stroke();
    ctx.setLineDash([]);
    // Arrowhead
    ctx.fillStyle = 'rgba(255, 79, 201, 0.5)';
    ctx.beginPath();
    ctx.moveTo(memX + 22, centerY);
    ctx.lineTo(memX + 30, centerY - 4);
    ctx.lineTo(memX + 30, centerY + 4);
    ctx.fill();

    // === Δd indicator ===
    var indicatorY = centerY + mirrorH / 2 + 14;
    ctx.strokeStyle = 'rgba(255, 79, 201, 0.35)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(cavityLeft + 6, indicatorY);
    ctx.lineTo(memX - 6, indicatorY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = ACCENT;
    ctx.font = '600 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Δd', (cavityLeft + memX) / 2, indicatorY - 3);

    // === OUTPUT SIGNAL (Step 4) ===
    var sigX = fiberLeft + 16;
    var sigY = H * 0.84;
    var sigW = W * 0.56;

    ctx.strokeStyle = ACCENT;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (var s = 0; s < sigW; s++) {
      var sx = sigX + s;
      var sy = sigY + Math.sin((s * 0.04) + soundPhase) * 10 *
               (1 + 0.3 * Math.sin(s * 0.15 + time * 0.02));
      if (s === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.stroke();

    // Signal glow
    ctx.strokeStyle = 'rgba(255, 79, 201, 0.12)';
    ctx.lineWidth = 8;
    ctx.beginPath();
    for (var s2 = 0; s2 < sigW; s2++) {
      var sx2 = sigX + s2;
      var sy2 = sigY + Math.sin((s2 * 0.04) + soundPhase) * 10 *
                (1 + 0.3 * Math.sin(s2 * 0.15 + time * 0.02));
      if (s2 === 0) ctx.moveTo(sx2, sy2);
      else ctx.lineTo(sx2, sy2);
    }
    ctx.stroke();

    // ====== LABELS (spread out, no overlap) ======
    ctx.lineWidth = 1;

    // "1550 nm laser" — above fiber
    ctx.font = '11px Inter, sans-serif';
    ctx.fillStyle = LASER_RED;
    ctx.textAlign = 'center';
    ctx.fillText('1550 nm laser', (fiberLeft + fiberRight) / 2, centerY - cladH / 2 - 10);

    // "Fiber optic" — below fiber, left-aligned
    ctx.font = '10px Inter, sans-serif';
    ctx.fillStyle = TEXT_MED;
    ctx.textAlign = 'left';
    ctx.fillText('Fiber optic', fiberLeft + 8, centerY + cladH / 2 + 16);

    // "Mirror" — below left side, with tiny leader
    var mirrorLabelX = cavityLeft;
    var mirrorLabelY = centerY + mirrorH / 2 + 36;
    leaderLine(cavityLeft, centerY + mirrorH / 2 + 2, mirrorLabelX, mirrorLabelY - 4);
    ctx.fillStyle = TEXT_MED;
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Mirror', mirrorLabelX, mirrorLabelY);

    // "Membrane" — below right side, with leader
    var membraneLabelX = memX + 4;
    var membraneLabelY = centerY + mirrorH / 2 + 36;
    leaderLine(memX, centerY + mirrorH / 2 + 2, membraneLabelX, membraneLabelY - 4);
    ctx.fillStyle = TEXT_MED;
    ctx.textAlign = 'center';
    ctx.fillText('Membrane', membraneLabelX, membraneLabelY);

    // "Fabry-Perot cavity" — centered below Δd
    ctx.fillStyle = TEXT_DIM;
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Fabry-Perot cavity', (cavityLeft + memX) / 2, indicatorY + 14);

    // "interference pattern" — above fringes
    ctx.fillStyle = TEXT_DIM;
    ctx.font = '9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('interference pattern', (cavityLeft + memX) / 2, fringeY - 6);

    // "Sound pressure" — above wave source
    ctx.fillStyle = TEXT_MED;
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Sound', waveStartX, centerY - 42);
    ctx.fillText('pressure', waveStartX, centerY - 30);

    // "Output signal" — above signal trace
    ctx.fillStyle = TEXT_MED;
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Output signal', sigX, sigY - 16);

    animId = requestAnimationFrame(draw);
  }

  // Reduced motion check
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    resize();
    time = 60;
    activeStep = 0;
    draw();
    cancelAnimationFrame(animId);
    return;
  }

  resize();
  draw();
  window.addEventListener('resize', resize);
})();
