import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-lg text-center shadow-2xl">
                        <h1 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">System Malfunction</h1>
                        <p className="text-slate-400 mb-8">
                            The terminal encountered a critical error. Please refresh the node to continue.
                        </p>
                        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl mb-8 text-left overflow-auto max-h-40">
                            <code className="text-red-400 text-xs font-mono">{this.state.error?.message}</code>
                        </div>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="bg-yellow-500 hover:bg-yellow-400 text-black font-black py-3 px-8 rounded-xl transition-all uppercase tracking-widest"
                        >
                            Reboot System
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
