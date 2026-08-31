'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MeteorShower from '@/components/MeteorShower';
import {
  Users,
  User,
  Calendar,
  GraduationCap,
  PhoneCall,
  Plus,
  MoreVertical,
  ChevronRight,
  Search,
  X,
  CheckCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  RefreshCw,
  GripVertical,
  MessageSquare,
  LayoutGrid,
  List,
  Share2,
  Check,
  Copy,
  Sparkles,
  FileText
} from 'lucide-react';

interface Candidate {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  stage: 'Link Shared' | 'Lead' | 'Candidate' | 'Interview' | 'Training' | 'Mock Call' | 'Employee';
  interviewTime?: string;
  mockScore?: number;
  mockStatus?: 'Passed' | 'Failed' | 'Pending';
  batch?: string;
  fatherName?: string;
  experience?: string;
  cvFileName?: string;
  cvUrl?: string;
  candidate_id?: string;
  ref_id?: string;
  shareableLink?: string;
  dateAdded: string;
}

const INITIAL_CANDIDATES: Candidate[] = [];

function RecruitmentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabFromUrl = searchParams.get('tab');
  const validTabs = ['Overview', 'Pipeline', 'Candidates', 'Interviews', 'Training', 'Mock Calls'];
  const initialTab = (tabFromUrl && validTabs.includes(tabFromUrl)) ? (tabFromUrl as any) : 'Overview';

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTabState] = useState<'Overview' | 'Pipeline' | 'Candidates' | 'Interviews' | 'Training' | 'Mock Calls'>(initialTab);

  const setActiveTab = (tab: 'Overview' | 'Pipeline' | 'Candidates' | 'Interviews' | 'Training' | 'Mock Calls') => {
    setActiveTabState(tab);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (tab === 'Overview') {
        url.searchParams.delete('tab');
      } else {
        url.searchParams.set('tab', tab);
      }
      window.history.replaceState({}, '', url.toString());
    }
  };

  useEffect(() => {
    if (tabFromUrl && validTabs.includes(tabFromUrl)) {
      setActiveTabState(tabFromUrl as any);
    }
  }, [tabFromUrl]);

  const [draggedCandidateId, setDraggedCandidateId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [pipelineFilter, setPipelineFilter] = useState<'Weekly' | 'Monthly' | 'Yearly'>('Monthly');
  const [trendFilter, setTrendFilter] = useState<'Monthly' | 'Quarterly' | 'Yearly'>('Monthly');
  
  // Modals & Menus
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  // Generated Shareable Link Modal State
  const [generatedShareLink, setGeneratedShareLink] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedShareLink, setCopiedShareLink] = useState(false);

  useEffect(() => {
    setMounted(true);

    const fetchRecruitmentData = async () => {
      try {
        const { data, error } = await supabase
          .from('recruitment')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          const dbCandidates: Candidate[] = data.map((item: any) => ({
            id: item.id || item.candidate_id,
            name: item.name || `${item.first_name || ''} ${item.last_name || ''}`.trim(),
            role: item.role || 'Telesales Executive',
            email: item.email || '',
            phone: item.phone || '',
            stage: (item.stage as any) || 'Lead',
            interviewTime: item.interview_time || undefined,
            mockScore: item.mock_score ? Number(item.mock_score) : undefined,
            mockStatus: item.mock_status || undefined,
            batch: item.batch || undefined,
            fatherName: item.father_name || undefined,
            experience: item.experience || undefined,
            cvFileName: item.cv_file_name || undefined,
            cvUrl: item.cv_url || item.cv_file_url || undefined,
            shareableLink: item.shareable_link || undefined,
            dateAdded: item.created_at ? item.created_at.split('T')[0] : new Date().toISOString().split('T')[0]
          }));

          setCandidates(dbCandidates);
        }
      } catch (err) {
        console.error('Error fetching Supabase recruitment data:', err);
      }
    };

    fetchRecruitmentData();
  }, []);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('candidateId', id);
    setDraggedCandidateId(id);
  };

  const handleDragOver = (e: React.DragEvent, stage: string) => {
    e.preventDefault();
    setDragOverStage(stage);
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = async (e: React.DragEvent, targetStage: Candidate['stage']) => {
    e.preventDefault();
    setDragOverStage(null);
    const candidateId = e.dataTransfer.getData('candidateId');
    if (!candidateId) return;

    setCandidates(prev => prev.map(c => {
      if (c.id === candidateId) {
        return { ...c, stage: targetStage };
      }
      return c;
    }));

    setDraggedCandidateId(null);

    try {
      await supabase
        .from('recruitment')
        .update({ stage: targetStage })
        .or(`id.eq.${candidateId},candidate_id.eq.${candidateId}`);
    } catch (err) {
      console.error('Error updating stage in Supabase:', err);
    }
  };

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  // Pipeline Date Range Filter State
  const [pipelineStartDate, setPipelineStartDate] = useState('');
  const [pipelineEndDate, setPipelineEndDate] = useState('');
  const [pipelineDatePreset, setPipelineDatePreset] = useState<'All' | 'Today' | 'This Week' | 'This Month' | 'Custom'>('All');
  const [pipelineDateOffset, setPipelineDateOffset] = useState(0);
  const [showPipelineDateModal, setShowPipelineDateModal] = useState(false);
  const [calViewYear, setCalViewYear] = useState(new Date().getFullYear());
  const [calViewMonth, setCalViewMonth] = useState(new Date().getMonth());

  const [interviewSearchQuery, setInterviewSearchQuery] = useState('');
  const [interviewFilter, setInterviewFilter] = useState<string>('All');
  const [interviewStageFilter, setInterviewStageFilter] = useState<string>('All');
  const [interviewViewMode, setInterviewViewMode] = useState<'grid' | 'table'>('table');

  const [trainingSearchQuery, setTrainingSearchQuery] = useState('');
  const [trainingBatchFilter, setTrainingBatchFilter] = useState<string>('All');
  const [trainingStageFilter, setTrainingStageFilter] = useState<string>('All');
  const [trainingViewMode, setTrainingViewMode] = useState<'grid' | 'table'>('table');

  const [mockSearchQuery, setMockSearchQuery] = useState('');
  const [mockStageFilter, setMockStageFilter] = useState<string>('All');
  const [mockViewMode, setMockViewMode] = useState<'grid' | 'table'>('table');

  // Form State for New Candidate
  const [newCandidate, setNewCandidate] = useState({
    name: '',
    role: 'Sales Executive',
    email: '',
    phone: '',
    stage: 'Lead' as Candidate['stage'],
    interviewTime: '10:00 AM'
  });

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCandidate.name.trim()) return;

    let maxNum = 0;
    candidates.forEach(c => {
      if (c.id) {
        const match = c.id.match(/\d+/);
        if (match) {
          const num = parseInt(match[0], 10);
          if (num > maxNum) maxNum = num;
        }
      }
    });
    const candidateId = `CND-${String(maxNum + 1).padStart(3, '0')}`;
    const [firstName, ...lastNameParts] = newCandidate.name.trim().split(' ');
    const lastName = lastNameParts.join(' ') || '';

    // Generate 14-character alphanumeric shareable link
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let alphaNumeric14 = '';
    for (let i = 0; i < 14; i++) {
      alphaNumeric14 += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const shareableObject = {
      uuid: alphaNumeric14,
      ref_id: candidateId
    };

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const shareableUrl = `${baseUrl}/${alphaNumeric14}/apply?ref=${candidateId}`;

    const created: Candidate = {
      id: candidateId,
      name: newCandidate.name,
      role: newCandidate.role,
      email: newCandidate.email,
      phone: newCandidate.phone || '+91 98765 00000',
      stage: newCandidate.stage,
      interviewTime: newCandidate.interviewTime,
      mockStatus: 'Pending',
      shareableLink: shareableUrl,
      dateAdded: new Date().toISOString().split('T')[0]
    };

    setCandidates([created, ...candidates]);
    setShowAddModal(false);

    try {
      const { error: dbError } = await supabase.from('recruitment').insert([{
        candidate_id: candidateId,
        ref_id: candidateId,
        first_name: firstName,
        last_name: lastName || null,
        name: newCandidate.name,
        email: newCandidate.email.trim() || null,
        phone: newCandidate.phone.trim() || null,
        role: newCandidate.role || 'Telesales Executive',
        stage: newCandidate.stage || 'Lead',
        interview_time: newCandidate.interviewTime || null,
        shareable_link: JSON.stringify(shareableObject),
        details_submitted: false
      }]);

      if (dbError) {
        console.error('Supabase recruitment insert error:', dbError);
      }
    } catch (err) {
      console.error('Error saving candidate to Supabase:', err);
    }

    setGeneratedShareLink(shareableUrl);
    setShowShareModal(true);
    setCopiedShareLink(false);

    setNewCandidate({
      name: '',
      role: 'Sales Executive',
      email: '',
      phone: '',
      stage: 'Lead',
      interviewTime: '10:00 AM'
    });
  };

  // Filtered Candidates
  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = stageFilter === 'All' || c.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  // Chart data for Hiring Trend (Dynamically computed from Supabase candidates state)
  const chartMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const chartData = React.useMemo(() => {
    const leads = new Array(12).fill(0);
    const interviews = new Array(12).fill(0);
    const training = new Array(12).fill(0);
    const mockCalls = new Array(12).fill(0);
    const employees = new Array(12).fill(0);

    candidates.forEach(c => {
      const dateStr = c.dateAdded || new Date().toISOString().split('T')[0];
      const monthIdx = new Date(dateStr).getMonth();
      if (isNaN(monthIdx) || monthIdx < 0 || monthIdx > 11) return;

      if (c.stage === 'Lead' || c.stage === 'Candidate') leads[monthIdx]++;
      else if (c.stage === 'Interview') interviews[monthIdx]++;
      else if (c.stage === 'Training') training[monthIdx]++;
      else if (c.stage === 'Mock Call') mockCalls[monthIdx]++;
      else if (c.stage === 'Employee') employees[monthIdx]++;
    });

    return { leads, interviews, training, mockCalls, employees };
  }, [candidates]);

  const maxChartVal = Math.max(
    5,
    ...chartData.leads,
    ...chartData.interviews,
    ...chartData.training,
    ...chartData.mockCalls,
    ...chartData.employees
  );

  const buildSvgPath = (points: number[]) => {
    const width = 800;
    const height = 180;

    return points.reduce((acc, val, i) => {
      const x = (i / (points.length - 1)) * width;
      const y = height - (val / maxChartVal) * height;
      if (i === 0) return `M ${x} ${y}`;
      const prevX = ((i - 1) / (points.length - 1)) * width;
      const prevY = height - (points[i - 1] / maxChartVal) * height;
      const cp1X = prevX + (x - prevX) / 2;
      const cp2X = prevX + (x - prevX) / 2;
      return `${acc} C ${cp1X} ${prevY}, ${cp2X} ${y}, ${x} ${y}`;
    }, '');
  };

  return (
    <main className="page-fade-in" style={{ position: 'relative', width: '100%', minHeight: '100vh', paddingBottom: '100px', backgroundColor: 'var(--color-black)' }}>
      <Header
        category="H.R & Management"
        title="Recruitment"
        description="Manage candidates, interviews and hiring progress"
        actionButton={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
            <Link
              href="/hr/recruitment/add"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 18px',
                backgroundColor: 'var(--color-white)',
                color: '#000',
                border: 'none',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                textDecoration: 'none',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e: React.MouseEvent<HTMLAnchorElement>) => e.currentTarget.style.transform = 'scale(1.03)'}
              onMouseOut={(e: React.MouseEvent<HTMLAnchorElement>) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <Plus size={16} />
              <span>Add Candidate</span>
            </Link>

            <button
              onClick={() => setShowMenuDropdown(!showMenuDropdown)}
              style={{
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#363636',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '50%',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              <MoreVertical size={16} />
            </button>

            {showMenuDropdown && (
              <div style={{
                position: 'absolute',
                top: '46px',
                right: 0,
                width: '190px',
                backgroundColor: '#262626',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '16px',
                boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
                padding: '8px',
                zIndex: 50
              }}>
                <button
                  onClick={() => { alert('Exporting candidate list...'); setShowMenuDropdown(false); }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'rgba(255,255,255,0.9)',
                    fontSize: '13px',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <Download size={14} /> Export Candidates
                </button>
                <button
                  onClick={() => { alert('Refreshing data...'); setShowMenuDropdown(false); }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'rgba(255,255,255,0.9)',
                    fontSize: '13px',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <RefreshCw size={14} /> Refresh Pipeline
                </button>
              </div>
            )}
          </div>
        }
      />

      {/* Page Padding container - Dashboard layout standard */}
      <div style={{ padding: '0 24px', marginTop: '24px' }}>

        {/* 4 Stat Tiles - HR Employee Page Tile Design (Dynamically computed from Supabase candidates state) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
          marginBottom: '28px'
        }}>
          {(() => {
            const leadsCount = candidates.filter(c => c.stage === 'Lead' || c.stage === 'Candidate').length;
            const interviewCount = candidates.filter(c => c.stage === 'Interview').length;
            const trainingCount = candidates.filter(c => c.stage === 'Training').length;
            const mockCallCount = candidates.filter(c => c.stage === 'Mock Call').length;

            const statCards = [
              { label: 'Total Leads', value: leadsCount, subtitle: 'APPLICANTS PIPELINE', image: '/chkin.png', color: 'rgb(68, 132, 255)' },
              { label: 'Interviews', value: interviewCount, subtitle: 'SCHEDULED SESSIONS', image: '/fnlst.png', color: 'rgb(168, 85, 247)' },
              { label: 'Training Selected', value: trainingCount, subtitle: 'ACTIVE BATCHES', image: '/brktime.png', color: 'rgb(250, 204, 21)' },
              { label: 'Mock Call Selected', value: mockCallCount, subtitle: 'FINAL EVALUATION', image: '/chkout.png', color: 'rgb(52, 187, 136)' }
            ];

            return statCards.map((card, idx) => {
              return (
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
                    width: '100%', 
                    cursor: 'default'
                  }}
                >
                  {/* Top Right Pattern */}
                  <div style={{ position: 'absolute', inset: '0px', borderRadius: '24px', overflow: 'hidden', zIndex: 0 }}>
                    <div className="top-right-pattern" style={{ opacity: 0.15, right: 'auto', left: '-20px', top: '-20px' }}></div>
                  </div>

                  {/* Meteor Animations */}
                  <MeteorShower />

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
            });
          })()}
        </div>

        {/* Sliding Toggle Navigation Bar (Transparent Background) */}
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          height: '48px',
          backgroundColor: 'transparent',
          borderRadius: '28px',
          padding: '4px',
          border: '1.5px solid rgba(255, 255, 255, 0.15)',
          marginBottom: '28px',
          overflowX: 'auto',
          maxWidth: '680px'
        }}>
          {/* Sliding White Pill Indicator */}
          {(() => {
            const tabsList = ['Overview', 'Pipeline', 'Candidates', 'Interviews', 'Training', 'Mock Calls'] as const;
            const activeIndex = tabsList.indexOf(activeTab);
            return (
              <div
                style={{
                  position: 'absolute',
                  top: '4px',
                  bottom: '4px',
                  left: '4px',
                  width: `calc((100% - 8px) / ${tabsList.length})`,
                  transform: `translateX(${activeIndex * 100}%)`,
                  backgroundColor: '#ffffff',
                  borderRadius: '24px',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.35)',
                  transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                  zIndex: 1
                }}
              />
            );
          })()}

          {/* Tab Option Buttons */}
          {(['Overview', 'Pipeline', 'Candidates', 'Interviews', 'Training', 'Mock Calls'] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '85px',
                  padding: '0 12px',
                  background: 'transparent',
                  border: 'none',
                  color: isActive ? '#000000' : 'rgba(255, 255, 255, 0.65)',
                  fontSize: '13px',
                  fontWeight: isActive ? '700' : '500',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  position: 'relative',
                  zIndex: 2,
                  textAlign: 'center',
                  transition: 'color 0.25s ease'
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'Overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', margin: '20px 0' }}>

            {/* Section 1: Hiring Trend Chart Card */}
            <div style={{
              backgroundColor: '#363636',
              borderRadius: '24px',
              padding: '24px',
              position: 'relative',
              overflow: 'hidden',
              marginBottom: '8px'
            }}>
              <div className="top-right-pattern" style={{ opacity: 0.15, right: 'auto', left: '-20px', top: '-20px', zIndex: 0 }} />
              <MeteorShower />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2 style={{ color: 'var(--text-color)', fontSize: '18px', fontWeight: '600', margin: 0 }}>
                    HIRING TREND
                  </h2>
                  <div style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.25)',
                    padding: '3px',
                    borderRadius: '20px',
                    border: '1px solid rgba(255, 255, 255, 0.08)'
                  }}>
                    {/* Sliding Active Pill Transition */}
                    <div style={{
                      position: 'absolute',
                      top: '3px',
                      bottom: '3px',
                      left: '3px',
                      width: 'calc((100% - 6px) / 3)',
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: '16px',
                      transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      transform: trendFilter === 'Monthly' ? 'translateX(0%)' : trendFilter === 'Quarterly' ? 'translateX(100%)' : 'translateX(200%)',
                      zIndex: 0
                    }} />

                    {(['Monthly', 'Quarterly', 'Yearly'] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setTrendFilter(filter)}
                        style={{
                          position: 'relative',
                          zIndex: 1,
                          width: '64px',
                          padding: '5px 0',
                          borderRadius: '16px',
                          border: 'none',
                          backgroundColor: 'transparent',
                          color: trendFilter === filter ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
                          fontSize: '11px',
                          fontWeight: trendFilter === filter ? '500' : '400',
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'color 0.3s ease'
                        }}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ width: '100%', overflowX: 'auto' }}>
                  <div style={{ minWidth: '650px', height: '220px', position: 'relative' }}>
                    {[150, 125, 100, 75, 50, 25, 0].map((val, idx) => (
                      <div key={val} style={{
                        position: 'absolute',
                        top: `${(idx / 6) * 160}px`,
                        left: '32px',
                        right: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}>
                        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', width: '20px', textAlign: 'right' }}>{val}</span>
                        <div style={{ flex: 1, borderBottom: '1px solid rgba(255,255,255,0.05)' }} />
                      </div>
                    ))}

                    <svg
                      style={{ position: 'absolute', top: 0, left: '60px', right: 0, width: 'calc(100% - 60px)', height: '160px', overflow: 'visible' }}
                      viewBox="0 0 800 180"
                      preserveAspectRatio="none"
                    >
                      <path d={buildSvgPath(chartData.leads)} fill="none" stroke="#4484FF" strokeWidth="3" />
                      <path d={buildSvgPath(chartData.interviews)} fill="none" stroke="#a855f7" strokeWidth="2.5" strokeDasharray="4 2" />
                      <path d={buildSvgPath(chartData.training)} fill="none" stroke="#FFE76B" strokeWidth="2.5" />
                      <path d={buildSvgPath(chartData.mockCalls)} fill="none" stroke="#4ADE80" strokeWidth="2.5" />
                      <path d={buildSvgPath(chartData.employees)} fill="none" stroke="#34BB88" strokeWidth="2" />
                    </svg>

                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: '60px',
                      right: 0,
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}>
                      {chartMonths.map((m) => (
                        <span key={m} style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  gap: '20px',
                  marginTop: '20px',
                  paddingTop: '16px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4484FF' }} /> Leads
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#a855f7' }} /> Interviews
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FFE76B' }} /> Training
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ADE80' }} /> Mock Calls
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34BB88' }} /> Employees
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Hiring Pipeline & Today's Interviews (Dashboard Style) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '20px'
            }}>
              {/* Left Card: HIRING PIPELINE */}
              <div style={{
                backgroundColor: '#363636',
                borderRadius: '24px',
                padding: '24px',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div className="top-right-pattern" style={{ opacity: 0.15, right: 'auto', left: '-20px', top: '-20px', zIndex: 0 }} />
                <MeteorShower />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ color: 'var(--text-color)', fontSize: '18px', fontWeight: '600', margin: 0 }}>
                      HIRING PIPELINE
                    </h2>
                    <div style={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      backgroundColor: 'rgba(0, 0, 0, 0.25)',
                      padding: '3px',
                      borderRadius: '20px',
                      border: '1px solid rgba(255, 255, 255, 0.08)'
                    }}>
                      {/* Sliding Active Pill Transition */}
                      <div style={{
                        position: 'absolute',
                        top: '3px',
                        bottom: '3px',
                        left: '3px',
                        width: 'calc((100% - 6px) / 3)',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '16px',
                        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: pipelineFilter === 'Weekly' ? 'translateX(0%)' : pipelineFilter === 'Monthly' ? 'translateX(100%)' : 'translateX(200%)',
                        zIndex: 0
                      }} />

                      {(['Weekly', 'Monthly', 'Yearly'] as const).map((filter) => (
                        <button
                          key={filter}
                          onClick={() => setPipelineFilter(filter)}
                          style={{
                            position: 'relative',
                            zIndex: 1,
                            width: '64px',
                            padding: '5px 0',
                            borderRadius: '16px',
                            border: 'none',
                            backgroundColor: 'transparent',
                            color: pipelineFilter === filter ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
                            fontSize: '11px',
                            fontWeight: pipelineFilter === filter ? '500' : '400',
                            cursor: 'pointer',
                            textAlign: 'center',
                            transition: 'color 0.3s ease'
                          }}
                        >
                          {filter}
                        </button>
                      ))}
                    </div>
                  </div>

                  {(() => {
                    const totalC = candidates.length || 1;
                    const leadsC = candidates.filter(c => c.stage === 'Lead' || c.stage === 'Candidate').length;
                    const interviewC = candidates.filter(c => c.stage === 'Interview').length;
                    const trainingC = candidates.filter(c => c.stage === 'Training').length;
                    const mockC = candidates.filter(c => c.stage === 'Mock Call').length;
                    const employeeC = candidates.filter(c => c.stage === 'Employee').length;

                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                        {/* Stage 1 */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'rgba(255,255,255,0.85)', marginBottom: '8px' }}>
                            <span style={{ fontWeight: '500' }}>New Leads</span>
                            <span style={{ fontWeight: '700', color: '#fff' }}>{leadsC}</span>
                          </div>
                          <div style={{ width: '100%', height: '16px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px', overflow: 'hidden' }}>
                            <div style={{
                              width: `${Math.min(100, Math.round((leadsC / totalC) * 100))}%`,
                              height: '100%',
                              backgroundColor: '#4484FF',
                              borderRadius: '8px',
                              transition: 'width 1s ease',
                              WebkitMaskImage: 'linear-gradient(to right, rgba(0, 0, 0, 0.15) 0%, black 50%)',
                              maskImage: 'linear-gradient(to right, rgba(0, 0, 0, 0.15) 0%, black 50%)'
                            }} />
                          </div>
                        </div>

                        {/* Stage 2 */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'rgba(255,255,255,0.85)', marginBottom: '8px' }}>
                            <span style={{ fontWeight: '500' }}>Interviews</span>
                            <span style={{ fontWeight: '700', color: '#fff' }}>{interviewC}</span>
                          </div>
                          <div style={{ width: '100%', height: '16px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px', overflow: 'hidden' }}>
                            <div style={{
                              width: `${Math.min(100, Math.round((interviewC / totalC) * 100))}%`,
                              height: '100%',
                              backgroundColor: '#a855f7',
                              borderRadius: '8px',
                              transition: 'width 1s ease',
                              WebkitMaskImage: 'linear-gradient(to right, rgba(0, 0, 0, 0.15) 0%, black 50%)',
                              maskImage: 'linear-gradient(to right, rgba(0, 0, 0, 0.15) 0%, black 50%)'
                            }} />
                          </div>
                        </div>

                        {/* Stage 3 */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'rgba(255,255,255,0.85)', marginBottom: '8px' }}>
                            <span style={{ fontWeight: '500' }}>Training</span>
                            <span style={{ fontWeight: '700', color: '#fff' }}>{trainingC}</span>
                          </div>
                          <div style={{ width: '100%', height: '16px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px', overflow: 'hidden' }}>
                            <div style={{
                              width: `${Math.min(100, Math.round((trainingC / totalC) * 100))}%`,
                              height: '100%',
                              backgroundColor: '#FFE76B',
                              borderRadius: '8px',
                              transition: 'width 1s ease',
                              WebkitMaskImage: 'linear-gradient(to right, rgba(0, 0, 0, 0.15) 0%, black 50%)',
                              maskImage: 'linear-gradient(to right, rgba(0, 0, 0, 0.15) 0%, black 50%)'
                            }} />
                          </div>
                        </div>

                        {/* Stage 4 */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'rgba(255,255,255,0.85)', marginBottom: '8px' }}>
                            <span style={{ fontWeight: '500' }}>Mock Call</span>
                            <span style={{ fontWeight: '700', color: '#fff' }}>{mockC}</span>
                          </div>
                          <div style={{ width: '100%', height: '16px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px', overflow: 'hidden' }}>
                            <div style={{
                              width: `${Math.min(100, Math.round((mockC / totalC) * 100))}%`,
                              height: '100%',
                              backgroundColor: '#4ADE80',
                              borderRadius: '8px',
                              transition: 'width 1s ease',
                              WebkitMaskImage: 'linear-gradient(to right, rgba(0, 0, 0, 0.15) 0%, black 50%)',
                              maskImage: 'linear-gradient(to right, rgba(0, 0, 0, 0.15) 0%, black 50%)'
                            }} />
                          </div>
                        </div>

                        {/* Stage 5 */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'rgba(255,255,255,0.85)', marginBottom: '8px' }}>
                            <span style={{ fontWeight: '500' }}>Employees</span>
                            <span style={{ fontWeight: '700', color: '#fff' }}>{employeeC}</span>
                          </div>
                          <div style={{ width: '100%', height: '16px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px', overflow: 'hidden' }}>
                            <div style={{
                              width: `${Math.min(100, Math.round((employeeC / totalC) * 100))}%`,
                              height: '100%',
                              backgroundColor: '#34BB88',
                              borderRadius: '8px',
                              transition: 'width 1s ease',
                              WebkitMaskImage: 'linear-gradient(to right, rgba(0, 0, 0, 0.15) 0%, black 50%)',
                              maskImage: 'linear-gradient(to right, rgba(0, 0, 0, 0.15) 0%, black 50%)'
                            }} />
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', position: 'relative', zIndex: 1 }}>
                  <button
                    onClick={() => setActiveTab('Candidates')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#A3A3A3',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: 0
                    }}
                  >
                    View <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              {/* Right Card: TODAY'S INTERVIEWS */}
              <div style={{
                backgroundColor: '#363636',
                borderRadius: '24px',
                padding: '24px',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div className="top-right-pattern" style={{ opacity: 0.15, right: 'auto', left: '-20px', top: '-20px', zIndex: 0 }} />
                <MeteorShower />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <h2 style={{ color: 'var(--text-color)', fontSize: '18px', fontWeight: '600', margin: 0 }}>
                        TODAY'S INTERVIEWS
                      </h2>
                      <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>30 August 2026</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {candidates.filter(c => c.interviewTime).slice(0, 4).map((c) => (
                      <div
                        key={c.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          backgroundColor: 'rgba(0, 0, 0, 0.25)',
                          borderRadius: '12px',
                          border: '1px solid rgba(255, 255, 255, 0.05)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{
                            padding: '4px 8px',
                            backgroundColor: 'rgba(68, 132, 255, 0.15)',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '600',
                            color: '#4484FF'
                          }}>
                            {c.interviewTime}
                          </span>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>{c.name}</div>
                            <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)' }}>{c.role}</div>
                          </div>
                        </div>

                        <button
                          onClick={() => setSelectedCandidate(c)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#A3A3A3',
                            fontSize: '12px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            padding: 0
                          }}
                        >
                          View →
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', position: 'relative', zIndex: 1 }}>
                  <button
                    onClick={() => setActiveTab('Interviews')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#A3A3A3',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: 0
                    }}
                  >
                    View All <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Section 3: Training Batches (Dashboard Table Style) */}
            <div style={{ margin: '12px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ color: 'var(--text-color)', fontSize: '20px', fontWeight: '600', margin: 0 }}>
                  TRAINING BATCHES
                </h2>
                <button
                  onClick={() => setActiveTab('Training')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#A3A3A3',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: 0
                  }}
                >
                  View All Batches <ChevronRight size={14} />
                </button>
              </div>

              <div style={{
                backgroundColor: 'transparent',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.08)',
                position: 'relative'
              }}>
                <div className="top-right-pattern" style={{ opacity: 0.15, right: 'auto', left: '-20px', top: '-20px', zIndex: 0 }} />
                <div className="top-right-pattern" style={{ opacity: 0.15, left: 'auto', right: '-20px', bottom: '-20px', top: 'auto', transform: 'rotate(180deg)', zIndex: 0 }} />
                <MeteorShower />
                <div style={{ position: 'relative', zIndex: 1, overflowX: 'auto' }}>
                  <table style={{ width: '100%', minWidth: '550px', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'transparent', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        <th style={{ padding: '16px', color: '#888', fontSize: '13px', fontWeight: '500' }}>Batch</th>
                        <th style={{ padding: '16px', color: '#888', fontSize: '13px', fontWeight: '500' }}>Start Date</th>
                        <th style={{ padding: '16px', color: '#888', fontSize: '13px', fontWeight: '500' }}>Candidates</th>
                        <th style={{ padding: '16px', color: '#888', fontSize: '13px', fontWeight: '500' }}>Progress</th>
                        <th style={{ padding: '16px', color: '#888', fontSize: '13px', fontWeight: '500' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const batchGroups: { [bName: string]: Candidate[] } = {};
                        candidates.forEach(c => {
                          const bName = c.batch || (c.stage === 'Training' ? 'Batch #12' : null);
                          if (bName) {
                            if (!batchGroups[bName]) batchGroups[bName] = [];
                            batchGroups[bName].push(c);
                          }
                        });

                        const batchKeys = Object.keys(batchGroups);
                        if (batchKeys.length === 0) {
                          return (
                            <tr>
                              <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#888', fontSize: '13px' }}>
                                No training batches found in database
                              </td>
                            </tr>
                          );
                        }

                        return batchKeys.map(bName => {
                          const list = batchGroups[bName];
                          const total = list.length;
                          const passed = list.filter(c => c.mockStatus === 'Passed' || c.stage === 'Employee').length;
                          const progress = total ? Math.round((passed / total) * 100) : 0;
                          const statusText = progress === 100 ? 'Completed' : progress > 0 ? 'In Progress' : 'Upcoming';
                          const statusColor = progress === 100 ? '#4ADE80' : progress > 0 ? '#FFE76B' : '#4484FF';
                          const startDateStr = list[0]?.dateAdded ? new Date(list[0].dateAdded).toLocaleDateString('en-US', { day: '2-digit', month: 'short' }) : '—';

                          return (
                            <tr key={bName} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                              <td style={{ padding: '16px', color: 'var(--text-color)', fontSize: '14px', fontWeight: '500', whiteSpace: 'nowrap' }}>{bName}</td>
                              <td style={{ padding: '16px', color: '#A3A3A3', fontSize: '14px', whiteSpace: 'nowrap' }}>{startDateStr}</td>
                              <td style={{ padding: '16px', color: '#A3A3A3', fontSize: '14px', whiteSpace: 'nowrap' }}>{total}</td>
                              <td style={{ padding: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '160px' }}>
                                  <div style={{ flex: 1, height: '6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div style={{ width: `${progress}%`, height: '100%', backgroundColor: statusColor }} />
                                  </div>
                                  <span style={{ fontSize: '12px', color: statusColor, fontWeight: '600' }}>{progress}%</span>
                                </div>
                              </td>
                              <td style={{ padding: '16px', color: statusColor, fontSize: '14px', fontWeight: '500', whiteSpace: 'nowrap' }}>
                                {statusText}
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Section 4: Mock Call & Ready for Employee */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '20px'
            }}>
              {/* Left Card: MOCK CALL */}
              <div style={{
                backgroundColor: '#363636',
                borderRadius: '24px',
                padding: '24px',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div className="top-right-pattern" style={{ opacity: 0.15, right: 'auto', left: '-20px', top: '-20px', zIndex: 0 }} />
                <MeteorShower />
                {(() => {
                  const mockList = candidates.filter(c => c.stage === 'Mock Call' || c.mockStatus);
                  const passedC = candidates.filter(c => c.mockStatus === 'Passed').length;
                  const failedC = candidates.filter(c => c.mockStatus === 'Failed').length;
                  const pendingC = mockList.length - (passedC + failedC);
                  const totalM = mockList.length || 1;
                  const passRateVal = Math.round((passedC / totalM) * 100);

                  return (
                    <div style={{ position: 'relative', zIndex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h2 style={{ color: 'var(--text-color)', fontSize: '18px', fontWeight: '600', margin: 0 }}>
                          MOCK CALL
                        </h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', backgroundColor: 'rgba(0,0,0,0.25)', padding: '4px 10px', borderRadius: '12px' }}>
                            Total: {mockList.length}
                          </span>
                        </div>
                      </div>

                      {/* Circular Bar & Legend Layout */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: '36px', margin: '12px 0' }}>
                        {/* SVG Circular Progress Ring */}
                        <div style={{ position: 'relative', width: '180px', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <svg width="180" height="180" viewBox="0 0 180 180">
                            <circle cx="90" cy="90" r="68" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="24" />
                            <circle
                              cx="90"
                              cy="90"
                              r="68"
                              fill="none"
                              stroke="#4ADE80"
                              strokeWidth="24"
                              strokeDasharray={`${Math.round((passRateVal / 100) * 427)} 427.25`}
                              transform="rotate(-90 90 90)"
                              strokeLinecap="round"
                            />
                          </svg>
                          {/* Center Stat */}
                          <div style={{ position: 'absolute', textAlign: 'center' }}>
                            <span style={{ fontSize: '28px', fontWeight: '700', color: '#fff', display: 'block', lineHeight: 1 }}>{passRateVal}%</span>
                            <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', marginTop: '6px', display: 'block', fontWeight: '500' }}>Pass Rate</span>
                          </div>
                        </div>

                        {/* Vertical Linear Progress Bars */}
                        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '34px', padding: '0 8px', flexShrink: 0 }}>
                          {/* Passed Vertical Bar */}
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '14px', fontWeight: '700', color: '#4ADE80' }}>{passedC}</span>
                            <div style={{ width: '44px', height: '115px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '4px', display: 'flex', alignItems: 'flex-end', border: '1px solid rgba(74, 222, 128, 0.2)' }}>
                              <div style={{
                                width: '100%',
                                height: `${Math.round((passedC / totalM) * 100)}%`,
                                backgroundColor: '#4ADE80',
                                borderRadius: '8px',
                                transition: 'height 1s ease',
                                WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.2) 0%, black 60%)',
                                maskImage: 'linear-gradient(to top, rgba(0,0,0,0.2) 0%, black 60%)'
                              }} />
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: '600', color: '#4ADE80', marginTop: '2px' }}>Passed</span>
                          </div>

                          {/* Failed Vertical Bar */}
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '14px', fontWeight: '700', color: '#FD6579' }}>{failedC}</span>
                            <div style={{ width: '44px', height: '115px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '4px', display: 'flex', alignItems: 'flex-end', border: '1px solid rgba(253, 101, 121, 0.2)' }}>
                              <div style={{
                                width: '100%',
                                height: `${Math.round((failedC / totalM) * 100)}%`,
                                backgroundColor: '#FD6579',
                                borderRadius: '8px',
                                transition: 'height 1s ease',
                                WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.2) 0%, black 60%)',
                                maskImage: 'linear-gradient(to top, rgba(0,0,0,0.2) 0%, black 60%)'
                              }} />
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: '600', color: '#FD6579', marginTop: '2px' }}>Failed</span>
                          </div>

                          {/* Pending Vertical Bar */}
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '14px', fontWeight: '700', color: '#FFE76B' }}>{pendingC > 0 ? pendingC : 0}</span>
                            <div style={{ width: '44px', height: '115px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '4px', display: 'flex', alignItems: 'flex-end', border: '1px solid rgba(255, 231, 107, 0.2)' }}>
                              <div style={{
                                width: '100%',
                                height: `${Math.round((Math.max(0, pendingC) / totalM) * 100)}%`,
                                backgroundColor: '#FFE76B',
                                borderRadius: '8px',
                                transition: 'height 1s ease',
                                WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.2) 0%, black 60%)',
                                maskImage: 'linear-gradient(to top, rgba(0,0,0,0.2) 0%, black 60%)'
                              }} />
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: '600', color: '#FFE76B', marginTop: '2px' }}>Pending</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', position: 'relative', zIndex: 1 }}>
                  <button
                    onClick={() => setActiveTab('Mock Calls')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#A3A3A3',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: 0
                    }}
                  >
                    View <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              {/* Right Card: READY FOR EMPLOYEE */}
              <div style={{
                backgroundColor: '#363636',
                borderRadius: '24px',
                padding: '24px',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div className="top-right-pattern" style={{ opacity: 0.15, right: 'auto', left: '-20px', top: '-20px', zIndex: 0 }} />
                <MeteorShower />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <h2 style={{ color: 'var(--text-color)', fontSize: '18px', fontWeight: '600', margin: 0 }}>
                      READY FOR EMPLOYEE
                    </h2>
                    <span style={{ backgroundColor: 'rgba(74, 222, 128, 0.15)', color: '#4ADE80', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' }}>
                      15 Candidates
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '16px' }}>
                    Candidates who cleared mock call
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {candidates.filter(c => c.mockStatus === 'Passed').slice(0, 3).map((c) => (
                      <div
                        key={c.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          backgroundColor: 'rgba(0,0,0,0.25)',
                          borderRadius: '12px'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>{c.name}</div>
                          <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)' }}>{c.role}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: '#4ADE80' }}>
                            {c.mockScore}/100
                          </span>
                          <button
                            onClick={() => setSelectedCandidate(c)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#A3A3A3',
                              fontSize: '12px',
                              fontWeight: '500',
                              cursor: 'pointer',
                              padding: 0
                            }}
                          >
                            View →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', position: 'relative', zIndex: 1 }}>
                  <button
                    onClick={() => setActiveTab('Candidates')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#A3A3A3',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: 0
                    }}
                  >
                    View All <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PIPELINE TAB (Drag & Drop Kanban Board) */}
        {activeTab === 'Pipeline' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Section Header with Date Range Filter Bar */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '4px',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#FFFFFF', margin: 0, fontFamily: 'var(--font-lufga), sans-serif' }}>
                Pipeline
              </h3>

              {/* USER'S EXACT CUSTOM DATE SELECTOR COMPONENT */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {/* Previous Arrow Button */}
                  <button 
                    onClick={() => {
                      const newOffset = pipelineDateOffset - 1;
                      setPipelineDateOffset(newOffset);
                      const d = new Date();
                      d.setDate(d.getDate() + newOffset);
                      const dateStr = d.toISOString().split('T')[0];
                      setPipelineStartDate(dateStr);
                      setPipelineEndDate(dateStr);
                      setPipelineDatePreset('Custom');
                    }}
                    title="Previous Date"
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(255, 255, 255, 0.4)',
                      color: 'var(--color-white, #ffffff)',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>

                  {/* Clickable Date Label */}
                  <span 
                    onClick={() => setShowPipelineDateModal(prev => !prev)}
                    title="Click to open Calendar Date Picker & All Time option"
                    style={{
                      color: 'var(--text-color, #ffffff)',
                      fontSize: '15px',
                      fontWeight: '500',
                      minWidth: '65px',
                      textAlign: 'center',
                      marginLeft: '12px',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    {(() => {
                      if (pipelineDatePreset === 'All' && !pipelineStartDate && pipelineDateOffset === 0) return 'All Time';
                      if (pipelineStartDate && pipelineEndDate && pipelineStartDate !== pipelineEndDate) {
                        const d1Parts = pipelineStartDate.split('-');
                        const d2Parts = pipelineEndDate.split('-');
                        const d1 = new Date(Number(d1Parts[0]), Number(d1Parts[1]) - 1, Number(d1Parts[2]));
                        const d2 = new Date(Number(d2Parts[0]), Number(d2Parts[1]) - 1, Number(d2Parts[2]));
                        const f1 = d1.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
                        const f2 = d2.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
                        return `${f1} - ${f2}`;
                      }
                      if (pipelineDateOffset === 0 && !pipelineStartDate) return 'Today';
                      if (pipelineDateOffset === 0) return 'Today';
                      if (pipelineDateOffset === 1) return 'Tomorrow';
                      if (pipelineDateOffset === -1) return 'Yesterday';
                      const d = new Date();
                      d.setDate(d.getDate() + pipelineDateOffset);
                      return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
                    })()}
                  </span>

                  {/* Next Arrow Button Container (Supports navigating to future dates after Today) */}
                  <div style={{
                    width: pipelineDateOffset === 0 && pipelineDatePreset === 'All' ? '0px' : '32px',
                    marginLeft: pipelineDateOffset === 0 && pipelineDatePreset === 'All' ? '0px' : '12px',
                    opacity: pipelineDateOffset === 0 && pipelineDatePreset === 'All' ? 0 : 1,
                    overflow: 'hidden',
                    transition: '0.3s ease',
                    display: 'flex'
                  }}>
                    <button 
                      onClick={() => {
                        const newOffset = pipelineDateOffset + 1;
                        setPipelineDateOffset(newOffset);
                        if (newOffset === 0 && pipelineDatePreset === 'All') {
                          setPipelineStartDate('');
                          setPipelineEndDate('');
                        } else {
                          const d = new Date();
                          d.setDate(d.getDate() + newOffset);
                          const dateStr = d.toISOString().split('T')[0];
                          setPipelineStartDate(dateStr);
                          setPipelineEndDate(dateStr);
                          setPipelineDatePreset('Custom');
                        }
                      }}
                      title="Next Date"
                      style={{
                        background: 'transparent',
                        border: '1px solid rgba(255, 255, 255, 0.4)',
                        color: 'var(--color-white, #ffffff)',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        flexShrink: 0
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Custom Interactive Visual Calendar Range Picker Popover */}
                {showPipelineDateModal && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 12px)',
                    right: 0,
                    backgroundColor: '#1E1E1E',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                    borderRadius: '24px',
                    padding: '20px',
                    boxShadow: '0 24px 60px rgba(0,0,0,0.9)',
                    zIndex: 999,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    width: '330px'
                  }}>
                    {/* Popover Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={16} style={{ color: '#34BB88' }} /> Select Date Range
                      </span>
                      <button onClick={() => setShowPipelineDateModal(false)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>
                        <X size={16} />
                      </button>
                    </div>

                    {/* ALL TIME BIG BUTTON */}
                    <button
                      onClick={() => {
                        setPipelineStartDate('');
                        setPipelineEndDate('');
                        setPipelineDatePreset('All');
                        setPipelineDateOffset(0);
                        setShowPipelineDateModal(false);
                      }}
                      style={{
                        padding: '10px',
                        backgroundColor: pipelineDatePreset === 'All' ? 'rgba(52, 187, 136, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                        border: pipelineDatePreset === 'All' ? '1px solid #34BB88' : '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        color: pipelineDatePreset === 'All' ? '#34BB88' : '#ffffff',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Sparkles size={14} />
                      <span>All Time (Show All Candidates)</span>
                    </button>

                    {/* QUICK PRESET PILLS */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {[
                        { label: 'Today', offset: 0 },
                        { label: 'Yesterday', offset: -1 },
                        { label: 'This Week', preset: 'This Week' },
                        { label: 'This Month', preset: 'This Month' }
                      ].map((item, pIdx) => (
                        <button
                          key={pIdx}
                          onClick={() => {
                            const todayStr = new Date().toISOString().split('T')[0];
                            if (item.offset !== undefined) {
                              setPipelineDateOffset(item.offset);
                              const d = new Date();
                              d.setDate(d.getDate() + item.offset);
                              const dateStr = d.toISOString().split('T')[0];
                              setPipelineStartDate(dateStr);
                              setPipelineEndDate(dateStr);
                              setPipelineDatePreset('Custom');
                            } else if (item.preset === 'This Week') {
                              const now = new Date();
                              const day = now.getDay();
                              const diffToMon = now.getDate() - day + (day === 0 ? -6 : 1);
                              const mon = new Date(now.setDate(diffToMon));
                              const sun = new Date(mon);
                              sun.setDate(mon.getDate() + 6);

                              const startWeek = mon.toISOString().split('T')[0];
                              const endWeek = sun.toISOString().split('T')[0];
                              setPipelineStartDate(startWeek);
                              setPipelineEndDate(endWeek);
                              setPipelineDatePreset('This Week');
                            } else if (item.preset === 'This Month') {
                              const now = new Date();
                              const startMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
                              const endMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
                              setPipelineStartDate(startMonth);
                              setPipelineEndDate(endMonth);
                              setPipelineDatePreset('This Month');
                            }
                            setShowPipelineDateModal(false);
                          }}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '8px',
                            color: 'rgba(255, 255, 255, 0.85)',
                            fontSize: '12px',
                            fontWeight: '500',
                            cursor: 'pointer'
                          }}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>

                    {/* RANGE SELECTION SUMMARY CARD */}
                    <div style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '12px',
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '12px'
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', textTransform: 'uppercase' }}>First Date (From)</span>
                        <span style={{ color: pipelineStartDate ? '#34BB88' : '#888', fontWeight: '600' }}>
                          {pipelineStartDate ? new Date(pipelineStartDate + 'T00:00:00').toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : 'Click 1st date'}
                        </span>
                      </div>
                      <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 'bold' }}>➔</span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'right' }}>
                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', textTransform: 'uppercase' }}>Last Date (To)</span>
                        <span style={{ color: pipelineEndDate ? '#34BB88' : '#888', fontWeight: '600' }}>
                          {pipelineEndDate ? new Date(pipelineEndDate + 'T00:00:00').toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : (pipelineStartDate ? 'Click 2nd date' : '---')}
                        </span>
                      </div>
                    </div>

                    {/* VISUAL INTERACTIVE CALENDAR GRID */}
                    <div style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '16px',
                      padding: '12px'
                    }}>
                      {/* Month Year Header & Prev/Next Arrows */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            if (calViewMonth === 0) {
                              setCalViewMonth(11);
                              setCalViewYear(prev => prev - 1);
                            } else {
                              setCalViewMonth(prev => prev - 1);
                            }
                          }}
                          style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}
                        >
                          ‹
                        </button>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#ffffff' }}>
                          {new Date(calViewYear, calViewMonth, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (calViewMonth === 11) {
                              setCalViewMonth(0);
                              setCalViewYear(prev => prev + 1);
                            } else {
                              setCalViewMonth(prev => prev + 1);
                            }
                          }}
                          style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}
                        >
                          ›
                        </button>
                      </div>

                      {/* Weekday Headers */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', textAlign: 'center', marginBottom: '6px' }}>
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d, i) => (
                          <span key={i} style={{ fontSize: '11px', fontWeight: '600', color: 'rgba(255, 255, 255, 0.4)' }}>
                            {d}
                          </span>
                        ))}
                      </div>

                      {/* Days Grid */}
                      {(() => {
                        const firstDay = new Date(calViewYear, calViewMonth, 1).getDay();
                        const totalDays = new Date(calViewYear, calViewMonth + 1, 0).getDate();
                        const cells = [];

                        // Empty padding cells for start of month
                        for (let i = 0; i < firstDay; i++) {
                          cells.push(<div key={`blank-${i}`} />);
                        }

                        // Day cells
                        for (let day = 1; day <= totalDays; day++) {
                          const mStr = String(calViewMonth + 1).padStart(2, '0');
                          const dStr = String(day).padStart(2, '0');
                          const cellDateStr = `${calViewYear}-${mStr}-${dStr}`;

                          const isStart = pipelineStartDate === cellDateStr;
                          const isEnd = pipelineEndDate === cellDateStr;
                          const isInRange = pipelineStartDate && pipelineEndDate && cellDateStr >= pipelineStartDate && cellDateStr <= pipelineEndDate;
                          const isToday = new Date().toISOString().split('T')[0] === cellDateStr;

                          cells.push(
                            <button
                              key={day}
                              type="button"
                              onClick={() => {
                                if (!pipelineStartDate || (pipelineStartDate && pipelineEndDate)) {
                                  setPipelineStartDate(cellDateStr);
                                  setPipelineEndDate('');
                                  setPipelineDatePreset('Custom');
                                } else if (pipelineStartDate && !pipelineEndDate) {
                                  if (cellDateStr < pipelineStartDate) {
                                    setPipelineEndDate(pipelineStartDate);
                                    setPipelineStartDate(cellDateStr);
                                  } else {
                                    setPipelineEndDate(cellDateStr);
                                  }
                                  setPipelineDatePreset('Custom');
                                }
                              }}
                              style={{
                                height: '30px',
                                width: '100%',
                                border: 'none',
                                borderRadius: isStart || isEnd ? '8px' : isInRange ? '6px' : '8px',
                                backgroundColor: isStart || isEnd
                                  ? '#34BB88'
                                  : isInRange
                                  ? 'rgba(52, 187, 136, 0.25)'
                                  : 'transparent',
                                color: isStart || isEnd
                                  ? '#000000'
                                  : isInRange
                                  ? '#34BB88'
                                  : isToday
                                  ? '#FFE76B'
                                  : '#ffffff',
                                fontWeight: isStart || isEnd || isToday ? '700' : '400',
                                fontSize: '12px',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                outline: 'none'
                              }}
                            >
                              {day}
                            </button>
                          );
                        }

                        return (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
                            {cells}
                          </div>
                        );
                      })()}
                    </div>

                    {/* ACTION BUTTONS */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setPipelineStartDate('');
                          setPipelineEndDate('');
                          setPipelineDateOffset(0);
                          setPipelineDatePreset('All');
                          setShowPipelineDateModal(false);
                        }}
                        style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '12px', cursor: 'pointer' }}
                      >
                        Reset Filter
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowPipelineDateModal(false)}
                        style={{ backgroundColor: '#34BB88', color: '#000', border: 'none', borderRadius: '10px', padding: '8px 20px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
                      >
                        Apply Filter
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 6 STAGE KANBAN COLUMNS (Exactly 3 Columns Visible Per Screen View) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, calc((100% - 40px) / 3))',
              gap: '20px',
              overflowX: 'auto',
              paddingBottom: '20px'
            }}>
              {[
                { key: 'Link Shared', label: 'Link Shared', icon: Share2, color: '#FFE76B', bg: 'rgba(255, 231, 107, 0.12)', border: 'rgba(255, 231, 107, 0.3)' },
                { key: 'Candidate', label: 'Candidates', icon: User, color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.12)', border: 'rgba(59, 130, 246, 0.3)' },
                { key: 'Interview', label: 'Interview', icon: Calendar, color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)' },
                { key: 'Training', label: 'Training', icon: GraduationCap, color: '#A855F7', bg: 'rgba(168, 85, 247, 0.12)', border: 'rgba(168, 85, 247, 0.3)' },
                { key: 'Mock Call', label: 'Mock Call', icon: PhoneCall, color: '#EC4899', bg: 'rgba(236, 72, 153, 0.12)', border: 'rgba(236, 72, 153, 0.3)' },
                { key: 'Employee', label: 'Employee', icon: CheckCircle2, color: '#34BB88', bg: 'rgba(52, 187, 136, 0.12)', border: 'rgba(52, 187, 136, 0.3)' }
              ].map((col) => {
                const stageCandidates = candidates.filter(c => {
                  const isIncomplete = !c.email || !c.phone || !c.fatherName || c.name.includes('Lead') || c.name.includes('Pre-Generated');
                  
                  let isStageMatch = false;
                  if (col.key === 'Link Shared') {
                    isStageMatch = isIncomplete || c.stage === 'Link Shared';
                  } else if (col.key === 'Candidate') {
                    isStageMatch = !isIncomplete && (c.stage === 'Candidate' || c.stage === 'Lead');
                  } else {
                    isStageMatch = c.stage === col.key;
                  }

                  if (!isStageMatch) return false;

                  if (pipelineStartDate) {
                    if (c.dateAdded && c.dateAdded < pipelineStartDate) return false;
                  }
                  if (pipelineEndDate) {
                    if (c.dateAdded && c.dateAdded > pipelineEndDate) return false;
                  }
                  return true;
                });
                const isTarget = dragOverStage === col.key;
                const IconComponent = col.icon;

                return (
                  <div
                    key={col.key}
                    onDragOver={(e) => handleDragOver(e, col.key)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, col.key as Candidate['stage'])}
                    style={{
                      backgroundColor: isTarget ? 'rgba(255, 255, 255, 0.05)' : '#222222',
                      border: isTarget ? `2px dashed ${col.color}` : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '20px',
                      padding: '20px',
                      minHeight: '500px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px',
                      transition: 'all 0.2s ease',
                      boxShadow: isTarget ? `0 0 24px ${col.bg}` : 'none'
                    }}
                  >
                    {/* COLUMN HEADER */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingBottom: '12px',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '10px',
                          background: col.bg,
                          border: `1px solid ${col.border}`,
                          color: col.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <IconComponent size={16} />
                        </div>
                        <span style={{ fontSize: '15px', fontWeight: '700', color: '#FFFFFF' }}>{col.label}</span>
                      </div>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: '700',
                        color: col.color,
                        background: col.bg,
                        border: `1px solid ${col.border}`,
                        padding: '3px 10px',
                        borderRadius: '12px'
                      }}>
                        {stageCandidates.length}
                      </span>
                    </div>

                    {/* CANDIDATE CARDS */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      flex: 1,
                      overflowY: 'auto'
                    }}>
                      {stageCandidates.length === 0 ? (
                        <div style={{
                          padding: '40px 12px',
                          textAlign: 'center',
                          color: 'rgba(255, 255, 255, 0.3)',
                          fontSize: '13px',
                          border: '1.5px dashed rgba(255, 255, 255, 0.08)',
                          borderRadius: '14px',
                          marginTop: '8px'
                        }}>
                          Drop candidate here
                        </div>
                      ) : (
                        stageCandidates.map((c) => {
                          const isBeingDragged = draggedCandidateId === c.id;
                          return (
                            <div
                              key={c.id}
                              draggable={true}
                              onDragStart={(e) => handleDragStart(e, c.id)}
                              onDragEnd={() => setDraggedCandidateId(null)}
                              style={{
                                backgroundColor: isBeingDragged ? 'rgba(255, 255, 255, 0.03)' : '#2a2a2a',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '14px',
                                padding: '14px',
                                cursor: 'grab',
                                opacity: isBeingDragged ? 0.4 : 1,
                                transform: isBeingDragged ? 'scale(0.96)' : 'scale(1)',
                                transition: 'transform 0.2s, border-color 0.2s, opacity 0.2s',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)'
                              }}
                              onMouseOver={(e) => e.currentTarget.style.borderColor = col.color}
                              onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <div>
                                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#FFFFFF' }}>{c.name}</h4>
                                  <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>{c.role}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <a
                                    href={`tel:${c.phone}`}
                                    onClick={(e) => e.stopPropagation()}
                                    style={{
                                      width: '26px',
                                      height: '26px',
                                      borderRadius: '50%',
                                      background: 'rgba(52, 187, 136, 0.15)',
                                      border: '1px solid rgba(52, 187, 136, 0.3)',
                                      color: '#34BB88',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      transition: 'transform 0.2s',
                                      textDecoration: 'none'
                                    }}
                                    onMouseOver={(e: React.MouseEvent<HTMLAnchorElement>) => e.currentTarget.style.transform = 'scale(1.1)'}
                                    onMouseOut={(e: React.MouseEvent<HTMLAnchorElement>) => e.currentTarget.style.transform = 'scale(1)'}
                                    title={`Call ${c.phone}`}
                                  >
                                    <PhoneCall size={12} />
                                  </a>
                                  <a
                                    href={`https://wa.me/${c.phone.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    style={{
                                      width: '26px',
                                      height: '26px',
                                      borderRadius: '50%',
                                      background: 'rgba(37, 211, 102, 0.15)',
                                      border: '1px solid rgba(37, 211, 102, 0.3)',
                                      color: '#25D366',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      transition: 'transform 0.2s',
                                      textDecoration: 'none'
                                    }}
                                    onMouseOver={(e: React.MouseEvent<HTMLAnchorElement>) => e.currentTarget.style.transform = 'scale(1.1)'}
                                    onMouseOut={(e: React.MouseEvent<HTMLAnchorElement>) => e.currentTarget.style.transform = 'scale(1)'}
                                    title={`WhatsApp ${c.phone}`}
                                  >
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.99c-.001 5.45-4.436 9.884-9.886 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662a11.87 11.87 0 005.708 1.454h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                    </svg>
                                  </a>
                                  <div style={{ color: 'rgba(255, 255, 255, 0.35)', cursor: 'grab', marginLeft: '4px' }}>
                                    <GripVertical size={16} />
                                  </div>
                                </div>
                              </div>

                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', color: 'rgba(255, 255, 255, 0.55)', marginTop: '8px', paddingTop: '4px', marginBottom: '10px' }}>
                                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.email || 'No Email'}</div>
                                <div>{c.phone || 'No Phone'}</div>
                              </div>

                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  {c.cvUrl || c.cvFileName ? (
                                    <a
                                      href={(() => {
                                        let uuid = c.id;
                                        let refId = c.candidate_id || c.ref_id || 'CND-001';
                                        if (c.shareableLink) {
                                          try {
                                            const parsed = typeof c.shareableLink === 'string' && c.shareableLink.startsWith('{')
                                              ? JSON.parse(c.shareableLink)
                                              : c.shareableLink;
                                            if (typeof parsed === 'object' && parsed !== null) {
                                              if (parsed.uuid) uuid = parsed.uuid;
                                              if (parsed.ref_id) refId = parsed.ref_id;
                                            } else if (typeof c.shareableLink === 'string') {
                                              const match = c.shareableLink.match(/\/([a-zA-Z0-9]+)\/apply/);
                                              if (match && match[1]) uuid = match[1];
                                            }
                                          } catch (err) {}
                                        }
                                        return `/profile=${uuid}?ref=${refId}&page=pdf`;
                                      })()}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        fontSize: '11px',
                                        fontWeight: '600',
                                        color: '#34BB88',
                                        backgroundColor: 'rgba(52, 187, 136, 0.12)',
                                        border: '1px solid rgba(52, 187, 136, 0.3)',
                                        borderRadius: '6px',
                                        padding: '2px 7px',
                                        textDecoration: 'none'
                                      }}
                                    >
                                      <FileText size={11} />
                                      <span>View PDF</span>
                                    </a>
                                  ) : null}

                                  {col.key === 'Link Shared' ? (
                                    <span style={{ fontSize: '10px', color: '#FFE76B', background: 'rgba(255, 231, 107, 0.12)', border: '1px solid rgba(255, 231, 107, 0.3)', padding: '2px 8px', borderRadius: '8px', fontWeight: '600' }}>
                                      Incomplete Profile
                                    </span>
                                  ) : null}
                                </div>

                                {col.key === 'Link Shared' ? (
                                  <button
                                    type="button"
                                    title="Copy Candidate Link"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      let link = '';
                                      if (c.shareableLink) {
                                        try {
                                          const parsed = typeof c.shareableLink === 'string' && c.shareableLink.startsWith('{')
                                            ? JSON.parse(c.shareableLink)
                                            : c.shareableLink;
                                          if (typeof parsed === 'object' && parsed !== null && parsed.uuid) {
                                            const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
                                            link = `${baseUrl}/${parsed.uuid}/apply?ref=${parsed.ref_id || c.id}`;
                                          } else if (typeof c.shareableLink === 'string') {
                                            link = c.shareableLink;
                                          }
                                        } catch (err) {}
                                      }
                                      if (!link) {
                                        const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
                                        link = `${baseUrl}/${c.id}/apply?ref=${c.id}`;
                                      }
                                      navigator.clipboard.writeText(link);
                                      alert(`Candidate application link copied to clipboard:\n${link}`);
                                    }}
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      padding: '3px 8px',
                                      backgroundColor: 'rgba(59, 130, 246, 0.15)',
                                      border: '1px solid rgba(59, 130, 246, 0.3)',
                                      borderRadius: '8px',
                                      color: '#3B82F6',
                                      fontSize: '11px',
                                      fontWeight: '600',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    <Share2 size={11} />
                                    <span>Copy Link</span>
                                  </button>
                                ) : (
                                  <span style={{ fontSize: '11px', fontWeight: '600', color: col.color }}>
                                    {c.mockScore ? `${c.mockScore}% Score` : col.label}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CANDIDATES TAB */}
        {activeTab === 'Candidates' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* EXACT FILTER HEADER BAR DESIGN */}
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
              {/* Left Stage Filter Buttons */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                {[
                  { key: 'All', label: 'All', count: candidates.length },
                  { key: 'Lead', label: 'Lead', count: candidates.filter(c => c.stage === 'Lead' || c.stage === 'Candidate').length },
                  { key: 'Interview', label: 'Interview', count: candidates.filter(c => c.stage === 'Interview').length },
                  { key: 'Training', label: 'Training', count: candidates.filter(c => c.stage === 'Training').length },
                  { key: 'Mock Call', label: 'Mock Call', count: candidates.filter(c => c.stage === 'Mock Call').length },
                  { key: 'Employee', label: 'Employee', count: candidates.filter(c => c.stage === 'Employee').length },
                ].map((stg) => {
                  const isActive = stageFilter === stg.key;
                  return (
                    <button
                      key={stg.key}
                      onClick={() => setStageFilter(stg.key)}
                      style={{
                        padding: '7px 12px',
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: isActive ? '600' : '400',
                        color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.6)',
                        background: isActive ? 'rgb(54, 54, 54)' : 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {stg.label} ({stg.count})
                    </button>
                  );
                })}
              </div>

              {/* Right Side: Search Input + View Mode Switcher (Fixed Right) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto', minWidth: '280px', maxWidth: '360px' }}>
                <div style={{ position: 'relative', flex: '1 1 0%' }}>
                  <Search
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'rgba(255, 255, 255, 0.4)',
                      pointerEvents: 'none'
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Search candidate, ID, role..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px 9px 36px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      color: '#ffffff',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* Grid vs Table View Mode Switcher */}
                <div style={{
                  display: 'flex',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  padding: '3px',
                  gap: '2px'
                }}>
                  <button
                    title="Grid View"
                    onClick={() => setViewMode('grid')}
                    style={{
                      padding: '7px 10px',
                      borderRadius: '8px',
                      border: 'none',
                      background: viewMode === 'grid' ? 'rgb(54, 54, 54)' : 'transparent',
                      color: viewMode === 'grid' ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
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
                    title="Table View"
                    onClick={() => setViewMode('table')}
                    style={{
                      padding: '7px 10px',
                      borderRadius: '8px',
                      border: 'none',
                      background: viewMode === 'table' ? 'rgb(54, 54, 54)' : 'transparent',
                      color: viewMode === 'table' ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
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

            {/* CANDIDATES LIST: GRID vs TABLE VIEW */}
            {viewMode === 'grid' ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '16px'
              }}>
                {filteredCandidates.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      backgroundColor: '#262626',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '16px',
                      padding: '18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#FFFFFF' }}>{c.name}</h4>
                        <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>{c.role}</span>
                      </div>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '600',
                        backgroundColor: c.stage === 'Employee' ? 'rgba(74, 222, 128, 0.15)' : 'rgba(255,255,255,0.08)',
                        color: c.stage === 'Employee' ? '#4ADE80' : c.stage === 'Interview' ? '#a855f7' : '#fff'
                      }}>
                        {c.stage}
                      </span>
                    </div>

                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div>{c.email}</div>
                      <div>{c.phone}</div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ fontSize: '12px', color: '#888' }}>Added {c.dateAdded}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {(!c.email || !c.phone || !c.fatherName || c.name.includes('Lead') || c.name.includes('Pre-Generated')) && (
                          <button
                            type="button"
                            title="Copy Candidate Application Link to complete profile"
                            onClick={(e) => {
                              e.stopPropagation();
                              let link = '';
                              if (c.shareableLink) {
                                try {
                                  const parsed = typeof c.shareableLink === 'string' && c.shareableLink.startsWith('{')
                                    ? JSON.parse(c.shareableLink)
                                    : c.shareableLink;
                                  if (typeof parsed === 'object' && parsed !== null && parsed.uuid) {
                                    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
                                    link = `${baseUrl}/${parsed.uuid}/apply?ref=${parsed.ref_id || c.id}`;
                                  } else if (typeof c.shareableLink === 'string') {
                                    link = c.shareableLink;
                                  }
                                } catch (err) {}
                              }
                              if (!link) {
                                const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
                                link = `${baseUrl}/${c.id}/apply?ref=${c.id}`;
                              }
                              navigator.clipboard.writeText(link);
                              alert(`Candidate application link copied to clipboard:\n${link}`);
                            }}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '4px 8px',
                              backgroundColor: 'rgba(59, 130, 246, 0.15)',
                              border: '1px solid rgba(59, 130, 246, 0.3)',
                              borderRadius: '6px',
                              color: '#3B82F6',
                              fontSize: '11px',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            <Share2 size={11} />
                            <span>Copy Link</span>
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedCandidate(c)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#34BB88',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          View Detail →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                backgroundColor: '#262626',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.05)'
              }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <th style={{ padding: '16px', color: '#888', fontSize: '13px', fontWeight: '500' }}>CANDIDATE</th>
                        <th style={{ padding: '16px', color: '#888', fontSize: '13px', fontWeight: '500' }}>ROLE</th>
                        <th style={{ padding: '16px', color: '#888', fontSize: '13px', fontWeight: '500' }}>CONTACT</th>
                        <th style={{ padding: '16px', color: '#888', fontSize: '13px', fontWeight: '500' }}>STAGE</th>
                        <th style={{ padding: '16px', color: '#888', fontSize: '13px', fontWeight: '500', textAlign: 'right' }}>ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCandidates.map((c) => (
                        <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '16px' }}>
                            <div style={{ fontWeight: '600', color: 'var(--text-color)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span>{c.name}</span>
                              {(!c.email || !c.phone || !c.fatherName || c.name.includes('Lead') || c.name.includes('Pre-Generated')) && (
                                <span style={{ fontSize: '10px', color: '#FFE76B', backgroundColor: 'rgba(255, 231, 107, 0.12)', border: '1px solid rgba(255, 231, 107, 0.3)', padding: '1px 6px', borderRadius: '4px', fontWeight: '500' }}>
                                  Incomplete
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '11px', color: '#888' }}>Added {c.dateAdded}</div>
                          </td>
                          <td style={{ padding: '16px', color: '#A3A3A3', fontSize: '14px' }}>{c.role}</td>
                          <td style={{ padding: '16px' }}>
                            <div style={{ fontSize: '13px', color: '#A3A3A3' }}>{c.email || 'N/A'}</div>
                            <div style={{ fontSize: '11px', color: '#888' }}>{c.phone || 'N/A'}</div>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <span style={{
                              padding: '4px 10px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: '600',
                              backgroundColor: c.stage === 'Employee' ? 'rgba(74, 222, 128, 0.15)' : 'rgba(255,255,255,0.08)',
                              color: c.stage === 'Employee' ? '#4ADE80' : c.stage === 'Interview' ? '#a855f7' : '#fff'
                            }}>
                              {c.stage}
                            </span>
                          </td>
                          <td style={{ padding: '16px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                              {(!c.email || !c.phone || !c.fatherName || c.name.includes('Lead') || c.name.includes('Pre-Generated')) && (
                                <button
                                  type="button"
                                  title="Copy Candidate Application Link to complete profile"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    let link = '';
                                    if (c.shareableLink) {
                                      try {
                                        const parsed = typeof c.shareableLink === 'string' && c.shareableLink.startsWith('{')
                                          ? JSON.parse(c.shareableLink)
                                          : c.shareableLink;
                                        if (typeof parsed === 'object' && parsed !== null && parsed.uuid) {
                                          const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
                                          link = `${baseUrl}/${parsed.uuid}/apply?ref=${parsed.ref_id || c.id}`;
                                        } else if (typeof c.shareableLink === 'string') {
                                          link = c.shareableLink;
                                        }
                                      } catch (err) {}
                                    }
                                    if (!link) {
                                      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
                                      link = `${baseUrl}/${c.id}/apply?ref=${c.id}`;
                                    }
                                    navigator.clipboard.writeText(link);
                                    alert(`Candidate application link copied to clipboard:\n${link}`);
                                  }}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    padding: '5px 10px',
                                    backgroundColor: 'rgba(59, 130, 246, 0.15)',
                                    border: '1px solid rgba(59, 130, 246, 0.3)',
                                    borderRadius: '8px',
                                    color: '#3B82F6',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                  }}
                                >
                                  <Share2 size={12} />
                                  <span>Complete Profile Link</span>
                                </button>
                              )}
                              <button
                                onClick={() => setSelectedCandidate(c)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#A3A3A3',
                                  fontSize: '12px',
                                  fontWeight: '500',
                                  cursor: 'pointer',
                                  padding: 0
                                }}
                              >
                                View
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* INTERVIEWS TAB */}
        {activeTab === 'Interviews' && (() => {
          const filteredInterviews = candidates.filter(c => {
            const isInterviewCandidate = c.stage === 'Interview' || c.interviewTime;
            if (!isInterviewCandidate) return false;
            const matchesSearch = c.name.toLowerCase().includes(interviewSearchQuery.toLowerCase()) ||
                                  c.role.toLowerCase().includes(interviewSearchQuery.toLowerCase()) ||
                                  c.email.toLowerCase().includes(interviewSearchQuery.toLowerCase());
            const matchesFilter = interviewStageFilter === 'All' ||
                                  (interviewStageFilter === 'Scheduled' && c.interviewTime) ||
                                  (interviewStageFilter === 'Passed' && c.mockStatus === 'Passed') ||
                                  (interviewStageFilter === 'Pending' && c.mockStatus === 'Pending');
            return matchesSearch && matchesFilter;
          });

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* EXACT FILTER HEADER BAR DESIGN */}
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
                {/* Left Filter Buttons */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                  {[
                    { key: 'All', label: 'All', count: candidates.filter(c => c.stage === 'Interview' || c.interviewTime).length },
                    { key: 'Scheduled', label: 'Scheduled', count: candidates.filter(c => c.interviewTime).length },
                    { key: 'Passed', label: 'Passed', count: candidates.filter(c => c.mockStatus === 'Passed').length },
                    { key: 'Pending', label: 'Pending', count: candidates.filter(c => c.mockStatus === 'Pending').length },
                  ].map((stg) => {
                    const isActive = interviewStageFilter === stg.key;
                    return (
                      <button
                        key={stg.key}
                        onClick={() => setInterviewStageFilter(stg.key)}
                        style={{
                          padding: '7px 12px',
                          borderRadius: '10px',
                          fontSize: '13px',
                          fontWeight: isActive ? '600' : '400',
                          color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.6)',
                          background: isActive ? 'rgb(54, 54, 54)' : 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {stg.label} ({stg.count})
                      </button>
                    );
                  })}
                </div>

                {/* Right Side: Search Input + View Mode Switcher (Fixed Right) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto', minWidth: '280px', maxWidth: '360px' }}>
                  <div style={{ position: 'relative', flex: '1 1 0%' }}>
                    <Search
                      size={16}
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'rgba(255, 255, 255, 0.4)',
                        pointerEvents: 'none'
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Search interview candidate, role..."
                      value={interviewSearchQuery}
                      onChange={(e) => setInterviewSearchQuery(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px 9px 36px',
                        borderRadius: '10px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        color: '#ffffff',
                        fontSize: '13px',
                        outline: 'none'
                      }}
                    />
                  </div>

                  {/* Grid vs Table View Mode Switcher */}
                  <div style={{
                    display: 'flex',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px',
                    padding: '3px',
                    gap: '2px'
                  }}>
                    <button
                      title="Grid View"
                      onClick={() => setInterviewViewMode('grid')}
                      style={{
                        padding: '7px 10px',
                        borderRadius: '8px',
                        border: 'none',
                        background: interviewViewMode === 'grid' ? 'rgb(54, 54, 54)' : 'transparent',
                        color: interviewViewMode === 'grid' ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
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
                      title="Table View"
                      onClick={() => setInterviewViewMode('table')}
                      style={{
                        padding: '7px 10px',
                        borderRadius: '8px',
                        border: 'none',
                        background: interviewViewMode === 'table' ? 'rgb(54, 54, 54)' : 'transparent',
                        color: interviewViewMode === 'table' ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
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

              {/* INTERVIEWS LIST: GRID vs TABLE VIEW */}
              {interviewViewMode === 'grid' ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '16px'
                }}>
                  {filteredInterviews.map((c) => (
                    <div
                      key={c.id}
                      style={{
                        backgroundColor: '#262626',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '16px',
                        padding: '18px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#FFFFFF' }}>{c.name}</h4>
                          <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>{c.role}</span>
                        </div>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '600',
                          backgroundColor: 'rgba(168, 85, 247, 0.15)',
                          color: '#a855f7'
                        }}>
                          {c.interviewTime || 'Scheduled'}
                        </span>
                      </div>

                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div>{c.email}</div>
                        <div>{c.phone}</div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        <span style={{ fontSize: '12px', color: '#888' }}>Added {c.dateAdded}</span>
                        <button
                          onClick={() => setSelectedCandidate(c)}
                          style={{
                            padding: '6px 14px',
                            backgroundColor: 'var(--text-color)',
                            color: '#000',
                            border: 'none',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          Join / Review
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  backgroundColor: '#262626',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.05)'
                }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <th style={{ padding: '16px', color: '#888', fontSize: '13px', fontWeight: '500' }}>CANDIDATE</th>
                          <th style={{ padding: '16px', color: '#888', fontSize: '13px', fontWeight: '500' }}>ROLE</th>
                          <th style={{ padding: '16px', color: '#888', fontSize: '13px', fontWeight: '500' }}>CONTACT</th>
                          <th style={{ padding: '16px', color: '#888', fontSize: '13px', fontWeight: '500' }}>INTERVIEW TIME</th>
                          <th style={{ padding: '16px', color: '#888', fontSize: '13px', fontWeight: '500', textAlign: 'right' }}>ACTION</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredInterviews.map((c) => (
                          <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '16px' }}>
                              <div style={{ fontWeight: '600', color: 'var(--text-color)', fontSize: '14px' }}>{c.name}</div>
                              <div style={{ fontSize: '11px', color: '#888' }}>Added {c.dateAdded}</div>
                            </td>
                            <td style={{ padding: '16px', color: '#A3A3A3', fontSize: '14px' }}>{c.role}</td>
                            <td style={{ padding: '16px' }}>
                              <div style={{ fontSize: '13px', color: '#A3A3A3' }}>{c.email}</div>
                              <div style={{ fontSize: '11px', color: '#888' }}>{c.phone}</div>
                            </td>
                            <td style={{ padding: '16px' }}>
                              <span style={{
                                padding: '4px 10px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: '600',
                                backgroundColor: 'rgba(168, 85, 247, 0.15)',
                                color: '#a855f7'
                              }}>
                                {c.interviewTime || 'Scheduled'}
                              </span>
                            </td>
                            <td style={{ padding: '16px', textAlign: 'right' }}>
                              <button
                                onClick={() => setSelectedCandidate(c)}
                                style={{
                                  padding: '6px 14px',
                                  backgroundColor: 'var(--text-color)',
                                  color: '#000',
                                  border: 'none',
                                  borderRadius: '20px',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  cursor: 'pointer'
                                }}
                              >
                                Join / Review
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* TRAINING TAB */}
        {activeTab === 'Training' && (() => {
          const filteredTrainingCandidates = candidates.filter(c => {
            const isTrainingCandidate = c.stage === 'Training' || c.batch;
            if (!isTrainingCandidate) return false;
            const matchesSearch = c.name.toLowerCase().includes(trainingSearchQuery.toLowerCase()) ||
                                  c.role.toLowerCase().includes(trainingSearchQuery.toLowerCase()) ||
                                  (c.batch && c.batch.toLowerCase().includes(trainingSearchQuery.toLowerCase()));
            const matchesFilter = trainingStageFilter === 'All' ||
                                  (trainingStageFilter === 'Batch #11' && c.batch === 'Batch #11') ||
                                  (trainingStageFilter === 'Batch #12' && c.batch === 'Batch #12') ||
                                  (trainingStageFilter === 'Batch #10' && c.batch === 'Batch #10');
            return matchesSearch && matchesFilter;
          });

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Batches Overview Cards */}
              <div style={{
                backgroundColor: '#363636',
                borderRadius: '24px',
                padding: '24px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div className="top-right-pattern" style={{ opacity: 0.15, right: 'auto', left: '-20px', top: '-20px', zIndex: 0 }} />
                <MeteorShower />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <h2 style={{ color: 'var(--text-color)', fontSize: '18px', fontWeight: '600', margin: '0 0 20px 0' }}>
                    Training Batches Overview
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                    <div style={{ backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: '16px', padding: '18px' }}>
                      <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#fff', margin: '0 0 6px 0' }}>Batch #12</h4>
                      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: '0 0 14px 0' }}>Starts 02 Sep | 12 Candidates</p>
                      <span style={{ padding: '4px 10px', backgroundColor: 'rgba(68, 132, 255, 0.15)', color: '#4484FF', borderRadius: '10px', fontSize: '11px', fontWeight: '600' }}>Upcoming</span>
                    </div>

                    <div style={{ backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: '16px', padding: '18px' }}>
                      <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#fff', margin: '0 0 6px 0' }}>Batch #11</h4>
                      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: '0 0 14px 0' }}>Started 26 Aug | 15 Candidates | 57% Progress</p>
                      <span style={{ padding: '4px 10px', backgroundColor: 'rgba(255, 231, 107, 0.15)', color: '#FFE76B', borderRadius: '10px', fontSize: '11px', fontWeight: '600' }}>In Progress</span>
                    </div>

                    <div style={{ backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: '16px', padding: '18px' }}>
                      <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#fff', margin: '0 0 6px 0' }}>Batch #10</h4>
                      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: '0 0 14px 0' }}>Started 19 Aug | 11 Candidates | 100% Completed</p>
                      <span style={{ padding: '4px 10px', backgroundColor: 'rgba(74, 222, 128, 0.15)', color: '#4ADE80', borderRadius: '10px', fontSize: '11px', fontWeight: '600' }}>Completed</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* EXACT FILTER HEADER BAR DESIGN */}
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
                {/* Left Filter Buttons */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                  {[
                    { key: 'All', label: 'All', count: candidates.filter(c => c.stage === 'Training' || c.batch).length },
                    { key: 'Batch #11', label: 'Batch #11', count: candidates.filter(c => c.batch === 'Batch #11').length },
                    { key: 'Batch #12', label: 'Batch #12', count: candidates.filter(c => c.batch === 'Batch #12').length },
                    { key: 'Batch #10', label: 'Batch #10', count: candidates.filter(c => c.batch === 'Batch #10').length },
                  ].map((stg) => {
                    const isActive = trainingStageFilter === stg.key;
                    return (
                      <button
                        key={stg.key}
                        onClick={() => setTrainingStageFilter(stg.key)}
                        style={{
                          padding: '7px 12px',
                          borderRadius: '10px',
                          fontSize: '13px',
                          fontWeight: isActive ? '600' : '400',
                          color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.6)',
                          background: isActive ? 'rgb(54, 54, 54)' : 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {stg.label} ({stg.count})
                      </button>
                    );
                  })}
                </div>

                {/* Right Side: Search Input + View Mode Switcher (Fixed Right) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto', minWidth: '280px', maxWidth: '360px' }}>
                  <div style={{ position: 'relative', flex: '1 1 0%' }}>
                    <Search
                      size={16}
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'rgba(255, 255, 255, 0.4)',
                        pointerEvents: 'none'
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Search training candidate, batch..."
                      value={trainingSearchQuery}
                      onChange={(e) => setTrainingSearchQuery(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px 9px 36px',
                        borderRadius: '10px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        color: '#ffffff',
                        fontSize: '13px',
                        outline: 'none'
                      }}
                    />
                  </div>

                  {/* Grid vs Table View Mode Switcher */}
                  <div style={{
                    display: 'flex',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px',
                    padding: '3px',
                    gap: '2px'
                  }}>
                    <button
                      title="Grid View"
                      onClick={() => setTrainingViewMode('grid')}
                      style={{
                        padding: '7px 10px',
                        borderRadius: '8px',
                        border: 'none',
                        background: trainingViewMode === 'grid' ? 'rgb(54, 54, 54)' : 'transparent',
                        color: trainingViewMode === 'grid' ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
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
                      title="Table View"
                      onClick={() => setTrainingViewMode('table')}
                      style={{
                        padding: '7px 10px',
                        borderRadius: '8px',
                        border: 'none',
                        background: trainingViewMode === 'table' ? 'rgb(54, 54, 54)' : 'transparent',
                        color: trainingViewMode === 'table' ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
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

              {/* TRAINING CANDIDATES TABLE / GRID VIEW */}
              {trainingViewMode === 'grid' ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '16px'
                }}>
                  {filteredTrainingCandidates.map((c) => (
                    <div
                      key={c.id}
                      style={{
                        backgroundColor: '#262626',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '16px',
                        padding: '18px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#FFFFFF' }}>{c.name}</h4>
                          <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>{c.role}</span>
                        </div>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '600',
                          backgroundColor: 'rgba(255, 231, 107, 0.15)',
                          color: '#FFE76B'
                        }}>
                          {c.batch || 'Batch Active'}
                        </span>
                      </div>

                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div>{c.email}</div>
                        <div>{c.phone}</div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        <span style={{ fontSize: '12px', color: '#888' }}>Stage: {c.stage}</span>
                        <button
                          onClick={() => setSelectedCandidate(c)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#FFE76B',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          View Progress →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  backgroundColor: '#262626',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.05)'
                }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <th style={{ padding: '16px', color: '#888', fontSize: '13px', fontWeight: '500' }}>TRAINEE CANDIDATE</th>
                          <th style={{ padding: '16px', color: '#888', fontSize: '13px', fontWeight: '500' }}>ROLE</th>
                          <th style={{ padding: '16px', color: '#888', fontSize: '13px', fontWeight: '500' }}>BATCH</th>
                          <th style={{ padding: '16px', color: '#888', fontSize: '13px', fontWeight: '500' }}>CONTACT</th>
                          <th style={{ padding: '16px', color: '#888', fontSize: '13px', fontWeight: '500', textAlign: 'right' }}>ACTION</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTrainingCandidates.map((c) => (
                          <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '16px' }}>
                              <div style={{ fontWeight: '600', color: 'var(--text-color)', fontSize: '14px' }}>{c.name}</div>
                              <div style={{ fontSize: '11px', color: '#888' }}>Enrolled {c.dateAdded}</div>
                            </td>
                            <td style={{ padding: '16px', color: '#A3A3A3', fontSize: '14px' }}>{c.role}</td>
                            <td style={{ padding: '16px' }}>
                              <span style={{
                                padding: '4px 10px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: '600',
                                backgroundColor: 'rgba(255, 231, 107, 0.15)',
                                color: '#FFE76B'
                              }}>
                                {c.batch || 'Batch Active'}
                              </span>
                            </td>
                            <td style={{ padding: '16px' }}>
                              <div style={{ fontSize: '13px', color: '#A3A3A3' }}>{c.email}</div>
                              <div style={{ fontSize: '11px', color: '#888' }}>{c.phone}</div>
                            </td>
                            <td style={{ padding: '16px', textAlign: 'right' }}>
                              <button
                                onClick={() => setSelectedCandidate(c)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#A3A3A3',
                                  fontSize: '12px',
                                  fontWeight: '500',
                                  cursor: 'pointer',
                                  padding: 0
                                }}
                              >
                                View Progress
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* MOCK CALLS TAB */}
        {activeTab === 'Mock Calls' && (() => {
          const filteredMockCandidates = candidates.filter(c => {
            const matchesSearch = c.name.toLowerCase().includes(mockSearchQuery.toLowerCase()) ||
                                  c.role.toLowerCase().includes(mockSearchQuery.toLowerCase()) ||
                                  c.email.toLowerCase().includes(mockSearchQuery.toLowerCase());
            const matchesFilter = mockStageFilter === 'All' ||
                                  (mockStageFilter === 'Passed' && c.mockStatus === 'Passed') ||
                                  (mockStageFilter === 'Failed' && c.mockStatus === 'Failed') ||
                                  (mockStageFilter === 'Pending' && (c.mockStatus === 'Pending' || !c.mockStatus));
            return matchesSearch && matchesFilter;
          });

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* EXACT FILTER HEADER BAR DESIGN */}
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
                {/* Left Filter Buttons */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                  {[
                    { key: 'All', label: 'All', count: candidates.length },
                    { key: 'Passed', label: 'Passed', count: candidates.filter(c => c.mockStatus === 'Passed').length },
                    { key: 'Failed', label: 'Failed', count: candidates.filter(c => c.mockStatus === 'Failed').length },
                    { key: 'Pending', label: 'Pending', count: candidates.filter(c => c.mockStatus === 'Pending' || !c.mockStatus).length },
                  ].map((stg) => {
                    const isActive = mockStageFilter === stg.key;
                    return (
                      <button
                        key={stg.key}
                        onClick={() => setMockStageFilter(stg.key)}
                        style={{
                          padding: '7px 12px',
                          borderRadius: '10px',
                          fontSize: '13px',
                          fontWeight: isActive ? '600' : '400',
                          color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.6)',
                          background: isActive ? 'rgb(54, 54, 54)' : 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {stg.label} ({stg.count})
                      </button>
                    );
                  })}
                </div>

                {/* Right Side: Search Input + View Mode Switcher (Fixed Right) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto', minWidth: '280px', maxWidth: '360px' }}>
                  <div style={{ position: 'relative', flex: '1 1 0%' }}>
                    <Search
                      size={16}
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'rgba(255, 255, 255, 0.4)',
                        pointerEvents: 'none'
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Search mock call candidate, role..."
                      value={mockSearchQuery}
                      onChange={(e) => setMockSearchQuery(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px 9px 36px',
                        borderRadius: '10px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        color: '#ffffff',
                        fontSize: '13px',
                        outline: 'none'
                      }}
                    />
                  </div>

                  {/* Grid vs Table View Mode Switcher */}
                  <div style={{
                    display: 'flex',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px',
                    padding: '3px',
                    gap: '2px'
                  }}>
                    <button
                      title="Grid View"
                      onClick={() => setMockViewMode('grid')}
                      style={{
                        padding: '7px 10px',
                        borderRadius: '8px',
                        border: 'none',
                        background: mockViewMode === 'grid' ? 'rgb(54, 54, 54)' : 'transparent',
                        color: mockViewMode === 'grid' ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
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
                      title="Table View"
                      onClick={() => setMockViewMode('table')}
                      style={{
                        padding: '7px 10px',
                        borderRadius: '8px',
                        border: 'none',
                        background: mockViewMode === 'table' ? 'rgb(54, 54, 54)' : 'transparent',
                        color: mockViewMode === 'table' ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
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

              {/* MOCK CALLS TABLE / GRID VIEW */}
              {mockViewMode === 'grid' ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '16px'
                }}>
                  {filteredMockCandidates.map((c) => (
                    <div
                      key={c.id}
                      style={{
                        backgroundColor: '#262626',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '16px',
                        padding: '18px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#FFFFFF' }}>{c.name}</h4>
                          <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>{c.role}</span>
                        </div>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '600',
                          backgroundColor: c.mockStatus === 'Passed' ? 'rgba(74, 222, 128, 0.15)' : c.mockStatus === 'Failed' ? 'rgba(253, 101, 121, 0.15)' : 'rgba(255, 231, 107, 0.15)',
                          color: c.mockStatus === 'Passed' ? '#4ADE80' : c.mockStatus === 'Failed' ? '#FD6579' : '#FFE76B'
                        }}>
                          {c.mockStatus || 'Pending'}
                        </span>
                      </div>

                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div>Batch: {c.batch || 'N/A'}</div>
                        <div>Score: {c.mockScore ? `${c.mockScore}/100` : 'Pending Evaluation'}</div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        <span style={{ fontSize: '12px', color: '#888' }}>{c.phone}</span>
                        <button
                          onClick={() => setSelectedCandidate(c)}
                          style={{
                            padding: '6px 14px',
                            backgroundColor: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '14px',
                            color: '#A3A3A3',
                            fontSize: '12px',
                            fontWeight: '500',
                            cursor: 'pointer'
                          }}
                        >
                          Report →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  backgroundColor: '#262626',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.05)'
                }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <th style={{ padding: '16px', color: '#888', fontSize: '13px', fontWeight: '500' }}>CANDIDATE</th>
                          <th style={{ padding: '16px', color: '#888', fontSize: '13px', fontWeight: '500' }}>ROLE</th>
                          <th style={{ padding: '16px', color: '#888', fontSize: '13px', fontWeight: '500' }}>BATCH</th>
                          <th style={{ padding: '16px', color: '#888', fontSize: '13px', fontWeight: '500' }}>SCORE / STATUS</th>
                          <th style={{ padding: '16px', color: '#888', fontSize: '13px', fontWeight: '500', textAlign: 'right' }}>ACTION</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredMockCandidates.map((c) => (
                          <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '16px' }}>
                              <div style={{ fontWeight: '600', color: 'var(--text-color)', fontSize: '14px' }}>{c.name}</div>
                              <div style={{ fontSize: '11px', color: '#888' }}>{c.email}</div>
                            </td>
                            <td style={{ padding: '16px', color: '#A3A3A3', fontSize: '14px' }}>{c.role}</td>
                            <td style={{ padding: '16px', color: '#A3A3A3', fontSize: '13px' }}>{c.batch || 'N/A'}</td>
                            <td style={{ padding: '16px' }}>
                              <span style={{
                                padding: '4px 10px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: '700',
                                backgroundColor: c.mockStatus === 'Passed' ? 'rgba(74, 222, 128, 0.15)' : c.mockStatus === 'Failed' ? 'rgba(253, 101, 121, 0.15)' : 'rgba(255, 231, 107, 0.15)',
                                color: c.mockStatus === 'Passed' ? '#4ADE80' : c.mockStatus === 'Failed' ? '#FD6579' : '#FFE76B'
                              }}>
                                {c.mockScore ? `${c.mockScore}/100 (${c.mockStatus})` : 'Pending'}
                              </span>
                            </td>
                            <td style={{ padding: '16px', textAlign: 'right' }}>
                              <button
                                onClick={() => setSelectedCandidate(c)}
                                style={{
                                  padding: '6px 12px',
                                  backgroundColor: 'rgba(255,255,255,0.06)',
                                  border: '1px solid rgba(255,255,255,0.1)',
                                  borderRadius: '14px',
                                  color: '#A3A3A3',
                                  fontSize: '12px',
                                  fontWeight: '500',
                                  cursor: 'pointer'
                                }}
                              >
                                Report
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

      </div>

      {/* ADD CANDIDATE MODAL */}
      {mounted && showAddModal && createPortal(
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
            maxWidth: '560px',
            padding: '32px',
            boxShadow: '0 24px 64px rgba(0,0,0,0.85)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(52, 187, 136, 0.15)', border: '1px solid rgba(52, 187, 136, 0.3)', color: '#34BB88', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', margin: 0 }}>Add New Candidate</h3>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Register applicant into hiring pipeline</span>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: 'rgba(255,255,255,0.6)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddCandidate} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'rgba(255, 255, 255, 0.85)', marginBottom: '8px' }}>
                  Candidate ID <span style={{ color: '#FFE76B', fontSize: '12px' }}>(Auto-Generated & Read-only)</span>
                </label>
                <input
                  type="text"
                  readOnly
                  disabled
                  value={(() => {
                    let maxNum = 0;
                    candidates.forEach(c => {
                      if (c.id) {
                        const match = c.id.match(/\d+/);
                        if (match) {
                          const num = parseInt(match[0], 10);
                          if (num > maxNum) maxNum = num;
                        }
                      }
                    });
                    return `CND-${String(maxNum + 1).padStart(3, '0')}`;
                  })()}
                  style={{
                    height: '48px',
                    padding: '0 16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    color: '#FFE76B',
                    outline: 'none',
                    fontSize: '14px',
                    width: '100%',
                    cursor: 'not-allowed'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'rgba(255, 255, 255, 0.85)', marginBottom: '8px' }}>Full Name <span style={{ color: '#EF4444' }}>*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={newCandidate.name}
                  onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })}
                  style={{
                    height: '48px',
                    padding: '0 16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    outline: 'none',
                    fontSize: '14px',
                    width: '100%'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'rgba(255, 255, 255, 0.85)', marginBottom: '8px' }}>
                    Email Address <span style={{ color: '#888', fontSize: '12px' }}>(Optional)</span>
                  </label>
                  <input
                    type="email"
                    placeholder="candidate@example.com"
                    value={newCandidate.email}
                    onChange={(e) => setNewCandidate({ ...newCandidate, email: e.target.value })}
                    style={{
                      height: '48px',
                      padding: '0 16px',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: '#fff',
                      outline: 'none',
                      fontSize: '14px',
                      width: '100%'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'rgba(255, 255, 255, 0.85)', marginBottom: '8px' }}>
                    Contact No. <span style={{ color: '#888', fontSize: '12px' }}>(Optional)</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="10-digit phone"
                    value={newCandidate.phone}
                    onChange={(e) => setNewCandidate({ ...newCandidate, phone: e.target.value })}
                    style={{
                      height: '48px',
                      padding: '0 16px',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: '#fff',
                      outline: 'none',
                      fontSize: '14px',
                      width: '100%'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '14px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '12px 28px',
                    backgroundColor: '#34BB88',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#000',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer',
                    boxShadow: '0 8px 24px rgba(52, 187, 136, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <CheckCircle size={16} />
                  <span>Save Candidate</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* SHAREABLE LINK AUTOMATIC POPUP MODAL */}
      {mounted && showShareModal && createPortal(
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#262626',
            border: '1px solid rgba(52, 187, 136, 0.3)',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '520px',
            padding: '32px',
            boxShadow: '0 24px 64px rgba(0,0,0,0.85)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(52, 187, 136, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              color: '#34BB88'
            }}>
              <Share2 size={32} />
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#fff', margin: '0 0 6px 0' }}>
              Candidate Saved & Share Link Ready!
            </h3>
            <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)', margin: '0 0 24px 0' }}>
              Share this 14-character unique application link with the candidate to fill out their details.
            </p>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '14px',
              padding: '6px 6px 6px 14px',
              marginBottom: '24px'
            }}>
              <input
                type="text"
                readOnly
                value={generatedShareLink}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  color: '#FFE76B',
                  fontSize: '13px',
                  outline: 'none',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedShareLink);
                  setCopiedShareLink(true);
                  setTimeout(() => setCopiedShareLink(false), 2500);
                }}
                style={{
                  height: '42px',
                  padding: '0 16px',
                  backgroundColor: copiedShareLink ? '#34BB88' : '#4484FF',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease'
                }}
              >
                {copiedShareLink ? <Check size={16} /> : <Copy size={16} />}
                <span>{copiedShareLink ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Please fill out your candidate application form here: ${generatedShareLink}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: 'rgba(37, 211, 102, 0.15)',
                  border: '1px solid rgba(37, 211, 102, 0.3)',
                  color: '#25D366',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Share2 size={16} />
                <span>Share via WhatsApp</span>
              </a>

              <button
                onClick={() => setShowShareModal(false)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* CANDIDATE DETAIL MODAL */}
      {mounted && selectedCandidate && createPortal(
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#262626',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '440px',
            padding: '28px',
            boxShadow: '0 24px 64px rgba(0,0,0,0.8)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', margin: 0 }}>Candidate Details</h3>
              <button
                onClick={() => setSelectedCandidate(null)}
                style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ padding: '14px', backgroundColor: '#363636', borderRadius: '14px' }}>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>{selectedCandidate.name}</div>
                <div style={{ fontSize: '13px', color: '#4484FF', marginTop: '2px' }}>{selectedCandidate.role}</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>
                <div>📧 <strong>Email:</strong> {selectedCandidate.email || 'N/A'}</div>
                <div>📞 <strong>Phone:</strong> {selectedCandidate.phone || 'N/A'}</div>
                {selectedCandidate.fatherName && <div>👨‍👦 <strong>Father's Name:</strong> {selectedCandidate.fatherName}</div>}
                {selectedCandidate.experience && <div>💼 <strong>Experience:</strong> {selectedCandidate.experience}</div>}
                <div>📌 <strong>Stage:</strong> {selectedCandidate.stage}</div>
                {selectedCandidate.interviewTime && <div>⏰ <strong>Interview Time:</strong> {selectedCandidate.interviewTime}</div>}
                {selectedCandidate.mockScore && <div>🎯 <strong>Mock Score:</strong> {selectedCandidate.mockScore}/100</div>}
                {selectedCandidate.cvFileName && <div>📄 <strong>Uploaded CV:</strong> {selectedCandidate.cvFileName}</div>}
              </div>

              {/* Shareable Link Field */}
              {selectedCandidate.shareableLink && (
                <div style={{
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  <span style={{ fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>
                    🔗 Self Application Shareable Link
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="text"
                      readOnly
                      value={selectedCandidate.shareableLink}
                      style={{
                        flex: 1,
                        background: 'transparent',
                        border: 'none',
                        color: '#FFE76B',
                        fontSize: '12px',
                        outline: 'none',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    />
                    <button
                      onClick={() => {
                        if (selectedCandidate.shareableLink) {
                          navigator.clipboard.writeText(selectedCandidate.shareableLink);
                          alert('Shareable link copied to clipboard!');
                        }
                      }}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: '#fff',
                        fontSize: '11px',
                        cursor: 'pointer'
                      }}
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}

              {/* Form Completion Status Checklist */}
              <div style={{
                backgroundColor: 'rgba(0,0,0,0.25)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '12px'
              }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#fff', display: 'block', marginBottom: '8px' }}>
                  📋 Form Fields Status
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: selectedCandidate.name ? '#4ADE80' : '#FD6579' }}>{selectedCandidate.name ? '✓' : '✗'}</span>
                    <span style={{ color: 'rgba(255,255,255,0.8)' }}>Full Name</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: selectedCandidate.fatherName ? '#4ADE80' : '#FFE76B' }}>{selectedCandidate.fatherName ? '✓' : '○'}</span>
                    <span style={{ color: 'rgba(255,255,255,0.8)' }}>Father's Name</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: selectedCandidate.phone ? '#4ADE80' : '#FD6579' }}>{selectedCandidate.phone ? '✓' : '✗'}</span>
                    <span style={{ color: 'rgba(255,255,255,0.8)' }}>Phone</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: selectedCandidate.email ? '#4ADE80' : '#FD6579' }}>{selectedCandidate.email ? '✓' : '✗'}</span>
                    <span style={{ color: 'rgba(255,255,255,0.8)' }}>Email</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: selectedCandidate.experience ? '#4ADE80' : '#FFE76B' }}>{selectedCandidate.experience ? '✓' : '○'}</span>
                    <span style={{ color: 'rgba(255,255,255,0.8)' }}>Experience</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: selectedCandidate.cvFileName ? '#4ADE80' : '#FFE76B' }}>{selectedCandidate.cvFileName ? '✓' : '○'}</span>
                    <span style={{ color: 'rgba(255,255,255,0.8)' }}>Resume CV</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button
                  onClick={() => setSelectedCandidate(null)}
                  style={{
                    padding: '8px 18px',
                    backgroundColor: 'var(--text-color)',
                    color: '#000',
                    border: 'none',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
              </div>
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

export default function HRRecruitmentPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', color: '#888', textAlign: 'center' }}>Loading recruitment portal...</div>}>
      <RecruitmentContent />
    </Suspense>
  );
}
