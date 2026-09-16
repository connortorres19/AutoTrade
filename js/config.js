/**
 * AutoTrade site configuration.
 *
 * This is the ONE place to update payment links, the Windows download URL,
 * version info, and the launch promotion toggle. Nothing else in the
 * codebase should need to change when these values change.
 */

const CONFIG = {
  // --- Launch promotion --------------------------------------------------
  // Single source of truth for the launch discount. Flip this one flag to
  // turn the promotion on or off — it controls both the displayed price
  // AND which Stripe link each button uses (see `plans` below). Nothing
  // else needs to change.
  launchPromoEnabled: true,

  // --- Windows desktop app download ------------------------------------
  // Replace with the direct URL to the AutoTrade Windows installer (.exe).
  windowsDownloadUrl: "WINDOWS_DOWNLOAD_URL",

  // Shown on the Download page. Update whenever a new build ships.
  appVersion: "1.0.0",
  appPlatforms: "Windows 10 / Windows 11",

  // --- Pricing plans -------------------------------------------------
  // `price` is the standard monthly price, `launchPrice` is shown instead
  // (with `price` crossed out) whenever `launchPromoEnabled` is true.
  //
  // Each plan carries its own Stripe link(s). When a plan has a
  // `stripeLaunchUrl`, the pricing renderer automatically picks
  // `stripeLaunchUrl` while the promo is enabled and `stripeUrl` once it's
  // turned off — no per-button edits required anywhere else.
  plans: [
    {
      id: "essential",
      name: "AutoTrade Essential",
      price: 15,
      launchPrice: null, // Essential has no launch pricing — always $15/mo.
      tagline: "For getting started with automated stock trading.",
      cta: "Get Essential",
      stripeUrl: "https://buy.stripe.com/cNi8wQ5t0aUZ8B3dClfYY04",
      stripeLaunchUrl: null,
      featured: false,
      features: [
        "Up to $1,000 account balance",
        "Stocks only",
        "Preset strategies",
        "Basic analytics",
        "Up to 50 trades/day",
      ],
    },
    {
      id: "pro",
      name: "AutoTrade Pro",
      price: 25,
      launchPrice: 20,
      tagline: "For active traders who want more control and more markets.",
      cta: "Get Pro",
      stripeUrl: "https://buy.stripe.com/14A8wQdZw7INeZr0PzfYY03",
      stripeLaunchUrl: "https://buy.stripe.com/6oU6oI6x42otg3v69TfYY02",
      featured: true,
      features: [
        "Up to $5,000 account balance",
        "Stocks + crypto",
        "Strategy customization",
        "Backtesting",
        "Full analytics",
        "Up to 250 trades/day",
      ],
    },
    {
      id: "unlimited",
      name: "AutoTrade Unlimited",
      price: 50,
      launchPrice: 40,
      tagline: "For serious traders who need scale and priority support.",
      cta: "Get Unlimited",
      stripeUrl: "https://buy.stripe.com/00w7sMg7Ed379F7aq9fYY01",
      stripeLaunchUrl: "https://buy.stripe.com/9B65kEdZw9QVbNfbudfYY00",
      featured: false,
      features: [
        "Unlimited account balance",
        "Unlimited trades",
        "Advanced analytics",
        "Priority support",
        "Early access to new features",
      ],
    },
  ],

  // --- Company / social placeholders -----------------------------------
  // Replace with real links when available.
  social: {
    twitter: "#",
    discord: "#",
    github: "#",
  },
};

/**
 * Resolves the Stripe URL a plan's button should use right now, given the
 * single `launchPromoEnabled` flag. Centralized here so every page (and
 * any future page) always gets the same answer from one place.
 */
function getPlanStripeUrl(plan) {
  if (CONFIG.launchPromoEnabled && plan.launchPrice != null && plan.stripeLaunchUrl) {
    return plan.stripeLaunchUrl;
  }
  return plan.stripeUrl;
}
