// Data layer: catalog.json is the published source of truth; admin edits live in localStorage until exported.
const KEY = 'pty:data', CK = 'pty:cart';
export let D = null;
const rd = (k, f) => { try { return JSON.parse(localStorage.getItem(k)) ?? f; } catch { return f; } };
export async function load() {
  const o = rd(KEY, null);
  D = o && o.products ? o : await (await fetch('data/catalog.json', { cache: 'no-cache' })).json();
  D.orders ??= []; D.gallery ??= [];
  return D;
}
export const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(D)); return true; } catch { return false; } };
export const reset = () => { try { localStorage.removeItem(KEY); } catch {} };
export const replace = (o) => { D = o; D.orders ??= []; D.gallery ??= []; return persist(); };
export const cat = (id) => D.categories.find((c) => c.id === id) || { id, name: id };
export const live = () => D.products.filter((p) => p.status === 'published');
export const byId = (id) => D.products.find((p) => String(p.id) === String(id));
// Cart (kept per device)
let cart = rd(CK, {});
const emit = () => { try { localStorage.setItem(CK, JSON.stringify(cart)); } catch {} document.dispatchEvent(new CustomEvent('cart')); };
export const cartItems = () => Object.keys(cart).map((k) => [byId(k), cart[k]]).filter((x) => x[0] && x[0].status === 'published' && x[0].stock > 0);
export const cartCount = () => cartItems().reduce((a, x) => a + x[1], 0);
export const cartTotal = () => cartItems().reduce((a, [p, q]) => a + (p.price ? p.price * q : 0), 0);
export function addItem(id, q = 1) { const p = byId(id); if (!p || p.stock < 1) return 0; cart[id] = Math.min(p.stock, (cart[id] || 0) + q); emit(); return cart[id]; }
export function setQty(id, q) { const p = byId(id); if (!p) return; q = Math.min(p.stock, q); if (q < 1) delete cart[id]; else cart[id] = q; emit(); }
export const clearCart = () => { cart = {}; emit(); };
export const placeOrder = (o) => { D.orders.unshift(o); persist(); };
export const nextOrderId = () => String(Math.max(1000, ...D.orders.map((o) => +o.id || 0)) + 1);
// Shrinks an uploaded photo so it fits in browser storage.
export function shrink(file, max = 900) {
  return new Promise((ok, no) => {
    const img = new Image(), url = URL.createObjectURL(file);
    img.onload = () => { const k = Math.min(1, max / Math.max(img.width, img.height)), c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url); ok(c.toDataURL('image/jpeg', .78)); };
    img.onerror = () => no(new Error('That file is not an image the browser can read.'));
    img.src = url;
  });
}
