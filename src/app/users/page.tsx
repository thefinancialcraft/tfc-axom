'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, UserPlus, Edit2, Trash2, X, Plus, Shield, Briefcase, Mail, Phone, IndianRupee, Loader2, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { createAuthUserAdmin, deleteAuthUserAdmin, updateUserProfileAdmin } from '@/app/actions/auth';
import AuthHashCleaner from '@/components/AuthHashCleaner';
import TwinklingStars from '@/components/TwinklingStars';
import LogoutButton from '@/components/LogoutButton';
import Footer from '@/components/Footer';
import styles from './users.module.css';

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
  in_hand_salary: number | null;
  profile_pic_url: string | null;
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
      <div className={styles.customSelectWrapper}>
        <div 
          className={`${styles.customSelectTrigger} ${isOpen ? styles.customSelectTriggerActive : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>{selectedOption ? selectedOption.label : placeholder}</span>
          <ChevronDown size={16} style={{ transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', opacity: 0.7 }} />
        </div>
        {isOpen && (
          <div className={styles.customSelectOptions}>
            {options.map(opt => (
              <div 
                key={opt.value}
                className={`${styles.customSelectOption} ${opt.value === value ? styles.customSelectOptionSelected : ''}`}
                onClick={() => {
                  onChange(name, opt.value);
                  setIsOpen(false);
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

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Search & filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    user_name: '',
    email: '',
    phone: '',
    password: '',
    employee_id: '',
    role: 'Employee',
    work_type: 'Full Time',
    department: 'Engineering',
    designation: 'Software Engineer',
    in_hand_salary: '',
    status: 'Active',
    approval_status: 'Approved'
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      alert('Failed to load user profiles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenAddModal = () => {
    setFormData({
      user_name: '',
      email: '',
      phone: '',
      password: '',
      employee_id: '',
      role: 'Employee',
      work_type: 'Full Time',
      department: 'Engineering',
      designation: 'Software Engineer',
      in_hand_salary: '',
      status: 'Active',
      approval_status: 'Approved'
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (user: UserProfile) => {
    setSelectedUser(user);
    setFormData({
      user_name: user.user_name || '',
      email: user.email || '',
      phone: user.phone || '',
      password: '', 
      employee_id: user.employee_id || '',
      role: user.role || 'Employee',
      work_type: user.work_type || 'Full Time',
      department: user.department || 'Engineering',
      designation: user.designation || 'Software Engineer',
      in_hand_salary: user.in_hand_salary?.toString() || '',
      status: user.status || 'Active',
      approval_status: user.approval_status || 'Approved'
    });
    setIsEditModalOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await createAuthUserAdmin({
        email: formData.email,
        phone: formData.phone || undefined,
        user_name: formData.user_name,
        password: formData.password || undefined,
        role: formData.role,
        employee_id: formData.employee_id || undefined,
        department: formData.department,
        designation: formData.designation,
        in_hand_salary: formData.in_hand_salary ? parseFloat(formData.in_hand_salary) : undefined,
        work_type: formData.work_type,
        status: formData.status,
        approval_status: formData.approval_status,
      });

      if (!res.success) {
        throw new Error(res.error || 'Failed to create user');
      }

      alert('User created successfully!');
      setIsAddModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error occurred during creation.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      const res = await updateUserProfileAdmin(selectedUser.user_id, {
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
      });

      if (!res.success) {
        throw new Error(res.error || 'Failed to update profile');
      }

      alert('User updated successfully!');
      setIsEditModalOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error occurred during profile update.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete ${userName}? This action is permanent.`)) return;
    setActionLoading(true);
    try {
      const res = await deleteAuthUserAdmin(userId);
      if (!res.success) {
        throw new Error(res.error || 'Failed to delete user');
      }
      alert('User deleted successfully!');
      fetchUsers();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error deleting user.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.user_name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase()) ||
      user.employee_id?.toLowerCase().includes(search.toLowerCase());

    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesStatus = !statusFilter || user.status === statusFilter;
    const matchesDept = !deptFilter || user.department === deptFilter;

    return matchesSearch && matchesRole && matchesStatus && matchesDept;
  });

  // Calculate statistics
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'Active').length;
  const approvedUsers = users.filter(u => u.approval_status === 'Approved').length;
  const pendingUsers = users.filter(u => u.approval_status === 'Pending' || u.approval_status === null || u.approval_status === '').length;

  const statCardsData = [
    { label: 'Total Users', value: totalUsers, subtitle: 'REGISTERED', image: '/chkin.png', color: 'rgb(255, 255, 255)' },
    { label: 'Active Users', value: activeUsers, subtitle: 'ON DUTY', image: '/chkout.png', color: 'rgb(74, 222, 128)' },
    { label: 'Approved', value: approvedUsers, subtitle: 'VERIFIED', image: '/brktime.png', color: 'rgb(96, 165, 250)' },
    { label: 'Pending', value: pendingUsers, subtitle: 'APPROVAL REQUIRED', image: '/fnlst.png', color: 'rgb(250, 204, 21)' }
  ];

  const renderCard = (card: typeof statCardsData[0], idx: number, isCarousel = false) => (
    <div 
      key={idx}
      className="carousel-card" 
      style={{ 
        backgroundColor: 'rgb(54, 54, 54)', 
        borderRadius: '24px', 
        padding: '20px 20px 20px 10px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'flex-start', 
        boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 15px', 
        position: 'relative', 
        clipPath: 'inset(-200px -200px 0px)',
        overflow: 'hidden',
        height: '170px',
        width: isCarousel ? '300px' : '100%', 
        minWidth: isCarousel ? '300px' : 'auto' 
      }}
    >
      {/* Top Right Pattern */}
      <div style={{ position: 'absolute', inset: '0px', borderRadius: '24px', overflow: 'hidden', zIndex: 0 }}>
        <div className="top-right-pattern" style={{ opacity: 0.15, right: 'auto', left: '-20px', top: '-20px' }}></div>
      </div>

      {/* Meteors */}
      <div style={{ position: 'absolute', inset: '0px', pointerEvents: 'none', zIndex: 0, overflow: 'hidden', borderRadius: 'inherit' }}>
        <div className="meteor-falling" style={{ position: 'absolute', top: '-15px', right: '25%', width: '3px', height: '100px', transformOrigin: 'center bottom', '--m-scale': 1, '--m-opacity': 0.6, '--m-duration': '4s', '--m-delay': '1s' } as React.CSSProperties}>
          <div style={{ position: 'absolute', inset: '0px', background: 'linear-gradient(transparent, rgba(255, 255, 255, 0.6))', borderRadius: '10px' }}></div>
          <div style={{ position: 'absolute', bottom: '-12px', left: '50%', transform: 'translateX(-50%)', width: '4px', height: '4px', backgroundColor: 'rgb(255, 255, 255)', borderRadius: '50%' }}></div>
        </div>
        <div className="meteor-falling" style={{ position: 'absolute', top: '15px', right: '35%', width: '3px', height: '70px', transformOrigin: 'center bottom', '--m-scale': 0.7, '--m-opacity': 0.4, '--m-duration': '5s', '--m-delay': '2.5s' } as React.CSSProperties}>
          <div style={{ position: 'absolute', inset: '0px', background: 'linear-gradient(transparent, rgba(255, 255, 255, 0.6))', borderRadius: '10px' }}></div>
          <div style={{ position: 'absolute', bottom: '-12px', left: '50%', transform: 'translateX(-50%)', width: '4px', height: '4px', backgroundColor: 'rgb(255, 255, 255)', borderRadius: '50%' }}></div>
        </div>
        <div className="meteor-falling" style={{ position: 'absolute', top: '-30px', right: '15%', width: '3px', height: '80px', transformOrigin: 'center bottom', '--m-scale': 0.8, '--m-opacity': 0.5, '--m-duration': '6s', '--m-delay': '4s' } as React.CSSProperties}>
          <div style={{ position: 'absolute', inset: '0px', background: 'linear-gradient(transparent, rgba(255, 255, 255, 0.6))', borderRadius: '10px' }}></div>
          <div style={{ position: 'absolute', bottom: '-12px', left: '50%', transform: 'translateX(-50%)', width: '4px', height: '4px', backgroundColor: 'rgb(255, 255, 255)', borderRadius: '50%' }}></div>
        </div>
      </div>

      {/* Left Side Grayscale Image */}
      <div style={{ flexShrink: 0, marginLeft: '-55px', zIndex: 2, position: 'relative', marginTop: '-10px' }}>
        <img alt={card.label} src={card.image} style={{ width: 'auto', height: '160px', objectFit: 'contain', filter: 'grayscale(100%)' }} />
      </div>

      {/* Title Top Right */}
      <div style={{ position: 'absolute', top: '16px', right: '20px', zIndex: 3 }}>
        <span style={{ color: 'var(--text-color)', fontSize: '13px', fontWeight: '500' }}>{card.label}</span>
      </div>

      {/* Bottom Glassmorphic Status Bar */}
      <div 
        style={{ 
          position: 'absolute', 
          bottom: '0px', 
          left: '0px', 
          right: '0px', 
          height: '60px', 
          background: 'linear-gradient(to right, transparent 0%, transparent 20%, rgba(255, 255, 255, 0.1) 70%)', 
          backdropFilter: 'blur(10px)', 
          WebkitBackdropFilter: 'blur(10px)',
          maskImage: 'linear-gradient(to right, transparent 0%, transparent 20%, black 70%)', 
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, transparent 20%, black 70%)', 
          borderTop: '1px solid rgba(255, 255, 255, 0.15)', 
          zIndex: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'flex-end', 
          padding: '0px 20px', 
          borderBottomLeftRadius: '24px', 
          borderBottomRightRadius: '24px' 
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', zIndex: 3, marginTop: '2px' }}>
          <span style={{ color: 'var(--text-color)', fontSize: '24px', fontWeight: '500', lineHeight: 1.1 }}>{card.value}</span>
          <span style={{ color: card.color, fontSize: '9px', fontWeight: '500', letterSpacing: '0.5px', marginTop: '2px' }}>{card.subtitle}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden', width: '100%', paddingBottom: '100px' }}>
      <AuthHashCleaner />
      <TwinklingStars density="low" />
      <div className="top-right-pattern" />
      <LogoutButton />

      <div className={styles.container}>
        {/* Header */}
        <div className={styles.headerSection} style={{ padding: '90px 0 20px 0' }}>
          <div className={styles.titleGroup}>
            <h1>User Management</h1>
            <p>Create, update, and manage employee profiles and application access.</p>
          </div>
          <button className={styles.addButton} onClick={handleOpenAddModal}>
            <UserPlus size={16} />
            <span>Add New User</span>
          </button>
        </div>

        {/* Mobile Stats Cards Carousels */}
        <div className="mobile-only" style={{ marginTop: '16px', marginBottom: '24px' }}>
          <div className="carousel-container hide-scrollbar" style={{ paddingBottom: '16px' }}>
            {statCardsData.slice(0, 2).map((card, idx) => renderCard(card, idx, true))}
          </div>
          <div className="carousel-container hide-scrollbar" style={{ marginTop: '-24px', paddingBottom: '16px' }}>
            {statCardsData.slice(2, 4).map((card, idx) => renderCard(card, idx + 2, true))}
          </div>
        </div>

        {/* Desktop Stats Cards Grid */}
        <div className="desktop-only" style={{ marginBottom: '32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
            {statCardsData.map((card, idx) => renderCard(card, idx, false))}
          </div>
        </div>

        {/* Controls / Filter Section */}
        <div className={styles.controlsSection}>
          <div className={styles.searchWrapper}>
            <Search size={18} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search by name, email, employee ID..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className={styles.searchInput}
            />
          </div>
          
          <CustomSelect 
            value={roleFilter} 
            placeholder="All Roles"
            options={[
              { label: 'All Roles', value: '' },
              { label: 'Admin', value: 'Admin' },
              { label: 'Employee', value: 'Employee' },
              { label: 'Agent', value: 'Agent' },
              { label: 'HR', value: 'HR' }
            ]}
            onChange={(name, value) => setRoleFilter(value)}
            name="roleFilter"
            style={{ minWidth: '160px' }}
          />

          <CustomSelect 
            value={statusFilter} 
            placeholder="All Statuses"
            options={[
              { label: 'All Statuses', value: '' },
              { label: 'Active', value: 'Active' },
              { label: 'Hold', value: 'Hold' },
              { label: 'Inactive', value: 'Inactive' }
            ]}
            onChange={(name, value) => setStatusFilter(value)}
            name="statusFilter"
            style={{ minWidth: '160px' }}
          />

          <CustomSelect 
            value={deptFilter} 
            placeholder="All Departments"
            options={[
              { label: 'All Departments', value: '' },
              { label: 'Engineering', value: 'Engineering' },
              { label: 'Sales', value: 'Sales' },
              { label: 'HR & Admin', value: 'HR & Admin' },
              { label: 'Operations', value: 'Operations' },
              { label: 'Marketing', value: 'Marketing' }
            ]}
            onChange={(name, value) => setDeptFilter(value)}
            name="deptFilter"
            style={{ minWidth: '170px' }}
          />
        </div>

        {/* Users Grid */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', color: 'rgba(255,255,255,0.4)', gap: '8px' }}>
            <Loader2 className="spin" size={24} />
            <span>Loading profiles...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '300px', color: 'rgba(255,255,255,0.3)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '20px' }}>
            <span>No users found.</span>
          </div>
        ) : (
          <div className={styles.userGrid}>
            {filteredUsers.map(user => {
              const statusClass = 
                user.status === 'Active' ? styles.statusBadgeActive :
                user.status === 'Hold' ? styles.statusBadgeHold : styles.statusBadgeInactive;

              return (
                <Link key={user.user_id} href={`/users/${user.user_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className={styles.userCard}>
                    <div className={styles.cardHeader}>
                      <div className={styles.avatarWrapper}>
                        <img 
                          src={user.profile_pic_url || "/dm-hr.png"} 
                          alt={user.user_name} 
                          className={styles.avatar}
                        />
                      </div>
                      <div className={styles.infoSection}>
                        <h3 className={styles.userName}>{user.user_name}</h3>
                        <p className={styles.userEmail}>{user.email}</p>
                      </div>
                    </div>

                    <div className={styles.badgeGroup}>
                      <span className={`${styles.badge} ${styles.roleBadge}`}>
                        {user.role || 'Employee'}
                      </span>
                      <span className={`${styles.badge} ${statusClass}`}>
                        {user.status || 'Active'}
                      </span>
                    </div>

                    <div className={styles.detailsGrid}>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Employee ID</span>
                        <span className={styles.detailValue}>{user.employee_id || 'TFC-N/A'}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Department</span>
                        <span className={styles.detailValue}>{user.department || 'N/A'}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Designation</span>
                        <span className={styles.detailValue}>{user.designation || 'N/A'}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Salary</span>
                        <span className={styles.detailValue}>
                          {user.in_hand_salary ? `₹${user.in_hand_salary.toLocaleString()}` : '₹0'}
                        </span>
                      </div>
                    </div>

                    <div className={styles.cardActions}>
                      <button 
                        className={styles.editBtn} 
                        onClick={(e) => { 
                          e.preventDefault(); 
                          e.stopPropagation(); 
                          handleOpenEditModal(user); 
                        }}
                      >
                        <Edit2 size={14} />
                        <span>Edit</span>
                      </button>
                      <button 
                        className={styles.deleteBtn} 
                        onClick={(e) => { 
                          e.preventDefault(); 
                          e.stopPropagation(); 
                          handleDeleteUser(user.user_id, user.user_name); 
                        }}
                        disabled={actionLoading}
                      >
                        <Trash2 size={14} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Add User Modal */}
        {isAddModalOpen && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h2>Add New Employee</h2>
                <button className={styles.closeButton} onClick={() => setIsAddModalOpen(false)}>
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAddSubmit}>
                <div className={styles.modalBody}>
                  <div className={styles.formGrid}>
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

                    <div className={styles.formGroup}>
                      <label>Email Address</label>
                      <input 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleInputChange} 
                        required 
                        className={styles.inputField}
                      />
                    </div>

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
                      <label>Temporary Password</label>
                      <input 
                        type="password" 
                        name="password" 
                        placeholder="Min 6 characters" 
                        value={formData.password} 
                        onChange={handleInputChange} 
                        required 
                        className={styles.inputField}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Employee ID</label>
                      <input 
                        type="text" 
                        name="employee_id" 
                        value={formData.employee_id} 
                        onChange={handleInputChange} 
                        placeholder="e.g., TFC-012" 
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
                      onChange={(name, value) => setFormData(prev => ({ ...prev, [name]: value }))}
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
                      onChange={(name, value) => setFormData(prev => ({ ...prev, [name]: value }))}
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
                      onChange={(name, value) => setFormData(prev => ({ ...prev, [name]: value }))}
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
                      onChange={(name, value) => setFormData(prev => ({ ...prev, [name]: value }))}
                    />
                  </div>

                  <div className={styles.formActions}>
                    <button type="button" className={styles.cancelBtn} onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                    <button type="submit" disabled={actionLoading} className={styles.submitBtn}>
                      {actionLoading ? 'Creating...' : 'Create Employee'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {isEditModalOpen && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h2>Edit Employee Profile</h2>
                <button className={styles.closeButton} onClick={() => setIsEditModalOpen(false)}>
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleEditSubmit}>
                <div className={styles.modalBody}>
                  <div className={styles.formGrid}>
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

                    <div className={styles.formGroup}>
                      <label>Email Address (Read Only)</label>
                      <input 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        disabled
                        style={{ opacity: 0.6, cursor: 'not-allowed' }}
                        className={styles.inputField}
                      />
                    </div>

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
                      onChange={(name, value) => setFormData(prev => ({ ...prev, [name]: value }))}
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
                      onChange={(name, value) => setFormData(prev => ({ ...prev, [name]: value }))}
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
                      onChange={(name, value) => setFormData(prev => ({ ...prev, [name]: value }))}
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
                      onChange={(name, value) => setFormData(prev => ({ ...prev, [name]: value }))}
                    />
                  </div>

                  <div className={styles.formActions}>
                    <button type="button" className={styles.cancelBtn} onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                    <button type="submit" disabled={actionLoading} className={styles.submitBtn}>
                      {actionLoading ? 'Updating...' : 'Update Details'}
                    </button>
                  </div>
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
