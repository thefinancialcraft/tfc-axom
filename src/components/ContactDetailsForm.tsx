import React, { useEffect } from 'react';
import { Mail, Phone, Users, AlertCircle } from 'lucide-react';

interface ContactDetailsFormProps {
  email: string;
  setEmail: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  alternateContact: string;
  setAlternateContact: (val: string) => void;
  emergencyContact: string;
  setEmergencyContact: (val: string) => void;
  isUpdating: boolean;
  goToStep: (step: any) => void;
  handleUpdateContact: () => void;
  originalProfile: any;
}

export default function ContactDetailsForm({
  email, setEmail,
  phone, setPhone,
  alternateContact, setAlternateContact,
  emergencyContact, setEmergencyContact,
  isUpdating, goToStep, handleUpdateContact, originalProfile
}: ContactDetailsFormProps) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const topElement = document.getElementById('top-of-page');
      if (topElement) {
        topElement.scrollIntoView({ behavior: 'instant', block: 'start' });
      }
    }
  }, []);

  return (
    <div className="responsive-form-container" style={{ display: 'flex', flexDirection: 'column', padding: '0', alignItems: 'stretch' }}>
      {/* Header with Logo */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: '40px' }}>
        <img src="/logo.png" alt="TFC Axom Logo" style={{ width: '40px', height: 'auto', marginBottom: '8px', filter: 'brightness(0)' }} />
        <span style={{ fontSize: '16px', fontWeight: '700', color: '#000' }}>TFC Axom</span>
      </div>

      <h1 style={{ fontSize: '32px', fontWeight: '700', margin: '0 0 32px 0', color: '#000', textAlign: 'left' }}>
        Contact Details
      </h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px', textAlign: 'left' }}>
        <div className="responsive-flex-row">
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#000', textAlign: 'left' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="#888" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="email" 
                value={email}
                placeholder="e.g. johndoe@gmail.com"
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%', padding: '16px 16px 16px 44px', borderRadius: '12px', border: 'none', backgroundColor: '#ffffff', fontSize: '14px', color: '#333', outline: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', transition: 'box-shadow 0.2s', textAlign: 'left', boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.boxShadow = '0 2px 12px rgba(52, 187, 136, 0.2)'}
                onBlur={(e) => e.target.style.boxShadow = '0 2px 10px rgba(0,0,0,0.02)'}
              />
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#000', textAlign: 'left' }}>Phone Number</label>
            <div style={{ position: 'relative' }}>
              <Phone size={18} color="#888" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="tel" 
                value={phone}
                placeholder="e.g. +91 9876543210"
                onChange={(e) => setPhone(e.target.value)}
                style={{
                  width: '100%', padding: '16px 16px 16px 44px', borderRadius: '12px', border: 'none', backgroundColor: '#ffffff', fontSize: '14px', color: '#333', outline: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', transition: 'box-shadow 0.2s', textAlign: 'left', boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.boxShadow = '0 2px 12px rgba(52, 187, 136, 0.2)'}
                onBlur={(e) => e.target.style.boxShadow = '0 2px 10px rgba(0,0,0,0.02)'}
              />
            </div>
          </div>
        </div>
        <div className="responsive-flex-row">
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#000', textAlign: 'left' }}>Alternate Contact</label>
            <div style={{ position: 'relative' }}>
              <Users size={18} color="#888" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="tel" 
                value={alternateContact}
                placeholder="e.g. +91 9876543211"
                onChange={(e) => setAlternateContact(e.target.value)}
                style={{
                  width: '100%', padding: '16px 16px 16px 44px', borderRadius: '12px', border: 'none', backgroundColor: '#ffffff', fontSize: '14px', color: '#333', outline: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', transition: 'box-shadow 0.2s', textAlign: 'left', boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.boxShadow = '0 2px 12px rgba(52, 187, 136, 0.2)'}
                onBlur={(e) => e.target.style.boxShadow = '0 2px 10px rgba(0,0,0,0.02)'}
              />
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#000', textAlign: 'left' }}>Emergency Contact No</label>
            <div style={{ position: 'relative' }}>
              <AlertCircle size={18} color="#888" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="tel" 
                value={emergencyContact}
                placeholder="e.g. +91 9876543212"
                onChange={(e) => setEmergencyContact(e.target.value)}
                style={{
                  width: '100%', padding: '16px 16px 16px 44px', borderRadius: '12px', border: 'none', backgroundColor: '#ffffff', fontSize: '14px', color: '#333', outline: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', transition: 'box-shadow 0.2s', boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.boxShadow = '0 2px 12px rgba(52, 187, 136, 0.2)'}
                onBlur={(e) => e.target.style.boxShadow = '0 2px 10px rgba(0,0,0,0.02)'}
              />
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', flexDirection: 'row' }}>
        <button 
          onClick={() => goToStep('input_gender_blood')}
          style={{
            flex: 1, padding: '16px', backgroundColor: 'transparent', color: '#666', border: '1px solid #E5E7EB', borderRadius: '12px', fontSize: '15px', fontWeight: '600', cursor: 'pointer'
          }}
        >
          Back
        </button>
        <button 
          onClick={handleUpdateContact}
          disabled={isUpdating}
          style={{
            flex: 1, padding: '16px', backgroundColor: '#1C1C1C', color: '#fff', borderRadius: '12px', border: 'none', fontSize: '15px', fontWeight: '600', cursor: !isUpdating ? 'pointer' : 'not-allowed', opacity: !isUpdating ? 1 : 0.7
          }}
        >
          {isUpdating ? 'Updating...' : (
            originalProfile && email === (originalProfile.email || '') && phone === (originalProfile.phone || '') && alternateContact === (originalProfile.alternate_contact || '') && emergencyContact === (originalProfile.emergency_contact_no || '')
            ? 'Next' : 'Submit'
          )}
        </button>
      </div>
    </div>
  );
}
