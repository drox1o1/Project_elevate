"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { ChevronDown, Menu, X, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { HormoneChart } from "@/components/hormone-chart"
import { LifeStagesTimeline } from "@/components/life-stages-timeline"
import { ThemeToggle } from "@/components/theme-toggle"
import { submitWaitlistForm } from "@/app/actions/waitlist"
import Artwork55v1 from "@/components/artwork55v1"
import ErrorBoundary from "@/components/error-boundary"

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("hero")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [formSubmitted, setFormSubmitted] = useState(false)

  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  })

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["hero", "why", "how", "what", "research"]
      const scrollPosition = window.scrollY + 100

      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Keyboard navigation for menu
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isMenuOpen) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isMenuOpen])

  const navItems = [
    { id: "hero", label: "Home" },
    { id: "why", label: "Why" },
    { id: "how", label: "How" },
    { id: "what", label: "What" },
    { id: "research", label: "Research" },
  ]

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
      element.focus()
    }
    setIsMenuOpen(false)
  }

  const handleNavKeyDown = (event: React.KeyboardEvent, sectionId: string) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      scrollToSection(sectionId)
    }
  }

  const handleFormSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    setSubmitMessage(null)

    try {
      console.log("🚀 Submitting waitlist form...")
      const result = await submitWaitlistForm(formData)
      console.log("📥 Form result:", result)

      if (result.success) {
        setSubmitMessage({ type: "success", text: result.message })
        setFormSubmitted(true)

        // Reset form after successful submission
        const form = document.getElementById("waitlist-form") as HTMLFormElement
        if (form) {
          form.reset()
        }
      } else {
        setSubmitMessage({ type: "error", text: result.message })
      }
    } catch (error) {
      console.error("❌ Form submission error:", error)
      setSubmitMessage({
        type: "error",
        text: "An unexpected error occurred. Please try again or contact us at people@oriyali.com.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Skip to main content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-[#FF5B04] text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-white"
      >
        Skip to main content
      </a>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          {/* Brand Logo */}
          <motion.div whileHover={{ scale: 1.05 }} className="flex items-center" role="banner">
            <a
              href="#hero"
              onClick={(e) => {
                e.preventDefault()
                scrollToSection("hero")
              }}
              className="focus:outline-none focus:ring-2 focus:ring-[#FF5B04] rounded-md p-2"
              aria-label="Oriyali - Go to homepage"
            >
              <img src="/images/oriyali.svg" alt="Oriyali" className="h-8 md:h-10 w-auto" />
            </a>
          </motion.div>

          {/* Desktop Navigation - Glassmorphism */}
          <div className="hidden md:flex items-center bg-white/10 dark:bg-black/10 backdrop-blur-lg border border-white/20 dark:border-white/10 rounded-full px-6 py-3">
            <div className="flex items-center space-x-6 lg:space-x-8" role="menubar">
              {navItems.slice(1).map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  onKeyDown={(e) => handleNavKeyDown(e, item.id)}
                  className={`relative px-4 py-2 font-medium transition-all duration-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#FF5B04] tracking-tighter text-left text-lg ${
                    activeSection === item.id
                      ? "text-white bg-[#FF5B04]"
                      : "text-foreground hover:text-[#FF5B04] hover:bg-white/10 dark:hover:bg-white/5"
                  }`}
                  role="menuitem"
                  aria-current={activeSection === item.id ? "page" : undefined}
                  aria-label={`Navigate to ${item.label} section`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right side controls - Glassmorphism */}
          <div className="hidden md:flex items-center gap-3 bg-white/10 dark:bg-black/10 backdrop-blur-lg border border-white/20 dark:border-white/10 rounded-full px-4 py-2">
            <ThemeToggle />
            <Button
              onClick={() => scrollToSection("waitlist")}
              className="bg-[#FF5B04] hover:bg-[#FF5B04]/90 text-white text-sm px-6 py-2 rounded-full transition-all duration-300 focus:ring-2 focus:ring-white"
              aria-label="Join waitlist - Navigate to signup form"
            >
              Join Waitlist
            </Button>
          </div>

          {/* Mobile Menu Button - Glassmorphism */}
          <div className="md:hidden flex items-center gap-2 bg-white/10 dark:bg-black/10 backdrop-blur-lg border border-white/20 dark:border-white/10 rounded-full px-3 py-2">
            <ThemeToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-foreground rounded-full hover:bg-white/10 dark:hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-[#FF5B04] transition-all duration-300"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu - Glassmorphism */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mx-4 mt-2 bg-white/10 dark:bg-black/10 backdrop-blur-lg border border-white/20 dark:border-white/10 rounded-2xl"
              id="mobile-menu"
              role="menu"
              aria-label="Mobile navigation menu"
            >
              <div className="px-6 py-4 space-y-3">
                {navItems.slice(1).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    onKeyDown={(e) => handleNavKeyDown(e, item.id)}
                    className={`block w-full text-left py-3 px-4 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#FF5B04] ${
                      activeSection === item.id
                        ? "text-white bg-[#FF5B04]"
                        : "text-foreground hover:text-[#FF5B04] hover:bg-white/10 dark:hover:bg-white/5"
                    }`}
                    role="menuitem"
                    aria-label={`Navigate to ${item.label} section`}
                  >
                    {item.label}
                  </button>
                ))}
                <Button
                  onClick={() => scrollToSection("waitlist")}
                  className="w-full bg-[#FF5B04] hover:bg-[#FF5B04]/90 text-white rounded-xl transition-all duration-300 focus:ring-2 focus:ring-white mt-4"
                  aria-label="Join waitlist - Navigate to signup form"
                >
                  Join Waitlist
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Main Content */}
      <main id="main-content" tabIndex={-1} className="focus:outline-none">
        {/* Hero Section with New Parallax Background */}
        <section
          id="hero"
          ref={heroRef}
          className="relative min-h-screen flex items-center justify-center overflow-hidden"
          tabIndex={-1}
          aria-labelledby="hero-heading"
        >
          {/* New Hero Background */}
          <motion.div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('/images/hero-landscape.jpeg')",
              y: backgroundY,
            }}
            aria-hidden="true"
          />

          {/* Light overlay for better text readability */}
          <div className="absolute inset-0 bg-black/20 z-10" aria-hidden="true"></div>

          <div className="container mx-auto px-4 md:px-6 text-center relative z-20">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5, duration: 1 }}
              className="text-6xl md:text-8xl mb-6 md:mb-8"
              aria-hidden="true"
            >
              ✨
            </motion.div>

            <motion.h1
              id="hero-heading"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-light mb-4 md:mb-6 text-white leading-tight drop-shadow-lg"
            >
              Unlock Your
              <br />
              Innate Rhythm
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-lg md:text-xl lg:text-2xl text-white mb-8 md:mb-12 max-w-3xl mx-auto leading-relaxed drop-shadow-md px-4"
            >
              Decode your unique neuro-hormonal patterns with personalized, proactive insights to harmonize your mood,
              energy, and focus every day.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4"
            >
              <Button
                onClick={() => scrollToSection("how")}
                size="lg"
                className="bg-[#FF5B04] hover:bg-[#FF5B04]/90 text-white text-base md:text-lg px-6 md:px-8 py-4 md:py-6 transition-all duration-300 w-full sm:w-auto focus:ring-2 focus:ring-white"
                aria-label="Discover Your Rhythm - Learn more about our bio-rhythm navigator"
              >
                Discover Your Rhythm
                <ArrowRight className="ml-2" size={20} aria-hidden="true" />
              </Button>
            </motion.div>
          </div>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
            aria-hidden="true"
          >
            <ChevronDown size={32} className="text-white" />
          </motion.div>
        </section>

        {/* Why Section */}
        <section id="why" className="py-16 md:py-24 bg-card" tabIndex={-1} aria-labelledby="why-heading">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-12 md:mb-16"
            >
              <h2
                id="why-heading"
                className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-light mb-4 md:mb-6 text-[#075056] dark:text-[#9ECFD6] px-4"
              >
                Understanding Your
                <span className="text-[#FF5B04]"> Invisible Burden</span>
              </h2>
              <p className="text-lg md:text-xl text-foreground max-w-4xl mx-auto leading-relaxed px-4">
                For too long, women have navigated the subtle yet profound daily challenge of hormonal fluctuations.
                These shifts deeply impact mood, energy, and focus—often without understanding their root cause.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 md:gap-12 max-w-6xl mx-auto">
              <motion.article
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="p-6 md:p-8 h-full bg-background border-l-4 border-[#FF5B04] transition-all duration-300 focus-within:ring-2 focus-within:ring-[#FF5B04]"
                tabIndex={0}
                role="article"
                aria-labelledby="unspoken-impact-heading"
              >
                <div className="text-3xl md:text-4xl mb-4" aria-hidden="true">
                  🧘‍♀️
                </div>
                <h3 id="unspoken-impact-heading" className="text-xl md:text-2xl font-light mb-4 text-foreground">
                  The Unspoken Impact
                </h3>
                <p className="text-foreground leading-relaxed text-sm md:text-base">
                  Hormonal shifts throughout the menstrual cycle, pregnancy, and menopause profoundly influence mood,
                  cognition, and neurological processes. Symptoms are often dismissed as "just mood swings," leading to
                  a hidden weight of under-understood experiences.
                </p>
              </motion.article>

              <motion.article
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
                className="p-6 md:p-8 h-full bg-background border-l-4 border-[#075056] transition-all duration-300 focus-within:ring-2 focus-within:ring-[#075056]"
                tabIndex={0}
                role="article"
                aria-labelledby="evolving-needs-heading"
              >
                <div className="text-3xl md:text-4xl mb-4" aria-hidden="true">
                  🌱
                </div>
                <h3 id="evolving-needs-heading" className="text-xl md:text-2xl font-light mb-4 text-foreground">
                  A Lifespan of Evolving Needs
                </h3>
                <p className="text-foreground leading-relaxed text-sm md:text-base">
                  Women's health isn't static. From puberty through menopause and beyond, unique needs arise. Current
                  solutions often focus narrowly, missing the opportunity to provide continuous, adapting support for a
                  woman's entire life journey.
                </p>
              </motion.article>
            </div>
          </div>
        </section>

        {/* How Section */}
        <section id="how" className="py-16 md:py-24 bg-background" tabIndex={-1} aria-labelledby="how-heading">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-12 md:mb-16"
            >
              <h2
                id="how-heading"
                className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-light mb-4 md:mb-6 text-[#075056] dark:text-[#9ECFD6] px-4"
              >
                Your Dynamic
                <span className="text-[#FF5B04]"> Bio-Rhythm Navigator</span>
              </h2>
              <p className="text-lg md:text-xl text-foreground max-w-4xl mx-auto leading-relaxed px-4">
                Oriyali doesn't just track; it predicts. By continuously analyzing passive biometric data from your
                wearable, it decodes your body's internal state and provides proactive guidance.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-12 md:mb-16">
              {[
                {
                  icon: "🧠",
                  title: "Predictive Intelligence",
                  desc: "AI-powered insights that anticipate hormonal shifts before they happen",
                },
                {
                  icon: "❤️",
                  title: "Scientific Foundation",
                  desc: "Built on neuroscience and behavioral psychology research",
                },
                {
                  icon: "⚡",
                  title: "Real-time Analysis",
                  desc: "Continuous monitoring of HRV, heart rate, and temperature",
                },
                { icon: "🔒", title: "Privacy First", desc: "HIPAA/GDPR compliant with end-to-end encryption" },
              ].map((feature, index) => (
                <motion.article
                  key={feature.title}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  className="p-4 md:p-6 bg-card border-b-4 border-[#FF5B04] transition-all duration-300 focus-within:ring-2 focus-within:ring-[#FF5B04]"
                  tabIndex={0}
                  role="article"
                  aria-labelledby={`feature-${index}-heading`}
                >
                  <div className="text-3xl md:text-4xl mb-4" aria-hidden="true">
                    {feature.icon}
                  </div>
                  <h3 id={`feature-${index}-heading`} className="text-base md:text-lg font-light mb-2 text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-foreground text-sm leading-relaxed">{feature.desc}</p>
                </motion.article>
              ))}
            </div>

            {/* Chart Section */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="max-w-6xl mx-auto"
            >
              <div className="text-center mb-6 md:mb-8">
                <h3 className="text-2xl md:text-3xl font-light mb-4 text-[#075056] dark:text-[#9ECFD6]">
                  Hormone Cycle Visualization
                </h3>
                <p className="text-foreground text-sm md:text-base">Interactive insights into your unique patterns</p>
              </div>

              <HormoneChart />
            </motion.div>
          </div>
        </section>

        {/* What Section */}
        <section id="what" className="py-16 md:py-24 bg-card" tabIndex={-1} aria-labelledby="what-heading">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-12 md:mb-16"
            >
              <h2
                id="what-heading"
                className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-light mb-4 md:mb-6 text-[#075056] dark:text-[#9ECFD6] px-4"
              >
                Tools for Your
                <span className="text-[#FF5B04]"> Best Self</span>
              </h2>
              <p className="text-lg md:text-xl text-foreground max-w-4xl mx-auto leading-relaxed px-4">
                From simple, actionable rituals to a companion that grows with you through every life stage, here's what
                you can expect from Oriyali.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
              {[
                {
                  emoji: "🌸",
                  title: "Daily Self-Care Rituals",
                  desc: "Personalized daily practices that build resilience and well-being",
                },
                {
                  emoji: "💡",
                  title: "Patentable Innovation",
                  desc: "Cutting-edge neuro-hormonal pattern recognition technology",
                },
                {
                  emoji: "💊",
                  title: "Supplement Integration",
                  desc: "Science-backed supplements with educational content and easy ordering",
                },
              ].map((feature, index) => (
                <motion.article
                  key={feature.title}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  className="p-6 md:p-8 bg-background transition-all duration-300 focus-within:ring-2 focus-within:ring-[#FF5B04]"
                  tabIndex={0}
                  role="article"
                  aria-labelledby={`tool-${index}-heading`}
                >
                  <div className="text-4xl md:text-5xl mb-4" aria-hidden="true">
                    {feature.emoji}
                  </div>
                  <h3 id={`tool-${index}-heading`} className="text-lg md:text-xl font-light mb-4 text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-foreground leading-relaxed text-sm md:text-base">{feature.desc}</p>
                </motion.article>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-8 md:mb-12"
            >
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-light mb-4 text-[#075056] dark:text-[#9ECFD6] px-4">
                A Companion for Your Entire Life
              </h3>
              <p className="text-lg md:text-xl text-foreground max-w-3xl mx-auto mb-8 md:mb-12 px-4">
                The first app designed to adapt with you, providing continuous value from your first period through
                menopause and beyond.
              </p>
            </motion.div>

            <LifeStagesTimeline />
          </div>
        </section>

        {/* Research Section */}
        <section
          id="research"
          className="py-8 md:py-12 text-[rgba(253,246,227,1)] bg-[rgba(253,246,227,1)]"
          tabIndex={-1}
          aria-labelledby="research-heading"
        >
          <div className="container mx-auto px-2 md:px-4">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-6 md:mb-8"
            >
              <h2
                id="research-heading"
                className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl mb-4 md:mb-6 text-[#075056] dark:text-[#9ECFD6] px-4"
              >
                Backed by
                <span className="text-[#FF5B04]"> Research</span>
              </h2>
              <p className="text-lg md:text-xl text-foreground max-w-4xl mx-auto leading-relaxed px-4">
                Our insights and recommendations are rooted in the latest scientific understanding of neuro-hormonal
                intelligence and women's well-being.
              </p>
            </motion.div>

            {/* Fractal Animation with Error Boundary */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="flex justify-center mb-6 md:mb-8"
            >
              <div className="w-full max-w-3xl">
                <ErrorBoundary>
                  <Artwork55v1
                    onLoad={() => {
                      // Announce to screen readers when animation loads
                      const announcement = "Fractal animation loaded successfully"
                      const announcer = document.createElement("div")
                      announcer.setAttribute("aria-live", "polite")
                      announcer.setAttribute("aria-atomic", "true")
                      announcer.className = "sr-only"
                      announcer.textContent = announcement
                      document.body.appendChild(announcer)
                      setTimeout(() => {
                        document.body.removeChild(announcer)
                      }, 1000)
                    }}
                    onError={(error) => {
                      console.error("Fractal animation error:", error)
                    }}
                  />
                </ErrorBoundary>
              </div>
            </motion.div>

            {/* Research Links */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                <div>
                  <h3 className="text-lg md:text-xl mb-4 text-[#075056] dark:text-[#9ECFD6]">Key Research Areas</h3>
                  <ul className="space-y-4 text-foreground" role="list">
                    <li className="flex items-start" role="listitem">
                      <div className="w-2 h-2 bg-[#FF5B04] mt-2 mr-3 flex-shrink-0" aria-hidden="true" />
                      <div>
                        <a
                          href="https://www.nature.com/articles/s41598-021-89372-9"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm md:text-base hover:text-[#FF5B04] transition-colors underline"
                        >
                          Neuro-hormonal pattern recognition in menstrual cycle tracking
                        </a>
                      </div>
                    </li>
                    <li className="flex items-start" role="listitem">
                      <div className="w-2 h-2 bg-[#FF5B04] mt-2 mr-3 flex-shrink-0" aria-hidden="true" />
                      <div>
                        <a
                          href="https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0249725"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm md:text-base hover:text-[#FF5B04] transition-colors underline"
                        >
                          Wearable sensor data analysis for hormonal health monitoring
                        </a>
                      </div>
                    </li>
                    <li className="flex items-start" role="listitem">
                      <div className="w-2 h-2 bg-[#FF5B04] mt-2 mr-3 flex-shrink-0" aria-hidden="true" />
                      <div>
                        <a
                          href="https://www.frontiersin.org/articles/10.3389/fpsyg.2020.00895/full"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm md:text-base hover:text-[#FF5B04] transition-colors underline"
                        >
                          Behavioral psychology interventions for menstrual health
                        </a>
                      </div>
                    </li>
                    <li className="flex items-start" role="listitem">
                      <div className="w-2 h-2 bg-[#FF5B04] mt-2 mr-3 flex-shrink-0" aria-hidden="true" />
                      <div>
                        <a
                          href="https://www.sciencedirect.com/science/article/pii/S0306453020301402"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm md:text-base hover:text-[#FF5B04] transition-colors underline"
                        >
                          Menstrual cycle cognitive impacts and brain function
                        </a>
                      </div>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg md:text-xl mb-4 text-[#075056] dark:text-[#9ECFD6]">Scientific Foundation</h4>
                  <ul className="space-y-4 text-foreground" role="list">
                    <li className="flex items-start" role="listitem">
                      <div className="w-2 h-2 bg-[#FF5B04] mt-2 mr-3 flex-shrink-0" aria-hidden="true" />
                      <div>
                        <a
                          href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7916045/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm md:text-base hover:text-[#FF5B04] transition-colors underline"
                        >
                          Brain fog in perimenopause: neurobiological mechanisms
                        </a>
                      </div>
                    </li>
                    <li className="flex items-start" role="listitem">
                      <div className="w-2 h-2 bg-[#FF5B04] mt-2 mr-3 flex-shrink-0" aria-hidden="true" />
                      <div>
                        <a
                          href="https://www.nature.com/articles/s41380-021-01068-w"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm md:text-base hover:text-[#FF5B04] transition-colors underline"
                        >
                          Premenstrual dysphoric disorder pathophysiology
                        </a>
                      </div>
                    </li>
                    <li className="flex items-start" role="listitem">
                      <div className="w-2 h-2 bg-[#FF5B04] mt-2 mr-3 flex-shrink-0" aria-hidden="true" />
                      <div>
                        <a
                          href="https://ieeexplore.ieee.org/document/9204849"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm md:text-base hover:text-[#FF5B04] transition-colors underline"
                        >
                          Wearable sensor applications in mood prediction
                        </a>
                      </div>
                    </li>
                    <li className="flex items-start" role="listitem">
                      <div className="w-2 h-2 bg-[#FF5B04] mt-2 mr-3 flex-shrink-0" aria-hidden="true" />
                      <div>
                        <a
                          href="https://www.frontiersin.org/articles/10.3389/fendo.2021.719490/full"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm md:text-base hover:text-[#FF5B04] transition-colors underline"
                        >
                          Hormonal fluctuations and cognitive performance
                        </a>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Combined Waitlist and Footer Section */}
        <section
          id="waitlist"
          className="relative py-16 md:py-24 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/images/footer-landscape.jpeg')",
          }}
          tabIndex={-1}
          aria-labelledby="waitlist-heading"
        >
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-black/40 z-10" aria-hidden="true"></div>

          <div className="container mx-auto px-4 md:px-6 text-center relative z-20">
            {/* Waitlist Form */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto mb-16"
            >
              <h2
                id="waitlist-heading"
                className="text-3xl md:text-4xl lg:text-5xl font-light mb-4 md:mb-6 text-white px-4"
              >
                Be the First to Experience Oriyali
              </h2>
              <p className="text-lg md:text-xl text-white/90 mb-8 md:mb-12 leading-relaxed px-4">
                Join our exclusive waitlist to get early access and updates. The future of proactive women's wellness is
                coming.
              </p>

              <form
                id="waitlist-form"
                action={handleFormSubmit}
                className="bg-white/10 backdrop-blur-lg p-6 md:p-8 max-w-md mx-auto rounded-2xl"
                aria-label="Waitlist signup form"
                noValidate
              >
                {!formSubmitted ? (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="sr-only">
                        Full Name
                      </label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Your Name"
                        className="bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:bg-white/30 rounded-full focus:ring-2 focus:ring-white"
                        aria-label="Enter your full name"
                        aria-required="true"
                        aria-describedby="name-error"
                        required
                        disabled={isSubmitting}
                        autoComplete="name"
                      />
                    </div>
                    <div>
                      <label htmlFor="age" className="sr-only">
                        Age
                      </label>
                      <Input
                        id="age"
                        name="age"
                        type="number"
                        placeholder="Your Age"
                        className="bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:bg-white/30 rounded-full focus:ring-2 focus:ring-white"
                        aria-label="Enter your age"
                        aria-required="true"
                        aria-describedby="age-error"
                        min="13"
                        max="120"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label htmlFor="mobile" className="sr-only">
                        Mobile Number
                      </label>
                      <Input
                        id="mobile"
                        name="mobile"
                        type="tel"
                        placeholder="Mobile Number"
                        className="bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:bg-white/30 rounded-full focus:ring-2 focus:ring-white"
                        aria-label="Enter your mobile phone number"
                        aria-required="true"
                        aria-describedby="mobile-error"
                        required
                        disabled={isSubmitting}
                        autoComplete="tel"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="sr-only">
                        Email Address
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Your Email"
                        className="bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:bg-white/30 rounded-full focus:ring-2 focus:ring-white"
                        aria-label="Enter your email address"
                        aria-required="true"
                        aria-describedby="email-error"
                        required
                        disabled={isSubmitting}
                        autoComplete="email"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-[#FF5B04] hover:bg-[#FF5B04]/90 text-white font-bold py-3 focus:ring-2 focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Submit form to join waitlist and know your biorhythm"
                      disabled={isSubmitting}
                      aria-describedby={submitMessage ? "submit-message" : undefined}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center gap-2">
                          <div
                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                            aria-hidden="true"
                          />
                          <span>Joining...</span>
                          <span className="sr-only">Please wait while we process your request</span>
                        </div>
                      ) : (
                        "Know My Biorhythm"
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8" role="status" aria-live="polite">
                    <div className="text-4xl mb-4" aria-hidden="true">
                      🌟
                    </div>
                    <h3 className="text-xl font-medium text-white mb-4">You're In!</h3>
                    <p className="text-white/90 text-sm">
                      Check your email for confirmation and stay tuned for updates.
                    </p>
                  </div>
                )}

                {submitMessage && (
                  <div
                    id="submit-message"
                    className={`mt-4 p-4 rounded-lg text-center ${
                      submitMessage.type === "success"
                        ? "bg-green-500/20 border border-green-500/30 text-white"
                        : "bg-red-500/20 border border-red-500/30 text-white"
                    }`}
                    role="alert"
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    <p className="text-sm leading-relaxed">{submitMessage.text}</p>
                  </div>
                )}
              </form>
            </motion.div>

            {/* Footer */}
            <motion.footer
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="border-t border-white/20 pt-8"
              role="contentinfo"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center justify-center">
                  <img src="/images/oriyali.svg" alt="Oriyali" className="h-8 w-auto" />
                </div>
                <p className="text-white/80 text-sm md:text-base">
                  © 2025 Oriyali by Terramedici Lifesciences LLP. All Rights Reserved.
                </p>
              </div>
            </motion.footer>
          </div>
        </section>
      </main>
    </div>
  )
}
