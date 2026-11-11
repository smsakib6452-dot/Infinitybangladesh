import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastProps {
  message: string;
  type?: ToastType;
  isOpen?: boolean;
  isVisible?: boolean;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'success',
  isOpen,
  isVisible,
  onClose,
  duration = 4000
}) => {
  const show = isOpen ?? isVisible ?? true;

  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show) return null;

  const bgStyles = {
    success: 'bg-emerald-900/95 text-emerald-100 border-emerald-700/50 shadow-emerald-950/40',
    error: 'bg-rose-900/95 text-rose-100 border-rose-700/50 shadow-rose-950/40',
    info: 'bg-slate-900/95 text-slate-100 border-slate-700/50 shadow-slate-950/40'
  }[type];

  const IconComponent = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info
  }[type];

  return (
    <div
      className="fixed bottom-6 right-6 z-50 max-w-md w-full px-4 animate-in fade-in slide-in-from-bottom-5 duration-300"
      role={type === 'error' ? 'alert' : 'status'}
      aria-live={type === 'error' ? 'assertive' : 'polite'}
    >
      <div className={`flex items-center gap-3 p-4 rounded-xl border shadow-2xl backdrop-blur-md ${bgStyles}`}>
        <IconComponent className="w-5 h-5 flex-shrink-0" />
        <p className="text-sm font-medium flex-1 leading-snug">{message}</p>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/10 rounded-lg transition-colors text-current opacity-70 hover:opacity-100"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
