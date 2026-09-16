/**
 * AutoTrade site configuration.
 *
 * This is the ONE place to update payment links, the Windows download URL,
 * version info, and the launch promotion toggle. Nothing else in the
 * codebase should need to change when these values change.
 */

const CONFIG = {
  // --- Stripe payment links -------------------------------------------
  // Replace each with the real Stripe Checkout / Payment Link URL for that
  // plan. Until replaced, pricing buttons will not link anywhere useful.
  stripeCoreUrl: "STRIPE_CORE_URL",
  stripeProUrl: "STRIPE_PRO_URL",
  stripeEliteUrl: "STRIPE_ELITE_URL",

  // --- Windows desktop app download ------------------------------------
  // Replace with the direct URL to the AutoTrade Windows installer (.exe).
  windowsDownloadUrl: "WINDOWS_DOWNLOAD_URL",

  // Shown on the Download page. Update whenever a new build ships.
  appVersion: "1.0.0",
  appPlatforms: "Windows 10 / Windows 11",

  // --- Launch promotion --------------------------------------------------
  // Set to true to display launch pricing (crossed-out standard price +
  // discounted launch price + "Launch Offer" badge) on the Pro and Elite
  // plans. Set to false to show standard pricing only.
  launchPromoEnabled: false,

  // --- Pricing plans -------------------------------------------------
  // `price` is the standard monthly price. `launchPrice` is only shown
  // when launchPromoEnabled is true.
  plans: [
    {
      id: "core",
      name: "Core",
      price: 15,
      launchPrice: null,
      tagline: "For getting started with automated stock trading.",
      cta: "Get Core",
      stripeKey: "stripeCoreUrl",
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
      name: "Pro",
      price: 25,
      launchPrice: 20,
      tagline: "For active traders who want more control and more markets.",
      cta: "Get Pro",
      stripeKey: "stripeProUrl",
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
      id: "elite",
      name: "Elite",
      price: 50,
      launchPrice: 40,
      tagline: "For serious traders who need scale and priority support.",
      cta: "Get Elite",
      stripeKey: "stripeEliteUrl",
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
