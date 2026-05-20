/* ============================================================
   TARTUMAA NOORTEKOGU — script.js
   ============================================================ */

(function () {
  'use strict';

  /* ── 1. Theme ─────────────────────────────────────────────── */

  const root      = document.documentElement;
  const themeBtn  = document.getElementById('theme-toggle');
  const THEME_KEY = 'tn-theme';

  function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    const resolved = theme === 'auto' ? getSystemTheme() : theme;
    root.setAttribute('data-theme', resolved);
    if (theme !== 'auto') localStorage.setItem(THEME_KEY, theme);
  }

  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    applyTheme(saved || getSystemTheme());
  }

  themeBtn.addEventListener('click', () => {
    applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem(THEME_KEY)) applyTheme(e.matches ? 'dark' : 'light');
  });

  /* ── 2. Language ──────────────────────────────────────────── */

  const LANG_KEY = 'tn-lang';
  const btnEt    = document.getElementById('btn-et');
  const btnEn    = document.getElementById('btn-en');

  function applyLang(lang) {
    document.querySelectorAll('[data-et]').forEach(el => {
      const val = el.getAttribute('data-' + lang);
      if (val !== null) el.textContent = val;
    });
    document.querySelectorAll('[data-placeholder-et]').forEach(el => {
      const val = el.getAttribute('data-placeholder-' + lang);
      if (val !== null) el.placeholder = val;
    });
    root.lang = lang === 'et' ? 'et' : 'en';
    btnEt.classList.toggle('active', lang === 'et');
    btnEn.classList.toggle('active', lang === 'en');
    localStorage.setItem(LANG_KEY, lang);
  }

  function initLang() {
    applyLang(localStorage.getItem(LANG_KEY) || 'et');
  }

  btnEt.addEventListener('click', () => applyLang('et'));
  btnEn.addEventListener('click', () => applyLang('en'));

  /* ── 3. Mobile nav ────────────────────────────────────────── */

  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('nav-links');

  hamburger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', String(open));
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('click', e => {
    if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
    }
  });

  /* ── 4. Navbar scroll shadow ──────────────────────────────── */

  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 12);
  }, { passive: true });

  /* ── 5. Active nav link ───────────────────────────────────── */

  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.querySelectorAll('a').forEach(a => {
          a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id);
        });
      }
    });
  }, { rootMargin: '-50% 0px -50% 0px' });

  document.querySelectorAll('section[id]').forEach(s => sectionObserver.observe(s));

  /* ── 6. Scroll reveal ────────────────────────────────────── */

  const revealTargets = [
    '.card', '.stat', '.step', '.ci-item', '.value-row',
    '.ac', '.section-head', '.hero-text', '.about-text',
    '.contact-form', '.join-form', '.steps-row',
    '.members-track-wrapper', '.members-nav',
    '.gal-navbar', '.gal',
    '.event-card'
  ];

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  revealTargets.forEach(selector => {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.classList.add('reveal');
      el.style.transitionDelay = (i * 55) + 'ms';
      revealObserver.observe(el);
    });
  });

  /* ── 7. Stat counter animation ────────────────────────────── */

  function animateCount(el, target, suffix, duration) {
    const start = performance.now();
    function step(now) {
      const elapsed = Math.min((now - start) / duration, 1);
      const eased   = 1 - Math.pow(1 - elapsed, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (elapsed < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const countObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.getAttribute('data-count'), 10);
      animateCount(el, target, '+', 1400);
      countObserver.unobserve(el);
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-count]').forEach(el => countObserver.observe(el));

  /* ── 8. Form submissions ─────────────────────────────────── */

  function handleForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    const successMsg = form.querySelector('.form-success');
    form.addEventListener('submit', e => {
      e.preventDefault();
      const inputs = form.querySelectorAll('input, textarea');
      let valid = true;
      inputs.forEach(el => {
        el.style.borderColor = '';
        if (el.hasAttribute('required') && !el.value.trim()) {
          el.style.borderColor = '#ec4899';
          valid = false;
        }
      });
      if (!valid) return;
      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      btn.disabled = true;
      btn.textContent = '...';
      setTimeout(() => {
        btn.disabled = false;
        btn.textContent = originalText;
        form.reset();
        if (successMsg) {
          successMsg.classList.remove('hidden');
          setTimeout(() => successMsg.classList.add('hidden'), 5000);
        }
      }, 900);
    });
  }

  handleForm('contact-form');
  handleForm('join-form');

  /* ── 9. Smooth anchor scroll ─────────────────────────────── */

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      window.scrollTo({ top: target.offsetTop - navbar.offsetHeight - 8, behavior: 'smooth' });
    });
  });

  /* ── 10. Members carousel — infinite loop ───────────────────── */
  /* Wrapped in a function so it can re-init after dynamic.js injects content.
     Uses cloneNode+replaceChild to strip old event listeners on re-init. */
  function initMembersCarousel() {
    let track      = document.getElementById('members-track');
    const btnLeft    = document.getElementById('scroll-left');
    const btnRight   = document.getElementById('scroll-right');
    const countLabel = document.getElementById('members-count');
    if (!track) return;

    /* Remove any previous clones (re-init safe) */
    track.querySelectorAll('[aria-hidden="true"]').forEach(c => c.remove());

    /* card width (188px) + gap (1.25rem = 20px) */
    const CARD_W = 208;

    const realCards = Array.from(track.children);
    const N = realCards.length;
    if (N === 0) return;

    /* Append clones after real cards */
    realCards.forEach(c => {
      const cl = c.cloneNode(true);
      cl.setAttribute('aria-hidden', 'true');
      cl.setAttribute('tabindex', '-1');
      track.append(cl);
    });
    /* Prepend clones before real cards */
    realCards.slice().reverse().forEach(c => {
      const cl = c.cloneNode(true);
      cl.setAttribute('aria-hidden', 'true');
      cl.setAttribute('tabindex', '-1');
      track.prepend(cl);
    });

    /* Replace node to strip any old event listeners from previous init */
    const freshTrack = track.cloneNode(true);
    track.parentNode.replaceChild(freshTrack, track);
    track = freshTrack;

    const SET_W = N * CARD_W;
    track.scrollLeft = SET_W;

    let jumping = false;
    let dragOrigin = SET_W;

    function teleportIfNeeded() {
      if (jumping) return;
      if (track.scrollLeft < SET_W) {
        jumping = true;
        track.scrollLeft += SET_W;
        dragOrigin       += SET_W;
        requestAnimationFrame(() => { jumping = false; });
      } else if (track.scrollLeft >= 2 * SET_W) {
        jumping = true;
        track.scrollLeft -= SET_W;
        dragOrigin       -= SET_W;
        requestAnimationFrame(() => { jumping = false; });
      }
    }

    function updateCounter() {
      if (!countLabel) return;
      const offset = track.scrollLeft - SET_W;
      const idx    = (Math.round(offset / CARD_W) % N + N) % N;
      countLabel.textContent = (idx + 1) + ' / ' + N;
    }

    track.addEventListener('scroll', () => {
      teleportIfNeeded();
      updateCounter();
    }, { passive: true });
    updateCounter();

    let rafId = null;

    function smoothScrollTo(target, duration) {
      if (rafId) cancelAnimationFrame(rafId);
      const from  = track.scrollLeft;
      const delta = target - from;
      const t0    = performance.now();
      function step(now) {
        const p = Math.min((now - t0) / duration, 1);
        const e = 1 - Math.pow(1 - p, 3);
        track.scrollLeft = from + delta * e;
        rafId = p < 1 ? requestAnimationFrame(step) : null;
      }
      rafId = requestAnimationFrame(step);
    }

    if (btnLeft) {
      btnLeft.disabled = false;
      btnLeft.onclick = () => {
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
        let tgt = track.scrollLeft - CARD_W * 3;
        if (tgt < SET_W) tgt += SET_W;
        smoothScrollTo(tgt, 380);
      };
    }
    if (btnRight) {
      btnRight.disabled = false;
      btnRight.onclick = () => {
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
        let tgt = track.scrollLeft + CARD_W * 3;
        if (tgt >= 2 * SET_W) tgt -= SET_W;
        smoothScrollTo(tgt, 380);
      };
    }

    /* Drag to scroll (desktop) */
    let dragging = false, startX = 0, movedPx = 0;
    track.addEventListener('mousedown', e => {
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      dragging   = true;
      startX     = e.clientX;
      dragOrigin = track.scrollLeft;
      movedPx    = 0;
    });
    document.addEventListener('mousemove', e => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      movedPx  = Math.abs(dx);
      track.scrollLeft = dragOrigin - dx;
    });
    document.addEventListener('mouseup', () => { dragging = false; });
    track.addEventListener('click', e => {
      if (movedPx > 5) { e.preventDefault(); movedPx = 0; }
    }, true);
  }

  initMembersCarousel();

  /* ── 11. Gallery — full-bleed carousel ─────────────────────── */
  function initGalleryCarousel() {
    const stage   = document.getElementById('gal-stage');
    const prevBtn = document.getElementById('gal-prev');
    const nextBtn = document.getElementById('gal-next');
    const counter = document.getElementById('gal-counter');
    const bar     = document.getElementById('gal-progress-bar');
    if (!stage) return;

    const slides = Array.from(stage.querySelectorAll('.gal-slide'));
    const N = slides.length;
    if (N === 0) return;

    let current = 0;
    let autoTimer = null;

    function updateUI() {
      slides.forEach((s, i) => s.classList.toggle('active', i === current));
      if (counter) counter.textContent = (current + 1) + ' / ' + N;
      if (bar)     bar.style.width = ((current + 1) / N * 100) + '%';
    }

    function scrollToSlide(idx) {
      const slide = slides[idx];
      if (!slide) return;
      stage.scrollTo({ left: slide.offsetLeft, behavior: 'smooth' });
    }

    function goTo(idx) {
      current = ((idx % N) + N) % N;
      scrollToSlide(current);
      updateUI();
      resetAuto();
    }

    function detectActive() {
      const stageCenter = stage.scrollLeft + stage.offsetWidth / 2;
      let closest = 0, minDist = Infinity;
      slides.forEach((s, i) => {
        const center = s.offsetLeft + s.offsetWidth / 2;
        const d = Math.abs(center - stageCenter);
        if (d < minDist) { minDist = d; closest = i; }
      });
      if (closest !== current) {
        current = closest;
        updateUI();
      }
    }

    let scrollTimeout = null;
    stage.addEventListener('scroll', () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(detectActive, 60);
    }, { passive: true });

    if (prevBtn) prevBtn.onclick = () => goTo(current - 1);
    if (nextBtn) nextBtn.onclick = () => goTo(current + 1);

    function resetAuto() {
      if (autoTimer) clearInterval(autoTimer);
      autoTimer = setInterval(() => goTo(current + 1), 5000);
    }
    resetAuto();

    stage.addEventListener('mouseenter', () => { if (autoTimer) clearInterval(autoTimer); });
    stage.addEventListener('mouseleave', resetAuto);

    /* Drag support */
    let dragging = false, dragStartX = 0, dragScrollLeft = 0, movedPx = 0;
    stage.addEventListener('mousedown', e => {
      dragging = true; dragStartX = e.clientX;
      dragScrollLeft = stage.scrollLeft; movedPx = 0;
      stage.style.scrollBehavior = 'auto';
    });
    document.addEventListener('mousemove', e => {
      if (!dragging) return;
      const dx = e.clientX - dragStartX;
      movedPx = Math.abs(dx);
      stage.scrollLeft = dragScrollLeft - dx;
    });
    document.addEventListener('mouseup', () => {
      if (!dragging) return;
      dragging = false;
      stage.style.scrollBehavior = '';
      detectActive();
    });
    stage.addEventListener('click', e => {
      if (movedPx > 5) { e.preventDefault(); movedPx = 0; }
    }, true);

    stage.setAttribute('tabindex', '0');
    stage.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft')  { e.preventDefault(); goTo(current - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current + 1); }
    });

    requestAnimationFrame(() => { scrollToSlide(0); updateUI(); });
  }

  initGalleryCarousel();

  /* ── 12. Re-init carousels when dynamic content loads ──────── */
  window.addEventListener('tmnk:content-loaded', () => {
    initMembersCarousel();
    initGalleryCarousel();

    /* Re-apply scroll reveal to dynamically loaded elements
       (skip event-cards if scroll-pin is active — it handles its own visibility) */
    const pinned = document.querySelector('.events-section.scroll-pinned');
    const revealTargets = ['.member-card', '.gal-slide'];
    if (!pinned) revealTargets.push('.event-card');
    revealTargets.forEach(selector => {
      document.querySelectorAll(selector).forEach((el, i) => {
        if (!el.classList.contains('reveal')) {
          el.classList.add('reveal');
          el.style.transitionDelay = (i * 55) + 'ms';
          revealObserver.observe(el);
        }
      });
    });
  });


  /* ── 13. Events scroll-pin (when > 5 cards) ─────────────────── */
  function initEventsScrollPin() {
    const section    = document.querySelector('.events-section');
    const outer      = document.querySelector('.events-scroll-outer');
    const list       = document.querySelector('.events-list');
    const progressEl = document.getElementById('events-progress');
    if (!section || !outer || !list) return;

    const cards = Array.from(list.querySelectorAll('.event-card'));
    const THRESHOLD = 5;

    /* Clean up previous init */
    section.classList.remove('scroll-pinned');
    outer.style.height = '';
    if (progressEl) progressEl.innerHTML = '';
    cards.forEach(c => { delete c.dataset.state; });

    if (cards.length <= THRESHOLD) return;

    /* Activate pinned mode */
    section.classList.add('scroll-pinned');

    const VISIBLE_COUNT = 3;               /* cards shown at once */
    const SCROLL_PER_CARD = 280;           /* px of scroll per card step */
    const totalSteps = cards.length - VISIBLE_COUNT + 1;
    const extraHeight = totalSteps * SCROLL_PER_CARD;

    /* Outer wrapper needs to be tall enough to create scroll room */
    outer.style.height = (window.innerHeight + extraHeight) + 'px';

    /* Build progress dots */
    if (progressEl) {
      cards.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.className = 'events-progress-dot';
        progressEl.appendChild(dot);
      });
    }

    /* Scroll handler */
    function onScroll() {
      const rect = outer.getBoundingClientRect();
      /* progress 0→1 as outer scrolls through */
      const rawProgress = -rect.top / extraHeight;
      const progress = Math.max(0, Math.min(1, rawProgress));

      /* Which card index is "first visible" */
      const firstVisible = Math.round(progress * (totalSteps - 1));

      cards.forEach((card, i) => {
        if (i < firstVisible) {
          card.dataset.state = 'above';
        } else if (i >= firstVisible + VISIBLE_COUNT) {
          card.dataset.state = 'below';
        } else {
          card.dataset.state = 'visible';
        }
      });

      /* Update progress dots */
      if (progressEl) {
        const dots = progressEl.children;
        for (let i = 0; i < dots.length; i++) {
          dots[i].classList.toggle('active', i >= firstVisible && i < firstVisible + VISIBLE_COUNT);
        }
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); /* initial state */
  }

  initEventsScrollPin();

  /* Re-init events scroll-pin when dynamic content loads */
  window.addEventListener('tmnk:content-loaded', () => {
    /* Small delay to let DOM settle */
    requestAnimationFrame(initEventsScrollPin);
  });

  /* -- Init -- */
  initTheme();
  initLang();

})();
