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
   Hero dashboard demo: a short, repeating, clearly-illustrative loop of
   "AutoTrade making a trade" — the strategy scans the watchlist, flags a
   symbol, places an order, the order fills into Recent Trades, and the
   portfolio/chart settle to reflect it. Then it idles briefly and repeats.

   This is a scripted narrative (not independent random jitter on every
   element at once) so it reads as one coherent, watchable loop rather
   than several unrelated numbers changing at the same time. All values
   are synthetic — see the "Illustrative preview" caption next to the
   dashboard and the chart's hover tooltip, both of which say so
   explicitly.

   Runs only while the dashboard is on-screen and the tab is visible, and
   is skipped entirely under prefers-reduced-motion (the dashboard just
   keeps its static initial state).
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
  const chartHoverDot = document.getElementById("dash-chart-dot");
  const chartTooltip = document.getElementById("dash-chart-tooltip");
  const chartSymbolEl = document.getElementById("dash-chart-symbol");
  const chartPriceEl = document.getElementById("dash-chart-price");
  const chartDeltaEl = document.getElementById("dash-chart-tick-delta");
  const positionLine = document.getElementById("dash-position-line");
  const entryMarker = document.getElementById("dash-entry-marker");
  const entryLabel = document.getElementById("dash-entry-label");
  const exitMarker = document.getElementById("dash-exit-marker");
  const exitLabel = document.getElementById("dash-exit-label");
  const watchlistItems = Array.from(document.querySelectorAll("#dash-watchlist .watchlist-item"));

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const fmtUsd = (n) =>
    "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Explicit sign on both sides: toFixed(Math.abs(...)) silently drops the
  // minus sign on a loss, leaving only color to convey direction.
  const fmtSignedUsd = (n) => `${n >= 0 ? "+" : "-"}$${Math.abs(n).toFixed(2)}`;

  const SYMBOLS = [
    { symbol: "NVDA", price: 118, decimals: 2 },
    { symbol: "BTC", price: 64200, decimals: 0 },
    { symbol: "AAPL", price: 221, decimals: 2 },
    { symbol: "ETH", price: 3412, decimals: 0 },
  ];

  const watchlistState = watchlistItems.map((el) => {
    const meta = SYMBOLS.find((s) => s.symbol === el.dataset.symbol) || SYMBOLS[0];
    return {
      el,
      priceEl: el.querySelector("[data-wl-price]"),
      chgEl: el.querySelector("[data-wl-chg]"),
      symbol: meta.symbol,
      decimals: meta.decimals,
      base: meta.price,
      price: meta.price,
    };
  });

  function formatBySymbol(price, decimals) {
    return price.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  function renderWatchlistItem(item, { flash } = {}) {
    const pct = ((item.price - item.base) / item.base) * 100;
    const isUp = pct >= 0;
    if (item.priceEl) {
      item.priceEl.textContent = formatBySymbol(item.price, item.decimals);
      if (flash) {
        item.priceEl.classList.remove("flash-up", "flash-down");
        void item.priceEl.offsetWidth; // restart the flash animation
        item.priceEl.classList.add(isUp ? "flash-up" : "flash-down");
      }
    }
    if (item.chgEl) {
      item.chgEl.textContent = `${isUp ? "+" : ""}${pct.toFixed(1)}%`;
      item.chgEl.classList.toggle("up", isUp);
      item.chgEl.classList.toggle("down", !isUp);
    }
  }

  /* --- Portfolio value: mean-reverting drift, nudged whenever a
     simulated position closes --- */
  const DAY_START_VALUE = 24242;
  const BASE_PORTFOLIO = 24680;
  let portfolioValue = BASE_PORTFOLIO;

  function renderPortfolio() {
    if (!portfolioEl) return;
    portfolioEl.textContent = fmtUsd(portfolioValue);
    if (deltaEl) {
      const pct = ((portfolioValue - DAY_START_VALUE) / DAY_START_VALUE) * 100;
      const isUp = pct >= 0;
      deltaEl.textContent = `${isUp ? "+" : ""}${pct.toFixed(1)}% today`;
      deltaEl.classList.toggle("up", isUp);
      deltaEl.classList.toggle("down", !isUp);
    }
  }

  function nudgePortfolio(pnlSign) {
    const bias = pnlSign >= 0 ? 140 : -100;
    const target = BASE_PORTFOLIO + bias + (Math.random() - 0.5) * 260;
    portfolioValue += (target - portfolioValue) * 0.5;
    renderPortfolio();
  }

  /* --- Strategy status label + color per state --- */
  function setStrategyState(state, label) {
    if (!strategyEl) return;
    strategyEl.classList.remove("is-monitoring", "is-scanning", "is-executing");
    if (state) strategyEl.classList.add(state);
    strategyEl.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) node.textContent = label;
    });
  }

  /* =====================================================================
     TICK-DRIVEN PRICE FEED
     A fixed-length sliding window of real prices for whichever symbol is
     "active" this cycle. Every tick appends one new price and drops the
     oldest — no interpolation, no tweening. The path's `d` attribute is
     set directly to the new coordinates each tick, so the line visibly
     steps rather than flowing smoothly, exactly like a live tick chart.
     ===================================================================== */
  const CHART_POINTS = 26;
  const CHART_W = 320;
  const CHART_H = 90;
  const CHART_X = Array.from({ length: CHART_POINTS }, (_, i) => (i * CHART_W) / (CHART_POINTS - 1));

  let activeSymbol = SYMBOLS[0];
  let priceWindow = [];
  let lastPrice = 0;
  let lastScale = { lo: 0, hi: 1 };

  function seedPriceWindow(meta) {
    activeSymbol = meta;
    priceWindow = [meta.price];
    for (let i = 1; i < CHART_POINTS; i++) {
      const prev = priceWindow[i - 1];
      priceWindow.push(prev * (1 + (Math.random() - 0.5) * 0.006));
    }
    lastPrice = priceWindow[priceWindow.length - 1];
    if (chartSymbolEl) chartSymbolEl.textContent = meta.symbol;
  }

  function computeScale(prices) {
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || min * 0.01 || 1;
    const pad = range * 0.18;
    return { lo: min - pad, hi: max + pad };
  }

  function priceToY(price, scale) {
    const t = (price - scale.lo) / (scale.hi - scale.lo);
    const inset = 5;
    return inset + (1 - t) * (CHART_H - inset * 2);
  }

  function renderChartInstant() {
    lastScale = computeScale(priceWindow);
    const ys = priceWindow.map((p) => priceToY(p, lastScale));
    const line = CHART_X.map((x, i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(" ");
    const fill = `${line} L${CHART_W},${CHART_H} L0,${CHART_H} Z`;
    if (chartLine) chartLine.setAttribute("d", line);
    if (chartFill) chartFill.setAttribute("d", fill);
  }

  function renderPriceReadout(prevPrice) {
    if (chartPriceEl) chartPriceEl.textContent = "$" + formatBySymbol(lastPrice, activeSymbol.decimals);
    if (chartDeltaEl && !position) {
      const pct = ((lastPrice - prevPrice) / prevPrice) * 100;
      const isUp = pct >= 0;
      chartDeltaEl.textContent = `${isUp ? "+" : ""}${pct.toFixed(2)}%`;
      chartDeltaEl.classList.toggle("up", isUp);
      chartDeltaEl.classList.toggle("down", !isUp);
    }
  }

  /* --- Chart hover tooltip --- */
  if (chartSvg && chartTooltip && chartHoverDot) {
    const showAt = (clientX) => {
      const rect = chartSvg.getBoundingClientRect();
      const fraction = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      const idx = Math.round(fraction * (CHART_X.length - 1));
      const y = priceToY(priceWindow[idx], lastScale);
      chartHoverDot.setAttribute("cx", String(CHART_X[idx]));
      chartHoverDot.setAttribute("cy", String(y));
      chartHoverDot.setAttribute("opacity", "1");
      chartTooltip.textContent = `$${formatBySymbol(priceWindow[idx], activeSymbol.decimals)} · simulated tick, not real trading data`;
      chartTooltip.classList.add("is-visible");
    };
    const hide = () => {
      chartHoverDot.setAttribute("opacity", "0");
      chartTooltip.classList.remove("is-visible");
    };
    chartSvg.addEventListener("mousemove", (e) => showAt(e.clientX));
    chartSvg.addEventListener("mouseleave", hide);
  }

  /* =====================================================================
     ENTRY / EXIT MARKERS + POSITION LINE
     A position is opened and closed at specific ticks (not on a fixed
     timer). Each marker tracks the index of its own tick within the
     sliding window and is re-positioned every subsequent tick as that
     window shifts left, so it visibly rides along with its original
     price point until the trade resets.
     ===================================================================== */
  let position = null; // { entryPrice, entryIndex } while open/closed
  let exitInfo = null; // { exitPrice, exitIndex } once closed

  function clampLabelDx(x) {
    const margin = 30;
    if (x < margin) return margin - x;
    if (x > CHART_W - margin) return CHART_W - margin - x;
    return 0;
  }

  // The 3-line label prefers below-the-point for a buy and above for a
  // sell, but flips to the other side when the preferred side would run
  // past the chart's top/bottom edge — e.g. a buy very close to the
  // bottom of the visible price range would otherwise clip.
  const LABEL_BLOCK_HEIGHT = 34;
  function resolveLabelBelow(y, preferBelow) {
    if (preferBelow && y + LABEL_BLOCK_HEIGHT > CHART_H - 2) return false;
    if (!preferBelow && y - LABEL_BLOCK_HEIGHT < 2) return true;
    return preferBelow;
  }

  function setMarkerLabel(textEl, lines) {
    const tspans = textEl.querySelectorAll("tspan");
    lines.forEach((line, i) => {
      if (tspans[i]) tspans[i].textContent = line;
    });
  }

  function positionLabel(textEl, x, y, side) {
    const dx = clampLabelDx(x);
    textEl.querySelectorAll("tspan").forEach((t) => t.setAttribute("x", String(dx)));
    const below = resolveLabelBelow(y, side === "buy");
    textEl.setAttribute("y", String(below ? 15 : -21));
  }

  function placeMarker(groupEl, textEl, x, y, side, lines) {
    groupEl.setAttribute("transform", `translate(${x.toFixed(1)}, ${y.toFixed(1)})`);
    positionLabel(textEl, x, y, side);
    setMarkerLabel(textEl, lines);
    groupEl.setAttribute("opacity", "1");
  }

  function popMarker(groupEl) {
    groupEl.classList.remove("is-visible");
    void groupEl.getBoundingClientRect();
    groupEl.classList.add("is-visible");
  }

  function hideMarker(groupEl) {
    groupEl.setAttribute("opacity", "0");
    groupEl.classList.remove("is-visible");
  }

  function updatePositionVisuals() {
    if (!position) return;
    const entryY = priceToY(position.entryPrice, lastScale);
    const entryX = CHART_X[position.entryIndex];
    if (position.entryIndex < 0) {
      hideMarker(entryMarker);
    } else if (entryMarker) {
      entryMarker.setAttribute("transform", `translate(${entryX.toFixed(1)}, ${entryY.toFixed(1)})`);
      positionLabel(entryLabel, entryX, entryY, "buy");
    }

    if (exitInfo) {
      const exitY = priceToY(exitInfo.exitPrice, lastScale);
      const exitX = CHART_X[exitInfo.exitIndex];
      if (exitInfo.exitIndex < 0) {
        hideMarker(exitMarker);
      } else if (exitMarker) {
        exitMarker.setAttribute("transform", `translate(${exitX.toFixed(1)}, ${exitY.toFixed(1)})`);
        positionLabel(exitLabel, exitX, exitY, "sell");
      }
    }

    if (positionLine) {
      const x1 = Math.max(0, CHART_X[Math.max(position.entryIndex, 0)]);
      const x2 = exitInfo ? CHART_X[Math.max(exitInfo.exitIndex, 0)] : CHART_X[CHART_X.length - 1];
      positionLine.setAttribute("x1", String(x1));
      positionLine.setAttribute("x2", String(x2));
      positionLine.setAttribute("y1", String(entryY));
      positionLine.setAttribute("y2", String(entryY));
      positionLine.setAttribute("opacity", position.entryIndex < 0 && !exitInfo ? "0" : "1");
    }

    if (!exitInfo && chartDeltaEl) {
      const pnl = lastPrice - position.entryPrice;
      chartDeltaEl.textContent = `${fmtSignedUsd(pnl)} P/L`;
      chartDeltaEl.classList.toggle("up", pnl >= 0);
      chartDeltaEl.classList.toggle("down", pnl < 0);
    }
  }

  function shiftMarkerIndices() {
    if (position) position.entryIndex -= 1;
    if (exitInfo) exitInfo.exitIndex -= 1;
  }

  function resetPosition() {
    position = null;
    exitInfo = null;
    if (entryMarker) hideMarker(entryMarker);
    if (exitMarker) hideMarker(exitMarker);
    if (positionLine) positionLine.setAttribute("opacity", "0");
  }

  /* --- Recent trades log --- */
  function insertTradeRow(symbol, side, price, decimals) {
    if (!tradesBody) return;
    const row = document.createElement("tr");
    row.innerHTML = `<td>${symbol}</td><td><span class="side-tag ${side}">${side.toUpperCase()}</span></td><td>$${formatBySymbol(price, decimals)}</td>`;
    tradesBody.insertBefore(row, tradesBody.firstChild);
    while (tradesBody.children.length > 3) {
      tradesBody.removeChild(tradesBody.lastChild);
    }
  }

  /* =====================================================================
     STATE MACHINE — tick-counted, not time-counted. A phase ends and the
     next begins exactly on the tick that completes its target count, so
     BUY/SELL fire at a specific tick rather than after a fixed delay.
     monitor -> scanning -> signal -> (BUY on this tick) -> position-open
     -> (SELL on this tick) -> position-closed -> reset -> monitor
     ===================================================================== */
  const randInt = (min, max) => Math.floor(min + Math.random() * (max - min + 1));

  let phase = "monitor";
  let phaseTicks = 0;
  let phaseTarget = 0;

  function enterPhase(name) {
    phase = name;
    phaseTicks = 0;
    if (name === "monitor") {
      phaseTarget = randInt(4, 7);
      setStrategyState("is-monitoring", "Monitoring");
    } else if (name === "scanning") {
      phaseTarget = randInt(4, 6);
      setStrategyState("is-scanning", "Scanning Markets");
    } else if (name === "signal") {
      phaseTarget = randInt(3, 5);
      setStrategyState("is-scanning", "Signal Detected");
      const row = watchlistState.find((w) => w.symbol === activeSymbol.symbol);
      if (row) row.el.classList.add("is-signal");
    } else if (name === "position-open") {
      phaseTarget = randInt(7, 12);
      setStrategyState("is-executing", "Position Open");
    } else if (name === "position-closed") {
      phaseTarget = randInt(3, 4);
      setStrategyState(null, "Position Closed");
    }
  }

  function executeBuy() {
    const entryIndex = CHART_X.length - 1;
    position = { entryPrice: lastPrice, entryIndex };
    watchlistState.forEach((w) => w.el.classList.remove("is-signal"));
    insertTradeRow(activeSymbol.symbol, "buy", lastPrice, activeSymbol.decimals);
    placeMarker(entryMarker, entryLabel, CHART_X[entryIndex], priceToY(lastPrice, lastScale), "buy", [
      "BUY",
      "ENTRY",
      "$" + formatBySymbol(lastPrice, activeSymbol.decimals),
    ]);
    popMarker(entryMarker);
    if (chartDeltaEl) {
      chartDeltaEl.textContent = "+$0.00 P/L";
      chartDeltaEl.classList.add("up");
      chartDeltaEl.classList.remove("down");
    }
    updatePositionVisuals(); // sets the position line's real coordinates immediately
  }

  function executeSell() {
    if (!position) return;
    const exitIndex = CHART_X.length - 1;
    exitInfo = { exitPrice: lastPrice, exitIndex };
    insertTradeRow(activeSymbol.symbol, "sell", lastPrice, activeSymbol.decimals);
    placeMarker(exitMarker, exitLabel, CHART_X[exitIndex], priceToY(lastPrice, lastScale), "sell", [
      "SELL",
      "EXIT",
      "$" + formatBySymbol(lastPrice, activeSymbol.decimals),
    ]);
    popMarker(exitMarker);
    const pnl = lastPrice - position.entryPrice;
    if (chartDeltaEl) {
      chartDeltaEl.textContent = `${fmtSignedUsd(pnl)} P/L`;
      chartDeltaEl.classList.toggle("up", pnl >= 0);
      chartDeltaEl.classList.toggle("down", pnl < 0);
    }
    nudgePortfolio(pnl);
  }

  function advancePhase() {
    phaseTicks += 1;
    if (phaseTicks < phaseTarget) return;

    if (phase === "monitor") {
      enterPhase("scanning");
    } else if (phase === "scanning") {
      enterPhase("signal");
    } else if (phase === "signal") {
      executeBuy();
      enterPhase("position-open");
    } else if (phase === "position-open") {
      executeSell();
      enterPhase("position-closed");
    } else if (phase === "position-closed") {
      resetPosition();
      seedPriceWindow(SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
      renderChartInstant();
      renderPriceReadout(lastPrice);
      enterPhase("monitor");
    }
  }

  function runScanSweepTick() {
    watchlistState.forEach((w) => w.el.classList.remove("is-scanning"));
    watchlistState[phaseTicks % watchlistState.length].el.classList.add("is-scanning");
  }

  function ambientJitterOtherSymbols() {
    watchlistState.forEach((item) => {
      if (item.symbol === activeSymbol.symbol) return;
      if (Math.random() > 0.3) return;
      const target = item.base * (1 + (Math.random() - 0.5) * 0.02);
      item.price += (target - item.price) * 0.4;
      renderWatchlistItem(item, { flash: true });
    });
  }

  /* --- Master tick: every 300-800ms, one discrete price update --- */
  let tickTimeoutId = null;

  function runTick() {
    const prevPrice = lastPrice;
    const bigMove = Math.random() < 0.12;
    const pct = (Math.random() - 0.5) * (bigMove ? 0.012 : 0.0035);
    lastPrice = Math.max(0.01, lastPrice * (1 + pct));
    priceWindow.push(lastPrice);
    priceWindow.shift();
    shiftMarkerIndices();

    renderChartInstant();
    renderPriceReadout(prevPrice);

    if (activeSymbol) {
      const activeRow = watchlistState.find((w) => w.symbol === activeSymbol.symbol);
      if (activeRow) {
        activeRow.price = lastPrice;
        renderWatchlistItem(activeRow, { flash: true });
      }
    }
    ambientJitterOtherSymbols();

    if (phase === "scanning") runScanSweepTick();
    if (position) updatePositionVisuals();

    advancePhase();

    // A pending timeout can only reach this line by having fired, and
    // stop() cancels the pending timeout itself — so there's no path
    // where this needs to check whether it was stopped in between.
    tickTimeoutId = window.setTimeout(runTick, 300 + Math.random() * 500);
  }

  function start() {
    if (reduceMotion || tickTimeoutId) return;
    tickTimeoutId = window.setTimeout(runTick, 300 + Math.random() * 500);
  }

  function stop() {
    if (tickTimeoutId) {
      window.clearTimeout(tickTimeoutId);
    }
    tickTimeoutId = null;
  }

  // Initial static paint (also used as the permanent state under
  // prefers-reduced-motion, which never calls start()).
  seedPriceWindow(SYMBOLS[0]);
  renderChartInstant();
  renderPriceReadout(lastPrice);
  enterPhase("monitor");

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
