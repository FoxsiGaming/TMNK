/* ============================================================
   TMNK Admin Panel — Client JS
   ============================================================ */

/* ── Tab navigation ──────────────────────────────────────── */
const navItems = document.querySelectorAll('.nav-item[data-tab]');
const tabs = document.querySelectorAll('.tab-content');
const pageTitle = document.getElementById('page-title');

const tabTitles = {
  members: 'Liikmed', projects: 'Projektid',
  gallery: 'Galerii', events: 'Sündmused', settings: 'Seaded'
};

navItems.forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    navItems.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    tabs.forEach(t => t.classList.toggle('active', t.id === 'tab-' + tab));
    pageTitle.textContent = tabTitles[tab] || tab;
    // Close sidebar on mobile
    document.getElementById('sidebar').classList.remove('open');
  });
});

// Mobile sidebar toggle
document.getElementById('sidebar-toggle').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
});

// Logout
document.getElementById('logout-btn').addEventListener('click', async () => {
  await fetch('/auth/logout', { method: 'POST' });
  window.location.href = '/auth/login';
});

/* ── API helpers ─────────────────────────────────────────── */
async function api(path, opts = {}) {
  const res = await fetch('/api' + path, opts);
  if (res.status === 401) { window.location.href = '/auth/login'; return null; }
  return res.json();
}

/* ── Modal ────────────────────────────────────────────────── */
const overlay = document.getElementById('modal-overlay');
const modalTitle = document.getElementById('modal-title');
const modalFields = document.getElementById('modal-fields');
const modalForm = document.getElementById('modal-form');
const modalId = document.getElementById('modal-id');
const modalType = document.getElementById('modal-type');

function closeModal() {
  overlay.classList.remove('open');
  modalForm.reset();
  modalFields.innerHTML = '';
  modalId.value = '';
}

function openModal(type, data = null) {
  modalType.value = type;
  modalId.value = data ? data.id : '';
  modalTitle.textContent = data ? 'Muuda' : 'Lisa uus';
  modalFields.innerHTML = getFieldsHTML(type, data);
  overlay.classList.add('open');
}

function field(label, name, value, type = 'text', extra = '') {
  const v = value != null ? value : '';
  if (type === 'textarea') {
    return `<div class="form-group"><label>${label}</label><textarea name="${name}" ${extra}>${v}</textarea></div>`;
  }
  if (type === 'file') {
    return `<div class="form-group"><label>${label}</label><input type="file" name="${name}" accept="image/*" ${extra}/>${v ? '<small style="color:var(--admin-muted)">Current: ' + v + '</small><input type="hidden" name="existing_photo" value="' + v + '"/>' : ''}</div>`;
  }
  if (type === 'file-gallery') {
    return `<div class="form-group"><label>${label}</label><input type="file" name="${name}" accept="image/*" ${extra}/>${v ? '<small style="color:var(--admin-muted)">Current: ' + v + '</small><input type="hidden" name="existing_image" value="' + v + '"/>' : ''}</div>`;
  }
  if (type === 'checkbox') {
    const checked = v === true || v === 'true' || v === true ? 'checked' : '';
    return `<div class="form-group"><label><input type="checkbox" name="${name}" ${checked} style="margin-right:.5rem"/>${label}</label></div>`;
  }
  return `<div class="form-group"><label>${label}</label><input type="${type}" name="${name}" value="${v}" ${extra}/></div>`;
}

function getFieldsHTML(type, d) {
  switch (type) {
    case 'member': return `
      ${field('Nimi', 'name', d?.name)}
      <div class="form-row">
        ${field('Vanus', 'age', d?.age, 'number')}
        ${field('Järjekord', 'sort_order', d?.sort_order, 'number')}
      </div>
      <div class="form-row">
        ${field('Roll (ET)', 'role_et', d?.role_et || 'Liige')}
        ${field('Roll (EN)', 'role_en', d?.role_en || 'Member')}
      </div>
      ${field('Foto', 'photo', d?.photo, 'file')}
      ${field('Link', 'link', d?.link)}
      ${d ? field('Nähtav', 'visible', d?.visible, 'checkbox') : ''}`;

    case 'project': return `
      ${field('Ikoon (emoji)', 'icon', d?.icon)}
      <div class="form-row">
        ${field('Pealkiri (ET)', 'title_et', d?.title_et)}
        ${field('Pealkiri (EN)', 'title_en', d?.title_en)}
      </div>
      ${field('Kirjeldus (ET)', 'desc_et', d?.desc_et, 'textarea')}
      ${field('Kirjeldus (EN)', 'desc_en', d?.desc_en, 'textarea')}
      <div class="form-row">
        ${field('Silt (ET)', 'tag_et', d?.tag_et)}
        ${field('Silt (EN)', 'tag_en', d?.tag_en)}
      </div>
      ${field('Järjekord', 'sort_order', d?.sort_order, 'number')}
      ${d ? field('Nähtav', 'visible', d?.visible, 'checkbox') : ''}`;

    case 'gallery': return `
      ${field('Emoji', 'emoji', d?.emoji)}
      ${field('Gradient (CSS)', 'gradient', d?.gradient)}
      ${field('Pilt', 'image', d?.image, 'file-gallery')}
      <div class="form-row">
        ${field('Pealkiri (ET)', 'title_et', d?.title_et)}
        ${field('Pealkiri (EN)', 'title_en', d?.title_en)}
      </div>
      ${field('Kirjeldus (ET)', 'desc_et', d?.desc_et, 'textarea')}
      ${field('Kirjeldus (EN)', 'desc_en', d?.desc_en, 'textarea')}
      <div class="form-row">
        ${field('Silt (ET)', 'tag_et', d?.tag_et)}
        ${field('Silt (EN)', 'tag_en', d?.tag_en)}
      </div>
      ${field('Järjekord', 'sort_order', d?.sort_order, 'number')}
      ${d ? field('Nähtav', 'visible', d?.visible, 'checkbox') : ''}`;

    case 'event': return `
      ${field('Kuupäev', 'event_date', d?.event_date ? d.event_date.slice(0,10) : '', 'date')}
      <div class="form-row">
        ${field('Pealkiri (ET)', 'title_et', d?.title_et)}
        ${field('Pealkiri (EN)', 'title_en', d?.title_en)}
      </div>
      ${field('Kirjeldus (ET)', 'desc_et', d?.desc_et, 'textarea')}
      ${field('Kirjeldus (EN)', 'desc_en', d?.desc_en, 'textarea')}
      <div class="form-row">
        ${field('Silt (ET)', 'tag_et', d?.tag_et)}
        ${field('Silt (EN)', 'tag_en', d?.tag_en)}
      </div>
      <div class="form-row">
        ${field('Asukoht (ET)', 'location_et', d?.location_et)}
        ${field('Asukoht (EN)', 'location_en', d?.location_en)}
      </div>
      ${field('Kellaaeg', 'time_text', d?.time_text)}
      ${d ? field('Nähtav', 'visible', d?.visible, 'checkbox') : ''}`;
  }
  return '';
}

/* ── Form submission ─────────────────────────────────────── */
modalForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const type = modalType.value;
  const id = modalId.value;
  const formData = new FormData(modalForm);

  // Handle checkbox for 'visible'
  if (id) {
    formData.set('visible', formData.has('visible') ? 'true' : 'false');
  }

  const endpoints = { member: 'members', project: 'projects', gallery: 'gallery', event: 'events' };
  const endpoint = endpoints[type];
  const method = id ? 'PUT' : 'POST';
  const url = '/api/' + endpoint + (id ? '/' + id : '');

  // For projects, events, settings — use JSON. For members/gallery with file — use FormData
  let opts;
  if ((type === 'member' || type === 'gallery') && (formData.get('photo')?.size > 0 || formData.get('image')?.size > 0)) {
    opts = { method, body: formData };
  } else {
    const obj = Object.fromEntries(formData.entries());
    // Remove empty file entries
    delete obj.photo;
    delete obj.image;
    opts = { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj) };
  }

  await fetch(url, opts);
  closeModal();
  loadAll();
});

/* ── Delete ───────────────────────────────────────────────── */
async function deleteItem(type, id) {
  if (!confirm('Kas oled kindel, et soovid kustutada?')) return;
  const endpoints = { member: 'members', project: 'projects', gallery: 'gallery', event: 'events' };
  await api('/' + endpoints[type] + '/' + id, { method: 'DELETE' });
  loadAll();
}

/* ── Render tables ────────────────────────────────────────── */
function renderMembers(data) {
  const tbody = document.querySelector('#members-table tbody');
  tbody.innerHTML = data.map(m => {
    const initials = m.name.split(' ').map(w => w[0]).join('').toUpperCase();
    const photo = m.photo
      ? `<div class="photo-cell"><img src="${m.photo}" alt="${m.name}"></div>`
      : `<div class="avatar-initials">${initials}</div>`;
    return `<tr>
      <td>${photo}</td>
      <td><strong>${m.name}</strong></td>
      <td>${m.age || '—'}</td>
      <td>${m.role_et}</td>
      <td><span class="badge-visible ${m.visible ? 'badge-yes' : 'badge-no'}">${m.visible ? 'Jah' : 'Ei'}</span></td>
      <td><div class="actions-cell">
        <button class="btn-sm btn-edit" onclick='openModal("member", ${JSON.stringify(m).replace(/'/g,"&#39;")})'>Muuda</button>
        <button class="btn-sm btn-delete" onclick='deleteItem("member", ${m.id})'>Kustuta</button>
      </div></td>
    </tr>`;
  }).join('');
}

function renderProjects(data) {
  const tbody = document.querySelector('#projects-table tbody');
  tbody.innerHTML = data.map(p => `<tr>
    <td style="font-size:1.3rem">${p.icon || '—'}</td>
    <td><strong>${p.title_et}</strong></td>
    <td>${p.tag_et || '—'}</td>
    <td><span class="badge-visible ${p.visible ? 'badge-yes' : 'badge-no'}">${p.visible ? 'Jah' : 'Ei'}</span></td>
    <td><div class="actions-cell">
      <button class="btn-sm btn-edit" onclick='openModal("project", ${JSON.stringify(p).replace(/'/g,"&#39;")})'>Muuda</button>
      <button class="btn-sm btn-delete" onclick='deleteItem("project", ${p.id})'>Kustuta</button>
    </div></td>
  </tr>`).join('');
}

function renderGallery(data) {
  const tbody = document.querySelector('#gallery-table tbody');
  tbody.innerHTML = data.map(g => {
    const thumb = g.image
      ? `<div class="gallery-thumb"><img src="${g.image}"></div>`
      : `<div class="gallery-thumb">${g.emoji || '📷'}</div>`;
    return `<tr>
      <td>${thumb}</td>
      <td><strong>${g.title_et}</strong></td>
      <td>${g.tag_et || '—'}</td>
      <td><span class="badge-visible ${g.visible ? 'badge-yes' : 'badge-no'}">${g.visible ? 'Jah' : 'Ei'}</span></td>
      <td><div class="actions-cell">
        <button class="btn-sm btn-edit" onclick='openModal("gallery", ${JSON.stringify(g).replace(/'/g,"&#39;")})'>Muuda</button>
        <button class="btn-sm btn-delete" onclick='deleteItem("gallery", ${g.id})'>Kustuta</button>
      </div></td>
    </tr>`;
  }).join('');
}

function renderEvents(data) {
  const tbody = document.querySelector('#events-table tbody');
  tbody.innerHTML = data.map(e => {
    const d = e.event_date ? new Date(e.event_date).toLocaleDateString('et-EE') : '—';
    return `<tr>
      <td>${d}</td>
      <td><strong>${e.title_et}</strong></td>
      <td>${e.location_et || '—'}</td>
      <td><span class="badge-visible ${e.visible ? 'badge-yes' : 'badge-no'}">${e.visible ? 'Jah' : 'Ei'}</span></td>
      <td><div class="actions-cell">
        <button class="btn-sm btn-edit" onclick='openModal("event", ${JSON.stringify(e).replace(/'/g,"&#39;")})'>Muuda</button>
        <button class="btn-sm btn-delete" onclick='deleteItem("event", ${e.id})'>Kustuta</button>
      </div></td>
    </tr>`;
  }).join('');
}

function renderSettings(data) {
  const form = document.getElementById('settings-form');
  form.innerHTML = data.map(s => `
    <div class="setting-row">
      <label>${s.key}</label>
      <div class="setting-inputs">
        <input name="${s.key}__et" value="${(s.value_et || '').replace(/"/g, '&quot;')}" placeholder="Eesti" />
        <input name="${s.key}__en" value="${(s.value_en || '').replace(/"/g, '&quot;')}" placeholder="English" />
      </div>
    </div>
  `).join('') + '<button type="submit" class="btn-primary settings-save" style="width:auto;margin-top:.5rem">Salvesta seaded</button>';

  // Remove old listener and add new
  form.onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const keys = new Set();
    for (const [k] of fd.entries()) { keys.add(k.replace(/__e[tn]$/, '')); }
    for (const key of keys) {
      await fetch('/api/settings/' + key, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value_et: fd.get(key + '__et'), value_en: fd.get(key + '__en') })
      });
    }
    alert('Seaded salvestatud!');
  };
}

/* ── Load all data ────────────────────────────────────────── */
async function loadAll() {
  const [members, projects, gallery, events, settings] = await Promise.all([
    api('/members'), api('/projects'), api('/gallery'), api('/events'), api('/settings')
  ]);
  if (members) renderMembers(members);
  if (projects) renderProjects(projects);
  if (gallery) renderGallery(gallery);
  if (events) renderEvents(events);
  if (settings) renderSettings(settings);
}

loadAll();
