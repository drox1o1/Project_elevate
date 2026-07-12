import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/registry/default/ui/toast";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "DUKU UI — motion-forward React components",
    template: "%s · DUKU UI",
  },
  description:
    "A complete React component library where every component ships with production-grade motion and full interaction states.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
