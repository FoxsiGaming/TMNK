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
    root.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
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

  document.querySelectorAll('section[id], div[id]').forEach(s => sectionObserver.observe(s));

  /* ── 6. Scroll reveal ────────────────────────────────────── */

  const revealTargets = [
    '.card', '.stat', '.step', '.ci-item', '.value-row',
    '.ac', '.section-head', '.hero-text', '.about-text',
    '.contact-form', '.join-form', '.steps-row',
    '.members-track-wrapper', '.members-nav'
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

  /* ── 10. Members carousel ───────────────────────────────────── */

  const track      = document.getElementById('members-track');
  const btnLeft    = document.getElementById('scroll-left');
  const btnRight   = document.getElementById('scroll-right');
  const countLabel = document.getElementById('members-count');

  if (track && btnLeft && btnRight) {
    const CARD_W = 188 + 20; // card width + gap

    function updateCarousel() {
      const max = track.scrollWidth - track.clientWidth;
      btnLeft.disabled  = track.scrollLeft <= 2;
      btnRight.disabled = track.scrollLeft >= max - 2;

      /* Show current position as "1–4 / 8" style counter */
      if (countLabel) {
        const visible = Math.round(track.clientWidth / CARD_W);
        const first   = Math.round(track.scrollLeft / CARD_W) + 1;
        const last    = Math.min(first + visible - 1, track.children.length);
        countLabel.textContent = first + '–' + last + ' / ' + track.children.length;
      }
    }

    btnLeft.addEventListener('click',  () => { track.scrollBy({ left: -CARD_W * 3, behavior: 'smooth' }); });
    btnRight.addEventListener('click', () => { track.scrollBy({ left:  CARD_W * 3, behavior: 'smooth' }); });
    track.addEventListener('scroll', updateCarousel, { passive: true });
    updateCarousel();

    /* Drag-to-scroll (desktop) */
    let dragging = false, startX = 0, scrollOrigin = 0;

    track.addEventListener('mousedown', e => {
      dragging    = true;
      startX      = e.pageX - track.offsetLeft;
      scrollOrigin = track.scrollLeft;
    });
    document.addEventListener('mousemove', e => {
      if (!dragging) return;
      e.preventDefault();
      track.scrollLeft = scrollOrigin - (e.pageX - track.offsetLeft - startX);
    });
    document.addEventListener('mouseup', () => {
      if (!dragging) return;
      dragging = false;
      updateCarousel();
    });

    /* Prevent link-click from firing on drag end */
    track.querySelectorAll('.member-card').forEach(card => {
      card.addEventListener('click', e => {
        if (Math.abs(track.scrollLeft - scrollOrigin) > 5) e.preventDefault();
      });
    });
  }

  /* ── Init ─────────────────────────────────────────────────── */
  initTheme();
  initLang();

})();
