'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Briefcase, 
  CheckCircle, 
  AlertTriangle, 
  ArrowLeft,
  IndianRupee,
  Building,
  ChevronUp,
  Loader2,
  Hash,
  UserCheck,
  Copy,
  ExternalLink,
  X,
  Lock,
  Eye,
  EyeOff,
  UploadCloud,
  FileText,
  Trash2
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NotificationToast from '@/components/NotificationToast';
import { createAuthUserAdmin, getNextEmployeeIdAction } from '@/app/actions/auth';
import { supabase } from '@/lib/supabase';
import styles from '../[id]/detail.module.css';

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
        <label style={{ fontSize: '14px', fontWeight: '500', color: 'rgba(255, 255, 255, 0.85)', marginBottom: '8px' }}>
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
              width: '100%',
              background: '#222222',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '14px',
              padding: '8px',
              zIndex: 10000,
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.8)',
              maxHeight: '220px',
              overflowY: 'auto'
            }}
          >
            {options.map(opt => (
              <div 
                key={opt.value}
                onClick={() => {
                  onChange(name, opt.value);
                  setIsOpen(false);
                }}
                style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  fontSize: '15px',
                  color: opt.value === value ? '#fff' : 'rgba(255, 255, 255, 0.75)',
                  background: opt.value === value ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  cursor: 'pointer',
                  fontWeight: opt.value === value ? 600 : 400,
                  transition: 'background 0.2s ease'
                }}
              >
                {opt.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function numberToWordsINR(numStr: string): string {
  if (!numStr) return '';
  const num = parseInt(numStr, 10);
  if (isNaN(num) || num <= 0) return '';

  const single = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertChunk(n: number): string {
    if (n < 20) return single[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + single[n % 10] : ' ');
    return single[Math.floor(n / 100)] + 'Hundred ' + (n % 100 !== 0 ? convertChunk(n % 100) : '');
  }

  function inIndianRupees(n: number): string {
    if (n === 0) return '';
    let res = '';
    
    // Crore (1,00,00,000)
    if (n >= 10000000) {
      const crore = Math.floor(n / 10000000);
      res += convertChunk(crore) + 'Crore ';
      n %= 10000000;
    }
    
    // Lakh (1,00,000)
    if (n >= 100000) {
      const lakh = Math.floor(n / 100000);
      res += convertChunk(lakh) + 'Lakh ';
      n %= 100000;
    }
    
    // Thousand (1,000)
    if (n >= 1000) {
      const thousand = Math.floor(n / 1000);
      res += convertChunk(thousand) + 'Thousand ';
      n %= 1000;
    }
    
    // Remaining (<1000)
    if (n > 0) {
      res += convertChunk(n);
    }
    
    return res;
  }

  const result = inIndianRupees(num).replace(/\s+/g, ' ').trim();
  return result ? result + ' Rupees Only' : '';
}

export default function AddNewUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [createdUserModal, setCreatedUserModal] = useState<{
    isOpen: boolean;
    name: string;
    email: string;
    link: string;
  }>({
    isOpen: false,
    name: '',
    email: '',
    link: ''
  });

  // CV / Resume Drag & Drop State
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const cvInputRef = useRef<HTMLInputElement>(null);

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

  // Form State
  const [formData, setFormData] = useState({
    // Basic Information
    first_name: '',
    last_name: '',
    father_name: '',
    phone: '',
    email: '',
    employee_id: '',
    
    // HR Permission & Work Details
    role: 'Employee',
    work_type: 'Full Time',
    department: 'Development',
    designation: 'Software Engineer',
    status: 'Active',
    in_hand_salary: '',

    // Password / Security
    password: '',
    confirm_password: ''
  });

  useEffect(() => {
    async function loadNextEmployeeId() {
      try {
        const res = await getNextEmployeeIdAction();
        if (res.success && res.nextEmployeeId) {
          setFormData(prev => ({ ...prev, employee_id: res.nextEmployeeId }));
        }
      } catch (err) {
        console.error('Error fetching next employee ID:', err);
      }
    }
    loadNextEmployeeId();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validatePassword = (pass: string) => {
    const hasMinLength = pass.length >= 6;
    const hasUpper = /[A-Z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass);

    return {
      isValid: hasMinLength && hasUpper && hasNumber && hasSpecial,
      hasMinLength,
      hasUpper,
      hasNumber,
      hasSpecial
    };
  };

  const getPasswordHint = (pass: string) => {
    if (!pass) return { hint: 'Add 1 Uppercase (A-Z)', done: false };
    
    const hasUpper = /[A-Z]/.test(pass);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const hasMinLength = pass.length >= 6;

    if (!hasUpper) return { hint: 'Add 1 Uppercase (A-Z)', done: false };
    if (!hasSpecial) return { hint: 'Add 1 Special Char (!@#$)', done: false };
    if (!hasNumber) return { hint: 'Add 1 Number (0-9)', done: false };
    if (!hasMinLength) return { hint: 'Min 6 Characters', done: false };

    return { hint: 'Strong Password ✓', done: true };
  };

  const isValidEmail = (emailStr: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    if (rawVal.length > 80) {
      setErrorMessage('Email address cannot exceed 80 characters!');
    }
    const val = rawVal.slice(0, 80);
    setFormData(prev => ({ ...prev, email: val }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const digitsOnly = rawVal.replace(/\D/g, '');

    if (digitsOnly.length > 10) {
      setErrorMessage('Contact number cannot exceed 10 digits!');
    }

    const val = digitsOnly.slice(0, 10);
    setFormData(prev => ({ ...prev, phone: val }));
  };

  const handleEmployeeIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!val.startsWith('TFC-')) {
      const rest = val.replace(/^TFC-?/i, '');
      val = `TFC-${rest}`;
    }
    setFormData(prev => ({ ...prev, employee_id: val }));
  };

  const handleCustomSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const fullName = `${formData.first_name} ${formData.last_name}`.trim();

      // Check individual mandatory fields with specific field error notifications
      if (!formData.first_name.trim()) throw new Error('Please enter First Name.');
      if (!formData.last_name.trim()) throw new Error('Please enter Last Name.');
      if (!formData.father_name.trim()) throw new Error("Please enter Father's Name.");
      if (!formData.phone.trim()) throw new Error('Please enter Contact Number.');
      if (!formData.email.trim()) throw new Error('Please enter Email Address.');
      if (!formData.employee_id.trim()) throw new Error('Please enter Employee ID.');
      if (!formData.role) throw new Error('Please select User Role.');
      if (!formData.work_type) throw new Error('Please select Work Type.');
      if (!formData.department) throw new Error('Please select Department.');
      if (!formData.designation.trim()) throw new Error('Please enter Designation.');
      if (!formData.status) throw new Error('Please select Account Status.');
      if (!formData.in_hand_salary.trim()) throw new Error('Please enter In-Hand Salary.');
      if (!formData.password) throw new Error('Please enter Account Password.');
      if (!formData.confirm_password) throw new Error('Please enter Confirm Password.');

      if (!isValidEmail(formData.email)) {
        throw new Error('Please enter a valid email address (e.g. employee@tfc.com).');
      }

      if (formData.phone.length !== 10) {
        throw new Error('Contact number must be exactly 10 digits.');
      }

      const passVal = validatePassword(formData.password);
      if (!passVal.isValid) {
        throw new Error('Password must be at least 6 characters long and contain at least 1 uppercase letter, 1 number, and 1 special character (e.g. Tfc@2026).');
      }

      if (formData.password !== formData.confirm_password) {
        throw new Error('Password and Confirm Password do not match.');
      }

      if (formData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long.');
      }

      // Create User via Supabase Admin Server Action (Creates Auth user with custom password without email OTP)
      const res = await createAuthUserAdmin({
        user_name: fullName,
        father_name: formData.father_name || undefined,
        email: formData.email,
        password: formData.password || undefined,
        phone: formData.phone || undefined,
        employee_id: formData.employee_id || undefined,
        role: formData.role,
        work_type: formData.work_type,
        department: formData.department,
        designation: formData.designation,
        status: formData.status,
        in_hand_salary: formData.in_hand_salary ? parseFloat(formData.in_hand_salary) : undefined,
      });

      if (!res.success) {
        throw new Error(res.error || 'Failed to create new employee profile.');
      }

      // Update extra profile fields like father_name in user_profiles
      if (res.data?.id && formData.father_name) {
        await supabase
          .from('user_profiles')
          .update({ father_name: formData.father_name })
          .eq('user_id', res.data.id);
      }

      const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
      const completeProfileUrl = `${origin}/complete-profile`;

      setSuccessMessage(`Employee "${fullName}" onboarded successfully!`);

      // Open Success Modal with complete-profile URL
      setCreatedUserModal({
        isOpen: true,
        name: fullName,
        email: formData.email,
        link: completeProfileUrl
      });

      // Re-fetch next Employee ID for next creation
      const nextIdRes = await getNextEmployeeIdAction();
      const nextId = nextIdRes.nextEmployeeId || 'TFC-001';

      // Reset form fields
      setFormData({
        first_name: '',
        last_name: '',
        father_name: '',
        phone: '',
        email: '',
        employee_id: nextId,
        role: 'Employee',
        work_type: 'Full Time',
        department: 'Development',
        designation: 'Software Engineer',
        status: 'Active',
        in_hand_salary: '',
        password: '',
        confirm_password: ''
      });

    } catch (err: any) {
      console.error('Error adding user:', err);
      setErrorMessage(err.message || 'An error occurred while creating employee.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (createdUserModal.link) {
      navigator.clipboard.writeText(createdUserModal.link);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage('');
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

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
      <style>{`
        @keyframes salaryMarquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .salary-marquee-scroll {
          display: inline-block;
          white-space: nowrap;
          animation: salaryMarquee 8s linear infinite;
          will-change: transform;
        }
        @keyframes passSlideUp {
          0% {
            transform: translateY(14px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .pass-hint-animate {
          display: inline-block;
          animation: passSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
      
      {/* REUSABLE FLOATING TOP ERROR NOTIFICATION TOAST */}
      <NotificationToast
        title="Onboarding Error"
        message={errorMessage}
        type="error"
        isOpen={!!errorMessage}
        onClose={() => setErrorMessage('')}
      />

      {/* REUSABLE FLOATING TOP SUCCESS NOTIFICATION TOAST */}
      <NotificationToast
        title="Employee Onboarded"
        message={successMessage}
        type="success"
        isOpen={!!successMessage}
        onClose={() => setSuccessMessage('')}
      />

      <Header
        category="Users & Onboarding"
        title="Add New Employee"
        description="Onboard a new employee or administrator into the organization."
        actionButton={
          <Link
            href="/hr/employees"
            className={`${styles.actionButton} ${styles.secondaryBtn}`}
            style={{ textDecoration: 'none', padding: '12px 20px', fontSize: '14px', borderRadius: '14px' }}
          >
            <ArrowLeft size={16} />
            <span>Back to Employees</span>
          </Link>
        }
      />

      <div style={{ padding: '0 24px', marginTop: '20px', width: '100%' }}>
        
        {/* SUCCESS ALERTS */}
        {successMessage && (
          <div style={{
            background: 'rgba(52, 187, 136, 0.15)',
            border: '1px solid rgba(52, 187, 136, 0.3)',
            color: '#34BB88',
            padding: '16px 24px',
            borderRadius: '16px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            fontSize: '15px',
            fontWeight: 600
          }}>
            <CheckCircle size={22} />
            <span>{successMessage}</span>
          </div>
        )}

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

              {/* Contact No. */}
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
                  onChange={handleEmailChange} 
                  required 
                  maxLength={80}
                  placeholder="employee@tfc.com"
                  style={inputFieldStyle}
                />
              </div>

              {/* Employee ID */}
              <div className={styles.formGroup}>
                <label style={labelStyle}>Employee ID <span style={{ color: '#EF4444' }}>*</span></label>
                <input 
                  type="text" 
                  name="employee_id" 
                  value={formData.employee_id} 
                  onChange={handleEmployeeIdChange} 
                  required 
                  placeholder="TFC-001"
                  style={inputFieldStyle}
                />
              </div>

              {/* Drag & Drop CV / Resume Upload */}
              <div className={styles.formGroup} style={{ gridColumn: '1 / -1', marginTop: '24px' }}>
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
                      padding: '48px 24px',
                      minHeight: '160px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '14px'
                    }}
                  >
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '14px',
                      background: isDragging ? 'rgba(52, 187, 136, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isDragging ? '#34BB88' : 'rgba(255, 255, 255, 0.6)'
                    }}>
                      <UploadCloud size={28} />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: '14px', color: '#FFFFFF', fontWeight: '500' }}>
                        Drag & drop CV/Resume here, or <span style={{ color: '#34BB88', fontWeight: '600', textDecoration: 'underline' }}>Browse File</span>
                      </p>
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'rgba(255, 255, 255, 0.4)' }}>
                        Supports PDF, DOC, DOCX (Max size: 10MB)
                      </p>
                    </div>
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
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '10px',
                        background: 'rgba(52, 187, 136, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#34BB88'
                      }}>
                        <FileText size={22} />
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>{cvFile.name}</span>
                          <span style={{ fontSize: '11px', background: 'rgba(52, 187, 136, 0.2)', color: '#34BB88', padding: '2px 8px', borderRadius: '10px', fontWeight: '600' }}>Uploaded ✓</span>
                        </div>
                        <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', marginTop: '2px' }}>
                          {(cvFile.size / (1024 * 1024)).toFixed(2)} MB
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCvFile(null)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        color: '#EF4444',
                        width: '34px',
                        height: '34px',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      title="Remove CV"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* SECTION 2: HR PERMISSION & WORK DETAILS */}
          <h3 className={styles.categoryHeader} style={{ marginBottom: '14px', cursor: 'default', padding: '16px 24px' }}>
            <div className={styles.categoryTitle} style={{ fontSize: '18px', fontWeight: '600', color: '#FFFFFF' }}>
              <Shield className={styles.categoryIcon} size={22} style={{ marginRight: '10px', color: '#34BB88' }} />
              HR Permission & Work Details
            </div>
          </h3>
          <div className={styles.contentCard} style={{ borderRadius: '20px', padding: '28px', marginBottom: '32px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', overflow: 'visible', background: 'rgba(255, 255, 255, 0.02)' }}>
            <div className={styles.formGrid} style={{ gap: '20px 28px' }}>

              {/* System Role */}
              <CustomSelect 
                label="Role"
                name="role"
                value={formData.role}
                options={[
                  { label: 'Employee', value: 'Employee' },
                  { label: 'Admin', value: 'Admin' },
                  { label: 'HR', value: 'HR' },
                  { label: 'Agent', value: 'Agent' }
                ]}
                onChange={handleCustomSelectChange}
                isRequired={true}
              />

              {/* Work Type */}
              <CustomSelect 
                label="Work Type"
                name="work_type"
                value={formData.work_type}
                options={[
                  { label: 'Full Time', value: 'Full Time' },
                  { label: 'Part Time', value: 'Part Time' },
                  { label: 'Contract', value: 'Contract' },
                  { label: 'Remote', value: 'Remote' },
                  { label: 'Internship', value: 'Internship' }
                ]}
                onChange={handleCustomSelectChange}
                isRequired={true}
              />

              {/* Department */}
              <CustomSelect 
                label="Department"
                name="department"
                value={formData.department}
                options={[
                  { label: 'Development', value: 'Development' },
                  { label: 'UI/UX Design', value: 'UI/UX Design' },
                  { label: 'Operations', value: 'Operations' },
                  { label: 'HR & Ops', value: 'HR & Ops' },
                  { label: 'Quality Assurance', value: 'Quality Assurance' },
                  { label: 'Sales', value: 'Sales' },
                  { label: 'Accounts & Finance', value: 'Accounts & Finance' },
                  { label: 'Marketing', value: 'Marketing' },
                  { label: 'Customer Support', value: 'Customer Support' }
                ]}
                onChange={handleCustomSelectChange}
                isRequired={true}
              />

              {/* Designation */}
              <div className={styles.formGroup}>
                <label style={labelStyle}>Designation <span style={{ color: '#EF4444' }}>*</span></label>
                <input 
                  type="text" 
                  name="designation" 
                  value={formData.designation} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="e.g. Senior Frontend Engineer"
                  style={inputFieldStyle}
                />
              </div>

              {/* Status */}
              <CustomSelect 
                label="Status"
                name="status"
                value={formData.status}
                options={[
                  { label: 'Active', value: 'Active' },
                  { label: 'Probation', value: 'Probation' },
                  { label: 'On Notice', value: 'On Notice' },
                  { label: 'On PIP', value: 'On PIP' },
                  { label: 'Hold', value: 'Hold' },
                  { label: 'Inactive', value: 'Inactive' }
                ]}
                onChange={handleCustomSelectChange}
                isRequired={true}
              />

              {/* In-Hand Salary */}
              <div className={styles.formGroup}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', overflow: 'hidden' }}>
                  <label style={{ ...labelStyle, marginBottom: 0, flexShrink: 0, marginRight: '10px' }}>
                    In-Hand Salary (INR) <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  {formData.in_hand_salary && numberToWordsINR(formData.in_hand_salary) && (
                    <div style={{
                      width: '240px',
                      minWidth: '240px',
                      maxWidth: '240px',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      boxSizing: 'border-box'
                    }}>
                      <div 
                        key={formData.in_hand_salary} 
                        className="salary-marquee-scroll" 
                        style={{
                          fontSize: '13px',
                          fontWeight: '600',
                          color: '#34BB88',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {numberToWordsINR(formData.in_hand_salary)}
                      </div>
                    </div>
                  )}
                </div>
                <input 
                  type="number" 
                  name="in_hand_salary" 
                  value={formData.in_hand_salary} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="e.g. 55000"
                  style={inputFieldStyle}
                />
              </div>

            </div>
          </div>

          {/* SECTION 3: ACCOUNT SECURITY (PASSWORD SETUP) */}
          <h3 className={styles.categoryHeader} style={{ marginBottom: '14px', cursor: 'default', padding: '16px 24px' }}>
            <div className={styles.categoryTitle} style={{ fontSize: '18px', fontWeight: '600', color: '#FFFFFF' }}>
              <Lock className={styles.categoryIcon} size={22} style={{ marginRight: '10px', color: '#F59E0B' }} />
              Account Password & Security
            </div>
          </h3>
          <div className={styles.contentCard} style={{ borderRadius: '20px', padding: '28px', marginBottom: '32px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', overflow: 'visible', background: 'rgba(255, 255, 255, 0.02)' }}>
            <div className={styles.formGrid} style={{ gap: '20px 28px' }}>

              {/* Password */}
              <div className={styles.formGroup}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', overflow: 'hidden' }}>
                  <label style={{ ...labelStyle, marginBottom: 0 }}>
                    Password <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  {formData.password && (
                    <div style={{ overflow: 'hidden', height: '20px', display: 'flex', alignItems: 'center' }}>
                      <span 
                        key={getPasswordHint(formData.password).hint} 
                        className="pass-hint-animate"
                        style={{
                          fontSize: '13px',
                          fontWeight: '600',
                          color: getPasswordHint(formData.password).done ? '#34BB88' : '#F59E0B',
                          transition: 'color 0.2s ease'
                        }}
                      >
                        {getPasswordHint(formData.password).hint}
                      </span>
                    </div>
                  )}
                </div>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password" 
                    value={formData.password} 
                    onChange={handleInputChange} 
                    required 
                    placeholder="e.g. Tfc@2026"
                    style={{ ...inputFieldStyle, paddingRight: '48px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'rgba(255, 255, 255, 0.4)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className={styles.formGroup}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', overflow: 'hidden' }}>
                  <label style={{ ...labelStyle, marginBottom: 0 }}>
                    Confirm Password <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  {formData.confirm_password && (
                    <div style={{ overflow: 'hidden', height: '20px', display: 'flex', alignItems: 'center' }}>
                      <span 
                        key={formData.confirm_password === formData.password ? 'matched' : 'not_matched'} 
                        className="pass-hint-animate"
                        style={{
                          fontSize: '13px',
                          fontWeight: '600',
                          color: formData.confirm_password === formData.password ? '#34BB88' : '#EF4444',
                          transition: 'color 0.2s ease'
                        }}
                      >
                        {formData.confirm_password === formData.password ? 'Password Matched ✓' : 'Password Not Matched'}
                      </span>
                    </div>
                  )}
                </div>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    name="confirm_password" 
                    value={formData.confirm_password} 
                    onChange={handleInputChange} 
                    required 
                    placeholder="Re-enter account password"
                    style={{ ...inputFieldStyle, paddingRight: '48px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'rgba(255, 255, 255, 0.4)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className={styles.formActions} style={{ marginTop: '16px', gap: '16px' }}>
            <button 
              type="button" 
              onClick={() => router.push('/hr/employees')}
              style={{
                padding: '14px 28px',
                borderRadius: '14px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#FFFFFF',
                fontSize: '15px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              style={{
                padding: '14px 36px',
                borderRadius: '14px',
                background: loading ? 'rgba(52, 187, 136, 0.5)' : '#34BB88',
                border: 'none',
                color: '#000000',
                fontSize: '15px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 8px 24px rgba(52, 187, 136, 0.35)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Saving Employee...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  <span>Save Employee</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>

      {/* SUCCESS PROFILE SETUP MODAL */}
      {createdUserModal.isOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent} style={{ maxWidth: '520px', padding: '32px', textAlign: 'center', background: '#1c1c1c', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
            
            {/* Top Close Icon */}
            <button 
              className={styles.closeButton} 
              onClick={() => setCreatedUserModal(prev => ({ ...prev, isOpen: false }))}
              style={{ position: 'absolute', top: '20px', right: '20px' }}
            >
              <X size={20} />
            </button>

            {/* Glowing Success Icon */}
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(52, 187, 136, 0.15)',
              border: '1px solid rgba(52, 187, 136, 0.3)',
              color: '#34BB88',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto',
              boxShadow: '0 8px 24px rgba(52, 187, 136, 0.25)'
            }}>
              <CheckCircle size={32} />
            </div>

            <h2 style={{ fontSize: '22px', fontWeight: '600', color: '#FFFFFF', margin: '0 0 8px 0' }}>
              Employee Onboarded!
            </h2>

            <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.65)', margin: '0 0 24px 0', lineHeight: '1.5' }}>
              Account for <strong style={{ color: '#FFFFFF' }}>{createdUserModal.name}</strong> created in Supabase Auth. Share the URL below with the employee to complete their profile setup:
            </p>

            {/* Complete Profile Link Box */}
            <div style={{ marginBottom: '28px', textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '8px' }}>
                Profile Completion Link (/complete-profile)
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '14px',
                padding: '6px 6px 6px 14px'
              }}>
                <input
                  type="text"
                  readOnly
                  value={createdUserModal.link}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    color: '#34BB88',
                    fontSize: '14px',
                    fontWeight: '500',
                    outline: 'none',
                    fontFamily: 'monospace',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 16px',
                    borderRadius: '10px',
                    background: isCopied ? '#34BB88' : 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    color: isCopied ? '#000000' : '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {isCopied ? <CheckCircle size={16} /> : <Copy size={16} />}
                  <span>{isCopied ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => router.push('/hr/employees')}
                style={{
                  flex: 1,
                  padding: '14px 20px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                View Employees
              </button>
              <Link
                href={createdUserModal.link}
                target="_blank"
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '14px 20px',
                  borderRadius: '14px',
                  background: '#34BB88',
                  border: 'none',
                  color: '#000000',
                  fontSize: '14px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 8px 24px rgba(52, 187, 136, 0.35)'
                }}
              >
                <ExternalLink size={16} />
                <span>Open Link</span>
              </Link>
            </div>

          </div>
        </div>
      )}

      <Footer />
      <div className="bottom-left-pattern" />
    </main>
  );
}
