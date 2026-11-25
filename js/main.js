import { load, D, toggleSaved } from './store.js';
import * as V from './views.js';
import { admin, bindAdmin, setDirty } from './admin.js';
const app = document.getElementById('app'), toastEl = document.getElementById('toast');
let tt;
const toast = (t, kind = '') => { toastEl.textContent = t; toastEl.className = 'on ' + kind; clearTimeout(tt); tt = setTimeout(() => (toastEl.className = ''), kind ? 5000 : 2600); };
const theme = () => document.documentElement.getAttribute('data-theme');
function initTheme() {
  const r = app.querySelector(`#t-${theme()}`); if (r) r.checked = true;
  app.querySelectorAll('input[name=theme]').forEach((i) => (i.onchange = () => { document.documentElement.setAttribute('data-theme', i.value); try { localStorage.setItem('enkang:theme', i.value); } catch {} }));
}
let io;
function reveal() {
  const els = app.querySelectorAll('.rv'); if (!els.length) return;
  if (!('IntersectionObserver' in window)) return els.forEach((e) => e.classList.add('in'));
  io = io || new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .1 });
  els.forEach((e) => io.observe(e));
}
function route() {
  const [r = '', a = ''] = location.hash.replace(/^#\/?/, '').split('#')[0].split('/');
  const TITLES = { '': 'Maasai cultural wear and beadwork', shop: 'Shop', story: 'Our story', visit: 'Visit', saved: 'Saved', admin: 'Admin' };
  let html;
  if (r === 'admin') html = admin(a || 'products');
  else {
    const view = { '': () => V.home(), shop: () => V.shop(a), product: () => V.product(a), saved: () => V.savedView(), story: () => V.story(), visit: () => V.visit() }[r];
    html = V.shell(r || 'home', view ? view() : V.notFound());
  }
  app.innerHTML = html;
  document.title = `${(r === 'product' && D.products.find((p) => p.id === a)?.name) || TITLES[r] || 'Not found'} · ${D.settings.brand}`;
  initTheme(); reveal();
  if (r === 'admin') { setDirty(false); bindAdmin(app, toast, route); } else { window.onbeforeunload = null; }
  if (!location.hash.includes('#colours')) window.scrollTo(0, 0); else document.getElementById('colours')?.scrollIntoView();
  bindPublic();
}
function bindPublic() {
  const m = app.querySelector('#menu'), n = app.querySelector('#nav');
  if (m) m.onclick = () => { const o = n.classList.toggle('open'); m.setAttribute('aria-expanded', o); };
  app.querySelectorAll('[data-save]').forEach((b) => (b.onclick = (e) => {
    e.preventDefault(); const on = toggleSaved(b.dataset.save);
    b.setAttribute('aria-pressed', on); if (b.classList.contains('btn2')) b.textContent = on ? 'Saved' : 'Save';
    toast(on ? 'Saved' : 'Removed from saved');
    const link = app.querySelector('a[href="#/saved"]'); if (link) link.textContent = `Saved (${JSON.parse(localStorage.getItem('enkang:saved') || '[]').length})`;
  }));
  const f = app.querySelector('#contact');
  if (f) f.onsubmit = (e) => {
    e.preventDefault(); const d = new FormData(f), msg = `Hello, I am ${d.get('n')} (${d.get('c')}). ${d.get('m')}`, num = (D.settings.whatsapp || '').replace(/\D/g, '');
    if (!num) return toast('Add the shop WhatsApp number in Admin, Settings, so enquiries can be sent.', 'error');
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  };
}
function endLoader() {
  const l = document.getElementById('loader'); if (!l) return;
  if (document.documentElement.classList.contains('no-loader')) return l.remove();
  setTimeout(() => { l.classList.add('out'); setTimeout(() => l.remove(), 800); try { sessionStorage.setItem('enkang:seen', '1'); } catch {} }, 1700);
}
load().then(() => { route(); endLoader(); }).catch(() => { app.innerHTML = '<p style="padding:24px">The shop could not load its catalog. Check your connection and refresh.</p>'; document.getElementById('loader')?.remove(); });
addEventListener('hashchange', () => D && route());
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
