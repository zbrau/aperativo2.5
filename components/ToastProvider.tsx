import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Check, X, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
    exiting?: boolean;
}

interface ToastContextType {
    show: (message: string, type?: ToastType) => void;
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = (): ToastContextType => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within a ToastProvider');
    return ctx;
};

const TOAST_DURATION = 3500;
const EXIT_DURATION = 300;

const ToastItem: React.FC<{ toast: Toast; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
    const icons = {
        success: <Check size={16} className="text-green-500" />,
        error: <X size={16} className="text-red-500" />,
        info: <Info size={16} className="text-blue-500" />,
    };
    const borders = {
        success: 'border-l-green-500',
        error: 'border-l-red-500',
        info: 'border-l-blue-500',
    };
    const bgs = {
        success: 'bg-green-50 dark:bg-green-900/20',
        error: 'bg-red-50 dark:bg-red-900/20',
        info: 'bg-blue-50 dark:bg-blue-900/20',
    };

    return (
        <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border-l-4 ${borders[toast.type]} ${bgs[toast.type]} bg-white dark:bg-gray-800 backdrop-blur-md min-w-[280px] max-w-[400px] cursor-pointer ${toast.exiting ? 'animate-toast-out' : 'animate-toast-in'}`}
            onClick={() => onDismiss(toast.id)}
            role="alert"
        >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center shadow-sm">
                {icons[toast.type]}
            </div>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 flex-1 leading-snug">
                {toast.message}
            </p>
            <button
                onClick={(e) => { e.stopPropagation(); onDismiss(toast.id); }}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
            >
                <X size={14} />
            </button>
        </div>
    );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const dismiss = useCallback((id: string) => {
        setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, EXIT_DURATION);
    }, []);

    const show = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => dismiss(id), TOAST_DURATION);
    }, [dismiss]);

    const success = useCallback((msg: string) => show(msg, 'success'), [show]);
    const error = useCallback((msg: string) => show(msg, 'error'), [show]);
    const info = useCallback((msg: string) => show(msg, 'info'), [show]);

    return (
        <ToastContext.Provider value={{ show, success, error, info }}>
            {children}
            {/* Toast Container */}
            <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none md:top-6 md:right-6">
                {toasts.map(toast => (
                    <div key={toast.id} className="pointer-events-auto">
                        <ToastItem toast={toast} onDismiss={dismiss} />
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export default ToastProvider;
