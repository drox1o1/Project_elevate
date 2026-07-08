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
];

export function getDoc(slug: string): DocEntry | undefined {
  return DOCS.find((d) => d.slug === slug);
}

export const PHASES = [P1, P2, P3, P4, P5, P6, P7];
