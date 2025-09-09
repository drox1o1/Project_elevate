"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"

const lifeStages = [
  {
    stage: "Puberty",
    icon: "🌱",
    color: "#F4D47C",
    content:
      "Understanding foundational changes in your body and mind. Oriyali helps establish healthy habits early on, providing guidance through the initial hormonal shifts and emotional changes.",
    features: ["Cycle tracking education", "Emotional wellness support", "Healthy habit formation"],
  },
  {
    stage: "Menstruation",
    icon: "🌸",
    color: "#FF5B04",
    content:
      "Navigate your monthly cycle with predictive insights, turning potential challenges into opportunities for optimized living. Learn to work with your natural rhythms.",
    features: ["Cycle prediction", "Mood tracking", "Energy optimization", "Symptom management"],
  },
  {
    stage: "Pregnancy",
    icon: "🤱",
    color: "#075056",
    darkColor: "#9ECFD6",
    content:
      "Receive support for the unique physical and mental shifts during pregnancy and postpartum, with a focus on maternal mental health and hormonal changes.",
    features: ["Pregnancy tracking", "Postpartum support", "Mental health monitoring", "Sleep optimization"],
  },
  {
    stage: "Perimenopause",
    icon: "🦋",
    color: "#D3DBDD",
    darkColor: "#A0A0A0",
    content:
      "Demystify 'brain fog' and other changes. Get strategies to manage symptoms and maintain cognitive and emotional balance during this transitional phase.",
    features: ["Symptom tracking", "Cognitive support", "Sleep management", "Stress reduction"],
  },
  {
    stage: "Menopause",
    icon: "🌟",
    color: "#233038",
    darkColor: "#A0A0A0",
    content:
      "Embrace this new phase with confidence. Oriyali provides guidance for long-term health, vitality, and well-being in your post-reproductive years.",
    features: ["Health monitoring", "Vitality support", "Bone health", "Heart health tracking"],
  },
]

export function LifeStagesTimeline() {
  const [activeStage, setActiveStage] = useState<number | null>(0)
  const { theme } = useTheme()

  const toggleStage = (index: number) => {
    setActiveStage(index)

    // Announce stage change to screen readers
    const stageName = lifeStages[index].stage
    const announcement = `${stageName} stage selected. Content updated.`
    const announcer = document.createElement("div")
    announcer.setAttribute("aria-live", "polite")
    announcer.setAttribute("aria-atomic", "true")
    announcer.className = "sr-only"
    announcer.textContent = announcement
    document.body.appendChild(announcer)

    setTimeout(() => {
      document.body.removeChild(announcer)
    }, 1000)
  }

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      toggleStage(index)
    } else if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault()
      const direction = event.key === "ArrowLeft" ? -1 : 1
      const newIndex = (index + direction + lifeStages.length) % lifeStages.length
      const newButton = document.querySelector(`[data-stage-index="${newIndex}"]`) as HTMLElement
      newButton?.focus()
    }
  }

  const getColor = (stage: any) => {
    if (theme === "dark" && stage.darkColor) {
      return stage.darkColor
    }
    return stage.color
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Desktop Timeline */}
      <div className="hidden lg:block">
        <div className="relative mb-8">
          {/* Timeline line */}
          <div className="absolute top-[60px] left-0 w-full h-[2px] bg-border" aria-hidden="true"></div>

          {/* Stage icons */}
          <div className="flex justify-between items-start relative" role="tablist" aria-label="Life stages timeline">
            {lifeStages.map((stage, index) => (
              <div key={stage.stage} className="flex flex-col items-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex flex-col items-center cursor-pointer group mb-10"
                >
                  <motion.button
                    className={`w-20 h-20 xl:w-24 xl:h-24 rounded-full flex items-center justify-center text-3xl xl:text-4xl mb-4 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#FF5B04] ${
                      activeStage === index
                        ? "scale-110 shadow-xl border-2 bg-white dark:bg-slate-900"
                        : "hover:scale-105 shadow-lg border bg-white dark:bg-slate-800"
                    }`}
                    style={{
                      borderColor: getColor(stage),
                      boxShadow: activeStage === index ? `0 0 20px ${getColor(stage)}40` : "",
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleStage(index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    role="tab"
                    aria-selected={activeStage === index}
                    aria-controls={`stage-content-${index}`}
                    aria-label={`${stage.stage} life stage`}
                    data-stage-index={index}
                    tabIndex={activeStage === index ? 0 : -1}
                  >
                    <span aria-hidden="true">{stage.icon}</span>
                  </motion.button>
                  <span
                    className={`text-lg xl:text-xl font-medium text-center transition-colors duration-300 ${
                      activeStage === index ? "text-[#075056] dark:text-[#9ECFD6]" : "text-foreground"
                    }`}
                    aria-hidden="true"
                  >
                    {stage.stage}
                  </span>
                </motion.div>
              </div>
            ))}
          </div>
        </div>

        {/* Content card - Always visible for the active stage */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="w-full mt-6"
            role="tabpanel"
            id={`stage-content-${activeStage}`}
            aria-labelledby={`stage-tab-${activeStage}`}
            tabIndex={0}
          >
            <div className="bg-card p-8 xl:p-10 shadow-xl border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#FF5B04]">
              <div className="flex items-center gap-4 mb-6">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-2xl bg-background"
                  style={{ border: `2px solid ${getColor(lifeStages[activeStage || 0])}` }}
                  aria-hidden="true"
                >
                  {lifeStages[activeStage || 0].icon}
                </div>
                <div>
                  <h3 className="text-2xl font-light text-[#075056] dark:text-[#9ECFD6] mb-2">
                    {lifeStages[activeStage || 0].stage}
                  </h3>
                  <div
                    className="w-12 h-1.5 rounded-full"
                    style={{ backgroundColor: getColor(lifeStages[activeStage || 0]) }}
                    aria-hidden="true"
                  ></div>
                </div>
              </div>

              <p className="text-foreground text-base xl:text-lg leading-relaxed mb-8">
                {lifeStages[activeStage || 0].content}
              </p>

              <div>
                <h4 className="text-lg font-medium text-[#075056] dark:text-[#9ECFD6] mb-4">Key Features:</h4>
                <ul className="grid grid-cols-2 gap-4" role="list">
                  {lifeStages[activeStage || 0].features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3" role="listitem">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: getColor(lifeStages[activeStage || 0]) }}
                        aria-hidden="true"
                      ></div>
                      <span className="text-foreground text-base">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Mobile/Tablet Timeline - Vertical Stack */}
      <div className="lg:hidden space-y-4">
        <div role="tablist" aria-label="Life stages timeline">
          {lifeStages.map((stage, index) => (
            <div key={stage.stage}>
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`w-full flex items-center gap-4 p-4 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#FF5B04] ${
                  activeStage === index ? "bg-card shadow-md border-l-4" : "bg-muted hover:bg-card hover:shadow-sm"
                }`}
                style={{
                  borderLeftColor: activeStage === index ? getColor(stage) : "transparent",
                }}
                onClick={() => toggleStage(index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                role="tab"
                aria-selected={activeStage === index}
                aria-controls={`mobile-stage-content-${index}`}
                aria-expanded={activeStage === index}
                aria-label={`${stage.stage} life stage. ${activeStage === index ? "Expanded" : "Collapsed"}`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all duration-300 ${
                    activeStage === index ? "scale-110" : ""
                  }`}
                  style={{
                    backgroundColor: activeStage === index ? getColor(stage) + "20" : "transparent",
                    border: `2px solid ${getColor(stage)}`,
                  }}
                  aria-hidden="true"
                >
                  {stage.icon}
                </div>
                <div className="flex-1 text-left">
                  <span
                    className={`text-base font-medium transition-colors duration-300 ${
                      activeStage === index ? "text-[#075056] dark:text-[#9ECFD6]" : "text-foreground"
                    }`}
                  >
                    {stage.stage}
                  </span>
                </div>
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: activeStage === index ? getColor(stage) : "#D3DBDD" }}
                  aria-hidden="true"
                ></div>
              </motion.button>

              {/* Content appears below each mobile card */}
              <AnimatePresence>
                {activeStage === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4"
                    role="tabpanel"
                    id={`mobile-stage-content-${index}`}
                    aria-labelledby={`mobile-stage-tab-${index}`}
                  >
                    <div
                      className="bg-card p-6 shadow-lg border border-border rounded-lg ml-4 focus:outline-none focus:ring-2 focus:ring-[#FF5B04]"
                      tabIndex={0}
                    >
                      <p className="text-foreground text-sm md:text-base leading-relaxed mb-4">{stage.content}</p>

                      <div>
                        <h4 className="text-sm md:text-base font-medium text-[#075056] dark:text-[#9ECFD6] mb-3">
                          Key Features:
                        </h4>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2" role="list">
                          {stage.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-center gap-2" role="listitem">
                              <div
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: getColor(stage) }}
                                aria-hidden="true"
                              ></div>
                              <span className="text-foreground text-xs md:text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
