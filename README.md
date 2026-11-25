# Peggy’s Timber Yard

Vanilla JS single-page app (ES modules, hash routing). No build step, no dependencies.

## Run locally
    python3 -m http.server 8080      # then open http://localhost:8080
Open it through a server, not by double-clicking index.html (the catalog is loaded with fetch).

## Deploy to GitHub Pages
1. Push this folder to a repo (files in the repo root).
2. Settings → Pages → Deploy from a branch → `main` / `(root)`.
Routes use `#/`, so no server config is needed. Any static host works the same way.

## Structure
    index.html          shell, pre-paint theme script
    css/                fonts.css (self-hosted Fraunces, Manrope, IBM Plex Mono), app.css (themes, layout, cart drawer, admin)
    js/store.js         catalog loading, cart, orders, image shrinking
    js/views.js         public pages and the header/footer shell
    js/cart.js          cart sidebar: order list, collect/deliver, WhatsApp checkout
    js/admin.js         admin: overview, products, orders, gallery, settings, backup
    js/ui.js            icons, toast, button wait state, formatting
    js/main.js          router, theme, loading skeleton, lightbox, events
    data/catalog.json   the published catalog (settings, categories, products, gallery, orders)
    sw.js               service worker (images and fonts cache-first)

## Routes
`#/` · `#/shop/:category?` · `#/product/:id` · `#/about` · `#/gallery/:group?` · `#/visit` · `#/admin/overview|products|orders|gallery|settings|backup`

## Admin on static hosting: read this
Static hosting cannot write to your repo, so admin edits (products, stock, gallery, settings) and orders are saved in **your browser only**.
To publish edits: Admin → Backup → **Download catalog.json**, replace `data/catalog.json`, commit and push.
Anyone can open `#/admin`, and orders placed by customers are stored on the customer’s own device, not sent to you.
**Orders reach the yard through WhatsApp** (the customer taps “Send on WhatsApp”). A real shared admin with logins and a central order inbox needs a backend.

## Before launch
- Admin → Settings: set the WhatsApp number (country code, digits only), address, hours and the real story. Without a number, checkout runs in demo mode.
- Prices, stock levels, the three sample orders in `data/catalog.json` and the “Staff sign in” link are demo content. Clear `orders` in the JSON before going live.
- Two photos (`fence-posts.jpg`, `building-poles.jpg`) carry another company’s watermark. Replace them with your own photos.
