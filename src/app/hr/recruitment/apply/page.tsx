'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import { 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  CheckCircle, 
  Loader2, 
  UploadCloud, 
  FileText, 
  Trash2,
  Sparkles,
  ChevronUp,
  ArrowRight,
  GraduationCap
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NotificationToast from '@/components/NotificationToast';
import styles from '@/app/users/[id]/detail.module.css';

interface CustomSelectProps {
  label?: string;
  name: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (name: string, value: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
  isRequired?: boolean;
}

function CustomSelect({ label, name, value, options, onChange, placeholder = 'Select...', style, isRequired = true }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={label ? styles.formGroup : undefined} style={{ position: 'relative', zIndex: isOpen ? 999 : 'auto', ...style }} ref={dropdownRef}>
      {label && (
        <label style={{ fontSize: '14px', fontWeight: '500', color: 'rgba(255, 255, 255, 0.85)', marginBottom: '8px', display: 'block' }}>
          {label} {isRequired && <span style={{ color: '#EF4444' }}>*</span>}
        </label>
      )}
      <div className={styles.customSelectWrapper} style={{ position: 'relative', zIndex: isOpen ? 999 : 'auto' }}>
        <div 
          onClick={() => setIsOpen(!isOpen)}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '50px',
            padding: '0 18px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            color: '#fff',
            fontSize: '15px',
            fontWeight: '500',
            cursor: 'pointer',
            userSelect: 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <span>{selectedOption ? selectedOption.label : placeholder}</span>
          <ChevronUp size={18} style={{ transition: 'transform 0.2s', transform: isOpen ? 'rotate(0deg)' : 'rotate(180deg)', opacity: 0.7 }} />
        </div>
        {isOpen && (
          <div 
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              right: 0,
              background: '#262626',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '12px',
              padding: '6px',
              maxHeight: '220px',
              overflowY: 'auto',
              boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
              zIndex: 1000
            }}
          >
            {options.map((option) => (
              <div
                key={option.value}
                onClick={() => {
                  onChange(name, option.value);
                  setIsOpen(false);
                }}
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  color: option.value === value ? '#34BB88' : '#ffffff',
                  backgroundColor: option.value === value ? 'rgba(52, 187, 136, 0.15)' : 'transparent',
                  fontSize: '14px',
                  fontWeight: option.value === value ? '600' : '400',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CandidatePublicApplyPageContent() {
  const searchParams = useSearchParams();
  const refQuery = searchParams.get('ref') || 'CND-PUBLIC';

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [appId, setAppId] = useState('');

  // CV / Resume Drag & Drop State
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const cvInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    father_name: '',
    phone: '',
    email: '',
    role: 'Telesales Executive',
    experience: 'Fresher'
  });

  // Pre-fill form data if assigned candidate record exists in Supabase
  useEffect(() => {
    const fetchExistingCandidate = async () => {
      if (!refQuery) return;

      try {
        const { data, error } = await supabase
          .from('recruitment')
          .select('*')
          .or(`candidate_id.eq.${refQuery},ref_id.eq.${refQuery}`)
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          setFormData(prev => ({
            ...prev,
            first_name: data.first_name || (data.name ? data.name.split(' ')[0] : ''),
            last_name: data.last_name || (data.name ? data.name.split(' ').slice(1).join(' ') : ''),
            father_name: data.father_name || '',
            phone: data.phone || '',
            email: data.email || '',
            role: data.role || 'Telesales Executive',
            experience: data.experience || 'Fresher'
          }));
        }
      } catch (err) {
        console.error('Error fetching pre-filled candidate data:', err);
      }
    };

    fetchExistingCandidate();
  }, [refQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const isValidEmail = (emailStr: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFormData(prev => ({ ...prev, phone: digitsOnly }));
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage('File size exceeds 10MB limit!');
        return;
      }
      setCvFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage('File size exceeds 10MB limit!');
        return;
      }
      setCvFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.first_name.trim()) {
      setErrorMessage('First Name is required!');
      return;
    }
    if (!formData.last_name.trim()) {
      setErrorMessage('Last Name is required!');
      return;
    }
    if (!formData.father_name.trim()) {
      setErrorMessage('Father\'s Name is required!');
      return;
    }
    if (!formData.phone.trim() || formData.phone.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit phone number!');
      return;
    }
    if (!formData.email.trim() || !isValidEmail(formData.email)) {
      setErrorMessage('Please enter a valid email address!');
      return;
    }

    setLoading(true);

    try {
      const candidateCode = (refQuery && refQuery.startsWith('CND-'))
        ? refQuery
        : `CND-${Math.floor(100000 + Math.random() * 900000)}`;
      const generatedAppId = candidateCode;
      const fullName = `${formData.first_name.trim()} ${formData.last_name.trim()}`;
      
      const newCandidate = {
        id: candidateCode,
        candidate_id: candidateCode,
        name: fullName,
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        role: formData.role,
        stage: 'Lead',
        refId: refQuery || candidateCode,
        dateAdded: new Date().toISOString().split('T')[0],
        cvFileName: cvFile ? cvFile.name : undefined
      };

      // Save into Supabase recruitment table
      const currentUrl = typeof window !== 'undefined' ? window.location.href : null;
      const { error: dbError } = await supabase.from('recruitment').insert([{
        candidate_id: candidateCode,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        name: fullName,
        father_name: formData.father_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        role: formData.role,
        experience: formData.experience,
        stage: 'Lead',
        ref_id: refQuery,
        cv_file_name: cvFile ? cvFile.name : null,
        shareable_link: currentUrl
      }]);

      if (dbError) {
        console.error('Supabase recruitment table error:', dbError);
      }

      if (typeof window !== 'undefined') {
        const existing = localStorage.getItem('tfc_candidates');
        const list = existing ? JSON.parse(existing) : [];
        list.unshift(newCandidate);
        localStorage.setItem('tfc_candidates', JSON.stringify(list));
      }

      setAppId(generatedAppId);
      setLoading(false);
      setSubmitted(true);
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Submission failed. Please try again.');
      setLoading(false);
    }
  };

  const inputFieldStyle: React.CSSProperties = {
    height: '50px',
    padding: '0 18px',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    color: '#FFFFFF',
    fontSize: '15px',
    fontWeight: '500',
    outline: 'none',
    width: '100%',
    transition: 'all 0.2s ease',
    fontFamily: 'var(--font-lufga), sans-serif'
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: '8px',
    fontFamily: 'var(--font-lufga), sans-serif'
  };

  return (
    <main className="page-fade-in" style={{ position: 'relative', width: '100%', paddingBottom: '100px' }}>
      <NotificationToast
        title="Form Error"
        message={errorMessage}
        type="error"
        isOpen={!!errorMessage}
        onClose={() => setErrorMessage('')}
      />

      {/* CENTER ALIGNED CANDIDATE APPLICATION PORTAL HEADER */}
      <div style={{ 
        padding: '80px 24px 32px 24px', 
        width: '100%', 
        maxWidth: '1100px',
        margin: '0 auto',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <p style={{
          fontSize: '18px',
          fontWeight: '500',
          margin: '0 0 8px 0',
          color: '#34BB88',
          fontFamily: 'var(--font-lufga), sans-serif',
          letterSpacing: '0.5px'
        }}>
          TFC Axom Careers
        </p>
        <h1 style={{
          fontSize: '36px',
          fontWeight: '700',
          margin: '0 0 10px 0',
          background: 'linear-gradient(to right, #ffffff, rgba(255, 255, 255, 0.75))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.5px',
          lineHeight: '1.2',
          fontFamily: 'var(--font-lufga), sans-serif'
        }}>
          Candidate Application Form
        </h1>
        <p style={{
          fontSize: '15px',
          fontWeight: '400',
          margin: 0,
          color: 'rgba(255, 255, 255, 0.6)',
          fontFamily: 'var(--font-lufga), sans-serif',
          maxWidth: '600px'
        }}>
          Submit basic information to apply under reference ID: <strong style={{ color: '#34BB88' }}>{refQuery}</strong>
        </p>
      </div>

      <div style={{ padding: '0 24px', marginTop: '20px', width: '100%', maxWidth: '1100px', margin: '20px auto 0 auto' }}>
        {submitted ? (
          <div className={styles.contentCard} style={{
            borderRadius: '24px',
            padding: '48px 32px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
            background: 'rgba(255, 255, 255, 0.02)',
            borderTop: '1px solid rgba(52, 187, 136, 0.4)'
          }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: 'rgba(52, 187, 136, 0.15)',
              color: '#34BB88',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckCircle size={40} />
            </div>

            <h2 style={{ fontSize: '26px', fontWeight: '700', color: '#ffffff', margin: 0 }}>
              Application Submitted Successfully!
            </h2>

            <p style={{ fontSize: '15px', color: 'rgba(255, 255, 255, 0.75)', maxWidth: '500px', lineHeight: '1.6', margin: 0 }}>
              Thank you, <strong>{formData.first_name} {formData.last_name}</strong>. Your candidate application has been registered in our recruitment pipeline under reference <strong>{refQuery}</strong>.
            </p>

            <div style={{
              padding: '14px 24px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.6)'
            }}>
              <div>Application Registration ID: <strong style={{ color: '#34BB88' }}>{appId}</strong></div>
              <div>Position Applied: <strong style={{ color: '#ffffff' }}>{formData.role}</strong></div>
            </div>

            <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)', margin: '8px 0 0 0' }}>
              Our recruitment team will review your application and contact you shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* SECTION 1: BASIC INFORMATION */}
            <h3 className={styles.categoryHeader} style={{ marginBottom: '14px', cursor: 'default', padding: '16px 24px' }}>
              <div className={styles.categoryTitle} style={{ fontSize: '18px', fontWeight: '600', color: '#FFFFFF' }}>
                <User className={styles.categoryIcon} size={22} style={{ marginRight: '10px', color: '#3B82F6' }} />
                Basic Information
              </div>
            </h3>

            <div className={styles.contentCard} style={{ borderRadius: '20px', padding: '28px', marginBottom: '32px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', overflow: 'visible', background: 'rgba(255, 255, 255, 0.02)' }}>
              <div className={styles.formGrid} style={{ gap: '20px 28px' }}>
                
                {/* First Name */}
                <div className={styles.formGroup}>
                  <label style={labelStyle}>First Name <span style={{ color: '#EF4444' }}>*</span></label>
                  <input 
                    type="text" 
                    name="first_name" 
                    value={formData.first_name} 
                    onChange={handleInputChange} 
                    required 
                    placeholder="Enter first name"
                    style={inputFieldStyle}
                  />
                </div>

                {/* Last Name */}
                <div className={styles.formGroup}>
                  <label style={labelStyle}>Last Name <span style={{ color: '#EF4444' }}>*</span></label>
                  <input 
                    type="text" 
                    name="last_name" 
                    value={formData.last_name} 
                    onChange={handleInputChange} 
                    required 
                    placeholder="Enter last name"
                    style={inputFieldStyle}
                  />
                </div>

                {/* Father Name */}
                <div className={styles.formGroup}>
                  <label style={labelStyle}>Father's Name <span style={{ color: '#EF4444' }}>*</span></label>
                  <input 
                    type="text" 
                    name="father_name" 
                    value={formData.father_name} 
                    onChange={handleInputChange} 
                    required
                    placeholder="Enter father's name"
                    style={inputFieldStyle}
                  />
                </div>

                {/* Phone */}
                <div className={styles.formGroup}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ ...labelStyle, marginBottom: 0 }}>
                      Contact No. <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <span style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      color: formData.phone.length === 10 ? '#34BB88' : 'rgba(255, 255, 255, 0.5)',
                      transition: 'all 0.2s ease'
                    }}>
                      {formData.phone.length}/10 Digits
                    </span>
                  </div>
                  <input 
                    type="tel" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handlePhoneChange} 
                    required 
                    maxLength={10}
                    placeholder="Enter 10-digit phone number"
                    style={inputFieldStyle}
                  />
                </div>

                {/* Email */}
                <div className={styles.formGroup}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ ...labelStyle, marginBottom: 0 }}>
                      Email <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    {formData.email && (
                      <span style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        color: isValidEmail(formData.email) ? '#34BB88' : '#EF4444',
                        transition: 'all 0.2s ease'
                      }}>
                        {isValidEmail(formData.email) ? 'Valid Email' : 'Invalid Format'}
                      </span>
                    )}
                  </div>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleInputChange} 
                    required 
                    placeholder="candidate@example.com"
                    style={inputFieldStyle}
                  />
                </div>

                {/* Applied Role Select */}
                <CustomSelect
                  label="Position Applied For"
                  name="role"
                  value={formData.role}
                  onChange={handleSelectChange}
                  options={[
                    { label: 'Telesales Executive', value: 'Telesales Executive' },
                    { label: 'Sales Manager', value: 'Sales Manager' },
                    { label: 'HR Recruiter', value: 'HR Recruiter' },
                    { label: 'Quality Analyst', value: 'Quality Analyst' },
                    { label: 'Team Lead', value: 'Team Lead' }
                  ]}
                />

                {/* Experience Level Select */}
                <CustomSelect
                  label="Experience Level"
                  name="experience"
                  value={formData.experience}
                  onChange={handleSelectChange}
                  options={[
                    { label: 'Fresher (0 Years)', value: 'Fresher' },
                    { label: '1 - 2 Years Experience', value: '1-2 Years' },
                    { label: '3 - 5 Years Experience', value: '3-5 Years' },
                    { label: '5+ Years Senior', value: '5+ Years' }
                  ]}
                />

                {/* Drag & Drop CV Upload */}
                <div className={styles.formGroup} style={{ gridColumn: '1 / -1', marginTop: '16px' }}>
                  <label style={{ ...labelStyle, marginBottom: '12px' }}>
                    Upload CV / Resume <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '13px', fontWeight: 400 }}>(Optional - PDF, DOC, DOCX)</span>
                  </label>
                  <input 
                    type="file" 
                    ref={cvInputRef} 
                    onChange={handleFileChange} 
                    accept=".pdf,.doc,.docx" 
                    style={{ display: 'none' }} 
                  />
                  
                  {!cvFile ? (
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                      onDrop={handleFileDrop}
                      onClick={() => cvInputRef.current?.click()}
                      style={{
                        border: isDragging ? '2px dashed #34BB88' : '2px dashed rgba(255, 255, 255, 0.15)',
                        background: isDragging ? 'rgba(52, 187, 136, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                        borderRadius: '18px',
                        padding: '40px 24px',
                        minHeight: '150px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px'
                      }}
                    >
                      <UploadCloud size={38} style={{ color: isDragging ? '#34BB88' : 'rgba(255, 255, 255, 0.4)' }} />
                      <div style={{ fontSize: '15px', color: 'rgba(255, 255, 255, 0.8)', fontWeight: 500 }}>
                        <span style={{ color: '#34BB88', fontWeight: 600 }}>Click to browse</span> or drag and drop your resume
                      </div>
                      <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.4)' }}>PDF, DOC, DOCX up to 10MB</span>
                    </div>
                  ) : (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px 20px',
                      background: 'rgba(52, 187, 136, 0.08)',
                      border: '1px solid rgba(52, 187, 136, 0.3)',
                      borderRadius: '16px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <FileText size={24} style={{ color: '#34BB88' }} />
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>{cvFile.name}</div>
                          <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>{(cvFile.size / 1024).toFixed(1)} KB</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCvFile(null)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.15)',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#EF4444',
                          padding: '8px',
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  height: '52px',
                  padding: '0 36px',
                  backgroundColor: '#34BB88',
                  border: 'none',
                  borderRadius: '14px',
                  color: '#000000',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 8px 24px rgba(52, 187, 136, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    <span>Submit Application</span>
                  </>
                )}
              </button>
            </div>

          </form>
        )}
      </div>

      <Footer />
    </main>
  );
}

export default function CandidatePublicApplyPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', backgroundColor: '#0e0e0e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: '#34BB88' }} />
      </div>
    }>
      <CandidatePublicApplyPageContent />
    </Suspense>
  );
}
