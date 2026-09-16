# AutoTrade — Public Website

The public marketing, pricing, and download website for AutoTrade. This site is
**static** (plain HTML/CSS/JS, no build step, no server) and is designed to be
hosted directly on GitHub Pages.

The AutoTrade **trading functionality lives in the separate Windows desktop
application** — this website only markets the product, takes payment via
Stripe, and hosts the download/account information. Nothing here executes
trades.

---

## File structure

```
AutoTrade/
├── index.html              Home / landing page
├── features.html           Features
├── pricing.html             Pricing (Core / Pro / Elite)
├── how-it-works.html        How it works + architecture diagram
├── download.html            Windows app download + install steps
├── faq.html                  FAQ
├── terms.html                 Terms of Service (draft placeholder)
├── privacy.html               Privacy Policy (draft placeholder)
├── risk-disclosure.html       Risk Disclosure
├── 404.html                    Custom 404 page (GitHub Pages picks this up automatically)
├── css/
│   └── style.css             Entire design system + all page styles
├── js/
│   ├── config.js             ⭐ ALL configurable values live here (Stripe links, download URL, launch promo, pricing data)
│   ├── components.js         Shared header/footer, injected on every page
│   └── main.js                Nav behavior, scroll reveal, pricing rendering, FAQ accordion, dashboard animations
├── assets/
│   └── favicon.svg           Site icon / logo mark
├── robots.txt
├── .nojekyll                  Tells GitHub Pages not to run Jekyll processing
└── README.md
```

There is no framework, package.json, or build step. Every `.html` file is a
real, complete page — GitHub Pages serves them as-is.

---

## Running locally

Because the header/footer are injected by JavaScript (`components.js`), the
site needs to be served over `http://`, not opened directly via `file://`
(some browsers block script behavior on `file://`). Any static file server
works:

```bash
cd AutoTrade

# Option 1: Python (already on most systems)
python3 -m http.server 8000

# Option 2: Node, if you have it installed (dev-only, not required to deploy)
npx serve .
```

Then open `http://localhost:8000` in your browser.

Test at a few widths (desktop, tablet ~768px, mobile ~390px) and confirm:
- The hamburger menu opens/closes on mobile
- Pricing cards render from `js/config.js`
- FAQ accordion expands/collapses
- Dashboard mockup animates in on the homepage

---

## Deploying to GitHub Pages

1. Create the GitHub repository (e.g. `AutoTrade`) and push this project to
   the `main` branch (see "Updating the site" below for exact commands).
2. In the repository on GitHub: **Settings → Pages**.
3. Under "Build and deployment", set **Source** to `Deploy from a branch`.
4. Choose the `main` branch and `/ (root)` folder, then **Save**.
5. GitHub will publish the site at `https://<your-username>.github.io/AutoTrade/`
   within a minute or two.
6. If you're using a custom domain, add it under **Settings → Pages → Custom
   domain** — GitHub will create a `CNAME` file for you automatically.

No build step, no GitHub Actions workflow, and no Node.js runtime are
required — the repository *is* the deployed site.

---

## Placeholders you need to replace

Everything below lives in **`js/config.js`** — this is the one file you edit
for all of these:

| Placeholder | What it is | Where it's used |
|---|---|---|
| `STRIPE_CORE_URL` | Stripe Checkout/Payment Link URL for the Core plan | "Get Core" button |
| `STRIPE_PRO_URL` | Stripe Checkout/Payment Link URL for the Pro plan | "Get Pro" button |
| `STRIPE_ELITE_URL` | Stripe Checkout/Payment Link URL for the Elite plan | "Get Elite" button |
| `WINDOWS_DOWNLOAD_URL` | Direct URL to the AutoTrade `.exe` installer | "Download for Windows" button on the Download page |
| `appVersion` | Current app version string (e.g. `"1.0.0"`) | Download page |
| `appPlatforms` | Supported OS string (e.g. `"Windows 10 / Windows 11"`) | Download page |
| `social.twitter` / `social.discord` / `social.github` | Social links | Footer icons |

Also review these placeholder/draft sections directly in the HTML (clearly
marked with a dashed "Placeholder notice" box):

- `faq.html` — supported broker list, cancellation flow details, "does AutoTrade need my computer running" answer, support contact
- `terms.html`, `privacy.html` — legal entity name, business address, contact details, final cancellation/refund policy, data retention specifics (these are **draft/legal-placeholder language** — have a qualified attorney review before publishing as final)

### Where to paste your Stripe payment links

Open `js/config.js` and replace the three string values at the top:

```js
stripeCoreUrl: "STRIPE_CORE_URL",   // → e.g. "https://buy.stripe.com/xxxxx"
stripeProUrl: "STRIPE_PRO_URL",     // → e.g. "https://buy.stripe.com/yyyyy"
stripeEliteUrl: "STRIPE_ELITE_URL", // → e.g. "https://buy.stripe.com/zzzzz"
```

The pricing cards on both `index.html` and `pricing.html` are rendered from
this same config, so you only need to update it once. Never put a Stripe
**secret key** here — only the public Checkout/Payment Link URL.

### Where to paste the Windows `.exe` download link

Open `js/config.js` and replace:

```js
windowsDownloadUrl: "WINDOWS_DOWNLOAD_URL", // → e.g. "https://cdn.example.com/AutoTradeSetup.exe"
```

This automatically updates the "Download for Windows" button on
`download.html`.

### Turning on the launch promotion

In `js/config.js`:

```js
launchPromoEnabled: false, // set to true to activate
```

When `true`:
- Pro shows $25 crossed out → $20/mo, with a "Launch Offer" badge
- Elite shows $50 crossed out → $40/mo, with a "Launch Offer" badge
- A banner appears above the pricing cards

When `false`, standard pricing is shown with no promo messaging. No other
code changes are needed to toggle this.

---

## Updating the site later

Because this is a plain static site, updates are just file edits + a normal
git push:

```bash
git add .
git commit -m "Update pricing copy"
git push origin main
```

GitHub Pages automatically rebuilds and republishes within a minute or two
of any push to the configured branch. To add a new page, copy the structure
of an existing `.html` file (same `<head>`, same `#header-mount` /
`#footer-mount` divs, same three `<script>` tags at the bottom) and add a
link to it in `js/components.js`'s `NAV_LINKS` array so it shows up in the
nav automatically on every page.

---

## Design system reference

All colors, spacing, and animation timing are defined as CSS custom
properties at the top of `css/style.css`:

- Brand: `--color-primary` (#19D3AE), `--color-accent` (#5EEAD4)
- Backgrounds: `--color-bg`, `--color-bg-alt`, `--color-card`
- Text: `--color-text`, `--color-text-muted`
- Status: `--color-success`, `--color-warning`, `--color-danger`

Animations respect `prefers-reduced-motion` throughout.
