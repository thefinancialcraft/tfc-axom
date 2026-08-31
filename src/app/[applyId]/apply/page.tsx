'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams, useParams, useRouter } from 'next/navigation';
import { 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  CheckCircle, 
  XCircle,
  Loader2, 
  UploadCloud, 
  FileText, 
  Trash2,
  Sparkles,
  ChevronUp,
  ArrowRight,
  GraduationCap,
  Zap,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  X
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NotificationToast from '@/components/NotificationToast';
import MeteorShower from '@/components/MeteorShower';
import TwinklingStars from '@/components/TwinklingStars';
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
          <span>{selectedOption?.label}</span>
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

function DynamicApplyFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  
  const applyIdParam = (params?.applyId as string) || '';
  const refQuery = searchParams.get('ref') || '';
  const refId = refQuery || applyIdParam || 'CND-PUBLIC';

  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isAlreadySubmitted, setIsAlreadySubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [appId, setAppId] = useState('');

  // Custom Calendar Modal State
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);

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
    experience: 'Fresher',
    last_in_hand_salary: '',
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

  // Strict link validation & pre-fill form data from Supabase
  useEffect(() => {
    const fetchAndValidateCandidate = async () => {
      setInitialLoading(true);
      setIsUnauthorized(false);

      if (!applyIdParam || !refQuery) {
        // Both 14-character alphanumeric code AND ?ref= parameter are required
        setIsUnauthorized(true);
        setInitialLoading(false);
        return;
      }

      try {
        // Strict validation: Candidate record in Supabase MUST match candidate_id/ref_id AND shareable_link contains applyIdParam
        const { data, error } = await supabase
          .from('recruitment')
          .select('*')
          .or(`candidate_id.eq.${refQuery},ref_id.eq.${refQuery}`)
          .ilike('shareable_link', `%${applyIdParam}%`)
          .limit(1)
          .maybeSingle();

        let isValid = false;
        if (!error && data) {
          if (data.shareable_link) {
            try {
              const parsed = typeof data.shareable_link === 'string' && data.shareable_link.startsWith('{')
                ? JSON.parse(data.shareable_link)
                : data.shareable_link;

              if (typeof parsed === 'object' && parsed !== null && parsed.uuid) {
                if (parsed.uuid === applyIdParam && (parsed.ref_id === refQuery || data.candidate_id === refQuery)) {
                  isValid = true;
                }
              } else if (typeof data.shareable_link === 'string' && data.shareable_link.includes(applyIdParam)) {
                isValid = true;
              }
            } catch (e) {
              if (data.shareable_link.includes(applyIdParam)) isValid = true;
            }
          }
        }

        if (!isValid || !data) {
          // Ref ID and 14-char link code do NOT belong together or don't exist -> Unauthorized!
          setIsUnauthorized(true);
          setInitialLoading(false);
          return;
        }

        // Valid match! Pre-fill details & check submission state
        if (data.details_submitted === true) {
          setIsAlreadySubmitted(true);
          setAppId(data.candidate_id || refQuery);
        }

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
      } catch (err) {
        console.error('Error validating candidate link:', err);
        setIsUnauthorized(true);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchAndValidateCandidate();
  }, [applyIdParam, refQuery]);

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

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setErrorMessage('Please enter a valid 10-digit contact number!');
      return;
    }
    if (!formData.email.trim() || !isValidEmail(formData.email)) {
      setErrorMessage('Please enter a valid email address!');
      return;
    }
    if (!formData.role) {
      setErrorMessage('Please select a position applied for!');
      return;
    }
    if (!formData.experience) {
      setErrorMessage('Please select an experience level!');
      return;
    }
    if (formData.experience !== 'Fresher' && !formData.last_in_hand_salary.trim()) {
      setErrorMessage('Last In-Hand Salary is required for experienced candidates!');
      return;
    }
    if (!formData.qualification) {
      setErrorMessage('Please select highest qualification!');
      return;
    }
    if (formData.qualification === 'Others' && !formData.qualification_other.trim()) {
      setErrorMessage('Please specify your qualification!');
      return;
    }
    if (!formData.institution_name.trim()) {
      setErrorMessage('School / College / University Name is required!');
      return;
    }
    if (!formData.source) {
      setErrorMessage('Please select referral source!');
      return;
    }
    if (formData.source === 'Employee ref (EMP_ID)' && !formData.employee_ref_id.trim()) {
      setErrorMessage('Employee Referral ID (EMP_ID) is required!');
      return;
    }
    if (formData.source === 'Others' && !formData.source_other.trim()) {
      setErrorMessage('Please specify referral source!');
      return;
    }
    if (formData.interview_availability === 'Choose whenever you want' && !formData.interview_custom_time) {
      setErrorMessage('Please select a custom interview date & time from calendar!');
      return;
    }
    if (!cvFile) {
      setErrorMessage('Please upload your Resume / CV file (PDF format)! All fields are mandatory.');
      return;
    }

    setLoading(true);

    try {
      const generatedAppId = `APP-${Math.floor(100000 + Math.random() * 900000)}`;
      const candidateCode = `CND-${Math.floor(100000 + Math.random() * 900000)}`;
      const fullName = `${formData.first_name.trim()} ${formData.last_name.trim()}`;
      
      const newCandidate = {
        id: generatedAppId,
        candidate_id: candidateCode,
        name: fullName,
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        role: formData.role,
        stage: 'Lead', // Automatically generated as Lead
        refId: refId,
        dateAdded: new Date().toISOString().split('T')[0],
        cvFileName: cvFile ? cvFile.name : undefined
      };

      // Update or Insert into Supabase recruitment table with details_submitted: true
      const currentUrl = typeof window !== 'undefined' ? window.location.href : null;

      const { data: existingRec } = await supabase
        .from('recruitment')
        .select('id')
        .or(`candidate_id.eq.${refId},ref_id.eq.${refId},shareable_link.ilike.%${applyIdParam}%`)
        .limit(1)
        .maybeSingle();

      // Upload CV file to Supabase Storage Bucket 'resumes' and get public URL
      let finalCvUrl = null;
      if (cvFile) {
        try {
          const fileExt = cvFile.name.split('.').pop() || 'pdf';
          const safeRef = refId || candidateCode;
          const filePath = `${safeRef}_${Date.now()}.${fileExt}`;

          // Attempt upload to 'resumes' bucket
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

      const finalQualification = formData.qualification === 'Others' ? (formData.qualification_other || 'Others') : formData.qualification;
      const finalSource = formData.source === 'Employee ref (EMP_ID)'
        ? `Employee Ref (${formData.employee_ref_id || 'N/A'})`
        : (formData.source === 'Others' ? (formData.source_other || 'Others') : formData.source);

      let finalInterviewTime = formData.interview_availability;
      if (formData.interview_availability.startsWith('Immediate')) {
        finalInterviewTime = `Immediate (${immediateDay} at ${immediateSlot})`;
      } else if (formData.interview_custom_time) {
        finalInterviewTime = formData.interview_custom_time;
      }

      // Calculate ISO 8601 Timestamp for interview_timestamp column
      let calculatedIsoTimestamp = new Date().toISOString();
      try {
        const dateObj = new Date();
        if (formData.interview_availability.startsWith('Immediate')) {
          if (immediateDay === 'Tomorrow') {
            dateObj.setDate(dateObj.getDate() + 1);
          }
          let h = 11;
          let m = 0;
          const slotMatch = immediateSlot.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)/i);
          if (slotMatch) {
            h = parseInt(slotMatch[1], 10);
            m = slotMatch[2] ? parseInt(slotMatch[2], 10) : 0;
            const ampm = slotMatch[3].toUpperCase();
            if (ampm === 'PM' && h < 12) h += 12;
            if (ampm === 'AM' && h === 12) h = 0;
          }
          dateObj.setHours(h, m, 0, 0);
          calculatedIsoTimestamp = dateObj.toISOString();
        } else if (formData.interview_custom_time) {
          const parsed = new Date(formData.interview_custom_time);
          if (!isNaN(parsed.getTime())) {
            calculatedIsoTimestamp = parsed.toISOString();
          }
        }
      } catch (tErr) {
        console.error('Timestamp calculation error:', tErr);
      }

      const finalSalary = formData.experience !== 'Fresher' ? (formData.last_in_hand_salary.trim() || null) : null;

      const supabasePayload = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        name: fullName,
        father_name: formData.father_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        role: formData.role,
        experience: formData.experience,
        last_salary: finalSalary,
        qualification: finalQualification,
        qualification_other: formData.qualification_other.trim() || null,
        institution_name: formData.institution_name.trim() || null,
        source: finalSource,
        employee_ref_id: formData.employee_ref_id.trim() || null,
        source_other: formData.source_other.trim() || null,
        interview_time: finalInterviewTime,
        interview_timestamp: calculatedIsoTimestamp,
        cv_url: finalCvUrl,
        cv_file_name: cvFile ? cvFile.name : null,
        details_submitted: true
      };

      if (existingRec?.id) {
        const { error: updateErr } = await supabase
          .from('recruitment')
          .update(supabasePayload)
          .eq('id', existingRec.id);

        if (updateErr) {
          console.error('Supabase recruitment update error:', updateErr);
          setErrorMessage(`Database update failed: ${updateErr.message}`);
          setLoading(false);
          return;
        }
      } else {
        const { error: insertErr } = await supabase.from('recruitment').insert([{
          ...supabasePayload,
          candidate_id: candidateCode,
          ref_id: candidateCode,
          stage: 'Lead'
        }]);

        if (insertErr) {
          console.error('Supabase recruitment insert error:', insertErr);
          setErrorMessage(`Database submission failed: ${insertErr.message}`);
          setLoading(false);
          return;
        }
      }

      // Save into localStorage lead pipeline as fallback
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

  if (initialLoading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: '#000000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999
      }}>
        {/* Center Logo & Snake Spinner Container */}
        <div style={{ position: 'relative', width: '130px', height: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>

          <svg className="snake-spinner" viewBox="25 25 50 50" style={{ position: 'absolute', width: '130px', height: '130px', zIndex: 2 }}>
            <circle className="snake-spinner-circle" cx="50" cy="50" r="20" fill="none" strokeWidth="1.5" strokeMiterlimit="10" />
          </svg>
          <img src="/logo.png" alt="TFC Axom" style={{ width: '56px', height: 'auto', filter: 'brightness(0) invert(1)', zIndex: 3 }} />
        </div>

        <p style={{
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: '14px',
          fontWeight: '500',
          marginTop: '28px',
          fontFamily: 'var(--font-lufga), sans-serif',
          letterSpacing: '0.5px',
          zIndex: 10
        }}>
          Loading TFC Axom Portal...
        </p>
      </div>
    );
  }

  if (isUnauthorized) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0B0F17', position: 'relative', overflow: 'hidden', padding: '24px' }}>
        <MeteorShower />
        <TwinklingStars density="high" />
        <div className="star-layer stars-1"></div>
        <div className="star-layer stars-2"></div>
        <div className="star-layer stars-3"></div>
        <div className="star-layer stars-4"></div>
        <div className="star-layer stars-5"></div>
        <div className="star-layer stars-6"></div>
        <div className="top-right-pattern" />
        <div className="bottom-left-pattern" />

        {/* Ambient Red Glow Backlight Blob */}
        <div style={{
          position: 'absolute',
          width: '380px',
          height: '380px',
          background: 'radial-gradient(circle, rgba(239, 68, 68, 0.2) 0%, rgba(0, 0, 0, 0) 70%)',
          borderRadius: '50%',
          filter: 'blur(40px)',
          zIndex: 2,
          pointerEvents: 'none'
        }} />

        <div style={{
          maxWidth: '480px',
          width: '100%',
          background: 'linear-gradient(35deg, rgba(56, 56, 56, 0.01) 0%, rgba(66, 66, 66, 0.01) 130%)',
          backdropFilter: 'blur(4px)',
          
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderTop: '1px solid rgba(255, 255, 255, 0.25)',
          borderRadius: '24px',
          padding: '30px 28px',
          textAlign: 'center',
          boxShadow: '0 10px 60px rgba(0, 0, 0, 0.8), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '14px',
          position: 'relative'
        }}>
          {/* COMBINED TFC AXOM LOGO WITH RED GLOW & SHIELD BADGE */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '70px', height: '70px' }}>
            <div style={{
              position: 'absolute',
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(239, 68, 68, 0.4) 0%, transparent 70%)',
              filter: 'blur(10px)',
              zIndex: 1
            }} />
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#EF4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 3
            }}>
              <XCircle size={32} />
            </div>
          </div>

          <div>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#EF4444', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
              🚫 Access Denied / Invalid Link
            </span>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#ffffff', margin: 0, letterSpacing: '-0.5px' }}>
              Unauthorized Application Link
            </h2>
          </div>

          <p style={{ fontSize: '13.5px', color: 'rgba(255, 255, 255, 0.75)', lineHeight: '1.5', margin: 0 }}>
            The link you opened is invalid or tampered with (<code style={{ color: '#FFE76B', backgroundColor: 'rgba(0,0,0,0.4)', padding: '2px 6px', borderRadius: '4px' }}>ref={refQuery || 'N/A'}</code> does not match link code <code style={{ color: '#34BB88', backgroundColor: 'rgba(0,0,0,0.4)', padding: '2px 6px', borderRadius: '4px' }}>{applyIdParam}</code>).
          </p>

          <div style={{
            padding: '10px 16px',
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '12px',
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '12.5px',
            fontWeight: '500'
          }}>
            Please contact your HR manager for a valid application link.
          </div>

          <button
            type="button"
            onClick={() => router.push('/login')}
            style={{
              marginTop: '4px',
              padding: '12px 36px',
              backgroundColor: '#34BB88',
              color: '#000000',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(52, 187, 136, 0.35)',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <User size={16} />
            <span>Login</span>
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="page-fade-in" style={{ position: 'relative', width: '100%', paddingBottom: '100px', backgroundColor: '#0e0e0e', overflow: 'hidden' }}>
      {/* RICH COSMIC STARFIELD & SPARKLES BACKGROUND */}
      <MeteorShower />
      <TwinklingStars density="high" />
      <div className="star-layer stars-1"></div>
      <div className="star-layer stars-2"></div>
      <div className="star-layer stars-3"></div>
      <div className="star-layer stars-4"></div>
      <div className="star-layer stars-5"></div>
      <div className="star-layer stars-6"></div>
      <div className="top-right-pattern" />
      <div className="bottom-left-pattern" />

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
          Submit basic information to apply under reference ID: <strong style={{ color: '#34BB88' }}>{refId}</strong>
        </p>
      </div>

      <div style={{ padding: '0 24px', marginTop: '20px', width: '100%', maxWidth: '1100px', margin: '20px auto 0 auto' }}>
        {submitted || isAlreadySubmitted ? (
          <div className={styles.contentCard} style={{
            borderRadius: '28px',
            padding: '54px 36px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
            background: 'linear-gradient(145deg, rgba(30, 30, 30, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%)',
            border: '1.5px solid rgba(52, 187, 136, 0.35)',
            boxShadow: '0 24px 64px rgba(0, 0, 0, 0.65)'
          }}>
            <div style={{
              width: '84px',
              height: '84px',
              borderRadius: '50%',
              backgroundColor: 'rgba(52, 187, 136, 0.15)',
              color: '#34BB88',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 30px rgba(52, 187, 136, 0.25)'
            }}>
              <CheckCircle size={48} />
            </div>

            <div>
              <span style={{ 
                fontSize: '13px', 
                fontWeight: '600', 
                color: '#34BB88', 
                letterSpacing: '1px', 
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '8px'
              }}>
                Application Status: Filed
              </span>
              <h2 style={{ fontSize: '30px', fontWeight: '800', color: '#ffffff', margin: 0, letterSpacing: '-0.5px' }}>
                Welcome to The Financial Craft Family! 🎉
              </h2>
            </div>

            <p style={{ fontSize: '15.5px', color: 'rgba(255, 255, 255, 0.8)', maxWidth: '580px', lineHeight: '1.6', margin: 0 }}>
              Your candidate application has been filed successfully. All required details have been registered under candidate reference <strong>{refId}</strong>.
            </p>

            {/* CANDIDATE SUMMARY CARD */}
            <div style={{
              width: '100%',
              maxWidth: '520px',
              padding: '20px 24px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>Applicant Name:</span>
                <strong style={{ color: '#ffffff' }}>{formData.first_name} {formData.last_name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>Candidate Ref Code:</span>
                <strong style={{ color: '#34BB88' }}>{appId || refId}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>Applied Role:</span>
                <strong style={{ color: '#ffffff' }}>{formData.role}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>Details Form Status:</span>
                <span style={{ color: '#34BB88', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle size={15} /> All Details Filed
                </span>
              </div>
            </div>

            <div style={{
              padding: '16px 24px',
              backgroundColor: 'rgba(52, 187, 136, 0.1)',
              border: '1px solid rgba(52, 187, 136, 0.25)',
              borderRadius: '16px',
              color: '#34BB88',
              fontSize: '14px',
              fontWeight: '500',
              maxWidth: '520px',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <span>💬 Your application is filed. Please stay in touch with HR for interview schedules.</span>
            </div>

            {/* ACTION BUTTONS: VIEW APPLICATION PDF & HR LOGIN */}
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '12px', width: '100%', maxWidth: '520px' }}>
              <button
                type="button"
                onClick={() => router.push(`/profile=${refId || 'CND-002'}?ref=${refId || 'CND-002'}&page=pdf`)}
                style={{
                  flex: 1,
                  minWidth: '220px',
                  height: '48px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: '#34BB88',
                  color: '#000000',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
              >
                <FileText size={18} />
                <span>View Application PDF</span>
              </button>

              <button
                type="button"
                onClick={() => router.push('/login')}
                style={{
                  flex: 1,
                  minWidth: '180px',
                  height: '48px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
              >
                <User size={18} />
                <span>HR Portal Login</span>
              </button>
            </div>
          </div>
        ) : (
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
                    required 
                    maxLength={10}
                    placeholder="Enter 10-digit phone number"
                    style={inputFieldStyle}
                  />
                </div>

                {/* Email */}
                <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ ...labelStyle, marginBottom: 0 }}>
                      Email Address <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    {formData.email && (
                      <span style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: isValidEmail(formData.email) ? '#34BB88' : '#EF4444',
                        transition: 'all 0.2s ease'
                      }}>
                        {isValidEmail(formData.email) ? '✓ Valid Format' : 'Invalid Format'}
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
                  options={[
                    { label: 'Graduation', value: 'Graduation' },
                    { label: 'Matric', value: 'Matric' },
                    { label: 'Inter college (12+)', value: 'Inter college (12+)' },
                    { label: 'Masters', value: 'Masters' },
                    { label: 'Others', value: 'Others' }
                  ]}
                />

                {/* Last In-Hand Salary (Positioned at right of Qualification when non-fresher) */}
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

                {/* Qualification Other Text Box */}
                {formData.qualification === 'Others' && (
                  <div className={styles.formGroup}>
                    <label style={labelStyle}>Specify Qualification <span style={{ color: '#EF4444' }}>*</span></label>
                    <input
                      type="text"
                      name="qualification_other"
                      value={formData.qualification_other}
                      onChange={handleInputChange}
                      placeholder="Enter qualification"
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
                    placeholder="Enter your School, College, or University name"
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
                    <input
                      type="text"
                      name="employee_ref_id"
                      value={formData.employee_ref_id}
                      onChange={handleInputChange}
                      placeholder="Enter Employee Referral ID"
                      style={inputFieldStyle}
                    />
                  </div>
                )}

                {/* Source Other Text Box */}
                {formData.source === 'Others' && (
                  <div className={styles.formGroup}>
                    <label style={labelStyle}>Specify Source <span style={{ color: '#EF4444' }}>*</span></label>
                    <input
                      type="text"
                      name="source_other"
                      value={formData.source_other}
                      onChange={handleInputChange}
                      placeholder="Specify where you heard about us"
                      style={inputFieldStyle}
                    />
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
                  <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>Upload candidate resume in PDF format</span>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label style={{ ...labelStyle, marginBottom: '12px' }}>
                  Upload Resume (PDF format) <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => cvInputRef.current?.click()}
                  style={{
                    border: isDragging ? '2px dashed #34BB88' : cvFile ? '2px solid #34BB88' : '2px dashed rgba(255, 255, 255, 0.15)',
                    backgroundColor: isDragging ? 'rgba(52, 187, 136, 0.08)' : cvFile ? 'rgba(52, 187, 136, 0.04)' : 'rgba(255, 255, 255, 0.02)',
                    borderRadius: '18px',
                    padding: '36px 20px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px'
                  }}
                >
                  <input 
                    type="file" 
                    ref={cvInputRef} 
                    onChange={handleFileSelect} 
                    accept=".pdf,application/pdf" 
                    style={{ display: 'none' }} 
                  />
                  {cvFile ? (
                    <>
                      <div style={{
                        width: '52px', height: '52px', borderRadius: '16px',
                        backgroundColor: 'rgba(52, 187, 136, 0.15)', color: '#34BB88',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <FileText size={28} />
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#FFFFFF' }}>{cvFile.name}</p>
                        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)' }}>
                          {(cvFile.size / (1024 * 1024)).toFixed(2)} MB • PDF Document
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCvFile(null);
                        }}
                        style={{
                          background: 'rgba(239, 68, 68, 0.15)',
                          border: 'none',
                          color: '#EF4444',
                          borderRadius: '8px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          marginTop: '4px'
                        }}
                      >
                        <Trash2 size={14} /> Remove File
                      </button>
                    </>
                  ) : (
                    <>
                      <div style={{
                        width: '52px', height: '52px', borderRadius: '16px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)', color: '#34BB88',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
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
                    </>
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

export default function DynamicCandidatePublicApplyPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', backgroundColor: '#0e0e0e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: '#34BB88' }} />
      </div>
    }>
      <DynamicApplyFormContent />
    </Suspense>
  );
}
