import type React from "react"
import type { Metadata } from "next"
import { Sorts_Mill_Goudy } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const sortsMillGoudy = Sorts_Mill_Goudy({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sorts-mill-goudy",
  weight: ["400"],
})

export const metadata: Metadata = {
  title: "Oriyali | Your Biorhythm Story",
  description:
    "Decode your unique neuro-hormonal patterns with personalized, proactive insights to harmonize your mood, energy, and focus every day.",
  keywords: [
    "Oriyali",
    "women's wellness",
    "hormone tracking",
    "biorhythm",
    "wearable biometrics",
  ],
  metadataBase: new URL("https://oriyali.example.com"),
  openGraph: {
    title: "Oriyali | Your Biorhythm Story",
    description:
      "Decode your unique neuro-hormonal patterns with personalized, proactive insights to harmonize your mood, energy, and focus every day.",
    url: "https://oriyali.example.com",
    siteName: "Oriyali",
    locale: "en_US",
    type: "website",
  },
  icons: {
    icon: [
      {
        url: "/favicon.png",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/favicon.png",
        type: "image/png",
      },
    ],
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <link rel="canonical" href="https://oriyali.example.com" />
      </head>
      <body className={`${sortsMillGoudy.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange={false}
          storageKey="oriyali-theme"
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
