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
      var isOpen = navLinks.classList.contains('active');
      document.body.style.overflow = isOpen ? 'hidden' : '';
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Close mobile nav when a link is clicked
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navToggle.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.style.overflow = '';
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Dropdown toggle (mobile: tap to open; desktop: keyboard/click support)
    document.querySelectorAll('.nav__dropdown-toggle').forEach(function (toggle) {
      var dropdown = toggle.closest('.nav__dropdown');
      if (!dropdown) return;

      // Sync aria-expanded when hover/focus opens the menu on desktop
      dropdown.addEventListener('mouseenter', function () {
        if (window.innerWidth > 768) toggle.setAttribute('aria-expanded', 'true');
      });
      dropdown.addEventListener('mouseleave', function () {
        if (window.innerWidth > 768) toggle.setAttribute('aria-expanded', 'false');
      });
      dropdown.addEventListener('focusin', function () {
        if (window.innerWidth > 768) toggle.setAttribute('aria-expanded', 'true');
      });
      dropdown.addEventListener('focusout', function (e) {
        if (window.innerWidth > 768 && !dropdown.contains(e.relatedTarget)) {
          toggle.setAttribute('aria-expanded', 'false');
        }
      });

      toggle.addEventListener('click', function (e) {
        // Mobile: tap-to-toggle
        if (window.innerWidth <= 768) {
          e.preventDefault();
          e.stopPropagation();
          var wasOpen = dropdown.classList.contains('open');
          document.querySelectorAll('.nav__dropdown.open').forEach(function (d) {
            d.classList.remove('open');
            var t = d.querySelector('.nav__dropdown-toggle');
            if (t) t.setAttribute('aria-expanded', 'false');
          });
          if (!wasOpen) {
            dropdown.classList.add('open');
            toggle.setAttribute('aria-expanded', 'true');
          }
          return;
        }
        // Desktop: click also toggles (keyboard users)
        var isOpen = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
      });

      // Escape closes the dropdown and returns focus to the toggle
      dropdown.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          toggle.setAttribute('aria-expanded', 'false');
          dropdown.classList.remove('open');
          toggle.focus();
        }
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
    el.textContent = '0';

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

  // --- Reduced Motion Check ---
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Hero film (Homepage): pick the cut here rather than leave it to the browser. WebKit can
  // test a <source media> query against the wrong width while the page loads, and then plays the
  // desktop cut on a phone. Only a wrong pick is replaced, so the right one keeps loading. ---
  var heroFilm = document.querySelector('.hero--video-stage video');
  if (heroFilm) {
    var heroSources = heroFilm.querySelectorAll('source');
    for (var h = 0; h < heroSources.length; h++) {
      var heroMedia = heroSources[h].getAttribute('media');
      if (heroMedia && !window.matchMedia(heroMedia).matches) continue;
      if (heroSources[h].type && !heroFilm.canPlayType(heroSources[h].type)) continue;
      var heroPick = heroSources[h].getAttribute('src');
      if (heroFilm.currentSrc.slice(-heroPick.length) !== heroPick) heroFilm.src = heroPick;
      break;
    }
  }

  // --- Typing Ticker (Homepage) ---
  var tickerEl = document.getElementById('heroTicker');
  if (tickerEl && !prefersReducedMotion) {
    var tickerSlot = tickerEl.parentNode;
    var tickerWords = ['Transducer Characterization', 'Leak Detection', 'Ultrasonic Cleaning', 'Non-Destructive Testing', 'Partial Discharge', 'Research'];
    var tickerWidths = [];
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
          tickerSlot.style.width = tickerWidths[wordIndex] + 'px';
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
    // Reserve each phrase's width so the line holds still and the finished phrase lands centred
    document.fonts.ready.then(function () {
      tickerWidths = tickerWords.map(function (word) {
        tickerEl.textContent = word;
        return tickerEl.getBoundingClientRect().width;
      });
      tickerEl.textContent = tickerWords[0];
      tickerSlot.style.width = tickerWidths[0] + 'px';
      setTimeout(tickerType, pauseTime);
    });
  }

  // --- Contact Form Feedback ---
  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    var submitBtn = document.getElementById('contactSubmit');
    var statusEl = document.getElementById('formStatus');

    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      // Clear previous state
      statusEl.className = 'form__status';
      statusEl.textContent = '';
      contactForm.querySelectorAll('.form__input--invalid, .form__textarea--invalid').forEach(function (el) {
        el.classList.remove('form__input--invalid', 'form__textarea--invalid');
      });

      // Validate
      var name = contactForm.querySelector('#name');
      var email = contactForm.querySelector('#email');
      var message = contactForm.querySelector('#message');
      var valid = true;

      if (!name.value.trim()) {
        name.classList.add('form__input--invalid');
        valid = false;
      }
      if (!email.value.trim() || !email.validity.valid) {
        email.classList.add('form__input--invalid');
        valid = false;
      }
      if (!message.value.trim()) {
        message.classList.add('form__textarea--invalid');
        valid = false;
      }

      if (!valid) {
        statusEl.className = 'form__status form__status--error';
        statusEl.textContent = 'Please fill in all fields correctly.';
        return;
      }

      // Submit via fetch
      submitBtn.classList.add('btn--sending');
      submitBtn.textContent = 'Sending...';

      fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { 'Accept': 'application/json' }
      }).then(function (response) {
        if (response.ok) {
          statusEl.className = 'form__status form__status--success';
          statusEl.textContent = 'Message sent! We\'ll get back to you soon.';
          contactForm.reset();
        } else {
          throw new Error('Server error');
        }
      }).catch(function () {
        statusEl.className = 'form__status form__status--error';
        statusEl.textContent = 'Something went wrong. Please try again shortly or call the number listed on this page.';
      }).finally(function () {
        submitBtn.classList.remove('btn--sending');
        submitBtn.textContent = 'Send Message';
      });
    });
  }

  // ====== FAQ Accordion ======
  document.querySelectorAll('.faq__question').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.faq__item');
      var wasOpen = item.classList.contains('faq__item--open');
      // Close all siblings
      item.parentElement.querySelectorAll('.faq__item--open').forEach(function (el) {
        el.classList.remove('faq__item--open');
        el.querySelector('.faq__question').setAttribute('aria-expanded', 'false');
      });
      // Toggle clicked
      if (!wasOpen) {
        item.classList.add('faq__item--open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

});
