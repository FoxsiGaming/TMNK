/* ============================================================
   TMNK — Dynamic content loader  (Supabase edition)
   Fetches members, events & gallery from Supabase REST API.
   Falls back to static HTML if fetch fails.
   Dispatches 'tmnk:content-loaded' so script.js can
   (re-)initialise carousels after the DOM is populated.
   ============================================================ */
(function () {
  'use strict';

  /* ── Supabase config ──────────────────────────────────────── */
  var SUPABASE_URL = 'https://lftsmwnbwcbyazqthdpe.supabase.co';
  var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmdHNtd25id2NieWF6cXRoZHBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMDY0NDgsImV4cCI6MjA5NDY4MjQ0OH0.QSPnUztG7qlDKa8Qh7edpx5KajZVCP4NZrmEnJ5p2bs';

  function sbFetch(table, query) {
    return fetch(SUPABASE_URL + '/rest/v1/' + table + '?' + query, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY
      }
    }).then(function (r) { return r.ok ? r.json() : []; });
  }

  /* ── Language helper ──────────────────────────────────────── */
  var LANG_KEY = 'tn-lang';

  function applyCurrentLang() {
    var lang = localStorage.getItem(LANG_KEY) || 'et';
    document.querySelectorAll('[data-et]').forEach(function (el) {
      var val = el.getAttribute('data-' + lang);
      if (val !== null) el.textContent = val;
    });
  }

  /* ── Escape HTML to prevent XSS ───────────────────────────── */
  function esc(str) {
    if (!str) return '';
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /* ── Main loader ──────────────────────────────────────────── */
  async function loadContent() {
    var results;
    try {
      results = await Promise.all([
        sbFetch('members',  'active=eq.true&order=sort_order.asc'),
        sbFetch('events',   'published=eq.true&order=date.desc'),
        sbFetch('gallery',  'order=sort_order.asc,created_at.desc')
      ]);
    } catch (e) {
      console.warn('TMNK dynamic: Supabase fetch failed, keeping static HTML.', e);
      window.dispatchEvent(new CustomEvent('tmnk:content-loaded'));
      return;
    }

    var members = results[0];
    var events  = results[1];
    var gallery = results[2];

    /* ── Members ─────────────────────────────────────────────── */
    var track = document.getElementById('members-track');
    if (track && members.length) {
      track.innerHTML = members.map(function (m) {
        var initials = m.name.split(' ').map(function (w) { return w[0]; }).join('').toUpperCase();
        var photoHTML = m.photo_url
          ? '<img src="' + esc(m.photo_url) + '" alt="' + esc(m.name) + '" loading="lazy">'
          : '<div class="mc-avatar">' + esc(initials) + '</div>';
        var href = (m.portfolio_url && m.portfolio_url !== '#') ? esc(m.portfolio_url) : '#';
        var tgt  = (m.portfolio_url && m.portfolio_url !== '#') ? ' target="_blank" rel="noopener"' : '';
        return '<a href="' + href + '"' + tgt + ' class="member-card">'
          + '<div class="mc-photo">' + photoHTML + '</div>'
          + '<h3 class="mc-name">' + esc(m.name) + '</h3>'
          + (m.age ? '<span class="mc-age">' + parseInt(m.age, 10) + '</span>' : '')
          + '<p class="mc-role" data-et="' + esc(m.role) + '" data-en="' + esc(m.role_en) + '">' + esc(m.role) + '</p>'
          + '<span class="mc-hint" data-et="Vaata profiili &#8594;" data-en="View profile &#8594;">Vaata profiili &#8594;</span>'
          + '</a>';
      }).join('');
    }

    /* ── Events ──────────────────────────────────────────────── */
    var eventsList = document.querySelector('.events-list');
    if (eventsList && events.length) {
      var months = ['Jan','Feb','Mar','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dets'];
      eventsList.innerHTML = events.map(function (ev) {
        var d    = new Date(ev.date);
        var day  = String(d.getDate()).padStart(2, '0');
        var mon  = months[d.getMonth()];
        var year = d.getFullYear();
        return '<article class="event-card">'
          + '<div class="event-date">'
          + '<span class="event-day">' + day + '</span>'
          + '<span class="event-month">' + mon + '</span>'
          + '<span class="event-year">' + year + '</span></div>'
          + '<div class="event-body">'
          + '<h3 data-et="' + esc(ev.title) + '" data-en="' + esc(ev.title_en || '') + '">' + esc(ev.title) + '</h3>'
          + '<p data-et="' + esc(ev.description || '') + '" data-en="' + esc(ev.description_en || '') + '">' + esc(ev.description || '') + '</p>'
          + '<div class="event-meta">'
          + (ev.location ? '<span>&#128205; ' + esc(ev.location) + '</span>' : '')
          + '</div></div></article>';
      }).join('');
    }

    /* ── Gallery ─────────────────────────────────────────────── */
    var galStage = document.getElementById('gal-stage');
    if (galStage && gallery.length) {
      galStage.innerHTML = gallery.map(function (g) {
        var meta = [g.place, g.photo_date].filter(Boolean).join(' · ');
        return '<div class="gal-slide">'
          + '<div class="gal-visual"><img src="' + esc(g.image_url) + '" alt="' + esc(g.title || g.caption || '') + '" loading="lazy"></div>'
          + '<div class="gal-overlay">'
          + (g.album ? '<span class="gal-tag">' + esc(g.album) + '</span>' : '')
          + (g.title ? '<strong>' + esc(g.title) + '</strong>' : '')
          + (meta ? '<span class="gal-meta">' + esc(meta) + '</span>' : '')
          + '</div></div>';
      }).join('');
    }

    /* Re-apply language to freshly rendered bilingual elements */
    applyCurrentLang();

    /* Notify script.js that dynamic content is ready */
    window.dispatchEvent(new CustomEvent('tmnk:content-loaded'));
  }

  /* Run after DOM is ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadContent);
  } else {
    loadContent();
  }
})();
