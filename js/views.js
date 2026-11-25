import { D, saved } from './store.js';
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const CATS = [['collars', 'Collars'], ['cuffs', 'Cuffs'], ['headbands', 'Headbands'], ['shukas', 'Shukas']];
export const catName = (c) => (CATS.find((x) => x[0] === c) || [, c])[1];
const img = (src, alt, pos = '50% 50%') => `<img class="ph" src="${esc(src)}" alt="${esc(alt)}" style="object-position:${esc(pos)}" loading="lazy" decoding="async">`;
const price = (p) => p.price ? `KES ${esc(p.price)}` : 'Ask on WhatsApp';
const wa = (text) => { const n = (D.settings.whatsapp || '').replace(/\D/g, ''); return n ? `https://wa.me/${n}?text=${encodeURIComponent(text)}` : '#/visit'; };
const heartSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21s-7-4.6-9.3-9.2C1 8.3 3 5 6.3 5c2 0 3.3 1.1 4.2 2.4h3C14.4 6.1 15.7 5 17.7 5 21 5 23 8.3 21.3 11.8 19 16.400 12 21 12 21z"/></svg>';
const COLORS = [['#b8281f', 'Red', 'courage'], ['#1f4fa3', 'Blue', 'sky and water'], ['#fbf7ef', 'White', 'peace'], ['#2f7a3b', 'Green', 'the land'], ['#e0761c', 'Orange', 'hospitality'], ['#e7a914', 'Yellow', 'the sun']];

export function shell(route, inner) {
  const s = D.settings, on = (r) => (route === r ? ' aria-current="page"' : '');
  return `<a class="vh" href="#main">Skip to content</a>
<header class="hd"><a class="logo" href="#/">${esc(s.brand)}</a>
<nav class="nav" id="nav" aria-label="Main"><a href="#/shop"${on('shop')}>Shop</a><a href="#/shop/shukas">Shukas</a><a href="#/story"${on('story')}>Our story</a><a href="#/visit"${on('visit')}>Visit</a><a href="#/saved"${on('saved')}>Saved (${saved().length})</a></nav>
<div class="tools"><div class="sw" role="radiogroup" aria-label="Theme">${[['red', 'Red and gold', '#a8231a,#e7a914'], ['green', 'Green and gold', '#1f6b3a,#e7a914'], ['dark', 'Night', '#17110d,#e7a914']].map(([k, t, g]) => `<input class="vh" type="radio" name="theme" id="t-${k}" value="${k}"><label for="t-${k}" title="${t}"><i style="background:linear-gradient(90deg,${g})"></i></label>`).join('')}</div>
<a class="btn wa" href="${wa('Hello, I would like to order from ' + s.brand)}">Order on WhatsApp</a>
<button class="menu" id="menu" aria-label="Menu" aria-expanded="false" aria-controls="nav"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 7h18M3 12h18M3 17h18"/></svg></button></div></header>
<div class="bd"></div><main id="main">${inner}</main>
<footer class="ft"><div class="wrap"><div><a class="logo" href="#/">${esc(s.brand)}</a><p style="margin-top:12px;max-width:300px;color:#d6c6b0">${esc(s.tagline)}, made by hand and sold from Kenya.</p></div>
<div><b>Shop</b>${CATS.map(([k, n]) => `<a href="#/shop/${k}">${n}</a>`).join('')}</div>
<div><b>Learn</b><a href="#/story">Our story</a><a href="#/story#colours">Read the colours</a><a href="#/saved">Saved pieces</a></div>
<div><b>Contact</b><a href="${wa('Hello')}">${esc(s.whatsapp) || 'Add WhatsApp in Admin'}</a>${s.email ? `<a href="mailto:${esc(s.email)}">${esc(s.email)}</a>` : ''}<a href="#/visit">${esc(s.address) || 'Visit page'}</a></div></div></footer>
<div class="bd"></div><div class="ft2"><div class="wrap"><span>© ${new Date().getFullYear()} ${esc(s.brand)}</span><span>Delivery and returns on request</span></div></div>`;
}
const card = (p) => `<div class="cd pc rv"><a href="#/product/${esc(p.id)}"><div class="zm">${img(p.img, p.name, p.pos)}</div><h3>${esc(p.name)}</h3><p>${price(p)}</p></a><button class="heart" data-save="${esc(p.id)}" aria-pressed="${saved().includes(p.id)}" aria-label="Save ${esc(p.name)}">${heartSvg}</button></div>`;
const live = () => D.products.filter((p) => p.status !== 'draft');

export function home() {
  const s = D.settings, im = s.images;
  return `<section class="wrap hero"><div class="stack"><p class="ey rv">${esc(s.tagline)}</p><h1 class="rv" style="--i:1">Worn with meaning, beaded by hand</h1><p class="lead rv" style="--i:2">Shukas, collars, cuffs and headbands from Maasai makers. Every colour and row says something about the person wearing it.</p><div class="row rv" style="--i:3"><a class="btn" href="#/shop">Shop the collection</a><a class="btn2" href="#/story">Meet the makers</a></div></div><div class="zm rv" style="--i:2">${img(im.hero, 'A Maasai couple in red shukas and layered bead collars', '50% 40%')}</div></section>
<section class="wrap sec"><div class="sech"><h2>Shop by piece</h2><a class="ey" href="#/shop">See everything</a></div><div class="grid4">${CATS.map(([k, n], i) => `<a class="tile rv" style="--i:${i}" href="#/shop/${k}"><div class="zm">${img(im[k], n)}</div><h3>${n}</h3></a>`).join('')}</div></section>
<section class="gb sec" id="colours"><div class="wrap"><h2>Read the colours</h2><p style="max-width:560px;margin:12px 0 40px">Beadwork is a language. These are the meanings most often given to each colour. They vary by community and by maker.</p><div class="dots">${COLORS.map(([c, a, b]) => `<div><i style="background:${c}"></i><b style="font-weight:500">${a}</b><br>${b}</div>`).join('')}</div></div></section>
<section class="wrap sec"><div class="sech"><h2>Recently added</h2><a class="ey" href="#/shop">Shop all</a></div><div class="grid3">${live().slice(0, 3).map(card).join('')}</div></section>
<section class="wrap sec split"><div class="zm">${img(im.story, 'Young women in layered beaded collars at sunset', '50% 40%')}</div><div class="stack"><h2>Made by the people who wear it</h2><p class="lead" style="max-width:none">${esc(s.story).slice(0, 220)}</p><a class="btn2" href="#/story" style="justify-self:start">Read our story</a></div></section>`;
}
export function shop(cat) {
  const list = live().filter((p) => !cat || p.cat === cat);
  const chips = [['', 'All'], ...CATS].map(([k, n]) => `<a href="#/shop${k ? '/' + k : ''}"${(cat || '') === k ? ' aria-current="page"' : ''}>${n}</a>`).join('');
  return `<section class="wrap sec"><div class="sech"><div><p class="ey">Beadwork and wear</p><h1 style="font-size:clamp(40px,6vw,72px)">${cat ? catName(cat) : 'Shop everything'}</h1></div><div class="chips">${chips}</div></div>${list.length ? `<div class="grid3">${list.map(card).join('')}</div>` : '<div class="cd empty"><h3>Nothing here yet</h3><a class="btn" href="#/shop">See all pieces</a></div>'}</section>`;
}
export function product(id) {
  const p = D.products.find((x) => x.id === id);
  if (!p || p.status === 'draft') return `<section class="wrap sec"><div class="cd empty"><h2>We could not find that piece</h2><p>It may have been removed.</p><a class="btn" href="#/shop">Back to the shop</a></div></section>`;
  const more = live().filter((x) => x.id !== p.id);
  return `<section class="wrap pd"><div><div class="zm big">${img(p.img, p.name, p.pos)}</div></div><div class="stack"><a class="ey" href="#/shop/${esc(p.cat)}">${catName(p.cat)}</a><h1 style="font-size:clamp(40px,6vw,64px)">${esc(p.name)}</h1><p style="font-size:26px">${price(p)}</p><p class="lead" style="max-width:none">${esc(p.desc)}</p>
<div class="row"><a class="btn" style="flex:1" href="${wa('Hello, I would like to order: ' + p.name)}">Order on WhatsApp</a><button class="btn2" data-save="${esc(p.id)}" aria-pressed="${saved().includes(p.id)}">${saved().includes(p.id) ? 'Saved' : 'Save'}</button></div>
<div class="cd spec"><div><b style="font-weight:500">Materials</b><span>${esc(p.materials) || 'Ask us'}</span></div><div><b style="font-weight:500">Category</b><span>${catName(p.cat)}</span></div></div></div></section>
<section class="wrap sec"><h2 style="margin-bottom:24px">More to explore</h2><div class="grid3">${more.slice(0, 3).map(card).join('')}</div></section>`;
}
export function savedView() {
  const list = live().filter((p) => saved().includes(p.id));
  return `<section class="wrap sec"><h1 style="font-size:clamp(40px,6vw,72px);margin-bottom:28px">Saved pieces</h1>${list.length ? `<div class="grid3">${list.map(card).join('')}</div>` : '<div class="cd empty"><h3>No saved pieces yet</h3><p>Tap the heart on any piece to keep it here.</p><a class="btn" href="#/shop">Browse the shop</a></div>'}</section>`;
}
export function story() {
  const s = D.settings;
  return `<section class="wrap hero"><div class="stack"><p class="ey">Our story</p><h1>Beadwork carries a family's name</h1><p class="lead" style="max-width:none;white-space:pre-line">${esc(s.story)}</p></div><div class="zm">${img(s.images.banner, 'Maasai men in red shukas on the plains', '50% 40%')}</div></section>
<section class="gb sec" id="colours"><div class="wrap"><h2>Read the colours</h2><div class="dots" style="margin-top:32px">${COLORS.map(([c, a, b]) => `<div><i style="background:${c}"></i><b style="font-weight:500">${a}</b><br>${b}</div>`).join('')}</div></div></section>`;
}
export function visit() {
  const s = D.settings;
  return `<section class="wrap sec split" style="align-items:start"><div class="stack"><h1 style="font-size:clamp(40px,6vw,72px)">Visit or message us</h1><p class="lead" style="max-width:none">${esc(s.address) || 'Add your address in Admin, Settings.'}${s.hours ? '<br>' + esc(s.hours) : ''}</p><a class="btn" href="${wa('Hello')}" style="justify-self:start">Message on WhatsApp</a></div>
<form class="cd" id="contact"><label class="f">Name<input class="in" name="n" required autocomplete="name"></label><label class="f">Phone or email<input class="in" name="c" required></label><label class="f">Message<textarea class="in" name="m" rows="5" required></textarea></label><button class="btn" type="submit">Send enquiry</button></form></section>`;
}
export function notFound() { return `<section class="wrap sec"><div class="cd empty"><h2>That page does not exist</h2><a class="btn" href="#/">Go home</a></div></section>`; }
