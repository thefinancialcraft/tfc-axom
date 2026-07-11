import React, { useEffect } from 'react';
import { MapPin, Navigation, Hash, Image as ImageIcon, FileText } from 'lucide-react';

interface IdentityDocsFormProps {
  primaryAddress: string; setPrimaryAddress: (v: string) => void;
  areaPincode: string; setAreaPincode: (v: string) => void;
  aadharCardNo: string; setAadharCardNo: (v: string) => void;
  aadharFrontUrl: string; setAadharFrontUrl: (v: string) => void;
  aadharBackUrl: string; setAadharBackUrl: (v: string) => void;
  qualificationMarksheetUrl: string; setQualificationMarksheetUrl: (v: string) => void;
  isUpdating: boolean;
  goToStep: (step: any) => void;
  handleUpdateIdentity: () => void;
  originalProfile?: any;
}

export default function IdentityDocsForm({
  primaryAddress, setPrimaryAddress,
  areaPincode, setAreaPincode,
  aadharCardNo, setAadharCardNo,
  aadharFrontUrl, setAadharFrontUrl,
  aadharBackUrl, setAadharBackUrl,
  qualificationMarksheetUrl, setQualificationMarksheetUrl,
  isUpdating, goToStep, handleUpdateIdentity, originalProfile
}: IdentityDocsFormProps) {

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const topElement = document.getElementById('top-of-page');
      if (topElement) {
        topElement.scrollIntoView({ behavior: 'instant', block: 'start' });
      }
    }
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', padding: '0 0 40px 0', boxSizing: 'border-box', alignItems: 'stretch' }}>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: '40px' }}>
        <img src="/logo.png" alt="TFC Axom Logo" style={{ width: '40px', height: 'auto', marginBottom: '8px', filter: 'brightness(0)' }} />
        <span style={{ fontSize: '16px', fontWeight: '700', color: '#000' }}>TFC Axom</span>
      </div>

      <h1 style={{ fontSize: '32px', fontWeight: '700', margin: '0 0 32px 0', color: '#000', textAlign: 'left' }}>
        Identity & Documents
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px', textAlign: 'left' }}>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#000', textAlign: 'left' }}>Primary Address</label>
          <div style={{ position: 'relative' }}>
            <MapPin size={18} color="#888" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={primaryAddress}
              placeholder="e.g. 123 Main Street, Appt 4B"
              onChange={(e) => setPrimaryAddress(e.target.value)}
              style={{
                width: '100%', padding: '16px 16px 16px 44px', borderRadius: '12px', border: 'none', backgroundColor: '#ffffff', fontSize: '14px', color: '#333', outline: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', transition: 'box-shadow 0.2s', textAlign: 'left', boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.boxShadow = '0 2px 12px rgba(52, 187, 136, 0.2)'}
              onBlur={(e) => e.target.style.boxShadow = '0 2px 10px rgba(0,0,0,0.02)'}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#000', textAlign: 'left' }}>Area Pincode</label>
            <div style={{ position: 'relative' }}>
              <Navigation size={18} color="#888" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={areaPincode}
                placeholder="781001"
                onChange={(e) => setAreaPincode(e.target.value)}
                style={{
                  width: '100%', padding: '16px 16px 16px 44px', borderRadius: '12px', border: 'none', backgroundColor: '#ffffff', fontSize: '14px', color: '#333', outline: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', transition: 'box-shadow 0.2s', textAlign: 'left', boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.boxShadow = '0 2px 12px rgba(52, 187, 136, 0.2)'}
                onBlur={(e) => e.target.style.boxShadow = '0 2px 10px rgba(0,0,0,0.02)'}
              />
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#000', textAlign: 'left' }}>Aadhar Card No</label>
            <div style={{ position: 'relative' }}>
              <Hash size={18} color="#888" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={aadharCardNo}
                placeholder="1234 5678 9012"
                onChange={(e) => setAadharCardNo(e.target.value)}
                style={{
                  width: '100%', padding: '16px 16px 16px 44px', borderRadius: '12px', border: 'none', backgroundColor: '#ffffff', fontSize: '14px', color: '#333', outline: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', transition: 'box-shadow 0.2s', textAlign: 'left', boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.boxShadow = '0 2px 12px rgba(52, 187, 136, 0.2)'}
                onBlur={(e) => e.target.style.boxShadow = '0 2px 10px rgba(0,0,0,0.02)'}
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#000', textAlign: 'left' }}>Aadhar Front Image</label>
            <div style={{ position: 'relative' }}>
              <input
                type="file"
                id="aadhar-front-upload"
                accept="image/*,.pdf"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setAadharFrontUrl(e.target.files[0].name);
                  }
                }}
                style={{ display: 'none' }}
              />
              <label
                htmlFor="aadhar-front-upload"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', width: '100%', height: '50px', padding: '0 16px', borderRadius: '12px', border: '1px dashed #ccc', backgroundColor: '#fafafa', fontSize: '14px', color: '#333', cursor: 'pointer', boxSizing: 'border-box', transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = '#1C1C1C'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = '#ccc'}
              >
                <ImageIcon size={18} color="#888" />
                {aadharFrontUrl ? (aadharFrontUrl.length > 20 ? aadharFrontUrl.substring(0, 20) + '...' : aadharFrontUrl) : 'Upload'}
              </label>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#000', textAlign: 'left' }}>Aadhar Back Image</label>
            <div style={{ position: 'relative' }}>
              <input
                type="file"
                id="aadhar-back-upload"
                accept="image/*,.pdf"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setAadharBackUrl(e.target.files[0].name);
                  }
                }}
                style={{ display: 'none' }}
              />
              <label
                htmlFor="aadhar-back-upload"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', width: '100%', height: '50px', padding: '0 16px', borderRadius: '12px', border: '1px dashed #ccc', backgroundColor: '#fafafa', fontSize: '14px', color: '#333', cursor: 'pointer', boxSizing: 'border-box', transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = '#1C1C1C'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = '#ccc'}
              >
                <ImageIcon size={18} color="#888" />
                {aadharBackUrl ? (aadharBackUrl.length > 20 ? aadharBackUrl.substring(0, 20) + '...' : aadharBackUrl) : 'Upload'}
              </label>
            </div>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#000', textAlign: 'left' }}>Qualification Marksheet</label>
          <div style={{ position: 'relative' }}>
            <input
              type="file"
              id="marksheet-upload"
              accept="image/*,.pdf"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setQualificationMarksheetUrl(e.target.files[0].name);
                }
              }}
              style={{ display: 'none' }}
            />
            <label
              htmlFor="marksheet-upload"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', width: '100%', height: '50px', padding: '0 16px', borderRadius: '12px', border: '1px dashed #ccc', backgroundColor: '#fafafa', fontSize: '14px', color: '#333', cursor: 'pointer', boxSizing: 'border-box', transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = '#1C1C1C'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = '#ccc'}
            >
              <FileText size={18} color="#888" />
              {qualificationMarksheetUrl ? (qualificationMarksheetUrl.length > 20 ? qualificationMarksheetUrl.substring(0, 20) + '...' : qualificationMarksheetUrl) : 'Upload'}
            </label>
          </div>
        </div>

      </div>

      <div style={{ display: 'flex', gap: '12px', flexDirection: 'row', marginBottom: '40px' }}>
        <button
          onClick={() => goToStep('input_banking_info')}
          style={{
            flex: 1, padding: '16px', backgroundColor: 'transparent', color: '#666', border: '1px solid #E5E7EB', borderRadius: '12px', fontSize: '15px', fontWeight: '600', cursor: 'pointer'
          }}
        >
          Back
        </button>
        <button
          onClick={handleUpdateIdentity}
          disabled={isUpdating}
          style={{
            flex: 1, padding: '16px', backgroundColor: '#1C1C1C', color: '#fff', borderRadius: '12px', border: 'none', fontSize: '15px', fontWeight: '600', cursor: !isUpdating ? 'pointer' : 'not-allowed', opacity: !isUpdating ? 1 : 0.7
          }}
        >
          {isUpdating ? 'Updating...' : (
            originalProfile &&
              primaryAddress === (originalProfile.primary_address || '') &&
              areaPincode === (originalProfile.area_pincode || '') &&
              aadharCardNo === (originalProfile.aadhar_card_no || '') &&
              aadharFrontUrl === (originalProfile.aadhar_front_url || '') &&
              aadharBackUrl === (originalProfile.aadhar_back_url || '') &&
              qualificationMarksheetUrl === (originalProfile.qualification_marksheet_url || '')
              ? 'Finish' : 'Submit'
          )}
        </button>
      </div>
    </div>
  );
}
