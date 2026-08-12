'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Phone, Building, FileText, Mail, Pencil, Link as LinkIcon, ExternalLink, Calendar, Droplet, CreditCard, Hash, MapPin, CheckCircle, ChevronUp, ChevronLeft, Shield, Clock, AlertTriangle, Loader2, Briefcase, IndianRupee, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { updateUserProfileAdmin } from '@/app/actions/auth';
import AuthHashCleaner from '@/components/AuthHashCleaner';
import TwinklingStars from '@/components/TwinklingStars';
import Footer from '@/components/Footer';
import styles from './detail.module.css';

interface UserProfile {
  user_id: string;
  email: string;
  user_name: string;
  phone: string | null;
  employee_id: string | null;
  role: string | null;
  work_type: string | null;
  department: string | null;
  designation: string | null;
  status: string | null;
  approval_status: string | null;
  super_admin: boolean;
  father_name: string | null;
  gender: string | null;
  aadhar_card_no: string | null;
  date_of_birth: string | null;
  in_hand_salary: number | null;
  alternate_contact: string | null;
  primary_address: string | null;
  area_pincode: string | null;
  bank_name: string | null;
  account_holder_name: string | null;
  account_number: string | null;
  ifsc_code: string | null;
  branch_pincode: string | null;
  branch_state: string | null;
  branch_city: string | null;
  blood_group: string | null;
  emergency_contact_no: string | null;
  profile_pic_url: string | null;
  aadhar_front_url: string | null;
  aadhar_back_url: string | null;
  qualification_marksheet_url: string | null;
  bank_passbook_url: string | null;
  profile_complete: boolean;
  pan_card_no: string | null;
  pan_card_url: string | null;
}

interface CustomSelectProps {
  label?: string;
  name: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (name: string, value: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}

function CustomSelect({ label, name, value, options, onChange, placeholder = 'Select...', style }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

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
    <div className={label ? styles.formGroup : undefined} style={style} ref={dropdownRef}>
      {label && <label>{label}</label>}
      <div className={styles.customSelectWrapper} style={{ position: 'relative' }}>
        <div 
          onClick={() => setIsOpen(!isOpen)}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '46px',
            padding: '0 16px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '12px',
            color: '#fff',
            fontSize: '14px',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <span>{selectedOption ? selectedOption.label : placeholder}</span>
          <ChevronUp size={16} style={{ transition: 'transform 0.2s', transform: isOpen ? 'rotate(0deg)' : 'rotate(180deg)', opacity: 0.7 }} />
        </div>
        {isOpen && (
          <div 
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              width: '100%',
              background: '#1e1e1e',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '6px',
              zIndex: 100,
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
              maxHeight: '180px',
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
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: opt.value === value ? '#fff' : 'rgba(255, 255, 255, 0.7)',
                  background: opt.value === value ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                  cursor: 'pointer',
                  fontWeight: opt.value === value ? 500 : 400
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

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [editTab, setEditTab] = useState<'employment' | 'personal' | 'contact' | 'banking' | 'identity'>('employment');

  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    basic: false,
    contact: true,
    banking: true,
    identity: true
  });

  const [formData, setFormData] = useState({
    user_name: '',
    phone: '',
    employee_id: '',
    role: '',
    work_type: '',
    department: '',
    designation: '',
    in_hand_salary: '',
    status: '',
    approval_status: '',
    father_name: '',
    gender: '',
    date_of_birth: '',
    blood_group: '',
    alternate_contact: '',
    emergency_contact_no: '',
    bank_name: '',
    account_holder_name: '',
    account_number: '',
    ifsc_code: '',
    branch_city: '',
    branch_state: '',
    branch_pincode: '',
    primary_address: '',
    area_pincode: '',
    aadhar_card_no: '',
    pan_card_no: ''
  });

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', id)
        .single();

      if (error) throw error;
      setProfile(data);
      
      // Initialize edit fields
      if (data) {
        setFormData({
          user_name: data.user_name || '',
          phone: data.phone || '',
          employee_id: data.employee_id || '',
          role: data.role || 'Employee',
          work_type: data.work_type || 'Full Time',
          department: data.department || 'Engineering',
          designation: data.designation || 'Software Engineer',
          in_hand_salary: data.in_hand_salary?.toString() || '',
          status: data.status || 'Active',
          approval_status: data.approval_status || 'Approved',
          father_name: data.father_name || '',
          gender: data.gender || 'Male',
          date_of_birth: data.date_of_birth || '',
          blood_group: data.blood_group || 'O+',
          alternate_contact: data.alternate_contact || '',
          emergency_contact_no: data.emergency_contact_no || '',
          bank_name: data.bank_name || '',
          account_holder_name: data.account_holder_name || '',
          account_number: data.account_number || '',
          ifsc_code: data.ifsc_code || '',
          branch_city: data.branch_city || '',
          branch_state: data.branch_state || '',
          branch_pincode: data.branch_pincode || '',
          primary_address: data.primary_address || '',
          area_pincode: data.area_pincode || '',
          aadhar_card_no: data.aadhar_card_no || '',
          pan_card_no: data.pan_card_no || ''
        });
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      alert('Failed to load user details.');
      router.push('/users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchUserProfile();
    }
  }, [id]);

  const toggleSection = (section: string) => {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCustomSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await updateUserProfileAdmin(id, {
        user_name: formData.user_name,
        phone: formData.phone || null,
        employee_id: formData.employee_id || null,
        role: formData.role,
        work_type: formData.work_type,
        department: formData.department,
        designation: formData.designation,
        in_hand_salary: formData.in_hand_salary ? parseFloat(formData.in_hand_salary) : null,
        status: formData.status,
        approval_status: formData.approval_status,
        father_name: formData.father_name || null,
        gender: formData.gender || null,
        date_of_birth: formData.date_of_birth || null,
        blood_group: formData.blood_group || null,
        alternate_contact: formData.alternate_contact || null,
        emergency_contact_no: formData.emergency_contact_no || null,
        bank_name: formData.bank_name || null,
        account_holder_name: formData.account_holder_name || null,
        account_number: formData.account_number || null,
        ifsc_code: formData.ifsc_code || null,
        branch_city: formData.branch_city || null,
        branch_state: formData.branch_state || null,
        branch_pincode: formData.branch_pincode || null,
        primary_address: formData.primary_address || null,
        area_pincode: formData.area_pincode || null,
        aadhar_card_no: formData.aadhar_card_no || null,
        pan_card_no: formData.pan_card_no || null
      });

      if (!res.success) throw new Error(res.error || 'Failed to update user profile');

      alert('User details updated successfully!');
      setIsEditModalOpen(false);
      fetchUserProfile();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error occurred during update.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleQuickApprove = async () => {
    if (!profile) return;
    setActionLoading(true);
    try {
      const res = await updateUserProfileAdmin(id, {
        approval_status: 'Approved'
      });

      if (!res.success) throw new Error(res.error);
      alert('User approved successfully!');
      fetchUserProfile();
    } catch (err: any) {
      console.error(err);
      alert('Failed to approve user.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', color: 'rgba(255,255,255,0.4)', gap: '8px' }}>
        <Loader2 className="spin" size={24} />
        <span>Loading employee details...</span>
        <style jsx global>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .spin {
            animation: spin 1s linear infinite;
          }
        `}</style>
      </div>
    );
  }

  if (!profile) return null;

  const renderField = (label: string, value: string | null | undefined, IconComponent?: React.ElementType, isLink = false) => {
    const hasValue = Boolean(value);
    
    return (
      <div 
        className={styles.field} 
        style={{ opacity: hasValue ? 1 : 0.5 }}
      >
        <div className={styles.fieldLabel}>
          {IconComponent && <IconComponent size={13} style={{ marginRight: '6px', opacity: 0.6 }} />}
          {label}
        </div>
        <div className={hasValue ? styles.fieldValue : `${styles.fieldValue} ${styles.emptyValue}`}>
          {hasValue ? (
            isLink ? (
              <a href={value!} target="_blank" rel="noopener noreferrer" className={styles.linkValue}>
                <LinkIcon size={14} /> View Document <ExternalLink size={12} />
              </a>
            ) : (
              value
            )
          ) : (
            "Not provided"
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden', width: '100%', paddingBottom: '100px' }}>
      <AuthHashCleaner />
      <TwinklingStars density="high" />
      <div className="top-right-pattern" />

      {/* Back Button (styled and positioned exactly like the logout button) */}
      <div style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 50 }}>
        <Link 
          href="/users" 
          className="logout-btn-sleek" 
          title="Back to Dashboard"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <ChevronLeft size={18} />
        </Link>
      </div>

      <div className={styles.container}>
        {/* Page Title */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '600', letterSpacing: '-0.5px', color: '#fff', fontFamily: 'var(--font-lufga), sans-serif' }}>Profile</h1>
        </div>
    
        {/* Hero Card */}
        <div className={styles.headerCard}>
          <div className="top-right-pattern" style={{ width: '450px', height: '450px', opacity: 0.1, right: 'auto', left: '-50px', top: '-50px', zIndex: 0 }}></div>
          <div className="top-right-pattern" style={{ width: '450px', height: '450px', opacity: 0.1, left: 'auto', right: '-50px', bottom: '-50px', top: 'auto', transform: 'rotate(180deg)', zIndex: 0 }}></div>
          
          <div className={styles.heroImageContainer}>
            <img 
              src={profile.profile_pic_url || "/dm-hr.png"} 
              alt={profile.user_name} 
              className={styles.heroImage} 
            />
          </div>

          <div className={styles.heroInfo}>
            <h2 className={styles.heroName}>{profile.user_name}</h2>
            <div className={styles.heroSubText}>Email - <span>{profile.email}</span></div>
            <div className={styles.heroSubText}>Employee ID - <span>{profile.employee_id || 'TFC-N/A'}</span></div>
            <div className={styles.heroSubText}>System Role - <span>{profile.role || 'Employee'}</span></div>
            <div className={styles.heroSubText}>Department - <span>{profile.department || 'N/A'}</span></div>
            <div className={styles.heroSubText}>Status - <span style={{ color: profile.status === 'Active' ? '#22c55e' : '#ef4444' }}>{profile.status || 'Active'}</span></div>
          </div>

          <div className={styles.heroActionWrapper}>
            <button className={`${styles.actionButton} ${styles.primaryBtn}`} onClick={() => setIsEditModalOpen(true)}>
              <Pencil size={14} />
              <span>Modify Info & Access</span>
            </button>
            
            {profile.approval_status !== 'Approved' && (
              <button 
                className={`${styles.actionButton} ${styles.secondaryBtn}`} 
                onClick={handleQuickApprove}
                disabled={actionLoading}
                style={{ color: '#22c55e', borderColor: 'rgba(34, 197, 94, 0.2)', background: 'rgba(34, 197, 94, 0.05)' }}
              >
                <CheckCircle size={14} />
                <span>Approve Account</span>
              </button>
            )}
          </div>
        </div>

        {/* Business/Management Fields Section */}
        <h3 className={styles.categoryHeader} style={{ marginBottom: '16px', cursor: 'default' }}>
          <div className={styles.categoryTitle}>
            <Shield className={styles.categoryIcon} style={{ marginRight: '8px' }} />
            Employment & Access Details
          </div>
        </h3>
        <div className={styles.contentCard} style={{ borderRadius: '16px', marginBottom: '32px' }}>
          <div className={styles.grid}>
            {renderField("Employee ID", profile.employee_id, Hash)}
            {renderField("Designation", profile.designation, Briefcase)}
            {renderField("Department", profile.department, Building)}
            {renderField("System Role", profile.role, Shield)}
            {renderField("Work Type", profile.work_type, Briefcase)}
            {renderField("In-Hand Salary", profile.in_hand_salary ? `₹${profile.in_hand_salary.toLocaleString()}` : null, IndianRupee)}
            {renderField("Status", profile.status, Clock)}
            {renderField("Approval Status", profile.approval_status, CheckCircle)}
          </div>
        </div>

        {/* Basic Info Section */}
        <h3 onClick={() => toggleSection('basic')} className={styles.categoryHeader}>
          <div className={styles.categoryTitle}>
            <User className={styles.categoryIcon} style={{ marginRight: '8px' }} />
            Basic Info
          </div>
          <ChevronUp className={`${styles.mobileCategoryArrow} ${collapsedSections['basic'] ? styles.rotatedArrow : ''}`} />
        </h3>
        <div className={`${styles.contentCard} ${collapsedSections['basic'] ? styles.mobileCollapsed : ''}`}>
          <div className={styles.grid}>
            {renderField("Full Name", profile.user_name, User)}
            {renderField("Father's Name", profile.father_name, User)}
            {renderField("Date of Birth", profile.date_of_birth, Calendar)}
            {renderField("Gender", profile.gender, User)}
            {renderField("Blood Group", profile.blood_group, Droplet)}
          </div>
        </div>

        {/* Contact Details Section */}
        <h3 onClick={() => toggleSection('contact')} className={styles.categoryHeader} style={{ marginTop: '24px' }}>
          <div className={styles.categoryTitle}>
            <Phone className={styles.categoryIcon} style={{ marginRight: '8px' }} />
            Contact Details
          </div>
          <ChevronUp className={`${styles.mobileCategoryArrow} ${collapsedSections['contact'] ? styles.rotatedArrow : ''}`} />
        </h3>
        <div className={`${styles.contentCard} ${collapsedSections['contact'] ? styles.mobileCollapsed : ''}`}>
          <div className={styles.grid}>
            {renderField("Email Address", profile.email, Mail)}
            {renderField("Phone Number", profile.phone, Phone)}
            {renderField("Alternate Contact", profile.alternate_contact, Phone)}
            {renderField("Emergency Contact", profile.emergency_contact_no, Phone)}
          </div>
        </div>

        {/* Banking Info Section */}
        <h3 onClick={() => toggleSection('banking')} className={styles.categoryHeader} style={{ marginTop: '24px' }}>
          <div className={styles.categoryTitle}>
            <Building className={styles.categoryIcon} style={{ marginRight: '8px' }} />
            Banking Info
          </div>
          <ChevronUp className={`${styles.mobileCategoryArrow} ${collapsedSections['banking'] ? styles.rotatedArrow : ''}`} />
        </h3>
        <div className={`${styles.contentCard} ${collapsedSections['banking'] ? styles.mobileCollapsed : ''}`}>
          <div className={styles.grid}>
            {renderField("Bank Name", profile.bank_name, Building)}
            {renderField("Account Holder", profile.account_holder_name, User)}
            {renderField("Account Number", profile.account_number, CreditCard)}
            {renderField("IFSC Code", profile.ifsc_code, Hash)}
            {renderField("Branch City", profile.branch_city, MapPin)}
            {renderField("Branch State", profile.branch_state, MapPin)}
            {renderField("Branch Pincode", profile.branch_pincode, MapPin)}
            {renderField("Passbook / Cheque", profile.bank_passbook_url, FileText, true)}
          </div>
        </div>

        {/* Identity Docs Section */}
        <h3 onClick={() => toggleSection('identity')} className={styles.categoryHeader} style={{ marginTop: '24px' }}>
          <div className={styles.categoryTitle}>
            <FileText className={styles.categoryIcon} style={{ marginRight: '8px' }} />
            Identity Docs & Address
          </div>
          <ChevronUp className={`${styles.mobileCategoryArrow} ${collapsedSections['identity'] ? styles.rotatedArrow : ''}`} />
        </h3>
        <div className={`${styles.contentCard} ${collapsedSections['identity'] ? styles.mobileCollapsed : ''}`}>
          <div className={styles.grid}>
            {renderField("Primary Address", profile.primary_address, MapPin)}
            {renderField("Area Pincode", profile.area_pincode, MapPin)}
            {renderField("Aadhar Card No", profile.aadhar_card_no, CreditCard)}
            {renderField("PAN Card No", profile.pan_card_no, CreditCard)}
            {renderField("Aadhar Front", profile.aadhar_front_url, FileText, true)}
            {renderField("Aadhar Back", profile.aadhar_back_url, FileText, true)}
            {renderField("PAN Card Document", profile.pan_card_url, FileText, true)}
            {renderField("Qualification Marksheet", profile.qualification_marksheet_url, FileText, true)}
          </div>
        </div>

        {/* Edit Details Modal with Tabs */}
        {isEditModalOpen && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent} style={{ maxWidth: '650px' }}>
              <div className={styles.modalHeader}>
                <h2>Modify User Information</h2>
                <button className={styles.closeButton} onClick={() => setIsEditModalOpen(false)}>
                  <X size={20} />
                </button>
              </div>

              {/* Tabs list inside modal */}
              <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px', marginBottom: '20px', overflowX: 'auto' }} className="hide-scrollbar">
                {['employment', 'personal', 'contact', 'banking', 'identity'].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setEditTab(tab as any)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      background: editTab === tab ? 'rgba(255,255,255,0.08)' : 'transparent',
                      border: 'none',
                      color: editTab === tab ? '#fff' : 'rgba(255,255,255,0.4)',
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <form onSubmit={handleEditSubmit}>
                <div className={styles.formGrid}>
                  
                  {/* EMPLOYMENT TAB */}
                  {editTab === 'employment' && (
                    <>
                      <div className={styles.formGroup}>
                        <label>Employee ID</label>
                        <input 
                          type="text" 
                          name="employee_id" 
                          value={formData.employee_id} 
                          onChange={handleInputChange} 
                          className={styles.inputField}
                        />
                      </div>

                      <CustomSelect 
                        label="System Role"
                        name="role"
                        value={formData.role}
                        options={[
                          { label: 'Employee', value: 'Employee' },
                          { label: 'Agent', value: 'Agent' },
                          { label: 'HR', value: 'HR' },
                          { label: 'Admin', value: 'Admin' }
                        ]}
                        onChange={handleCustomSelectChange}
                      />

                      <CustomSelect 
                        label="Department"
                        name="department"
                        value={formData.department}
                        options={[
                          { label: 'Engineering', value: 'Engineering' },
                          { label: 'Sales', value: 'Sales' },
                          { label: 'HR & Admin', value: 'HR & Admin' },
                          { label: 'Operations', value: 'Operations' },
                          { label: 'Marketing', value: 'Marketing' }
                        ]}
                        onChange={handleCustomSelectChange}
                      />

                      <div className={styles.formGroup}>
                        <label>Designation</label>
                        <input 
                          type="text" 
                          name="designation" 
                          value={formData.designation} 
                          onChange={handleInputChange} 
                          className={styles.inputField}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>In-Hand Salary (₹)</label>
                        <input 
                          type="number" 
                          name="in_hand_salary" 
                          value={formData.in_hand_salary} 
                          onChange={handleInputChange} 
                          className={styles.inputField}
                        />
                      </div>

                      <CustomSelect 
                        label="Work Type"
                        name="work_type"
                        value={formData.work_type}
                        options={[
                          { label: 'Full Time', value: 'Full Time' },
                          { label: 'Part Time', value: 'Part Time' },
                          { label: 'Contract', value: 'Contract' },
                          { label: 'Internship', value: 'Internship' }
                        ]}
                        onChange={handleCustomSelectChange}
                      />

                      <CustomSelect 
                        label="Account Status"
                        name="status"
                        value={formData.status}
                        options={[
                          { label: 'Active', value: 'Active' },
                          { label: 'Hold', value: 'Hold' },
                          { label: 'Inactive', value: 'Inactive' }
                        ]}
                        onChange={handleCustomSelectChange}
                      />

                      <CustomSelect 
                        label="Approval Status"
                        name="approval_status"
                        value={formData.approval_status}
                        options={[
                          { label: 'Approved', value: 'Approved' },
                          { label: 'Pending', value: 'Pending' }
                        ]}
                        onChange={handleCustomSelectChange}
                      />
                    </>
                  )}

                  {/* PERSONAL TAB */}
                  {editTab === 'personal' && (
                    <>
                      <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                        <label>Full Name</label>
                        <input 
                          type="text" 
                          name="user_name" 
                          value={formData.user_name} 
                          onChange={handleInputChange} 
                          required 
                          className={styles.inputField}
                        />
                      </div>

                      <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                        <label>Father's Name</label>
                        <input 
                          type="text" 
                          name="father_name" 
                          value={formData.father_name} 
                          onChange={handleInputChange} 
                          className={styles.inputField}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>Date of Birth</label>
                        <input 
                          type="date" 
                          name="date_of_birth" 
                          value={formData.date_of_birth} 
                          onChange={handleInputChange} 
                          className={styles.inputField}
                          style={{ colorScheme: 'dark' }}
                        />
                      </div>

                      <CustomSelect 
                        label="Gender"
                        name="gender"
                        value={formData.gender}
                        options={[
                          { label: 'Male', value: 'Male' },
                          { label: 'Female', value: 'Female' },
                          { label: 'Other', value: 'Other' }
                        ]}
                        onChange={handleCustomSelectChange}
                      />

                      <CustomSelect 
                        label="Blood Group"
                        name="blood_group"
                        value={formData.blood_group}
                        options={[
                          { label: 'A+', value: 'A+' },
                          { label: 'A-', value: 'A-' },
                          { label: 'B+', value: 'B+' },
                          { label: 'B-', value: 'B-' },
                          { label: 'AB+', value: 'AB+' },
                          { label: 'AB-', value: 'AB-' },
                          { label: 'O+', value: 'O+' },
                          { label: 'O-', value: 'O-' }
                        ]}
                        onChange={handleCustomSelectChange}
                      />
                    </>
                  )}

                  {/* CONTACT TAB */}
                  {editTab === 'contact' && (
                    <>
                      <div className={styles.formGroup}>
                        <label>Phone Number</label>
                        <input 
                          type="tel" 
                          name="phone" 
                          value={formData.phone} 
                          onChange={handleInputChange} 
                          className={styles.inputField}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>Alternate Contact</label>
                        <input 
                          type="tel" 
                          name="alternate_contact" 
                          value={formData.alternate_contact} 
                          onChange={handleInputChange} 
                          className={styles.inputField}
                        />
                      </div>

                      <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                        <label>Emergency Contact</label>
                        <input 
                          type="tel" 
                          name="emergency_contact_no" 
                          value={formData.emergency_contact_no} 
                          onChange={handleInputChange} 
                          className={styles.inputField}
                        />
                      </div>
                    </>
                  )}

                  {/* BANKING TAB */}
                  {editTab === 'banking' && (
                    <>
                      <div className={styles.formGroup}>
                        <label>Bank Name</label>
                        <input 
                          type="text" 
                          name="bank_name" 
                          value={formData.bank_name} 
                          onChange={handleInputChange} 
                          className={styles.inputField}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>Account Holder Name</label>
                        <input 
                          type="text" 
                          name="account_holder_name" 
                          value={formData.account_holder_name} 
                          onChange={handleInputChange} 
                          className={styles.inputField}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>Account Number</label>
                        <input 
                          type="text" 
                          name="account_number" 
                          value={formData.account_number} 
                          onChange={handleInputChange} 
                          className={styles.inputField}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>IFSC Code</label>
                        <input 
                          type="text" 
                          name="ifsc_code" 
                          value={formData.ifsc_code} 
                          onChange={handleInputChange} 
                          className={styles.inputField}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>Branch City</label>
                        <input 
                          type="text" 
                          name="branch_city" 
                          value={formData.branch_city} 
                          onChange={handleInputChange} 
                          className={styles.inputField}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>Branch State</label>
                        <input 
                          type="text" 
                          name="branch_state" 
                          value={formData.branch_state} 
                          onChange={handleInputChange} 
                          className={styles.inputField}
                        />
                      </div>

                      <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                        <label>Branch Pincode</label>
                        <input 
                          type="text" 
                          name="branch_pincode" 
                          value={formData.branch_pincode} 
                          onChange={handleInputChange} 
                          className={styles.inputField}
                        />
                      </div>
                    </>
                  )}

                  {/* IDENTITY TAB */}
                  {editTab === 'identity' && (
                    <>
                      <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                        <label>Primary Address</label>
                        <input 
                          type="text" 
                          name="primary_address" 
                          value={formData.primary_address} 
                          onChange={handleInputChange} 
                          className={styles.inputField}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>Area Pincode</label>
                        <input 
                          type="text" 
                          name="area_pincode" 
                          value={formData.area_pincode} 
                          onChange={handleInputChange} 
                          className={styles.inputField}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>Aadhar Card Number</label>
                        <input 
                          type="text" 
                          name="aadhar_card_no" 
                          value={formData.aadhar_card_no} 
                          onChange={handleInputChange} 
                          className={styles.inputField}
                        />
                      </div>

                      <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                        <label>PAN Card Number</label>
                        <input 
                          type="text" 
                          name="pan_card_no" 
                          value={formData.pan_card_no} 
                          onChange={handleInputChange} 
                          className={styles.inputField}
                        />
                      </div>
                    </>
                  )}

                </div>

                <div className={styles.formActions}>
                  <button type="button" className={`${styles.actionButton} ${styles.secondaryBtn}`} onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                  <button type="submit" disabled={actionLoading} className={`${styles.actionButton} ${styles.primaryBtn}`}>
                    {actionLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <Footer />
      <div className="bottom-left-pattern" />
      
      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
