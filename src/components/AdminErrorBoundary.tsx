import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class AdminErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Admin Panel Component Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    const errorMsg = String(this.state.error?.message || '');
    const isChunkError =
      this.state.error?.name === 'ChunkLoadError' ||
      /failed to fetch dynamically imported module/i.test(errorMsg) ||
      /dynamically imported module/i.test(errorMsg);

    if (isChunkError) {
      window.location.reload();
      return;
    }

    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      const errorMsg = String(this.state.error?.message || '');
      const isChunkError =
        this.state.error?.name === 'ChunkLoadError' ||
        /failed to fetch dynamically imported module/i.test(errorMsg) ||
        /dynamically imported module/i.test(errorMsg);

      return (
        <div className="bg-white rounded-3xl border border-rose-200 p-8 space-y-4 shadow-warm-sm text-center">
          <div className={`w-14 h-14 mx-auto rounded-2xl ${isChunkError ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-rose-50 border-rose-200 text-rose-600'} border flex items-center justify-center`}>
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-900 font-display">
              {isChunkError
                ? 'নতুন আপডেট উপলব্ধ (New Version Available)'
                : (this.props.fallbackTitle || 'Component Error (কম্পোনেন্ট ত্রুটি)')}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {isChunkError
                ? 'ওয়েবসাইটের একটি নতুন সংস্করণ লাইভ হয়েছে। সর্বশেষ সংস্করণ লোড করতে দয়া করে পেজটি রিফ্রেশ করুন।'
                : 'This section encountered an unexpected issue. The rest of the site is still fully functional.'}
            </p>
          </div>

          {this.state.error && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 max-w-lg mx-auto text-left overflow-x-auto">
              <p className="text-[11px] font-mono text-rose-700 font-bold">
                {this.state.error.name}: {this.state.error.message}
              </p>
            </div>
          )}

          <div className="pt-2 flex justify-center gap-3">
            <button
              type="button"
              onClick={this.handleReset}
              className="px-5 py-2.5 bg-[#006A4E] hover:bg-[#00523C] text-white text-xs font-bold rounded-xl shadow-warm-sm flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{isChunkError ? 'পেজ রিফ্রেশ করুন (Reload Page)' : 'Retry / Recover Component'}</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
