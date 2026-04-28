/* ============================================================
   TARTUMAA NOORTEKOGU — script.js
   Handles: language switching, dark/light theme, mobile nav,
            scroll effects, form submissions, scroll-reveal
   ============================================================ */

(function () {
  'use strict';

  /* ── 1. Theme ─────────────────────────────────────────────── */

  const root        = document.documentElement;
  const themeBtn    = document.getElementById('theme-toggle');
  const THEME_KEY   = 'tn-theme';

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
    const current = root.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });

  /* Listen for OS-level changes when no manual override stored */
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem(THEME_KEY)) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });

  /* ── 2. Language ──────────────────────────────────────────── */

  const LANG_KEY = 'tn-lang';
  const btnEt    = document.getElementById('btn-et');
  const btnEn    = document.getElementById('btn-en');

  function applyLang(lang) {
    /* Text nodes */
    document.querySelectorAll('[data-et]').forEach(el => {
      const val = el.getAttribute('data-' + lang);
      if (val !== null) el.textContent = val;
    });

    /* Placeholders */
    document.querySelectorAll('[data-placeholder-et]').forEach(el => {
      const val = el.getAttribute('data-placeholder-' + lang);
      if (val !== null) el.placeholder = val;
    });

    /* HTML lang attribute */
    root.lang = lang === 'et' ? 'et' : 'en';

    /* Button state */
    btnEt.classList.toggle('active', lang === 'et');
    btnEn.classList.toggle('active', lang === 'en');

    localStorage.setItem(LANG_KEY, lang);
  }

  function initLang() {
    const saved = localStorage.getItem(LANG_KEY);
    applyLang(saved || 'et');
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

  /* Close mobile nav when a link is tapped */
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  /* Close on outside click */
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

  /* ── 5. Active nav link (intersection) ───────────────────── */

  const sections = document.querySelectorAll('section[id], div[id]');

  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.querySelectorAll('a').forEach(a => {
          a.classList.toggle(
            'active',
            a.getAttribute('href') === '#' + entry.target.id
          );
        });
      }
    });
  }, { rootMargin: '-50% 0px -50% 0px' });

  sections.forEach(s => sectionObserver.observe(s));

  /* ── 6. Scroll-reveal ────────────────────────────────────── */

  const revealTargets = [
    '.card', '.stat', '.step', '.ci-item', '.value-row',
    '.ac', '.section-head', '.hero-text', '.about-text',
    '.contact-form', '.join-form', '.steps-row'
  ];

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealTargets.forEach(selector => {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.classList.add('reveal');
      el.style.transitionDelay = (i * 60) + 'ms';
      revealObserver.observe(el);
    });
  });

  /* ── 7. Form submissions (demo) ──────────────────────────── */

  function handleForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return;

    const successMsg = form.querySelector('.form-success');

    form.addEventListener('submit', e => {
      e.preventDefault();

      /* Basic required-field check */
      const inputs = form.querySelectorAll('input, textarea');
      let valid = true;
      inputs.forEach(el => {
        el.style.borderColor = '';
        if (el.hasAttribute('required') && !el.value.trim()) {
          el.style.borderColor = '#ef4444';
          valid = false;
        }
      });
      if (!valid) return;

      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      btn.disabled = true;
      btn.textContent = '...';

      /* Simulate async submit */
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

  /* ── 8. Smooth anchor scroll (offset for fixed navbar) ───── */

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = navbar.offsetHeight + 8;
      window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
    });
  });

  /* ── Init ─────────────────────────────────────────────────── */
  initTheme();
  initLang();

})();
