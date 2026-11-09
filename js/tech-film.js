/* Technology film (product page): plays when in view, and shows each step's caption over the
   film between the times given for the cut being played (data-desktop / data-mobile).
   Each cut opens on one cycle of a loop of the whole system and goes into the box to the
   laser, where the film begins; the film then pulls back out to the loop, which repeats. Replay
   finishes the current cycle and goes back into the box. The headline shows over the loop. */
(function () {
  var video = document.getElementById('techFilm');
  if (!video) return;

  var section = video.closest('.tech-film');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Same breakpoint as the <source media> attributes and the CSS: phones get the 4:5 cut
  var phone = window.matchMedia('(max-width: 768px)');
  var idle = document.getElementById('techFilmIdle');
  var back = document.getElementById('techFilmReturn');
  var clips = [video, idle, back];
  var cut;
  var captions = Array.prototype.slice.call(section.querySelectorAll('.tech-cap')).map(function (el) {
    return { el: el };
  });

  function useCut() {
    cut = phone.matches ? 'mobile' : 'desktop';
    captions.forEach(function (caption) {
      var times = caption.el.getAttribute('data-' + cut).split(' ').map(parseFloat);
      caption.start = times[0];
      caption.end = times[1];
    });
    // Reduced motion: the still shows the finished result with its caption
    video.poster = 'assets/images/tech-film-' + cut + (reduced ? '-0711' : '-0001') + '.webp';
    idle.poster = 'assets/images/tech-film-' + cut + '-0846.webp';
  }
  useCut();
  var control = section.querySelector('.tech-film__control');
  var controlLabel = control.querySelector('.tech-film__control-label');
  var replay = section.querySelector('.tech-film__replay');
  var headline = section.querySelector('.tech-film__headline');
  var infoToggle = section.querySelector('.tech-film__info-toggle');
  var info = document.getElementById('techInfo');

  // Both cuts have the loop and the return; with reduced motion the film ends still
  function hasEnding() {
    return !reduced;
  }

  // The quiet row under the film: one button per caption, which jumps the film to that step
  var stepList = section.querySelector('.tech-film__steps');
  var steps = captions.map(function (caption) {
    var item = document.createElement('li');
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'tech-film__step';
    button.setAttribute('aria-controls', 'techFilm');
    button.textContent = caption.el.dataset.title;
    item.appendChild(button);
    stepList.appendChild(item);
    return button;
  });

  clips.forEach(function (clip) { clip.muted = true; });

  var userPaused = reduced;
  var started = false;
  var frame = 0;
  var shown = video;     // the clip on screen: the film, the loop or the return
  var pending = null;    // a clip already started that takes over once it has a frame
  var returning = false; // go into the box when this loop cycle ends (at the start, or after Replay)
  var swap = 0;          // cancels a swap still waiting for its first frame

  function current() {
    return pending || shown;
  }

  function update() {
    var time = started ? video.currentTime : reduced ? captions[captions.length - 1].start : -1;
    var current = -1;
    captions.forEach(function (caption, i) {
      caption.el.classList.toggle('is-shown', time >= caption.start && time < caption.end);
      if (time >= caption.start) current = i;
    });
    steps.forEach(function (step, i) {
      step.classList.toggle('is-active', i === current);
      if (i === current) step.setAttribute('aria-current', 'step');
      else step.removeAttribute('aria-current');
    });
    headline.classList.toggle('is-shown', hasEnding() && shown === idle);
  }

  function tick() {
    update();
    frame = video.paused ? 0 : requestAnimationFrame(tick);
  }

  function setControl() {
    var clip = current();
    var state;
    // A clip that has just ended hands over to the next by itself, except a film with no ending
    if (clip.ended) state = clip === video && !hasEnding() ? 'replay' : 'pause';
    else state = clip.paused ? 'play' : 'pause';
    control.dataset.state = state;
    controlLabel.textContent = state === 'replay' ? 'Replay' : state === 'play' ? 'Play' : 'Pause';
    replay.hidden = !(clip === idle && !returning);
  }

  function play(clip) {
    var attempt = (clip || current()).play();
    if (attempt && attempt.catch) attempt.catch(setControl);
  }

  // Resolves once the clip has put a frame on screen, so a swap never shows a blank frame
  function firstFrame(clip) {
    return new Promise(function (resolve) {
      if (clip.requestVideoFrameCallback) {
        clip.requestVideoFrameCallback(function () { resolve(); });
      } else {
        clip.addEventListener('playing', function () {
          requestAnimationFrame(function () { requestAnimationFrame(resolve); });
        }, { once: true });
      }
    });
  }

  // Starts a clip from its first frame and shows it once it has one; the outgoing clip
  // holds its last frame underneath until then
  function swapTo(clip) {
    var mine = ++swap;
    pending = clip;
    clips.forEach(function (other) { if (other !== clip) other.pause(); });
    clip.currentTime = 0;
    var presented = firstFrame(clip);
    play(clip);
    presented.then(function () {
      if (mine !== swap) return;
      pending = null;
      shown = clip;
      idle.classList.toggle('is-visible', clip === idle);
      back.classList.toggle('is-visible', clip === back);
      setControl();
      update();
    });
  }

  // Back to the film itself, dropping the loop, the return and any Replay waiting on them
  function showFilm() {
    swap++;
    pending = null;
    returning = false;
    idle.loop = true;
    idle.pause();
    back.pause();
    idle.classList.remove('is-visible');
    back.classList.remove('is-visible');
    shown = video;
  }

  // Start: the whole-system shot is on screen and goes into the box after one second, by
  // playing only the last second of the loop (the poster is the frame just before it)
  function opening() {
    showFilm();
    shown = idle;
    returning = true;
    idle.loop = false;
    idle.currentTime = 2;
    idle.classList.add('is-visible');
  }

  video.addEventListener('play', function () {
    started = true;
    setControl();
    if (!frame) frame = requestAnimationFrame(tick);
  });
  clips.forEach(function (clip) {
    ['pause', 'ended'].forEach(function (name) {
      clip.addEventListener(name, function () { setControl(); update(); });
    });
    if (clip !== video) clip.addEventListener('play', setControl);
  });
  video.addEventListener('seeked', update);

  video.addEventListener('ended', function () {
    if (shown === video && hasEnding()) swapTo(idle);
  });
  // The loop only ends once Replay has switched looping off, at the end of a cycle
  idle.addEventListener('ended', function () {
    if (shown !== idle || !returning) return;
    returning = false;
    idle.loop = true;
    swapTo(back);
  });
  // The return's last frame is the film's first, so the film carries straight on
  back.addEventListener('ended', function () {
    if (shown === back) swapTo(video);
  });

  control.addEventListener('click', function () {
    var clip = current();
    if (video.ended && clip === video && !hasEnding()) {
      video.currentTime = 0;
      userPaused = false;
      play();
    } else if (clip.paused) {
      userPaused = false;
      play();
    } else {
      userPaused = true;
      clip.pause();
    }
  });

  replay.addEventListener('click', function () {
    if (shown !== idle || returning) return;
    returning = true;
    idle.loop = false;
    userPaused = false;
    if (idle.ended) {
      returning = false;
      idle.loop = true;
      swapTo(back);
    } else if (idle.paused) {
      play(idle);
    }
    setControl();
  });

  steps.forEach(function (step, i) {
    step.addEventListener('click', function () {
      started = true;
      showFilm();
      video.currentTime = i ? captions[i].start : 0;
      userPaused = false;
      play();
      update();
    });
  });

  // Resizing across the phone breakpoint swaps the cut, keeping the place in the film
  function onCutChange() {
    var time = video.currentTime;
    var resume = !current().paused;
    showFilm();
    useCut();
    clips.forEach(function (clip) { clip.load(); });
    if (hasEnding() && !started) {
      opening();
      if (resume) play();
    } else if (started) {
      video.addEventListener('loadedmetadata', function () {
        video.currentTime = Math.min(time, video.duration - 0.05);
        if (resume) play();
        update();
      }, { once: true });
    }
    setControl();
    update();
  }
  if (phone.addEventListener) phone.addEventListener('change', onCutChange);
  else phone.addListener(onCutChange);

  function setInfo(open) {
    info.hidden = !open;
    infoToggle.setAttribute('aria-expanded', String(open));
  }

  infoToggle.addEventListener('click', function () { setInfo(info.hidden); });
  document.addEventListener('click', function (event) {
    if (!info.hidden && !info.contains(event.target) && !infoToggle.contains(event.target)) setInfo(false);
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !info.hidden) {
      setInfo(false);
      infoToggle.focus();
    }
  });

  if ('IntersectionObserver' in window) {
    // Start loading a little before the film scrolls into view
    new IntersectionObserver(function (entries, observer) {
      if (entries[0].isIntersecting) {
        clips.forEach(function (clip) { clip.preload = 'auto'; });
        observer.disconnect();
      }
    }, { rootMargin: '0px 0px 600px 0px' }).observe(video);

    // Play once a quarter of the film is on screen, so it is already moving as people reach it;
    // pause below that. (isIntersecting stays true for any sliver, so the ratio decides.)
    new IntersectionObserver(function (entries) {
      if (entries[0].intersectionRatio >= 0.25) {
        if (!userPaused && !current().ended) play();
      } else if (!current().paused) {
        current().pause();
      }
    }, { threshold: 0.25 }).observe(video);
  }

  if (hasEnding()) opening();
  setControl();
  update();
})();
