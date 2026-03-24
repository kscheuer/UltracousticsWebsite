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

  // Step highlighting — slower cycle
  var steps = document.querySelectorAll('.fpi-step');
  var activeStep = 0;
  var stepTimer = 0;
  var STEP_DURATION = 300; // ~5 seconds per step at 60fps

  function resize() {
    var rect = canvas.parentElement.getBoundingClientRect();
    W = rect.width;
    H = Math.min(rect.width * 0.9, 480);
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
      activeStep = (activeStep + 1) % 5;
    }
    steps.forEach(function (s, i) {
      s.classList.toggle('fpi-step--active', i === activeStep);
    });
  }

  // Compute per-step opacity: active region = 1.0, inactive = dimmed
  function stepOpacity(stepIndex) {
    if (activeStep === stepIndex) return 1.0;
    return 0.35;
  }

  // Draw a highlight glow box around a region
  function highlightRegion(x, y, w, h) {
    // Pulsing glow intensity
    var pulse = 0.35 + 0.15 * Math.sin(time * 0.06);
    ctx.save();
    ctx.shadowColor = ACCENT;
    ctx.shadowBlur = 18;
    ctx.strokeStyle = 'rgba(255, 79, 201, ' + pulse + ')';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 6);
    ctx.stroke();
    ctx.restore();
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

    // Per-step opacities
    var oFiber = stepOpacity(0);    // Step 1: Laser enters fiber
    var oCavity = stepOpacity(1);   // Step 2: Light reflects in cavity
    var oSound = stepOpacity(2);    // Step 3: Sound deflects membrane
    var oSignal = stepOpacity(3);   // Step 4: Interference shift → signal
    var oFFT = stepOpacity(4);       // Step 5: Signal split into frequencies

    // === STEP 1: FIBER OPTIC ===
    ctx.globalAlpha = oFiber;

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

    // Step 1 highlight box
    if (activeStep === 0) {
      ctx.globalAlpha = 1;
      highlightRegion(fiberLeft - 6, centerY - cladH / 2 - 24, fiberRight - fiberLeft + 14, cladH + 40);
    }

    // "1550 nm laser" label
    ctx.globalAlpha = oFiber;
    ctx.font = '11px Inter, sans-serif';
    ctx.fillStyle = LASER_RED;
    ctx.textAlign = 'center';
    ctx.fillText('1550 nm laser', (fiberLeft + fiberRight) / 2, centerY - cladH / 2 - 10);

    // "Fiber optic" label
    ctx.font = '10px Inter, sans-serif';
    ctx.fillStyle = TEXT_MED;
    ctx.textAlign = 'left';
    ctx.fillText('Fiber optic', fiberLeft + 8, centerY + cladH / 2 + 16);

    // === STEP 2: CAVITY ===
    ctx.globalAlpha = oCavity;

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

    // Front membrane (convex curve) — also used in step 3
    ctx.globalAlpha = Math.max(oCavity, oSound);
    ctx.fillStyle = MEMBRANE_COL;
    ctx.beginPath();
    ctx.moveTo(memX - 2, centerY - mirrorH / 2);
    ctx.quadraticCurveTo(memX + 12, centerY, memX - 2, centerY + mirrorH / 2);
    ctx.lineTo(memX + 1, centerY + mirrorH / 2);
    ctx.quadraticCurveTo(memX + 14, centerY, memX + 1, centerY - mirrorH / 2);
    ctx.closePath();
    ctx.fill();

    ctx.globalAlpha = oCavity;

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
      ctx.fillStyle = 'rgba(255, 51, 51, ' + (fIntensity * 0.15) + ')';
      ctx.fillRect(fx - 3, fringeY - 1, 6, 10);
      ctx.fillStyle = 'rgba(255, 51, 51, ' + fIntensity + ')';
      ctx.fillRect(fx - 1, fringeY, 2, 8);
    }

    // Step 2 highlight box
    if (activeStep === 1) {
      ctx.globalAlpha = 1;
      highlightRegion(cavityLeft - 8, centerY - mirrorH / 2 - 24, cavityW + 20, mirrorH + 40);
    }

    // "Mirror" label
    ctx.globalAlpha = oCavity;
    var mirrorLabelX = cavityLeft;
    var mirrorLabelY = centerY + mirrorH / 2 + 36;
    leaderLine(cavityLeft, centerY + mirrorH / 2 + 2, mirrorLabelX, mirrorLabelY - 4);
    ctx.fillStyle = TEXT_MED;
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Mirror', mirrorLabelX, mirrorLabelY);

    // "Membrane" label
    var membraneLabelX = memX + 4;
    var membraneLabelY = centerY + mirrorH / 2 + 36;
    leaderLine(memX, centerY + mirrorH / 2 + 2, membraneLabelX, membraneLabelY - 4);
    ctx.fillStyle = TEXT_MED;
    ctx.textAlign = 'center';
    ctx.fillText('Membrane', membraneLabelX, membraneLabelY);

    // "Fabry-Perot cavity" label
    var indicatorY = centerY + mirrorH / 2 + 14;
    ctx.fillStyle = TEXT_DIM;
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Fabry-Perot cavity', (cavityLeft + memX) / 2, indicatorY + 14);

    // "interference pattern" label
    ctx.fillStyle = TEXT_DIM;
    ctx.font = '9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('interference pattern', (cavityLeft + memX) / 2, fringeY - 6);

    // === STEP 3: SOUND WAVES ===
    ctx.globalAlpha = oSound;

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

    // Δd indicator
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

    // Step 3 highlight box
    if (activeStep === 2) {
      ctx.globalAlpha = 1;
      highlightRegion(memX - 10, centerY - mirrorH / 2 - 10, waveStartX - memX + 32, mirrorH + 20);
    }

    // "Sound pressure" label
    ctx.globalAlpha = oSound;
    ctx.fillStyle = TEXT_MED;
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Sound', waveStartX, centerY - 42);
    ctx.fillText('pressure', waveStartX, centerY - 30);

    // === STEP 4: OUTPUT SIGNAL ===
    ctx.globalAlpha = oSignal;

    var sigX = fiberLeft + 16;
    var sigY = H * 0.84;
    var sigW = W * 0.36;

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

    // Step 4 highlight box
    if (activeStep === 3) {
      ctx.globalAlpha = 1;
      highlightRegion(sigX - 10, sigY - 28, sigW + 20, 46);
    }

    // "Output signal" label
    ctx.globalAlpha = oSignal;
    ctx.fillStyle = TEXT_MED;
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Output signal', sigX, sigY - 16);

    // === STEP 5: FFT — SIGNAL SPLIT INTO FREQUENCIES ===
    ctx.globalAlpha = oFFT;

    var fftX = W * 0.54;
    var fftBaseY = H * 0.88;
    var fftW = W * 0.40;
    var fftH = 70;
    var barCount = 20;
    var barGap = 3;
    var barWidth = (fftW - barGap * (barCount - 1)) / barCount;

    // Background panel for visibility
    ctx.fillStyle = 'rgba(255, 79, 201, 0.04)';
    ctx.beginPath();
    ctx.roundRect(fftX - 6, fftBaseY - fftH - 14, fftW + 12, fftH + 30, 6);
    ctx.fill();

    // Axis line
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(fftX, fftBaseY);
    ctx.lineTo(fftX + fftW, fftBaseY);
    ctx.stroke();
    // Vertical axis
    ctx.beginPath();
    ctx.moveTo(fftX, fftBaseY);
    ctx.lineTo(fftX, fftBaseY - fftH);
    ctx.stroke();

    // Frequency bars with animated peaks
    var peakFreqs = [3, 7, 12, 17]; // indices of dominant peaks
    for (var fb = 0; fb < barCount; fb++) {
      var bx = fftX + fb * (barWidth + barGap);
      var isPeak = peakFreqs.indexOf(fb) !== -1;
      var baseBarH = isPeak ? (0.55 + 0.4 * Math.sin(time * 0.04 + fb)) : (0.12 + 0.15 * Math.sin(time * 0.03 + fb * 0.7));
      var bh = baseBarH * fftH;

      // Bar fill
      var barGrad = ctx.createLinearGradient(bx, fftBaseY - bh, bx, fftBaseY);
      if (isPeak) {
        barGrad.addColorStop(0, '#ff6fd8');
        barGrad.addColorStop(1, 'rgba(255, 79, 201, 0.4)');
      } else {
        barGrad.addColorStop(0, 'rgba(255, 79, 201, 0.65)');
        barGrad.addColorStop(1, 'rgba(255, 79, 201, 0.15)');
      }
      ctx.fillStyle = barGrad;
      ctx.fillRect(bx, fftBaseY - bh, barWidth, bh);

      // Bright cap on peaks
      if (isPeak) {
        ctx.save();
        ctx.shadowColor = ACCENT;
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#ff8fe0';
        ctx.fillRect(bx, fftBaseY - bh, barWidth, 3);
        ctx.restore();
      }
    }

    // Arrow from time signal to FFT
    var arrowFromX = sigX + sigW + 6;
    var arrowToX = fftX - 10;
    ctx.strokeStyle = 'rgba(255, 79, 201, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(arrowFromX, sigY);
    ctx.lineTo(arrowToX, fftBaseY - fftH * 0.5);
    ctx.stroke();
    ctx.setLineDash([]);
    // Arrowhead
    ctx.fillStyle = 'rgba(255, 79, 201, 0.6)';
    ctx.beginPath();
    ctx.moveTo(arrowToX, fftBaseY - fftH * 0.5);
    ctx.lineTo(arrowToX - 7, fftBaseY - fftH * 0.5 - 5);
    ctx.lineTo(arrowToX - 7, fftBaseY - fftH * 0.5 + 5);
    ctx.fill();

    // "FFT" label on arrow
    ctx.fillStyle = ACCENT;
    ctx.font = '600 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('FFT', (arrowFromX + arrowToX) / 2, sigY - 10);

    // "Frequency spectrum" label
    ctx.fillStyle = TEXT_BRIGHT;
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Frequency spectrum', fftX, fftBaseY - fftH - 2);

    // Axis labels
    ctx.fillStyle = TEXT_MED;
    ctx.font = '9px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('0 Hz', fftX, fftBaseY + 14);
    ctx.textAlign = 'right';
    ctx.fillText('5 MHz', fftX + fftW, fftBaseY + 14);

    // Step 5 highlight box
    if (activeStep === 4) {
      ctx.globalAlpha = 1;
      highlightRegion(fftX - 12, fftBaseY - fftH - 18, fftW + 24, fftH + 46);
    }

    // Reset alpha
    ctx.globalAlpha = 1;

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
