# Enkang: Maasai cultural wear and beadwork

Vanilla JS single-page app (ES modules, hash routing). No build step, no dependencies.

## Run locally
    python3 -m http.server 8080      # then open http://localhost:8080

## Deploy to GitHub Pages
1. Push this folder to a repo (the files in the repo root).
2. Settings → Pages → Deploy from a branch → `main` / `(root)`.
3. Open the URL GitHub gives you. Routes use `#/`, so no server config is needed.

## Structure
    index.html          shell, pre-paint theme script, loader
    css/                fonts.css (self-hosted), app.css (themes, layout, motion)
    js/store.js         catalog loading, saved pieces, image shrinking
    js/views.js         public pages: home, shop, product, saved, story, visit
    js/admin.js         admin: products, site images, settings, backup
    js/main.js          router, theme switcher, loader, reveal, events
    data/catalog.json   the published catalog (products, settings, site images)
    sw.js               service worker (images and fonts cache-first)

## Routes
`#/` · `#/shop/:category?` · `#/product/:id` · `#/saved` · `#/story` · `#/visit` · `#/admin/products|images|settings`

## Admin on GitHub Pages: read this
GitHub Pages is static, so the admin cannot write to your repo. Edits are saved in **your browser only**.
To publish them: Admin → Settings → **Download catalog.json**, replace `data/catalog.json` in the repo, commit, push.
Anyone can open `#/admin`, but their edits stay on their own device and never reach other visitors.
Uploaded images are shrunk and stored inside the exported JSON. For larger catalogs, put image files in
`public/images/` and set their paths in `catalog.json`. For a real shared admin with logins, you need a backend.

## Before launch
- Replace the placeholder photos in `public/images/` with your own (the sample photos are reference images).
- Set the WhatsApp number, address and story in Admin, Settings. Add prices (empty price shows "Ask on WhatsApp").
- ENKANG is a working name: search and replace it, and update the title and description in `index.html`.
