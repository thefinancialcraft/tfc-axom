'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ChevronRight, User, Check } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import ProfileCheck from '@/components/ProfileCheck';
import MeteorShower from '@/components/MeteorShower';

export default function LoginPage() {
  const [step, setStep] = useState<'landing' | 'login'>('landing');

  return (
    <>
      <ProfileCheck />

      {/* Mobile Flow (Swipe to Login) */}
      <div className="mobile-only-block">
        {step === 'landing' ? (
          <LandingScreen onNext={() => setStep('login')} />
        ) : (
          <LoginScreen />
        )}
      </div>

      {/* Desktop Flow (Split Screen) */}
      <div className="desktop-only-flex" style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
        <DesktopLoginLayout />
      </div>
    </>
  );
}

function LandingScreen({ onNext }: { onNext: () => void }) {
  return (
    <div style={{
      backgroundColor: '#0F0F0F',
      minHeight: '100vh',
      color: 'var(--text-color)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <MeteorShower />
      {/* Subtler Central Background Pattern Halo */}
      <div
        style={{
          position: 'absolute',
          top: '30%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '600px', height: '600px',
          opacity: 0.15,
          background: 'repeating-linear-gradient(135deg, transparent, transparent 80px, rgba(255, 255, 255, 0.15) 80px, rgba(255, 255, 255, 0.15) 100px, transparent 100px, transparent 110px, rgba(255, 255, 255, 0.1) 110px, rgba(255, 255, 255, 0.1) 115px)',
          maskImage: 'radial-gradient(circle at center, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 50%)',
          WebkitMaskImage: 'radial-gradient(circle at center, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 50%)',
          animation: 'shimmer 8s linear infinite',
          zIndex: 0,
          pointerEvents: 'none'
        }}
      />

      <div style={{ flex: 1, padding: '40px 24px', display: 'flex', flexDirection: 'column' }}>

        {/* Top Logo Area */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px', marginBottom: '40px' }}>
          <img src="/logo.png" alt="TFC Axom Logo" style={{ width: '180px', height: 'auto', filter: 'brightness(0) invert(1)' }} />
        </div>

        {/* Text Content */}
        <div style={{ marginTop: 'auto' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>
            The Financial Craft
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: '700', margin: '0 0 16px 0', lineHeight: 1.2 }}>
            Welcome to Axom
          </h1>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: '24px' }}>
            The official Attendance Management System designed exclusively for The Financial Craft. Log your daily check-ins, request leaves, and track your performance effortlessly.
          </p>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', fontWeight: '500', marginBottom: '32px' }}>
            Your all-in-one employee dashboard
          </p>
        </div>

        {/* Bottom Card / Slider */}
        <div
          style={{
            backgroundColor: '#2A2A2A',
            borderRadius: '24px',
            padding: '24px',
            position: 'relative',
            overflow: 'hidden',
            borderTopRightRadius: '60px' // special shape from design
          }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 12px 0', width: '80%' }}>
            Track your attendance efficiently
          </h2>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, margin: 0, width: '70%', marginBottom: '32px' }}>
            Join your team and experience the easiest way to manage your work hours.
          </p>

          {/* Custom Login Slider */}
          <SwipeToLogin onComplete={onNext} />
        </div>

      </div>
    </div>
  );
}

function SwipeToLogin({ onComplete }: { onComplete: () => void }) {
  const [value, setValue] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setValue(val);
    if (val >= 95) {
      onComplete();
    }
  };

  const handleRelease = () => {
    if (value < 95) {
      setValue(0); // Snap back to start if not fully swiped
    }
  };

  const offset = (value * 56) / 100;

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '56px',
      backgroundColor: '#1A1A1A',
      borderRadius: '28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.05)'
    }}>
      {/* Background Text */}
      <span
        className="shimmer-text"
        style={{ color: 'rgba(255,255,255,0.4)', fontSize: '15px', fontWeight: '500', letterSpacing: '1px', pointerEvents: 'none', transition: 'opacity 0.3s', opacity: value > 10 ? 0 : 1 }}>
        Slide to login
      </span>

      {/* Active Track (Fill) */}
      <div style={{
        position: 'absolute',
        top: 0, bottom: 0, left: 0,
        width: `calc(${value}% + 56px - ${offset}px)`,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '28px',
        transition: value === 0 ? 'width 0.3s ease' : 'none'
      }} />

      {/* Thumb Indicator */}
      <div style={{
        position: 'absolute',
        left: `calc(${value}% - ${offset}px)`,
        width: '48px',
        height: '48px',
        margin: '4px',
        borderRadius: '50%',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        pointerEvents: 'none',
        transition: value === 0 ? 'left 0.3s ease' : 'none'
      }}>
        <ChevronRight size={24} color="#000" />
      </div>

      {/* Invisible Range Input */}
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={handleChange}
        onMouseUp={handleRelease}
        onTouchEnd={handleRelease}
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          opacity: 0,
          cursor: 'grab',
          width: '100%',
          height: '100%',
          margin: 0
        }}
      />
    </div>
  );
}

function LoginScreen() {
  const router = useRouter();
  const [loginMethod, setLoginMethod] = useState<'email' | 'userid'>('userid');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/login`
      }
    });
    if (error) {
      console.error('Error logging in with Google:', error.message);
      setIsGoogleLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setLoginError('Please enter both identifier and password.');
      return;
    }
    setIsLoginLoading(true);
    setLoginError('');

    let finalEmail = email;

    // Optional user ID mapping
    if (loginMethod === 'userid' && !email.includes('@')) {
      try {
        const { data } = await supabase
          .from('user_profiles')
          .select('email')
          .eq('employee_id', email)
          .maybeSingle();
        if (data?.email) {
          finalEmail = data.email;
        }
      } catch (err) {
        console.error(err);
      }
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: finalEmail,
      password: password,
    });

    if (error) {
      setLoginError(error.message);
      setIsLoginLoading(false);
    } else {
      router.replace('/dashboard');
    }
  };

  return (
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
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: '40px' }}>
        <img src="/logo.png" alt="TFC Axom Logo" style={{ width: '40px', height: 'auto', marginBottom: '8px' }} />
        <span style={{ fontSize: '16px', fontWeight: '700' }}>TFC Axom</span>
      </div>

      <h1 style={{ fontSize: '32px', fontWeight: '700', margin: '0 0 32px 0' }}>
        Sign in
      </h1>

      {/* Form */}
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Email or User ID */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
            {loginMethod === 'email' ? 'Email Address' : 'User ID'}
          </label>
          <div style={{ position: 'relative' }}>
            {loginMethod === 'email' ? (
              <Mail size={18} color="#888" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            ) : (
              <User size={18} color="#888" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            )}
            <input
              type={loginMethod === 'email' ? "email" : "text"}
              placeholder={loginMethod === 'email' ? "johndoe@gmail.com" : "e.g. AXOM-123"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '16px 16px 16px 44px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: 'var(--text-color)',
                fontSize: '14px',
                color: '#333',
                outline: 'none',
                boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
              }}
              required
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '16px 16px 16px 44px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: 'var(--text-color)',
                fontSize: '14px',
                color: '#333',
                outline: 'none',
                boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
              }}
              required
            />
          </div>
        </div>

        {/* Remember Me */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
          <input type="checkbox" id="remember" style={{ width: '16px', height: '16px', accentColor: '#000' }} />
          <label htmlFor="remember" style={{ fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Remember me</label>
        </div>

        {/* Sign In Button */}
        <button 
          type="submit"
          disabled={isLoginLoading}
          style={{
            width: '100%',
            padding: '16px',
            backgroundColor: '#1C1C1C',
            color: '#ffffff',
            borderRadius: '12px',
            border: 'none',
            fontSize: '15px',
            fontWeight: '600',
            marginTop: '8px',
            cursor: isLoginLoading ? 'not-allowed' : 'pointer',
            opacity: isLoginLoading ? 0.7 : 1
          }}
        >
          {isLoginLoading ? 'Signing in...' : 'Sign in'}
        </button>

        {loginError && (
          <p style={{ color: '#ef4444', fontSize: '13px', textAlign: 'center', margin: '4px 0 0 0' }}>
            {loginError}
          </p>
        )}

        {/* Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
          <div style={{ fontSize: '13px', color: '#888' }}>
            Don't have an account?{' '}
            <Link href="/signup" style={{ color: '#000', fontWeight: '600', textDecoration: 'none' }}>
              Sign up
            </Link>
          </div>
          <div style={{ fontSize: '13px', color: '#800' }}>
            <Link href="/forgot-password" style={{ color: '#000', fontWeight: '600', textDecoration: 'none' }}>
              Forgot Password
            </Link>
          </div>
        </div>
      </form>

      {/* Login Options */}
      <div style={{ marginTop: 'auto', paddingTop: '40px', display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
        <button
          onClick={() => setLoginMethod(prev => prev === 'email' ? 'userid' : 'email')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px',
            backgroundColor: 'var(--text-color)',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            color: '#333',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}>
          {loginMethod === 'email' ? (
            <>
              <User size={18} color="#333" />
              User ID
            </>
          ) : (
            <>
              <Mail size={18} color="#333" />
              Email
            </>
          )}
        </button>
        <button
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px',
            backgroundColor: 'var(--text-color)',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: isGoogleLoading ? 'not-allowed' : 'pointer',
            color: '#333',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
            opacity: isGoogleLoading ? 0.7 : 1
          }}>
          {isGoogleLoading ? (
            <div style={{ width: '18px', height: '18px', border: '2px solid #ccc', borderTopColor: '#333', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          ) : (
            <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
          )}
          {isGoogleLoading ? 'Connecting...' : 'Google'}
        </button>
      </div>

    </div>
  );
}

function DesktopLoginLayout() {
  const router = useRouter();
  const [loginMethod, setLoginMethod] = useState<'email' | 'userid'>('userid');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/login`
      }
    });
    if (error) {
      console.error('Error logging in with Google:', error.message);
      setIsGoogleLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setLoginError('Please enter both identifier and password.');
      return;
    }
    setIsLoginLoading(true);
    setLoginError('');

    let finalEmail = email;

    if (loginMethod === 'userid' && !email.includes('@')) {
      try {
        const { data } = await supabase
          .from('user_profiles')
          .select('email')
          .eq('employee_id', email)
          .maybeSingle();
        if (data?.email) {
          finalEmail = data.email;
        }
      } catch (err) {
        console.error(err);
      }
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: finalEmail,
      password: password,
    });

    if (error) {
      setLoginError(error.message);
      setIsLoginLoading(false);
    } else {
      router.replace('/dashboard');
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      width: '100%', 
      height: '100vh', 
      overflow: 'hidden', 
      backgroundColor: '#F9FAFB',
      animation: 'pageFade 0.5s ease-out both'
    }}>
      <style>{`
        @keyframes pageFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideFromLeft {
          from { transform: translateX(-125%); }
          to { transform: translateX(0); }
        }
        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* Left Pane - Login Form */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4vh 40px', overflow: 'hidden', zIndex: 1, animation: 'fadeInRight 0.5s ease-out 0.2s both' }}>
        <div style={{ width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', margin: 'auto' }}>

          {/* Logo Center */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '4vh', marginTop: '2vh' }}>
            <img src="/logo.png" alt="TFC Axom Logo" style={{ width: '40px', height: 'auto', marginBottom: '1vh' }} />
            <span style={{ fontSize: '18px', fontWeight: '700', color: '#000' }}>TFC Axom</span>
          </div>

          <h1 style={{ fontSize: '32px', fontWeight: '700', margin: '0 0 3vh 0', color: '#000' }}>
            Sign in
          </h1>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '2vh' }}>

            {/* Email Input */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '8px', color: '#333' }}>
                {loginMethod === 'email' ? 'Email Address' : 'User ID'}
              </label>
              <div style={{ position: 'relative' }}>
                {loginMethod === 'email' ? (
                  <Mail size={18} color="#888" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                ) : (
                  <User size={18} color="#888" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                )}
                <input
                  type={loginMethod === 'email' ? "email" : "text"}
                  placeholder={loginMethod === 'email' ? "johndoe@gmail.com" : "e.g. AXOM-123"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%', padding: '14px 16px 14px 44px', boxSizing: 'border-box',
                    backgroundColor: 'var(--text-color)', border: '1px solid #E5E7EB', borderRadius: '12px',
                    fontSize: '14px', color: '#000', outline: 'none'
                  }}
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '8px', color: '#333' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="#888" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%', padding: '14px 16px 14px 44px', boxSizing: 'border-box',
                    backgroundColor: 'var(--text-color)', border: '1px solid #E5E7EB', borderRadius: '12px',
                    fontSize: '14px', color: '#000', outline: 'none'
                  }}
                  required
                />
              </div>
            </div>

            {/* Remember Me */}
            <div 
              style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '-4px', cursor: 'pointer' }}
              onClick={() => setRememberMe(!rememberMe)}
            >
              <div style={{
                width: '18px', height: '18px', borderRadius: '5px',
                border: rememberMe ? 'none' : '2px solid #D1D5DB',
                backgroundColor: rememberMe ? '#000' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}>
                {rememberMe && <Check size={14} color="#fff" strokeWidth={3} />}
              </div>
              <input type="checkbox" id="remember" checked={rememberMe} readOnly style={{ display: 'none' }} />
              <label htmlFor="remember" style={{ fontSize: '13px', color: '#555', cursor: 'pointer', fontWeight: '500', userSelect: 'none' }}>
                Remember me
              </label>
            </div>

            {/* Sign in button */}
            <button 
              type="submit"
              disabled={isLoginLoading}
              style={{
                width: '100%', padding: '14px', backgroundColor: '#1A1A1A', color: '#ffffff',
                border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '600',
                cursor: isLoginLoading ? 'not-allowed' : 'pointer', marginTop: '8px', transition: 'background 0.2s',
                opacity: isLoginLoading ? 0.7 : 1
              }}
            >
              {isLoginLoading ? 'Signing in...' : 'Sign in'}
            </button>

            {loginError && (
              <p style={{ color: '#ef4444', fontSize: '13px', textAlign: 'center', margin: '4px 0 0 0' }}>
                {loginError}
              </p>
            )}

            {/* Links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '2vh' }}>
              <span style={{ fontSize: '13px', color: '#888' }}>
                Don't have an account? <Link href="/signup" style={{ color: '#000', fontWeight: '600', textDecoration: 'none' }}>Sign up</Link>
              </span>
              <Link 
                href="/forgot-password"
                style={{ fontSize: '13px', color: '#888', fontWeight: '600', textDecoration: 'none' }}
              >
                Forgot Password
              </Link>
            </div>
          </form>

          {/* Social Logins */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '3vh', marginBottom: '2vh' }}>

            {/* Google Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              style={{
                width: '180px', height: '48px', borderRadius: '14px', backgroundColor: 'var(--text-color)',
                border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                cursor: isGoogleLoading ? 'not-allowed' : 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                opacity: isGoogleLoading ? 0.7 : 1
              }}>
              {isGoogleLoading ? (
                <div style={{ width: '20px', height: '20px', border: '2px solid #ccc', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              ) : (
                <>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>Google</span>
                </>
              )}
            </button>

            {/* User ID / Email Toggle Button */}
            <button
              onClick={() => setLoginMethod(prev => prev === 'email' ? 'userid' : 'email')}
              style={{
                width: '180px', height: '48px', borderRadius: '14px', backgroundColor: 'var(--text-color)',
                border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
              }}>
              {loginMethod === 'email' ? (
                <>
                  <User size={20} color="#333" />
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>User ID</span>
                </>
              ) : (
                <>
                  <Mail size={20} color="#333" />
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>Email ID</span>
                </>
              )}
            </button>

          </div>
        </div>
      </div>

      {/* Right Pane - Visual Area */}
      <div style={{ 
        flex: 0.8, 
        backgroundColor: '#111', 
        position: 'relative', 
        overflow: 'hidden', 
        display: 'flex', 
        flexDirection: 'column', 
        borderTopLeftRadius: '40px', 
        borderBottomLeftRadius: '40px', 
        boxShadow: '-20px 0 50px rgba(0,0,0,0.2)', 
        zIndex: 10, 
        animation: 'slideFromLeft 0.6s cubic-bezier(0.25, 1, 0.5, 1) forwards'
      }}>
        <MeteorShower />

        {/* Background Graphic (Arcana style geometric A) */}
        <div style={{ position: 'absolute', top: '5%', right: '-15%', opacity: 0.15, transform: 'scale(1.2)', pointerEvents: 'none' }}>
          <svg width="600" height="600" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 20L20 180h40l20-40h40l20 40h40L100 20z" fill="#FFF" />
            <path d="M100 60l-15 30h30L100 60z" fill="#111" />
          </svg>
        </div>

        {/* Diagonal Ray Effect */}
        <div style={{ position: 'absolute', top: '-10%', right: '10%', width: '300px', height: '800px', background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 100%)', transform: 'rotate(45deg)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '-20%', right: '0%', width: '150px', height: '800px', background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%)', transform: 'rotate(45deg)', pointerEvents: 'none' }} />

        {/* Content Container */}
        <div style={{ 
          position: 'relative', 
          zIndex: 1, 
          padding: '6vh 60px', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between', 
          height: '100%',
          width: '100%',
        }}>

          {/* Left Part - Welcome Content */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            height: '100%', 
            width: '100%',
          }}>
            {/* Logo Name */}
            <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-color)', letterSpacing: '1px', marginBottom: 'auto' }}>
              TFC Axom
            </div>

            <div style={{ maxWidth: '420px', marginBottom: 'auto' }}>
              <h2 style={{ fontSize: '36px', fontWeight: '700', color: 'var(--text-color)', marginBottom: '2vh', lineHeight: 1.1 }}>
                Welcome to TFC Axom
              </h2>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: '2.5vh' }}>
                TFC Axom helps developers and teams build organized and well-coded dashboards full of beautiful and rich modules. Join us and start building your application today.
              </p>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', fontWeight: '500' }}>
                More than 500+ employees joined us, it's your turn
              </p>
            </div>

            {/* Floating Card */}
            <div style={{
              backgroundColor: '#2A2A2A',
              borderRadius: '24px',
              borderTopRightRadius: '60px',
              padding: '32px',
              width: '80%',
              maxWidth: '420px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
              position: 'relative',
              alignSelf: 'flex-start'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-color)', margin: '0 0 12px 0', lineHeight: 1.3, maxWidth: '90%' }}>
                Track your attendance and leaves efficiently
              </h3>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: '0 0 24px 0', maxWidth: '90%' }}>
                Be among the first employees to experience the easiest way to manage your work hours and stay organized.
              </p>

              {/* Avatar Group */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#ff9c9c', border: '2px solid #2A2A2A', zIndex: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <User size={20} color="#fff" />
                </div>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#9cffd5', border: '2px solid #2A2A2A', marginLeft: '-12px', zIndex: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <User size={20} color="#333" />
                </div>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#9cb3ff', border: '2px solid #2A2A2A', marginLeft: '-12px', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <User size={20} color="#fff" />
                </div>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#1A1A1A', border: '2px solid #2A2A2A', marginLeft: '-12px', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-color)', fontSize: '12px', fontWeight: '600' }}>
                  +12
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}


