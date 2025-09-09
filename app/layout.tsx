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
    "biorhythm",
    "women's health",
    "hormonal health",
    "menstrual cycle",
    "wellness",
    "AI health",
    "personalized health",
    "neuro-hormonal patterns",
  ],
  authors: [{ name: "Terramedici Lifesciences LLP" }],
  creator: "Oriyali",
  publisher: "Terramedici Lifesciences LLP",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://oriyali.com",
    siteName: "Oriyali",
    title: "Oriyali | Your Biorhythm Story",
    description:
      "Decode your unique neuro-hormonal patterns with personalized, proactive insights to harmonize your mood, energy, and focus every day.",
    images: [
      {
        url: "https://oriyali.com/images/hero-landscape.jpeg",
        width: 1200,
        height: 630,
        alt: "Oriyali - Your Biorhythm Story",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Oriyali | Your Biorhythm Story",
    description:
      "Decode your unique neuro-hormonal patterns with personalized, proactive insights to harmonize your mood, energy, and focus every day.",
    images: ["https://oriyali.com/images/hero-landscape.jpeg"],
    creator: "@oriyali",
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
  manifest: "/manifest.json",
  alternates: {
    canonical: "https://oriyali.com",
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
        <link rel="canonical" href="https://oriyali.com" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#FF5B04" />
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
