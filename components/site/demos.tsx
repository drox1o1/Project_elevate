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
import { TextRollLink } from "@/registry/default/motion/text-roll-link";
import { ScrollRevealGrid } from "@/registry/default/motion/scroll-reveal-grid";
import { SignupCard } from "@/registry/default/blocks/signup-card";
import { LoginCard } from "@/registry/default/blocks/login-card";
import { PricingCard } from "@/registry/default/blocks/pricing-card";
import { NewsletterInput } from "@/registry/default/blocks/newsletter-input";

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

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
  return (
    <div className="w-full max-w-lg overflow-hidden rounded-xl border border-border">
      <div className="flex h-40 flex-col">
        <div className="border-b border-border bg-background/80 backdrop-blur">
          <div className="flex h-12 items-center justify-between px-4 text-sm">
            <span className="font-semibold">duku</span>
            <div className="flex gap-4 text-muted-foreground">
              <span className="relative text-foreground">
                Home
                <span className="absolute inset-x-0 -bottom-3 mx-auto h-0.5 w-6 rounded-full bg-foreground" />
              </span>
              <span>Docs</span>
              <span>Pricing</span>
            </div>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center text-xs text-muted-foreground">
          The real Navbar is dogfooded at the top of this site — scroll to see
          the blur-in.
        </div>
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
            "npx shadcn@latest add https://duku.design/r/<name>.json — you own the source afterwards.",
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
            "Unlimited projects. The free tier includes kinetic-heading, magnetic-button and button.",
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
      <AmountInput
        key={format}
        numberFormat={format}
        prefix="₹"
        aria-label="Amount"
      />
      <div className="flex gap-2">
        {(["in", "us", "eu", "space"] as const).map((f) => (
          <Button
            key={f}
            size="sm"
            variant={format === f ? "default" : "outline"}
            onClick={() => setFormat(f)}
          >
            {f}
          </Button>
        ))}
      </div>
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
        "All 43 components",
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

export const DEMOS: Record<string, React.ComponentType> = {
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
