'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, CheckCircle2, AlertCircle, X } from 'lucide-react';

interface NotificationToastProps {
  title?: string;
  message: string;
  type?: 'error' | 'success' | 'warning';
  isOpen: boolean;
  onClose: () => void;
  autoCloseDuration?: number;
}

export default function NotificationToast({
  title,
  message,
  type = 'error',
  isOpen,
  onClose,
  autoCloseDuration = 7000
}: NotificationToastProps) {
  const [mounted, setMounted] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && message) {
      setShouldRender(true);
      const frame = requestAnimationFrame(() => {
        setAnimating(true);
      });
      return () => cancelAnimationFrame(frame);
    } else {
      setAnimating(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 850);
      return () => clearTimeout(timer);
    }
  }, [isOpen, message]);

  useEffect(() => {
    if (isOpen && autoCloseDuration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDuration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoCloseDuration, onClose]);

  if (!mounted || !shouldRender || !message) return null;

  const isError = type === 'error';
  const isSuccess = type === 'success';
  const isWarning = type === 'warning';

  const mainColor = isError ? '#EF4444' : isSuccess ? '#34BB88' : '#F59E0B';
  const mainColorAlpha = isError ? 'rgba(239, 68, 68, 0.85)' : isSuccess ? 'rgba(52, 187, 136, 0.85)' : 'rgba(245, 158, 11, 0.85)';
  const defaultTitle = isError ? 'Onboarding Error' : isSuccess ? 'Success' : 'Warning';

  const toastContent = (
    <>
      <style>{`
        @keyframes borderMoveRightToLeft {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
        .toast-moving-border {
          background: 
            linear-gradient(rgba(14, 14, 18, 0.85), rgba(14, 14, 18, 0.85)) padding-box,
            linear-gradient(90deg, rgba(255, 255, 255, 0.12), ${mainColorAlpha}, rgba(255, 255, 255, 0.12), ${mainColorAlpha}, rgba(255, 255, 255, 0.12)) border-box;
          background-size: 200% 100%;
          animation: borderMoveRightToLeft 8s linear infinite;
          border: 1.5px solid transparent;
        }
      `}</style>

      <div 
        className="toast-moving-border"
        style={{
          position: 'fixed',
          top: '24px',
          left: '50%',
          transform: animating ? 'translate(-50%, 0) scale(1)' : 'translate(-50%, -60px) scale(0.85)',
          opacity: animating ? 1 : 0,
          filter: animating ? 'blur(0px)' : 'blur(4px)',
          transition: 'transform 0.85s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.85s ease, filter 0.85s ease',
          zIndex: 9999999,
          width: '90%',
          maxWidth: '540px',
          borderRadius: '16px',
          padding: '14px 20px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', overflow: 'hidden' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: isError ? 'rgba(239, 68, 68, 0.2)' : isSuccess ? 'rgba(52, 187, 136, 0.2)' : 'rgba(245, 158, 11, 0.2)',
            border: `1px solid ${mainColorAlpha}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: mainColor,
            flexShrink: 0
          }}>
            {isError && <AlertTriangle size={20} />}
            {isSuccess && <CheckCircle2 size={20} />}
            {isWarning && <AlertCircle size={20} />}
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '700', color: mainColor, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {title || defaultTitle}
            </div>
            <div style={{ fontSize: '14px', fontWeight: '500', color: '#FFFFFF', marginTop: '2px', wordBreak: 'break-word', lineHeight: '1.4' }}>
              {message}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'rgba(255, 255, 255, 0.6)',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            flexShrink: 0
          }}
        >
          <X size={18} />
        </button>
      </div>
    </>
  );

  return createPortal(toastContent, document.body);
}
