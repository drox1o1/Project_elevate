// Analytics and tracking utilities for production
export interface AnalyticsEvent {
  event: string
  properties?: Record<string, any>
}

// Google Analytics 4 integration
export function trackEvent(event: AnalyticsEvent) {
  if (typeof window !== "undefined" && (window as any).gtag) {
    ;(window as any).gtag("event", event.event, event.properties)
  }
}

// Track waitlist signup
export function trackWaitlistSignup(userData: { age: number; email: string }) {
  trackEvent({
    event: "waitlist_signup",
    properties: {
      event_category: "engagement",
      event_label: "waitlist_form",
      user_age: userData.age,
      email_domain: userData.email.split("@")[1],
      timestamp: new Date().toISOString(),
    },
  })
}

// Track section views
export function trackSectionView(section: string) {
  trackEvent({
    event: "section_view",
    properties: {
      event_category: "engagement",
      event_label: section,
      timestamp: new Date().toISOString(),
    },
  })
}

// Track chart interactions
export function trackChartInteraction(action: string) {
  trackEvent({
    event: "chart_interaction",
    properties: {
      event_category: "engagement",
      event_label: "hormone_chart",
      action: action,
      timestamp: new Date().toISOString(),
    },
  })
}

// Performance monitoring
export function trackPerformance() {
  if (typeof window !== "undefined" && "performance" in window) {
    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming

    trackEvent({
      event: "page_performance",
      properties: {
        event_category: "performance",
        load_time: Math.round(navigation.loadEventEnd - navigation.loadEventStart),
        dom_content_loaded: Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart),
        first_paint: Math.round(performance.getEntriesByName("first-paint")[0]?.startTime || 0),
        timestamp: new Date().toISOString(),
      },
    })
  }
}
