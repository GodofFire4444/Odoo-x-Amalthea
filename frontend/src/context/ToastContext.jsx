import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }

  return context;
};

const TOAST_STYLES = {
  success: { borderColor: '#86efac', background: '#f0fdf4', accent: '#15803d' },
  error: { borderColor: '#fecaca', background: '#fef2f2', accent: '#b91c1c' },
  warning: { borderColor: '#fde68a', background: '#fffbeb', accent: '#b45309' },
  info: { borderColor: '#bfdbfe', background: '#eff6ff', accent: '#1d4ed8' }
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const removeToast = (toastId) => {
    const timer = timers.current.get(toastId);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(toastId);
    }

    setToasts((current) => current.filter((toast) => toast.id !== toastId));
  };

  const addToast = ({ type = 'info', title, message, duration = 4200 }) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const toast = { id, type, title, message };

    setToasts((current) => [toast, ...current].slice(0, 4));

    const timer = window.setTimeout(() => removeToast(id), duration);
    timers.current.set(id, timer);

    return id;
  };

  useEffect(() => () => {
    timers.current.forEach((timer) => clearTimeout(timer));
    timers.current.clear();
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'fixed',
          top: '1rem',
          right: '1rem',
          zIndex: 2000,
          display: 'grid',
          gap: '0.75rem',
          width: 'min(92vw, 380px)'
        }}
      >
        {toasts.map((toast) => {
          const style = TOAST_STYLES[toast.type] || TOAST_STYLES.info;

          return (
            <div
              key={toast.id}
              style={{
                border: `1px solid ${style.borderColor}`,
                backgroundColor: style.background,
                borderLeft: `4px solid ${style.accent}`,
                borderRadius: '1rem',
                boxShadow: '0 14px 40px rgba(15, 23, 42, 0.12)',
                padding: '0.95rem 1rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'start' }}>
                <div style={{ display: 'grid', gap: '0.2rem' }}>
                  {toast.title ? (
                    <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>{toast.title}</strong>
                  ) : null}
                  <span style={{ color: '#334155', fontSize: '0.92rem', lineHeight: 1.4 }}>{toast.message}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  aria-label="Dismiss notification"
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: '#475569',
                    padding: 0,
                    fontSize: '1rem',
                    lineHeight: 1,
                    cursor: 'pointer'
                  }}
                >
                  ×
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};
