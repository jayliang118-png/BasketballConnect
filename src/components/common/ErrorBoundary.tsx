'use client'

import { Component, type ErrorInfo, type ReactNode } from 'react'
import { ErrorMessage } from './ErrorMessage'

interface ErrorBoundaryProps {
  readonly children: ReactNode
  readonly fallbackMessage?: string
}

interface ErrorBoundaryState {
  readonly hasError: boolean
  readonly errorMessage: string
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, errorMessage: '' }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || 'An unexpected error occurred',
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, errorMessage: '' })
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorMessage
          message={this.props.fallbackMessage || this.state.errorMessage}
          onRetry={this.handleRetry}
        />
      )
    }
    return this.props.children
  }
}
