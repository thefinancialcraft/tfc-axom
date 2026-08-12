'use client';
import React, { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState('');

  // Ensure they are actually authenticated (loaded via recovery link)
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setMessage('Invalid or expired reset session. Please request a new link.');
      } else if (session.user.email) {
        localStorage.setItem('recovery_pending_for', session.user.email);
      }
    };
    checkSession();
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }
    setIsUpdating(true);
    setMessage('');

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      setMessage(`Failed to update password: ${error.message}`);
    } else {
      setMessage('Password updated successfully! Redirecting to sign in...');
      await supabase.auth.signOut();
      setTimeout(() => {
        router.replace('/login');
      }, 2500);
    }
    setIsUpdating(false);
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
        @media (max-width: 768px) {
          .reset-password-container {
            padding: 40px 24px !important;
            justify-content: center !important;
          }
          .reset-form-wrapper {
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
        justifyContent: 'center', 
        alignItems: 'center',
        height: '100%',
        width: '100%',
      }} className="reset-password-container">
        
        {/* Reset Form Wrapper */}
        <div style={{ 
          width: '380px', 
          display: 'flex', 
          flexDirection: 'column', 
          animation: 'fadeIn 0.6s ease-out both'
        }} className="reset-form-wrapper">

          <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>
            Set New Password
          </h2>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '24px', lineHeight: 1.5 }}>
            Create a secure new password for your account.
          </p>

          <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '2.5vh' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '8px', color: 'rgba(255,255,255,0.8)' }}>
                New Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="rgba(255,255,255,0.5)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{
                    width: '100%', padding: '14px 16px 14px 44px', boxSizing: 'border-box',
                    backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
                    fontSize: '14px', color: '#fff', outline: 'none'
                  }}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '8px', color: 'rgba(255,255,255,0.8)' }}>
                Confirm New Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="rgba(255,255,255,0.5)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
              disabled={isUpdating}
              style={{
                width: '100%', padding: '14px', backgroundColor: '#fff', color: '#000',
                border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '600',
                cursor: isUpdating ? 'not-allowed' : 'pointer', transition: 'background 0.2s',
                opacity: isUpdating ? 0.7 : 1, marginTop: '8px'
              }}
            >
              {isUpdating ? 'Updating...' : 'Update Password'}
            </button>

            {message && (
              <p style={{ fontSize: '13px', color: message.includes('Failed') || message.includes('Invalid') ? '#ef4444' : '#10b981', textAlign: 'center', marginTop: '8px' }}>
                {message}
              </p>
            )}
          </form>
        </div>

      </div>
    </div>
  );
}
