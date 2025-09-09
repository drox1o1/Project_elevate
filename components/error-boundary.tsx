"use client"

import React from "react"

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error Boundary caught an error:", error, errorInfo)
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />
      }

      return (
        <div
          className="flex items-center justify-center bg-[#FDF6E3] text-[#075056] p-8 rounded-lg border border-[#D3DBDD]"
          style={{ width: "100%", height: "550px" }}
          role="alert"
          aria-label="Component error occurred"
        >
          <div className="text-center max-w-md">
            <div className="text-4xl mb-4" aria-hidden="true">
              ⚠️
            </div>
            <h3 className="text-xl font-medium mb-2">Something went wrong</h3>
            <p className="text-sm text-gray-600 mb-4">
              The animation component encountered an error. This might be due to browser compatibility or device
              limitations.
            </p>
            <button
              onClick={this.resetError}
              className="bg-[#FF5B04] hover:bg-[#FF5B04]/90 text-white px-4 py-2 rounded-full text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF5B04] focus:ring-offset-2"
              aria-label="Try to reload the component"
            >
              Try Again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
