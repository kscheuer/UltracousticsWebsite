/* ==========================================================================
   ZGV Thickness Map – Interactive Canvas Heatmap
   Renders a 2D thickness deviation map with hover tooltip & colorbar.
   ========================================================================== */
(function () {
  'use strict';

  var container = document.getElementById('thicknessMap');
  if (!container) return;

  var DATA_URL = 'assets/demos/data/thickness_map.json';

  // --- Brand diverging colormap: Cyan → Dark → Magenta ---
  // Matches website accent (#FF4FC9) with complementary cyan
  var CMAP = [
    [0,212,255],[0,190,235],[0,168,215],[0,146,195],[0,124,175],
    [5,102,150],[10,80,125],[15,60,100],[18,44,78],[20,32,58],
    [18,22,40],[16,16,30],[15,15,25],[16,14,24],[18,14,28],
    [24,14,32],[32,14,40],[48,14,50],[68,16,62],[92,20,78],
    [120,26,96],[150,32,116],[180,38,140],[210,44,166],[230,46,182],
    [240,48,192],[248,50,200],[255,60,205],[255,75,210],[255,79,201]
  ];

  function cmapColor(t) {
    t = Math.max(0, Math.min(1, t));
    var idx = t * (CMAP.length - 1);
    var lo = Math.floor(idx);
    var hi = Math.min(lo + 1, CMAP.length - 1);
    var f = idx - lo;
    var a = CMAP[lo], b = CMAP[hi];
    return [
      Math.round(a[0] + (b[0] - a[0]) * f),
      Math.round(a[1] + (b[1] - a[1]) * f),
      Math.round(a[2] + (b[2] - a[2]) * f)
    ];
  }

  // --- Build DOM ---
  container.innerHTML =
    '<div class="tm-canvas-area">' +
      '<canvas id="tmCanvas"></canvas>' +
      '<div class="tm-tooltip" id="tmTooltip"></div>' +
    '</div>' +
    '<div class="tm-bar">' +
      '<div class="tm-colorbar-wrap">' +
        '<span id="tmCbMin" class="tm-cb-label"></span>' +
        '<canvas id="tmColorbar" width="256" height="12"></canvas>' +
        '<span id="tmCbMax" class="tm-cb-label"></span>' +
      '</div>' +
      '<div class="tm-stats" id="tmStats"></div>' +
    '</div>' +
    '<div class="tm-sample-row">' +
      '<img src="assets/images/Promotional/GlassSlide.png" alt="Glass slide sample" class="tm-sample-img">' +
      '<span class="tm-sample-text">Standard microscope slide &mdash; hover over the map to inspect local thickness.</span>' +
    '</div>';

  var canvas = document.getElementById('tmCanvas');
  var ctx = canvas.getContext('2d');
  var tooltip = document.getElementById('tmTooltip');
  var statsEl = document.getElementById('tmStats');

  // --- Load data ---
  fetch(DATA_URL)
    .then(function (r) { return r.json(); })
    .then(function (data) { render(data); })
    .catch(function (err) {
      container.innerHTML = '<p style="color:#ff6b6b;">Failed to load thickness map data.</p>';
      console.error(err);
    });

  function render(data) {
    var rows = data.rows;
    var cols = data.cols;
    var dev = data.deviation; // flat row-major array
    var meanTh = data.mean_thickness_um;
    var scanW = data.scan_width_mm;
    var scanH = data.scan_height_mm;

    // Compute stats
    var vmin = Infinity, vmax = -Infinity, sum = 0, count = dev.length;
    var sumSq = 0;
    for (var i = 0; i < count; i++) {
      var v = dev[i];
      if (v < vmin) vmin = v;
      if (v > vmax) vmax = v;
      sum += v;
      sumSq += v * v;
    }
    var meanDev = sum / count;
    var rq = Math.sqrt(sumSq / count - meanDev * meanDev);

    // Symmetric color range
    var absMax = Math.max(Math.abs(vmin), Math.abs(vmax));
    var cMin = -absMax;
    var cMax = absMax;

    // Stats display
    statsEl.innerHTML =
      '<div class="tm-stat"><span class="tm-stat-label">Mean Thickness</span><span class="tm-stat-value">' + meanTh.toFixed(2) + ' &mu;m</span></div>' +
      '<div class="tm-stat"><span class="tm-stat-label">Total Wedge</span><span class="tm-stat-value">' + (vmax - vmin).toFixed(1) + ' &mu;m</span></div>' +
      '<div class="tm-stat"><span class="tm-stat-label">Roughness (Rq)</span><span class="tm-stat-value">' + rq.toFixed(2) + ' &mu;m</span></div>' +
      '<div class="tm-stat"><span class="tm-stat-label">Scan Area</span><span class="tm-stat-value">' + scanW + ' &times; ' + scanH + ' mm</span></div>' +
      '<div class="tm-stat"><span class="tm-stat-label">Resolution</span><span class="tm-stat-value">' + cols + ' &times; ' + rows + ' px</span></div>';

    // Colorbar labels
    document.getElementById('tmCbMax').textContent = '+' + absMax.toFixed(1) + ' µm';
    document.getElementById('tmCbMin').textContent = '\u2212' + absMax.toFixed(1) + ' µm';

    // Draw horizontal colorbar
    var cbCanvas = document.getElementById('tmColorbar');
    var cbCtx = cbCanvas.getContext('2d');
    for (var x = 0; x < 256; x++) {
      var t = x / 255;
      var rgb = cmapColor(t);
      cbCtx.fillStyle = 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')';
      cbCtx.fillRect(x, 0, 1, 12);
    }

    // Square canvas — physical dimensions are 20×20 mm
    var dpr = window.devicePixelRatio || 1;
    var maxSize = Math.min(container.offsetWidth - 48, 520);
    var canvasW = maxSize;
    var canvasH = maxSize;

    canvas.style.width = canvasW + 'px';
    canvas.style.height = canvasH + 'px';
    canvas.width = canvasW * dpr;
    canvas.height = canvasH * dpr;
    ctx.scale(dpr, dpr);

    // Pre-render heatmap as ImageData
    var imgCanvas = document.createElement('canvas');
    imgCanvas.width = cols;
    imgCanvas.height = rows;
    var imgCtx = imgCanvas.getContext('2d');
    var imgData = imgCtx.createImageData(cols, rows);
    var pixels = imgData.data;

    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var t = (dev[r * cols + c] - cMin) / (cMax - cMin);
        var rgb = cmapColor(t);
        var idx = (r * cols + c) * 4;
        pixels[idx] = rgb[0];
        pixels[idx + 1] = rgb[1];
        pixels[idx + 2] = rgb[2];
        pixels[idx + 3] = 255;
      }
    }
    imgCtx.putImageData(imgData, 0, 0);

    // Draw scaled heatmap
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(imgCanvas, 0, 0, canvasW, canvasH);

    // Draw axis labels
    drawAxes(canvasW, canvasH, scanW, scanH);

    // --- Scan-line entrance animation ---
    var scanAnimated = false;
    var scanObs = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting && !scanAnimated) {
        scanAnimated = true;
        scanObs.disconnect();
        var scanX = 0;
        var lineW = 4;
        var speed = canvasW / 60; // sweep in ~1 second at 60fps
        function scanStep() {
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(imgCanvas, 0, 0, canvasW, canvasH);
          // bright scan line
          var grad = ctx.createLinearGradient(scanX - lineW * 3, 0, scanX + lineW * 3, 0);
          grad.addColorStop(0, 'rgba(255,255,255,0)');
          grad.addColorStop(0.4, 'rgba(255,79,201,0.7)');
          grad.addColorStop(0.5, 'rgba(255,255,255,0.9)');
          grad.addColorStop(0.6, 'rgba(255,79,201,0.7)');
          grad.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = grad;
          ctx.fillRect(scanX - lineW * 3, 0, lineW * 6, canvasH);
          drawAxes(canvasW, canvasH, scanW, scanH);
          scanX += speed;
          if (scanX < canvasW + lineW * 3) {
            requestAnimationFrame(scanStep);
          } else {
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(imgCanvas, 0, 0, canvasW, canvasH);
            drawAxes(canvasW, canvasH, scanW, scanH);
          }
        }
        requestAnimationFrame(scanStep);
      }
    }, { threshold: 0.3 });
    scanObs.observe(canvas);

    // --- Hover interaction ---
    canvas.addEventListener('mousemove', function (e) {
      var rect = canvas.getBoundingClientRect();
      var mx = e.clientX - rect.left;
      var my = e.clientY - rect.top;

      var col = Math.floor((mx / canvasW) * cols);
      var row = Math.floor((my / canvasH) * rows);

      if (col < 0 || col >= cols || row < 0 || row >= rows) {
        tooltip.style.display = 'none';
        return;
      }

      var d = dev[row * cols + col];
      var thickness = meanTh + d;
      var xMm = (col / cols * scanW).toFixed(1);
      var yMm = (row / rows * scanH).toFixed(1);

      tooltip.innerHTML =
        '<strong>' + thickness.toFixed(2) + ' &mu;m</strong><br>' +
        '<span style="color:#b0b0b0;">(' + xMm + ', ' + yMm + ') mm</span><br>' +
        '<span style="color:#b0b0b0;">&Delta; ' + (d >= 0 ? '+' : '') + d.toFixed(2) + ' &mu;m</span>';

      // Position tooltip near cursor
      var tx = mx + 16;
      var ty = my - 50;
      if (tx + 150 > canvasW) tx = mx - 160;
      if (ty < 0) ty = my + 16;
      tooltip.style.left = tx + 'px';
      tooltip.style.top = ty + 'px';
      tooltip.style.display = 'block';
    });

    canvas.addEventListener('mouseleave', function () {
      tooltip.style.display = 'none';
    });

    // Handle resize
    window.addEventListener('resize', function () {
      var newSize = Math.min(container.offsetWidth - 48, 520);
      var newW = newSize;
      var newH = newSize;
      canvas.style.width = newW + 'px';
      canvas.style.height = newH + 'px';
      canvas.width = newW * dpr;
      canvas.height = newH * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(imgCanvas, 0, 0, newW, newH);
      drawAxes(newW, newH, scanW, scanH);
      canvasW = newW;
      canvasH = newH;
    });
  }

  function drawAxes(w, h, scanW, scanH) {
    // Minimal scale indicator in bottom-right corner
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(scanW + ' × ' + scanH + ' mm', w - 4, h - 4);
  }
})();
