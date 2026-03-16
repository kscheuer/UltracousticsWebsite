/* ==========================================================================
   Ultracoustics Technologies Ltd. - Shared JavaScript
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {

  // --- Mobile Navigation Toggle ---
  const navToggle = document.querySelector('.nav__toggle');
  const navLinks = document.querySelector('.nav__links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      navToggle.classList.toggle('active');
      navLinks.classList.toggle('active');
      document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    });

    // Close mobile nav when a link is clicked
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navToggle.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // --- Animated Counters ---
  const counters = document.querySelectorAll('[data-counter]');

  if (counters.length > 0) {
    const counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    counters.forEach(function (counter) {
      counterObserver.observe(counter);
    });
  }

  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-counter'), 10);
    var duration = 1600;
    var start = 0;
    var startTime = null;

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var easedProgress = easeOutCubic(progress);
      var current = Math.floor(easedProgress * target);
      el.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target;
      }
    }

    requestAnimationFrame(step);
  }

  // --- Scroll Fade-In ---
  var fadeEls = document.querySelectorAll('.fade-in');

  if (fadeEls.length > 0) {
    var fadeObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          fadeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    fadeEls.forEach(function (el) {
      fadeObserver.observe(el);
    });
  }

  // --- Active nav link highlighting ---
  var currentPage = window.location.pathname.split('/').pop() || 'index.html';
  var navLinkEls = document.querySelectorAll('.nav__link, .nav__dropdown-item');

  navLinkEls.forEach(function (link) {
    var href = link.getAttribute('href');
    if (href && href === currentPage) {
      link.classList.add('nav__link--active');
      // Highlight parent dropdown trigger if this is a dropdown item
      var dropdown = link.closest('.nav__dropdown');
      if (dropdown) {
        var trigger = dropdown.querySelector('.nav__link');
        if (trigger) trigger.classList.add('nav__link--active');
      }
    }
  });

  // --- Scroll Progress Indicator ---
  var scrollProgress = document.getElementById('scrollProgress');
  var backToTop = document.getElementById('backToTop');

  if (scrollProgress || backToTop) {
    window.addEventListener('scroll', function () {
      var scrollTop = window.scrollY;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

      if (scrollProgress) {
        scrollProgress.style.width = scrollPercent + '%';
      }

      if (backToTop) {
        if (scrollTop > 400) {
          backToTop.classList.add('visible');
        } else {
          backToTop.classList.remove('visible');
        }
      }
    }, { passive: true });
  }

  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // --- Sticky CTA Bar (BROADSONIC page) ---
  var stickyCta = document.getElementById('stickyCta');
  if (stickyCta) {
    window.addEventListener('scroll', function () {
      var scrollTop = window.scrollY;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      // Show after 30% scroll, hide in last 10% (near footer)
      if (scrollPercent > 30 && scrollPercent < 90) {
        stickyCta.classList.add('visible');
      } else {
        stickyCta.classList.remove('visible');
      }
    }, { passive: true });
  }

  // --- Typing Ticker (Homepage) ---
  var tickerEl = document.getElementById('heroTicker');
  if (tickerEl) {
    var tickerWords = ['Leak Detection', 'Partial Discharge', 'Ultrasonic Cleaning', 'NDT', 'Research', 'Transducer Characterization'];
    var wordIndex = 0;
    var charIndex = tickerWords[0].length;
    var isDeleting = true;
    var typeSpeed = 60;
    var pauseTime = 2000;

    function tickerType() {
      var currentWord = tickerWords[wordIndex];
      if (isDeleting) {
        charIndex--;
        tickerEl.textContent = currentWord.substring(0, charIndex);
        if (charIndex === 0) {
          isDeleting = false;
          wordIndex = (wordIndex + 1) % tickerWords.length;
          setTimeout(tickerType, 300);
          return;
        }
        setTimeout(tickerType, 40);
      } else {
        charIndex++;
        tickerEl.textContent = tickerWords[wordIndex].substring(0, charIndex);
        if (charIndex === tickerWords[wordIndex].length) {
          isDeleting = true;
          setTimeout(tickerType, pauseTime);
          return;
        }
        setTimeout(tickerType, typeSpeed);
      }
    }
    setTimeout(tickerType, pauseTime);
  }

  // --- Frequency Spectrum Visualizer (BROADSONIC page) ---
  var specCanvas = document.getElementById('spectrumCanvas');
  if (specCanvas) {
    var ctx = specCanvas.getContext('2d');
    var dpr = window.devicePixelRatio || 1;
    var animTime = 0;
    var spectrumRunning = false;

    function resizeCanvas() {
      var rect = specCanvas.parentElement.getBoundingClientRect();
      specCanvas.width = rect.width * dpr;
      specCanvas.height = (window.innerWidth < 768 ? 240 : 340) * dpr;
      ctx.scale(dpr, dpr);
    }

    function drawSpectrum(time) {
      animTime = time * 0.001;
      var w = specCanvas.width / dpr;
      var h = specCanvas.height / dpr;
      ctx.clearRect(0, 0, w, h);

      var padL = 60;
      var padR = 50;
      var padT = 30;
      var padB = 35;
      var plotW = w - padL - padR;
      var plotH = h - padT - padB;

      // Linear frequency range: 0 to 5 MHz
      var fMax = 5000000; // 5 MHz

      // Helper: freq to x position (linear)
      function fToX(freq) {
        return padL + (freq / fMax) * plotW;
      }

      // Draw grid lines at MHz intervals
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1;
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'center';
      var mhzTicks = [0, 500000, 1000000, 1500000, 2000000, 2500000, 3000000, 3500000, 4000000, 4500000, 5000000];
      var mhzLabels = ['0', '0.5', '1.0', '1.5', '2.0', '2.5', '3.0', '3.5', '4.0', '4.5', '5 MHz'];
      for (var f = 0; f < mhzTicks.length; f++) {
        var xPos = fToX(mhzTicks[f]);
        ctx.beginPath();
        ctx.moveTo(xPos, padT);
        ctx.lineTo(xPos, padT + plotH);
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        // Right-align the last label so it doesn't clip
        if (f === mhzTicks.length - 1) {
          ctx.textAlign = 'right';
        }
        ctx.fillText(mhzLabels[f], xPos, padT + plotH + 20);
        ctx.textAlign = 'center';
      }

      // Y-axis label
      ctx.save();
      ctx.translate(16, padT + plotH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '11px Inter, sans-serif';
      ctx.fillText('Signal', 0, 0);
      ctx.restore();

      // Draw coverage regions (linear — shows true bandwidth proportions)
      // Human hearing: 0 - 20 kHz (0.4% of axis — tiny sliver)
      var xHear = fToX(20000);
      ctx.fillStyle = 'rgba(74, 222, 128, 0.15)';
      ctx.fillRect(padL, padT, xHear - padL, plotH);

      // Conventional mic: 0 - 100 kHz (2% of axis — small sliver)
      var xConv = fToX(100000);
      ctx.fillStyle = 'rgba(245, 158, 11, 0.12)';
      ctx.fillRect(padL, padT, xConv - padL, plotH);

      // BROADSONIC: full 0 - 5 MHz range (100% of axis)
      ctx.fillStyle = 'rgba(255, 79, 201, 0.04)';
      ctx.fillRect(padL, padT, plotW, plotH);

      // Draw the animated BROADSONIC spectrum line (full range)
      var numPoints = 400;
      ctx.beginPath();
      for (var i = 0; i <= numPoints; i++) {
        var t = i / numPoints;
        var freq = t * fMax;
        var x = padL + t * plotW;

        // Sensitivity curve: ramps up through low freq, strong mid-high, peaks around 1-3 MHz
        var fMHz = freq / 1000000;
        var baseLevel = 0.25;

        // Low-frequency roll-up (0 - 0.2 MHz)
        if (fMHz < 0.2) {
          baseLevel = 0.15 + 0.1 * (fMHz / 0.2);
        } else {
          // Main sensitivity region with resonance character
          baseLevel = 0.5 + 0.15 * Math.sin(fMHz * 1.8);
          // Broad peak around 1-2 MHz
          baseLevel += 0.18 * Math.exp(-Math.pow((fMHz - 1.5) * 0.8, 2));
          // Secondary peak around 3.5 MHz
          baseLevel += 0.12 * Math.exp(-Math.pow((fMHz - 3.5) * 1.2, 2));
        }

        // Animated noise
        var noise = 0.03 * Math.sin(animTime * 2.5 + i * 0.25) +
                    0.02 * Math.sin(animTime * 4.1 + i * 0.6) +
                    0.015 * Math.sin(animTime * 7 + i * 1.3);

        var y = padT + plotH - (baseLevel + noise) * plotH;
        y = Math.max(padT + 4, Math.min(padT + plotH - 4, y));

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      // Gradient stroke — magenta/purple across the full range
      var grad = ctx.createLinearGradient(padL, 0, padL + plotW, 0);
      grad.addColorStop(0, '#FF4FC9');
      grad.addColorStop(0.5, '#c840e9');
      grad.addColorStop(1, '#a855f7');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Glow effect
      ctx.lineWidth = 6;
      ctx.globalAlpha = 0.15;
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Boundary markers with labels
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;

      // Human hearing boundary at 20 kHz
      ctx.strokeStyle = 'rgba(74, 222, 128, 0.6)';
      ctx.beginPath();
      ctx.moveTo(xHear, padT);
      ctx.lineTo(xHear, padT + plotH);
      ctx.stroke();

      // Conventional mic boundary at 100 kHz
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
      ctx.beginPath();
      ctx.moveTo(xConv, padT);
      ctx.lineTo(xConv, padT + plotH);
      ctx.stroke();
      ctx.setLineDash([]);

      // Boundary labels — stacked vertically to avoid overlap
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(74, 222, 128, 0.85)';
      ctx.fillText('20 kHz', xHear + 4, padT + 14);
      ctx.fillStyle = 'rgba(245, 158, 11, 0.85)';
      ctx.fillText('100 kHz', xConv + 4, padT + 28);

      if (spectrumRunning) {
        requestAnimationFrame(drawSpectrum);
      }
    }

    // Start animation when visible
    var specObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !spectrumRunning) {
          spectrumRunning = true;
          resizeCanvas();
          requestAnimationFrame(drawSpectrum);
        } else if (!entry.isIntersecting) {
          spectrumRunning = false;
        }
      });
    }, { threshold: 0.1 });

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    specObserver.observe(specCanvas);
  }

});
