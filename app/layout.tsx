import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { GeistPixelSquare } from "geist/font/pixel";
import { Toaster } from "@/registry/default/ui/toast";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://labs.duku.design"),
  title: {
    default: "DUKU Labs — design engineering for AI-built products",
    template: "%s · DUKU Labs",
  },
  description:
    "An agent-ready design engineering system: production React components, engineered motion and complete interaction states — browsable by humans, discoverable by Claude Code, Codex and other MCP-compatible coding agents.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable} ${GeistPixelSquare.variable}`}
    >
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
