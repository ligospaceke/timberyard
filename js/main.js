import * as S from './store.js';
import { V, shell, shopGrid } from './views.js';
import * as cart from './cart.js';
import * as admin from './admin.js';
import { ic, toast, busy, esc } from './ui.js';
const $ = (s) => document.querySelector(s), app = $('#app'), H = document.documentElement;
const TITLES = { '': 'Timber for building, fencing and roofing', shop: 'Shop timber', product: 'Timber', about: 'Our story', gallery: 'Gallery', visit: 'Visit and delivery', admin: 'Admin' };
const skel = () => '<div class="w sk" aria-busy="true"><i class="a"></i><i></i><div class="b"><i></i><i></i><i></i><i></i></div></div>';
let T, first = true;
function paintShell() { const s = shell(); $('#hd').innerHTML = s.header; $('#ft').innerHTML = s.footer; themeIcon(); mark(); }
const themeIcon = () => { const b = $('#th'); if (b) b.innerHTML = ic(H.dataset.theme === 'dark' ? 'sun' : 'moon'); };
const route = () => { const [r = '', a] = location.hash.slice(2).split('/'); return [r, a]; };
function mark() { const [r] = route(); document.querySelectorAll('#nav a').forEach((x) => (x.dataset.r === r ? x.setAttribute('aria-current', 'page') : x.removeAttribute('aria-current'))); }
function draw(quick) {
  const [r, a] = route(), html = r === 'admin' ? admin.render(a) : (V[r || 'home'] || V.notfound)(a);
  app.innerHTML = html; app.classList.remove('in'); if (!quick) { void app.offsetWidth; app.classList.add('in'); app.focus({ preventScroll: true }); }
  const p = r === 'product' && S.byId(a); document.title = (p ? p.name : TITLES[r] || 'Page not found') + ' · ' + S.D.settings.brand;
}
function go(quick) {
  const [r] = route(); document.body.classList.toggle('adm', r === 'admin'); mark(); $('#nav')?.classList.remove('open'); $('#menu')?.setAttribute('aria-expanded', 'false');
  clearTimeout(T); if (quick) return draw(true);
  app.innerHTML = skel(); scrollTo(0, 0);
  T = setTimeout(() => draw(), first ? 700 : 380); first = false;
}
async function boot() {
  try { await S.load(); } catch { app.innerHTML = '<div class="w s"><h2>The catalog could not load</h2><p class="soft" style="margin-top:12px">Open the site through a web server (for example python3 -m http.server) instead of double-clicking index.html</p></div>'; return; }
  paintShell(); cart.init(); admin.init(app, () => go(true));
  document.addEventListener('site-updated', () => { paintShell(); go(true); });
  addEventListener('hashchange', () => go());
  document.addEventListener('click', (e) => {
    const t = e.target.closest('#th,#menu,[data-add],[data-q],[data-lb]'); if (!t) return;
    if (t.id === 'th') { const n = H.dataset.theme === 'dark' ? 'light' : 'dark'; H.dataset.theme = n; try { localStorage.setItem('pty:theme', n); } catch {} themeIcon(); }
    else if (t.id === 'menu') { const o = $('#nav').classList.toggle('open'); t.setAttribute('aria-expanded', o); }
    else if (t.dataset.q) { const n = $('#qn'), v = Math.max(1, Math.min(+n.dataset.max || 1, +n.textContent + +t.dataset.q)); n.textContent = v; }
    else if (t.hasAttribute('data-add')) { const q = t.hasAttribute('data-qn') ? +$('#qn').textContent : 1; busy(t, 'Adding…', 450, () => { const n = S.addItem(t.dataset.add, q); if (!n) return toast('That item is out of stock'); cart.open(); }); }
    else if (t.dataset.lb !== undefined) lightbox(+t.dataset.lb, [...app.querySelectorAll('[data-lb]')].map((b) => +b.dataset.lb));
  });
  app.addEventListener('input', (e) => { if (e.target.id === 'q') $('#gr').innerHTML = shopGrid(e.target.dataset.cat, e.target.value); });
  go();
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
}
function lightbox(i, list) {
  let k = list.indexOf(i); const d = document.createElement('dialog'); d.className = 'lb';
  const paint = () => { const g = S.D.gallery[list[k]]; d.innerHTML = `<img src="${esc(g.img)}" alt="${esc(g.cap)}"><div class="rw" style="padding:12px 16px"><span>${esc(g.cap)}</span><span class="row" style="gap:4px"><button class="ib" data-n="-1" aria-label="Previous photo">${ic('left')}</button><button class="ib" data-n="1" aria-label="Next photo">${ic('right')}</button><button class="ib" data-n="0" aria-label="Close">${ic('x')}</button></span></div>`; };
  const step = (n) => { if (!n) return d.close(); k = (k + n + list.length) % list.length; paint(); };
  d.onclick = (e) => { const b = e.target.closest('[data-n]'); if (b) step(+b.dataset.n); else if (e.target === d) d.close(); };
  d.onkeydown = (e) => { if (e.key === 'ArrowLeft') step(-1); if (e.key === 'ArrowRight') step(1); };
  d.onclose = () => d.remove(); paint(); document.body.append(d); d.showModal();
}
boot();
