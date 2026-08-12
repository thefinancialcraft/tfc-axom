import React, { useEffect } from 'react';
import { Building, User, CreditCard, Hash, MapPin, Map, Link as LinkIcon } from 'lucide-react';

interface BankingInfoFormProps {
  bankName: string; setBankName: (v: string) => void;
  accountHolderName: string; setAccountHolderName: (v: string) => void;
  accountNumber: string; setAccountNumber: (v: string) => void;
  ifscCode: string; setIfscCode: (v: string) => void;
  branchCity: string; setBranchCity: (v: string) => void;
  branchState: string; setBranchState: (v: string) => void;
  branchPincode: string; setBranchPincode: (v: string) => void;
  bankPassbookUrl: string; setBankPassbookUrl: (v: string) => void;
  isUpdating: boolean;
  goToStep: (step: any) => void;
  handleUpdateBanking: () => void;
  originalProfile?: any;
}

export default function BankingInfoForm({
  bankName, setBankName,
  accountHolderName, setAccountHolderName,
  accountNumber, setAccountNumber,
  ifscCode, setIfscCode,
  branchCity, setBranchCity,
  branchState, setBranchState,
  branchPincode, setBranchPincode,
  bankPassbookUrl, setBankPassbookUrl,
  isUpdating, goToStep, handleUpdateBanking, originalProfile
}: BankingInfoFormProps) {

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
      
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: '40px' }}>
        <img src="/logo.png" alt="TFC Axom Logo" style={{ width: '40px', height: 'auto', marginBottom: '8px', filter: 'brightness(0)' }} />
        <span style={{ fontSize: '16px', fontWeight: '700', color: '#000' }}>TFC Axom</span>
      </div>

      <h1 className="profile-heading" style={{ fontSize: '32px', fontWeight: '700', margin: '0 0 32px 0', color: '#000', textAlign: 'left' }}>
        Banking Info
      </h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', marginBottom: '32px', textAlign: 'left' }}>
        <div className="responsive-flex-row">
          <div style={{ flex: 1 }}>
            <label className="profile-label">Bank Name</label>
            <div className="profile-input-container">
              <Building />
              <input 
                type="text" 
                value={bankName}
                placeholder="e.g. State Bank of India"
                onChange={(e) => setBankName(e.target.value)}
                className="profile-input"
              />
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <label className="profile-label">Account Holder Name</label>
            <div className="profile-input-container">
              <User />
              <input 
                type="text" 
                value={accountHolderName}
                placeholder="e.g. John Doe"
                onChange={(e) => setAccountHolderName(e.target.value)}
                className="profile-input"
              />
            </div>
          </div>
        </div>

        <div className="responsive-flex-row">
          <div style={{ flex: 1 }}>
            <label className="profile-label">Account Number</label>
            <div className="profile-input-container">
              <CreditCard />
              <input 
                type="text" 
                value={accountNumber}
                placeholder="e.g. 123456789012"
                onChange={(e) => setAccountNumber(e.target.value)}
                className="profile-input"
              />
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <label className="profile-label">IFSC Code</label>
            <div className="profile-input-container">
              <Hash />
              <input 
                type="text" 
                value={ifscCode}
                placeholder="e.g. SBIN0001234"
                onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                className="profile-input"
                style={{ textTransform: 'uppercase' }}
              />
            </div>
          </div>
        </div>

        <div className="responsive-flex-row">
          <div style={{ flex: 1 }}>
            <label className="profile-label">Branch City</label>
            <div className="profile-input-container">
              <MapPin />
              <input 
                type="text" 
                value={branchCity}
                placeholder="City"
                onChange={(e) => setBranchCity(e.target.value)}
                className="profile-input"
              />
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <label className="profile-label">State</label>
            <div className="profile-input-container">
              <Map />
              <input 
                type="text" 
                value={branchState}
                placeholder="State"
                onChange={(e) => setBranchState(e.target.value)}
                className="profile-input"
              />
            </div>
          </div>
        </div>

        <div className="responsive-flex-row">
          <div style={{ flex: 1 }}>
            <label className="profile-label">Pincode</label>
            <div className="profile-input-container">
              <MapPin />
              <input 
                type="text" 
                value={branchPincode}
                placeholder="781001"
                onChange={(e) => setBranchPincode(e.target.value)}
                className="profile-input"
              />
            </div>
          </div>
          
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#000', textAlign: 'left' }}>
               
              <span style={{ display: 'inline-flex', overflow: 'hidden', height: '18px', verticalAlign: 'bottom', marginLeft: '4px', position: 'relative', top: '2px' }}>
                <span style={{ animation: 'word-roll 16s infinite ease-in-out', display: 'flex', flexDirection: 'column' }}>
                  <span style={{ height: '18px', display: 'flex', alignItems: 'center' }}>Passbook</span>
                  <span style={{ height: '18px', display: 'flex', alignItems: 'center' }}>Cancel Cheque</span>
                  <span style={{ height: '18px', display: 'flex', alignItems: 'center' }}>Statement</span>
                  <span style={{ height: '18px', display: 'flex', alignItems: 'center' }}>Bank Receipt</span>
                  <span style={{ height: '18px', display: 'flex', alignItems: 'center' }}>Passbook</span>
                </span>
              </span>
            </label>
            <style>{`
              @keyframes word-roll {
                0%, 20% { transform: translateY(0); }
                25%, 45% { transform: translateY(-18px); }
                50%, 70% { transform: translateY(-36px); }
                75%, 95% { transform: translateY(-54px); }
                100% { transform: translateY(-72px); }
              }
            `}</style>
            <div style={{ position: 'relative' }}>
              <input 
                type="file" 
                id="passbook-upload"
                accept="image/*,.pdf"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setBankPassbookUrl(e.target.files[0].name); // For now, just set the filename
                  }
                }}
                style={{ display: 'none' }}
              />
              <label 
                htmlFor="passbook-upload"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', width: '100%', height: '50px', padding: '0 16px', borderRadius: '12px', border: '1px dashed #ccc', backgroundColor: '#fafafa', fontSize: '14px', color: '#333', cursor: 'pointer', boxSizing: 'border-box', transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = '#1C1C1C'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = '#ccc'}
              >
                <LinkIcon size={18} color="#888" />
                {bankPassbookUrl ? (bankPassbookUrl.length > 20 ? bankPassbookUrl.substring(0, 20) + '...' : bankPassbookUrl) : 'Upload'}
              </label>
            </div>
          </div>
        </div>

      </div>

      <div className="responsive-btn-group" style={{ marginBottom: '40px' }}>
        <button 
          onClick={() => goToStep('input_contact_details')}
          className="profile-btn-back"
        >
          Back
        </button>
        <button 
          onClick={handleUpdateBanking}
          disabled={isUpdating}
          className="profile-btn-next"
        >
          {isUpdating ? 'Updating...' : (
            originalProfile && 
            bankName === (originalProfile.bank_name || '') && 
            accountHolderName === (originalProfile.account_holder_name || '') && 
            accountNumber === (originalProfile.account_number || '') && 
            ifscCode === (originalProfile.ifsc_code || '') &&
            branchCity === (originalProfile.branch_city || '') &&
            branchState === (originalProfile.branch_state || '') &&
            branchPincode === (originalProfile.branch_pincode || '') &&
            bankPassbookUrl === (originalProfile.bank_passbook_url || '')
            ? 'Next' : 'Submit'
          )}
        </button>
      </div>
    </div>
  );
}
