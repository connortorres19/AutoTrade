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
  initDashboardDemo();
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
        const url = getPlanStripeUrl(plan);

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
               data-stripe-link="${plan.id}"
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
   Hero dashboard demo: a lightweight, clearly-illustrative simulation of
   the AutoTrade desktop app "coming alive" — portfolio value drifting,
   a redrawing performance chart, a rotating trades list, a jittering
   watchlist, and a hover tooltip on the chart. All values are synthetic
   and are never meant to resemble real account/market data (see the
   "Illustrative preview" caption rendered next to the dashboard).

   Runs only while the dashboard is on-screen and the tab is visible, and
   is skipped entirely under prefers-reduced-motion.
   --------------------------------------------------------------------- */
function initDashboardDemo() {
  const dashboard = document.querySelector(".dashboard");
  if (!dashboard) return;

  const portfolioEl = document.getElementById("dash-portfolio-value");
  const deltaEl = document.getElementById("dash-portfolio-delta");
  const strategyEl = document.getElementById("dash-strategy-status");
  const tradesBody = document.getElementById("dash-trades-body");
  const chartSvg = document.getElementById("dash-chart-svg");
  const chartLine = document.getElementById("dash-chart-line");
  const chartFill = document.getElementById("dash-chart-fill");
  const chartDot = document.getElementById("dash-chart-dot");
  const chartTooltip = document.getElementById("dash-chart-tooltip");
  const watchlistItems = Array.from(document.querySelectorAll("#dash-watchlist .watchlist-item"));

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const fmtUsd = (n) =>
    "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  /* --- Portfolio value: small mean-reverting drift around the initial figure --- */
  const DAY_START_VALUE = 24242;
  let portfolioValue = 24680;

  function tickPortfolio() {
    if (!portfolioEl) return;
    const target = 24680 + (Math.random() - 0.5) * 900;
    portfolioValue += (target - portfolioValue) * 0.35;
    portfolioEl.textContent = fmtUsd(portfolioValue);

    if (deltaEl) {
      const pct = ((portfolioValue - DAY_START_VALUE) / DAY_START_VALUE) * 100;
      const isUp = pct >= 0;
      deltaEl.textContent = `${isUp ? "+" : ""}${pct.toFixed(1)}% today`;
      deltaEl.classList.toggle("up", isUp);
      deltaEl.classList.toggle("down", !isUp);
    }
  }

  /* --- Strategy status: occasionally switch between Running / Monitoring --- */
  function tickStrategy() {
    if (!strategyEl || Math.random() > 0.3) return;
    const isMonitoring = strategyEl.classList.toggle("is-monitoring");
    strategyEl.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent = isMonitoring ? "Monitoring" : "Running";
      }
    });
  }

  /* --- Watchlist: small illustrative price jitter --- */
  const watchlistState = watchlistItems.map((el) => {
    const priceEl = el.querySelector("[data-wl-price]");
    const base = parseFloat((priceEl?.textContent || "0").replace(/,/g, "")) || 100;
    return { el, priceEl, chgEl: el.querySelector("[data-wl-chg]"), base, price: base };
  });

  function tickWatchlist() {
    watchlistState.forEach((item) => {
      // Mean-reverting jitter keeps the illustrative price near its
      // starting point indefinitely, rather than drifting away over a
      // long browsing session.
      const target = item.base * (1 + (Math.random() - 0.5) * 0.02);
      item.price += (target - item.price) * 0.4;
      const pct = ((item.price - item.base) / item.base) * 100;
      const isUp = pct >= 0;

      if (item.priceEl) {
        item.priceEl.textContent = item.price.toLocaleString("en-US", {
          minimumFractionDigits: item.price < 1000 ? 2 : 0,
          maximumFractionDigits: item.price < 1000 ? 2 : 0,
        });
        item.priceEl.classList.remove("flash-up", "flash-down");
        // Force reflow so the flash class can be re-applied on consecutive ticks.
        void item.priceEl.offsetWidth;
        item.priceEl.classList.add(isUp ? "flash-up" : "flash-down");
      }
      if (item.chgEl) {
        item.chgEl.textContent = `${isUp ? "+" : ""}${pct.toFixed(1)}%`;
        item.chgEl.classList.toggle("up", isUp);
        item.chgEl.classList.toggle("down", !isUp);
      }
    });
  }

  /* --- Recent trades: occasionally roll in a new synthetic trade --- */
  const TRADE_SYMBOLS = [
    { symbol: "NVDA", price: 118, decimals: 2 },
    { symbol: "BTC", price: 64200, decimals: 0 },
    { symbol: "AAPL", price: 221, decimals: 2 },
    { symbol: "ETH", price: 3412, decimals: 0 },
    { symbol: "TSLA", price: 242, decimals: 2 },
    { symbol: "MSFT", price: 418, decimals: 2 },
  ];

  function tickTrades() {
    if (!tradesBody) return;
    const pick = TRADE_SYMBOLS[Math.floor(Math.random() * TRADE_SYMBOLS.length)];
    const price = pick.price * (1 + (Math.random() - 0.5) * 0.01);
    const side = Math.random() > 0.5 ? "buy" : "sell";
    const priceStr = price.toLocaleString("en-US", {
      minimumFractionDigits: pick.decimals,
      maximumFractionDigits: pick.decimals,
    });

    const row = document.createElement("tr");
    row.innerHTML = `<td>${pick.symbol}</td><td><span class="side-tag ${side}">${side.toUpperCase()}</span></td><td>$${priceStr}</td>`;
    tradesBody.insertBefore(row, tradesBody.firstChild);

    while (tradesBody.children.length > 3) {
      tradesBody.removeChild(tradesBody.lastChild);
    }
  }

  /* --- Performance chart: redraw with a smoothly animated transition --- */
  const CHART_X = [0, 20, 45, 70, 95, 120, 145, 170, 195, 220, 245, 270, 295, 320];
  let chartY = [70, 64, 68, 52, 58, 40, 46, 30, 36, 22, 28, 14, 20, 8];
  let chartAnimFrame = null;

  function buildPaths(ys) {
    const line = CHART_X.map((x, i) => `${i === 0 ? "M" : "L"}${x},${ys[i].toFixed(1)}`).join(" ");
    const fill = `${line} L320,90 L0,90 Z`;
    return { line, fill };
  }

  function renderChart(ys) {
    const { line, fill } = buildPaths(ys);
    if (chartLine) chartLine.setAttribute("d", line);
    if (chartFill) chartFill.setAttribute("d", fill);
  }

  function tickChart() {
    if (!chartLine) return;
    const startY = chartY.slice();
    const endY = chartY.map((y) => Math.min(82, Math.max(6, y + (Math.random() - 0.5) * 22)));
    const duration = 700;
    const start = performance.now();

    if (chartAnimFrame) cancelAnimationFrame(chartAnimFrame);

    const step = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 2);
      const frameY = startY.map((y, i) => y + (endY[i] - y) * eased);
      renderChart(frameY);
      if (t < 1) {
        chartAnimFrame = requestAnimationFrame(step);
      } else {
        chartY = endY;
      }
    };
    chartAnimFrame = requestAnimationFrame(step);
  }

  /* --- Chart hover tooltip --- */
  if (chartSvg && chartTooltip && chartDot) {
    const showAt = (clientX) => {
      const rect = chartSvg.getBoundingClientRect();
      const fraction = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      const idx = Math.round(fraction * (CHART_X.length - 1));
      chartDot.setAttribute("cx", String(CHART_X[idx]));
      chartDot.setAttribute("cy", String(chartY[idx]));
      chartDot.setAttribute("opacity", "1");
      chartTooltip.textContent = `Point ${idx + 1} of ${CHART_X.length} · simulated, not real trading data`;
      chartTooltip.classList.add("is-visible");
    };
    const hide = () => {
      chartDot.setAttribute("opacity", "0");
      chartTooltip.classList.remove("is-visible");
    };

    chartSvg.addEventListener("mousemove", (e) => showAt(e.clientX));
    chartSvg.addEventListener("mouseleave", hide);
  }

  /* --- Master tick loop, gated by viewport visibility + tab visibility --- */
  let intervalId = null;
  let tickCount = 0;

  function runTick() {
    tickCount++;
    tickPortfolio();
    tickWatchlist();
    if (tickCount % 2 === 0) tickChart();
    if (tickCount % 3 === 0) tickTrades();
    if (tickCount % 4 === 0) tickStrategy();
  }

  function start() {
    if (reduceMotion || intervalId) return;
    intervalId = window.setInterval(runTick, 2500);
  }

  function stop() {
    if (intervalId) {
      window.clearInterval(intervalId);
      intervalId = null;
    }
  }

  if (!reduceMotion && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !document.hidden) {
            start();
          } else {
            stop();
          }
        });
      },
      { threshold: 0.2 }
    );
    observer.observe(dashboard);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        stop();
      } else if (dashboard.getBoundingClientRect().top < window.innerHeight) {
        start();
      }
    });
  }
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
