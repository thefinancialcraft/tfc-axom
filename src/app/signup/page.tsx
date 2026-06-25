'use client';
import React from 'react';
import { Mail, Lock, User, Phone } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import ProfileCreator from '@/components/ProfileCreator';

export default function SignupPage() {
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/signup`
      }
    });
    if (error) {
      console.error('Error signing up with Google:', error.message);
      setIsGoogleLoading(false);
    }
  };

  return (
    <>
      <ProfileCreator />
      <div style={{ 
        backgroundColor: '#F9FAFB', 
        minHeight: '100vh', 
        color: '#000000',
        padding: '40px 24px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <style>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      
      {/* Header with Logo */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: '32px' }}>
        <img src="/logo.png" alt="TFC Axom Logo" style={{ width: '40px', height: 'auto', marginBottom: '8px' }} />
        <span style={{ fontSize: '16px', fontWeight: '700' }}>TFC Axom</span>
      </div>

      <h1 style={{ fontSize: '32px', fontWeight: '700', margin: '0 0 24px 0' }}>
        Create Account
      </h1>

      {/* Sign Up with Google Button at the top */}
      <button 
        onClick={handleGoogleSignup}
        disabled={isGoogleLoading}
        style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        padding: '14px',
        backgroundColor: '#fff',
        border: '1px solid #E5E7EB',
        borderRadius: '12px',
        fontSize: '15px',
        fontWeight: '600',
        cursor: isGoogleLoading ? 'not-allowed' : 'pointer',
        color: '#333',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
        marginBottom: '24px',
        opacity: isGoogleLoading ? 0.7 : 1
      }}>
        {isGoogleLoading ? (
          <div style={{ width: '20px', height: '20px', border: '2px solid #ccc', borderTopColor: '#333', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        ) : (
          <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        )}
        {isGoogleLoading ? 'Connecting...' : 'Sign up with Google'}
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }}></div>
        <span style={{ fontSize: '13px', color: '#888', fontWeight: '500' }}>OR</span>
        <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }}></div>
      </div>

      {/* Form */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* User Name */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>User Name</label>
          <div style={{ position: 'relative' }}>
            <User size={18} color="#888" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="John Doe" 
              style={{
                width: '100%',
                padding: '16px 16px 16px 44px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: '#ffffff',
                fontSize: '14px',
                color: '#333',
                outline: 'none',
                boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
              }}
            />
          </div>
        </div>

        {/* Email Address */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Email Address</label>
          <div style={{ position: 'relative' }}>
            <Mail size={18} color="#888" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="email" 
              placeholder="johndoe@gmail.com" 
              style={{
                width: '100%',
                padding: '16px 16px 16px 44px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: '#ffffff',
                fontSize: '14px',
                color: '#333',
                outline: 'none',
                boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
              }}
            />
          </div>
        </div>

        {/* Phone no. */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Phone no.</label>
          <div style={{ position: 'relative' }}>
            <Phone size={18} color="#888" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="tel" 
              placeholder="+91 98765 43210" 
              style={{
                width: '100%',
                padding: '16px 16px 16px 44px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: '#ffffff',
                fontSize: '14px',
                color: '#333',
                outline: 'none',
                boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
              }}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Password</label>
          <div style={{ position: 'relative' }}>
            <Lock size={18} color="#888" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="password" 
              placeholder="••••••" 
              style={{
                width: '100%',
                padding: '16px 16px 16px 44px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: '#ffffff',
                fontSize: '14px',
                color: '#333',
                outline: 'none',
                boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
              }}
            />
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Confirm Password</label>
          <div style={{ position: 'relative' }}>
            <Lock size={18} color="#888" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="password" 
              placeholder="••••••" 
              style={{
                width: '100%',
                padding: '16px 16px 16px 44px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: '#ffffff',
                fontSize: '14px',
                color: '#333',
                outline: 'none',
                boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
              }}
            />
          </div>
        </div>

        {/* Sign Up Button */}
        <button style={{
          width: '100%',
          padding: '16px',
          backgroundColor: '#1C1C1C',
          color: '#fff',
          borderRadius: '12px',
          border: 'none',
          fontSize: '15px',
          fontWeight: '600',
          marginTop: '16px',
          cursor: 'pointer'
        }}>
          Create Account
        </button>

      </div>

      {/* Login Link */}
      <div style={{ marginTop: 'auto', paddingTop: '32px', textAlign: 'center' }}>
        <div style={{ fontSize: '14px', color: '#888' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#000', fontWeight: '600', textDecoration: 'none' }}>
            Sign in
          </Link>
        </div>
      </div>

    </div>
    </>
  );
}
