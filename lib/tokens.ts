/**
 * Machine-readable token documentation for DUKU Labs.
 *
 * Mirrors the CSS custom properties declared in app/globals.css. Served to
 * coding agents via the MCP resource `duku://tokens/default` so they can map
 * DUKU tokens onto an existing project's theme.
 */

export interface TokenDef {
  name: string;
  cssVar: string;
  light?: string;
  dark?: string;
  value?: string;
  description: string;
}

export interface TokenLayer {
  layer: "foundation" | "semantic" | "domain" | "motion";
  description: string;
  tokens: TokenDef[];
}

export const TOKEN_LAYERS: TokenLayer[] = [
  {
    layer: "foundation",
    description:
      "shadcn-compatible base theme. Every component consumes these via Tailwind color utilities (bg-background, text-foreground, …), so remapping the CSS variables retunes the whole library.",
    tokens: [
      { name: "background", cssVar: "--background", light: "hsl(0 0% 100%)", dark: "hsl(240 10% 3.9%)", description: "Page background." },
      { name: "foreground", cssVar: "--foreground", light: "hsl(240 10% 3.9%)", dark: "hsl(0 0% 98%)", description: "Default text." },
      { name: "card", cssVar: "--card", light: "hsl(0 0% 100%)", dark: "hsl(240 10% 5.9%)", description: "Card surfaces." },
      { name: "primary", cssVar: "--primary", light: "hsl(240 5.9% 10%)", dark: "hsl(0 0% 98%)", description: "Primary action color." },
      { name: "secondary", cssVar: "--secondary", light: "hsl(240 4.8% 95.9%)", dark: "hsl(240 3.7% 15.9%)", description: "Secondary surfaces and actions." },
      { name: "muted", cssVar: "--muted", light: "hsl(240 4.8% 95.9%)", dark: "hsl(240 3.7% 15.9%)", description: "Muted surfaces; muted-foreground for secondary text." },
      { name: "accent", cssVar: "--accent", light: "hsl(240 4.8% 95.9%)", dark: "hsl(240 3.7% 15.9%)", description: "Hover/active accents." },
      { name: "destructive", cssVar: "--destructive", light: "hsl(0 84.2% 60.2%)", dark: "hsl(0 62.8% 50.6%)", description: "Errors and destructive actions." },
      { name: "border", cssVar: "--border", light: "hsl(240 5.9% 90%)", dark: "hsl(240 3.7% 15.9%)", description: "Hairline borders." },
      { name: "ring", cssVar: "--ring", light: "hsl(240 5.9% 10%)", dark: "hsl(240 4.9% 83.9%)", description: "Focus ring." },
      { name: "radius", cssVar: "--radius", value: "0.625rem", description: "Base corner radius; sm/md/lg/xl derive from it." },
    ],
  },
  {
    layer: "semantic",
    description: "Intent colors shared across states and feedback components.",
    tokens: [
      { name: "success", cssVar: "--success", light: "hsl(161 94% 30%)", dark: "hsl(158 64% 52%)", description: "Positive outcomes: valid input, completed steps, success morphs." },
      { name: "warning", cssVar: "--warning", light: "hsl(32 95% 44%)", dark: "hsl(38 92% 50%)", description: "Caution states and pending review." },
      { name: "info", cssVar: "--info", light: "hsl(217 91% 60%)", dark: "hsl(213 94% 68%)", description: "Informational alerts and neutral emphasis." },
    ],
  },
  {
    layer: "domain",
    description:
      "Product-domain colors for fintech, trading and agent interfaces. Components in those domains read these instead of raw palette values.",
    tokens: [
      { name: "market-up", cssVar: "--market-up", light: "hsl(161 94% 30%)", dark: "hsl(158 64% 52%)", description: "Rising prices, positive deltas." },
      { name: "market-down", cssVar: "--market-down", light: "hsl(0 84.2% 60.2%)", dark: "hsl(0 62.8% 50.6%)", description: "Falling prices, negative deltas." },
      { name: "bid", cssVar: "--bid", light: "hsl(217 91% 60%)", dark: "hsl(213 94% 68%)", description: "Bid side of depth ladders and order books." },
      { name: "ask", cssVar: "--ask", light: "hsl(32 95% 44%)", dark: "hsl(38 92% 50%)", description: "Ask side of depth ladders and order books." },
      { name: "risk-low", cssVar: "--risk-low", light: "hsl(161 94% 30%)", dark: "hsl(158 64% 52%)", description: "Low risk classification." },
      { name: "risk-medium", cssVar: "--risk-medium", light: "hsl(32 95% 44%)", dark: "hsl(38 92% 50%)", description: "Medium risk classification." },
      { name: "risk-high", cssVar: "--risk-high", light: "hsl(0 84.2% 60.2%)", dark: "hsl(0 62.8% 50.6%)", description: "High risk classification." },
      { name: "agent-active", cssVar: "--agent-active", light: "hsl(217 91% 60%)", dark: "hsl(213 94% 68%)", description: "Agent step currently executing." },
      { name: "agent-waiting", cssVar: "--agent-waiting", light: "hsl(32 95% 44%)", dark: "hsl(38 92% 50%)", description: "Agent step awaiting approval or input." },
      { name: "agent-error", cssVar: "--agent-error", light: "hsl(0 84.2% 60.2%)", dark: "hsl(0 62.8% 50.6%)", description: "Agent step failed." },
    ],
  },
  {
    layer: "motion",
    description:
      "The house motion vocabulary. GSAP tweens and motion springs read from these values; every component also honors prefers-reduced-motion via the use-reduced-motion hook.",
    tokens: [
      { name: "duration-fast", cssVar: "--motion-duration-fast", value: "150ms", description: "Micro feedback: crossfades, press states." },
      { name: "duration-base", cssVar: "--motion-duration-base", value: "300ms", description: "Standard transitions: entrances, state changes." },
      { name: "duration-slow", cssVar: "--motion-duration-slow", value: "500ms", description: "Large layout moves and value tweens." },
      { name: "ease-out", cssVar: "--motion-ease-out", value: "cubic-bezier(0.22, 1, 0.36, 1)", description: "Default exit-decelerate easing." },
      { name: "ease-in-out", cssVar: "--motion-ease-in-out", value: "cubic-bezier(0.65, 0, 0.35, 1)", description: "Symmetric easing for reversible moves." },
      { name: "spring-stiffness", cssVar: "--motion-spring-stiffness", value: "380", description: "The standard spring (stiffness 380, damping 32) used by switch, drawer, toast, tabs." },
      { name: "spring-damping", cssVar: "--motion-spring-damping", value: "32", description: "Damping for the standard spring." },
      { name: "stagger", cssVar: "--motion-stagger", value: "50ms", description: "Default cascade interval for list/grid entrances." },
    ],
  },
];
