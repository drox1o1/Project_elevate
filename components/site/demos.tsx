"use client";

import * as React from "react";
import { Button } from "@/registry/default/ui/button";
import { Input } from "@/registry/default/ui/input";
import { Textarea } from "@/registry/default/ui/textarea";
import { Field } from "@/registry/default/ui/field";
import { FieldMessage } from "@/registry/default/ui/field-message";
import { Checkbox } from "@/registry/default/ui/checkbox";
import { Switch } from "@/registry/default/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/registry/default/ui/select";
import { RadioGroup, RadioGroupItem } from "@/registry/default/ui/radio-group";
import { Badge } from "@/registry/default/ui/badge";
import { Avatar, AvatarGroup } from "@/registry/default/ui/avatar";
import { Spinner } from "@/registry/default/ui/spinner";
import { Skeleton } from "@/registry/default/ui/skeleton";
import { Alert } from "@/registry/default/ui/alert";
import { toast } from "@/registry/default/ui/toast";
import { Progress } from "@/registry/default/ui/progress";
import { Kbd, CopyButton } from "@/registry/default/ui/kbd";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/registry/default/ui/dialog";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
} from "@/registry/default/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuShortcut,
} from "@/registry/default/ui/dropdown-menu";
import { SlideTabs } from "@/registry/default/ui/slide-tabs";
import { RevealAccordion } from "@/registry/default/ui/reveal-accordion";
import { StatCounter } from "@/registry/default/fintech/stat-counter";
import { NumberFlow } from "@/registry/default/fintech/number-flow";
import { AmountInput } from "@/registry/default/fintech/amount-input";
import { SparklineCard } from "@/registry/default/fintech/sparkline-card";
import { OTPInput } from "@/registry/default/fintech/otp-input";
import { TransactionList } from "@/registry/default/fintech/transaction-list";
import { StreamText } from "@/registry/default/ai/stream-text";
import { ThinkingIndicator } from "@/registry/default/ai/thinking-indicator";
import { ChatMessage, ChatList } from "@/registry/default/ai/chat-message";
import { AIPromptInput } from "@/registry/default/ai/ai-prompt-input";
import { SkillsCard } from "@/registry/default/ai/skills-card";
import { KineticHeading } from "@/registry/default/motion/kinetic-heading";
import { MagneticButton } from "@/registry/default/motion/magnetic-button";
import { Marquee } from "@/registry/default/motion/marquee";
import { Navbar } from "@/registry/default/ui/navbar";
import { LayoutGroup, motion } from "motion/react";
import { TextRollLink } from "@/registry/default/motion/text-roll-link";
import { ScrollRevealGrid } from "@/registry/default/motion/scroll-reveal-grid";
import { SignupCard } from "@/registry/default/blocks/signup-card";
import { LoginCard } from "@/registry/default/blocks/login-card";
import { PricingCard } from "@/registry/default/blocks/pricing-card";
import { NewsletterInput } from "@/registry/default/blocks/newsletter-input";
import {
  OptionChain,
  generateOptionChain,
} from "@/registry/default/fintech/option-chain";
import { GreeksPanel } from "@/registry/default/fintech/greeks-panel";
import { PortfolioRisk } from "@/registry/default/fintech/portfolio-risk";
import { KycFlow, type KycOutcome } from "@/registry/default/workflows/kyc-flow";
import { CryptoSwap } from "@/registry/default/crypto/crypto-swap";
import { AgentCanvas } from "@/registry/default/ai/agent-canvas";
import {
  BiomarkerTrend,
  DEMO_LDL,
} from "@/registry/default/health/biomarker-trend";
import {
  MarketDepth,
  generateDepth,
} from "@/registry/default/fintech/market-depth";
import { SipSimulator } from "@/registry/default/fintech/sip-simulator";
import {
  PaymentStatus,
  type PaymentScenario,
} from "@/registry/default/fintech/payment-status";
import {
  MedicationTimeline,
  DEMO_MEDICATIONS,
  DEMO_INTERACTIONS,
} from "@/registry/default/health/medication-timeline";
import {
  ClinicalRisk,
  DEMO_CARDIO_RISK,
} from "@/registry/default/health/clinical-risk";
import { VitalsMonitor } from "@/registry/default/health/vitals-monitor";
import { OrderTicket } from "@/registry/default/fintech/order-ticket";
import { StrategyBuilder } from "@/registry/default/fintech/strategy-builder";
import { BankLinking } from "@/registry/default/fintech/bank-linking";
import { ExpenseFeed } from "@/registry/default/fintech/expense-feed";
import { Reconciliation } from "@/registry/default/enterprise/reconciliation";
import { AuditLog } from "@/registry/default/enterprise/audit-log";
import { InvestigationTimeline } from "@/registry/default/enterprise/investigation-timeline";
import { EntityGraph } from "@/registry/default/enterprise/entity-graph";
import { FundCompare } from "@/registry/default/fintech/fund-compare";
import { LoanEligibility } from "@/registry/default/fintech/loan-eligibility";
import { ToolCallInspector } from "@/registry/default/ai/tool-call-inspector";
import { ApprovalGate } from "@/registry/default/ai/approval-gate";
import { GroundedAnswer, DEMO_ANSWER } from "@/registry/default/ai/grounded-answer";
import { CardPayment } from "@/registry/default/fintech/card-payment";
import { PennyDrop } from "@/registry/default/fintech/penny-drop";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const toggleSpring = { type: "spring", stiffness: 480, damping: 38 } as const;

/** Shared demo control: a custom-styled slider with a designed track,
 *  gradient fill and a focus-ringed thumb over a hidden native input. */
function DemoSlider({
  min,
  max,
  step = 1,
  value,
  onChange,
  className,
  "aria-label": ariaLabel,
}: {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (v: number) => void;
  className?: string;
  "aria-label": string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <span className={`relative inline-flex h-6 items-center ${className ?? ""}`}>
      <span className="pointer-events-none absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-muted ring-1 ring-inset ring-border/50" />
      <span
        className="pointer-events-none absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full"
        style={{
          width: `${pct}%`,
          background:
            "linear-gradient(90deg, color-mix(in oklab, var(--primary) 45%, transparent), var(--primary))",
        }}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={ariaLabel}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="peer absolute inset-0 z-20 w-full cursor-pointer appearance-none bg-transparent opacity-0"
      />
      <span
        className="pointer-events-none absolute top-1/2 z-10 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-background shadow-md transition-shadow peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background"
        style={{ left: `${pct}%` }}
      />
    </span>
  );
}

/** Shared demo control: a segmented toggle with a spring-driven pill. */
function SegmentedToggle({
  options,
  value,
  onChange,
  id,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  id: string;
}) {
  return (
    <LayoutGroup id={id}>
      <div className="isolate inline-flex rounded-xl bg-muted p-1">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={value === o.value}
            onClick={() => onChange(o.value)}
            className={
              "relative rounded-lg px-3 py-1 text-xs font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
              (value === o.value ? "text-foreground" : "text-muted-foreground hover:text-foreground")
            }
          >
            {value === o.value ? (
              <motion.span
                layoutId={`seg-${id}`}
                transition={toggleSpring}
                className="absolute inset-0 -z-10 rounded-lg bg-background shadow-sm"
              />
            ) : null}
            {o.label}
          </button>
        ))}
      </div>
    </LayoutGroup>
  );
}

function ButtonDemo() {
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  return (
    <div className="flex flex-col items-center gap-6">
      <Button
        loading={loading}
        success={success}
        onSuccessEnd={() => setSuccess(false)}
        onClick={async () => {
          setLoading(true);
          await wait(1200);
          setLoading(false);
          setSuccess(true);
        }}
      >
        Save changes
      </Button>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Delete</Button>
        <Button variant="link">Link</Button>
        <Button disabled>Disabled</Button>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm">Small</Button>
        <Button size="lg">Large</Button>
        <Button size="icon" aria-label="Add">
          +
        </Button>
      </div>
    </div>
  );
}

function InputDemo() {
  const [value, setValue] = React.useState("");
  return (
    <div className="flex w-full max-w-xs flex-col gap-4">
      <Input placeholder="Default input" />
      <Input
        placeholder="you@example.com"
        value={value}
        onChange={(e) => setValue(e.currentTarget.value)}
        valid={/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)}
      />
      <Input placeholder="Invalid state" invalid />
      <Input placeholder="Disabled" disabled />
    </div>
  );
}

function TextareaDemo() {
  return (
    <div className="w-full max-w-sm">
      <Textarea placeholder="Type a few lines — it grows instantly, caps at 8 rows…" />
    </div>
  );
}

function FieldDemo() {
  const [state, setState] = React.useState<"error" | "success" | "hint" | null>(
    null
  );
  const messages = {
    error: "Enter a valid email address",
    success: "Looks good",
    hint: "We never share your email",
  } as const;
  return (
    <div className="flex w-full max-w-xs flex-col gap-5">
      <Field
        label="Email"
        state={state}
        message={state ? messages[state] : null}
      >
        <Input placeholder="you@example.com" invalid={state === "error"} />
      </Field>
      <div className="flex flex-wrap gap-2">
        {(["error", "success", "hint", null] as const).map((s) => (
          <Button
            key={String(s)}
            size="sm"
            variant={state === s ? "default" : "outline"}
            onClick={() => setState(s)}
          >
            {s ?? "none"}
          </Button>
        ))}
      </div>
    </div>
  );
}

function CheckboxDemo() {
  return (
    <div className="flex flex-col gap-3">
      <label className="flex items-center gap-2.5 text-sm">
        <Checkbox defaultChecked /> Accept terms
      </label>
      <label className="flex items-center gap-2.5 text-sm">
        <Checkbox /> Subscribe to updates
      </label>
      <label className="flex items-center gap-2.5 text-sm">
        <Checkbox checked="indeterminate" /> Indeterminate
      </label>
      <label className="flex items-center gap-2.5 text-sm opacity-50">
        <Checkbox disabled /> Disabled
      </label>
    </div>
  );
}

function SwitchDemo() {
  return (
    <div className="flex flex-col gap-4">
      <label className="flex items-center gap-3 text-sm">
        <Switch defaultChecked /> Notifications
      </label>
      <label className="flex items-center gap-3 text-sm">
        <Switch /> Marketing emails
      </label>
      <label className="flex items-center gap-3 text-sm opacity-50">
        <Switch disabled /> Disabled
      </label>
    </div>
  );
}

function SelectDemo() {
  return (
    <div className="w-full max-w-56">
      <Select defaultValue="inr">
        <SelectTrigger aria-label="Currency">
          <SelectValue placeholder="Pick a currency" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="inr">INR — Indian rupee</SelectItem>
          <SelectItem value="usd">USD — US dollar</SelectItem>
          <SelectItem value="eur">EUR — Euro</SelectItem>
          <SelectItem value="gbp">GBP — Pound sterling</SelectItem>
          <SelectItem value="jpy">JPY — Japanese yen</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

function RadioGroupDemo() {
  return (
    <RadioGroup defaultValue="standard">
      {[
        ["standard", "Standard — 2–3 days"],
        ["express", "Express — next day"],
        ["pickup", "Pickup — today"],
      ].map(([value, label]) => (
        <label key={value} className="flex items-center gap-2.5 text-sm">
          <RadioGroupItem value={value} /> {label}
        </label>
      ))}
    </RadioGroup>
  );
}

function BadgeDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="success" pulse>
        Live
      </Badge>
      <Badge variant="destructive">Failed</Badge>
    </div>
  );
}

function AvatarDemo() {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-3">
        <Avatar fallback="DK" alt="Durgesh K" />
        <Avatar
          src="https://api.dicebear.com/9.x/thumbs/svg?seed=duku"
          alt="duku"
          fallback="DU"
        />
        <Avatar fallback="+" />
      </div>
      <AvatarGroup max={3}>
        <Avatar fallback="AB" />
        <Avatar fallback="CD" />
        <Avatar fallback="EF" />
        <Avatar fallback="GH" />
        <Avatar fallback="IJ" />
      </AvatarGroup>
    </div>
  );
}

function SpinnerDemo() {
  return (
    <div className="flex items-center gap-6">
      <Spinner size="sm" />
      <Spinner />
      <Spinner size="lg" />
    </div>
  );
}

function SkeletonDemo() {
  return (
    <div className="flex w-full max-w-xs items-center gap-3">
      <Skeleton className="size-10 rounded-full" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

function FieldMessageDemo() {
  const [state, setState] = React.useState<
    "error" | "success" | "hint" | null
  >("error");
  return (
    <div className="flex w-full max-w-xs flex-col gap-4">
      <div className="rounded-lg border border-border p-4">
        <p className="text-sm font-medium">Password</p>
        <FieldMessage state={state}>
          {state === "error"
            ? "Password must be at least 8 characters"
            : state === "success"
              ? "Strong password"
              : state === "hint"
                ? "Use 8+ characters with a mix of cases"
                : null}
        </FieldMessage>
      </div>
      <div className="flex flex-wrap gap-2">
        {(["error", "success", "hint", null] as const).map((s) => (
          <Button
            key={String(s)}
            size="sm"
            variant={state === s ? "default" : "outline"}
            onClick={() => setState(s)}
          >
            {s ?? "none"}
          </Button>
        ))}
      </div>
    </div>
  );
}

function AlertDemo() {
  const [visible, setVisible] = React.useState(true);
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <Alert variant="info" title="Heads up">
        Registry URLs changed in v2 — update your install commands.
      </Alert>
      <Alert variant="success" title="Payment received" />
      <Alert variant="destructive" title="Something went wrong">
        Your card was declined.
      </Alert>
      {visible ? (
        <Alert
          variant="warning"
          title="Dismiss me"
          onDismiss={() => setVisible(false)}
        >
          I collapse my own height on dismiss.
        </Alert>
      ) : (
        <Button size="sm" variant="outline" onClick={() => setVisible(true)}>
          Bring it back
        </Button>
      )}
    </div>
  );
}

function ToastDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Button
        variant="outline"
        onClick={() =>
          toast({
            title: "Event created",
            description: "Friday, July 10 at 5:30 PM",
            action: { label: "Undo", onClick: () => {} },
          })
        }
      >
        Default
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast({ title: "Payment received", variant: "success" })
        }
      >
        Success
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast({ title: "Transfer failed", variant: "destructive" })
        }
      >
        Destructive
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          void toast.promise(wait(1800), {
            loading: "Sending ₹12,000…",
            success: "Sent to Aditi",
            error: "Transfer failed",
          })
        }
      >
        toast.promise
      </Button>
    </div>
  );
}

function ProgressDemo() {
  const [value, setValue] = React.useState(35);
  return (
    <div className="flex w-full max-w-xs flex-col items-center gap-6">
      <Progress value={value} />
      <div className="flex items-center gap-4">
        <Progress variant="circle" value={value} />
        <Button
          size="sm"
          variant="outline"
          onClick={() => setValue((v) => (v >= 100 ? 15 : v + 25))}
        >
          Advance
        </Button>
      </div>
      <Progress indeterminate />
    </div>
  );
}

function KbdDemo() {
  return (
    <div className="flex items-center gap-6">
      <span className="flex items-center gap-1 text-sm text-muted-foreground">
        Press <Kbd>⌘</Kbd>
        <Kbd>K</Kbd> to search
      </span>
      <span className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 py-1 pl-3 pr-1 font-mono text-xs">
        npx shadcn add button
        <CopyButton value="npx shadcn add button" />
      </span>
    </div>
  );
}

function DialogDemo() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete workspace?</DialogTitle>
          <DialogDescription>
            This permanently deletes “duku-prod” and all of its data.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant="destructive">Delete</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DrawerDemo() {
  return (
    <div className="flex gap-2">
      <Drawer side="right">
        <DrawerTrigger asChild>
          <Button variant="outline">Right drawer</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerTitle className="text-lg font-semibold">
            Transaction details
          </DrawerTitle>
          <DrawerDescription className="mt-1 text-sm text-muted-foreground">
            Slides on the standard spring.
          </DrawerDescription>
        </DrawerContent>
      </Drawer>
      <Drawer side="bottom">
        <DrawerTrigger asChild>
          <Button variant="outline">Bottom sheet</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerTitle className="text-lg font-semibold">
            Drag me down
          </DrawerTitle>
          <DrawerDescription className="mt-1 text-sm text-muted-foreground">
            Past 120px (or flick) to dismiss.
          </DrawerDescription>
          <div className="h-40" />
        </DrawerContent>
      </Drawer>
    </div>
  );
}

function DropdownMenuDemo() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Account</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>durgesh@duku.design</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          Profile <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>Billing</DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Team</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>Invite member</DropdownMenuItem>
            <DropdownMenuItem>Manage roles</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem destructive>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SlideTabsDemo() {
  return (
    <SlideTabs
      className="max-w-sm"
      items={[
        {
          value: "overview",
          label: "Overview",
          content: (
            <p className="text-sm text-muted-foreground">
              Balance, recent activity and quick actions live here.
            </p>
          ),
        },
        {
          value: "analytics",
          label: "Analytics",
          content: (
            <p className="text-sm text-muted-foreground">
              Charts and breakdowns. Content slides in from the travel
              direction.
            </p>
          ),
        },
        {
          value: "settings",
          label: "Settings",
          content: (
            <p className="text-sm text-muted-foreground">
              Profile, notifications and security.
            </p>
          ),
        },
      ]}
    />
  );
}

function NavbarDemo() {
  const links = [
    { href: "#home", label: "Home" },
    { href: "#docs", label: "Docs" },
    { href: "#pricing", label: "Pricing" },
  ];
  const [active, setActive] = React.useState("#home");
  return (
    <div
      className="w-full max-w-lg overflow-hidden rounded-xl border border-border"
      onClickCapture={(e) => {
        const a = (e.target as HTMLElement).closest("a[href^='#']");
        if (a) {
          e.preventDefault();
          setActive(a.getAttribute("href") as string);
        }
      }}
    >
      {/* LayoutGroup namespaces the underline's layoutId so it never clashes
          with the real site navbar at the top of the page. */}
      <LayoutGroup id="navbar-demo">
        <Navbar
          className="!static bg-background"
          links={links}
          activeHref={active}
          logo={
            <span className="text-sm font-semibold text-foreground">duku</span>
          }
          cta={<span className="text-xs text-muted-foreground">v1.0</span>}
        />
      </LayoutGroup>
      <div className="flex h-24 items-center justify-center px-6 text-center text-xs text-muted-foreground">
        Click the links to spring the shared-layout underline. Narrow the window
        for the hamburger → X mobile menu.
      </div>
    </div>
  );
}

function RevealAccordionDemo() {
  return (
    <RevealAccordion
      className="max-w-md"
      items={[
        {
          value: "install",
          question: "How do I install a component?",
          answer:
            "npx shadcn@latest add https://labs.duku.design/r/<name>.json — you own the source afterwards.",
        },
        {
          value: "motion",
          question: "Why springs here instead of GSAP?",
          answer:
            "Spring-based height feels better for accordions: it settles with mass instead of easing to a stop.",
        },
        {
          value: "license",
          question: "What does the license cover?",
          answer:
            "Unlimited projects. The free tier includes the core primitives plus kinetic-heading and magnetic-button.",
        },
      ]}
    />
  );
}

function StatCounterDemo() {
  return (
    <div className="flex flex-wrap items-end justify-center gap-10">
      <StatCounter value={128400} prefix="₹" label="Assets under management" delta={12.4} />
      <StatCounter value={99.98} decimals={2} suffix="%" label="Uptime" />
      <StatCounter value={4821} label="Customers" delta={-2.1} />
    </div>
  );
}

function NumberFlowDemo() {
  const [value, setValue] = React.useState(84520.5);
  return (
    <div className="flex flex-col items-center gap-6">
      <span className="text-4xl font-semibold tracking-tight">
        <NumberFlow value={value} prefix="₹" decimals={2} locale="en-IN" trend />
      </span>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setValue((v) => +(v + 1234.25).toFixed(2))}
        >
          +1,234.25
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setValue((v) => +(v - 890.75).toFixed(2))}
        >
          −890.75
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setValue(+(Math.random() * 900000).toFixed(2))}
        >
          Randomize
        </Button>
      </div>
    </div>
  );
}

function AmountInputDemo() {
  const [format, setFormat] = React.useState<"us" | "eu" | "in" | "space">(
    "in"
  );
  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-6">
      <AmountInput numberFormat={format} prefix="₹" aria-label="Amount" />
      <SegmentedToggle
        id="amount-format"
        value={format}
        onChange={(v) => setFormat(v as "us" | "eu" | "in" | "space")}
        options={[
          { value: "in", label: "in" },
          { value: "us", label: "us" },
          { value: "eu", label: "eu" },
          { value: "space", label: "space" },
        ]}
      />
    </div>
  );
}

function SparklineCardDemo() {
  return (
    <SparklineCard
      title="Portfolio value"
      value={482100}
      prefix="₹"
      delta={8.3}
      data={[42, 48, 44, 52, 49, 58, 56, 64, 61, 70, 68, 78]}
    />
  );
}

function OTPInputDemo() {
  const [error, setError] = React.useState(false);
  return (
    <div className="flex flex-col items-center gap-5">
      <OTPInput
        length={6}
        error={error}
        onComplete={(code) =>
          toast({ title: `Code entered: ${code}`, variant: "success" })
        }
      />
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          setError(true);
          setTimeout(() => setError(false), 900);
        }}
      >
        Simulate wrong code
      </Button>
    </div>
  );
}

function TransactionListDemo() {
  const [loading, setLoading] = React.useState(false);
  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <TransactionList
        loading={loading}
        items={[
          { id: "1", title: "Swiggy", subtitle: "Food & drinks", amount: -420 },
          { id: "2", title: "Salary", subtitle: "Acme Corp", amount: 85000 },
          { id: "3", title: "Uber", subtitle: "Transport", amount: -240.5 },
          { id: "4", title: "Refund — Amazon", subtitle: "Shopping", amount: 1299 },
          { id: "5", title: "Netflix", subtitle: "Entertainment", amount: -649 },
        ]}
      />
      <Button
        size="sm"
        variant="outline"
        className="self-center"
        onClick={() => {
          setLoading(true);
          setTimeout(() => setLoading(false), 1600);
        }}
      >
        Replay loading
      </Button>
    </div>
  );
}

function StreamTextDemo() {
  return (
    <StreamText text="Here's what I found: the payment failed because the card's daily limit was reached. I've queued a retry for tomorrow morning and notified the customer — no action needed from you." />
  );
}

function ThinkingIndicatorDemo() {
  return (
    <div className="flex flex-col items-start gap-4">
      <ThinkingIndicator />
      <ThinkingIndicator label="Searching the docs" />
    </div>
  );
}

function ChatMessageDemo() {
  return (
    <ChatList className="w-full max-w-md">
      <ChatMessage role="user">
        Can you summarize last month&apos;s spend?
      </ChatMessage>
      <ChatMessage role="assistant" streaming>
        You spent ₹42,300 last month — 18% less than June. Food was your
        biggest category at ₹12,400.
      </ChatMessage>
    </ChatList>
  );
}

function AIPromptInputDemo() {
  return (
    <div className="w-full max-w-lg">
      <AIPromptInput
        onSubmit={async (v) => {
          await wait(1200);
          if (v.toLowerCase().includes("fail")) throw new Error("nope");
          toast({ title: "Message sent", variant: "success" });
        }}
        actions={
          <span className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">
            claude-fable-5
          </span>
        }
      />
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Type “fail” to see the rejection shake.
      </p>
    </div>
  );
}

function SkillsCardDemo() {
  return (
    <SkillsCard
      title="Agent skills"
      skills={[
        { id: "1", name: "Web search", description: "Query and cite live sources" },
        { id: "2", name: "Code execution", description: "Run Python in a sandbox" },
        { id: "3", name: "File analysis", description: "Parse CSVs, PDFs and images" },
        { id: "4", name: "Memory", description: "Recall context across sessions" },
      ]}
    />
  );
}

function KineticHeadingDemo() {
  return (
    <KineticHeading
      as="h2"
      text="Motion is the product"
      className="text-center"
    />
  );
}

function MagneticButtonDemo() {
  return <MagneticButton>Start building</MagneticButton>;
}

function MarqueeDemo() {
  return (
    <Marquee className="max-w-lg" speed={18}>
      {["Acme", "Globex", "Umbrella", "Initech", "Hooli", "Stark"].map(
        (name) => (
          <span
            key={name}
            className="text-lg font-semibold tracking-tight text-muted-foreground"
          >
            {name}
          </span>
        )
      )}
    </Marquee>
  );
}

function TextRollLinkDemo() {
  return (
    <div className="flex gap-8">
      <TextRollLink label="Documentation" href="#docs" />
      <TextRollLink label="Changelog" href="#changelog" />
      <TextRollLink label="GitHub" href="#github" />
    </div>
  );
}

function ScrollRevealGridDemo() {
  return (
    <ScrollRevealGrid className="w-full max-w-lg sm:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex h-20 items-center justify-center rounded-xl border border-border bg-card text-sm text-muted-foreground"
        >
          Card {i + 1}
        </div>
      ))}
    </ScrollRevealGrid>
  );
}

function SignupCardDemo() {
  return (
    <SignupCard
      onSubmit={async ({ email }) => {
        await wait(1400);
        if (email.includes("fail")) throw new Error("That email is taken.");
      }}
      onOAuth={() => toast({ title: "OAuth flow would start here" })}
      loginHref="#signin"
    />
  );
}

function LoginCardDemo() {
  return (
    <LoginCard
      onSubmit={async ({ email }) => {
        await wait(1200);
        if (email.includes("fail")) throw new Error("Invalid email or password.");
      }}
      signupHref="#signup"
    />
  );
}

function PricingCardDemo() {
  return (
    <PricingCard
      plan="Pro"
      description="For teams shipping motion-heavy products."
      monthlyPrice={49}
      yearlyPrice={470}
      features={[
        "Every component in the catalog",
        "Registry access + updates",
        "Unlimited projects",
        "Priority support",
      ]}
      featured
    />
  );
}

function NewsletterInputDemo() {
  return (
    <NewsletterInput
      onSubmit={async () => {
        await wait(1200);
      }}
    />
  );
}

function OptionChainDemo() {
  const reduced = useReducedMotion();
  const [spot, setSpot] = React.useState(24_812.4);
  const [expiry, setExpiry] = React.useState("17 Jul");
  const dte = { "17 Jul": 4, "24 Jul": 11, "31 Jul": 18 }[expiry] ?? 7;

  React.useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => {
      setSpot((s) => +(s + (Math.random() - 0.5) * 18).toFixed(2));
    }, 1600);
    return () => clearInterval(id);
  }, [reduced]);

  const rows = React.useMemo(
    () => generateOptionChain({ spot, span: 5, dte }),
    [spot, dte]
  );

  return (
    <div className="w-full">
      <OptionChain
        rows={rows}
        spot={spot}
        expiries={["17 Jul", "24 Jul", "31 Jul"]}
        expiry={expiry}
        onExpiryChange={setExpiry}
        onOrder={(o) =>
          toast({
            title: `${o.action === "buy" ? "Buy" : "Sell"} ${o.side} ${o.strike}`,
            description: `Limit ₹${o.price.toFixed(2)} · 1 lot`,
            variant: "success",
          })
        }
      />
    </div>
  );
}

function GreeksPanelDemo() {
  const [spot, setSpot] = React.useState(24_800);
  const [side, setSide] = React.useState<"call" | "put">("call");
  return (
    <div className="flex w-full max-w-md flex-col items-stretch gap-4">
      <GreeksPanel side={side} strike={24_800} spot={spot} dte={7} />
      <div className="flex items-center gap-3">
        <SegmentedToggle
          options={[
            { value: "call", label: "Call" },
            { value: "put", label: "Put" },
          ]}
          value={side}
          onChange={(v) => setSide(v as "call" | "put")}
          id="greeks-side"
        />
        <label className="flex flex-1 items-center gap-2.5 text-xs text-muted-foreground">
          Spot
          <DemoSlider
            min={24_200}
            max={25_400}
            step={20}
            value={spot}
            onChange={setSpot}
            aria-label="Spot price"
            className="flex-1"
          />
          <span className="w-14 text-right font-medium tabular-nums text-foreground">
            {new Intl.NumberFormat("en-IN").format(spot)}
          </span>
        </label>
      </div>
    </div>
  );
}

function KycFlowDemo() {
  const [outcome, setOutcome] = React.useState<KycOutcome>("approved");
  const [run, setRun] = React.useState(0);
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>Outcome</span>
        <SegmentedToggle
          id="kyc-outcome"
          value={outcome}
          onChange={(v) => {
            setOutcome(v as KycOutcome);
            setRun((r) => r + 1);
          }}
          options={[
            { value: "approved", label: "Approved" },
            { value: "manual-review", label: "Manual review" },
          ]}
        />
      </div>
      <KycFlow
        key={`${outcome}-${run}`}
        outcome={outcome}
        initialData={{ name: "Asha Verma", email: "asha@example.com", dob: "1993-04-12", pan: "ABCDE1234F" }}
        onComplete={(_, o) =>
          toast({
            title: o === "approved" ? "KYC approved" : "Sent to manual review",
            variant: o === "approved" ? "success" : "default",
          })
        }
      />
    </div>
  );
}

function CryptoSwapDemo() {
  return (
    <CryptoSwap
      onSwapped={(d) =>
        toast({
          title: "Swap confirmed",
          description: `${d.amountIn} ${d.from} → ${d.amountOut.toFixed(5)} ${d.to}`,
          variant: "success",
        })
      }
    />
  );
}

function AgentCanvasDemo() {
  return (
    <AgentCanvas
      goal="Refund order #8412 and notify the customer"
      steps={[
        {
          id: "lookup",
          title: "Locate the order and payment",
          toolCalls: [
            { tool: "orders.get", args: 'id: "8412"', result: "₹2,499 · paid via UPI", duration: 900 },
            { tool: "payments.lookup", args: 'order: "8412"', result: "txn_9f2c settled", duration: 800 },
          ],
        },
        {
          id: "refund",
          title: "Issue the refund",
          approval: { summary: "Refund ₹2,499 to the original UPI handle?" },
          toolCalls: [
            { tool: "payments.refund", args: "txn_9f2c, full", result: "refund_51ab initiated", duration: 1100, failsOnceWith: "gateway timeout (504)" },
          ],
        },
        {
          id: "notify",
          title: "Notify the customer",
          toolCalls: [
            { tool: "email.send", args: "template: refund_confirmed", result: "queued", duration: 800 },
          ],
        },
      ]}
      artifact={
        <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-foreground">
          Refund <span className="font-semibold">refund_51ab</span> completed and
          confirmation emailed — 3 steps, 1 approval, 1 retry.
        </div>
      }
    />
  );
}

function PortfolioRiskDemo() {
  return <PortfolioRisk className="max-w-full" />;
}

function BiomarkerTrendDemo() {
  return <BiomarkerTrend {...DEMO_LDL} className="max-w-full" />;
}

function MarketDepthDemo() {
  const reduced = useReducedMotion();
  // A stable ladder: the price levels stay fixed and only the resting
  // quantities drift, so the depth bars breathe smoothly instead of the
  // whole book reshuffling and re-animating from zero each tick.
  const base = React.useMemo(() => generateDepth(1543.4), []);
  const [book, setBook] = React.useState(base);
  const [last, setLast] = React.useState(1543.4);

  React.useEffect(() => {
    if (reduced) return;
    const walk = (l: (typeof base)["bids"][number]) => ({
      ...l,
      // gentle ±8% random walk, floored so a level never disappears
      qty: Math.max(300, Math.round(l.qty * (1 + (Math.random() - 0.5) * 0.16))),
      orders: Math.max(1, l.orders + (Math.random() < 0.3 ? (Math.random() < 0.5 ? -1 : 1) : 0)),
    });
    const id = setInterval(() => {
      setBook((b) => ({ bids: b.bids.map(walk), asks: b.asks.map(walk) }));
      // last price ticks within the spread, occasionally, so the flash stays rare
      if (Math.random() < 0.5) {
        setLast((p) => +(p + (Math.random() - 0.5) * 0.08).toFixed(2));
      }
    }, 1800);
    return () => clearInterval(id);
  }, [reduced, base]);

  return (
    <MarketDepth
      symbol="HDFCBANK"
      bids={book.bids}
      asks={book.asks}
      lastPrice={last}
      atp={1542.1}
      onLevelSelect={(side, level) =>
        toast({
          title: `${side === "bid" ? "Sell to bid" : "Buy from ask"} @ ₹${level.price.toFixed(2)}`,
          description: `${level.qty} qty across ${level.orders} orders`,
        })
      }
    />
  );
}

function SipSimulatorDemo() {
  return <SipSimulator goal={20_000_000} className="max-w-full" />;
}

function PaymentStatusDemo() {
  const [scenario, setScenario] = React.useState<PaymentScenario>("success");
  const [play, setPlay] = React.useState(0);
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <SegmentedToggle
        id="payment-scenario"
        value={scenario}
        onChange={(v) => {
          setScenario(v as PaymentScenario);
          setPlay((p) => p + 1);
        }}
        options={[
          { value: "success", label: "Success" },
          { value: "failed", label: "Failed" },
          { value: "refunded", label: "Refunded" },
        ]}
      />
      <PaymentStatus
        amount={2499}
        reference="pay_Nk8Yw2 · Order #8412"
        scenario={scenario}
        playKey={play}
      />
    </div>
  );
}

function MedicationTimelineDemo() {
  return (
    <MedicationTimeline
      medications={DEMO_MEDICATIONS}
      interactions={DEMO_INTERACTIONS}
      className="max-w-full"
    />
  );
}

function ClinicalRiskDemo() {
  return (
    <ClinicalRisk
      {...DEMO_CARDIO_RISK}
      onEscalate={() =>
        toast({ title: "Sent for clinician review", variant: "success" })
      }
    />
  );
}

function VitalsMonitorDemo() {
  const [alarm, setAlarm] = React.useState(false);
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <VitalsMonitor alarm={alarm} />
      <Button size="sm" variant="outline" onClick={() => setAlarm((a) => !a)}>
        {alarm ? "Resolve alarm" : "Simulate tachycardia"}
      </Button>
    </div>
  );
}

function OrderTicketDemo() {
  return (
    <OrderTicket
      symbol="NIFTY 24800 CE"
      lastPrice={147.35}
      bestBid={147.1}
      bestAsk={147.6}
      availableMargin={25_000}
      onPlaced={(o) =>
        toast({
          title: `${o.side === "buy" ? "Bought" : "Sold"} ${o.qty} @ ${o.price ?? "market"}`,
          variant: "success",
        })
      }
    />
  );
}

function StrategyBuilderDemo() {
  return <StrategyBuilder spot={24_812} className="max-w-full" />;
}

function BankLinkingDemo() {
  return (
    <BankLinking
      onLinked={(d) =>
        toast({
          title: "Bank linked",
          description: `${d.accountIds.length} account(s) via ${d.bank}`,
          variant: "success",
        })
      }
    />
  );
}

function ExpenseFeedDemo() {
  return <ExpenseFeed className="max-w-full" />;
}

function ReconciliationDemo() {
  return <Reconciliation className="max-w-full" />;
}

function AuditLogDemo() {
  return (
    <AuditLog
      className="max-w-full"
      onExport={(v) =>
        toast({ title: `Exported ${v.length} events`, variant: "success" })
      }
    />
  );
}

function InvestigationTimelineDemo() {
  return <InvestigationTimeline className="max-w-full" />;
}

function EntityGraphDemo() {
  return <EntityGraph className="max-w-full" />;
}

function FundCompareDemo() {
  return <FundCompare className="max-w-full" />;
}

function LoanEligibilityDemo() {
  return <LoanEligibility />;
}

function ToolCallInspectorDemo() {
  return (
    <ToolCallInspector
      className="max-w-full"
      onRetry={() => toast({ title: "Retrying payments.refund…" })}
    />
  );
}

function ApprovalGateDemo() {
  const [run, setRun] = React.useState(0);
  return (
    <div className="flex w-full flex-col items-center gap-3">
      <ApprovalGate
        key={run}
        action="Send refund confirmation to the customer"
        payload={
          "Hi Asha — your refund of ₹2,499 for order #8412 has been initiated and will reach your account in 5–7 working days."
        }
        details={[
          ["Recipient", "asha@example.com"],
          ["Channel", "Transactional email"],
          ["Triggered by", "agent · refund workflow"],
        ]}
        expiresInSec={45}
        onDecision={(state) =>
          toast({
            title: `Gate ${state}`,
            variant: state === "approved" || state === "modified" ? "success" : "default",
          })
        }
      />
      <Button size="sm" variant="ghost" onClick={() => setRun((r) => r + 1)}>
        Reset gate
      </Button>
    </div>
  );
}

function GroundedAnswerDemo() {
  return (
    <GroundedAnswer
      className="max-w-full"
      question={DEMO_ANSWER.question!}
      onFeedback={(h) =>
        toast({ title: h ? "Marked helpful" : "Marked not helpful" })
      }
    />
  );
}

function CardPaymentDemo() {
  return (
    <CardPayment
      amount={2499}
      onPaid={(d) =>
        toast({
          title: `Paid ₹2,499 · ${d.brand} ••${d.last4}`,
          variant: "success",
        })
      }
    />
  );
}

function PennyDropDemo() {
  return (
    <PennyDrop
      expectedName="Asha Verma"
      onVerify={async ({ ifsc }) => {
        await wait(300);
        return {
          beneficiaryName: "ASHA VERMA",
          bank:
            { HDFC: "HDFC Bank", ICIC: "ICICI Bank", SBIN: "State Bank of India" }[
              ifsc.slice(0, 4)
            ] ?? "Your bank",
          matchScore: 1,
          status: "verified" as const,
        };
      }}
    />
  );
}

export const DEMOS: Record<string, React.ComponentType> = {
  "card-payment": CardPaymentDemo,
  "penny-drop": PennyDropDemo,
  "investigation-timeline": InvestigationTimelineDemo,
  "entity-graph": EntityGraphDemo,
  "fund-compare": FundCompareDemo,
  "loan-eligibility": LoanEligibilityDemo,
  "tool-call-inspector": ToolCallInspectorDemo,
  "approval-gate": ApprovalGateDemo,
  "grounded-answer": GroundedAnswerDemo,
  "order-ticket": OrderTicketDemo,
  "strategy-builder": StrategyBuilderDemo,
  "bank-linking": BankLinkingDemo,
  "expense-feed": ExpenseFeedDemo,
  "reconciliation": ReconciliationDemo,
  "audit-log": AuditLogDemo,
  "market-depth": MarketDepthDemo,
  "sip-simulator": SipSimulatorDemo,
  "payment-status": PaymentStatusDemo,
  "medication-timeline": MedicationTimelineDemo,
  "clinical-risk": ClinicalRiskDemo,
  "vitals-monitor": VitalsMonitorDemo,
  "option-chain": OptionChainDemo,
  "greeks-panel": GreeksPanelDemo,
  "kyc-flow": KycFlowDemo,
  "crypto-swap": CryptoSwapDemo,
  "agent-canvas": AgentCanvasDemo,
  "portfolio-risk": PortfolioRiskDemo,
  "biomarker-trend": BiomarkerTrendDemo,
  button: ButtonDemo,
  input: InputDemo,
  textarea: TextareaDemo,
  field: FieldDemo,
  checkbox: CheckboxDemo,
  switch: SwitchDemo,
  select: SelectDemo,
  "radio-group": RadioGroupDemo,
  badge: BadgeDemo,
  avatar: AvatarDemo,
  spinner: SpinnerDemo,
  skeleton: SkeletonDemo,
  "field-message": FieldMessageDemo,
  alert: AlertDemo,
  toast: ToastDemo,
  progress: ProgressDemo,
  kbd: KbdDemo,
  dialog: DialogDemo,
  drawer: DrawerDemo,
  "dropdown-menu": DropdownMenuDemo,
  "slide-tabs": SlideTabsDemo,
  navbar: NavbarDemo,
  "reveal-accordion": RevealAccordionDemo,
  "stat-counter": StatCounterDemo,
  "number-flow": NumberFlowDemo,
  "amount-input": AmountInputDemo,
  "sparkline-card": SparklineCardDemo,
  "otp-input": OTPInputDemo,
  "transaction-list": TransactionListDemo,
  "stream-text": StreamTextDemo,
  "thinking-indicator": ThinkingIndicatorDemo,
  "chat-message": ChatMessageDemo,
  "ai-prompt-input": AIPromptInputDemo,
  "skills-card": SkillsCardDemo,
  "kinetic-heading": KineticHeadingDemo,
  "magnetic-button": MagneticButtonDemo,
  marquee: MarqueeDemo,
  "text-roll-link": TextRollLinkDemo,
  "scroll-reveal-grid": ScrollRevealGridDemo,
  "signup-card": SignupCardDemo,
  "login-card": LoginCardDemo,
  "pricing-card": PricingCardDemo,
  "newsletter-input": NewsletterInputDemo,
};
