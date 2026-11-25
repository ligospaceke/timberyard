import { D, persist, reset, replace, shrink, load } from './store.js';
import { esc, catName } from './views.js';
const CATS = ['collars', 'cuffs', 'headbands', 'shukas'];
const SLOTS = [['hero', 'Home hero'], ['collars', 'Collars tile'], ['cuffs', 'Cuffs tile'], ['headbands', 'Headbands tile'], ['shukas', 'Shukas tile'], ['story', 'Home story image'], ['banner', 'Story page banner']];
export let dirty = false;
export const setDirty = (v) => { dirty = v; const b = document.getElementById('dirty'); if (b) b.textContent = v ? 'You have unsaved changes' : 'All changes saved'; };
const opt = (list, cur, f = (x) => x) => list.map((x) => `<option value="${x}"${x === cur ? ' selected' : ''}>${f(x)}</option>`).join('');

export function admin(tab = 'products') {
  const t = (k, n) => `<a href="#/admin/${k}"${tab === k ? ' aria-current="page"' : ''}>${n}</a>`;
  let body = '';
  if (tab === 'products') body = `<div class="sech"><h1 style="font-size:clamp(36px,5vw,52px)">Products</h1><button class="btn" data-add>Add product</button></div>
<div class="cd" style="padding:8px 24px 16px">${D.products.map((p) => `<div class="arow" data-pid="${esc(p.id)}"><div class="zm"><img class="ph" src="${esc(p.img)}" alt=""></div>
<input class="in" data-k="name" value="${esc(p.name)}" aria-label="Name"><input class="in" data-k="price" value="${esc(p.price)}" placeholder="Price in KES" aria-label="Price" inputmode="numeric">
<select class="in" data-k="cat" aria-label="Category">${opt(CATS, p.cat, catName)}</select><select class="in" data-k="status" aria-label="Status">${opt(['published', 'draft'], p.status, (x) => x[0].toUpperCase() + x.slice(1))}</select>
<div style="display:flex;gap:8px;grid-column:span 1"><label class="btn2" style="min-height:44px;padding:0 14px;cursor:pointer">Image<input class="vh" type="file" accept="image/*" data-pimg></label><button class="btn2" style="min-height:44px;padding:0 14px" data-del aria-label="Delete ${esc(p.name)}">Delete</button></div>
<textarea class="in" data-k="desc" rows="2" aria-label="Description" placeholder="Description" style="grid-column:1/-1">${esc(p.desc)}</textarea></div>`).join('') || '<p style="padding:24px">No products yet.</p>'}</div>`;
  if (tab === 'images') body = `<h1 style="font-size:clamp(36px,5vw,52px);margin-bottom:24px">Site images</h1><div class="slots">${SLOTS.map(([k, n]) => `<div data-slot="${k}"><div class="zm"><img class="ph" src="${esc(D.settings.images[k])}" alt=""></div><div style="display:flex;justify-content:space-between;align-items:center"><span>${n}</span><label class="ey" style="cursor:pointer;padding:10px 0">Replace<input class="vh" type="file" accept="image/*" data-simg></label></div></div>`).join('')}</div>`;
  if (tab === 'settings') {
    const s = D.settings, f = (k, n, ph = '') => `<label class="f">${n}<input class="in" data-s="${k}" value="${esc(s[k])}" placeholder="${ph}"></label>`;
    body = `<h1 style="font-size:clamp(36px,5vw,52px);margin-bottom:24px">Settings</h1><div class="cd" style="padding:24px;display:grid;gap:16px;max-width:640px">${f('brand', 'Shop name')}${f('tagline', 'Tagline')}${f('whatsapp', 'WhatsApp number with country code', '254700000000')}${f('email', 'Email')}${f('address', 'Address')}${f('hours', 'Opening hours')}<label class="f">Our story<textarea class="in" data-s="story" rows="6">${esc(s.story)}</textarea></label></div>
<h2 style="font-size:36px;margin:40px 0 12px">Backup</h2><div class="row"><button class="btn2" data-export>Download catalog.json</button><label class="btn2" style="cursor:pointer">Import catalog.json<input class="vh" type="file" accept="application/json" data-import></label><button class="btn2" data-reset>Reset to published</button></div>`;
  }
  return `<div class="adm"><aside><a class="logo" href="#/" style="padding:0 16px 16px">${esc(D.settings.brand)}</a>${t('products', 'Products')}${t('images', 'Site images')}${t('settings', 'Settings')}<a href="#/">View site</a><div class="sw" role="radiogroup" aria-label="Theme" style="margin-top:auto">${[['red', '#a8231a'], ['green', '#1f6b3a'], ['dark', '#17110d']].map(([k, c]) => `<input class="vh" type="radio" name="theme" id="t-${k}" value="${k}"><label for="t-${k}"><i style="background:linear-gradient(90deg,${c},#e7a914)"></i></label>`).join('')}</div></aside>
<main>${body}</main><div class="savebar"><span id="dirty" style="color:var(--soft)">All changes saved</span><div class="row"><button class="btn2" data-discard>Discard changes</button><button class="btn" data-save-all>Save changes</button></div></div></div>`;
}
export function bindAdmin(root, toast, rerender) {
  const P = (el) => D.products.find((p) => p.id === el.closest('[data-pid]')?.dataset.pid);
  root.oninput = (e) => {
    const el = e.target;
    if (el.dataset.k) { const p = P(el); if (p) { p[el.dataset.k] = el.value; setDirty(true); } }
    if (el.dataset.s) { D.settings[el.dataset.s] = el.value; setDirty(true); }
  };
  root.onchange = async (e) => {
    const el = e.target;
    try {
      if (el.dataset.k === 'cat' || el.dataset.k === 'status') { P(el)[el.dataset.k] = el.value; setDirty(true); }
      if (el.dataset.pimg && el.files[0]) { const p = P(el); p.img = await shrink(el.files[0]); p.pos = '50% 50%'; setDirty(true); rerender(); }
      if (el.dataset.simg && el.files[0]) { D.settings.images[el.closest('[data-slot]').dataset.slot] = await shrink(el.files[0], 1400); setDirty(true); rerender(); }
      if (el.dataset.import && el.files[0]) { const o = JSON.parse(await el.files[0].text()); if (!o.products || !o.settings) throw new Error('That file is not a catalog export.'); replace(o); setDirty(false); rerender(); toast('Catalog imported'); }
    } catch (err) { toast(err.message, 'error'); }
  };
  root.onclick = async (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.saveAll !== undefined) { persist() ? (setDirty(false), toast('Changes saved')) : toast('Storage is full. Download catalog.json and use smaller images.', 'error'); }
    if (b.dataset.discard !== undefined) { await load(); setDirty(false); rerender(); toast('Changes discarded'); }
    if (b.dataset.add !== undefined) { D.products.unshift({ id: 'p' + Date.now().toString(36), name: 'New piece', cat: 'collars', price: '', status: 'draft', desc: '', materials: '', img: D.settings.images.collars, pos: '50% 50%' }); setDirty(true); rerender(); }
    if (b.dataset.del !== undefined) { const p = P(b); if (p && confirm(`Delete "${p.name}"? This cannot be undone.`)) { D.products.splice(D.products.indexOf(p), 1); setDirty(true); rerender(); } }
    if (b.dataset.export !== undefined) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(D, null, 2)], { type: 'application/json' })); a.download = 'catalog.json'; a.click(); toast('Downloaded. Commit it to data/catalog.json to publish.'); }
    if (b.dataset.reset !== undefined && confirm('Remove your local edits and show the published catalog?')) { reset(); await load(); setDirty(false); rerender(); toast('Reset to published'); }
  };
  window.onbeforeunload = () => (document.getElementById('dirty') && document.getElementById('dirty').textContent.startsWith('You') ? true : undefined);
}
