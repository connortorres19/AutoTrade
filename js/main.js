/**
 * AutoTrade site interactions: nav behavior, scroll reveal, pricing
 * rendering (config-driven), and FAQ accordion.
 */

document.addEventListener("components:ready", () => {
  initHeaderScroll();
  initMobileNav();
});

document.addEventListener("DOMContentLoaded", () => {
  initScrollReveal();
  initPricing();
  initFaq();
  initCountUp();
});

/* ---------------------------------------------------------------------
   Header: subtle background/border change on scroll
   --------------------------------------------------------------------- */
function initHeaderScroll() {
  const header = document.getElementById("site-header");
  if (!header) return;

  const setState = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  setState();
  window.addEventListener("scroll", setState, { passive: true });
}

/* ---------------------------------------------------------------------
   Mobile hamburger menu
   --------------------------------------------------------------------- */
function initMobileNav() {
  const toggle = document.getElementById("nav-toggle");
  const links = document.getElementById("nav-links");
  if (!toggle || !links) return;

  toggle.addEventListener("click", () => {
    const isOpen = links.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
    document.body.style.overflow = isOpen ? "hidden" : "";
  });

  links.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      links.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    });
  });
}

/* ---------------------------------------------------------------------
   Scroll reveal: fade/slide elements into view as they enter viewport
   --------------------------------------------------------------------- */
function initScrollReveal() {
  const targets = document.querySelectorAll(".reveal");
  if (!targets.length) return;

  if (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    !("IntersectionObserver" in window)
  ) {
    targets.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );

  targets.forEach((el) => observer.observe(el));
}

/* ---------------------------------------------------------------------
   Pricing: render plan cards from CONFIG so pricing.html and any
   preview on index.html stay in sync with a single source of truth.
   --------------------------------------------------------------------- */
function initPricing() {
  const mounts = document.querySelectorAll("[data-pricing-mount]");
  if (!mounts.length || typeof CONFIG === "undefined") return;

  const checkIcon = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8.5L6.2 11.5L13 4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  mounts.forEach((mount) => {
    const promoActive = CONFIG.launchPromoEnabled;

    const banner = document.querySelector("[data-promo-banner]");
    if (banner) banner.classList.toggle("is-active", promoActive);

    const cardsHtml = CONFIG.plans
      .map((plan) => {
        const showLaunch = promoActive && plan.launchPrice != null;
        const displayPrice = showLaunch ? plan.launchPrice : plan.price;
        const url = CONFIG[plan.stripeKey];

        const priceHtml = showLaunch
          ? `<span class="original mono">$${plan.price}</span><span class="value">$${displayPrice}</span><span class="period">/mo</span>`
          : `<span class="value">$${displayPrice}</span><span class="period">/mo</span>`;

        const featuresHtml = plan.features
          .map((f) => `<li>${checkIcon}<span>${f}</span></li>`)
          .join("");

        return `
          <div class="price-card reveal${plan.featured ? " is-featured" : ""}">
            ${plan.featured ? '<span class="price-card-badge">Most Popular</span>' : ""}
            ${showLaunch ? '<span class="price-card-promo-badge">Launch Offer</span>' : ""}
            <h3>${plan.name}</h3>
            <p class="price-card-tagline">${plan.tagline}</p>
            <div class="price-amount">${priceHtml}</div>
            <a class="btn ${plan.featured ? "btn-primary" : "btn-secondary"} btn-block price-card-cta"
               href="${url}"
               data-stripe-link="${plan.stripeKey}"
               ${url && url.startsWith("http") ? 'target="_blank" rel="noopener"' : ""}>
              ${plan.cta}
            </a>
            <ul class="price-features">${featuresHtml}</ul>
          </div>
        `;
      })
      .join("");

    mount.innerHTML = cardsHtml;

    // Placeholder links shouldn't navigate anywhere in a dev/staging build.
    mount.querySelectorAll("[data-stripe-link]").forEach((el) => {
      const href = el.getAttribute("href") || "";
      if (!href.startsWith("http")) {
        el.addEventListener("click", (e) => {
          e.preventDefault();
          console.warn(
            `AutoTrade: replace "${href}" in js/config.js with a real Stripe payment link.`
          );
        });
      }
    });

    // New cards render after DOMContentLoaded's reveal pass, so observe them too.
    initScrollReveal();
  });
}

/* ---------------------------------------------------------------------
   Count-up: animate the dashboard mockup's portfolio figure once visible
   --------------------------------------------------------------------- */
function initCountUp() {
  const targets = document.querySelectorAll("[data-count-to]");
  if (!targets.length) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const animate = (el) => {
    const end = parseFloat(el.getAttribute("data-count-to"));
    if (reduceMotion || !("requestAnimationFrame" in window)) {
      el.textContent = formatCurrency(end);
      return;
    }
    const duration = 1200;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = formatCurrency(end * eased);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const formatCurrency = (n) =>
    "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (!("IntersectionObserver" in window)) {
    targets.forEach(animate);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );
  targets.forEach((el) => observer.observe(el));
}

/* ---------------------------------------------------------------------
   FAQ accordion
   --------------------------------------------------------------------- */
function initFaq() {
  const items = document.querySelectorAll(".faq-item");
  if (!items.length) return;

  items.forEach((item) => {
    const question = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");
    if (!question || !answer) return;

    question.addEventListener("click", () => {
      const isOpen = item.classList.contains("is-open");

      items.forEach((other) => {
        other.classList.remove("is-open");
        const otherAnswer = other.querySelector(".faq-answer");
        if (otherAnswer) otherAnswer.style.maxHeight = null;
        const otherQuestion = other.querySelector(".faq-question");
        if (otherQuestion) otherQuestion.setAttribute("aria-expanded", "false");
      });

      if (!isOpen) {
        item.classList.add("is-open");
        answer.style.maxHeight = answer.scrollHeight + "px";
        question.setAttribute("aria-expanded", "true");
      }
    });
  });
}

/* Also apply the download URL wherever it's referenced declaratively. */
document.addEventListener("DOMContentLoaded", () => {
  if (typeof CONFIG === "undefined") return;
  document.querySelectorAll("[data-download-link]").forEach((el) => {
    el.setAttribute("href", CONFIG.windowsDownloadUrl);
    if (!CONFIG.windowsDownloadUrl.startsWith("http")) {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        console.warn(
          "AutoTrade: replace WINDOWS_DOWNLOAD_URL in js/config.js with the real installer link."
        );
      });
    }
  });
  document.querySelectorAll("[data-app-version]").forEach((el) => {
    el.textContent = CONFIG.appVersion;
  });
  document.querySelectorAll("[data-app-platforms]").forEach((el) => {
    el.textContent = CONFIG.appPlatforms;
  });
});
