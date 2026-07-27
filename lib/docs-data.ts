export interface PropRow {
  prop: string;
  type: string;
  defaultValue?: string;
  description: string;
}

export interface InteractionRow {
  action: string;
  result: string;
}

export interface DocEntry {
  slug: string;
  title: string;
  description: string;
  phase: string;
  free?: boolean;
  sourceFile: string;
  interactions: InteractionRow[];
  props: PropRow[];
}

const P1 = "Primitives";
const P2 = "Feedback";
const P3 = "Overlays & navigation";
const P4 = "Fintech & data";
const P5 = "AI / agent";
const P6 = "Motion showpieces";
const P7 = "Blocks";
const P8 = "Signature workflows";
const P9 = "Healthcare";
const P10 = "Enterprise & data";

export const DOCS: DocEntry[] = [
  {
    slug: "button",
    title: "Button",
    description:
      "The state exemplar. Loading locks width and swaps in a spinner; success morphs to an emerald check-draw, holds 1.6s and reverses.",
    phase: P1,
    free: true,
    sourceFile: "registry/default/ui/button.tsx",
    interactions: [
      { action: "Click “Save changes”", result: "Label blurs out, spinner pops in at locked width, then the check draws on emerald and reverses after 1.6s" },
      { action: "Press and hold any button", result: "Presses to scale 0.97 in 100ms" },
      { action: "Tab to a button", result: "2px focus ring with offset" },
    ],
    props: [
      { prop: "variant", type: '"default" | "outline" | "ghost" | "destructive" | "link"', defaultValue: '"default"', description: "Visual variant." },
      { prop: "size", type: '"sm" | "default" | "lg" | "icon"', defaultValue: '"default"', description: "Height/padding scale." },
      { prop: "loading", type: "boolean", defaultValue: "false", description: "Shows spinner, disables, keeps width." },
      { prop: "success", type: "boolean", defaultValue: "false", description: "Checkmark morph; auto-clears after 1.6s via onSuccessEnd." },
      { prop: "onSuccessEnd", type: "() => void", description: "Fires when the success morph reverses." },
    ],
  },
  {
    slug: "input",
    title: "Input",
    description:
      "Wrapper-carried focus ring, invalid/valid feedback and prefix/suffix adornment slots.",
    phase: P1,
    free: true,
    sourceFile: "registry/default/ui/input.tsx",
    interactions: [
      { action: "Focus the input", result: "Border and ring fade in via CSS transition — no JS" },
      { action: "Toggle valid", result: "Emerald border + a check draws into the suffix slot" },
    ],
    props: [
      { prop: "invalid", type: "boolean", defaultValue: "false", description: "Destructive border + ring, aria-invalid." },
      { prop: "valid", type: "boolean", defaultValue: "false", description: "Emerald border + check-draw suffix icon." },
      { prop: "prefixEl / suffixEl", type: "ReactNode", description: "Adornment slots." },
    ],
  },
  {
    slug: "textarea",
    title: "Textarea",
    description: "Input styling with instant auto-grow capped at maxRows.",
    phase: P1,
    free: true,
    sourceFile: "registry/default/ui/textarea.tsx",
    interactions: [
      { action: "Type multiple lines", result: "Grows instantly per keystroke (no tween) until maxRows, then scrolls" },
    ],
    props: [
      { prop: "maxRows", type: "number", defaultValue: "8", description: "Max rows before scrolling." },
      { prop: "rows", type: "number", defaultValue: "3", description: "Initial rows." },
      { prop: "invalid / valid", type: "boolean", defaultValue: "false", description: "Feedback borders." },
    ],
  },
  {
    slug: "field",
    title: "Field",
    description:
      "Label + control + FieldMessage with aria wiring; shakes the control when an error appears.",
    phase: P1,
    free: true,
    sourceFile: "registry/default/ui/field.tsx",
    interactions: [
      { action: "Trigger the error state", result: "Message height-autos in, control shakes, role=alert announces" },
    ],
    props: [
      { prop: "label", type: "ReactNode", description: "Rendered as a <label> wired to the control." },
      { prop: "state", type: '"error" | "success" | "hint" | null', defaultValue: "null", description: "FieldMessage state." },
      { prop: "message", type: "ReactNode", description: "The message content." },
    ],
  },
  {
    slug: "checkbox",
    title: "Checkbox",
    description: "Radix checkbox; primary fill scales from center, then the check draws.",
    phase: P1,
    free: true,
    sourceFile: "registry/default/ui/checkbox.tsx",
    interactions: [
      { action: "Click the box", result: "Fill scales 0→1 from center in 180ms, check draws 50ms later" },
      { action: "Space with focus", result: "Same, fully keyboard operable" },
    ],
    props: [
      { prop: "checked / defaultChecked", type: 'boolean | "indeterminate"', description: "Controlled/uncontrolled via Radix." },
      { prop: "onCheckedChange", type: "(checked) => void", description: "Change callback." },
    ],
  },
  {
    slug: "switch",
    title: "Switch",
    description: "Spring-positioned thumb that squishes to 22px while pressed.",
    phase: P1,
    free: true,
    sourceFile: "registry/default/ui/switch.tsx",
    interactions: [
      { action: "Toggle it", result: "Thumb springs across (stiffness 380, damping 32)" },
      { action: "Press and hold", result: "Thumb stretches to 22px on the soft spring, releases on up" },
    ],
    props: [
      { prop: "checked / defaultChecked", type: "boolean", description: "Controlled or uncontrolled." },
      { prop: "onCheckedChange", type: "(checked: boolean) => void", description: "Change callback." },
    ],
  },
  {
    slug: "select",
    title: "Select",
    description: "Radix select with origin-aware pop-in, item cascade and check-draw indicator.",
    phase: P1,
    free: true,
    sourceFile: "registry/default/ui/select.tsx",
    interactions: [
      { action: "Open the select", result: "Content pops from the trigger side, first 10 items cascade at 0.02s" },
      { action: "Pick an option", result: "Check draws next to the selected item; chevron rotates 180°" },
    ],
    props: [
      { prop: "value / defaultValue", type: "string", description: "Controlled or uncontrolled (Radix)." },
      { prop: "invalid", type: "boolean", defaultValue: "false", description: "Destructive trigger border (on SelectTrigger)." },
    ],
  },
  {
    slug: "radio-group",
    title: "Radio Group",
    description: "Radix radio group; the dot pops with a back.out(1.7) overshoot.",
    phase: P1,
    free: true,
    sourceFile: "registry/default/ui/radio-group.tsx",
    interactions: [
      { action: "Select an option", result: "Dot scales 0→1 with overshoot in 200ms" },
      { action: "Arrow keys", result: "Roving focus between items (Radix)" },
    ],
    props: [
      { prop: "value / defaultValue", type: "string", description: "Controlled or uncontrolled." },
      { prop: "onValueChange", type: "(value: string) => void", description: "Change callback." },
    ],
  },
  {
    slug: "badge",
    title: "Badge",
    description: "Quiet status badge; optional ping ring for live statuses.",
    phase: P1,
    free: true,
    sourceFile: "registry/default/ui/badge.tsx",
    interactions: [
      { action: "Watch the pulse variant", result: "A ring scales 1→1.8 and fades every 1.8s" },
    ],
    props: [
      { prop: "variant", type: '"default" | "secondary" | "outline" | "success" | "destructive"', defaultValue: '"default"', description: "Visual variant." },
      { prop: "pulse", type: "boolean", defaultValue: "false", description: "Live-status ping ring." },
    ],
  },
  {
    slug: "avatar",
    title: "Avatar",
    description: "Image with shimmer while loading and fallback initials; groups spread on hover.",
    phase: P1,
    free: true,
    sourceFile: "registry/default/ui/avatar.tsx",
    interactions: [
      { action: "Hover the group", result: "Overlap relaxes from -8px to -2px over 250ms" },
      { action: "Break an image URL", result: "Initials fade in as fallback" },
    ],
    props: [
      { prop: "src / alt / fallback", type: "string", description: "Image source and fallback initials." },
      { prop: "max (AvatarGroup)", type: "number", description: "Collapse overflow into a +N counter." },
    ],
  },
  {
    slug: "spinner",
    title: "Spinner",
    description: "The Button spinner as a standalone, with a visually-hidden loading label.",
    phase: P1,
    free: true,
    sourceFile: "registry/default/ui/spinner.tsx",
    interactions: [
      { action: "Observe", result: "0.8s linear rotation, dasharray 60/200 arc" },
    ],
    props: [
      { prop: "size", type: '"sm" | "default" | "lg"', defaultValue: '"default"', description: "16 / 20 / 24 px." },
    ],
  },
  {
    slug: "skeleton",
    title: "Skeleton",
    description: "Muted placeholder with the house shimmer. Deterministic widths only.",
    phase: P1,
    free: true,
    sourceFile: "registry/default/ui/skeleton.tsx",
    interactions: [
      { action: "Observe", result: "Gradient sweeps left→right every 1.6s (CSS keyframes, not JS)" },
    ],
    props: [
      { prop: "className", type: "string", description: "Size it with utility classes." },
    ],
  },
  {
    slug: "field-message",
    title: "Field Message",
    description: "The inline validation feedback used by every form: height-auto in/out, crossfade between messages.",
    phase: P2,
    free: true,
    sourceFile: "registry/default/ui/field-message.tsx",
    interactions: [
      { action: "Cycle states", result: "null↔message animates height; message↔message crossfades in 150ms" },
      { action: "Error state", result: "Destructive text + alert-circle icon, role=alert" },
    ],
    props: [
      { prop: "state", type: '"error" | "success" | "hint" | null', description: "null collapses the container." },
      { prop: "children", type: "ReactNode", description: "The message." },
    ],
  },
  {
    slug: "alert",
    title: "Alert",
    description: "Static banner with rise-in entrance and a dismiss that collapses its own height.",
    phase: P2,
    sourceFile: "registry/default/ui/alert.tsx",
    interactions: [
      { action: "Mount", result: "Rises in 12px over 0.35s" },
      { action: "Dismiss", result: "Height collapses over 0.32s power3.inOut" },
    ],
    props: [
      { prop: "variant", type: '"info" | "success" | "warning" | "destructive"', defaultValue: '"info"', description: "Visual + role mapping." },
      { prop: "onDismiss", type: "() => void", description: "Renders the dismiss button; called after collapse." },
    ],
  },
  {
    slug: "toast",
    title: "Toast",
    description: "Custom stacked toaster: springs in, stacks with depth, expands on hover, swipes to dismiss, and toast.promise morphs through three phases.",
    phase: P2,
    sourceFile: "registry/default/ui/toast.tsx",
    interactions: [
      { action: "Fire several toasts", result: "Stack scales/offsets older ones; max 3 visible" },
      { action: "Hover the stack", result: "Expands to a full list with 8px gaps on the standard spring" },
      { action: "Drag a toast sideways", result: "Dismisses past 80px or with velocity" },
      { action: "toast.promise(...)", result: "One toast morphs spinner → check-draw / alert" },
    ],
    props: [
      { prop: "toast(options)", type: "{ title, description?, variant?, duration = 4000, action? }", description: "Imperative API from useToast()." },
      { prop: "toast.promise", type: "(p, { loading, success, error })", description: "Morphs one toast through the three states." },
      { prop: "<Toaster position>", type: '"bottom-right" | "bottom-left" | "top-right" | "top-left"', defaultValue: '"bottom-right"', description: "Mount once globally." },
    ],
  },
  {
    slug: "progress",
    title: "Progress",
    description: "Bar and circular progress; value changes tween, indeterminate loops.",
    phase: P2,
    sourceFile: "registry/default/ui/progress.tsx",
    interactions: [
      { action: "Bump the value", result: "Fill tweens over 0.5s power2.out" },
      { action: "Indeterminate", result: "40% segment loops at 1.4s power1.inOut" },
    ],
    props: [
      { prop: "value", type: "number", defaultValue: "0", description: "0–100." },
      { prop: "indeterminate", type: "boolean", defaultValue: "false", description: "Looping segment." },
      { prop: "variant", type: '"bar" | "circle"', defaultValue: '"bar"', description: "Shape." },
    ],
  },
  {
    slug: "kbd",
    title: "Kbd + CopyButton",
    description: "Keyboard hint chip and an icon button that morphs copy → check on click.",
    phase: P2,
    sourceFile: "registry/default/ui/kbd.tsx",
    interactions: [
      { action: "Click the copy button", result: "Writes to clipboard, check draws, reverts after 1.5s" },
    ],
    props: [
      { prop: "value (CopyButton)", type: "string", description: "Text written to the clipboard." },
    ],
  },
  {
    slug: "dialog",
    title: "Dialog",
    description: "Radix dialog; overlay fade + panel pop-in, GSAP-driven exit on data-state.",
    phase: P3,
    sourceFile: "registry/default/ui/dialog.tsx",
    interactions: [
      { action: "Open", result: "Overlay fades 0.2s, panel pops from scale 0.96 / y 8" },
      { action: "Esc or overlay click", result: "Exits in 0.15s power2.in" },
    ],
    props: [
      { prop: "open / defaultOpen", type: "boolean", description: "Controlled or uncontrolled." },
      { prop: "onOpenChange", type: "(open: boolean) => void", description: "Change callback." },
    ],
  },
  {
    slug: "drawer",
    title: "Drawer",
    description: "Sheet-styled dialog sliding on the standard spring; bottom sheet drags to dismiss.",
    phase: P3,
    sourceFile: "registry/default/ui/drawer.tsx",
    interactions: [
      { action: "Open right/bottom", result: "Slides in on spring (380/32)" },
      { action: "Drag the bottom sheet down", result: "Dismisses past 120px or with velocity" },
    ],
    props: [
      { prop: "side", type: '"right" | "bottom"', defaultValue: '"right"', description: "Sheet edge." },
      { prop: "open / onOpenChange", type: "boolean / fn", description: "Controlled or uncontrolled." },
    ],
  },
  {
    slug: "dropdown-menu",
    title: "Dropdown Menu",
    description: "Radix menu with origin-aware pop-in, 0.018s item cascade and sliding submenus.",
    phase: P3,
    sourceFile: "registry/default/ui/dropdown-menu.tsx",
    interactions: [
      { action: "Open the menu", result: "Pops from the trigger origin; items cascade" },
      { action: "Hover the submenu", result: "Slides 8px from the trigger side" },
    ],
    props: [
      { prop: "destructive (Item)", type: "boolean", defaultValue: "false", description: "Destructive item styling." },
    ],
  },
  {
    slug: "slide-tabs",
    title: "Slide Tabs",
    description: "Tabs with a sliding, width-morphing pill indicator and directional content transitions.",
    phase: P3,
    sourceFile: "registry/default/ui/slide-tabs.tsx",
    interactions: [
      { action: "Switch tabs", result: "Pill morphs position/width over 0.4s; content slides from the travel direction" },
      { action: "Arrow keys on the list", result: "Roving focus (Radix)" },
    ],
    props: [
      { prop: "items", type: "{ value, label, content }[]", description: "Tab definitions." },
      { prop: "defaultValue", type: "string", description: "Initially active tab." },
    ],
  },
  {
    slug: "navbar",
    title: "Navbar",
    description: "Sticky nav that blurs in after 24px scroll, shared-layout underline, hamburger→X mobile menu.",
    phase: P3,
    sourceFile: "registry/default/ui/navbar.tsx",
    interactions: [
      { action: "Scroll the page", result: "Transparent → blurred background over 0.3s" },
      { action: "Change active link", result: "Underline pill springs between links (layoutId)" },
      { action: "Open on mobile", result: "Links cascade rise-in at 0.06s; hamburger morphs to X" },
    ],
    props: [
      { prop: "links", type: "{ href, label }[]", description: "Navigation links." },
      { prop: "activeHref", type: "string", description: "Current link for the underline." },
      { prop: "logo / cta", type: "ReactNode", description: "End slots." },
    ],
  },
  {
    slug: "reveal-accordion",
    title: "Reveal Accordion",
    description: "FAQ accordion where answers settle on a spring and the plus morphs to minus.",
    phase: P3,
    sourceFile: "registry/default/ui/reveal-accordion.tsx",
    interactions: [
      { action: "Open an item", result: "Height springs to auto (320/34); vertical bar rotates 90°" },
    ],
    props: [
      { prop: "items", type: "{ value, question, answer }[]", description: "FAQ entries." },
      { prop: "type", type: '"single" | "multiple"', defaultValue: '"single"', description: "Open behavior." },
    ],
  },
  {
    slug: "stat-counter",
    title: "Stat Counter",
    description: "Locale-formatted count-up on scroll-in with optional delta badge.",
    phase: P4,
    sourceFile: "registry/default/fintech/stat-counter.tsx",
    interactions: [
      { action: "Scroll it into view", result: "Counts up over 1.6s power2.out, tabular-nums prevents jitter" },
    ],
    props: [
      { prop: "value / from", type: "number", description: "Count range." },
      { prop: "decimals / locale / prefix / suffix", type: "…", description: "Intl formatting." },
      { prop: "delta", type: "number", description: "▲/▼ % badge." },
    ],
  },
  {
    slug: "number-flow",
    title: "Number Flow",
    description: "Odometer digit roll for live values; width animates, separators crossfade.",
    phase: P4,
    sourceFile: "registry/default/fintech/number-flow.tsx",
    interactions: [
      { action: "Change the value", result: "Each digit column rolls over 0.6s with a 0.04s rightward cascade" },
      { action: "Enable trend", result: "Text flashes emerald/red for 0.6s by direction" },
    ],
    props: [
      { prop: "value", type: "number", description: "Current value." },
      { prop: "decimals / locale / prefix / suffix", type: "…", description: "Formatting." },
      { prop: "trend", type: "boolean", defaultValue: "false", description: "Direction color flash." },
    ],
  },
  {
    slug: "amount-input",
    title: "Amount Input",
    description: "The fintech signature: as-you-type grouping (incl. Indian lakh/crore), caret preservation and auto-scaling type.",
    phase: P4,
    sourceFile: "registry/default/fintech/amount-input.tsx",
    interactions: [
      { action: "Type a large number", result: "Groups per locale as you type; font shrinks to fit, tweened 0.15s" },
      { action: "Edit mid-number", result: "Caret never jumps to the end" },
      { action: "Paste letters", result: "Rejected with a shake" },
    ],
    props: [
      { prop: "numberFormat", type: '"us" | "eu" | "in" | "space" | "none"', defaultValue: '"us"', description: "Grouping style." },
      { prop: "onChange", type: "(formatted, raw) => void", description: "Formatted string + parsed number." },
      { prop: "minSize / maxSize", type: "number", defaultValue: "20 / 64", description: "Font-size clamp in px." },
    ],
  },
  {
    slug: "sparkline-card",
    title: "Sparkline Card",
    description: "Portfolio card whose sparkline draws itself; the area fades and a dot lands on the last point.",
    phase: P4,
    sourceFile: "registry/default/fintech/sparkline-card.tsx",
    interactions: [
      { action: "Scroll into view", result: "Path draws over 1.4s; dot lands with back.out(2)" },
    ],
    props: [
      { prop: "data", type: "number[]", description: "Series, min length 2." },
      { prop: "value / prefix / delta", type: "…", description: "Header stat." },
    ],
  },
  {
    slug: "otp-input",
    title: "OTP Input",
    description: "4/6 code cells driven by one hidden input (SR + autofill friendly); digits pop in, completion flashes.",
    phase: P4,
    sourceFile: "registry/default/fintech/otp-input.tsx",
    interactions: [
      { action: "Type digits", result: "Each digit pops in; focus advances automatically" },
      { action: "Paste a full code", result: "Distributes across cells and fires onComplete" },
      { action: "Error mode", result: "Group shakes, borders go destructive" },
    ],
    props: [
      { prop: "length", type: "4 | 6", defaultValue: "6", description: "Cell count." },
      { prop: "onComplete", type: "(code: string) => void", description: "Fires when all cells fill." },
      { prop: "error", type: "boolean", defaultValue: "false", description: "Shake + destructive borders." },
    ],
  },
  {
    slug: "transaction-list",
    title: "Transaction List",
    description: "Dashboard rows that cascade on scroll-in; loading renders shimmering skeleton rows.",
    phase: P4,
    sourceFile: "registry/default/fintech/transaction-list.tsx",
    interactions: [
      { action: "Scroll into view", result: "Rows cascade at 0.04s, once" },
      { action: "Toggle loading", result: "5 skeleton rows crossfade to content" },
    ],
    props: [
      { prop: "items", type: "Transaction[]", description: "id, title, subtitle?, amount, icon?." },
      { prop: "loading", type: "boolean", defaultValue: "false", description: "Skeleton state." },
      { prop: "locale / currency", type: "string", defaultValue: '"en-IN" / "INR"', description: "Amount formatting." },
    ],
  },
  {
    slug: "stream-text",
    title: "Stream Text",
    description: "Text that renders like a streaming LLM response with a blinking caret.",
    phase: P5,
    sourceFile: "registry/default/ai/stream-text.tsx",
    interactions: [
      { action: "Replay", result: "Words fade in at the char-rate; caret blinks then leaves after a 0.8s hold" },
    ],
    props: [
      { prop: "text", type: "string", description: "Full text (rendered once, revealed by GSAP)." },
      { prop: "speed", type: "number", defaultValue: "45", description: "Chars per second." },
      { prop: "caret", type: "boolean", defaultValue: "true", description: "Blinking caret." },
      { prop: "onComplete", type: "() => void", description: "Fires when the reveal finishes." },
    ],
  },
  {
    slug: "thinking-indicator",
    title: "Thinking Indicator",
    description: "Claude-style status: shimmering label plus three pulsing dots.",
    phase: P5,
    sourceFile: "registry/default/ai/thinking-indicator.tsx",
    interactions: [
      { action: "Observe", result: "Dots pulse scale 0.7↔1 with 0.15s stagger; label shimmers" },
    ],
    props: [
      { prop: "label", type: "string", defaultValue: '"Thinking"', description: "Status text." },
    ],
  },
  {
    slug: "chat-message",
    title: "Chat Message",
    description: "User bubbles right-aligned, assistant plain with avatar; ChatList staggers the initial mount.",
    phase: P5,
    sourceFile: "registry/default/ai/chat-message.tsx",
    interactions: [
      { action: "Mount a list", result: "Messages cascade rise-in at 0.05s" },
      { action: "streaming on assistant", result: "String children stream via StreamText" },
    ],
    props: [
      { prop: "role", type: '"user" | "assistant"', description: "Alignment and styling." },
      { prop: "streaming", type: "boolean", defaultValue: "false", description: "Wraps string children in StreamText." },
    ],
  },
  {
    slug: "ai-prompt-input",
    title: "AI Prompt Input",
    description: "The composer: auto-grow textarea, enable-morphing submit circle, async pending and error shake.",
    phase: P5,
    sourceFile: "registry/default/ai/ai-prompt-input.tsx",
    interactions: [
      { action: "Type", result: "Submit circle crossfades to primary; arrow nudges up" },
      { action: "Enter", result: "Submits (Shift+Enter for newline); async shows the spinner morph" },
      { action: "Reject the promise", result: "Container shakes" },
    ],
    props: [
      { prop: "onSubmit", type: "(v: string) => void | Promise<void>", description: "Promise = pending morph until resolve." },
      { prop: "maxRows", type: "number", defaultValue: "7", description: "Textarea growth cap." },
      { prop: "actions", type: "ReactNode", description: "Left slot: attach/model chips." },
    ],
  },
  {
    slug: "skills-card",
    title: "Skills Card",
    description: "Collapsible agent-capability card; rows cascade in as the height opens.",
    phase: P5,
    sourceFile: "registry/default/ai/skills-card.tsx",
    interactions: [
      { action: "Expand", result: "Height tweens 0.45s while rows cascade at 0.05s; chevron rotates" },
      { action: "Double-click fast", result: "In-flight timeline is killed and restarted from current values" },
    ],
    props: [
      { prop: "title", type: "string", description: "Header title (count is automatic)." },
      { prop: "skills", type: "Skill[]", description: "id, name, description?, icon?." },
      { prop: "defaultOpen", type: "boolean", defaultValue: "false", description: "Initial state." },
    ],
  },
  {
    slug: "kinetic-heading",
    title: "Kinetic Heading",
    description: "Character-split headline reveal — the signature hero entrance.",
    phase: P6,
    free: true,
    sourceFile: "registry/default/motion/kinetic-heading.tsx",
    interactions: [
      { action: "Replay", result: "Chars rise from 110% with 0.028s stagger, power4.out" },
    ],
    props: [
      { prop: "text", type: "string", description: "Headline text (split by hand, no Club plugins)." },
      { prop: "trigger", type: '"mount" | "scroll"', defaultValue: '"mount"', description: "When to play." },
      { prop: "stagger / delay", type: "number", defaultValue: "0.028 / 0", description: "Timing." },
    ],
  },
  {
    slug: "magnetic-button",
    title: "Magnetic Button",
    description: "CTA that eases toward the cursor inside a proximity radius and springs back elastically.",
    phase: P6,
    free: true,
    sourceFile: "registry/default/motion/magnetic-button.tsx",
    interactions: [
      { action: "Move the cursor near it", result: "Button follows at strength 0.35; label at half for parallax" },
      { action: "Leave", result: "Springs back with elastic.out(1, 0.45)" },
    ],
    props: [
      { prop: "strength", type: "number", defaultValue: "0.35", description: "Fraction of cursor offset applied." },
      { prop: "radius", type: "number", defaultValue: "120", description: "Activation distance (px)." },
    ],
  },
  {
    slug: "marquee",
    title: "Marquee",
    description: "Seamless logo/testimonial belt; hover eases the loop to a stop instead of freezing it.",
    phase: P6,
    sourceFile: "registry/default/motion/marquee.tsx",
    interactions: [
      { action: "Hover", result: "timeScale eases to 0 over 0.4s, resumes on leave" },
    ],
    props: [
      { prop: "speed", type: "number", defaultValue: "30", description: "Seconds per loop." },
      { prop: "direction", type: '"left" | "right"', defaultValue: '"left"', description: "Travel direction." },
    ],
  },
  {
    slug: "text-roll-link",
    title: "Text Roll Link",
    description: "Nav/footer link whose label rolls per character with an underline sweep.",
    phase: P6,
    sourceFile: "registry/default/motion/text-roll-link.tsx",
    interactions: [
      { action: "Hover", result: "Chars roll up 100% with 0.015s stagger; underline scales from left" },
    ],
    props: [
      { prop: "label", type: "string", description: "Link text (duplicated for the roll)." },
      { prop: "href", type: "string", description: "Standard anchor props." },
    ],
  },
  {
    slug: "scroll-reveal-grid",
    title: "Scroll Reveal Grid",
    description: "Wrapper grid that rises its children in with a grid-aware stagger on scroll.",
    phase: P6,
    sourceFile: "registry/default/motion/scroll-reveal-grid.tsx",
    interactions: [
      { action: "Scroll into view", result: "Cards rise-in with { each: 0.08, grid: auto, from: start }, once" },
    ],
    props: [
      { prop: "children", type: "ReactNode", description: "Arbitrary cards; purely a wrapper." },
    ],
  },
  {
    slug: "signup-card",
    title: "Signup Card",
    description: "The flagship block: OAuth row, live validation, strength meter, loading→success→panel morph.",
    phase: P7,
    sourceFile: "registry/default/blocks/signup-card.tsx",
    interactions: [
      { action: "Blur an empty field", result: "Error height-autos in with a shake; then it re-validates on change" },
      { action: "Type a password", result: "Strength meter mounts and fills segment-by-segment with color transitions" },
      { action: "Submit valid", result: "Button loading → success check → whole form crossfades to the inbox panel" },
      { action: "Submit with errors", result: "Focus jumps to the first invalid field; no loading state" },
    ],
    props: [
      { prop: "onSubmit", type: "({ name, email, password }) => Promise<void>", description: "Rejection renders a destructive Alert." },
      { prop: "onOAuth", type: '(provider: "google" | "github") => void', description: "Renders the OAuth row when provided." },
      { prop: "title / loginHref", type: "string", defaultValue: '"Create your account"', description: "Copy + footer link." },
    ],
  },
  {
    slug: "login-card",
    title: "Login Card",
    description: "SignupCard reduced: email + password with the same submit choreography.",
    phase: P7,
    sourceFile: "registry/default/blocks/login-card.tsx",
    interactions: [
      { action: "Submit valid", result: "Loading → success → “You're in” panel" },
      { action: "Reject the promise", result: "Destructive Alert rises in above the fields" },
    ],
    props: [
      { prop: "onSubmit", type: "({ email, password, remember }) => Promise<void>", description: "Async submit." },
      { prop: "forgotHref / signupHref", type: "string", description: "Auxiliary links." },
    ],
  },
  {
    slug: "pricing-card",
    title: "Pricing Card",
    description: "Plan card with billing toggle; the price rolls via NumberFlow and a savings badge pops in on yearly.",
    phase: P7,
    sourceFile: "registry/default/blocks/pricing-card.tsx",
    interactions: [
      { action: "Toggle monthly/yearly", result: "Price digits roll; “Save 20%” badge pops next to yearly" },
      { action: "Mount", result: "Feature rows cascade with 14px check-draws at 0.05s" },
    ],
    props: [
      { prop: "monthlyPrice / yearlyPrice", type: "number", description: "Prices rolled by NumberFlow." },
      { prop: "features", type: "string[]", description: "Feature list rows." },
      { prop: "featured", type: "boolean", defaultValue: "false", description: "Primary border + “Most popular” badge." },
    ],
  },
  {
    slug: "newsletter-input",
    title: "Newsletter Input",
    description: "Single-line capture whose whole control morphs into a “You're in” pill on success.",
    phase: P7,
    sourceFile: "registry/default/blocks/newsletter-input.tsx",
    interactions: [
      { action: "Submit a valid email", result: "Button loads, control width-morphs into the check pill, reverts after 3s" },
      { action: "Submit invalid", result: "Shake + FieldMessage below" },
    ],
    props: [
      { prop: "onSubmit", type: "(email: string) => Promise<void> | void", description: "Async capture." },
      { prop: "placeholder / buttonLabel", type: "string", description: "Copy." },
    ],
  },
  {
    slug: "option-chain",
    title: "Option Chain",
    description:
      "NIFTY-style option chain: Greeks toggle, ATM highlighting, OI data bars, restrained tick flashes and in-context depth with buy/sell.",
    phase: P8,
    sourceFile: "registry/default/fintech/option-chain.tsx",
    interactions: [
      { action: "Watch the spot tick", result: "Changed LTPs flash market-up/market-down for 600ms, then settle — no full-table repaints" },
      { action: "Click a strike row", result: "Bid/ask depth with Buy/Sell expands in context below the row (height tween, power3.out)" },
      { action: "Toggle Greeks", result: "OI/volume columns swap to Δ Γ Θ V computed from Black-Scholes" },
      { action: "Switch expiry", result: "Rows re-quote for the new DTE; premiums and Greeks stay coherent" },
    ],
    props: [
      { prop: "rows / spot", type: "OptionChainRow[] / number", description: "Chain data (see generateOptionChain) and spot price." },
      { prop: "expiries / expiry / onExpiryChange", type: "string[] / string / fn", description: "Expiry tabs." },
      { prop: "defaultShowGreeks", type: "boolean", defaultValue: "false", description: "Start on Greek columns." },
      { prop: "compact", type: "boolean", defaultValue: "false", description: "OI + LTP only, for narrow containers." },
      { prop: "onOrder", type: "(order: OptionOrder) => void", description: "Buy/Sell from the depth panel." },
      { prop: "lotSize", type: "number", defaultValue: "75", description: "Lot size shown on order buttons." },
    ],
  },
  {
    slug: "greeks-panel",
    title: "Greeks Panel",
    description:
      "Live Black-Scholes Greeks for one option: premium and Δ Γ Θ V roll via NumberFlow while magnitude gauges spring to each new value.",
    phase: P8,
    sourceFile: "registry/default/fintech/greeks-panel.tsx",
    interactions: [
      { action: "Move the spot", result: "Premium and all four Greeks roll to their new values; gauges tween width over 0.6s" },
      { action: "Cross the strike", result: "Delta swings through 0.5, gamma peaks — the gauges make the ATM sensitivity visible" },
    ],
    props: [
      { prop: "side / strike / spot / dte", type: '"call" | "put" / number ×3', description: "The option being priced." },
      { prop: "iv", type: "number", description: "Implied vol as a fraction; defaults to a smile around ATM." },
      { prop: "lotSize", type: "number", defaultValue: "75", description: "For the per-lot theta line." },
    ],
  },
  {
    slug: "kyc-flow",
    title: "KYC Flow",
    description:
      "The adaptive identity-verification journey: details, PAN, document capture with quality checks, liveness, review, and approved or manual-review outcomes.",
    phase: P8,
    sourceFile: "registry/default/workflows/kyc-flow.tsx",
    interactions: [
      { action: "Submit empty details", result: "Fields shake, errors height-auto in with role=alert" },
      { action: "Verify a PAN", result: "Format-validated, then a simulated registry check: loading → valid input + name-match alert" },
      { action: "Capture the ID front", result: "First attempt detects glare and asks for a retake — the failure state is part of the design" },
      { action: "Run liveness", result: "Progress arc tweens through face prompts; success check draws itself" },
      { action: "Submit for verification", result: "Approved shows a check-draw; manual-review shows a calm pulsing badge with turnaround copy" },
    ],
    props: [
      { prop: "outcome", type: '"approved" | "manual-review"', defaultValue: '"approved"', description: "Final verification outcome." },
      { prop: "onComplete", type: "(data, outcome) => void", description: "Fires after submission." },
      { prop: "onStepChange", type: "(step: number) => void", description: "Step index changes." },
      { prop: "initialData", type: "Partial<KycData>", description: "Prefill name/email/dob/pan." },
    ],
  },
  {
    slug: "crypto-swap",
    title: "Crypto Swap",
    description:
      "USDT→ETH swap with slippage, route hops, expanding fee breakdown, approval-then-swap flow and an on-chain confirmation timeline.",
    phase: P8,
    sourceFile: "registry/default/crypto/crypto-swap.tsx",
    interactions: [
      { action: "Click the flip button", result: "Pay and receive cards physically exchange position (power3.inOut), then values swap" },
      { action: "Expand the quote row", result: "Price impact, min received, slippage presets and the route hops unfold (height tween)" },
      { action: "Swap an ERC-20 the first time", result: "Approve transaction runs first; the swap button takes over after" },
      { action: "Confirm the swap", result: "Form morphs into a Submitted → Pending → Confirmed timeline with check-draws" },
      { action: "Enter more than the balance", result: "Destructive border + Insufficient balance, button disabled" },
    ],
    props: [
      { prop: "tokens", type: "SwapToken[]", defaultValue: "DEFAULT_TOKENS", description: "Symbols, USD prices, balances, approval needs." },
      { prop: "onSwapped", type: "(detail) => void", description: "After simulated confirmation." },
    ],
  },
  {
    slug: "agent-canvas",
    title: "Agent Canvas",
    description:
      "Agent execution timeline: the plan becomes a live run with tool calls, a human approval gate, error with retry, and a final artifact reveal.",
    phase: P8,
    sourceFile: "registry/default/ai/agent-canvas.tsx",
    interactions: [
      { action: "Run the plan", result: "Steps activate in order; tool calls stream in with spinner → check per call" },
      { action: "Reach the approval gate", result: "Run pauses on an amber pulsing step; Approve resumes, Reject stops with a resume option" },
      { action: "Hit the failing tool", result: "Step turns error-red with the message; Retry re-runs from the failed call and succeeds" },
      { action: "Complete the run", result: "The artifact blurs in under the timeline; footer shows tokens and cost" },
    ],
    props: [
      { prop: "goal / steps", type: "string / AgentStep[]", description: "The plan. Steps carry toolCalls, optional approval gate, optional failsOnceWith." },
      { prop: "autoStart", type: "boolean", defaultValue: "false", description: "Run on mount instead of showing the plan." },
      { prop: "artifact", type: "ReactNode", description: "Rendered when the run completes." },
      { prop: "onStatusChange", type: "(status: AgentRunStatus) => void", description: "idle/running/waiting-approval/error/complete/rejected." },
    ],
  },
  {
    slug: "portfolio-risk",
    title: "Portfolio Risk",
    description:
      "Risk cockpit: value, day P&L, beta and 1-day VaR tiles, sector exposure bars with concentration alerts, and a scenario slider with a hedge idea.",
    phase: P8,
    sourceFile: "registry/default/fintech/portfolio-risk.tsx",
    interactions: [
      { action: "Mount", result: "Sector bars fill staggered; over-limit sectors render in risk-high with a concentration alert" },
      { action: "Drag the scenario slider", result: "β-scaled impact rolls via NumberFlow with trend colors" },
      { action: "Shock below −5%", result: "A hedge suggestion appears (educational copy, explicitly not advice)" },
    ],
    props: [
      { prop: "holdings", type: "Holding[]", defaultValue: "DEMO_HOLDINGS", description: "Symbol, sector, value, beta, day change." },
      { prop: "concentrationLimit", type: "number", defaultValue: "0.25", description: "Sector share that triggers the warning." },
    ],
  },
  {
    slug: "biomarker-trend",
    title: "Biomarker Trend",
    description:
      "Lab-value trend explorer: reference-range band, personal baseline, abnormal points in risk-high, medication event markers and unit conversion.",
    phase: P8,
    sourceFile: "registry/default/health/biomarker-trend.tsx",
    interactions: [
      { action: "Mount", result: "The trend line draws itself over 1.2s through the reference band" },
      { action: "Click or focus a point", result: "Reading detail panel updates; abnormal points get cautious, non-diagnostic copy" },
      { action: "Toggle the unit", result: "Axis, range and readings convert (e.g. mg/dL ↔ mmol/L)" },
    ],
    props: [
      { prop: "name / unit / readings / range", type: "string / string / BiomarkerReading[] / {low, high}", description: "The marker and its lab range. DEMO_LDL ships as example data." },
      { prop: "baseline", type: "number", description: "Personal baseline dashed line." },
      { prop: "events", type: "BiomarkerEvent[]", description: "Vertical markers, e.g. medication start." },
      { prop: "altUnit", type: "{ unit, factor }", description: "Secondary unit toggle." },
    ],
  },
  {
    slug: "market-depth",
    title: "Market Depth",
    description:
      "Live bid/ask ladder: quantity bars breathe to each update, the spread sits in the middle, buyer/seller balance re-weights and last price flashes directionally.",
    phase: P4,
    sourceFile: "registry/default/fintech/market-depth.tsx",
    interactions: [
      { action: "Watch the feed", result: "Level bars tween to new quantities (0.45s power2.out); last price flashes market-up/down for 600ms" },
      { action: "Click a level", result: "onLevelSelect fires with side and level — prefill an order ticket" },
      { action: "Watch the balance bar", result: "Buyer/seller share of visible depth re-weights over 0.5s" },
    ],
    props: [
      { prop: "symbol / lastPrice", type: "string / number", description: "Instrument and last traded price." },
      { prop: "bids / asks", type: "DepthLevel[]", description: "Best-first ladders; generateDepth(mid) ships for demos." },
      { prop: "atp", type: "number", description: "Average traded price shown in the spread row." },
      { prop: "onLevelSelect", type: '(side, level) => void', description: "Level click callback." },
    ],
  },
  {
    slug: "sip-simulator",
    title: "SIP Simulator",
    description:
      "SIP goal simulator: four sliders drive a compounding projection whose area chart morphs, corpus rolls via NumberFlow and invested/growth split re-balances live.",
    phase: P4,
    sourceFile: "registry/default/fintech/sip-simulator.tsx",
    interactions: [
      { action: "Drag any slider", result: "The growth area morphs to the new curve (path tween), the corpus rolls, the split bar re-weights" },
      { action: "Set a goal", result: "A dashed goal line appears; copy reports the year it's reached or that it isn't" },
      { action: "Raise step-up", result: "Later years fatten visibly — the point of step-up SIPs, made spatial" },
    ],
    props: [
      { prop: "defaults", type: "Partial<SipInputs>", description: "monthly, years, returnPct, stepUpPct, inflationPct." },
      { prop: "goal", type: "number", description: "Target corpus marked on the chart." },
    ],
  },
  {
    slug: "payment-status",
    title: "Payment Status",
    description:
      "One payment's whole lifecycle: initiated → authorised → captured → settled with check-draws, a failure state with decline reason, and a refund branch.",
    phase: P4,
    sourceFile: "registry/default/fintech/payment-status.tsx",
    interactions: [
      { action: "Play the success scenario", result: "Stages light in sequence — spinner on the active stage, check-draw on completion, rail fills green" },
      { action: "Play the failed scenario", result: "Capture stops the rail in red with the issuer decline code and what happens to the hold" },
      { action: "Play the refunded scenario", result: "After settlement a refund branch plays in info-blue" },
    ],
    props: [
      { prop: "amount / reference / method", type: "number / string / string", description: "Payment identity." },
      { prop: "scenario", type: '"success" | "failed" | "refunded"', defaultValue: '"success"', description: "Which lifecycle to play." },
      { prop: "playKey", type: "React.Key", description: "Change to replay the timeline." },
      { prop: "onSettled", type: "(scenario) => void", description: "Fires when the timeline finishes." },
    ],
  },
  {
    slug: "medication-timeline",
    title: "Medication Timeline",
    description:
      "A month of medication at a glance: course bars grow in, adherence dots cascade (missed doses in amber), refill flags pulse and interactions annotate the rows they concern.",
    phase: P9,
    sourceFile: "registry/default/health/medication-timeline.tsx",
    interactions: [
      { action: "Mount", result: "Course bars scale in from the left (staggered), then dose dots pop in with a back-out cascade" },
      { action: "Select a medication", result: "Row expands with adherence stats and missed-dose guidance" },
      { action: "Check Atorvastatin", result: "A pulsing refill badge warns 4 days before the course runs out" },
    ],
    props: [
      { prop: "medications", type: "Medication[]", description: "Name, dose, schedule window, per-day adherence. DEMO_MEDICATIONS ships." },
      { prop: "interactions", type: "MedicationInteraction[]", description: "Pairwise notes rendered under the chart." },
      { prop: "windowDays / today", type: "number / number", defaultValue: "28 / 20", description: "Visible window and the today marker." },
    ],
  },
  {
    slug: "clinical-risk",
    title: "Clinical Risk",
    description:
      "Clinician-review risk summary: the gauge arc sweeps to the score while the number counts up, factor bars grow protective-left/adverse-right, missing data widens stated uncertainty.",
    phase: P9,
    sourceFile: "registry/default/health/clinical-risk.tsx",
    interactions: [
      { action: "Mount", result: "Arc sweeps to the score over 1.1s in the risk-band color while the score counts up; factor bars stagger in from the center" },
      { action: "Read the copy", result: "Explicitly decision-support: missing data, modifiable factors, escalation to clinician review" },
    ],
    props: [
      { prop: "title / score", type: "string / number", description: "0–100; bands map to risk-low/medium/high tokens. DEMO_CARDIO_RISK ships." },
      { prop: "factors", type: "RiskFactor[]", description: "label, weight (−1..1, positive = adverse), detail." },
      { prop: "missingData / recommendation", type: "string[] / string", description: "Uncertainty note and next step." },
      { prop: "onEscalate", type: "() => void", description: "Send-to-clinician action." },
    ],
  },
  {
    slug: "vitals-monitor",
    title: "Vitals Monitor",
    description:
      "Live patient vitals: a continuously drawing synthetic ECG trace, heart rate rolling via NumberFlow, and a whole-card pulsing alarm when a vital leaves range.",
    phase: P9,
    sourceFile: "registry/default/health/vitals-monitor.tsx",
    interactions: [
      { action: "Watch the strip", result: "P-QRS-T beats stream across the grid at the current heart rate (rAF writes the path directly — no re-renders)" },
      { action: "Trigger the alarm", result: "HR climbs, its tile and the trace turn risk-red, the card border pulses, role=alert announces tachycardia" },
      { action: "Enable reduced motion", result: "A static two-beat strip replaces the animation; values still update" },
    ],
    props: [
      { prop: "patient / heartRate / spo2 / systolic / diastolic / temperature", type: "…", description: "The vitals set." },
      { prop: "alarm", type: "boolean", defaultValue: "false", description: "Simulate tachycardia: HR climbs past the threshold." },
      { prop: "hrAlarmAt", type: "number", defaultValue: "110", description: "Alarm threshold." },
    ],
  },
  {
    slug: "order-ticket",
    title: "Order Ticket",
    description:
      "Advanced order ticket: buy/sell recolors the whole ticket, order types reveal only the fields they need, margin and charges roll live, over-margin blocks, and placement plays a partial fill.",
    phase: P4,
    sourceFile: "registry/default/fintech/order-ticket.tsx",
    interactions: [
      { action: "Toggle buy/sell", result: "Border, action button and margin bar recolor market-up/market-down" },
      { action: "Switch to stop-limit", result: "Trigger and price fields appear; market disables and pins price to best bid/ask" },
      { action: "Crank lots past the margin", result: "Margin bar turns destructive, review is blocked with the reason" },
      { action: "Confirm the order", result: "Placing → 40% partial fill → complete, with a live fill progress bar" },
    ],
    props: [
      { prop: "symbol / lastPrice / bestBid / bestAsk", type: "string / number ×3", description: "The instrument and its quote." },
      { prop: "availableMargin / marginFactor", type: "number / number", defaultValue: "250000 / 0.14", description: "Drives the risk-blocked state." },
      { prop: "lotSize", type: "number", defaultValue: "75", description: "Units per lot." },
      { prop: "onPlaced", type: "(order: PlacedOrder) => void", description: "After the fill completes." },
    ],
  },
  {
    slug: "strategy-builder",
    title: "Strategy Builder",
    description:
      "Options strategy builder: pick long call, spread, straddle, strangle or iron condor and the payoff curve morphs to it, with breakevens, max P&L, net Greeks and an expiry-spot scrubber.",
    phase: P4,
    sourceFile: "registry/default/fintech/strategy-builder.tsx",
    interactions: [
      { action: "Switch strategy", result: "The payoff path and profit/loss regions morph over 0.55s (power3.inOut) — no redraw snap" },
      { action: "Drag the expiry-spot scrubber", result: "The P&L marker rides the curve; the number rolls with trend colors" },
      { action: "Pick the iron condor", result: "Four legs list with side badges; net premium flips positive (credit)" },
    ],
    props: [
      { prop: "spot / dte / step", type: "number / number / number", defaultValue: "— / 7 / 100", description: "Pricing inputs; legs priced via Black-Scholes." },
      { prop: "defaultStrategy", type: "StrategyKey", defaultValue: '"bull-call-spread"', description: "long-call, bull-call-spread, straddle, strangle, iron-condor." },
      { prop: "lotSize", type: "number", defaultValue: "75", description: "P&L scaling." },
    ],
  },
  {
    slug: "bank-linking",
    title: "Bank Linking",
    description:
      "Account-aggregator style linking: bank grid, an explicit consent review of exactly what is shared and for how long, OTP verification, account selection and a connection-health card.",
    phase: P4,
    sourceFile: "registry/default/fintech/bank-linking.tsx",
    interactions: [
      { action: "Pick a bank", result: "Step panel slides in with the consent list — data shared, duration, revocability" },
      { action: "Enter a wrong OTP", result: "Cells shake destructive and the flow explains, then lets you retry" },
      { action: "Link the accounts", result: "Loading → connection-health card: Healthy badge, next sync, consent expiry" },
    ],
    props: [
      { prop: "banks / accounts", type: "LinkableBank[] / LinkableAccount[]", description: "DEMO_BANKS / DEMO_ACCOUNTS ship." },
      { prop: "validOtp", type: "string", defaultValue: '"246810"', description: "The demo code that succeeds." },
      { prop: "consentMonths", type: "number", defaultValue: "12", description: "Consent validity shown on review." },
      { prop: "onLinked", type: "(detail) => void", description: "Bank id + selected account ids." },
    ],
  },
  {
    slug: "expense-feed",
    title: "Expense Feed",
    description:
      "An expense feed that understands itself: categorised merchants, subscription month counting, unusual-charge flags with the multiple, refund → original linking and cascading category filters.",
    phase: P4,
    sourceFile: "registry/default/fintech/expense-feed.tsx",
    interactions: [
      { action: "Filter by category", result: "Rows re-cascade (0.035s stagger); day groups collapse to what matches" },
      { action: "Find the Croma charge", result: "Flagged amber: 9× your usual at this merchant" },
      { action: "Tap 'refund — show original'", result: "The refund and its source transaction highlight together in info-blue" },
    ],
    props: [
      { prop: "items", type: "ExpenseItem[]", defaultValue: "DEMO_EXPENSES", description: "Merchant, amount, category, recurringMonth, unusualMultiple, refundOf." },
      { prop: "currency", type: "string", defaultValue: '"₹"', description: "Display currency." },
    ],
  },
  {
    slug: "reconciliation",
    title: "Reconciliation",
    description:
      "Two-sided reconciliation workspace: confidence-scored ledger↔statement pairs, differences called out to the rupee, accept/reject per pair, bulk-accept above a threshold, live matched meter.",
    phase: P10,
    sourceFile: "registry/default/enterprise/reconciliation.tsx",
    interactions: [
      { action: "Accept a match", result: "The pair slides right and collapses; the matched meter fills" },
      { action: "Check the Initech pair", result: "₹1,180 short flagged in warning with a bank-charges hypothesis" },
      { action: "Accept all ≥95%", result: "High-confidence pairs resolve in one action; low ones stay for review" },
      { action: "Clear the queue", result: "'All matched' panel notes that decisions are audit-logged" },
    ],
    props: [
      { prop: "pairs", type: "ReconPair[]", defaultValue: "DEMO_RECON", description: "Ledger/statement sides + confidence." },
      { prop: "bulkThreshold", type: "number", defaultValue: "0.95", description: "Bulk-accept cutoff." },
      { prop: "onResolve", type: '(id, "accept" | "reject") => void', description: "Per-pair decision callback." },
    ],
  },
  {
    slug: "audit-log",
    title: "Audit Log",
    description:
      "Tamper-evident audit trail: actor, action chip and resource per event, expandable field-level before→after diffs, device metadata, and a hash-chain integrity badge that turns destructive on mismatch.",
    phase: P10,
    sourceFile: "registry/default/enterprise/audit-log.tsx",
    interactions: [
      { action: "Expand the credit-limit event", result: "Field diff renders before struck-through in red → after in green" },
      { action: "Filter by action", result: "created/updated/deleted/accessed chips re-cascade the list" },
      { action: "Spot the tampered entry", result: "The row and the header badge go destructive: hash mismatch with previous entry" },
    ],
    props: [
      { prop: "events", type: "AuditEvent[]", defaultValue: "DEMO_AUDIT", description: "Actor, action, resource, changes, integrity." },
      { prop: "onExport", type: "(visible: AuditEvent[]) => void", description: "Export the filtered view." },
    ],
  },
  {
    slug: "investigation-timeline",
    title: "Investigation Timeline",
    description:
      "A case timeline for investigators: events carry actor, source and confidence, evidence expands in place, and unexplained gaps are rendered as first-class dashed voids.",
    phase: P10,
    sourceFile: "registry/default/enterprise/investigation-timeline.tsx",
    interactions: [
      { action: "Mount", result: "Events cascade in with the house rise + blur (0.07s stagger)" },
      { action: "Filter by source", result: "Transactions / emails / access-logs re-cascade the thread; gap markers only show on the full view" },
      { action: "Click an event", result: "Its evidence list and analyst note expand in place (height tween)" },
      { action: "Scan the rail", result: "Amber dots and short confidence bars mark lower-confidence interpretations" },
    ],
    props: [
      { prop: "events", type: "InvestigationEvent[]", defaultValue: "DEMO_INVESTIGATION", description: "time, title, actor, source, confidence, evidence, note, gapDaysBefore." },
      { prop: "title", type: "string", description: "Case header." },
    ],
  },
  {
    slug: "entity-graph",
    title: "Entity Graph",
    description:
      "Entity-relationship graph for investigations: typed nodes pop in, edges draw themselves, risk links render dashed destructive, and selecting a node isolates its neighbourhood.",
    phase: P10,
    sourceFile: "registry/default/enterprise/entity-graph.tsx",
    interactions: [
      { action: "Mount", result: "Nodes pop with back-out stagger; edges draw in via dashoffset, then risk edges settle to their dashed pattern" },
      { action: "Select a node", result: "Non-neighbours dim to 18%; the detail panel explains the entity and lists its relationships" },
      { action: "Keyboard", result: "Nodes are focusable buttons — Enter/Space toggles isolation" },
    ],
    props: [
      { prop: "nodes / edges", type: "GraphNode[] / GraphEdge[]", defaultValue: "DEMO_GRAPH", description: "Typed nodes with positions; labelled edges, risk flag renders dashed destructive." },
    ],
  },
  {
    slug: "fund-compare",
    title: "Fund Compare",
    description:
      "Two funds honestly compared: mirrored metric bars grow from the centre, the better side gets the dot per metric, and portfolio overlap says whether holding both diversifies anything.",
    phase: P4,
    sourceFile: "registry/default/fintech/fund-compare.tsx",
    interactions: [
      { action: "Mount", result: "Mirrored bars fill outward from the centre; green dots mark the winner per metric" },
      { action: "Check the overlap meter", result: "Above 50% it turns warning with 'holding both adds little diversification'" },
      { action: "Read the footer", result: "Which fund leads on how many metrics — plus the returns disclaimer" },
    ],
    props: [
      { prop: "funds", type: "[FundProfile, FundProfile]", defaultValue: "DEMO_FUNDS", description: "Returns, rolling consistency, expense, drawdown, Sharpe, tenure, concentration." },
      { prop: "overlapPct", type: "number", defaultValue: "41", description: "Portfolio overlap between the two funds." },
    ],
  },
  {
    slug: "loan-eligibility",
    title: "Loan Eligibility",
    description:
      "Loan composer with the reason built in: sliders drive an amortised EMI, the FOIR meter shows exactly why approval is likely/borderline/unlikely, and the fix is suggested.",
    phase: P4,
    sourceFile: "registry/default/fintech/loan-eligibility.tsx",
    interactions: [
      { action: "Drag any slider", result: "EMI rolls via NumberFlow; the FOIR meter tweens toward or past the lender line" },
      { action: "Push the amount too high", result: "Verdict turns 'Unlikely at this size' and the copy names the amount that would fit" },
      { action: "Switch credit band", result: "Rate re-prices (750+ / 700–749 / 650–699) and everything recomputes" },
    ],
    props: [
      { prop: "rates", type: "{ excellent, good, fair }", defaultValue: "10.5 / 12.25 / 14.5", description: "Annual rate by credit band, %." },
      { prop: "foirLimit", type: "number", defaultValue: "0.5", description: "Obligation/income ceiling for the approval read." },
      { prop: "processingFeePct", type: "number", defaultValue: "1.5", description: "Fee shown in the cost breakdown." },
    ],
  },
  {
    slug: "tool-call-inspector",
    title: "Tool Call Inspector",
    description:
      "A transcript of what the agent actually did: per-call permission badges, duration bars, a human ↔ raw JSON toggle, retryable errors and a denied-by-policy state.",
    phase: P5,
    sourceFile: "registry/default/ai/tool-call-inspector.tsx",
    interactions: [
      { action: "Toggle human / raw", result: "Summaries swap for exact argument JSON; expanded detail shows the full call envelope" },
      { action: "Expand the failed refund", result: "504 error with a Retry action; its successful retry is tagged as such" },
      { action: "Find the denied call", result: "db.delete_customer blocked by policy — 'no side effects occurred'" },
    ],
    props: [
      { prop: "calls", type: "InspectedToolCall[]", defaultValue: "DEMO_TOOL_CALLS", description: "tool, args, result/error, duration, status, permission, retryOf." },
      { prop: "onRetry", type: "(id) => void", description: "Retry a failed call." },
    ],
  },
  {
    slug: "approval-gate",
    title: "Approval Gate",
    description:
      "A standalone human gate for agent actions: the expiry bar drains in real time, and every terminal state is designed — approved, rejected, modified-then-approved, and expired.",
    phase: P5,
    sourceFile: "registry/default/ai/approval-gate.tsx",
    interactions: [
      { action: "Watch the bar", result: "Drains linearly; turns destructive in the final third; hitting zero lands the designed expired state" },
      { action: "Modify", result: "The payload becomes editable; approving sends your version, marked 'edited by reviewer'" },
      { action: "Reject", result: "Nothing is sent; the copy states what the agent does next" },
    ],
    props: [
      { prop: "action / payload", type: "string / string", description: "What the agent wants to do and the exact content being approved." },
      { prop: "details", type: "[string, string][]", description: "Key-value rows (recipients, cost…)." },
      { prop: "expiresInSec", type: "number", defaultValue: "60", description: "Countdown to the expired state." },
      { prop: "onDecision", type: "(state, payload) => void", description: "approved / modified / rejected / expired with the final payload." },
    ],
  },
  {
    slug: "grounded-answer",
    title: "Grounded Answer",
    description:
      "An answer that shows its work: per-claim citation chips light up the exact source quote, contradictions are surfaced inline instead of averaged away, and uncovered ground is stated.",
    phase: P5,
    sourceFile: "registry/default/ai/grounded-answer.tsx",
    interactions: [
      { action: "Mount", result: "Claims blur in sequentially like a considered answer" },
      { action: "Click a citation chip", result: "The matching source card highlights and pulses with its exact quote" },
      { action: "Read claim 2", result: "A contradiction note: the 2023 help page disagrees with the 2025 policy" },
      { action: "Check the dashed box", result: "What no source covers is said plainly, not guessed at" },
    ],
    props: [
      { prop: "question / claims / sources", type: "string / AnswerClaim[] / AnswerSource[]", defaultValue: "DEMO_ANSWER", description: "Claims carry sourceIds, confidence and optional contradiction." },
      { prop: "missingEvidence", type: "string[]", description: "What the sources don't cover." },
      { prop: "onFeedback", type: "(helpful: boolean) => void", description: "Helpful / not helpful." },
    ],
  },
];

DOCS.push(
  {
    slug: "card-payment",
    title: "Card Payment",
    description:
      "Add a card and pay in one surface: a live 3D card face detects the brand from the first digits, flips to its CVV strip when you focus the security field, and the pay button morphs through processing into a drawn-check paid state. Luhn and expiry are validated before the charge is allowed.",
    phase: P4,
    sourceFile: "registry/default/fintech/card-payment.tsx",
    interactions: [
      { action: "Type a card number", result: "The brand mark and card gradient update live (Visa, Mastercard, Amex, RuPay), grouping follows the brand and a check appears once Luhn passes" },
      { action: "Focus the CVV field", result: "The card springs to a 3D flip and shows the CVV on the signature strip" },
      { action: "Press Pay", result: "The button locks into a spinner, then morphs to a paid confirmation with a drawn check and the last 4" },
    ],
    props: [
      { prop: "amount", type: "number", description: "Amount to charge; shown on the pay button and the receipt." },
      { prop: "currency / locale", type: "string / string", defaultValue: '"₹" / "en-IN"', description: "Formatting for the amount." },
      { prop: "onPaid", type: "(d: { brand, last4, amount }) => void", description: "Fires after the charge succeeds." },
    ],
  },
  {
    slug: "penny-drop",
    title: "Penny Drop",
    description:
      "Bank-account verification by ₹1 deposit: it confirms the account is real and reads back the registered holder name. The stages reveal in sequence, the IFSC resolves to a bank as you type, and the returned name is scored against the expected one — verified, or flagged as a mismatch before money moves.",
    phase: P4,
    sourceFile: "registry/default/fintech/penny-drop.tsx",
    interactions: [
      { action: "Type an IFSC", result: "The bank name resolves live from the first four letters; an invalid code borders destructive" },
      { action: "Press Verify account", result: "Three stages cascade and complete in turn: ₹1 deposit, name fetch, name match" },
      { action: "Read the result", result: "The beneficiary name is revealed with a verified badge, or a mismatch warning with the match percentage against your expected name" },
    ],
    props: [
      { prop: "expectedName", type: "string", description: "Name you expect the account to belong to; drives the match read." },
      { prop: "onVerify", type: "(input) => Promise<PennyDropResult>", description: "Resolve the check against your API; defaults to a deterministic demo." },
    ],
  },
  {
    slug: "chart-trading",
    title: "Chart Trading",
    description:
      "Trading from the chart itself. Candles stagger in and re-draw on every timeframe switch, the order line is dragged straight onto the price you want, the depth rail breathes with the resting book, and a pre-trade panel re-scores spread, liquidity at your price, impact cost, book pressure, day-range position and volatility against the side you are about to take — a risky read makes you confirm before it will place.",
    phase: P4,
    sourceFile: "registry/default/fintech/chart-trading.tsx",
    interactions: [
      { action: "Switch timeframe", result: "The candle set re-staggers in (scaleY from the midpoint, 0.012s each) and the VWAP line re-draws from the left" },
      { action: "Hover the chart", result: "Crosshair follows the pointer via quickTo; the pinned OHLC legend reads the candle under it and the right axis shows the price at the pointer" },
      { action: "Drag the order line", result: "The limit price snaps to the tick as you drag; every pre-trade check re-scores live and the ticket total follows" },
      { action: "Click a depth level", result: "The order line tweens to that price — the rail's quantity bars breathe to each new resting size (0.7s power2.out)" },
      { action: "Flip buy ↔ sell", result: "The line, the place button and every side-dependent check recolor and the check rows re-cascade" },
      { action: "Place with a flagged check", result: "The button becomes a confirm step naming the failed check; confirming pops an order marker onto the chart at that level" },
      { action: "Keyboard the order line", result: "Focus the price handle: arrows nudge a tick, shift ten, PageUp/Down twenty, Home returns to the last traded price" },
    ],
    props: [
      { prop: "symbol / exchange / lastPrice / prevClose", type: "string / string / number / number", description: "Instrument identity and the tape that drives the change read and LTP flash." },
      { prop: "candles", type: "Candle[]", description: "{ label, o, h, l, c, v } oldest first for the active timeframe; generateCandles() ships for demos." },
      { prop: "bids / asks", type: "BookLevel[]", description: "Best-first ladders feeding the depth rail and every liquidity check; generateBook(mid) ships for demos." },
      { prop: "vwap / volume / dayHigh / dayLow", type: "number", description: "Session figures for the header and the range checks. VWAP draws as a dashed line; volume and the day range default to the candles on screen, so pass them to keep the read stable across timeframes." },
      { prop: "upperCircuit / lowerCircuit", type: "number", description: "Adds the circuit-headroom check when both are given." },
      { prop: "timeframes / timeframe / defaultTimeframe / onTimeframeChange", type: "string[] / string / string / (tf) => void", defaultValue: '["1m","5m","15m","1D"]', description: "Controlled or uncontrolled timeframe selection." },
      { prop: "lotSize / maxLots / tick", type: "number", defaultValue: "1 / 50 / 0.05", description: "Quantity per lot, the stepper ceiling and the price increment the order line snaps to." },
      { prop: "onLimitPriceChange", type: "(price: number) => void", description: "Fires whenever the order line lands on a new tick." },
      { prop: "onPlace", type: "(order: ChartOrder) => void", description: "Fires after placement with side, type, qty and effective price." },
    ],
  }
);

export function getDoc(slug: string): DocEntry | undefined {
  return DOCS.find((d) => d.slug === slug);
}

export const PHASES = [P8, P1, P2, P3, P4, P9, P10, P5, P6, P7];
