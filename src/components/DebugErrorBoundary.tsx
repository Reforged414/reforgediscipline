import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class DebugErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 20, background: '#1a1816', color: '#fff', minHeight: '100vh', fontFamily: 'monospace', fontSize: 12, whiteSpace: 'pre-wrap' }}>
          <h2 style={{ color: '#FF6B1A' }}>Debug: Render Error</h2>
          <p>{this.state.error.message}</p>
          <p style={{ marginTop: 20, opacity: 0.6 }}>{this.state.error.stack}</p>
        </div>
      );
    }
    return this.props.children;
  }
}
