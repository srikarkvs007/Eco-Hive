import React from 'react';
import { Link } from 'react-router-dom';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="d-flex flex-column justify-content-center align-items-center min-vh-100 bg-light text-center p-4">
                    <div className="bg-white p-5 rounded-5 shadow-sm" style={{ maxWidth: '600px', border: '1px solid rgba(0,0,0,0.05)' }}>
                        <div className="text-danger mb-4" style={{ fontSize: '48px' }}>⚠️</div>
                        <h2 className="fw-bolder mb-3 text-dark">Oops, something went wrong.</h2>
                        <p className="text-muted mb-4">
                            We've encountered an unexpected error. Please try refreshing the page or navigating back to the home screen.
                        </p>
                        <div className="d-flex justify-content-center gap-3">
                            <button className="btn btn-primary rounded-pill px-4" onClick={() => window.location.reload()}>
                                Refresh Page
                            </button>
                            <Link to="/home" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => this.setState({ hasError: false })}>
                                Go to Home
                            </Link>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children; 
    }
}

export default ErrorBoundary;
