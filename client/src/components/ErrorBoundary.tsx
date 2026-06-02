import { Component, ErrorInfo, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(
      "CreatorScope UI error boundary caught an error:",
      error,
      errorInfo,
    );
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="app-error-boundary" role="alert">
          <div>
            <p className="app-error-kicker">
              Something interrupted the workspace
            </p>
            <h1>CreatorScope is still safe.</h1>
            <p>
              We contained the error so the app does not crash. Try again, or
              continue from the offline workspace if your network is
              unavailable.
            </p>
          </div>
          <button type="button" onClick={this.handleReset}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
