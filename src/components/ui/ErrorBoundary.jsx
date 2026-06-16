import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // surface to console for debugging
    console.error("Screen crashed:", error, info);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 32, fontFamily: "system-ui, sans-serif" }}>
          <div style={{
            maxWidth: 640, margin: "40px auto", background: "#fff",
            border: "1px solid #fecaca", borderRadius: 16, padding: 28,
          }}>
            <h2 style={{ margin: 0, color: "#dc2626", fontSize: 18 }}>Something went wrong on this screen</h2>
            <p style={{ color: "#64748b", fontSize: 14 }}>
              The page failed to render. Details below:
            </p>
            <pre style={{
              background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8,
              padding: 12, fontSize: 12, color: "#b91c1c", overflowX: "auto", whiteSpace: "pre-wrap",
            }}>
              {String(this.state.error?.stack || this.state.error?.message || this.state.error)}
            </pre>
            <button onClick={this.reset} style={{
              marginTop: 12, padding: "8px 16px", borderRadius: 8, border: "none",
              background: "#3b82f6", color: "#fff", fontWeight: 600, cursor: "pointer",
            }}>
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
