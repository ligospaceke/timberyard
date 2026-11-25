// Cart sidebar: a slide-in drawer with the order list, delivery choice and WhatsApp checkout.
import { D, cartItems, cartCount, cartTotal, setQty, clearCart, placeOrder, nextOrderId } from './store.js';
import { esc, kes, ic, toast, busy } from './ui.js';
let el, ov, last, done = null;
const f = { mode: 'collect', name: '', phone: '', loc: '' };
const inert = (on) => ['hd', 'app', 'ft'].forEach((i) => { const n = document.getElementById(i); if (n) on ? n.setAttribute('inert', '') : n.removeAttribute('inert'); });
export const isOpen = () => el.classList.contains('on');
export function init() {
  ov = document.createElement('div'); ov.className = 'ov';
  el = document.createElement('aside'); el.className = 'dr'; el.id = 'drawer'; el.tabIndex = -1;
  el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', 'Your order list');
  document.body.append(ov, el);
  ov.onclick = close;
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && isOpen()) close(); });
  document.addEventListener('cart', () => { badge(); if (isOpen() && !done) render(); });
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-cart-open],[data-cart-close],[data-cq],[data-crm],[data-shop]'); if (!t) return;
    if (t.matches('[data-cart-open]')) open();
    else if (t.matches('[data-cart-close]')) close();
    else if (t.matches('[data-shop]')) { close(); location.hash = '#/shop'; }
    else if (t.matches('[data-cq]')) { const [id, d] = t.dataset.cq.split(':'), it = cartItems().find((x) => String(x[0].id) === id); if (!it) return; if (d > 0 && it[1] >= it[0].stock) return toast('Only ' + it[0].stock + ' in stock'); setQty(id, it[1] + +d); }
    else if (t.matches('[data-crm]')) setQty(t.dataset.crm, 0);
  });
  el.addEventListener('input', (e) => { if (e.target.name in f) { f[e.target.name] = e.target.value; e.target.classList.remove('bad'); } if (e.target.name === 'mode') render(); });
  el.addEventListener('submit', send);
  badge(); render();
}
function badge() { const n = cartCount(), c = document.getElementById('cc'); if (c) { c.textContent = n || ''; c.dataset.n = n; } }
export function open() { last = document.activeElement; render(); el.classList.add('on'); ov.classList.add('on'); document.body.classList.add('lock'); inert(true); setTimeout(() => el.focus(), 30); }
export function close() { el.classList.remove('on'); ov.classList.remove('on'); document.body.classList.remove('lock'); inert(false); if (done) { done = null; render(); } if (last && last.focus) last.focus(); }
const head = `<div class="dh"><h2>Your order</h2><button class="ib" data-cart-close aria-label="Close order list">${ic('x')}</button></div>`;
function render() {
  const it = cartItems();
  if (done) { const wa = D.settings.whatsapp; el.innerHTML = `${head}<div class="db"><div class="emp"><div class="ok">${ic('check', 22)}</div><h2>Order #${done.id} received</h2><p class="soft">${wa ? 'Send it on WhatsApp so we can confirm the sizes and delivery.' : 'Demo mode: add the yard’s WhatsApp number in Admin, Settings so orders can be sent.'}</p>${wa ? `<a class="btn" target="_blank" rel="noopener" href="https://wa.me/${esc(wa)}?text=${encodeURIComponent(message(done))}">Send on WhatsApp</a>` : ''}<button class="b2" data-cart-close>Continue shopping</button></div></div>`; return; }
  if (!it.length) { el.innerHTML = `${head}<div class="db"><div class="emp">${ic('bag', 28)}<h2 style="font-size:22px">Your order list is empty</h2><p class="soft">Add timber from the shop and it will show up here</p><button class="btn" data-shop>Browse timber</button></div></div>`; return; }
  el.innerHTML = `${head}<form class="dform" id="cf" novalidate><div class="db">${it.map(([p, q]) => `<div class="li"><div class="im"><img src="${esc(p.img)}" alt="" loading="lazy"></div><div><h3>${esc(p.name)}</h3><span class="tg">${esc(p.size)}</span><div class="ctl"><div class="qty"><button type="button" data-cq="${p.id}:-1" aria-label="Fewer ${esc(p.name)}">−</button><span class="num">${q}</span><button type="button" data-cq="${p.id}:1" aria-label="More ${esc(p.name)}">+</button></div><button type="button" class="ib" data-crm="${p.id}" aria-label="Remove ${esc(p.name)}" style="width:32px;height:32px">${ic('trash', 16)}</button></div></div><div class="num pr" style="align-self:start">${p.price ? kes(p.price * q) : 'Ask'}</div></div>`).join('')}
<div style="display:grid;gap:16px;padding-top:24px"><div class="seg" role="radiogroup" aria-label="Collection"><label><input type="radio" name="mode" value="collect" ${f.mode === 'collect' ? 'checked' : ''}><span>Collect at yard</span></label><label><input type="radio" name="mode" value="deliver" ${f.mode === 'deliver' ? 'checked' : ''}><span>Deliver to site</span></label></div>
${f.mode === 'deliver' ? `<label class="fld">Delivery location<input class="inp" name="loc" value="${esc(f.loc)}" placeholder="Town, road or landmark"></label>` : ''}
<label class="fld">Name<input class="inp" name="name" value="${esc(f.name)}" autocomplete="name"></label><label class="fld">Phone<input class="inp" name="phone" type="tel" value="${esc(f.phone)}" autocomplete="tel"></label></div></div>
<div class="df"><div class="rw"><span class="soft">Estimated total</span><b class="num" style="font:500 22px var(--fh)">${kes(cartTotal())}</b></div><button class="btn" type="submit">Send order on WhatsApp</button><p class="mut" style="font-size:12px;text-align:center">Delivery is quoted separately. Prices are confirmed on WhatsApp</p></div></form>`;
}
const message = (o) => `Hello ${D.settings.brand}, I would like to order:\n${o.items.map((i) => `- ${i.qty} × ${i.name} (${i.size})`).join('\n')}\nTotal: ${kes(o.total)}\n${o.mode === 'deliver' ? 'Deliver to: ' + (o.loc || 'to be agreed') : 'I will collect at the yard'}\nName: ${o.who}\nPhone: ${o.phone}\nOrder #${o.id}`;
function send(e) {
  e.preventDefault();
  const bad = [['name', !f.name.trim()], ['phone', f.phone.replace(/\D/g, '').length < 9], ['loc', f.mode === 'deliver' && !f.loc.trim()]].filter((x) => x[1]);
  if (bad.length) { bad.forEach(([n]) => el.querySelector(`[name=${n}]`)?.classList.add('bad')); el.querySelector(`[name=${bad[0][0]}]`)?.focus(); return toast(bad[0][0] === 'phone' ? 'Enter a phone number we can reach' : 'Please fill in the highlighted field'); }
  busy(e.submitter || el.querySelector('.df .btn'), 'Sending…', 1100, () => {
    const it = cartItems(), o = { id: nextOrderId(), who: f.name.trim(), phone: f.phone.trim(), items: it.map(([p, q]) => ({ id: p.id, name: p.name, size: p.size, qty: q, price: p.price })), total: cartTotal(), mode: f.mode, loc: f.mode === 'deliver' ? f.loc.trim() : '', status: 'New', date: new Date().toISOString() };
    placeOrder(o); done = o; clearCart(); render();
  });
}
