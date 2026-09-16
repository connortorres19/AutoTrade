/**
 * Shared header/footer markup, injected on every page.
 *
 * This keeps the nav and footer identical across all pages without a
 * build step or server-side includes (which don't work over file:// or
 * plain GitHub Pages hosting without extra config).
 */

(function () {
  const LOGO_MARK = `
    <svg class="nav-logo-mark" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="28" height="28" rx="7" fill="#19D3AE"/>
      <path d="M6.5 17.5L11.5 12L15 15.5L21.5 8.5" stroke="#06110E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M17 8.5H21.5V13" stroke="#06110E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;

  const NAV_LINKS = [
    { href: "index.html", label: "Home" },
    { href: "features.html", label: "Features" },
    { href: "pricing.html", label: "Pricing" },
    { href: "how-it-works.html", label: "How It Works" },
    { href: "download.html", label: "Download" },
    { href: "faq.html", label: "FAQ" },
  ];

  function currentPage() {
    const path = window.location.pathname.split("/").pop();
    return path === "" ? "index.html" : path;
  }

  function renderHeader() {
    const active = currentPage();
    const links = NAV_LINKS.map(
      (link) =>
        `<a href="${link.href}"${link.href === active ? ' class="is-active" aria-current="page"' : ""}>${link.label}</a>`
    ).join("");

    return `
      <a class="skip-link" href="#main">Skip to content</a>
      <header class="site-header" id="site-header">
        <div class="container nav">
          <a href="index.html" class="nav-logo">
            ${LOGO_MARK}
            AutoTrade
          </a>
          <nav class="nav-links" id="nav-links" aria-label="Primary">
            ${links}
          </nav>
          <div class="nav-actions">
            <a href="download.html" class="btn btn-secondary">Download</a>
            <a href="pricing.html" class="btn btn-primary">Get Started</a>
            <button class="nav-toggle" id="nav-toggle" aria-label="Toggle menu" aria-expanded="false" aria-controls="nav-links">
              <span class="nav-toggle-icon"></span>
            </button>
          </div>
        </div>
      </header>
    `;
  }

  function renderFooter() {
    const year = new Date().getFullYear();
    return `
      <footer class="site-footer">
        <div class="container">
          <div class="footer-grid">
            <div class="footer-brand">
              <a href="index.html" class="nav-logo">
                ${LOGO_MARK}
                AutoTrade
              </a>
              <p>Automated Trading. Simplified.</p>
              <div class="footer-social">
                <a href="${CONFIG.social.twitter}" aria-label="AutoTrade on X (Twitter)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 4L20 20M20 4L4 20" stroke="currentColor" stroke-width="0"/><path d="M18.9 2H21.6L15.6 8.9L22.7 18.3H17.2L12.9 12.6L8 18.3H5.3L11.7 10.9L4.9 2H10.6L14.4 7.2L18.9 2Z" fill="currentColor"/></svg>
                </a>
                <a href="${CONFIG.social.discord}" aria-label="AutoTrade on Discord">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 6.5C18.6 5.8 17.1 5.3 15.5 5C15.3 5.4 15.1 5.9 14.9 6.3C13.2 6 11.5 6 9.9 6.3C9.7 5.9 9.5 5.4 9.3 5C7.7 5.3 6.2 5.8 4.8 6.5C2.4 10.1 1.7 13.6 2 17.1C3.8 18.4 5.5 19.2 7.2 19.7C7.6 19.1 8 18.5 8.3 17.8C7.7 17.6 7.1 17.3 6.6 17C6.7 16.9 6.8 16.8 6.9 16.7C10.1 18.2 13.6 18.2 16.8 16.7C16.9 16.8 17 16.9 17.1 17C16.6 17.3 16 17.6 15.4 17.8C15.7 18.5 16.1 19.1 16.5 19.7C18.2 19.2 19.9 18.4 21.7 17.1C22.1 13 21.1 9.6 20 6.5ZM8.7 15C7.7 15 6.9 14.1 6.9 13C6.9 11.9 7.7 11 8.7 11C9.7 11 10.6 11.9 10.5 13C10.5 14.1 9.7 15 8.7 15ZM15.3 15C14.3 15 13.5 14.1 13.5 13C13.5 11.9 14.3 11 15.3 11C16.3 11 17.1 11.9 17.1 13C17.1 14.1 16.3 15 15.3 15Z" fill="currentColor"/></svg>
                </a>
                <a href="${CONFIG.social.github}" aria-label="AutoTrade on GitHub">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.48 2 2 6.58 2 12.2C2 16.7 4.87 20.5 8.84 21.85C9.34 21.94 9.5 21.63 9.5 21.37C9.5 21.13 9.5 20.4 9.49 19.5C6.73 20.11 6.14 18.14 6.14 18.14C5.68 16.96 5.03 16.65 5.03 16.65C4.12 16.02 5.1 16.03 5.1 16.03C6.1 16.1 6.63 17.07 6.63 17.07C7.5 18.6 8.94 18.15 9.5 17.9C9.59 17.25 9.85 16.81 10.13 16.56C7.93 16.31 5.62 15.45 5.62 11.55C5.62 10.44 6 9.54 6.65 8.84C6.55 8.58 6.2 7.55 6.75 6.15C6.75 6.15 7.6 5.88 9.48 7.17C10.28 6.94 11.13 6.83 11.98 6.83C12.83 6.83 13.68 6.94 14.48 7.17C16.36 5.87 17.21 6.15 17.21 6.15C17.76 7.55 17.41 8.58 17.31 8.84C17.96 9.54 18.34 10.44 18.34 11.55C18.34 15.46 16.02 16.3 13.81 16.55C14.17 16.85 14.5 17.46 14.5 18.38C14.5 19.7 14.49 20.98 14.49 21.37C14.49 21.63 14.65 21.95 15.16 21.85C19.14 20.5 22 16.7 22 12.2C22 6.58 17.52 2 12 2Z" fill="currentColor"/></svg>
                </a>
              </div>
            </div>
            <div class="footer-col">
              <h4>Product</h4>
              <ul>
                <li><a href="index.html">Home</a></li>
                <li><a href="features.html">Features</a></li>
                <li><a href="pricing.html">Pricing</a></li>
                <li><a href="download.html">Download</a></li>
                <li><a href="faq.html">FAQ</a></li>
              </ul>
            </div>
            <div class="footer-col">
              <h4>Legal</h4>
              <ul>
                <li><a href="terms.html">Terms</a></li>
                <li><a href="privacy.html">Privacy</a></li>
                <li><a href="risk-disclosure.html">Risk Disclosure</a></li>
              </ul>
            </div>
            <div class="footer-col">
              <h4>Company</h4>
              <ul>
                <li><a href="how-it-works.html">How It Works</a></li>
                <li><a href="mailto:support@example.com">Contact</a></li>
              </ul>
            </div>
          </div>
          <p class="footer-disclaimer">
            Trading involves risk, including the possible loss of principal. Past performance does not guarantee future results.
            AutoTrade is software and does not guarantee profits or investment returns. AutoTrade is not a broker-dealer,
            investment advisor, or financial advisor, and nothing on this site is investment advice.
          </p>
          <div class="footer-bottom">
            <p>&copy; ${year} AutoTrade. All rights reserved.</p>
            <p>Built for traders who want automation, not guesswork.</p>
          </div>
        </div>
      </footer>
    `;
  }

  document.addEventListener("DOMContentLoaded", () => {
    const headerMount = document.getElementById("header-mount");
    const footerMount = document.getElementById("footer-mount");
    if (headerMount) headerMount.outerHTML = renderHeader();
    if (footerMount) footerMount.outerHTML = renderFooter();
    document.dispatchEvent(new CustomEvent("components:ready"));
  });
})();
