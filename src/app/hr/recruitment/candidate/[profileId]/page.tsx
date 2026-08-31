'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  Printer,
  Download,
  ArrowLeft,
  FileText,
  User,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building2,
  ExternalLink,
  Loader2
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
  stage?: string;
  cv_file_name?: string;
  cv_url?: string;
  cv_file_url?: string;
  details_submitted?: boolean;
  created_at?: string;
  shareable_link?: string;
}

export default function CandidatePdfProfilePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const rawProfileId = (params?.profileId as string) || '';
  const candidateRef = rawProfileId.replace(/^profile=/, '');
  const pageMode = searchParams.get('page') || 'pdf';

  const [loading, setLoading] = useState(true);
  const [candidate, setCandidate] = useState<CandidateProfile | null>(null);

  useEffect(() => {
    async function fetchCandidate() {
      if (!candidateRef) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch all recruitment records to perform robust matching for UUID, Ref ID, candidate_id, or shareable_link
        const { data: list, error: err } = await supabase
          .from('recruitment')
          .select('*');

        let matchedCandidate: CandidateProfile | null = null;

        if (list && list.length > 0) {
          matchedCandidate = list.find((r) => {
            if (r.id === candidateRef || r.candidate_id === candidateRef || r.ref_id === candidateRef) {
              return true;
            }
            if (r.shareable_link) {
              if (typeof r.shareable_link === 'string') {
                if (r.shareable_link.includes(candidateRef)) return true;
                try {
                  const parsed = JSON.parse(r.shareable_link);
                  if (parsed && typeof parsed === 'object') {
                    if (parsed.uuid === candidateRef || parsed.ref_id === candidateRef) {
                      return true;
                    }
                  }
                } catch (e) {}
              }
            }
            return false;
          }) || null;
        }

        if (matchedCandidate) {
          setCandidate(matchedCandidate);
        } else {
          // LocalStorage fallback for offline testing
          if (typeof window !== 'undefined') {
            const localData = localStorage.getItem('tfc_candidates');
            if (localData) {
              const parsedList = JSON.parse(localData);
              const found = parsedList.find((c: any) =>
                c.id === candidateRef || c.candidate_id === candidateRef || c.name === candidateRef
              );
              if (found) {
                setCandidate({
                  id: found.id || candidateRef,
                  candidate_id: found.id || candidateRef,
                  name: found.name || 'Candidate',
                  email: found.email || '',
                  phone: found.phone || '',
                  role: found.role || 'Telecaller Executive',
                  experience: found.experience || 'Freshers',
                  father_name: found.fatherName || '',
                  cv_url: found.cvUrl || found.cvFileName || '',
                  stage: found.stage || 'Lead'
                });
              }
            }
          }
        }
      } catch (err) {
        console.error('Error fetching candidate pdf profile:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCandidate();
  }, [candidateRef]);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const fullName = candidate?.name ||
    [candidate?.first_name, candidate?.last_name].filter(Boolean).join(' ') ||
    'Pre-Generated Lead Candidate';

  const cvLink = candidate?.cv_url || candidate?.cv_file_url || candidate?.cv_file_name;
  const isCvPdfUrl = cvLink && (cvLink.startsWith('http') || cvLink.includes('.pdf'));

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0F0F12',
      color: '#E4E4E7',
      fontFamily: 'Inter, system-ui, sans-serif',
      paddingBottom: '60px'
    }}>
      {/* TOP HEADER CONTROLS (Hidden on Print) */}
      <header className="no-print" style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: '#18181B',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => router.back()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#FFFFFF',
              padding: '8px 14px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} style={{ color: '#34BB88' }} />
            <span style={{ fontSize: '15px', fontWeight: '700', color: '#FFF' }}>
              Candidate Dossier — {candidate?.candidate_id || candidateRef}
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
              <span>Original CV File</span>
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
              padding: '8px 18px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(52, 187, 136, 0.3)'
            }}
          >
            <Printer size={16} />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </header>

      {/* PDF DOCUMENT CONTAINER BODY */}
      <main style={{ maxWidth: '850px', margin: '30px auto 0 auto', padding: '0 16px' }}>
        {loading ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            gap: '12px'
          }}>
            <Loader2 size={32} className="animate-spin" style={{ color: '#34BB88' }} />
            <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>Generating Candidate PDF Profile...</span>
          </div>
        ) : (
          <>
            {/* PAGE 1: CANDIDATE DOSSIER A4 SHEET */}
            <div
              className="pdf-page"
              style={{
                backgroundColor: '#FFFFFF',
                color: '#18181B',
                borderRadius: '16px',
                padding: '44px 50px',
                boxShadow: '0 12px 48px rgba(0,0,0,0.6)',
                marginBottom: '32px',
                position: 'relative',
                overflow: 'hidden',
                minHeight: '1000px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                {/* PDF BRAND HEADER */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  paddingBottom: '24px',
                  borderBottom: '2px solid #E4E4E7',
                  marginBottom: '28px'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        backgroundColor: '#000000',
                        color: '#34BB88',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '800',
                        fontSize: '18px'
                      }}>
                        TFC
                      </div>
                      <div>
                        <h1 style={{ fontSize: '20px', fontWeight: '800', margin: 0, color: '#09090B', letterSpacing: '-0.5px' }}>
                          TFC AXOM RECRUITMENT
                        </h1>
                        <span style={{ fontSize: '11px', color: '#71717A', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
                          Official Candidate Evaluation Dossier
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      backgroundColor: '#F4F4F5',
                      border: '1px solid #E4E4E7',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      display: 'inline-block'
                    }}>
                      <span style={{ fontSize: '11px', color: '#71717A', display: 'block', fontWeight: '500' }}>CANDIDATE REF ID</span>
                      <strong style={{ fontSize: '14px', color: '#09090B', fontFamily: 'monospace' }}>
                        {candidate?.candidate_id || candidate?.ref_id || candidateRef}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* PROFILE TITLE BANNER */}
                <div style={{
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '20px 24px',
                  marginBottom: '32px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #18181B 0%, #27272A 100%)',
                      color: '#34BB88',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '22px',
                      fontWeight: '800',
                      border: '3px solid #34BB88'
                    }}>
                      {fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 style={{ fontSize: '22px', fontWeight: '800', margin: '0 0 4px 0', color: '#0F172A' }}>
                        {fullName}
                      </h2>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', color: '#64748B', fontWeight: '600' }}>
                          Role: <strong style={{ color: '#0F172A' }}>{candidate?.role || 'Telecaller Executive'}</strong>
                        </span>
                        <span style={{ color: '#CBD5E1' }}>•</span>
                        <span style={{ fontSize: '13px', color: '#64748B', fontWeight: '600' }}>
                          Exp: <strong style={{ color: '#0F172A' }}>{candidate?.experience || 'Freshers'}</strong>
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
                      fontSize: '12px',
                      fontWeight: '700',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <CheckCircle2 size={14} />
                      {candidate?.details_submitted ? 'Profile Completed' : 'Lead Incomplete'}
                    </span>
                  </div>
                </div>

                {/* DETAILS GRID (2 COLUMNS) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '36px' }}>
                  {/* PERSONAL INFORMATION */}
                  <div style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '20px'
                  }}>
                    <h3 style={{
                      fontSize: '14px',
                      fontWeight: '700',
                      color: '#0F172A',
                      margin: '0 0 16px 0',
                      paddingBottom: '8px',
                      borderBottom: '1px solid #F1F5F9',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <User size={16} style={{ color: '#34BB88' }} />
                      <span>Personal Information</span>
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
                      <div>
                        <span style={{ fontSize: '11px', color: '#64748B', display: 'block', textTransform: 'uppercase', fontWeight: '600' }}>Full Name</span>
                        <strong style={{ color: '#1E293B', fontSize: '14px' }}>{fullName}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '11px', color: '#64748B', display: 'block', textTransform: 'uppercase', fontWeight: '600' }}>Father's Name</span>
                        <strong style={{ color: '#1E293B' }}>{candidate?.father_name || 'N/A'}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '11px', color: '#64748B', display: 'block', textTransform: 'uppercase', fontWeight: '600' }}>Contact Email</span>
                        <strong style={{ color: '#1E293B' }}>{candidate?.email || 'N/A'}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '11px', color: '#64748B', display: 'block', textTransform: 'uppercase', fontWeight: '600' }}>Phone Number</span>
                        <strong style={{ color: '#1E293B' }}>{candidate?.phone || 'N/A'}</strong>
                      </div>
                    </div>
                  </div>

                  {/* APPLICATION DETAILS */}
                  <div style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '20px'
                  }}>
                    <h3 style={{
                      fontSize: '14px',
                      fontWeight: '700',
                      color: '#0F172A',
                      margin: '0 0 16px 0',
                      paddingBottom: '8px',
                      borderBottom: '1px solid #F1F5F9',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <Briefcase size={16} style={{ color: '#34BB88' }} />
                      <span>Application Overview</span>
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
                      <div>
                        <span style={{ fontSize: '11px', color: '#64748B', display: 'block', textTransform: 'uppercase', fontWeight: '600' }}>Target Position</span>
                        <strong style={{ color: '#1E293B', fontSize: '14px' }}>{candidate?.role || 'Telecaller Executive'}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '11px', color: '#64748B', display: 'block', textTransform: 'uppercase', fontWeight: '600' }}>Work Experience</span>
                        <strong style={{ color: '#1E293B' }}>{candidate?.experience || 'Freshers'}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '11px', color: '#64748B', display: 'block', textTransform: 'uppercase', fontWeight: '600' }}>Recruitment Stage</span>
                        <span style={{
                          display: 'inline-block',
                          backgroundColor: '#EFF6FF',
                          color: '#1D4ED8',
                          border: '1px solid #BFDBFE',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '700',
                          marginTop: '2px'
                        }}>
                          {candidate?.stage || 'Lead'}
                        </span>
                      </div>
                      <div>
                        <span style={{ fontSize: '11px', color: '#64748B', display: 'block', textTransform: 'uppercase', fontWeight: '600' }}>CV Attachment</span>
                        <strong style={{ color: cvLink ? '#059669' : '#DC2626' }}>
                          {cvLink ? (candidate?.cv_file_name || 'Resume Attached') : 'No CV File Uploaded'}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* VERIFICATION STATEMENT */}
                <div style={{
                  backgroundColor: '#F1F5F9',
                  borderLeft: '4px solid #34BB88',
                  padding: '14px 18px',
                  borderRadius: '0 8px 8px 0',
                  fontSize: '12px',
                  color: '#475569',
                  lineHeight: '1.6'
                }}>
                  <strong>HR Verification Note:</strong> This document represents candidate details registered in the TFC Axom HR portal. All submitted records are verified against candidate submissions and stored securely in Supabase Database.
                </div>
              </div>

              {/* FOOTER VERIFICATION STAMP */}
              <div style={{
                paddingTop: '20px',
                borderTop: '1px solid #E2E8F0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '11px',
                color: '#94A3B8'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={14} style={{ color: '#059669' }} />
                  <span>TFC Axom HR Portal System Verified</span>
                </div>
                <div>
                  Page 1 of {isCvPdfUrl ? '2' : '1'} — Dossier ID: {candidate?.id || candidateRef}
                </div>
              </div>
            </div>

            {/* PAGE 2: ATTACHED PDF CV DOCUMENT SECTION */}
            {cvLink && isCvPdfUrl && (
              <div
                className="pdf-page"
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#18181B',
                  borderRadius: '16px',
                  padding: '32px',
                  boxShadow: '0 12px 48px rgba(0,0,0,0.6)',
                  minHeight: '1000px',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: '16px',
                  borderBottom: '2px solid #E4E4E7',
                  marginBottom: '20px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FileText size={20} style={{ color: '#34BB88' }} />
                    <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0, color: '#09090B' }}>
                      ATTACHED CANDIDATE RESUME / CV DOCUMENT
                    </h3>
                  </div>
                  <span style={{ fontSize: '12px', color: '#71717A', fontFamily: 'monospace' }}>
                    Page 2 of 2
                  </span>
                </div>

                {/* EMBEDDED PDF IFRAME */}
                <div style={{
                  flex: 1,
                  minHeight: '850px',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#F8FAFC'
                }}>
                  <iframe
                    src={`${cvLink}#toolbar=0`}
                    style={{
                      width: '100%',
                      height: '850px',
                      border: 'none'
                    }}
                    title="Candidate Resume CV PDF"
                  />
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* PRINT STYLES */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
          }
          .pdf-page {
            box-shadow: none !important;
            margin: 0 !important;
            padding: 20px !important;
            page-break-after: always;
          }
        }
      `}</style>
    </div>
  );
}
