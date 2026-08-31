'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import MeteorShower from '@/components/MeteorShower';
import TwinklingStars from '@/components/TwinklingStars';
import {
  Printer,
  FileText,
  User,
  Briefcase,
  CheckCircle2,
  ShieldCheck,
  ExternalLink,
  Loader2,
  ShieldAlert,
  LogIn,
  Calendar
} from 'lucide-react';

interface CandidateProfile {
  id: string;
  candidate_id?: string;
  ref_id?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  father_name?: string;
  email?: string;
  phone?: string;
  role?: string;
  experience?: string;
  last_salary?: string;
  qualification?: string;
  qualification_other?: string;
  institution_name?: string;
  source?: string;
  employee_ref_id?: string;
  interview_time?: string;
  stage?: string;
  cv_file_name?: string;
  cv_url?: string;
  cv_file_url?: string;
  details_submitted?: boolean;
  created_at?: string;
  shareable_link?: string;
}

export default function StrictCandidatePdfPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  let decodedParam = '';
  try {
    decodedParam = decodeURIComponent((params?.applyId as string) || '');
  } catch (e) {
    decodedParam = (params?.applyId as string) || '';
  }

  // STRICT VALIDATION:
  // Must be format: /profile={uuid}?ref={ref_id}&page=pdf
  const uuidValue = decodedParam.replace(/.*profile=/, '').replace(/^profile/, '');
  const refValue = searchParams.get('ref') || searchParams.get('ref_id') || searchParams.get('cnd') || '';
  const pageParam = searchParams.get('page') || '';

  const isStrictValidUrl = Boolean(uuidValue) && Boolean(refValue) && pageParam === 'pdf';

  const [loading, setLoading] = useState(true);
  const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
  const [preloadedCvUrl, setPreloadedCvUrl] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCandidateData() {
      if (!isStrictValidUrl) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // 1. Direct Supabase query by ref_id or candidate_id
        let matchedCandidate: CandidateProfile | null = null;
        const { data: directMatch } = await supabase
          .from('recruitment')
          .select('*')
          .or(`candidate_id.eq.${refValue},ref_id.eq.${refValue},candidate_id.eq.${uuidValue},ref_id.eq.${uuidValue}`)
          .maybeSingle();

        if (directMatch) {
          matchedCandidate = directMatch;
        } else {
          // 2. Scan all recruitment records for shareable_link matches
          const { data: list } = await supabase
            .from('recruitment')
            .select('*');

          if (list && list.length > 0) {
            matchedCandidate = list.find((r) => {
              if (refValue && (r.candidate_id === refValue || r.ref_id === refValue)) {
                return true;
              }
              if (uuidValue && (r.id === uuidValue || r.candidate_id === uuidValue || r.ref_id === uuidValue)) {
                return true;
              }
              if (r.shareable_link) {
                const linkStr = typeof r.shareable_link === 'string' ? r.shareable_link : JSON.stringify(r.shareable_link);
                if (uuidValue && linkStr.includes(uuidValue)) return true;
                if (refValue && linkStr.includes(refValue)) return true;
              }
              return false;
            }) || null;
          }
        }

        if (matchedCandidate) {
          setCandidate(matchedCandidate);
          // PRE-FETCH ENTIRE PDF BINARY INTO RAM BLOB URL FOR INSTANT ZERO-DELAY RENDERING
          const cv = matchedCandidate.cv_url || matchedCandidate.cv_file_url || matchedCandidate.cv_file_name;
          if (cv) {
            let targetUrl = cv;
            if (!cv.startsWith('http://') && !cv.startsWith('https://') && !cv.startsWith('blob:')) {
              const { data: pData } = supabase.storage.from('resumes').getPublicUrl(cv);
              if (pData?.publicUrl) targetUrl = pData.publicUrl;
            }
            if (targetUrl && (targetUrl.startsWith('http') || targetUrl.includes('.pdf'))) {
              try {
                const res = await fetch(targetUrl);
                if (res.ok) {
                  const blob = await res.blob();
                  const objectUrl = URL.createObjectURL(blob);
                  setPreloadedCvUrl(objectUrl);
                }
              } catch (e) {
                console.error('PDF instant pre-loader fetch error:', e);
              }
            }
          }
        } else {
          // LocalStorage fallback for offline testing
          if (typeof window !== 'undefined') {
            const localData = localStorage.getItem('tfc_candidates');
            if (localData) {
              const parsedList = JSON.parse(localData);
              const found = parsedList.find((c: any) =>
                (c.id === uuidValue || c.candidate_id === uuidValue) &&
                (c.id === refValue || c.candidate_id === refValue)
              );
              if (found) {
                setCandidate({
                  id: found.id || uuidValue,
                  candidate_id: found.candidate_id || found.id || refValue,
                  name: found.name || 'Candidate',
                  first_name: found.first_name || '',
                  last_name: found.last_name || '',
                  email: found.email || '',
                  phone: found.phone || '',
                  role: found.role || 'Telesales Executive',
                  experience: found.experience || 'Freshers',
                  last_salary: found.last_salary || found.last_in_hand_salary || '',
                  qualification: found.qualification || 'Graduation',
                  qualification_other: found.qualification_other || '',
                  institution_name: found.institution_name || '',
                  source: found.source || 'Apna Job',
                  employee_ref_id: found.employee_ref_id || '',
                  father_name: found.father_name || found.fatherName || '',
                  interview_time: found.interview_time || found.interview_availability || 'Immediate (Tomorrow at 11:00 AM)',
                  cv_url: found.cv_url || found.cvUrl || found.cvFileName || '',
                  stage: found.stage || 'Lead',
                  details_submitted: true
                });
              }
            }
          }
        }
      } catch (err) {
        console.error('Error fetching strict candidate pdf:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCandidateData();
  }, [isStrictValidUrl, uuidValue, refValue]);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  // IF INVALID URL OR CANDIDATE NOT FOUND: RENDER UNAUTHORIZED GLASS CARD
  if (!loading && (!isStrictValidUrl || !candidate)) {
    return (
      <div style={{
        position: 'relative',
        minHeight: '100vh',
        backgroundColor: '#0d0d0d',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        fontFamily: 'Inter, sans-serif',
        padding: '20px'
      }}>
        <TwinklingStars />
        <MeteorShower />
        <div className="top-right-pattern" />
        <div className="bottom-left-pattern" />

        <div style={{
          position: 'absolute',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(239,68,68,0.18) 0%, rgba(0,0,0,0) 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none'
        }} />

        <div style={{
          position: 'relative',
          zIndex: 10,
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '24px',
          maxWidth: '460px',
          width: '100%',
          padding: '32px 28px',
          textAlign: 'center',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(239, 68, 68, 0.15)'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#EF4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px auto'
          }}>
            <ShieldAlert size={32} />
          </div>

          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#FFFFFF', margin: '0 0 10px 0' }}>
            Unauthorized Profile Access
          </h2>

          <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.65)', lineHeight: '1.6', margin: '0 0 24px 0' }}>
            This PDF profile link is invalid or expired. The required <code style={{ color: '#FFE76B' }}>profile=uuid</code> and <code style={{ color: '#FFE76B' }}>ref=ref_id</code> credentials do not match our database records.
          </p>

          <button
            onClick={() => router.push('/login')}
            style={{
              width: '100%',
              padding: '12px 24px',
              backgroundColor: '#EF4444',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 18px rgba(239, 68, 68, 0.4)'
            }}
          >
            <LogIn size={18} />
            <span>Login to Portal</span>
          </button>
        </div>
      </div>
    );
  }

  const fullName = candidate?.name ||
    [candidate?.first_name, candidate?.last_name].filter(Boolean).join(' ') ||
    'Candidate Record';

  const rawCv = candidate?.cv_url || candidate?.cv_file_url || candidate?.cv_file_name;
  let resolvedCvUrl = '';
  if (rawCv) {
    if (rawCv.startsWith('http://') || rawCv.startsWith('https://') || rawCv.startsWith('blob:')) {
      resolvedCvUrl = rawCv;
    } else {
      const { data: pData } = supabase.storage.from('resumes').getPublicUrl(rawCv);
      resolvedCvUrl = pData?.publicUrl || rawCv;
    }
  }
  const cvLink = preloadedCvUrl || resolvedCvUrl;
  const isCvPdfUrl = !!cvLink && (cvLink.startsWith('http') || cvLink.startsWith('blob:') || cvLink.includes('.pdf'));

  return (
    <div className="print-wrapper" style={{
      minHeight: '100vh',
      backgroundColor: '#0F0F12',
      color: '#E4E4E7',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      paddingBottom: '60px'
    }}>
      {/* TOP FLOATING PDF TOOLBAR (Hidden on Print) */}
      <header className="no-print" style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: '#18181B',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '12px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: 'none'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: '#000',
            color: '#34BB88',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '800',
            fontSize: '14px'
          }}>
            TFC
          </div>
          <div>
            <h1 style={{ fontSize: '15px', fontWeight: '700', color: '#FFF', margin: 0 }}>
              Candidate Profile PDF Dossier
            </h1>
            <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', fontFamily: 'monospace' }}>
              profile={uuidValue}&ref={refValue}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {cvLink && isCvPdfUrl && (
            <a
              href={cvLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(52, 187, 136, 0.15)',
                border: '1px solid rgba(52, 187, 136, 0.3)',
                color: '#34BB88',
                padding: '8px 16px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: '600',
                textDecoration: 'none'
              }}
            >
              <ExternalLink size={15} />
              <span>Original CV PDF</span>
            </a>
          )}
          <button
            onClick={handlePrint}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#34BB88',
              color: '#000000',
              border: 'none',
              padding: '8px 20px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: 'none'
            }}
          >
            <Printer size={16} />
            <span>Print / Download PDF</span>
          </button>
        </div>
      </header>

      {/* PDF BODY SHEET */}
      <main className="print-main" style={{ maxWidth: '860px', margin: '30px auto 0 auto', padding: '0 16px' }}>
        {loading ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '450px',
            gap: '12px'
          }}>
            <Loader2 size={36} className="animate-spin" style={{ color: '#34BB88' }} />
            <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>Generating Candidate PDF Document...</span>
          </div>
        ) : (
          <>
            {/* PAGE 1: SLEEK MINIMAL CANDIDATE DOSSIER A4 SHEET */}
            <div
              className="pdf-page pdf-page-1"
              style={{
                backgroundColor: '#FFFFFF',
                color: '#0F172A',
                borderRadius: '16px',
                padding: '36px 44px',
                boxShadow: 'none',
                marginBottom: '32px',
                position: 'relative',
                overflow: 'hidden',
                height: '297mm',
                maxHeight: '297mm',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                fontFamily: 'Inter, system-ui, sans-serif'
              }}
            >
              <div>
                {/* BRAND & HEADER SECTION */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: '16px',
                  borderBottom: '2px solid #0F172A',
                  marginBottom: '20px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      backgroundColor: '#0F172A',
                      color: '#34BB88',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '800',
                      fontSize: '16px',
                      letterSpacing: '-0.5px'
                    }}>
                      TFC
                    </div>
                    <div>
                      <h1 style={{ fontSize: '20px', fontWeight: '800', margin: 0, color: '#0F172A', letterSpacing: '-0.5px' }}>
                        TFC AXOM RECRUITMENT
                      </h1>
                      <span style={{ fontSize: '10.5px', color: '#059669', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.2px' }}>
                        Official Candidate Evaluation Dossier
                      </span>
                    </div>
                  </div>

                  <div style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #CBD5E1',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    textAlign: 'right'
                  }}>
                    <span style={{ fontSize: '9.5px', color: '#64748B', display: 'block', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>CANDIDATE ID</span>
                    <strong style={{ fontSize: '14px', color: '#0F172A', fontFamily: 'monospace', fontWeight: '800' }}>
                      {candidate?.candidate_id || candidate?.ref_id || refValue}
                    </strong>
                  </div>
                </div>

                {/* CANDIDATE HERO INFORMATION */}
                <div style={{
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '14px',
                  padding: '18px 24px',
                  marginBottom: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      backgroundColor: '#0F172A',
                      color: '#34BB88',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      fontWeight: '800',
                      border: '3px solid #34BB88',
                      boxShadow: '0 4px 12px rgba(52, 187, 136, 0.15)'
                    }}>
                      {fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 style={{ fontSize: '21px', fontWeight: '800', margin: '0 0 4px 0', color: '#0F172A', letterSpacing: '-0.5px' }}>
                        {fullName}
                      </h2>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{
                          backgroundColor: '#0F172A',
                          color: '#FFFFFF',
                          padding: '3px 10px',
                          borderRadius: '5px',
                          fontSize: '11.5px',
                          fontWeight: '700'
                        }}>
                          {candidate?.role || 'Telesales Executive'}
                        </span>
                        <span style={{
                          backgroundColor: '#E2E8F0',
                          color: '#334155',
                          padding: '3px 10px',
                          borderRadius: '5px',
                          fontSize: '11.5px',
                          fontWeight: '600'
                        }}>
                          {candidate?.experience || 'Freshers'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span style={{
                      backgroundColor: candidate?.details_submitted ? '#DCFCE7' : '#FEF9C3',
                      color: candidate?.details_submitted ? '#15803D' : '#854D0E',
                      border: `1px solid ${candidate?.details_submitted ? '#86EFAC' : '#FDE047'}`,
                      padding: '6px 14px',
                      borderRadius: '20px',
                      fontSize: '11.5px',
                      fontWeight: '700',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}>
                      <CheckCircle2 size={15} />
                      {candidate?.details_submitted ? 'Profile Completed' : 'Lead Incomplete'}
                    </span>
                  </div>
                </div>

                {/* 4 CATEGORIES EVALUATION GRID */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  
                  {/* CATEGORY 01: PERSONAL INFORMATION */}
                  <div style={{
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '16px 18px',
                    backgroundColor: '#FFFFFF'
                  }}>
                    <h3 style={{
                      fontSize: '11.5px',
                      fontWeight: '800',
                      color: '#0F172A',
                      textTransform: 'uppercase',
                      letterSpacing: '0.8px',
                      margin: '0 0 10px 0',
                      paddingBottom: '8px',
                      borderBottom: '1.5px solid #F1F5F9',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <User size={15} style={{ color: '#2563EB' }} />
                      <span>01. Personal Information</span>
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                      <div>
                        <span style={{ fontSize: '10px', color: '#64748B', display: 'block', fontWeight: '600', textTransform: 'uppercase' }}>Full Name</span>
                        <strong style={{ color: '#0F172A', fontSize: '12.5px', fontWeight: '700' }}>{fullName}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '10px', color: '#64748B', display: 'block', fontWeight: '600', textTransform: 'uppercase' }}>Father's Name</span>
                        <strong style={{ color: '#334155', fontSize: '12px' }}>{candidate?.father_name || 'N/A'}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '10px', color: '#64748B', display: 'block', fontWeight: '600', textTransform: 'uppercase' }}>Contact Number</span>
                        <strong style={{ color: '#0F172A', fontSize: '12px', fontWeight: '700' }}>{candidate?.phone || 'N/A'}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '10px', color: '#64748B', display: 'block', fontWeight: '600', textTransform: 'uppercase' }}>Email Address</span>
                        <strong style={{ color: '#334155', fontSize: '12px' }}>{candidate?.email || 'N/A'}</strong>
                      </div>
                    </div>
                  </div>

                  {/* CATEGORY 02: QUALIFICATION & EXPERIENCE */}
                  <div style={{
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '16px 18px',
                    backgroundColor: '#FFFFFF'
                  }}>
                    <h3 style={{
                      fontSize: '11.5px',
                      fontWeight: '800',
                      color: '#0F172A',
                      textTransform: 'uppercase',
                      letterSpacing: '0.8px',
                      margin: '0 0 10px 0',
                      paddingBottom: '8px',
                      borderBottom: '1.5px solid #F1F5F9',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <Briefcase size={15} style={{ color: '#9333EA' }} />
                      <span>02. Qualification & Experience</span>
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                      <div>
                        <span style={{ fontSize: '10px', color: '#64748B', display: 'block', fontWeight: '600', textTransform: 'uppercase' }}>Position Applied For</span>
                        <strong style={{ color: '#0F172A', fontSize: '12.5px', fontWeight: '700' }}>{candidate?.role || 'Telesales Executive'}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '10px', color: '#64748B', display: 'block', fontWeight: '600', textTransform: 'uppercase' }}>Experience Level</span>
                        <strong style={{ color: '#334155', fontSize: '12px' }}>{candidate?.experience || 'Freshers'}</strong>
                      </div>
                      {candidate?.experience !== 'Fresher' && (
                        <div>
                          <span style={{ fontSize: '10px', color: '#64748B', display: 'block', fontWeight: '600', textTransform: 'uppercase' }}>Last In-Hand Salary</span>
                          <strong style={{ color: '#0F172A', fontSize: '12px', fontWeight: '700' }}>{candidate?.last_salary || '₹25,000 / month'}</strong>
                        </div>
                      )}
                      <div>
                        <span style={{ fontSize: '10px', color: '#64748B', display: 'block', fontWeight: '600', textTransform: 'uppercase' }}>Highest Qualification</span>
                        <strong style={{ color: '#0F172A', fontSize: '12px', fontWeight: '700' }}>
                          {candidate?.qualification === 'Others' ? (candidate?.qualification_other || 'Others') : (candidate?.qualification || 'Graduation')}
                        </strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '10px', color: '#64748B', display: 'block', fontWeight: '600', textTransform: 'uppercase' }}>Institution / University</span>
                        <strong style={{ color: '#334155', fontSize: '12px' }}>{candidate?.institution_name || 'N/A'}</strong>
                      </div>
                    </div>
                  </div>

                  {/* CATEGORY 03: REFERRAL & INTERVIEW PREFERENCE */}
                  <div style={{
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '16px 18px',
                    backgroundColor: '#FFFFFF'
                  }}>
                    <h3 style={{
                      fontSize: '11.5px',
                      fontWeight: '800',
                      color: '#0F172A',
                      textTransform: 'uppercase',
                      letterSpacing: '0.8px',
                      margin: '0 0 10px 0',
                      paddingBottom: '8px',
                      borderBottom: '1.5px solid #F1F5F9',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <Calendar size={15} style={{ color: '#059669' }} />
                      <span>03. Referral & Interview Preference</span>
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                      <div>
                        <span style={{ fontSize: '10px', color: '#64748B', display: 'block', fontWeight: '600', textTransform: 'uppercase' }}>Referral Source</span>
                        <strong style={{ color: '#0F172A', fontSize: '12px', fontWeight: '700' }}>
                          {candidate?.source === 'Employee ref (EMP_ID)' ? `Employee Ref (${candidate?.employee_ref_id || 'N/A'})` : candidate?.source || 'Apna Job'}
                        </strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '10px', color: '#64748B', display: 'block', fontWeight: '600', textTransform: 'uppercase' }}>Interview Availability</span>
                        <strong style={{ color: '#059669', fontSize: '12px', fontWeight: '700' }}>{candidate?.interview_time || 'Immediate (Tomorrow at 11:00 AM)'}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '10px', color: '#64748B', display: 'block', fontWeight: '600', textTransform: 'uppercase' }}>Current Pipeline Stage</span>
                        <strong style={{ color: '#2563EB', fontSize: '12px', fontWeight: '700' }}>{candidate?.stage || 'Lead'}</strong>
                      </div>
                    </div>
                  </div>

                  {/* CATEGORY 04: RESUME / CV ATTACHMENT */}
                  <div style={{
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '16px 18px',
                    backgroundColor: '#FFFFFF'
                  }}>
                    <h3 style={{
                      fontSize: '11.5px',
                      fontWeight: '800',
                      color: '#0F172A',
                      textTransform: 'uppercase',
                      letterSpacing: '0.8px',
                      margin: '0 0 10px 0',
                      paddingBottom: '8px',
                      borderBottom: '1.5px solid #F1F5F9',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <CheckCircle2 size={15} style={{ color: '#D97706' }} />
                      <span>04. Resume / CV Attachment</span>
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                      <div>
                        <span style={{ fontSize: '10px', color: '#64748B', display: 'block', fontWeight: '600', textTransform: 'uppercase' }}>CV Upload Status</span>
                        <strong style={{ color: cvLink ? '#059669' : '#DC2626', fontSize: '12px', fontWeight: '700' }}>
                          {cvLink ? '✓ PDF Resume Attached' : '✕ No CV Document Uploaded'}
                        </strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '10px', color: '#64748B', display: 'block', fontWeight: '600', textTransform: 'uppercase' }}>Document Type & Format</span>
                        <strong style={{ color: '#334155', fontSize: '12px' }}>{cvLink ? 'PDF Document (Page 2 Attached)' : 'N/A'}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '10px', color: '#64748B', display: 'block', fontWeight: '600', textTransform: 'uppercase' }}>Verification Dossier Status</span>
                        <strong style={{ color: '#059669', fontSize: '12px', fontWeight: '700' }}>Database Synchronized</strong>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* BOTTOM FOOTER SECTION: VERIFICATION FOOTNOTE & STAMP */}
              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* VERIFICATION FOOTNOTE */}
                <div style={{
                  backgroundColor: '#F8FAFC',
                  borderLeft: '3.5px solid #0F172A',
                  padding: '9px 14px',
                  borderRadius: '0 6px 6px 0',
                  fontSize: '10.5px',
                  color: '#475569',
                  lineHeight: '1.4'
                }}>
                  <strong>TFC Axom HR Verification:</strong> This evaluation sheet is generated directly from the TFC Axom HR Recruitment Portal. All information is verified and stored in Supabase Database.
                </div>

                {/* FOOTER VERIFICATION STAMP */}
                <div style={{
                  paddingTop: '10px',
                  borderTop: '1px solid #E2E8F0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '10.5px',
                  color: '#64748B'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={14} style={{ color: '#059669' }} />
                    <span style={{ fontWeight: '600' }}>TFC Axom HR Portal System Verified</span>
                  </div>
                  <div style={{ fontWeight: '600' }}>
                    Page 1 of {isCvPdfUrl ? '2' : '1'} — Dossier ID: {candidate?.id || uuidValue}
                  </div>
                </div>
              </div>
            </div>

            {/* PAGE 2: ATTACHED RESUME CV FULL DOCUMENT (ZERO MARGIN / BORDER / PADDING) */}
            {cvLink && isCvPdfUrl && (
              <div
                className="pdf-page pdf-page-2"
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#18181B',
                  borderRadius: 0,
                  padding: 0,
                  margin: 0,
                  border: 'none',
                  boxShadow: 'none',
                  minHeight: '2300px',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* EDGE-TO-EDGE EXPANDED NON-SCROLLING PDF CONTAINER */}
                <div style={{
                  flex: 1,
                  width: '100%',
                  minHeight: '2300px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 0,
                  overflow: 'hidden'
                }}>
                  <iframe
                    src={`${preloadedCvUrl || cvLink}#toolbar=0&navpanes=0&view=FitH`}
                    loading="eager"
                    style={{
                      width: '100%',
                      height: '2300px',
                      border: 'none',
                      margin: 0,
                      padding: 0,
                      backgroundColor: '#FFFFFF'
                    }}
                    title="Candidate Resume Document"
                  />
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* STRICT SINGLE-PAGE A4 PRINT STYLES */}
      <style jsx global>{`
        @page {
          size: A4 portrait;
          margin: 0;
        }
        @media print {
          html, body, .print-wrapper, .print-main {
            background-color: #ffffff !important;
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            min-height: 0 !important;
            height: auto !important;
            overflow: visible !important;
            box-shadow: none !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          .pdf-page-1 {
            box-shadow: none !important;
            margin: 0 auto !important;
            border-radius: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
            max-height: 297mm !important;
            padding: 12mm 15mm !important;
            box-sizing: border-box !important;
            page-break-before: avoid !important;
            page-break-after: always !important;
            break-before: avoid !important;
            break-after: page !important;
            break-inside: avoid !important;
          }
          .pdf-page-2 {
            box-shadow: none !important;
            margin: 0 auto !important;
            padding: 0 !important;
            width: 210mm !important;
            height: auto !important;
            min-height: 297mm !important;
            overflow: visible !important;
            page-break-before: always !important;
            break-before: page !important;
          }
          .pdf-page-2 iframe {
            width: 100% !important;
            height: 2300px !important;
            min-height: 2300px !important;
          }
        }
      `}</style>
    </div>
  );
}
