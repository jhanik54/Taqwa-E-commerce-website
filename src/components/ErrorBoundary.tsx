import * as React from 'react';
import { ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertTriangle, ShieldAlert, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // @ts-ignore
    this.setState({
      error,
      errorInfo
    });
    console.error('Uncaught React lifecycle error captured by boundary:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetConfig = () => {
    try {
      localStorage.removeItem('taqwa_firebase_config');
      localStorage.removeItem('taqwa_mock_user');
      console.log('Cleared custom firebase config and mock user from Error Boundary');
      window.location.reload();
    } catch (e) {
      console.error('Error clearing configuration from boundary:', e);
    }
  };

  public render() {
    if (this.state.hasError) {
      const isFirebaseIssue = 
        this.state.error?.message?.toLowerCase().includes('firebase') ||
        this.state.error?.message?.toLowerCase().includes('api-key') ||
        this.state.error?.message?.toLowerCase().includes('auth/') ||
        this.state.error?.stack?.toLowerCase().includes('firebase');

      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans select-none" id="error-boundary-screen">
          <div className="w-full max-w-xl bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden" id="error-card">
            
            {/* Top design accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
            
            <div className="flex flex-col items-center text-center">
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full mb-5 animate-pulse" id="error-icon-box">
                <AlertTriangle className="w-12 h-12" id="alert-icon" />
              </div>

              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-100 mb-2" id="error-title-bn">
                সাময়িক ত্রুটি ঘটেছে
              </h1>
              <h2 className="text-md font-medium text-slate-400 mb-6" id="error-title-en">
                An Unexpected Error Has Occurred
              </h2>

              <div className="w-full bg-slate-950/60 rounded-xl p-4 mb-6 text-left border border-slate-800/50" id="error-details-box">
                <p className="text-sm font-medium text-emerald-400 mb-1 flex items-center gap-1.5" id="error-type">
                  <ShieldAlert className="w-4 h-4 text-emerald-400" />
                  {isFirebaseIssue ? 'ফায়ারবেস সংক্রান্ত ত্রুটি / Firebase System Issue' : 'সিস্টেম ত্রুটি / Technical Details'}
                </p>
                <div className="text-xs font-mono text-slate-400 bg-slate-950 p-2.5 rounded border border-slate-900 overflow-x-auto max-h-24 whitespace-pre-wrap" id="error-message-text">
                  {this.state.error?.toString() || 'Unknown Runtime Exception'}
                </div>
              </div>

              <div className="w-full flex flex-col gap-3 sm:flex-row sm:gap-4" id="error-action-buttons">
                <button
                  id="reload-app-button"
                  onClick={this.handleReload}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-emerald-950/20 active:scale-95"
                >
                  <RefreshCw className="w-4 h-4 animate-spin-hover" />
                  রিলোড করুন (Reload)
                </button>

                <button
                  id="reset-config-button"
                  onClick={this.handleResetConfig}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-slate-800 hover:bg-slate-700 hover:text-rose-400 text-slate-300 font-medium rounded-xl border border-slate-700/60 transition-all active:scale-95"
                >
                  <Trash2 className="w-4 h-4" />
                  রিসেট সেটিংস (Reset Settings)
                </button>
              </div>

              <p className="mt-6 text-xs text-slate-500 max-w-sm" id="error-footer-text">
                যদি আপনি কোনো ভুল বা কাস্টম ফায়ারবেস তথ্য সেট করে থাকেন, তবে "রিসেট সেটিংস" চাপুন। এটি ডেমো মোডে ফেরত নিয়ে যাবে।
              </p>
            </div>
          </div>
        </div>
      );
    }

    // @ts-ignore
    return this.props.children;
  }
}

