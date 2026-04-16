import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      errorInfo,
    })

    this.props.onError?.(error, errorInfo)

    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-md">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-card p-xl text-center">
            <div className="text-6xl mb-lg">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-md">Something went wrong</h1>
            <p className="text-gray-500 mb-lg">
              We apologize for the inconvenience. Please try refreshing the page.
            </p>
            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <div className="bg-gray-50 rounded-lg p-md mb-lg text-left overflow-auto">
                <p className="text-sm font-semibold text-red-600 mb-sm">Error Details:</p>
                <p className="text-xs text-gray-600">{this.state.error.message}</p>
                {this.state.errorInfo && (
                  <pre className="text-xs text-gray-500 mt-sm whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}
            <div className="flex gap-md justify-center">
              <button onClick={this.handleRetry} className="btn btn-primary btn-md">
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="btn btn-md bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
