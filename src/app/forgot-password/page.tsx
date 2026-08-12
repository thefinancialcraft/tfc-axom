'use client';
import React, { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

export default function ForgotPasswordPage() {
  const [resetEmail, setResetEmail] = useState('');
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      setResetMessage('Please enter your email.');
      return;
    }
    setIsResetLoading(true);
    setResetMessage('');
    
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/reset-password`
    });

    if (error) {
      setResetMessage(`Failed: ${error.message}`);
    } else {
      setIsSubmitted(true);
    }
    setIsResetLoading(false);
  };

  return (
    <div style={{ display: 'flex', width: '100%', height: '100vh', overflow: 'hidden', backgroundColor: '#111', animation: 'pageFade 0.5s ease-out both' }}>
      <style>{`
        @keyframes pageFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideFromLeft {
          from { transform: translateX(-50px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @media (max-width: 768px) {
          .forgot-password-container {
            padding: 40px 24px !important;
            justify-content: center !important;
          }
          .forgot-form-wrapper {
            width: 100% !important;
            max-width: 380px;
          }
        }
      `}</style>

      {/* Background Pattern */}
      <div style={{ position: 'absolute', top: '5%', right: '25%', opacity: 0.1, transform: 'scale(1.2)', pointerEvents: 'none' }}>
        <svg width="600" height="600" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M100 20L20 180h40l20-40h40l20 40h40L100 20z" fill="#FFF" />
          <path d="M100 60l-15 30h30L100 60z" fill="#111" />
        </svg>
      </div>

      {/* Main Responsive Container */}
      <div style={{ 
        position: 'relative', 
        zIndex: 1, 
        padding: '6vh 60px', 
        display: 'flex', 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        height: '100%',
        width: '100%',
      }} className="forgot-password-container">
        
        {/* Left Side: Welcome Content (Hidden on Mobile) */}
        <div style={{ 
          flexDirection: 'column', 
          height: 'auto', 
          width: '50%',
          animation: 'slideFromLeft 0.6s cubic-bezier(0.16, 1, 0.3, 1) both'
        }} className="desktop-only-flex">
          <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-color)', letterSpacing: '1px', marginBottom: '40px' }}>
            TFC Axom
          </div>

          <div style={{ maxWidth: '420px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', color: 'var(--text-color)', marginBottom: '2vh', lineHeight: 1.1 }}>
              {isSubmitted ? 'Link Sent Successfully!' : 'Forgot Password?'}
            </h2>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, margin: 0 }}>
              {isSubmitted 
                ? `We have dispatched a secure password recovery link to your inbox at ${resetEmail}. Check your email to proceed.`
                : 'Verify your identity to regain access to your account. Enter your registered email address on the right, and we will send you a password reset link.'}
            </p>
          </div>
        </div>

        {/* Right Side: Forms */}
        <div style={{ 
          width: '380px', 
          display: 'flex', 
          flexDirection: 'column', 
          margin: 'auto',
          animation: 'fadeIn 0.6s ease-out both'
        }} className="forgot-form-wrapper">
          
          {!isSubmitted ? (
            <>
              <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '14px', fontWeight: '600', marginBottom: '32px', width: 'fit-content' }}>
                <ArrowLeft size={16} />
                Back to Sign In
              </Link>

              <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>
                Reset Password
              </h2>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '24px', lineHeight: 1.5 }}>
                Enter your email address and we'll send you a recovery link.
              </p>

              <form onSubmit={handleSendLink} style={{ display: 'flex', flexDirection: 'column', gap: '2vh' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '8px', color: 'rgba(255,255,255,0.8)' }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} color="rgba(255,255,255,0.5)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="email"
                      placeholder="johndoe@gmail.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      style={{
                        width: '100%', padding: '14px 16px 14px 44px', boxSizing: 'border-box',
                        backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
                        fontSize: '14px', color: '#fff', outline: 'none'
                      }}
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isResetLoading}
                  style={{
                    width: '100%', padding: '14px', backgroundColor: '#fff', color: '#000',
                    border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '600',
                    cursor: isResetLoading ? 'not-allowed' : 'pointer', transition: 'background 0.2s',
                    opacity: isResetLoading ? 0.7 : 1, marginTop: '8px'
                  }}
                >
                  {isResetLoading ? 'Sending...' : 'Send Reset Link'}
                </button>

                {resetMessage && (
                  <p style={{ fontSize: '13px', color: '#ef4444', textAlign: 'center', marginTop: '8px' }}>
                    {resetMessage}
                  </p>
                )}
              </form>
            </>
          ) : (
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <CheckCircle size={64} color="#10b981" style={{ marginBottom: '24px' }} />
              
              <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#fff', marginBottom: '16px' }}>
                Check Your Email
              </h2>
              
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: '32px' }}>
                A password recovery link has been sent to <strong>{resetEmail}</strong>. Please follow the instructions in the email to reset your password.
              </p>

              <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#fff', color: '#000', padding: '14px 28px', borderRadius: '12px', textDecoration: 'none', fontSize: '15px', fontWeight: '600', transition: 'background 0.2s', width: '100%', justifyContent: 'center' }}>
                <ArrowLeft size={16} />
                Return to Login
              </Link>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
