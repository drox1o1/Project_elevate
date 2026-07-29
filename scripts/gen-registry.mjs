// Generates registry.json from the component table below, plus a
// file-contents map so the /r/[name] route never touches the filesystem
// at request time (required for edge/Workers runtimes with no disk access).
// Also emits public/r/registry.json and static public/r/<name>.json for
// every free-tier item so they can be served without the route handler.
// Run: node scripts/gen-registry.mjs
import { writeFileSync, readFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const HOME = "https://labs.duku.design";

// Open tier: core primitives (incl. their registry deps) + selected motion.
const FREE_ITEMS = [
  "button",
  "input",
  "textarea",
  "field",
  "field-message",
  "checkbox",
  "switch",
  "select",
  "radio-group",
  "badge",
  "avatar",
  "spinner",
  "skeleton",
  "kinetic-heading",
  "magnetic-button",
];

const GSAP = ["gsap", "@gsap/react"];
const MOTION = ["motion"];

// Companion files pulled in alongside a component. A string is a registry:lib;
// use { path, type } when the file is not a lib (a stylesheet, for instance).
const LIB = {
  rm: "registry/default/lib/use-reduced-motion.ts",
  cs: "registry/default/lib/use-controllable-state.ts",
  fn: "registry/default/lib/format-number.ts",
  bs: "registry/default/lib/black-scholes.ts",
  pd: "registry/default/lib/pixel-dither.ts",
  ptr: "registry/default/lib/use-pixel-text-renderer.ts",
  prcss: {
    path: "registry/default/motion/pixel-reveal-text.css",
    type: "registry:file",
    target: "components/duku/pixel-reveal-text.css",
  },
};

const KF = {
  shimmer: {
    "@keyframes duku-shimmer": {
      from: { transform: "translateX(-100%)" },
      to: { transform: "translateX(100%)" },
    },
  },
  fadeIn: {
    "@keyframes duku-fade-in": {
      from: { opacity: "0" },
      to: { opacity: "1" },
    },
  },
  timer: {
    "@keyframes duku-timer": {
      from: { transform: "scaleX(1)" },
      to: { transform: "scaleX(0)" },
    },
  },
  popIn: {
    "@keyframes duku-pop-in": {
      from: { transform: "scale(0.96)", opacity: "0" },
      to: { transform: "scale(1)", opacity: "1" },
    },
  },
  caret: {
    "@keyframes duku-caret-blink": {
      "0%, 100%": { opacity: "1" },
      "50%": { opacity: "0" },
    },
  },
};

const r = (name) => `${HOME}/r/${name}.json`;

/**
 * name, title, description, dir, type, deps, registryDeps, libs, css
 */
const items = [
  // ---- Phase 1: primitives
  ["button", "Button", "The state exemplar: loading spinner with width lock, success check-draw morph.", "ui", "registry:ui", GSAP, [], ["rm"]],
  ["input", "Input", "Wrapper-based input with focus ring, invalid/valid states and adornment slots.", "ui", "registry:ui", [], [], ["rm"]],
  ["textarea", "Textarea", "Auto-growing textarea capped at maxRows.", "ui", "registry:ui", [], [], []],
  ["field", "Field", "Label + control + FieldMessage wiring with error shake.", "ui", "registry:ui", GSAP, ["field-message"], ["rm"]],
  ["checkbox", "Checkbox", "Radix checkbox with center-scale fill and check-draw.", "ui", "registry:ui", ["@radix-ui/react-checkbox"], [], ["rm"]],
  ["switch", "Switch", "Spring thumb with press squish.", "ui", "registry:ui", ["@radix-ui/react-switch", ...MOTION], [], ["rm", "cs"]],
  ["select", "Select", "Radix select with origin-aware pop-in and item cascade.", "ui", "registry:ui", ["@radix-ui/react-select", ...GSAP], [], ["rm"]],
  ["radio-group", "Radio Group", "Radix radio with back-out dot pop.", "ui", "registry:ui", ["@radix-ui/react-radio-group"], [], []],
  ["badge", "Badge", "Status badge with optional live ping ring.", "ui", "registry:ui", MOTION, [], ["rm"]],
  ["avatar", "Avatar", "Image avatar with shimmer loading, fallback initials and hover-spread group.", "ui", "registry:ui", [], [], [], { ...KF.shimmer, ...KF.fadeIn }],
  ["spinner", "Spinner", "The house spinner as a standalone.", "ui", "registry:ui", [], [], []],
  ["skeleton", "Skeleton", "Shimmering loading placeholder.", "ui", "registry:ui", [], [], [], KF.shimmer],
  // ---- Phase 2: feedback
  ["field-message", "Field Message", "Inline validation feedback with height-auto and crossfade.", "ui", "registry:ui", GSAP, [], ["rm"]],
  ["alert", "Alert", "Static banner with rise-in entrance and collapsing dismiss.", "ui", "registry:ui", GSAP, [], ["rm"]],
  ["toast", "Toast", "Custom stacked toaster with springs, swipe-to-dismiss and toast.promise.", "ui", "registry:ui", MOTION, [], ["rm"], KF.timer],
  ["progress", "Progress", "Bar and circular progress with tweened value changes.", "ui", "registry:ui", GSAP, [], ["rm"]],
  ["kbd", "Kbd + CopyButton", "Keyboard hint chip and clipboard button with check-draw morph.", "ui", "registry:ui", [], [], []],
  // ---- Phase 3: overlays & navigation
  ["dialog", "Dialog", "Radix dialog with GSAP pop-in/out on data-state.", "ui", "registry:ui", ["@radix-ui/react-dialog", ...GSAP], [], ["rm", "cs"]],
  ["drawer", "Drawer", "Sheet drawer with spring slide and drag-to-dismiss bottom sheet.", "ui", "registry:ui", ["@radix-ui/react-dialog", ...MOTION], [], ["rm", "cs"]],
  ["dropdown-menu", "Dropdown Menu", "Radix menu with origin-aware pop-in and item cascade.", "ui", "registry:ui", ["@radix-ui/react-dropdown-menu", ...GSAP], [], ["rm"]],
  ["slide-tabs", "Slide Tabs", "Tabs with sliding pill indicator and directional content transition.", "ui", "registry:ui", ["@radix-ui/react-tabs", ...GSAP], [], ["rm"]],
  ["navbar", "Navbar", "Sticky nav with scroll blur, shared-layout underline and mobile menu.", "ui", "registry:ui", [...GSAP, ...MOTION], [], ["rm"]],
  ["reveal-accordion", "Reveal Accordion", "Spring-settled FAQ accordion with plus/minus morph.", "ui", "registry:ui", ["@radix-ui/react-accordion", ...MOTION], [], ["rm"]],
  // ---- Phase 4: fintech
  ["stat-counter", "Stat Counter", "Scroll-triggered locale-formatted count-up with delta badge.", "fintech", "registry:ui", GSAP, [], ["rm"]],
  ["number-flow", "Number Flow", "Odometer digit roll for live values.", "fintech", "registry:ui", GSAP, [], ["rm"], KF.fadeIn],
  ["amount-input", "Amount Input", "Auto-scaling amount field with as-you-type grouping and caret preservation.", "fintech", "registry:ui", GSAP, [], ["rm", "cs", "fn"]],
  ["sparkline-card", "Sparkline Card", "Portfolio card with self-drawing sparkline.", "fintech", "registry:ui", GSAP, [], ["rm"]],
  ["otp-input", "OTP Input", "One-time-code cells driven by a single hidden input.", "fintech", "registry:ui", GSAP, [], ["rm", "cs"], { ...KF.popIn, ...KF.caret }],
  ["transaction-list", "Transaction List", "Dashboard list with scroll cascade and skeleton loading.", "fintech", "registry:ui", GSAP, [], ["rm"], { ...KF.shimmer, ...KF.fadeIn }],
  // ---- Phase 5: AI
  ["stream-text", "Stream Text", "LLM-style streaming text reveal with blinking caret.", "ai", "registry:ui", GSAP, [], ["rm"]],
  ["thinking-indicator", "Thinking Indicator", "Shimmering status label with pulsing dots.", "ai", "registry:ui", GSAP, [], ["rm"], KF.shimmer],
  ["chat-message", "Chat Message", "User/assistant message bubbles with entrance and streaming.", "ai", "registry:ui", GSAP, ["stream-text"], ["rm"]],
  ["ai-prompt-input", "AI Prompt Input", "The composer: auto-grow textarea, morphing submit, async handling.", "ai", "registry:ui", GSAP, [], ["rm", "cs"]],
  ["skills-card", "Skills Card", "Collapsible agent skills card with staggered cascade.", "ai", "registry:ui", GSAP, [], ["rm", "cs"]],
  // ---- Phase 6: motion showpieces
  ["kinetic-heading", "Kinetic Heading", "Character-split headline reveal with stagger.", "motion", "registry:ui", GSAP, [], ["rm"]],
  ["magnetic-button", "Magnetic Button", "CTA that eases toward the cursor and springs back.", "motion", "registry:ui", GSAP, [], ["rm"]],
  ["marquee", "Marquee", "Seamless belt with hover-eased pause.", "motion", "registry:ui", GSAP, [], ["rm"]],
  ["text-roll-link", "Text Roll Link", "Link label that rolls per-char with an underline sweep.", "motion", "registry:ui", GSAP, [], ["rm"]],
  ["scroll-reveal-grid", "Scroll Reveal Grid", "Grid wrapper with grid-aware scroll stagger.", "motion", "registry:ui", GSAP, [], ["rm"]],
  ["pixel-reveal-text", "Pixel Reveal Text", "Text reconstructed from a seeded ordered-dither pixel field on an aria-hidden canvas, then handed off to the real DOM text underneath: five-phase timeline, six reveal directions, dissolve-and-reveal on text change, and no canvas at all under reduced motion.", "motion", "registry:ui", [...MOTION, "geist"], [], ["pd", "ptr", "prcss"]],
  // ---- Phase 8: signature workflows
  ["option-chain", "Option Chain", "NIFTY-style option chain: Greeks toggle, ATM highlighting, OI bars, tick flashes and in-context depth with orders.", "fintech", "registry:ui", GSAP, [], ["rm", "bs"]],
  ["greeks-panel", "Greeks Panel", "Live Black-Scholes Greeks for one option with rolling values and springing magnitude gauges.", "fintech", "registry:ui", GSAP, ["number-flow"], ["rm", "bs"]],
  ["kyc-flow", "KYC Flow", "Adaptive identity-verification journey: PAN, document capture, liveness, review, approved and manual-review outcomes.", "workflows", "registry:block", GSAP, ["button", "input", "field", "field-message", "alert", "badge"], ["rm"], KF.shimmer],
  ["crypto-swap", "Crypto Swap", "USDT→ETH swap: token flip, slippage, route hops, fee breakdown, approval then swap, on-chain confirmation timeline.", "crypto", "registry:block", GSAP, ["button", "spinner"], ["rm"]],
  ["agent-canvas", "Agent Canvas", "Agent execution timeline: plan, live tool calls, human approval gate, error with retry, final artifact.", "ai", "registry:block", GSAP, ["button", "spinner"], ["rm"]],
  ["portfolio-risk", "Portfolio Risk", "Risk cockpit: value, P&L, beta and VaR tiles, sector exposure bars, concentration alerts, scenario shocks with hedge idea.", "fintech", "registry:block", GSAP, ["number-flow", "alert"], ["rm"]],
  ["biomarker-trend", "Biomarker Trend", "Lab-value trend explorer: reference band, personal baseline, abnormal points, medication events, unit conversion.", "health", "registry:ui", GSAP, [], ["rm"]],
  // ---- Phase 9: fintech & healthcare, batch 2
  ["market-depth", "Market Depth", "Live bid/ask ladder with breathing quantity bars, buyer/seller balance, spread and level selection.", "fintech", "registry:ui", GSAP, [], ["rm"]],
  ["sip-simulator", "SIP Simulator", "SIP goal simulator: sliders morph the growth projection, corpus rolls, invested/growth split re-balances.", "fintech", "registry:ui", GSAP, ["number-flow"], ["rm"]],
  ["payment-status", "Payment Status", "Payment orchestration timeline: initiated→authorised→captured→settled, with failure and refund branches.", "fintech", "registry:ui", GSAP, ["spinner"], ["rm"]],
  ["medication-timeline", "Medication Timeline", "A month of medication: growing course bars, adherence dot cascade, refill flags and interaction notes.", "health", "registry:ui", GSAP, ["badge"], ["rm"]],
  ["clinical-risk", "Clinical Risk", "Risk gauge that sweeps to its score with protective/adverse factor bars and clinician-review framing.", "health", "registry:ui", GSAP, ["button"], ["rm"]],
  ["vitals-monitor", "Vitals Monitor", "Live patient card: continuously drawing ECG trace, rolling heart rate, and a pulsing tachycardia alarm state.", "health", "registry:ui", GSAP, ["number-flow"], ["rm"]],
  // ---- Phase 10: markets, payments & enterprise, batch 3
  ["order-ticket", "Order Ticket", "Advanced order ticket: buy/sell recolors the ticket, margin and charges roll live, over-margin blocks, partial-fill progress.", "fintech", "registry:ui", GSAP, ["button", "number-flow"], ["rm"]],
  ["strategy-builder", "Strategy Builder", "Options strategy builder: payoff curve morphs between structures, breakevens marked, Greeks totalled, expiry-spot scrubber.", "fintech", "registry:ui", GSAP, ["number-flow"], ["rm", "bs"]],
  ["bank-linking", "Bank Linking", "Account-aggregator linking: bank grid, explicit consent review, OTP verification, account selection, connection-health card.", "fintech", "registry:block", GSAP, ["button", "badge", "otp-input"], ["rm"]],
  ["expense-feed", "Expense Feed", "Expense intelligence: categorised merchants, subscription counting, unusual-charge flags, refund linking, cascading filters.", "fintech", "registry:ui", GSAP, ["badge"], ["rm"]],
  ["reconciliation", "Reconciliation", "Two-sided match workspace: confidence-scored ledger↔statement pairs, rupee-level differences, accept/reject, bulk accept, matched meter.", "enterprise", "registry:block", GSAP, ["button"], ["rm"]],
  ["audit-log", "Audit Log", "Tamper-evident audit trail: action chips, expandable before→after diffs, device metadata, hash-chain integrity badge.", "enterprise", "registry:ui", GSAP, ["badge"], ["rm"]],
  // ---- Phase 11: investigations, comparisons & AI trust, batch 4
  ["investigation-timeline", "Investigation Timeline", "Case timeline with actors, sources, confidence bars, expandable evidence and first-class activity gaps.", "enterprise", "registry:ui", GSAP, [], ["rm"]],
  ["entity-graph", "Entity Graph", "Entity-relationship graph: typed nodes, labelled edges, dashed risk links, isolate-on-select with a detail panel.", "enterprise", "registry:ui", GSAP, [], ["rm"]],
  ["fund-compare", "Fund Compare", "Two funds honestly compared: mirrored metric bars, per-metric winners, exit loads and portfolio overlap.", "fintech", "registry:ui", GSAP, [], ["rm"]],
  ["loan-eligibility", "Loan Eligibility", "EMI composer with a live FOIR meter, credit-band pricing, approval read with the reason, and cost breakdown.", "fintech", "registry:ui", GSAP, ["number-flow"], ["rm"]],
  ["tool-call-inspector", "Tool Call Inspector", "Agent transcript: per-call permission, duration bars, human ↔ raw JSON toggle, error retry, denied-by-policy state.", "ai", "registry:ui", GSAP, ["button"], ["rm"]],
  ["approval-gate", "Approval Gate", "Human approval for agent actions: draining expiry bar, approve/reject/modify-then-approve, designed expired state.", "ai", "registry:ui", GSAP, ["button"], ["rm"]],
  ["grounded-answer", "Grounded Answer", "Answer with per-claim citations that light up the exact source quote, surfaced contradictions and stated gaps.", "ai", "registry:ui", GSAP, [], ["rm"]],
  // ---- Phase 12: payments & verification
  ["card-payment", "Card Payment", "Add-card and pay: a live 3D card face detects the brand as you type, flips for the CVV, validates Luhn and expiry, and the pay button runs a processing → paid morph.", "fintech", "registry:block", MOTION, [], ["rm"]],
  ["chart-trading", "Chart Trading", "Chart-first trading terminal: candles stagger in per timeframe, a draggable order line sets the limit on the chart, the depth rail breathes with the book, and pre-trade checks score spread, liquidity, impact cost, book pressure, range position and volatility against your side.", "fintech", "registry:block", GSAP, ["button", "number-flow"], ["rm", "cs"]],
  ["penny-drop", "Penny Drop", "Penny-drop bank verification: a ₹1 deposit confirms the account and returns the holder name, with staged progress and a name-match read (verified or mismatch).", "fintech", "registry:block", GSAP, [], ["rm"]],
  // ---- Phase 7: blocks
  ["signup-card", "Signup Card", "The flagship block: full validation, strength meter, success morph.", "blocks", "registry:block", GSAP, ["button", "input", "field", "field-message", "checkbox", "alert"], ["rm"], KF.fadeIn],
  ["login-card", "Login Card", "Signup reduced: email + password with the same choreography.", "blocks", "registry:block", GSAP, ["button", "input", "field", "field-message", "checkbox", "alert"], ["rm"]],
  ["pricing-card", "Pricing Card", "Plan card with billing toggle, NumberFlow price roll and feature cascade.", "blocks", "registry:block", [...GSAP, ...MOTION], ["button", "badge", "number-flow"], ["rm"]],
  ["newsletter-input", "Newsletter Input", "Single-line capture that morphs into a success pill.", "blocks", "registry:block", GSAP, ["button", "field-message"], ["rm"]],
];

const registry = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: "duku-labs",
  homepage: HOME,
  items: items.map(
    ([name, title, description, dir, type, deps, regDeps, libs, css]) => ({
      name,
      type,
      title,
      description,
      dependencies: deps,
      registryDependencies: regDeps.map(r),
      files: [
        {
          path: `registry/default/${dir}/${name}.tsx`,
          type,
        },
        ...libs.map((l) =>
          typeof LIB[l] === "string"
            ? { path: LIB[l], type: "registry:lib" }
            : { ...LIB[l] }
        ),
      ],
      ...(css ? { css } : {}),
      meta: { tier: FREE_ITEMS.includes(name) ? "free" : "pro" },
    })
  ),
};

writeFileSync("registry.json", JSON.stringify(registry, null, 2) + "\n");
console.log(`registry.json written with ${registry.items.length} items`);

// Inline every referenced file's contents at build time. The route handler
// imports this bundled map instead of reading disk per-request.
const uniquePaths = new Set();
for (const item of registry.items) {
  for (const file of item.files) uniquePaths.add(file.path);
}
const fileContents = {};
for (const p of uniquePaths) {
  fileContents[p] = readFileSync(p, "utf8");
}
const outPath = "registry/generated/file-contents.json";
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(fileContents, null, 2) + "\n");
console.log(`${outPath} written with ${uniquePaths.size} files`);

// Static registry files for the free tier, servable without the route
// handler (and without a license key).
mkdirSync("public/r", { recursive: true });
writeFileSync(
  "public/r/registry.json",
  JSON.stringify(registry, null, 2) + "\n"
);
for (const item of registry.items) {
  if (item.meta.tier !== "free") continue;
  const payload = {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: item.name,
    type: item.type,
    title: item.title,
    description: item.description,
    dependencies: item.dependencies,
    registryDependencies: item.registryDependencies,
    files: item.files.map((file) => ({
      path: file.path,
      type: file.type,
      content: fileContents[file.path],
    })),
    ...(item.css ? { css: item.css } : {}),
    meta: item.meta,
  };
  writeFileSync(
    `public/r/${item.name}.json`,
    JSON.stringify(payload, null, 2) + "\n"
  );
}
console.log(
  `public/r written with ${FREE_ITEMS.length} free items + registry.json`
);
