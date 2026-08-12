'use client';
import React, { useState } from 'react';
import { Mail, Lock, User, Phone } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import ProfileCreator from '@/components/ProfileCreator';
import { updateAuthUserAdmin } from '../actions/auth';

function SignupForm() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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

  const handleSignup = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }
    
    if (!email || !password || !name) {
      setErrorMsg('Please fill out all required fields');
      return;
    }

    setIsSigningUp(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          phone: phone,
        }
      }
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      if (data.user?.id) {
        if (phone) {
          await updateAuthUserAdmin(data.user.id, { phone });
        }

        // Insert into user_profiles
        const { error: insertError } = await supabase.from('user_profiles').insert({
          user_id: data.user.id,
          email: data.user.email,
          user_name: name || data.user.email?.split('@')[0] || 'User',
          phone: phone || null,
          profile_pic_url: ''
        });

        if (insertError) {
          console.error("Error inserting profile:", insertError);
        }
      }
      
      let timeLeft = 3;
      setSuccessMsg(`Account created successfully! Redirecting to dashboard in ${timeLeft}s...`);
      
      const interval = setInterval(() => {
        timeLeft -= 1;
        if (timeLeft > 0) {
          setSuccessMsg(`Account created successfully! Redirecting to dashboard in ${timeLeft}s...`);
        }
      }, 1000);

      setTimeout(() => {
        clearInterval(interval);
        router.replace('/dashboard');
      }, 3000);
    }
    // We do not reset isSigningUp to false if we are redirecting, 
    // to prevent the user from clicking again while waiting.
    if (error) {
      setIsSigningUp(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '14px 16px 14px 44px', boxSizing: 'border-box' as const,
    backgroundColor: 'var(--text-color)', border: '1px solid #E5E7EB', borderRadius: '12px',
    fontSize: '14px', color: '#000', outline: 'none'
  };

  return (
    <div style={{ width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', margin: 'auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '3vh', marginTop: '2vh' }}>
        <img src="/logo.png" alt="TFC Axom Logo" style={{ width: '40px', height: 'auto', marginBottom: '1vh' }} />
        <span style={{ fontSize: '18px', fontWeight: '700', color: '#000' }}>TFC Axom</span>
      </div>

      <h1 style={{ fontSize: '32px', fontWeight: '700', margin: '0 0 3vh 0', color: '#000', textAlign: 'center' }}>
        Create Account
      </h1>

      {/* Form Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2vh' }}>
        
        {step === 1 && (
          <div style={{ animation: 'fadeInRight 0.4s ease-out' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '8px', color: '#333' }}>
              User Name
            </label>
            <div style={{ position: 'relative' }}>
              <User size={18} color="#888" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              <input type="text" placeholder="John Doe" style={inputStyle} value={name} onChange={e => setName(e.target.value)} />
            </div>
            
            <button onClick={() => setStep(2)} style={{
              width: '100%', padding: '14px', backgroundColor: '#1A1A1A', color: '#ffffff',
              border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '600',
              cursor: 'pointer', marginTop: '16px', transition: 'background 0.2s'
            }}>
              Next
            </button>
          </div>
        )}

        {step === 2 && (
          <div style={{ animation: 'fadeInRight 0.4s ease-out' }}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '8px', color: '#333' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="#888" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                <input type="email" placeholder="johndoe@gmail.com" style={inputStyle} value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '8px', color: '#333' }}>
                Phone no.
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} color="#888" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                <input type="tel" placeholder="+91 98765 43210" style={inputStyle} value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button onClick={() => setStep(1)} style={{
                flex: 1, padding: '14px', backgroundColor: 'var(--text-color)', color: '#000',
                border: '1px solid #E5E7EB', borderRadius: '12px', fontSize: '15px', fontWeight: '600',
                cursor: 'pointer', transition: 'background 0.2s'
              }}>
                Back
              </button>
              <button onClick={() => setStep(3)} style={{
                flex: 1, padding: '14px', backgroundColor: '#1A1A1A', color: '#ffffff',
                border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '600',
                cursor: 'pointer', transition: 'background 0.2s'
              }}>
                Next
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ animation: 'fadeInRight 0.4s ease-out' }}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '8px', color: '#333' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="#888" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                <input type="password" placeholder="••••••••" style={inputStyle} value={password} onChange={e => setPassword(e.target.value)} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '8px', color: '#333' }}>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="#888" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                <input type="password" placeholder="••••••••" style={inputStyle} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button onClick={() => setStep(2)} style={{
                flex: 1, padding: '14px', backgroundColor: 'var(--text-color)', color: '#000',
                border: '1px solid #E5E7EB', borderRadius: '12px', fontSize: '15px', fontWeight: '600',
                cursor: 'pointer', transition: 'background 0.2s'
              }}>
                Back
              </button>
              <button 
                onClick={handleSignup}
                disabled={isSigningUp}
                style={{
                flex: 1, padding: '14px', backgroundColor: '#1A1A1A', color: '#ffffff',
                border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '600',
                cursor: isSigningUp ? 'not-allowed' : 'pointer', transition: 'background 0.2s',
                opacity: isSigningUp ? 0.7 : 1
              }}>
                {isSigningUp ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </div>
        )}
        
        {/* Messages */}
        {errorMsg && (
          <div style={{ color: '#ef4444', fontSize: '13px', textAlign: 'center', marginTop: '8px' }}>
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div style={{ color: '#10b981', fontSize: '13px', textAlign: 'center', marginTop: '8px' }}>
            {successMsg}
          </div>
        )}

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '1vh 0' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }}></div>
          <span style={{ fontSize: '13px', color: '#888', fontWeight: '500' }}>OR</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }}></div>
        </div>

        {/* Social Logins */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button 
            onClick={handleGoogleSignup}
            disabled={isGoogleLoading}
            style={{
              width: '100%', height: '48px', borderRadius: '14px', backgroundColor: 'var(--text-color)',
              border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              cursor: isGoogleLoading ? 'not-allowed' : 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
              opacity: isGoogleLoading ? 0.7 : 1
            }}>
            {isGoogleLoading ? (
              <div style={{ width: '20px', height: '20px', border: '2px solid #ccc', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            ) : (
              <>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>Sign up with Google</span>
              </>
            )}
          </button>
        </div>

        {/* Links */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginTop: '1vh', marginBottom: '2vh' }}>
          <span style={{ fontSize: '13px', color: '#888' }}>
            Already have an account? <Link href="/login" style={{ color: '#000', fontWeight: '600', textDecoration: 'none' }}>Sign in</Link>
          </span>
        </div>

      </div>
    </div>
  );
}

function MobileSignupLayout() {
  return (
    <div style={{ 
      backgroundColor: '#F9FAFB', 
      minHeight: '100vh', 
      color: '#000000',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
      
      <div style={{ margin: 'auto', width: '100%' }}>
        <SignupForm />
      </div>
    </div>
  );
}

function DesktopSignupLayout() {
  return (
    <div style={{ display: 'flex', width: '100%', height: '100vh', overflow: 'hidden', backgroundColor: '#F9FAFB' }}>
      <style>{`
        @keyframes slideFromRight {
          from { transform: translateX(125%); }
          to { transform: translateX(0); }
        }
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      {/* Left Pane - Visual Area */}
      <div style={{ flex: 0.8, backgroundColor: '#111', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', borderTopRightRadius: '40px', borderBottomRightRadius: '40px', boxShadow: '20px 0 50px rgba(0,0,0,0.2)', zIndex: 10, animation: 'slideFromRight 0.6s cubic-bezier(0.25, 1, 0.5, 1) forwards' }}>
        
        {/* Background Graphic */}
        <div style={{ position: 'absolute', top: '5%', left: '-15%', opacity: 0.15, transform: 'scale(1.2)', pointerEvents: 'none' }}>
           <svg width="600" height="600" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
             <path d="M100 20L20 180h40l20-40h40l20 40h40L100 20z" fill="#FFF"/>
             <path d="M100 60l-15 30h30L100 60z" fill="#111"/>
           </svg>
        </div>

        {/* Diagonal Ray Effect */}
        <div style={{ position: 'absolute', top: '-10%', left: '10%', width: '300px', height: '800px', background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 100%)', transform: 'rotate(-45deg)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '-20%', left: '0%', width: '150px', height: '800px', background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%)', transform: 'rotate(-45deg)', pointerEvents: 'none' }} />
        
        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1, padding: '6vh 60px', display: 'flex', flexDirection: 'column', height: '100%' }}>
          
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

      {/* Right Pane - Signup Form */}
      <div className="status-scroll" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4vh 40px', overflowY: 'auto', zIndex: 1, animation: 'fadeInLeft 0.5s ease-out 0.2s both' }}>
        <SignupForm />
      </div>
      
    </div>
  );
}

export default function SignupPage() {
  return (
    <>
      <ProfileCreator />
      
      {/* Mobile Flow */}
      <div className="mobile-only-block">
        <MobileSignupLayout />
      </div>

      {/* Desktop Flow */}
      <div className="desktop-only-flex">
        <DesktopSignupLayout />
      </div>
    </>
  );
}
