'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User, 
  CheckCircle, 
  ArrowLeft,
  Loader2,
  UploadCloud,
  FileText,
  Trash2,
  Share2,
  Copy,
  Check,
  ExternalLink,
  ChevronUp,
  Zap,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  GraduationCap,
  X
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
  required?: boolean;
}

function CustomSelect({ label, name, value, options, onChange, required = false }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredValue, setHoveredValue] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value) || options[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {label && (
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '500',
          color: 'rgba(255, 255, 255, 0.85)',
          marginBottom: '8px',
          fontFamily: 'var(--font-lufga), sans-serif'
        }}>
          {label} {required && <span style={{ color: '#EF4444' }}>*</span>}
        </label>
      )}
      <div ref={dropdownRef} style={{ position: 'relative', width: '100%', zIndex: isOpen ? 1000 : 1 }}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            height: '50px',
            padding: '0 18px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: isOpen ? '1px solid #34BB88' : '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            color: '#FFFFFF',
            fontSize: '15px',
            fontWeight: '500',
            outline: 'none',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontFamily: 'var(--font-lufga), sans-serif'
          }}
        >
          <span>{selectedOption?.label || value}</span>
          <ChevronUp 
            size={18} 
            style={{ 
              transform: isOpen ? 'rotate(0deg)' : 'rotate(180deg)', 
              transition: 'transform 0.2s ease',
              color: 'rgba(255, 255, 255, 0.6)'
            }} 
          />
        </button>

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
            {options.map((option) => {
              const isSelected = value === option.value;
              const isHovered = hoveredValue === option.value;
              return (
                <div
                  key={option.value}
                  onMouseEnter={() => setHoveredValue(option.value)}
                  onMouseLeave={() => setHoveredValue(null)}
                  onClick={() => {
                    onChange(name, option.value);
                    setIsOpen(false);
                    setHoveredValue(null);
                  }}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    color: isSelected ? '#34BB88' : isHovered ? '#FFFFFF' : 'rgba(255, 255, 255, 0.85)',
                    backgroundColor: isSelected 
                      ? 'rgba(52, 187, 136, 0.2)' 
                      : isHovered 
                        ? 'rgba(255, 255, 255, 0.12)' 
                        : 'transparent',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: isSelected ? '600' : '500',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {option.label}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

interface CustomDatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (formattedDateTime: string) => void;
}

function CustomDatePickerModal({ isOpen, onClose, onSelect }: CustomDatePickerModalProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate());
  const [selectedTime, setSelectedTime] = useState<string>('11:00 AM');

  if (!isOpen) return null;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const timeSlots = [
    '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'
  ];

  const handleConfirm = () => {
    const formattedDay = String(selectedDay).padStart(2, '0');
    const formattedMonth = String(month + 1).padStart(2, '0');
    const formatted = `${year}-${formattedMonth}-${formattedDay} at ${selectedTime}`;
    onSelect(formatted);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999999,
      padding: '8px'
    }}>
      <div style={{
        backgroundColor: '#1C1C1E',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '16px',
        padding: '12px 16px',
        maxWidth: '320px',
        width: '100%',
        boxShadow: '0 16px 48px rgba(0,0,0,0.8)',
        color: '#FFFFFF',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '26px', height: '26px', borderRadius: '6px',
              backgroundColor: 'rgba(52, 187, 136, 0.15)', color: '#34BB88',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Calendar size={14} />
            </div>
            <div>
              <h3 style={{ fontSize: '13.5px', fontWeight: '700', margin: 0, color: '#FFFFFF' }}>Select Date & Time</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', padding: '2px' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Month Navigation */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '8px',
          padding: '5px 10px',
          marginBottom: '8px'
        }}>
          <button
            type="button"
            onClick={handlePrevMonth}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              borderRadius: '5px',
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              padding: 0
            }}
          >
            <ChevronLeft size={14} />
          </button>
          
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#FFFFFF', letterSpacing: '0.3px', textAlign: 'center' }}>
            {monthNames[month]} {year}
          </span>

          <button
            type="button"
            onClick={handleNextMonth}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              borderRadius: '5px',
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              padding: 0
            }}
          >
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Days of Week Header */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', textAlign: 'center', marginBottom: '3px' }}>
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
            <span key={d} style={{ fontSize: '10px', fontWeight: '600', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
              {d}
            </span>
          ))}
        </div>

        {/* Days Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px', marginBottom: '8px' }}>
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const isSelected = selectedDay === dayNum;
            return (
              <button
                key={dayNum}
                type="button"
                onClick={() => setSelectedDay(dayNum)}
                style={{
                  height: '24px',
                  borderRadius: '5px',
                  border: 'none',
                  backgroundColor: isSelected ? '#34BB88' : 'rgba(255,255,255,0.03)',
                  color: isSelected ? '#000000' : '#FFFFFF',
                  fontWeight: isSelected ? '700' : '500',
                  fontSize: '11px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {dayNum}
              </button>
            );
          })}
        </div>

        {/* Time Slot Picker */}
        <div style={{ marginBottom: '10px' }}>
          <label style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>
            Time Slot
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
            {timeSlots.map(slot => {
              const isTimeSelected = selectedTime === slot;
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedTime(slot)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '5px',
                    border: isTimeSelected ? '1px solid #34BB88' : '1px solid rgba(255,255,255,0.1)',
                    backgroundColor: isTimeSelected ? 'rgba(52, 187, 136, 0.2)' : 'rgba(255,255,255,0.03)',
                    color: isTimeSelected ? '#34BB88' : 'rgba(255,255,255,0.8)',
                    fontSize: '11px',
                    fontWeight: isTimeSelected ? '700' : '500',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {slot}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              height: '34px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.1)',
              backgroundColor: 'rgba(255,255,255,0.05)',
              color: '#FFFFFF',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            style={{
              flex: 1.4,
              height: '34px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#34BB88',
              color: '#000000',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            Confirm Date
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AddCandidatePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchNextCandidateId = async () => {
      try {
        const { data, error } = await supabase
          .from('recruitment')
          .select('candidate_id');
        
        let maxNum = 0;
        if (data && data.length > 0) {
          data.forEach(item => {
            if (item.candidate_id) {
              const match = item.candidate_id.match(/\d+/);
              if (match) {
                const num = parseInt(match[0], 10);
                if (num > maxNum) maxNum = num;
              }
            }
          });
        }
        
        const nextNum = maxNum + 1;
        const formattedId = `CND-${String(nextNum).padStart(3, '0')}`;
        setFormData(prev => ({ ...prev, candidate_id: formattedId }));
      } catch (err) {
        console.error('Error fetching candidate max ID:', err);
      }
    };
    fetchNextCandidateId();
  }, []);

  // Shareable Link Modal State
  const [generatedLink, setGeneratedLink] = useState('');
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGeneratePublicLink = async () => {
    try {
      // 1. Fetch current max candidate ID from Supabase for accurate sequential next ID
      const { data: existingData } = await supabase
        .from('recruitment')
        .select('candidate_id');
      
      let maxNum = 0;
      if (existingData && existingData.length > 0) {
        existingData.forEach(item => {
          if (item.candidate_id) {
            const match = item.candidate_id.match(/\d+/);
            if (match) {
              const num = parseInt(match[0], 10);
              if (num > maxNum) maxNum = num;
            }
          }
        });
      }
      
      const nextNum = maxNum + 1;
      const candidateRef = `CND-${String(nextNum).padStart(3, '0')}`;
      
      // Update form state with new ID
      setFormData(prev => ({ ...prev, candidate_id: candidateRef }));

      // 2. Generate 14-character alphanumeric code (uuid)
      const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
      let alphaNumeric14 = '';
      for (let i = 0; i < 14; i++) {
        alphaNumeric14 += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      const shareableObject = {
        uuid: alphaNumeric14,
        ref_id: candidateRef
      };

      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
      const link = `${baseUrl}/${alphaNumeric14}/apply?ref=${candidateRef}`;

      // 3. Insert blank lead record into Supabase with ONLY candidate ID and credentials
      const { error: dbErr } = await supabase.from('recruitment').insert([{
        candidate_id: candidateRef,
        ref_id: candidateRef,
        shareable_link: JSON.stringify(shareableObject),
        stage: 'Lead',
        details_submitted: false
      }]);

      if (dbErr) {
        console.error('Error inserting blank lead record in Supabase:', dbErr);
      }

      setGeneratedLink(link);
      setShowLinkModal(true);
      setCopied(false);
    } catch (err) {
      console.error('Error in handleGeneratePublicLink:', err);
    }
  };

  const handleCopyLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

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

  // Pure Candidate Basic Information State
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    father_name: '',
    phone: '',
    email: '',
    role: 'Telesales Executive',
    experience: 'Fresher',
    last_in_hand_salary: '',
    candidate_id: 'CND-001',
    qualification: 'Graduation',
    qualification_other: '',
    institution_name: '',
    source: 'Apna Job',
    employee_ref_id: '',
    source_other: '',
    interview_availability: 'Immediate (Tomorrow at 11:00 AM)',
    interview_custom_time: ''
  });

  // Immediate Interview Availability Sub-states
  const [immediateDay, setImmediateDay] = useState('Tomorrow');
  const [immediateSlot, setImmediateSlot] = useState('11:00 AM');

  // Helper to check if a time slot is already past today
  const isSlotPastToday = (slotStr: string) => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();

    let slotHour = 11;
    if (slotStr.includes('11')) slotHour = 11;
    else if (slotStr.includes('12')) slotHour = 12;
    else if (slotStr.includes('01') || slotStr.includes('1 PM')) slotHour = 13;
    else if (slotStr.includes('02') || slotStr.includes('2 PM')) slotHour = 14;
    else if (slotStr.includes('03') || slotStr.includes('3 PM')) slotHour = 15;
    else if (slotStr.includes('04') || slotStr.includes('4 PM')) slotHour = 16;

    if (currentHour > slotHour) return true;
    if (currentHour === slotHour && currentMinutes >= 0) return true;
    return false;
  };

  // Helper to check if all today's slots are expired
  const isTodayExpired = () => {
    const slots = ['11 AM', '12 PM', '01 PM', '02 PM', '03 PM', '04 PM'];
    return slots.every(slot => isSlotPastToday(slot));
  };

  // Smart Auto-shift effect on load
  useEffect(() => {
    if (isTodayExpired()) {
      setImmediateDay('Tomorrow');
      setImmediateSlot('11:00 AM');
      setFormData(prev => ({
        ...prev,
        interview_availability: 'Immediate (Tomorrow at 11:00 AM)'
      }));
    } else {
      const firstAvail = ['11 AM', '12 PM', '01 PM', '02 PM', '03 PM', '04 PM'].find(s => !isSlotPastToday(s));
      if (firstAvail) {
        const fullSlot = firstAvail.replace(' AM', ':00 AM').replace(' PM', ':00 PM');
        setImmediateDay('Today');
        setImmediateSlot(fullSlot);
        setFormData(prev => ({
          ...prev,
          interview_availability: `Immediate (Today at ${fullSlot})`
        }));
      }
    }
  }, []);

  const handleImmediateDayChange = (day: string) => {
    if (day === 'Today' && isTodayExpired()) return;
    setImmediateDay(day);
    setFormData(prev => ({
      ...prev,
      interview_availability: `Immediate (${day} at ${immediateSlot})`
    }));
  };

  const handleImmediateSlotChange = (slot: string) => {
    setImmediateSlot(slot);
    setFormData(prev => ({
      ...prev,
      interview_availability: `Immediate (${immediateDay} at ${slot})`
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
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

  const handleCandidateIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.toUpperCase();
    if (!val.startsWith('CND-')) {
      const digits = val.replace(/[^0-9]/g, '');
      val = `CND-${digits}`;
    }
    setFormData(prev => ({ ...prev, candidate_id: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const fullName = `${formData.first_name} ${formData.last_name}`.trim();

      if (!formData.first_name.trim()) throw new Error('Please enter First Name.');

      if (formData.email.trim() && !isValidEmail(formData.email)) {
        throw new Error('Please enter a valid email address (e.g. candidate@example.com).');
      }

      if (formData.phone.trim() && formData.phone.length !== 10) {
        throw new Error('Contact number must be exactly 10 digits.');
      }

      const candidateCode = formData.candidate_id || `CND-${Math.floor(100000 + Math.random() * 900000)}`;

      // Generate 14-character alphanumeric shareable link
      const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
      let alphaNumeric14 = '';
      for (let i = 0; i < 14; i++) {
        alphaNumeric14 += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      const shareableObject = {
        uuid: alphaNumeric14,
        ref_id: candidateCode
      };

      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
      const shareableUrl = `${baseUrl}/${alphaNumeric14}/apply?ref=${candidateCode}`;

      // Upload CV file to Supabase Storage Bucket 'resumes'
      let finalCvUrl = null;
      if (cvFile) {
        try {
          const fileExt = cvFile.name.split('.').pop() || 'pdf';
          const filePath = `${candidateCode}_${Date.now()}.${fileExt}`;

          const { error: uploadErr } = await supabase.storage
            .from('resumes')
            .upload(filePath, cvFile, { upsert: true });

          if (!uploadErr) {
            const { data: publicData } = supabase.storage
              .from('resumes')
              .getPublicUrl(filePath);
            finalCvUrl = publicData?.publicUrl || null;
          } else {
            console.warn('Storage upload warning:', uploadErr.message);
          }
        } catch (sErr) {
          console.error('CV upload exception:', sErr);
        }
      }

      const cvValueToStore = finalCvUrl || (cvFile ? cvFile.name : null);

      const finalQualification = formData.qualification === 'Others' ? (formData.qualification_other || 'Others') : formData.qualification;
      const finalSource = formData.source === 'Employee ref (EMP_ID)'
        ? `Employee Ref (${formData.employee_ref_id || 'N/A'})`
        : (formData.source === 'Others' ? (formData.source_other || 'Others') : formData.source);
      const finalInterviewTime = formData.interview_availability === 'Immediate (tomorrow 11am to 4pm)'
        ? 'Immediate (Tomorrow 11 AM - 4 PM)'
        : (formData.interview_custom_time || 'Custom Schedule Requested');

      const finalSalary = formData.experience !== 'Fresher' ? (formData.last_in_hand_salary.trim() || null) : null;

      // Check if pre-generated blank lead record already exists for candidateCode
      const { data: existingRec } = await supabase
        .from('recruitment')
        .select('id, shareable_link')
        .eq('candidate_id', candidateCode)
        .limit(1)
        .maybeSingle();

      let finalShareable = JSON.stringify(shareableObject);
      if (existingRec?.shareable_link) {
        finalShareable = existingRec.shareable_link;
      }

      if (existingRec?.id) {
        // Update pre-generated lead row with submitted details & cv_url
        const { error: updateErr } = await supabase
          .from('recruitment')
          .update({
            first_name: formData.first_name.trim(),
            last_name: formData.last_name.trim() || null,
            name: fullName,
            father_name: formData.father_name.trim() || null,
            email: formData.email.trim() || null,
            phone: formData.phone.trim() || null,
            role: formData.role,
            experience: formData.experience,
            last_salary: finalSalary,
            qualification: finalQualification,
            institution_name: formData.institution_name.trim() || null,
            source: finalSource,
            interview_time: finalInterviewTime,
            stage: 'Lead',
            cv_file_name: cvValueToStore,
            shareable_link: finalShareable,
            ref_id: candidateCode,
            details_submitted: true
          })
          .eq('id', existingRec.id);

        if (updateErr) console.error('Supabase recruitment update error:', updateErr);
      } else {
        // Insert new record if not pre-generated
        const { error: dbError } = await supabase.from('recruitment').insert([{
          candidate_id: candidateCode,
          ref_id: candidateCode,
          first_name: formData.first_name.trim(),
          last_name: formData.last_name.trim() || null,
          name: fullName,
          father_name: formData.father_name.trim() || null,
          email: formData.email.trim() || null,
          phone: formData.phone.trim() || null,
          role: formData.role,
          experience: formData.experience,
          last_salary: finalSalary,
          qualification: finalQualification,
          institution_name: formData.institution_name.trim() || null,
          source: finalSource,
          interview_time: finalInterviewTime,
          stage: 'Lead',
          cv_file_name: cvValueToStore,
          shareable_link: finalShareable,
          details_submitted: true
        }]);

        if (dbError) console.error('Supabase recruitment insert error:', dbError);
      }

      setSuccessMessage(`Candidate "${fullName}" added successfully!`);
      setGeneratedLink(shareableUrl);
      setShowLinkModal(true);

    } catch (err: any) {
      console.error('Error adding candidate:', err);
      setErrorMessage(err.message || 'An error occurred while adding candidate.');
    } finally {
      setLoading(false);
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
      
      {/* FLOATING TOP ERROR NOTIFICATION TOAST */}
      <NotificationToast
        title="Candidate Error"
        message={errorMessage}
        type="error"
        isOpen={!!errorMessage}
        onClose={() => setErrorMessage('')}
      />

      {/* FLOATING TOP SUCCESS NOTIFICATION TOAST */}
      <NotificationToast
        title="Candidate Added"
        message={successMessage}
        type="success"
        isOpen={!!successMessage}
        onClose={() => setSuccessMessage('')}
      />

      <Header
        category="Recruitment & Onboarding"
        title="Add New Candidate"
        description="Enter basic information to register a new candidate."
        actionButton={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <Link
              href="/hr/recruitment"
              className={`${styles.actionButton} ${styles.secondaryBtn}`}
              style={{ textDecoration: 'none', padding: '12px 20px', fontSize: '14px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <ArrowLeft size={16} />
              <span>Back to Recruitment</span>
            </Link>
            <button
              type="button"
              onClick={handleGeneratePublicLink}
              title="Generate Candidate Application Form Link"
              style={{
                width: '46px',
                height: '46px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(59, 130, 246, 0.35)',
                transition: 'all 0.2s ease',
                flexShrink: 0
              }}
            >
              <Share2 size={18} />
            </button>
          </div>
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

        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* CATEGORY 1: PERSONAL INFORMATION */}
          <div className={styles.contentCard} style={{
            borderRadius: '24px',
            padding: '32px',
            background: 'rgba(255, 255, 255, 0.025)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            overflow: 'visible'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px'
              }}>
                01
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={20} style={{ color: '#3B82F6' }} />
                  Personal Information
                </h3>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>Enter candidate contact and identity details</span>
              </div>
            </div>

            <div className={styles.formGrid} style={{ gap: '20px 24px' }}>
              
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
                <label style={labelStyle}>Last Name <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '13px' }}>(Optional)</span></label>
                <input 
                  type="text" 
                  name="last_name" 
                  value={formData.last_name} 
                  onChange={handleInputChange} 
                  placeholder="Enter last name"
                  style={inputFieldStyle}
                />
              </div>

              {/* Father Name */}
              <div className={styles.formGroup}>
                <label style={labelStyle}>Father's Name <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '13px' }}>(Optional)</span></label>
                <input 
                  type="text" 
                  name="father_name" 
                  value={formData.father_name} 
                  onChange={handleInputChange} 
                  placeholder="Enter father's name"
                  style={inputFieldStyle}
                />
              </div>

              {/* Contact No. */}
              <div className={styles.formGroup}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ ...labelStyle, marginBottom: 0 }}>
                    Contact No. <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '13px' }}>(Optional)</span>
                  </label>
                  <span style={{
                    fontSize: '12px',
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
                  maxLength={10}
                  placeholder="Enter 10-digit phone number"
                  style={inputFieldStyle}
                />
              </div>

              {/* Email */}
              <div className={styles.formGroup}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ ...labelStyle, marginBottom: 0 }}>
                    Email Address <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '13px' }}>(Optional)</span>
                  </label>
                  {formData.email && (
                    <span style={{
                      fontSize: '12px',
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
                  maxLength={80}
                  placeholder="candidate@example.com"
                  style={inputFieldStyle}
                />
              </div>

              {/* Candidate ID */}
              <div className={styles.formGroup}>
                <label style={labelStyle}>
                  Candidate ID <span style={{ color: '#FFE76B', fontSize: '13px' }}>(Auto-Generated & Read-only)</span>
                </label>
                <input 
                  type="text" 
                  name="candidate_id" 
                  value={formData.candidate_id || 'CND-Auto'} 
                  readOnly
                  disabled
                  style={{
                    ...inputFieldStyle,
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    color: '#FFE76B',
                    cursor: 'not-allowed',
                    border: '1px solid rgba(255, 255, 255, 0.08)'
                  }}
                />
              </div>
            </div>
          </div>

          {/* CATEGORY 2: QUALIFICATION & EXPERIENCE */}
          <div className={styles.contentCard} style={{
            borderRadius: '24px',
            padding: '32px',
            background: 'rgba(255, 255, 255, 0.025)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            overflow: 'visible'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                backgroundColor: 'rgba(168, 85, 247, 0.15)', color: '#A855F7',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px'
              }}>
                02
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <GraduationCap size={20} style={{ color: '#A855F7' }} />
                  Qualification & Experience
                </h3>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>Select job role, experience level, and education</span>
              </div>
            </div>

            <div className={styles.formGrid} style={{ gap: '20px 24px' }}>
              
              {/* Position Applied For */}
              <CustomSelect
                label="Position Applied For"
                name="role"
                value={formData.role}
                onChange={handleSelectChange}
                required
                options={[
                  { label: 'Telesales Executive', value: 'Telesales Executive' },
                  { label: 'Sales Manager', value: 'Sales Manager' },
                  { label: 'HR Recruiter', value: 'HR Recruiter' },
                  { label: 'Quality Analyst', value: 'Quality Analyst' },
                  { label: 'Team Lead', value: 'Team Lead' }
                ]}
              />

              {/* Experience Level */}
              <CustomSelect
                label="Experience Level"
                name="experience"
                value={formData.experience}
                onChange={handleSelectChange}
                required
                options={[
                  { label: 'Fresher (0 Years)', value: 'Fresher' },
                  { label: '6 Months - 1 Year', value: '6 Months - 1 Year' },
                  { label: '1 - 2 Years Experience', value: '1-2 Years' },
                  { label: '3 - 5 Years Experience', value: '3-5 Years' },
                  { label: '5+ Years Senior', value: '5+ Years' }
                ]}
              />

              {/* Qualification Dropdown */}
              <CustomSelect
                label="Highest Qualification"
                name="qualification"
                value={formData.qualification}
                onChange={handleSelectChange}
                required
                options={[
                  { label: 'Graduation', value: 'Graduation' },
                  { label: 'Matric', value: 'Matric' },
                  { label: 'Inter college (12+)', value: 'Inter college (12+)' },
                  { label: 'Masters', value: 'Masters' },
                  { label: 'Others', value: 'Others' }
                ]}
              />

              {/* Last In-Hand Salary */}
              {formData.experience !== 'Fresher' && (
                <div className={styles.formGroup}>
                  <label style={labelStyle}>Last In-Hand Salary <span style={{ color: '#EF4444' }}>*</span></label>
                  <input
                    type="text"
                    name="last_in_hand_salary"
                    value={formData.last_in_hand_salary}
                    onChange={handleInputChange}
                    placeholder="e.g. ₹25,000 / month"
                    style={inputFieldStyle}
                  />
                </div>
              )}

              {/* Qualification Other Input */}
              {formData.qualification === 'Others' && (
                <div className={styles.formGroup}>
                  <label style={labelStyle}>Specify Qualification <span style={{ color: '#EF4444' }}>*</span></label>
                  <input
                    type="text"
                    name="qualification_other"
                    value={formData.qualification_other}
                    onChange={handleInputChange}
                    placeholder="Enter custom qualification"
                    style={inputFieldStyle}
                  />
                </div>
              )}

              {/* School/College/University Name */}
              <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>School / College / University Name <span style={{ color: '#EF4444' }}>*</span></label>
                <input
                  type="text"
                  name="institution_name"
                  value={formData.institution_name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter School, College, or University Name"
                  style={inputFieldStyle}
                />
              </div>
            </div>
          </div>

          {/* CATEGORY 3: REFERRAL & INTERVIEW PREFERENCE */}
          <div className={styles.contentCard} style={{
            borderRadius: '24px',
            padding: '32px',
            background: 'rgba(255, 255, 255, 0.025)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            overflow: 'visible'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                backgroundColor: 'rgba(52, 187, 136, 0.15)', color: '#34BB88',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px'
              }}>
                03
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={20} style={{ color: '#34BB88' }} />
                  Referral & Interview Preference
                </h3>
                <span style={{ fontSize: '13.3px', color: 'rgba(255,255,255,0.5)' }}>Specify referral source and preferred interview slot</span>
              </div>
            </div>

            <div className={styles.formGrid} style={{ gap: '20px 24px' }}>
              
              {/* Referral Source Dropdown */}
              <CustomSelect
                label="Where did you hear about company?"
                name="source"
                value={formData.source}
                onChange={handleSelectChange}
                required
                options={[
                  { label: 'Apna Job', value: 'Apna Job' },
                  { label: 'Facebook', value: 'Facebook' },
                  { label: 'Instagram', value: 'Instagram' },
                  { label: 'Employee ref (EMP_ID)', value: 'Employee ref (EMP_ID)' },
                  { label: 'Work India', value: 'Work India' },
                  { label: 'Others', value: 'Others' }
                ]}
              />

              {/* Interview Availability */}
              <div className={styles.formGroup} style={{ gridColumn: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ ...labelStyle, marginBottom: 0 }}>
                    Interview Availability <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <span style={{ fontSize: '11.5px', color: '#34BB88', fontWeight: '600' }}>
                    {formData.interview_availability === 'Choose whenever you want' ? (formData.interview_custom_time || 'Custom') : `${immediateDay} • ${immediateSlot}`}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* Main Toggle: Immediate vs Custom Date */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '6px',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    padding: '4px',
                    height: '46px',
                    alignItems: 'center'
                  }}>
                    <button
                      type="button"
                      onClick={() => handleSelectChange('interview_availability', `Immediate (${immediateDay} at ${immediateSlot})`)}
                      style={{
                        height: '38px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: formData.interview_availability !== 'Choose whenever you want' ? '#34BB88' : 'transparent',
                        color: formData.interview_availability !== 'Choose whenever you want' ? '#000000' : 'rgba(255, 255, 255, 0.7)',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Zap size={14} />
                      <span>Immediate</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        handleSelectChange('interview_availability', 'Choose whenever you want');
                        setShowDatePickerModal(true);
                      }}
                      style={{
                        height: '38px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: formData.interview_availability === 'Choose whenever you want' ? '#34BB88' : 'transparent',
                        color: formData.interview_availability === 'Choose whenever you want' ? '#000000' : 'rgba(255, 255, 255, 0.7)',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Calendar size={14} />
                      <span>{formData.interview_availability === 'Choose whenever you want' && formData.interview_custom_time ? formData.interview_custom_time : 'Custom Date'}</span>
                    </button>
                  </div>

                  {/* Immediate Sub-Options (Day Toggle & Time Slot Selector) */}
                  {formData.interview_availability !== 'Choose whenever you want' && (
                    <div style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(52, 187, 136, 0.25)',
                      borderRadius: '12px',
                      padding: '10px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}>
                      {/* Day Toggle: Today vs Tomorrow */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
                          Day:
                        </span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {['Today', 'Tomorrow'].map((day) => {
                            const isDaySelected = (immediateDay === day);
                            const isDayDisabled = (day === 'Today' && isTodayExpired());
                            return (
                              <button
                                key={day}
                                type="button"
                                disabled={isDayDisabled}
                                onClick={() => handleImmediateDayChange(day)}
                                title={isDayDisabled ? 'Today interview slots are over' : ''}
                                style={{
                                  padding: '4px 12px',
                                  borderRadius: '6px',
                                  border: isDayDisabled ? '1px solid rgba(255,255,255,0.05)' : isDaySelected ? '1px solid #34BB88' : '1px solid rgba(255,255,255,0.1)',
                                  backgroundColor: isDayDisabled ? 'rgba(255,255,255,0.01)' : isDaySelected ? 'rgba(52, 187, 136, 0.2)' : 'rgba(255,255,255,0.03)',
                                  color: isDayDisabled ? 'rgba(255,255,255,0.3)' : isDaySelected ? '#34BB88' : 'rgba(255,255,255,0.8)',
                                  fontSize: '11.5px',
                                  fontWeight: isDaySelected ? '700' : '500',
                                  cursor: isDayDisabled ? 'not-allowed' : 'pointer',
                                  opacity: isDayDisabled ? 0.4 : 1,
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                {day} {isDayDisabled && '(Ended)'}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Time Slot Selector */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
                          Slot:
                        </span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {['11 AM', '12 PM', '01 PM', '02 PM', '03 PM', '04 PM'].map((slotLabel) => {
                            const fullSlot = slotLabel.replace(' AM', ':00 AM').replace(' PM', ':00 PM');
                            const isSlotSelected = (immediateSlot === fullSlot);
                            const isPast = (immediateDay === 'Today' && isSlotPastToday(slotLabel));

                            return (
                              <button
                                key={slotLabel}
                                type="button"
                                disabled={isPast}
                                onClick={() => handleImmediateSlotChange(fullSlot)}
                                title={isPast ? 'This slot has already passed for today' : ''}
                                style={{
                                  padding: '4px 10px',
                                  borderRadius: '6px',
                                  border: isPast ? '1px solid rgba(255,255,255,0.05)' : isSlotSelected ? '1px solid #34BB88' : '1px solid rgba(255,255,255,0.1)',
                                  backgroundColor: isPast ? 'rgba(255,255,255,0.01)' : isSlotSelected ? '#34BB88' : 'rgba(255,255,255,0.03)',
                                  color: isPast ? 'rgba(255,255,255,0.25)' : isSlotSelected ? '#000000' : 'rgba(255,255,255,0.8)',
                                  fontSize: '11px',
                                  fontWeight: isSlotSelected ? '700' : '500',
                                  cursor: isPast ? 'not-allowed' : 'pointer',
                                  opacity: isPast ? 0.35 : 1,
                                  textDecoration: isPast ? 'line-through' : 'none',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                {slotLabel}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Custom Date Selected Sub-Panel Bar */}
                  {formData.interview_availability === 'Choose whenever you want' && (
                    <div style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid #34BB88',
                      borderRadius: '12px',
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px'
                    }}>
                      <div 
                        onClick={() => setShowDatePickerModal(true)} 
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1 }}
                      >
                        <Calendar size={16} style={{ color: '#34BB88', flexShrink: 0 }} />
                        <span style={{ fontSize: '12.5px', color: formData.interview_custom_time ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)', fontWeight: '500' }}>
                          {formData.interview_custom_time || 'Click to select Date & Time Calendar'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowDatePickerModal(true)}
                        style={{
                          background: 'rgba(52, 187, 136, 0.2)',
                          border: '1px solid rgba(52, 187, 136, 0.4)',
                          borderRadius: '6px',
                          color: '#34BB88',
                          padding: '4px 10px',
                          fontSize: '11px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Calendar size={12} />
                        <span>Change Date</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Custom Calendar Date Picker Modal */}
              <CustomDatePickerModal
                isOpen={showDatePickerModal}
                onClose={() => setShowDatePickerModal(false)}
                onSelect={(formatted) => {
                  setFormData(prev => ({ ...prev, interview_custom_time: formatted }));
                }}
              />

              {/* Employee Ref Input */}
              {formData.source === 'Employee ref (EMP_ID)' && (
                <div className={styles.formGroup}>
                  <label style={labelStyle}>Employee ID (EMP_ID) <span style={{ color: '#EF4444' }}>*</span></label>
                  <input type="text" name="employee_ref_id" value={formData.employee_ref_id} onChange={handleInputChange} placeholder="Enter Employee Referral ID (EMP_ID)" style={inputFieldStyle} />
                </div>
              )}

              {/* Source Other Input */}
              {formData.source === 'Others' && (
                <div className={styles.formGroup}>
                  <label style={labelStyle}>Specify Source <span style={{ color: '#EF4444' }}>*</span></label>
                  <input type="text" name="source_other" value={formData.source_other} onChange={handleInputChange} placeholder="Specify referral source" style={inputFieldStyle} />
                </div>
              )}
            </div>
          </div>

          {/* CATEGORY 4: RESUME / CV UPLOAD */}
          <div className={styles.contentCard} style={{
            borderRadius: '24px',
            padding: '32px',
            background: 'rgba(255, 255, 255, 0.025)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            overflow: 'visible'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px'
              }}>
                04
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={20} style={{ color: '#F59E0B' }} />
                  Resume / CV Document
                </h3>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>Upload candidate resume (Optional)</span>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label style={{ ...labelStyle, marginBottom: '12px' }}>
                Upload Candidate CV / Resume <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '13px', fontWeight: 400 }}>(Optional - PDF format)</span>
              </label>
              <input 
                type="file" 
                ref={cvInputRef} 
                onChange={handleFileChange} 
                accept=".pdf,application/pdf" 
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
                    padding: '36px 20px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px'
                  }}
                >
                  <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '16px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#34BB88'
                  }}>
                    <UploadCloud size={28} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#FFFFFF' }}>
                      Drag & drop candidate CV here, or <span style={{ color: '#34BB88', textDecoration: 'underline' }}>browse</span>
                    </p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'rgba(255, 255, 255, 0.4)' }}>
                      Supports PDF documents up to 10MB
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
                    title="Remove CV"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className={styles.formActions} style={{ marginTop: '16px', gap: '16px' }}>
            <button 
              type="button" 
              onClick={() => router.push('/hr/recruitment')}
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
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Saving Candidate...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  <span>Save Candidate</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>

      {/* SHAREABLE LINK MODAL (Mounted directly on document.body for exact viewport centering) */}
      {mounted && showLinkModal && createPortal(
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.82)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#1c1c1c',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '540px',
            padding: '28px',
            boxShadow: '0 24px 64px rgba(0,0,0,0.85)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Share2 size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', margin: 0 }}>Candidate Application Link</h3>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Share URL with candidate to auto-generate lead</span>
                </div>
              </div>
              <button
                onClick={() => setShowLinkModal(false)}
                style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: 'rgba(255,255,255,0.6)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', margin: '0 0 16px 0', lineHeight: '1.5' }}>
              Candidates opening this link can fill out their details independently. Once submitted, their profile will automatically appear in your <strong>Candidates Pipeline Board</strong>.
            </p>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              <input
                type="text"
                readOnly
                value={generatedLink}
                style={{
                  flex: '1',
                  height: '46px',
                  padding: '0 14px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: '#34BB88',
                  fontSize: '13px',
                  fontWeight: '600',
                  outline: 'none'
                }}
              />
              <button
                onClick={handleCopyLink}
                style={{
                  height: '46px',
                  padding: '0 18px',
                  backgroundColor: copied ? '#34BB88' : 'rgb(54, 54, 54)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease'
                }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Please fill out your candidate application form here: ${generatedLink}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '9px 16px',
                  backgroundColor: 'rgba(37, 211, 102, 0.15)',
                  border: '1px solid rgba(37, 211, 102, 0.3)',
                  color: '#25D366',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Share2 size={15} />
                <span>Share via WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  setShowLinkModal(false);
                  router.push('/hr/recruitment');
                }}
                style={{
                  padding: '9px 24px',
                  backgroundColor: '#34BB88',
                  color: '#000000',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(52, 187, 136, 0.3)',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <span>OK</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <Footer />
      <div className="bottom-left-pattern" />
    </main>
  );
}
