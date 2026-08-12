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
    <div className="responsive-form-container" style={{ display: 'flex', flexDirection: 'column', width: '100%', boxSizing: 'border-box', alignItems: 'stretch' }}>
      {/* Header with Logo */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: '40px' }}>
        <img src="/logo.png" alt="TFC Axom Logo" style={{ width: '40px', height: 'auto', marginBottom: '8px', filter: 'brightness(0)' }} />
        <span style={{ fontSize: '16px', fontWeight: '700', color: '#000' }}>TFC Axom</span>
      </div>

      <h1 className="profile-heading" style={{ fontSize: '32px', fontWeight: '700', margin: '0 0 32px 0', color: '#000', textAlign: 'left' }}>
        Contact Details
      </h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', marginBottom: '32px', textAlign: 'left' }}>
        <div className="responsive-flex-row">
          <div style={{ flex: 1 }}>
            <label className="profile-label">Email Address</label>
            <div className="profile-input-container">
              <Mail />
              <input 
                type="email" 
                value={email}
                placeholder="e.g. johndoe@gmail.com"
                onChange={(e) => setEmail(e.target.value)}
                className="profile-input"
              />
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <label className="profile-label">Phone Number</label>
            <div className="profile-input-container">
              <Phone />
              <input 
                type="tel" 
                value={phone}
                placeholder="e.g. +91 9876543210"
                onChange={(e) => setPhone(e.target.value)}
                className="profile-input"
              />
            </div>
          </div>
        </div>
        <div className="responsive-flex-row">
          <div style={{ flex: 1 }}>
            <label className="profile-label">Alternate Contact</label>
            <div className="profile-input-container">
              <Users />
              <input 
                type="tel" 
                value={alternateContact}
                placeholder="e.g. +91 9876543211"
                onChange={(e) => setAlternateContact(e.target.value)}
                className="profile-input"
              />
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <label className="profile-label">Emergency Contact No</label>
            <div className="profile-input-container">
              <AlertCircle />
              <input 
                type="tel" 
                value={emergencyContact}
                placeholder="e.g. +91 9876543212"
                onChange={(e) => setEmergencyContact(e.target.value)}
                className="profile-input"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="responsive-btn-group" style={{ marginBottom: '40px' }}>
        <button 
          onClick={() => goToStep('input_gender_blood')}
          className="profile-btn-back"
        >
          Back
        </button>
        <button 
          onClick={handleUpdateContact}
          disabled={isUpdating}
          className="profile-btn-next"
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
