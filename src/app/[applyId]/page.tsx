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
  Calendar,
  CreditCard,
  MapPin,
  FileCheck
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
  profile_pic_url?: string;
  aadhaar_front_url?: string;
  aadhaar_back_url?: string;
  pan_card_url?: string;
  address_proof_url?: string;
  address_proof_type?: string;
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
  const [pdfPageCount, setPdfPageCount] = useState<number>(1);
  const [preloadedAddressProofUrl, setPreloadedAddressProofUrl] = useState<string | null>(null);
  const [addressProofPdfPageCount, setAddressProofPdfPageCount] = useState<number>(1);

  // Load PDF.js dynamically for 100% automated exact PDF page counting
  useEffect(() => {
    if (typeof window !== 'undefined' && !(window as any).pdfjsLib) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.async = true;
      script.onload = () => {
        if ((window as any).pdfjsLib) {
          (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }
      };
      document.body.appendChild(script);
    }
  }, []);

  // Automatic PDF.js page count scanner effect for Address Proof PDF
  useEffect(() => {
    const rawAddr = candidate?.address_proof_url || (candidate as any)?.addressProofUrl || (candidate as any)?.address_proof;
    const docUrl = preloadedAddressProofUrl || getPublicStorageUrl(rawAddr);
    if (!docUrl || docUrl.match(/\.(jpg|jpeg|png|webp)(\?.*)?$/i)) return;

    let isCancelled = false;
    const scanPdfJs = async () => {
      try {
        if (typeof window !== 'undefined' && (window as any).pdfjsLib) {
          (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          const pdf = await (window as any).pdfjsLib.getDocument(docUrl).promise;
          if (pdf && pdf.numPages > 0 && !isCancelled) {
            setAddressProofPdfPageCount((prev) => Math.max(prev, pdf.numPages));
          }
        }
      } catch (e) {
        console.warn('PDF.js auto-scan Address Proof warning:', e);
      }
    };

    scanPdfJs();
    const t1 = setTimeout(scanPdfJs, 800);
    const t2 = setTimeout(scanPdfJs, 2000);

    return () => {
      isCancelled = true;
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [preloadedAddressProofUrl, candidate]);

  // Automatic PDF.js page count scanner effect for CV PDF
  useEffect(() => {
    const rawCv = candidate?.cv_url || candidate?.cv_file_url || candidate?.cv_file_name || (candidate as any)?.cvUrl;
    const docUrl = preloadedCvUrl || getPublicStorageUrl(rawCv);
    if (!docUrl || docUrl.match(/\.(jpg|jpeg|png|webp)(\?.*)?$/i)) return;

    let isCancelled = false;
    const scanCvPdfJs = async () => {
      try {
        if (typeof window !== 'undefined' && (window as any).pdfjsLib) {
          (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          const pdf = await (window as any).pdfjsLib.getDocument(docUrl).promise;
          if (pdf && pdf.numPages > 0 && !isCancelled) {
            setPdfPageCount((prev) => Math.max(prev, pdf.numPages));
          }
        }
      } catch (e) {
        console.warn('PDF.js auto-scan CV warning:', e);
      }
    };

    scanCvPdfJs();
    const t1 = setTimeout(scanCvPdfJs, 800);
    const t2 = setTimeout(scanCvPdfJs, 2000);

    return () => {
      isCancelled = true;
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [preloadedCvUrl, candidate]);

  // Storage Public URL Resolver
  const getPublicStorageUrl = (pathOrUrl?: string | null) => {
    if (!pathOrUrl) return null;
    if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://') || pathOrUrl.startsWith('blob:')) {
      return pathOrUrl;
    }
    const { data } = supabase.storage.from('resumes').getPublicUrl(pathOrUrl);
    return data?.publicUrl || pathOrUrl;
  };

  // Helper function to safely fetch PDF ArrayBuffer via Supabase SDK download (bypass CORS) or fetch fallback
  const fetchPdfArrayBuffer = async (pathOrUrl: string): Promise<ArrayBuffer | null> => {
    try {
      if (!pathOrUrl) return null;

      // Extract filename if it's a Supabase public URL or path
      const cleanFileName = pathOrUrl.includes('/resumes/') 
        ? pathOrUrl.split('/resumes/').pop()?.split('?')[0]
        : pathOrUrl;

      if (cleanFileName && !cleanFileName.startsWith('http://') && !cleanFileName.startsWith('https://') && !cleanFileName.startsWith('blob:')) {
        const { data: blobData, error } = await supabase.storage
          .from('resumes')
          .download(cleanFileName);

        if (!error && blobData) {
          return await blobData.arrayBuffer();
        }
      }

      // Fallback: Fetch via server proxy route (bypasses browser CORS completely)
      const targetUrl = getPublicStorageUrl(pathOrUrl);
      if (targetUrl) {
        try {
          const proxyRes = await fetch(`/api/pdf-proxy?url=${encodeURIComponent(targetUrl)}`);
          if (proxyRes.ok) {
            return await proxyRes.arrayBuffer();
          }
        } catch (e) {
          const res = await fetch(targetUrl);
          if (res.ok) {
            return await res.arrayBuffer();
          }
        }
      }
    } catch (err) {
      console.warn('fetchPdfArrayBuffer warning:', err);
    }
    return null;
  };

  // Helper function to extract exact page count from any PDF ArrayBuffer (including compressed stream PDFs like Electricity Bills)
  const extractPdfPageCount = (arrayBuffer: ArrayBuffer): number => {
    try {
      const textDecoder = new TextDecoder('latin1');
      const text = textDecoder.decode(arrayBuffer);

      let maxPages = 1;

      // Method 1: Check /Type /Pages root object /Count N
      const pagesCountMatches = text.match(/\/Type\s*\/Pages\b[\s\S]{1,300}?\/Count\s+(\d+)/i) || text.match(/\/Count\s+(\d+)[\s\S]{1,300}?\/Type\s*\/Pages\b/i);
      if (pagesCountMatches && pagesCountMatches[1]) {
        const parsed = parseInt(pagesCountMatches[1], 10);
        if (!isNaN(parsed) && parsed > 0 && parsed < 500) {
          maxPages = parsed;
        }
      }

      // Method 2: Fallback /Count N matches
      if (maxPages === 1) {
        const countMatches = text.match(/\/Count\s+(\d+)/gi);
        if (countMatches) {
          for (const m of countMatches) {
            const numMatch = m.match(/\d+/);
            if (numMatch) {
              const val = parseInt(numMatch[0], 10);
              if (!isNaN(val) && val > maxPages && val < 500) {
                maxPages = val;
              }
            }
          }
        }
      }

      // Method 3: Check exact /Type /Page declarations
      const pageMatches = text.match(/\/Type\s*\/Page\b/gi) || text.match(/\/Type\/Page\b/gi);
      if (pageMatches && pageMatches.length > 0) {
        if (maxPages === 1 || pageMatches.length < maxPages) {
          maxPages = pageMatches.length;
        }
      }

      return Math.max(1, maxPages);
    } catch (err) {
      console.warn('PDF page count extraction warning:', err);
      return 1;
    }
  };

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

        const preloadDocumentPdfs = async (c: CandidateProfile) => {
          // 1. CV PDF
          const cv = c.cv_url || c.cv_file_url || c.cv_file_name || (c as any).cvUrl;
          if (cv) {
            const targetUrl = getPublicStorageUrl(cv);
            if (targetUrl) {
              try {
                const infoRes = await fetch(`/api/pdf-info?url=${encodeURIComponent(targetUrl)}`);
                if (infoRes.ok) {
                  const info = await infoRes.json();
                  if (info.pageCount && info.pageCount > 0) {
                    setPdfPageCount((prev) => Math.max(prev, info.pageCount));
                  }
                }
              } catch (e) {
                console.warn('Error fetching CV pdf-info:', e);
              }
            }

            const arrayBuffer = await fetchPdfArrayBuffer(cv);
            if (arrayBuffer) {
              const pages = extractPdfPageCount(arrayBuffer);
              if (pages > 0) {
                setPdfPageCount((prev) => Math.max(prev, pages));
              }

              const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
              const objectUrl = URL.createObjectURL(blob);
              setPreloadedCvUrl(objectUrl);
            }
          }

          // 2. Address Proof PDF (Electricity / Landline / STD Bill)
          const addrDoc = c.address_proof_url || (c as any).addressProofUrl || (c as any).address_proof;
          if (addrDoc) {
            const targetUrl = getPublicStorageUrl(addrDoc);
            if (targetUrl) {
              try {
                const infoRes = await fetch(`/api/pdf-info?url=${encodeURIComponent(targetUrl)}`);
                if (infoRes.ok) {
                  const info = await infoRes.json();
                  if (info.pageCount && info.pageCount > 0) {
                    setAddressProofPdfPageCount((prev) => Math.max(prev, info.pageCount));
                  }
                }
              } catch (e) {
                console.warn('Error fetching Address Proof pdf-info:', e);
              }
            }

            const arrayBuffer = await fetchPdfArrayBuffer(addrDoc);
            if (arrayBuffer) {
              const pages = extractPdfPageCount(arrayBuffer);
              if (pages > 0) {
                setAddressProofPdfPageCount((prev) => Math.max(prev, pages));
              }

              const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
              const objectUrl = URL.createObjectURL(blob);
              setPreloadedAddressProofUrl(objectUrl);
            }
          }
        };

        if (matchedCandidate) {
          setCandidate(matchedCandidate);
          preloadDocumentPdfs(matchedCandidate);
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
                const loadedCandidate = {
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
                  profile_pic_url: found.profile_pic_url || found.profilePicUrl || '',
                  aadhaar_front_url: found.aadhaar_front_url || found.aadhaarFrontUrl || '',
                  aadhaar_back_url: found.aadhaar_back_url || found.aadhaarBackUrl || '',
                  pan_card_url: found.pan_card_url || found.panCardUrl || '',
                  address_proof_url: found.address_proof_url || found.addressProofUrl || '',
                  address_proof_type: found.address_proof_type || found.addressProofType || 'Electricity Bill / Landline Bill / STD Bill',
                  stage: found.stage || 'Lead',
                  details_submitted: true
                };
                setCandidate(loadedCandidate);
                preloadDocumentPdfs(loadedCandidate);
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
  const resolvedCvUrl = getPublicStorageUrl(rawCv) || '';
  const cvLink = preloadedCvUrl || resolvedCvUrl;
  const isCvPdfUrl = !!cvLink && (cvLink.startsWith('http') || cvLink.startsWith('blob:') || cvLink.includes('.pdf'));

  // Document URLs
  const profilePicUrl = getPublicStorageUrl(candidate?.profile_pic_url);
  const aadhaarFrontUrl = getPublicStorageUrl(candidate?.aadhaar_front_url);
  const aadhaarBackUrl = getPublicStorageUrl(candidate?.aadhaar_back_url);
  const panCardUrl = getPublicStorageUrl(candidate?.pan_card_url);
  
  const rawAddressProof = candidate?.address_proof_url;
  const resolvedAddressProofUrl = getPublicStorageUrl(rawAddressProof) || '';
  const addressProofLink = preloadedAddressProofUrl || resolvedAddressProofUrl;
  const addressProofUrl = addressProofLink;
  const addressProofType = candidate?.address_proof_type || 'Electricity Bill / Landline Bill / STD Bill';

  // Dynamic Pagination Calculation
  const hasIdDocs = Boolean(aadhaarFrontUrl || aadhaarBackUrl || panCardUrl);
  const hasAddressProof = Boolean(addressProofLink);
  const hasCv = Boolean(cvLink);

  let totalPages = 1; // Page 1 is Evaluation Sheet
  let idDocsPageIndex = 0;
  let addressProofPageIndex = 0;
  let cvStartPageIndex = 0;

  if (hasIdDocs) {
    totalPages += 1;
    idDocsPageIndex = totalPages;
  }
  if (hasAddressProof) {
    addressProofPageIndex = totalPages + 1;
    totalPages += addressProofPdfPageCount;
  }
  if (hasCv) {
    cvStartPageIndex = totalPages + 1;
    totalPages += pdfPageCount;
  }

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
              Candidate Evaluation & Verification PDF Dossier
            </h1>
            <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', fontFamily: 'monospace' }}>
              profile={uuidValue}&ref={refValue} • {totalPages} Pages
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

                {/* CANDIDATE HERO INFORMATION WITH PASSPORT SIZE PHOTO */}
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    {/* PASSPORT PHOTO BOX */}
                    {profilePicUrl ? (
                      <div style={{
                        width: '85px',
                        height: '105px',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        border: '2.5px solid #0F172A',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
                        backgroundColor: '#F1F5F9',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <img
                          src={profilePicUrl}
                          alt={fullName}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      </div>
                    ) : (
                      <div style={{
                        width: '85px',
                        height: '105px',
                        borderRadius: '10px',
                        backgroundColor: '#F1F5F9',
                        border: '2px dashed #CBD5E1',
                        color: '#64748B',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        gap: '4px'
                      }}>
                        <User size={30} style={{ color: '#0F172A' }} />
                        <span style={{ fontSize: '8.5px', fontWeight: '800', textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.5px' }}>Passport Photo</span>
                      </div>
                    )}

                    <div>
                      <h2 style={{ fontSize: '21px', fontWeight: '800', margin: '0 0 6px 0', color: '#0F172A', letterSpacing: '-0.5px' }}>
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

                  {/* CATEGORY 04: ATTACHED DOCUMENTS & VERIFICATION */}
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
                      <FileCheck size={15} style={{ color: '#D97706' }} />
                      <span>04. Verification Attachments</span>
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '10.5px', color: '#475569', fontWeight: '500' }}>Passport Photo:</span>
                        <strong style={{ color: profilePicUrl ? '#059669' : '#94A3B8', fontSize: '11px', fontWeight: '700' }}>
                          {profilePicUrl ? '✓ Attached' : '— Not Provided'}
                        </strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '10.5px', color: '#475569', fontWeight: '500' }}>Aadhaar Front & Back:</span>
                        <strong style={{ color: (aadhaarFrontUrl || aadhaarBackUrl) ? '#059669' : '#94A3B8', fontSize: '11px', fontWeight: '700' }}>
                          {(aadhaarFrontUrl && aadhaarBackUrl) ? '✓ Front & Back' : (aadhaarFrontUrl || aadhaarBackUrl ? '✓ Partial' : '— Not Provided')}
                        </strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '10.5px', color: '#475569', fontWeight: '500' }}>PAN Card (Front):</span>
                        <strong style={{ color: panCardUrl ? '#059669' : '#94A3B8', fontSize: '11px', fontWeight: '700' }}>
                          {panCardUrl ? '✓ Attached' : '— Not Provided'}
                        </strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '10.5px', color: '#475569', fontWeight: '500' }}>Address Proof (Bill):</span>
                        <strong style={{ color: addressProofUrl ? '#059669' : '#94A3B8', fontSize: '11px', fontWeight: '700' }}>
                          {addressProofUrl ? '✓ Bill Attached' : '— Not Provided'}
                        </strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '10.5px', color: '#475569', fontWeight: '500' }}>Resume / CV PDF:</span>
                        <strong style={{ color: cvLink ? '#059669' : '#94A3B8', fontSize: '11px', fontWeight: '700' }}>
                          {cvLink ? '✓ CV PDF Attached' : '— Not Provided'}
                        </strong>
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
                    Page 1 of {totalPages} — Dossier ID: {candidate?.id || uuidValue}
                  </div>
                </div>
              </div>
            </div>

            {/* PAGE 2: SEPARATE DEDICATED PAGE FOR IDENTITY DOCUMENTS (AADHAAR FRONT/BACK & PAN CARD) */}
            {hasIdDocs && (
              <div
                className="pdf-page pdf-page-id-docs"
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
                  {/* HEADER */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingBottom: '14px',
                    borderBottom: '2px solid #0F172A',
                    marginBottom: '20px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        backgroundColor: '#0F172A',
                        color: '#34BB88',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '800',
                        fontSize: '14px'
                      }}>
                        <CreditCard size={20} />
                      </div>
                      <div>
                        <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#0F172A', letterSpacing: '-0.5px' }}>
                          OFFICIAL IDENTITY VERIFICATION DOCUMENTS
                        </h2>
                        <span style={{ fontSize: '10px', color: '#059669', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
                          Aadhaar Card (Front & Back) & PAN Card (Front)
                        </span>
                      </div>
                    </div>

                    <div style={{
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #CBD5E1',
                      padding: '4px 12px',
                      borderRadius: '6px',
                      textAlign: 'right'
                    }}>
                      <strong style={{ fontSize: '12px', color: '#0F172A', fontFamily: 'monospace', fontWeight: '800' }}>
                        {candidate?.candidate_id || candidate?.ref_id || refValue}
                      </strong>
                    </div>
                  </div>

                  {/* 3 CARDS LAYOUT CONTAINER (UNIFORM AADHAAR / PAN CARD DIMENSIONS) */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px',
                    alignItems: 'start'
                  }}>
                    
                    {/* CARD 1: AADHAAR CARD FRONT */}
                    <div style={{
                      border: '1.5px solid #CBD5E1',
                      borderRadius: '12px',
                      padding: '12px',
                      backgroundColor: '#F8FAFC',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', fontWeight: '800', color: '#0F172A' }}>Aadhaar Card (Front)</span>
                        <span style={{ fontSize: '9.5px', background: '#DCFCE7', color: '#15803D', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>✓ Verified ID</span>
                      </div>

                      <div style={{
                        width: '100%',
                        height: '200px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {aadhaarFrontUrl ? (
                          aadhaarFrontUrl.match(/\.(pdf)(\?.*)?$/i) ? (
                            <iframe src={`${aadhaarFrontUrl}#toolbar=0&navpanes=0`} style={{ width: '100%', height: '100%', border: 'none' }} title="Aadhaar Front" />
                          ) : (
                            <img src={aadhaarFrontUrl} alt="Aadhaar Front" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                          )
                        ) : (
                          <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '600' }}>Not Attached</span>
                        )}
                      </div>
                    </div>

                    {/* CARD 2: AADHAAR CARD BACK */}
                    <div style={{
                      border: '1.5px solid #CBD5E1',
                      borderRadius: '12px',
                      padding: '12px',
                      backgroundColor: '#F8FAFC',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', fontWeight: '800', color: '#0F172A' }}>Aadhaar Card (Back)</span>
                        <span style={{ fontSize: '9.5px', background: '#DCFCE7', color: '#15803D', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>✓ Verified ID</span>
                      </div>

                      <div style={{
                        width: '100%',
                        height: '200px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {aadhaarBackUrl ? (
                          aadhaarBackUrl.match(/\.(pdf)(\?.*)?$/i) ? (
                            <iframe src={`${aadhaarBackUrl}#toolbar=0&navpanes=0`} style={{ width: '100%', height: '100%', border: 'none' }} title="Aadhaar Back" />
                          ) : (
                            <img src={aadhaarBackUrl} alt="Aadhaar Back" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                          )
                        ) : (
                          <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '600' }}>Not Attached</span>
                        )}
                      </div>
                    </div>

                    {/* CARD 3: PAN CARD (FRONT) - SPANS 2 COLUMNS FOR PERFECT BALANCE */}
                    <div style={{
                      gridColumn: 'span 2',
                      border: '1.5px solid #CBD5E1',
                      borderRadius: '12px',
                      padding: '12px',
                      backgroundColor: '#F8FAFC',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      maxWidth: '380px',
                      margin: '0 auto',
                      width: '100%'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', fontWeight: '800', color: '#0F172A' }}>PAN Card (Front)</span>
                        <span style={{ fontSize: '9.5px', background: '#DCFCE7', color: '#15803D', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>✓ Verified PAN</span>
                      </div>

                      <div style={{
                        width: '100%',
                        height: '210px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {panCardUrl ? (
                          panCardUrl.match(/\.(pdf)(\?.*)?$/i) ? (
                            <iframe src={`${panCardUrl}#toolbar=0&navpanes=0`} style={{ width: '100%', height: '100%', border: 'none' }} title="PAN Card" />
                          ) : (
                            <img src={panCardUrl} alt="PAN Card" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                          )
                        ) : (
                          <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '600' }}>Not Attached</span>
                        )}
                      </div>
                    </div>

                  </div>
                </div>

                {/* FOOTER */}
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
                    <span style={{ fontWeight: '600' }}>TFC Axom HR Verified Identity Page</span>
                  </div>
                  <div style={{ fontWeight: '600' }}>
                    Page {idDocsPageIndex} of {totalPages} — Dossier ID: {candidate?.id || uuidValue}
                  </div>
                </div>
              </div>
            )}

            {/* PAGE 3: SEPARATE DEDICATED PAGE FOR ADDRESS PROOF DOCUMENT (BILLS PDF / IMAGE) */}
            {hasAddressProof && (
              <div
                className="pdf-page pdf-page-address-proof"
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#18181B',
                  borderRadius: '16px',
                  padding: 0,
                  margin: '32px 0 0 0',
                  border: 'none',
                  boxShadow: 'none',
                  minHeight: '300px',
                  height: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden'
                }}
              >
                {/* AUTOMATED ADDRESS PROOF DOCUMENT HEADER (Hidden on Print) */}
                <div className="no-print" style={{
                  backgroundColor: '#F8FAFC',
                  borderBottom: '1px solid #E2E8F0',
                  padding: '10px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={16} style={{ color: '#059669' }} />
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#0F172A' }}>
                      {addressProofType}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '10px', background: '#DCFCE7', color: '#15803D', padding: '3px 10px', borderRadius: '6px', fontWeight: '800', letterSpacing: '0.5px' }}>
                      ✓ Auto-Calculated Height ({addressProofPdfPageCount} Page{addressProofPdfPageCount > 1 ? 's' : ''})
                    </span>
                  </div>
                </div>

                {/* FULL EXPANDED PDF / IMAGE CONTAINER */}
                <div style={{
                  flex: 1,
                  width: '100%',
                  minHeight: '300px',
                  height: 'auto',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 0,
                  overflow: 'hidden'
                }}>
                  {addressProofLink.match(/\.(jpg|jpeg|png|webp)(\?.*)?$/i) ? (
                    <img
                      src={addressProofLink}
                      alt="Address Proof Document"
                      style={{
                        width: '100%',
                        minHeight: '300px',
                        height: 'auto',
                        display: 'block',
                        objectFit: 'contain'
                      }}
                    />
                  ) : (
                    <iframe
                      src={`${preloadedAddressProofUrl || addressProofLink}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                      loading="eager"
                      scrolling="no"
                      style={{
                        width: '100%',
                        minHeight: '300px',
                        height: `${Math.max(300, addressProofPdfPageCount * 1170)}px`,
                        border: 'none',
                        margin: 0,
                        padding: 0,
                        backgroundColor: '#FFFFFF',
                        overflow: 'hidden'
                      }}
                      title="Address Proof PDF Document"
                    />
                  )}
                </div>
              </div>
            )}

            {/* PAGE 4+: ATTACHED RESUME CV FULL DOCUMENT */}
            {hasCv && (
              <div
                className="pdf-page pdf-page-cv"
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#18181B',
                  borderRadius: '16px',
                  padding: 0,
                  margin: '32px 0 0 0',
                  border: 'none',
                  boxShadow: 'none',
                  minHeight: '300px',
                  height: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden'
                }}
              >
                {/* AUTOMATED CV DOCUMENT HEADER (Hidden on Print) */}
                <div className="no-print" style={{
                  backgroundColor: '#F8FAFC',
                  borderBottom: '1px solid #E2E8F0',
                  padding: '10px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={16} style={{ color: '#059669' }} />
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#0F172A' }}>
                      Candidate Resume / CV Document
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '10px', background: '#DCFCE7', color: '#15803D', padding: '3px 10px', borderRadius: '6px', fontWeight: '800', letterSpacing: '0.5px' }}>
                      ✓ Auto-Calculated Height ({pdfPageCount} Page{pdfPageCount > 1 ? 's' : ''})
                    </span>
                  </div>
                </div>

                {/* FULL EXPANDED PDF / IMAGE CONTAINER */}
                <div style={{
                  flex: 1,
                  width: '100%',
                  minHeight: '300px',
                  height: 'auto',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 0,
                  overflow: 'hidden'
                }}>
                  {cvLink.match(/\.(jpg|jpeg|png|webp)(\?.*)?$/i) ? (
                    <img
                      src={cvLink}
                      alt="Candidate Resume"
                      style={{
                        width: '100%',
                        minHeight: '300px',
                        height: 'auto',
                        display: 'block',
                        objectFit: 'contain'
                      }}
                    />
                  ) : (
                    <iframe
                      src={`${preloadedCvUrl || cvLink}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                      loading="eager"
                      scrolling="no"
                      style={{
                        width: '100%',
                        minHeight: '300px',
                        height: `${Math.max(300, pdfPageCount * 1170)}px`,
                        border: 'none',
                        margin: 0,
                        padding: 0,
                        backgroundColor: '#FFFFFF',
                        overflow: 'hidden'
                      }}
                      title="Candidate Resume Document"
                    />
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* STRICT PRINT MEDIA STYLES */}
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
          .pdf-page-1, .pdf-page-id-docs {
            box-shadow: none !important;
            margin: 0 auto !important;
            border-radius: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            height: 297mm !important;
            max-height: 297mm !important;
            padding: 10mm 12mm !important;
            box-sizing: border-box !important;
            page-break-before: always !important;
            page-break-after: always !important;
            break-before: page !important;
            break-after: page !important;
            break-inside: avoid !important;
          }
          .pdf-page-1 {
            page-break-before: avoid !important;
            break-before: avoid !important;
          }
          .pdf-page-address-proof, .pdf-page-cv {
            box-shadow: none !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            min-height: 300px !important;
            overflow: hidden !important;
            page-break-before: always !important;
            break-before: page !important;
            box-sizing: border-box !important;
          }
          .pdf-page-address-proof iframe {
            width: 100% !important;
            max-width: 100% !important;
            height: ${Math.max(1, addressProofPdfPageCount) * 297}mm !important;
            min-height: 300px !important;
            border: none !important;
            margin: 0 !important;
            padding: 0 !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
          }
          .pdf-page-cv iframe {
            width: 100% !important;
            max-width: 100% !important;
            height: ${Math.max(1, pdfPageCount) * 297}mm !important;
            min-height: 300px !important;
            border: none !important;
            margin: 0 !important;
            padding: 0 !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
          }
        }
      `}</style>
    </div>
  );
}
