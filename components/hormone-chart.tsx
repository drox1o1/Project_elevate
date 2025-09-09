"use client"

import { useState } from "react"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from "recharts"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { Button } from "@/components/ui/button"

// Hormone cycle data
const hormoneData = [
  { day: 1, estrogen: 1.5, progesterone: 1.0, phase: "Menstruation" },
  { day: 2, estrogen: 1.8, progesterone: 1.0, phase: "Menstruation" },
  { day: 3, estrogen: 2.2, progesterone: 1.0, phase: "Menstruation" },
  { day: 4, estrogen: 2.8, progesterone: 1.0, phase: "Menstruation" },
  { day: 5, estrogen: 3.5, progesterone: 1.2, phase: "Follicular" },
  { day: 6, estrogen: 4.5, progesterone: 1.5, phase: "Follicular" },
  { day: 7, estrogen: 5.8, progesterone: 1.8, phase: "Follicular" },
  { day: 8, estrogen: 7.2, progesterone: 2.0, phase: "Follicular" },
  { day: 9, estrogen: 8.5, progesterone: 2.2, phase: "Follicular" },
  { day: 10, estrogen: 9.8, progesterone: 2.5, phase: "Follicular" },
  { day: 11, estrogen: 10.0, progesterone: 3.0, phase: "Follicular" },
  { day: 12, estrogen: 9.5, progesterone: 3.5, phase: "Follicular" },
  { day: 13, estrogen: 9.0, progesterone: 4.0, phase: "Ovulation" },
  { day: 14, estrogen: 4.0, progesterone: 5.0, phase: "Ovulation" },
  { day: 15, estrogen: 3.5, progesterone: 6.0, phase: "Ovulation" },
  { day: 16, estrogen: 3.0, progesterone: 7.5, phase: "Luteal" },
  { day: 17, estrogen: 3.2, progesterone: 8.5, phase: "Luteal" },
  { day: 18, estrogen: 3.5, progesterone: 9.0, phase: "Luteal" },
  { day: 19, estrogen: 4.0, progesterone: 9.5, phase: "Luteal" },
  { day: 20, estrogen: 4.5, progesterone: 10.0, phase: "Luteal" },
  { day: 21, estrogen: 5.0, progesterone: 9.0, phase: "Luteal" },
  { day: 22, estrogen: 5.2, progesterone: 8.0, phase: "Luteal" },
  { day: 23, estrogen: 5.0, progesterone: 6.5, phase: "Luteal" },
  { day: 24, estrogen: 4.5, progesterone: 5.0, phase: "Luteal" },
  { day: 25, estrogen: 4.0, progesterone: 4.0, phase: "Luteal" },
  { day: 26, estrogen: 3.0, progesterone: 3.0, phase: "Luteal" },
  { day: 27, estrogen: 2.0, progesterone: 2.0, phase: "Luteal" },
  { day: 28, estrogen: 1.5, progesterone: 1.0, phase: "Luteal" },
]

// Phase insights data
const phaseInsights = [
  {
    phase: "Menstruation",
    mood: "Low & introspective",
    cognition: "Intuitive thinking",
    energy: "Lowest ebb",
    stress: "Heightened sensitivity",
    moodIcon: "🧘‍♀️",
    cogIcon: "🤔",
    energyIcon: "😴",
    stressIcon: "🛡️",
    insight: "Your body is in a restorative phase. Focus on rest and gentle movement.",
    color: "#FF5B04",
  },
  {
    phase: "Follicular",
    mood: "Rising positivity",
    cognition: "Sharp & creative",
    energy: "Increasing vitality",
    stress: "Growing resilience",
    moodIcon: "😊",
    cogIcon: "💡",
    energyIcon: "⚡",
    stressIcon: "💪",
    insight: "Estrogen is rising, boosting mood and energy. A great time for new projects and learning.",
    color: "#F4D47C",
  },
  {
    phase: "Ovulation",
    mood: "Peak sociability",
    cognition: "Verbal fluency high",
    energy: "Peak performance",
    stress: "Highly resilient",
    moodIcon: "💖",
    cogIcon: "💬",
    energyIcon: "🚀",
    stressIcon: "🌟",
    insight: "Hormones are at their peak, enhancing communication and physical strength.",
    color: "#075056",
    darkColor: "#9ECFD6",
  },
  {
    phase: "Luteal",
    mood: "Winding down",
    cognition: "Focus on details",
    energy: "Gradual decline",
    stress: "Potential irritability",
    moodIcon: "😌",
    cogIcon: "🧐",
    energyIcon: "🔋",
    stressIcon: "⚠️",
    insight: "Progesterone rises, which can affect mood. Prioritize self-care and mindful activities.",
    color: "#D3DBDD",
  },
]

// Enhanced Custom tooltip component with colored indicators
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div
        className="bg-[#233038] text-white p-3 md:p-4 rounded-lg shadow-xl border-0 min-w-[160px] md:min-w-[180px] z-50"
        role="tooltip"
        aria-label={`Day ${label} hormone levels`}
      >
        <p className="font-semibold text-white mb-2 text-xs md:text-sm">Day {label}</p>
        <div className="space-y-1.5 md:space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-[#FF5B04] rounded-full flex-shrink-0" aria-hidden="true"></div>
            <span className="text-white text-xs md:text-sm font-medium">Estrogen: {data.estrogen.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 md:w-3 md:h-3 bg-[#075056] dark:bg-[#9ECFD6] rounded-full flex-shrink-0"
              aria-hidden="true"
            ></div>
            <span className="text-white text-xs md:text-sm font-medium">
              Progesterone: {data.progesterone.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    )
  }
  return null
}

// Daily rituals generator
const generateDailyRituals = (phase: string) => {
  const rituals = {
    Menstruation: [
      "Practice gentle yoga or stretching for 10 minutes",
      "Take a warm bath with Epsom salts",
      "Journal about your emotions and thoughts",
      "Drink herbal tea (chamomile or ginger)",
      "Get 8+ hours of sleep tonight",
    ],
    Follicular: [
      "Try a new creative project or hobby",
      "Go for a brisk 20-minute walk outdoors",
      "Plan your goals for the upcoming weeks",
      "Eat iron-rich foods like spinach or lentils",
      "Practice morning meditation for clarity",
    ],
    Ovulation: [
      "Schedule important conversations or meetings",
      "Engage in high-intensity exercise",
      "Connect with friends or loved ones",
      "Take on challenging tasks at work",
      "Practice gratitude journaling",
    ],
    Luteal: [
      "Focus on completing existing projects",
      "Practice deep breathing exercises",
      "Eat magnesium-rich foods like dark chocolate",
      "Organize your living or workspace",
      "Practice self-compassion and patience",
    ],
  }

  return rituals[phase as keyof typeof rituals] || rituals.Menstruation
}

export function HormoneChart() {
  const [selectedDay, setSelectedDay] = useState(1)
  const [currentInsight, setCurrentInsight] = useState(phaseInsights[0])
  const [hoveredData, setHoveredData] = useState<any>(null)
  const [showRituals, setShowRituals] = useState(false)
  const [dailyRituals, setDailyRituals] = useState<string[]>([])

  const handleMouseMove = (data: any) => {
    if (data && data.activeTooltipIndex !== undefined) {
      const day = data.activeTooltipIndex + 1
      setSelectedDay(day)
      setHoveredData(data.activePayload?.[0]?.payload)

      const dayData = hormoneData[data.activeTooltipIndex]
      const insight = phaseInsights.find((p) => p.phase === dayData.phase)
      if (insight) {
        setCurrentInsight(insight)
      }
    }
  }

  const handleGenerateRituals = () => {
    const rituals = generateDailyRituals(currentInsight.phase)
    setDailyRituals(rituals)
    setShowRituals(true)

    // Announce to screen readers
    const announcement = `Daily rituals generated for ${currentInsight.phase} phase`
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

  return (
    <div className="w-full" role="region" aria-labelledby="hormone-chart-heading">
      <div className="sr-only" id="hormone-chart-description">
        Interactive hormone cycle chart showing estrogen and progesterone levels throughout a 28-day cycle. Use mouse or
        touch to explore different days and phases.
      </div>

      {/* Chart Section - Bigger on Mobile */}
      <div className="mb-8 md:mb-12">
        <div className="mb-4 md:mb-6 text-center md:text-left">
          <h3
            id="hormone-chart-heading"
            className="text-lg md:text-xl font-light text-[#075056] dark:text-[#9ECFD6] mb-2"
          >
            28-Day Hormone Cycle
          </h3>
          <p className="text-sm md:text-base text-foreground">Hover over the chart to explore different cycle phases</p>
        </div>

        {/* Mobile-First Responsive Chart Container */}
        <div className="w-full">
          <div className="relative w-full h-[300px] md:h-[400px] lg:h-[450px]">
            <ChartContainer
              config={{
                estrogen: {
                  label: "Estrogen",
                  color: "#FF5B04",
                },
                progesterone: {
                  label: "Progesterone",
                  color: "#075056",
                },
              }}
              className="w-full h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={hormoneData}
                  margin={{
                    top: 20,
                    right: 15,
                    left: 15,
                    bottom: 50,
                  }}
                  onMouseMove={handleMouseMove}
                  aria-label="Hormone levels throughout menstrual cycle"
                  role="img"
                  aria-describedby="hormone-chart-description"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#D3DBDD" opacity={0.5} />

                  {/* Phase background areas */}
                  <ReferenceLine x={4.5} stroke="#FF5B04" strokeOpacity={0.1} strokeWidth={30} />
                  <ReferenceLine x={12} stroke="#F4D47C" strokeOpacity={0.1} strokeWidth={50} />
                  <ReferenceLine
                    x={15}
                    stroke="#075056"
                    className="dark:stroke-[#9ECFD6]"
                    strokeOpacity={0.1}
                    strokeWidth={15}
                  />
                  <ReferenceLine x={22} stroke="#D3DBDD" strokeOpacity={0.2} strokeWidth={60} />

                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#233038", className: "dark:fill-white" }}
                    tickMargin={10}
                    interval={1}
                    aria-label="Day of cycle"
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#233038", className: "dark:fill-white" }}
                    tickMargin={10}
                    width={40}
                    label={{
                      value: "Level",
                      angle: -90,
                      position: "insideLeft",
                      style: { textAnchor: "middle", fill: "#233038", className: "dark:fill-white" },
                    }}
                    aria-label="Hormone level"
                  />

                  <ChartTooltip
                    content={<CustomTooltip />}
                    cursor={{ stroke: "#233038", strokeWidth: 1, strokeDasharray: "3 3" }}
                    position={{ x: 0, y: 0 }}
                    allowEscapeViewBox={{ x: false, y: false }}
                  />

                  <Line
                    type="monotone"
                    dataKey="estrogen"
                    stroke="#FF5B04"
                    strokeWidth={4}
                    dot={false}
                    activeDot={{
                      r: 8,
                      stroke: "#FF5B04",
                      strokeWidth: 3,
                      fill: "white",
                      filter: "drop-shadow(0 2px 4px rgba(255,91,4,0.3))",
                    }}
                    aria-label="Estrogen levels"
                  />
                  <Line
                    type="monotone"
                    dataKey="progesterone"
                    stroke="#075056"
                    className="dark:stroke-[#9ECFD6]"
                    strokeWidth={4}
                    dot={false}
                    activeDot={{
                      r: 8,
                      stroke: "#075056",
                      className: "dark:stroke-[#9ECFD6]",
                      strokeWidth: 3,
                      fill: "white",
                      filter: "drop-shadow(0 2px 4px rgba(7,80,86,0.3))",
                    }}
                    aria-label="Progesterone levels"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </div>

        {/* Responsive Legend */}
        <div className="flex justify-center gap-6 md:gap-8 mt-4" role="list" aria-label="Chart legend">
          <div className="flex items-center gap-2" role="listitem">
            <div className="w-4 h-1 bg-[#FF5B04] rounded" aria-hidden="true"></div>
            <span className="text-sm md:text-base text-foreground font-medium">Estrogen</span>
          </div>
          <div className="flex items-center gap-2" role="listitem">
            <div className="w-4 h-1 bg-[#075056] dark:bg-[#9ECFD6] rounded" aria-hidden="true"></div>
            <span className="text-sm md:text-base text-foreground font-medium">Progesterone</span>
          </div>
        </div>
      </div>

      {/* Interactive Insights - Responsive */}
      <div className="mt-8 md:mt-12 mb-8" role="region" aria-labelledby="insights-heading">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-6 gap-2">
          <h3 id="insights-heading" className="text-xl md:text-2xl font-light text-[#075056] dark:text-[#9ECFD6]">
            Day {selectedDay}: {currentInsight.phase} Phase
          </h3>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 md:w-4 md:h-4 rounded-full"
              style={{
                backgroundColor:
                  currentInsight.darkColor && document.documentElement.classList.contains("dark")
                    ? currentInsight.darkColor
                    : currentInsight.color,
              }}
              aria-hidden="true"
            ></div>
            <span className="text-sm md:text-base text-foreground">{currentInsight.phase}</span>
          </div>
        </div>

        {/* Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <article
            className="bg-card p-4 md:p-6 border-l-4 border-[#FF5B04] shadow-sm hover:shadow-md transition-shadow focus-within:ring-2 focus-within:ring-[#FF5B04]"
            tabIndex={0}
            aria-labelledby="mood-heading"
          >
            <div className="text-3xl md:text-4xl mb-3" aria-hidden="true">
              {currentInsight.moodIcon}
            </div>
            <h4 id="mood-heading" className="text-base md:text-lg font-medium text-foreground mb-2">
              Mood
            </h4>
            <p className="text-foreground text-sm md:text-base">{currentInsight.mood}</p>
          </article>

          <article
            className="bg-card p-4 md:p-6 border-l-4 border-[#075056] dark:border-[#9ECFD6] shadow-sm hover:shadow-md transition-shadow focus-within:ring-2 focus-within:ring-[#075056]"
            tabIndex={0}
            aria-labelledby="cognition-heading"
          >
            <div className="text-3xl md:text-4xl mb-3" aria-hidden="true">
              {currentInsight.cogIcon}
            </div>
            <h4 id="cognition-heading" className="text-base md:text-lg font-medium text-foreground mb-2">
              Cognition
            </h4>
            <p className="text-foreground text-sm md:text-base">{currentInsight.cognition}</p>
          </article>

          <article
            className="bg-card p-4 md:p-6 border-l-4 border-[#F4D47C] shadow-sm hover:shadow-md transition-shadow focus-within:ring-2 focus-within:ring-[#F4D47C]"
            tabIndex={0}
            aria-labelledby="energy-heading"
          >
            <div className="text-3xl md:text-4xl mb-3" aria-hidden="true">
              {currentInsight.energyIcon}
            </div>
            <h4 id="energy-heading" className="text-base md:text-lg font-medium text-foreground mb-2">
              Energy
            </h4>
            <p className="text-foreground text-sm md:text-base">{currentInsight.energy}</p>
          </article>

          <article
            className="bg-card p-4 md:p-6 border-l-4 border-[#233038] dark:border-gray-400 shadow-sm hover:shadow-md transition-shadow focus-within:ring-2 focus-within:ring-[#233038]"
            tabIndex={0}
            aria-labelledby="stress-heading"
          >
            <div className="text-3xl md:text-4xl mb-3" aria-hidden="true">
              {currentInsight.stressIcon}
            </div>
            <h4 id="stress-heading" className="text-base md:text-lg font-medium text-foreground mb-2">
              Stress
            </h4>
            <p className="text-foreground text-sm md:text-base">{currentInsight.stress}</p>
          </article>
        </div>

        {/* Oura Insight - Responsive */}
        <div
          className="p-4 md:p-6 bg-muted border border-border focus-within:ring-2 focus-within:ring-[#FF5B04]"
          tabIndex={0}
          role="region"
          aria-labelledby="oura-insight-heading"
        >
          <h4 id="oura-insight-heading" className="text-lg md:text-xl font-medium text-[#FF5B04] mb-2">
            Oura Insight:
          </h4>
          <p className="text-foreground text-base md:text-lg leading-relaxed">{currentInsight.insight}</p>
        </div>
      </div>

      {/* Generate Rituals Button - Responsive */}
      <div className="text-center mt-8 md:mt-12">
        <Button
          onClick={handleGenerateRituals}
          className="bg-[#FF5B04] hover:bg-[#FF5B04]/90 text-white px-6 md:px-8 py-4 md:py-6 text-base md:text-lg font-medium w-full sm:w-auto focus:ring-2 focus:ring-white"
          aria-label={`Generate daily rituals for ${currentInsight.phase} phase`}
        >
          Generate My Daily Rituals ✨
        </Button>
      </div>

      {/* Daily Rituals Display - Responsive */}
      {showRituals && (
        <div
          className="mt-6 md:mt-8 p-4 md:p-6 bg-card border border-border shadow-sm focus-within:ring-2 focus-within:ring-[#FF5B04]"
          tabIndex={0}
          role="region"
          aria-labelledby="rituals-heading"
          aria-live="polite"
        >
          <h4 id="rituals-heading" className="text-lg md:text-xl font-medium text-[#075056] dark:text-[#9ECFD6] mb-4">
            Daily Rituals for {currentInsight.phase} Phase
          </h4>
          <ul className="space-y-3" role="list">
            {dailyRituals.map((ritual, index) => (
              <li key={index} className="flex items-start gap-3" role="listitem">
                <div className="w-2 h-2 bg-[#FF5B04] rounded-full mt-2 flex-shrink-0" aria-hidden="true"></div>
                <span className="text-foreground text-sm md:text-base">{ritual}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
