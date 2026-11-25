// Data layer: catalog.json is the source of truth; admin edits live in localStorage until exported.
const KEY = 'enkang:data', SAVED = 'enkang:saved';
export let D = null;
export async function load() {
  try { const o = JSON.parse(localStorage.getItem(KEY)); if (o && o.products) { D = o; return D; } } catch {}
  D = await (await fetch('data/catalog.json', { cache: 'no-cache' })).json();
  return D;
}
export function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(D)); return true; } catch { return false; }
}
export function reset() { localStorage.removeItem(KEY); }
export function replace(obj) { D = obj; return persist(); }
export const saved = () => { try { return JSON.parse(localStorage.getItem(SAVED)) || []; } catch { return []; } };
export function toggleSaved(id) {
  const s = saved(), i = s.indexOf(id);
  i < 0 ? s.push(id) : s.splice(i, 1);
  try { localStorage.setItem(SAVED, JSON.stringify(s)); } catch {}
  return i < 0;
}
// Shrinks an uploaded photo so it fits in browser storage.
export function shrink(file, max = 900) {
  return new Promise((ok, no) => {
    const img = new Image(), url = URL.createObjectURL(file);
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height)), c = document.createElement('canvas');
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url); ok(c.toDataURL('image/jpeg', .78));
    };
    img.onerror = () => no(new Error('That file is not an image the browser can read.'));
    img.src = url;
  });
}
