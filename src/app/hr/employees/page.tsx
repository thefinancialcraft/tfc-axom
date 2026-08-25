'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';
import { Search, LayoutGrid, List, ChevronDown, TrendingUp, PieChart, UserPlus } from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  employee_id: string;
  role: string;
  department: string;
  designation: string;
  status: 'Active' | 'Probation' | 'On Notice' | 'On PIP';
  email: string;
  phone: string;
  avatar_url?: string;
}

export default function HREmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'All' | 'Active' | 'Probation' | 'On Notice' | 'On PIP'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [timePeriod, setTimePeriod] = useState<'This Month' | 'Last Quarter' | 'This Year'>('This Month');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    async function loadEmployees() {
      try {
        const { data: dbProfiles } = await supabase
          .from('user_profiles')
          .select('*');

        let loaded: Employee[] = [];

        if (dbProfiles && dbProfiles.length > 0) {
          loaded = dbProfiles.map((p: any, idx: number) => ({
            id: p.user_id || `emp-${idx}`,
            name: p.user_name || p.full_name || 'Employee',
            employee_id: p.employee_id || p.employeeId || `TFC-00${idx + 1}`,
            role: p.role || 'Member',
            department: p.department || 'Operations',
            designation: p.designation || 'Specialist',
            status: (p.status as any) || (idx % 4 === 1 ? 'Probation' : idx % 7 === 2 ? 'On Notice' : idx % 11 === 3 ? 'On PIP' : 'Active'),
            email: p.email || '',
            phone: p.phone || '',
            avatar_url: p.profile_pic_url || undefined
          }));
        }

        const sampleEmployees: Employee[] = [
          { id: '1', name: 'Rahul Sharma', employee_id: 'TFC-011', role: 'Employee', department: 'Development', designation: 'Senior Frontend Engineer', status: 'Active', email: 'rahul.s@tfc.com', phone: '+91 98765 43210' },
          { id: '2', name: 'Priya Patel', employee_id: 'TFC-012', role: 'Employee', department: 'UI/UX Design', designation: 'Lead Product Designer', status: 'Active', email: 'priya.p@tfc.com', phone: '+91 98765 43211' },
          { id: '3', name: 'Aman Verma', employee_id: 'TFC-015', role: 'Employee', department: 'Quality Assurance', designation: 'QA Specialist', status: 'Probation', email: 'aman.v@tfc.com', phone: '+91 98765 43212' },
          { id: '4', name: 'Sneha Roy', employee_id: 'TFC-018', role: 'Employee', department: 'Marketing', designation: 'Content Strategist', status: 'Probation', email: 'sneha.r@tfc.com', phone: '+91 98765 43213' },
          { id: '5', name: 'Vikram Singh', employee_id: 'TFC-009', role: 'Employee', department: 'Backend Engineering', designation: 'System Architect', status: 'On Notice', email: 'vikram.s@tfc.com', phone: '+91 98765 43214' },
          { id: '6', name: 'Ananya Das', employee_id: 'TFC-022', role: 'Employee', department: 'HR & Ops', designation: 'HR Generalist', status: 'On PIP', email: 'ananya.d@tfc.com', phone: '+91 98765 43215' },
          { id: '7', name: 'Karan Malhotra', employee_id: 'TFC-025', role: 'Employee', department: 'Sales', designation: 'Account Executive', status: 'Active', email: 'karan.m@tfc.com', phone: '+91 98765 43216' },
          { id: '8', name: 'Neha Gupta', employee_id: 'TFC-028', role: 'Employee', department: 'Customer Support', designation: 'Support Lead', status: 'On PIP', email: 'neha.g@tfc.com', phone: '+91 98765 43217' }
        ];

        const combined = [...loaded, ...sampleEmployees.filter(s => !loaded.some(l => l.employee_id === s.employee_id))];
        setEmployees(combined);
      } catch (err) {
        console.error('Error loading employees:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadEmployees();
  }, []);

  const totalEmployees = employees.length;
  const activeCount = employees.filter(e => e.status === 'Active').length;
  const probationCount = employees.filter(e => e.status === 'Probation').length;
  const noticeCount = employees.filter(e => e.status === 'On Notice').length;
  const pipCount = employees.filter(e => e.status === 'On PIP').length;

  const statCardsData = [
    { key: 'All', label: 'Total Employee', value: totalEmployees, subtitle: 'REGISTERED STAFF', image: '/chkin.png', color: 'rgb(255, 255, 255)' },
    { key: 'Probation', label: 'Probation', value: probationCount, subtitle: 'EVALUATION PERIOD', image: '/brktime.png', color: 'rgb(250, 204, 21)' },
    { key: 'On Notice', label: 'On Notice', value: noticeCount, subtitle: 'OFFBOARDING PHASE', image: '/fnlst.png', color: 'rgb(249, 115, 22)' },
    { key: 'On PIP', label: 'On PIP', value: pipCount, subtitle: 'PERFORMANCE REVIEW', image: '/brktime.png', color: 'rgb(248, 113, 113)' }
  ];

  const renderCard = (card: typeof statCardsData[0], idx: number, isCarousel = false) => {
    const isSelected = activeTab === card.key;
    return (
      <div 
        key={idx}
        className="carousel-card" 
        onClick={() => setActiveTab(card.key as any)}
        style={{ 
          backgroundColor: 'rgb(54, 54, 54)', 
          borderRadius: '24px', 
          padding: '20px 20px 20px 10px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'flex-start', 
          boxShadow: isSelected ? '0 8px 25px rgba(0, 0, 0, 0.4), 0 0 0 2px rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.1) 0px 4px 15px', 
          position: 'relative', 
          clipPath: 'inset(-200px -200px 0px)',
          overflow: 'hidden',
          height: '170px',
          width: isCarousel ? '300px' : '100%', 
          minWidth: isCarousel ? '300px' : 'auto',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          transform: isSelected ? 'translateY(-2px)' : 'none'
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
            <span style={{ color: 'var(--text-color)', fontSize: '24px', fontWeight: '500', lineHeight: 1.1 }}>{isLoading ? '...' : card.value}</span>
            <span style={{ color: card.color, fontSize: '9px', fontWeight: '500', letterSpacing: '0.5px', marginTop: '2px' }}>{card.subtitle}</span>
          </div>
        </div>
      </div>
    );
  };

  const filteredEmployees = employees.filter(e => {
    const matchesTab = activeTab === 'All' || e.status === activeTab;
    const matchesSearch = 
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.employee_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.designation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'Active':
        return { bg: 'rgba(52, 187, 136, 0.12)', color: '#34BB88', border: '1px solid rgba(52, 187, 136, 0.25)' };
      case 'Probation':
        return { bg: 'rgba(245, 158, 11, 0.12)', color: '#F59E0B', border: '1px solid rgba(245, 158, 11, 0.25)' };
      case 'On Notice':
        return { bg: 'rgba(249, 115, 22, 0.12)', color: '#F97316', border: '1px solid rgba(249, 115, 22, 0.25)' };
      case 'On PIP':
        return { bg: 'rgba(239, 68, 68, 0.12)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.25)' };
      default:
        return { bg: 'rgba(255, 255, 255, 0.08)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.15)' };
    }
  };

  // Department Distribution data
  const deptDistributionData = [
    { department: 'Sales & Business', count: 72, percent: 58, color: '#3B82F6', barGradient: 'linear-gradient(90deg, #3B82F6 0%, #60A5FA 100%)' },
    { department: 'Operations & Delivery', count: 31, percent: 25, color: '#34BB88', barGradient: 'linear-gradient(90deg, #34BB88 0%, #4ADE80 100%)' },
    { department: 'HR & Management', count: 12, percent: 10, color: '#F59E0B', barGradient: 'linear-gradient(90deg, #F59E0B 0%, #FBBF24 100%)' },
    { department: 'Accounts & Finance', count: 9, percent: 7, color: '#EC4899', barGradient: 'linear-gradient(90deg, #EC4899 0%, #F472B6 100%)' }
  ];

  return (
    <main className="page-fade-in" style={{ position: 'relative', width: '100%', paddingBottom: '100px' }}>
      <Header
        category="H.R & Management"
        title="Employees Overview"
        description="Monitor staff metrics, probation status, notice periods, and performance improvement plans."
        actionButton={
          <Link
            href="/users/add"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.03))',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '14px',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: '500',
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)'
            }}
          >
            <UserPlus size={16} />
            <span>Add Employee</span>
          </Link>
        }
      />

      {/* STAT TILES - MOBILE CAROUSEL */}
      <div className="mobile-only" style={{ marginTop: '24px', marginBottom: '24px', padding: '0 24px' }}>
        <div className="carousel-container hide-scrollbar" style={{ paddingBottom: '16px', display: 'flex', gap: '16px', overflowX: 'auto' }}>
          {statCardsData.slice(0, 2).map((card, idx) => renderCard(card, idx, true))}
        </div>
        <div className="carousel-container hide-scrollbar" style={{ marginTop: '8px', paddingBottom: '16px', display: 'flex', gap: '16px', overflowX: 'auto' }}>
          {statCardsData.slice(2, 4).map((card, idx) => renderCard(card, idx + 2, true))}
        </div>
      </div>

      {/* STAT TILES - DESKTOP GRID */}
      <div className="desktop-only" style={{ padding: '0 24px', marginTop: '24px', marginBottom: '32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {statCardsData.map((card, idx) => renderCard(card, idx, false))}
        </div>
      </div>

      {/* WORKFORCE OVERVIEW ANALYTICS SECTION */}
      <div style={{ padding: '0 24px', marginTop: '42px', marginBottom: '44px' }}>
        {/* Analytics Top Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#FFFFFF', margin: 0 }}>Workforce Overview</h2>
            <span style={{
              fontSize: '11px', fontWeight: '600', color: '#34BB88',
              background: 'rgba(52, 187, 136, 0.12)', border: '1px solid rgba(52, 187, 136, 0.25)',
              padding: '4px 10px', borderRadius: '20px'
            }}>
              Realtime Analytics
            </span>
          </div>

          {/* Time Period Selector Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                transition: 'all 0.2s ease'
              }}
            >
              <span>{timePeriod}</span>
              <ChevronDown size={14} style={{ color: 'rgba(255, 255, 255, 0.6)', transform: isDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
            </button>

            {isDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                width: '150px',
                background: '#222222',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '6px',
                zIndex: 99,
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
              }}>
                {(['This Month', 'Last Quarter', 'This Year'] as const).map(option => (
                  <button
                    key={option}
                    onClick={() => {
                      setTimePeriod(option);
                      setIsDropdownOpen(false);
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 12px',
                      background: timePeriod === option ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      color: timePeriod === option ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)',
                      fontSize: '12px',
                      fontWeight: timePeriod === option ? '600' : '400',
                      cursor: 'pointer',
                      transition: 'background 0.2s ease'
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 2 ANALYTIC CARDS GRID */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '20px'
        }}>
          {/* ANALYTIC CARD 1: Workforce Trend */}
          <div style={{
            background: 'rgb(54, 54, 54)',
            borderRadius: '24px',
            padding: '24px',
            boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 15px',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            {/* Top Pattern Overlay */}
            <div style={{ position: 'absolute', inset: 0, borderRadius: '24px', overflow: 'hidden', pointerEvents: 'none' }}>
              <div className="top-right-pattern" style={{ opacity: 0.1, right: '-20px', top: '-20px' }}></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: 'rgba(52, 187, 136, 0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#34BB88'
                }}>
                  <TrendingUp size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#FFFFFF', margin: 0 }}>Workforce Trend</h3>
                  <p style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', margin: '2px 0 0 0' }}>Headcount growth analysis</p>
                </div>
              </div>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#34BB88', background: 'rgba(52, 187, 136, 0.12)', padding: '4px 10px', borderRadius: '12px' }}>
                +8.4%
              </span>
            </div>

            {/* SVG Trend Chart */}
            <div style={{ width: '100%', height: '140px', position: 'relative', margin: '10px 0' }}>
              <svg width="100%" height="100%" viewBox="0 0 400 150" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                <defs>
                  <linearGradient id="workforceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34BB88" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#34BB88" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Area fill */}
                <path 
                  d="M 20 110 C 50 102, 50 95, 80 95 C 110 95, 110 75, 140 75 C 170 75, 170 65, 200 65 C 230 65, 230 45, 260 45 C 290 45, 290 35, 320 35 C 350 35, 350 20, 380 20 L 380 140 L 20 140 Z" 
                  fill="url(#workforceGradient)" 
                />

                {/* Curve stroke */}
                <path 
                  d="M 20 110 C 50 102, 50 95, 80 95 C 110 95, 110 75, 140 75 C 170 75, 170 65, 200 65 C 230 65, 230 45, 260 45 C 290 45, 290 35, 320 35 C 350 35, 350 20, 380 20" 
                  fill="none" 
                  stroke="#34BB88" 
                  strokeWidth="3" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />

                {/* Data Points */}
                {[[20, 110], [80, 95], [140, 75], [200, 65], [260, 45], [320, 35], [380, 20]].map(([cx, cy], i) => (
                  <circle key={i} cx={cx} cy={cy} r="4" fill="#FFFFFF" stroke="#34BB88" strokeWidth="2" />
                ))}
              </svg>
            </div>

            {/* X-Axis Months */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 5px' }}>
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'].map((m, i) => (
                <span key={i} style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '11px', fontWeight: '500' }}>{m}</span>
              ))}
            </div>
          </div>

          {/* ANALYTIC CARD 2: Department Distribution */}
          <div style={{
            background: 'rgb(54, 54, 54)',
            borderRadius: '24px',
            padding: '24px',
            boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 15px',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            {/* Top Pattern Overlay */}
            <div style={{ position: 'absolute', inset: 0, borderRadius: '24px', overflow: 'hidden', pointerEvents: 'none' }}>
              <div className="top-right-pattern" style={{ opacity: 0.1, right: '-20px', top: '-20px' }}></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: 'rgba(59, 130, 246, 0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#3B82F6'
                }}>
                  <PieChart size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#FFFFFF', margin: 0 }}>Department Distribution</h3>
                  <p style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', margin: '2px 0 0 0' }}>Breakdown by department</p>
                </div>
              </div>
              <span style={{ fontSize: '12px', fontWeight: '600', color: 'rgba(255, 255, 255, 0.8)', background: 'rgba(255, 255, 255, 0.08)', padding: '4px 10px', borderRadius: '12px' }}>
                124 Staff
              </span>
            </div>

            {/* Department Progress Bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', zIndex: 1 }}>
              {deptDistributionData.map(dept => (
                <div key={dept.department}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', fontSize: '12px' }}>
                    <span style={{ color: '#FFFFFF', fontWeight: '500' }}>{dept.department}</span>
                    <span style={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: '600' }}>
                      {dept.count} <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)', fontWeight: '400', marginLeft: '4px' }}>({dept.percent}%)</span>
                    </span>
                  </div>
                  {/* Progress track */}
                  <div style={{ width: '100%', height: '8px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.08)', overflow: 'hidden' }}>
                    <div style={{
                      width: `${dept.percent}%`,
                      height: '100%',
                      background: dept.barGradient,
                      borderRadius: '10px',
                      transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FILTER TABS, SEARCH & VIEW TOGGLE */}
      <div style={{ padding: '0 24px', marginTop: '28px' }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '16px',
          padding: '12px 16px'
        }}>
          {/* Status Filter Buttons */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {(['All', 'Active', 'Probation', 'On Notice', 'On PIP'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '9px 18px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: activeTab === tab ? '600' : '400',
                  color: activeTab === tab ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)',
                  background: activeTab === tab ? '#363636' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {tab} {tab === 'All' ? `(${totalEmployees})` : tab === 'Active' ? `(${activeCount})` : tab === 'Probation' ? `(${probationCount})` : tab === 'On Notice' ? `(${noticeCount})` : `(${pipCount})`}
              </button>
            ))}
          </div>

          {/* Search Box & View Mode Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', maxWidth: '340px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255, 255, 255, 0.4)' }} />
              <input
                type="text"
                placeholder="Search employee, ID, role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
            </div>

            {/* Grid & Table / List View Toggle */}
            <div style={{
              display: 'flex',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              padding: '3px',
              gap: '2px'
            }}>
              <button
                onClick={() => setViewMode('grid')}
                title="Grid View"
                style={{
                  padding: '7px 10px',
                  borderRadius: '8px',
                  border: 'none',
                  background: viewMode === 'grid' ? '#363636' : 'transparent',
                  color: viewMode === 'grid' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode('table')}
                title="Table View"
                style={{
                  padding: '7px 10px',
                  borderRadius: '8px',
                  border: 'none',
                  background: viewMode === 'table' ? '#363636' : 'transparent',
                  color: viewMode === 'table' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* EMPLOYEE DIRECTORY (GRID OR TABLE) */}
      <div style={{ padding: '0 24px', marginTop: '20px' }}>
        {viewMode === 'grid' ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '16px'
          }}>
            {filteredEmployees.map(emp => {
              const badge = getStatusBadgeStyle(emp.status);
              return (
                <div
                  key={emp.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '18px',
                    padding: '20px',
                    backdropFilter: 'blur(12px)',
                    transition: 'transform 0.2s ease, border-color 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        fontWeight: '700',
                        color: '#FFFFFF',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        overflow: 'hidden'
                      }}>
                        {emp.avatar_url ? (
                          <img src={emp.avatar_url} alt={emp.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          emp.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#FFFFFF' }}>{emp.name}</h3>
                        <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>{emp.designation}</p>
                      </div>
                    </div>

                    <span style={{
                      fontSize: '11px',
                      fontWeight: '600',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      background: badge.bg,
                      color: badge.color,
                      border: badge.border,
                      whiteSpace: 'nowrap'
                    }}>
                      {emp.status}
                    </span>
                  </div>

                  <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ color: 'rgba(255, 255, 255, 0.4)' }}>Employee ID:</span>
                      <span style={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: '500' }}>{emp.employee_id}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ color: 'rgba(255, 255, 255, 0.4)' }}>Department:</span>
                      <span style={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: '500' }}>{emp.department}</span>
                    </div>
                    {emp.email && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                        <span style={{ color: 'rgba(255, 255, 255, 0.4)' }}>Email:</span>
                        <span style={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: '500' }}>{emp.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '20px',
            overflow: 'hidden',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)'
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <th style={{ padding: '16px 20px', color: 'rgba(255, 255, 255, 0.4)', fontWeight: '600', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Employee</th>
                    <th style={{ padding: '16px 20px', color: 'rgba(255, 255, 255, 0.4)', fontWeight: '600', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Employee ID</th>
                    <th style={{ padding: '16px 20px', color: 'rgba(255, 255, 255, 0.4)', fontWeight: '600', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Department</th>
                    <th style={{ padding: '16px 20px', color: 'rgba(255, 255, 255, 0.4)', fontWeight: '600', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Designation</th>
                    <th style={{ padding: '16px 20px', color: 'rgba(255, 255, 255, 0.4)', fontWeight: '600', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Contact</th>
                    <th style={{ padding: '16px 20px', color: 'rgba(255, 255, 255, 0.4)', fontWeight: '600', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((emp, index) => {
                    const badge = getStatusBadgeStyle(emp.status);
                    return (
                      <tr 
                        key={emp.id}
                        style={{ 
                          borderBottom: index === filteredEmployees.length - 1 ? 'none' : '1px solid rgba(255, 255, 255, 0.04)',
                          transition: 'background 0.2s ease'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '10px',
                              background: 'rgba(255, 255, 255, 0.08)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '14px',
                              fontWeight: '700',
                              color: '#FFFFFF',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              overflow: 'hidden'
                            }}>
                              {emp.avatar_url ? (
                                <img src={emp.avatar_url} alt={emp.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                emp.name.charAt(0)
                              )}
                            </div>
                            <div>
                              <div style={{ fontWeight: '600', color: '#FFFFFF' }}>{emp.name}</div>
                              <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)' }}>{emp.role}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px 20px', color: 'rgba(255, 255, 255, 0.9)', fontWeight: '500' }}>
                          {emp.employee_id}
                        </td>
                        <td style={{ padding: '16px 20px', color: 'rgba(255, 255, 255, 0.8)' }}>
                          {emp.department}
                        </td>
                        <td style={{ padding: '16px 20px', color: 'rgba(255, 255, 255, 0.8)' }}>
                          {emp.designation}
                        </td>
                        <td style={{ padding: '16px 20px', color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px' }}>
                          <div>{emp.email}</div>
                          {emp.phone && <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)', marginTop: '2px' }}>{emp.phone}</div>}
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: '600',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            background: badge.bg,
                            color: badge.color,
                            border: badge.border,
                            whiteSpace: 'nowrap'
                          }}>
                            {emp.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Footer />
      <div className="bottom-left-pattern" />
    </main>
  );
}
