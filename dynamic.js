/* ============================================================
   TMNK — Dynamic content loader
   Fetches data from the API when server is running.
   Falls back gracefully to static HTML if API is unavailable.
   ============================================================ */
(function () {
  'use strict';

  var LANG_KEY = 'tn-lang';

  function applyCurrentLang() {
    var lang = localStorage.getItem(LANG_KEY) || 'et';
    document.querySelectorAll('[data-et]').forEach(function (el) {
      var val = el.getAttribute('data-' + lang);
      if (val !== null) el.textContent = val;
    });
  }

  async function loadContent() {
    try {
      var test = await fetch('/api/public/members');
      if (!test.ok) return;
    } catch (e) {
      return; // API not available, keep static HTML
    }

    var data = await Promise.all([
      fetch('/api/public/members').then(function (r) { return r.json(); }),
      fetch('/api/public/projects').then(function (r) { return r.json(); }),
      fetch('/api/public/gallery').then(function (r) { return r.json(); }),
      fetch('/api/public/events').then(function (r) { return r.json(); }),
      fetch('/api/public/settings').then(function (r) { return r.json(); })
    ]);

    var members  = data[0];
    var projects = data[1];
    var gallery  = data[2];
    var events   = data[3];
    var settings = data[4];

    // --- Members ---
    var track = document.getElementById('members-track');
    if (track && members.length) {
      track.innerHTML = members.map(function (m) {
        var initials = m.name.split(' ').map(function (w) { return w[0]; }).join('').toUpperCase();
        var photoHTML = m.photo
          ? '<img src="' + m.photo + '" alt="' + m.name + '" loading="lazy">'
          : '<div class="mc-avatar">' + initials + '</div>';
        var href = (m.link && m.link !== '#') ? m.link : '#';
        var tgt = (m.link && m.link !== '#') ? ' target="_blank" rel="noopener"' : '';
        return '<a href="' + href + '"' + tgt + ' class="member-card">'
          + '<div class="mc-photo">' + photoHTML + '</div>'
          + '<h3 class="mc-name">' + m.name + '</h3>'
          + '<span class="mc-age">' + (m.age || '') + '</span>'
          + '<p class="mc-role" data-et="' + m.role_et + '" data-en="' + m.role_en + '">' + m.role_et + '</p>'
          + '<span class="mc-hint" data-et="Vaata profiili &#8594;" data-en="View profile &#8594;">Vaata profiili &#8594;</span>'
          + '</a>';
      }).join('');
    }

    // --- Projects ---
    var cardsGrid = document.querySelector('.cards-grid');
    if (cardsGrid && projects.length) {
      cardsGrid.innerHTML = projects.map(function (p) {
        return '<article class="card">'
          + '<div class="card-icon">' + (p.icon || '') + '</div>'
          + '<h3 data-et="' + p.title_et + '" data-en="' + (p.title_en || '') + '">' + p.title_et + '</h3>'
          + '<p data-et="' + (p.desc_et || '') + '" data-en="' + (p.desc_en || '') + '">' + (p.desc_et || '') + '</p>'
          + '<span class="tag" data-et="' + (p.tag_et || '') + '" data-en="' + (p.tag_en || '') + '">' + (p.tag_et || '') + '</span>'
          + '</article>';
      }).join('');
    }

    // --- Gallery ---
    var galStage = document.getElementById('gal-stage');
    if (galStage && gallery.length) {
      galStage.innerHTML = gallery.map(function (g) {
        var bg = g.gradient || 'var(--grad-icon-1)';
        var visual = g.image
          ? '<div class="gal-visual"><img src="' + g.image + '" alt="' + g.title_et + '"></div>'
          : '<div class="gal-visual" style="background:' + bg + '"><span class="gal-emoji">' + (g.emoji || '') + '</span></div>';
        return '<div class="gal-slide" data-gradient="' + (g.gradient || '') + '">'
          + visual
          + '<div class="gal-overlay">'
          + '<span class="gal-tag" data-et="' + (g.tag_et || '') + '" data-en="' + (g.tag_en || '') + '">' + (g.tag_et || '') + '</span>'
          + '<strong data-et="' + g.title_et + '" data-en="' + (g.title_en || '') + '">' + g.title_et + '</strong>'
          + '<span data-et="' + (g.desc_et || '') + '" data-en="' + (g.desc_en || '') + '">' + (g.desc_et || '') + '</span>'
          + '</div></div>';
      }).join('');
    }

    // --- Events ---
    var eventsList = document.querySelector('.events-list');
    if (eventsList && events.length) {
      var months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dets'];
      eventsList.innerHTML = events.map(function (ev) {
        var d = new Date(ev.event_date);
        var day = String(d.getDate()).padStart(2, '0');
        var mon = months[d.getMonth()];
        var year = d.getFullYear();
        return '<article class="event-card">'
          + '<div class="event-date">'
          + '<span class="event-day">' + day + '</span>'
          + '<span class="event-month">' + mon + '</span>'
          + '<span class="event-year">' + year + '</span></div>'
          + '<div class="event-body">'
          + '<span class="tag" data-et="' + (ev.tag_et || '') + '" data-en="' + (ev.tag_en || '') + '">' + (ev.tag_et || '') + '</span>'
          + '<h3 data-et="' + ev.title_et + '" data-en="' + (ev.title_en || '') + '">' + ev.title_et + '</h3>'
          + '<p data-et="' + (ev.desc_et || '') + '" data-en="' + (ev.desc_en || '') + '">' + (ev.desc_et || '') + '</p>'
          + '<div class="event-meta">'
          + '<span>&#128205; <span data-et="' + (ev.location_et || '') + '" data-en="' + (ev.location_en || '') + '">' + (ev.location_et || '') + '</span></span>'
          + '<span>&#128336; ' + (ev.time_text || '') + '</span>'
          + '</div></div></article>';
      }).join('');
    }

    // --- Settings ---
    if (settings) {
      var pairs = [
        ['.hero-text h1', 'hero_title'],
        ['.hero-sub', 'hero_subtitle'],
        ['.hero-desc', 'hero_desc']
      ];
      pairs.forEach(function (pair) {
        var el = document.querySelector(pair[0]);
        var key = settings[pair[1]];
        if (el && key) {
          el.setAttribute('data-et', key.et);
          el.setAttribute('data-en', key.en);
        }
      });
    }

    // Re-apply language to freshly rendered elements
    applyCurrentLang();
  }

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadContent);
  } else {
    loadContent();
  }
})();
