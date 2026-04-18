import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-6">
          <div className="text-center max-w-sm">
            <p className="text-neutral-200 text-lg font-semibold mb-2">Something went wrong</p>
            <p className="text-neutral-500 text-sm mb-6">{this.state.error.message}</p>
            <button
              onClick={() => this.setState({ error: null })}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
