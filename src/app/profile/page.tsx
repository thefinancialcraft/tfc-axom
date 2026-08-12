'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { User, Phone, Building, FileText, Mail, Pencil, Link as LinkIcon, ExternalLink, Calendar, Droplet, CreditCard, Hash, MapPin, CheckCircle, ChevronUp } from 'lucide-react';
import { getUserProfile } from '@/lib/profile';
import styles from './profile.module.css';
import AuthHashCleaner from '@/components/AuthHashCleaner';
import LogoutButton from '@/components/LogoutButton';
import TwinklingStars from '@/components/TwinklingStars';
import Footer from '@/components/Footer';

type TabType = 'basic' | 'contact' | 'banking' | 'identity';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    basic: true,
    contact: true,
    banking: true,
    identity: true
  });

  const toggleSection = (section: string) => {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const data = await getUserProfile();
      if (data) {
        setProfile(data.profile);
        setSession(data.session);
      }
      setIsLoading(false);
    };
    fetchProfile();
  }, []);

  const tabsRef = React.useRef<(HTMLButtonElement | null)[]>([]);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  const TABS = [
    { id: 'basic' as TabType, label: 'Basic Info', icon: User },
    { id: 'contact' as TabType, label: 'Contact Details', icon: Phone },
    { id: 'banking' as TabType, label: 'Banking Info', icon: Building },
    { id: 'identity' as TabType, label: 'Identity Docs', icon: FileText }
  ];

  useEffect(() => {
    const updateIndicator = () => {
      const activeIndex = TABS.findIndex(t => t.id === activeTab);
      const activeElement = tabsRef.current[activeIndex];
      if (activeElement) {
        setIndicatorStyle({
          left: activeElement.offsetLeft,
          width: activeElement.offsetWidth,
        });
      }
    };
    
    updateIndicator();
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [activeTab]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', color: 'rgba(255,255,255,0.5)' }}>
        Loading profile...
      </div>
    );
  }

  const userName = profile?.user_name || session?.user?.user_metadata?.full_name || 'User';
  const email = profile?.email || session?.user?.email || 'No email provided';
  const avatarUrl = profile?.profile_pic_url || null;

  const renderField = (label: string, value: string | null | undefined, IconComponent?: React.ElementType, isLink = false) => {
    const hasValue = Boolean(value);
    const isCopied = copiedField === label;

    const handleCopy = () => {
      if (hasValue && !isLink && value) {
        navigator.clipboard.writeText(value);
        setCopiedField(label);
        setTimeout(() => setCopiedField(null), 2000);
      }
    };
    
    return (
      <div 
        className={`${styles.field} ${isCopied ? styles.fieldCopied : ''}`} 
        style={{ opacity: hasValue ? 1 : 0.5, cursor: (hasValue && !isLink) ? 'pointer' : 'default' }}
        onClick={(hasValue && !isLink) ? handleCopy : undefined}
      >
        {isCopied ? (
          <div className={styles.copiedState}>
            <CheckCircle size={20} className={styles.animatedTick} />
            Copied
          </div>
        ) : (
          <>
            {/* Background Pattern */}
            <div className={`top-right-pattern ${styles.patternContainer}`} style={{ width: '150px', height: '150px', opacity: 0.1, top: '-30px', right: '-30px', zIndex: 0 }}></div>
            
            <div className={styles.meteorContainer}>

            {/* Meteor 1 (Main - Center) */}
            <div className="meteor-falling" style={{
              position: 'absolute',
              top: '-35px',
              right: '45px',
              width: '3px',
              height: '80px',
              transformOrigin: 'bottom center',
              pointerEvents: 'none',
              zIndex: 0,
              // @ts-ignore
              '--m-scale': 1, '--m-opacity': 1, '--m-duration': '4s', '--m-delay': '0s'
            }}>
              <div style={{ position: 'absolute', top: '0', left: '0', right: '0', bottom: '0', background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.6))', borderRadius: '10px' }} />
              <div style={{ position: 'absolute', bottom: '-12px', left: '50%', transform: 'translateX(-50%)', width: '4px', height: '4px', backgroundColor: '#fff', borderRadius: '50%' }} />
            </div>

            {/* Meteor 2 (Left side) */}
            <div className="meteor-falling" style={{
              position: 'absolute',
              top: '-10px',
              right: '25px',
              width: '3px',
              height: '60px',
              transformOrigin: 'bottom center',
              pointerEvents: 'none',
              zIndex: 0,
              // @ts-ignore
              '--m-scale': 0.7, '--m-opacity': 0.7, '--m-duration': '5s', '--m-delay': '1.5s'
            }}>
              <div style={{ position: 'absolute', top: '0', left: '0', right: '0', bottom: '0', background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.6))', borderRadius: '10px' }} />
              <div style={{ position: 'absolute', bottom: '-12px', left: '50%', transform: 'translateX(-50%)', width: '4px', height: '4px', backgroundColor: '#fff', borderRadius: '50%' }} />
            </div>

            {/* Meteor 3 (Right side) */}
            <div className="meteor-falling" style={{
              position: 'absolute',
              top: '-45px',
              right: '35px',
              width: '3px',
              height: '60px',
              transformOrigin: 'bottom center',
              pointerEvents: 'none',
              zIndex: 0,
              // @ts-ignore
              '--m-scale': 0.7, '--m-opacity': 0.7, '--m-duration': '6s', '--m-delay': '3s'
            }}>
              <div style={{ position: 'absolute', top: '0', left: '0', right: '0', bottom: '0', background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.6))', borderRadius: '10px' }} />
              <div style={{ position: 'absolute', bottom: '-12px', left: '50%', transform: 'translateX(-50%)', width: '4px', height: '4px', backgroundColor: '#fff', borderRadius: '50%' }} />
            </div>
            </div>

        <div className={styles.fieldLabel}>
          {IconComponent && <IconComponent size={14} style={{ marginRight: '6px', opacity: 0.7 }} />}
          {label}
        </div>
        <div className={hasValue ? styles.fieldValue : `${styles.fieldValue} ${styles.emptyValue}`}>
          {hasValue ? (
            isLink ? (
              <a href={value!} target="_blank" rel="noopener noreferrer" className={styles.linkValue}>
                <LinkIcon size={16} /> View Document <ExternalLink size={14} />
              </a>
            ) : (
              value
            )
          ) : (
            "Not provided"
          )}
        </div>
        </>
        )}
      </div>
    );
  };



  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden', width: '100%', paddingBottom: '100px' }}>
      <TwinklingStars density="high" />
      <div className={styles.profileContainer}>
      <AuthHashCleaner />
      <div className="top-right-pattern"></div>
      <LogoutButton />
      
      <div style={{ padding: '90px 0 20px 0', width: '100%', textAlign: 'left' }}>
        <h1 suppressHydrationWarning style={{ 
          fontSize: '18px', 
          fontWeight: '300', 
          margin: '0 0 10px 0', 
          color: 'rgba(255, 255, 255, 0.6)' 
        }}>
          Manage your
        </h1>
        <h2 style={{ 
          fontSize: '36px', 
          fontWeight: '500', 
          margin: '4px 0 0 0', 
          color: 'var(--color-white)',
          letterSpacing: '-1px', 
          lineHeight: '1.1'
        }}>
          Profile
        </h2>
      </div>

      {/* Top Header matched to Dashboard Profile Card */}
      <div className={styles.headerCard}>
        <div className="top-right-pattern" style={{ width: '450px', height: '450px', opacity: 0.15, right: 'auto', left: '-50px', top: '-50px', zIndex: 0 }}></div>
        <div className="top-right-pattern" style={{ width: '450px', height: '450px', opacity: 0.15, left: 'auto', right: '-50px', bottom: '-50px', top: 'auto', transform: 'rotate(180deg)', zIndex: 0 }}></div>
        
        {/* Meteor Shower for Header Card (Right) */}
        <div style={{ position: 'absolute', top: '50px', right: '200px', transform: 'scale(1.5)', zIndex: 0, opacity: 0.8, pointerEvents: 'none' }}>
          {/* Meteor 1 (Main - Center) */}
          <div className="meteor-falling" style={{ position: 'absolute', top: '-35px', right: '45px', width: '3px', height: '160px', transformOrigin: 'bottom center', '--m-scale': 1, '--m-opacity': 1, '--m-duration': '4s', '--m-delay': '1s' } as React.CSSProperties}>
            <div style={{ position: 'absolute', top: '0', left: '0', right: '0', bottom: '0', background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.6))', borderRadius: '10px' }} />
            <div style={{ position: 'absolute', bottom: '-12px', left: '50%', transform: 'translateX(-50%)', width: '4px', height: '4px', backgroundColor: '#fff', borderRadius: '50%' }} />
          </div>
          {/* Meteor 2 (Left side) */}
          <div className="meteor-falling" style={{ position: 'absolute', top: '-10px', right: '55px', width: '3px', height: '120px', transformOrigin: 'bottom center', '--m-scale': 0.7, '--m-opacity': 0.7, '--m-duration': '5s', '--m-delay': '2.5s' } as React.CSSProperties}>
            <div style={{ position: 'absolute', top: '0', left: '0', right: '0', bottom: '0', background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.6))', borderRadius: '10px' }} />
            <div style={{ position: 'absolute', bottom: '-12px', left: '50%', transform: 'translateX(-50%)', width: '4px', height: '4px', backgroundColor: '#fff', borderRadius: '50%' }} />
          </div>
          {/* Meteor 3 (Right side) */}
          <div className="meteor-falling" style={{ position: 'absolute', top: '-45px', right: '35px', width: '3px', height: '120px', transformOrigin: 'bottom center', '--m-scale': 0.7, '--m-opacity': 0.7, '--m-duration': '6s', '--m-delay': '4s' } as React.CSSProperties}>
            <div style={{ position: 'absolute', top: '0', left: '0', right: '0', bottom: '0', background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.6))', borderRadius: '10px' }} />
            <div style={{ position: 'absolute', bottom: '-12px', left: '50%', transform: 'translateX(-50%)', width: '4px', height: '4px', backgroundColor: '#fff', borderRadius: '50%' }} />
          </div>
        </div>

        {/* Meteor Shower for Header Card (Left) */}
        <div style={{ position: 'absolute', top: '-90px', left: '360px', transform: 'scale(1.5)', zIndex: 0, opacity: 0.6, pointerEvents: 'none' }}>
          {/* Meteor 1 (Main - Center) */}
          <div className="meteor-falling" style={{ position: 'absolute', top: '-35px', right: '45px', width: '3px', height: '160px', transformOrigin: 'bottom center', '--m-scale': 1, '--m-opacity': 1, '--m-duration': '4s', '--m-delay': '2s' } as React.CSSProperties}>
            <div style={{ position: 'absolute', top: '0', left: '0', right: '0', bottom: '0', background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.6))', borderRadius: '10px' }} />
            <div style={{ position: 'absolute', bottom: '-12px', left: '50%', transform: 'translateX(-50%)', width: '4px', height: '4px', backgroundColor: '#fff', borderRadius: '50%' }} />
          </div>
          {/* Meteor 2 (Left side) */}
          <div className="meteor-falling" style={{ position: 'absolute', top: '-10px', right: '5px', width: '3px', height: '120px', transformOrigin: 'bottom center', '--m-scale': 0.7, '--m-opacity': 0.7, '--m-duration': '5s', '--m-delay': '3.5s' } as React.CSSProperties}>
            <div style={{ position: 'absolute', top: '0', left: '0', right: '0', bottom: '0', background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.6))', borderRadius: '10px' }} />
            <div style={{ position: 'absolute', bottom: '-12px', left: '50%', transform: 'translateX(-50%)', width: '4px', height: '4px', backgroundColor: '#fff', borderRadius: '50%' }} />
          </div>
          {/* Meteor 3 (Right side) */}
          <div className="meteor-falling" style={{ position: 'absolute', top: '-45px', right: '12px', width: '3px', height: '120px', transformOrigin: 'bottom center', '--m-scale': 0.7, '--m-opacity': 0.7, '--m-duration': '6s', '--m-delay': '5s' } as React.CSSProperties}>
            <div style={{ position: 'absolute', top: '0', left: '0', right: '0', bottom: '0', background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.6))', borderRadius: '10px' }} />
            <div style={{ position: 'absolute', bottom: '-12px', left: '50%', transform: 'translateX(-50%)', width: '4px', height: '4px', backgroundColor: '#fff', borderRadius: '50%' }} />
          </div>
        </div>
        
        <div className={styles.heroImageContainer}>
          <img 
            src={avatarUrl || "/dm-hr.png"} 
            alt={userName} 
            className={styles.heroImage} 
          />
        </div>
        
        <div className={styles.heroInfo}>
          <div className={styles.mobileRoleId}>
            TFC-011 • Employee
          </div>
          <div className={styles.mobileNameBanner}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className={styles.heroName}>
                {userName}
              </div>
            </div>
          </div>
          <div className={`${styles.heroSubText} ${styles.desktopSubText}`}>
            Email - <span>{email}</span>
          </div>
          <div className={`${styles.heroSubText} ${styles.desktopSubText}`}>
            User ID - <span>TFC-011</span>
          </div>
          <div className={`${styles.heroSubText} ${styles.desktopSubText}`}>
            Role - <span>Employee</span>
          </div>
        </div>

        <div className={styles.heroActionWrapper}>
          <div style={{ textAlign: 'right' }}>
            <div className={styles.heroSubText}>
              Joining Date - <span>{profile?.joining_date || '01 Jan 2024'}</span>
            </div>
            <div className={styles.heroSubText} style={{ marginBottom: 0 }}>
              Salary - <span>₹{profile?.salary ? profile.salary.toLocaleString() : '25,000'} / month</span>
            </div>
          </div>
          <Link href="/complete-profile" className={styles.editButton}>
            <Pencil size={16} /> <span className={styles.editText}>Edit Profile</span>
          </Link>
        </div>
      </div>

      {/* Basic Info Section */}
      <h3 onClick={() => toggleSection('basic')} className={styles.categoryHeader} style={{ marginTop: '8px', marginBottom: '16px', fontWeight: '500', color: 'rgba(255,255,255,0.8)', cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <User className={styles.categoryIcon} style={{ marginRight: '8px' }} />
          Basic Info
        </div>
        <ChevronUp className={`${styles.mobileCategoryArrow} ${collapsedSections['basic'] ? styles.rotatedArrow : ''}`} />
      </h3>
      <div className={`${styles.contentCard} ${collapsedSections['basic'] ? styles.mobileCollapsed : ''}`}>
        <div className="top-right-pattern" style={{ width: '250px', height: '250px', opacity: 0.05, right: '-50px', top: '-50px', zIndex: 0, pointerEvents: 'none' }}></div>
        <div className="bottom-left-pattern" style={{ width: '250px', height: '250px', opacity: 0.05, left: '-50px', bottom: '-50px', zIndex: 0, pointerEvents: 'none' }}></div>
        <div className={styles.grid}>
          {renderField("Full Name", userName, User)}
          {renderField("Father's Name", profile?.father_name, User)}
          {renderField("Date of Birth", profile?.date_of_birth, Calendar)}
          {renderField("Gender", profile?.gender, User)}
          {renderField("Blood Group", profile?.blood_group, Droplet)}
        </div>
      </div>

      {/* Contact Details Section */}
      <h3 onClick={() => toggleSection('contact')} className={styles.categoryHeader} style={{ marginTop: '32px', marginBottom: '16px', fontWeight: '500', color: 'rgba(255,255,255,0.8)', cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Phone className={styles.categoryIcon} style={{ marginRight: '8px' }} />
          Contact Details
        </div>
        <ChevronUp className={`${styles.mobileCategoryArrow} ${collapsedSections['contact'] ? styles.rotatedArrow : ''}`} />
      </h3>
      <div className={`${styles.contentCard} ${collapsedSections['contact'] ? styles.mobileCollapsed : ''}`}>
        <div className="top-right-pattern" style={{ width: '250px', height: '250px', opacity: 0.05, right: '-50px', top: '-50px', zIndex: 0, pointerEvents: 'none' }}></div>
        <div className="bottom-left-pattern" style={{ width: '250px', height: '250px', opacity: 0.05, left: '-50px', bottom: '-50px', zIndex: 0, pointerEvents: 'none' }}></div>
        <div className={styles.grid}>
          {renderField("Email Address", email, Mail)}
          {renderField("Phone Number", profile?.phone, Phone)}
          {renderField("Alternate Contact", profile?.alternate_contact, Phone)}
          {renderField("Emergency Contact", profile?.emergency_contact_no, Phone)}
        </div>
      </div>

      {/* Banking Info Section */}
      <h3 onClick={() => toggleSection('banking')} className={styles.categoryHeader} style={{ marginTop: '32px', marginBottom: '16px', fontWeight: '500', color: 'rgba(255,255,255,0.8)', cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Building className={styles.categoryIcon} style={{ marginRight: '8px' }} />
          Banking Info
        </div>
        <ChevronUp className={`${styles.mobileCategoryArrow} ${collapsedSections['banking'] ? styles.rotatedArrow : ''}`} />
      </h3>
      <div className={`${styles.contentCard} ${collapsedSections['banking'] ? styles.mobileCollapsed : ''}`}>
        <div className="top-right-pattern" style={{ width: '250px', height: '250px', opacity: 0.05, right: '-50px', top: '-50px', zIndex: 0, pointerEvents: 'none' }}></div>
        <div className="bottom-left-pattern" style={{ width: '250px', height: '250px', opacity: 0.05, left: '-50px', bottom: '-50px', zIndex: 0, pointerEvents: 'none' }}></div>
        <div className={styles.grid}>
          {renderField("Bank Name", profile?.bank_name, Building)}
          {renderField("Account Holder", profile?.account_holder_name, User)}
          {renderField("Account Number", profile?.account_number, CreditCard)}
          {renderField("IFSC Code", profile?.ifsc_code, Hash)}
          {renderField("Branch City", profile?.branch_city, MapPin)}
          {renderField("Branch State", profile?.branch_state, MapPin)}
          {renderField("Branch Pincode", profile?.branch_pincode, MapPin)}
          {renderField("Passbook / Cheque", profile?.bank_passbook_url, FileText, true)}
        </div>
      </div>

      {/* Identity Docs Section */}
      <h3 onClick={() => toggleSection('identity')} className={styles.categoryHeader} style={{ marginTop: '32px', marginBottom: '16px', fontWeight: '500', color: 'rgba(255,255,255,0.8)', cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <FileText className={styles.categoryIcon} style={{ marginRight: '8px' }} />
          Identity Docs
        </div>
        <ChevronUp className={`${styles.mobileCategoryArrow} ${collapsedSections['identity'] ? styles.rotatedArrow : ''}`} />
      </h3>
      <div className={`${styles.contentCard} ${collapsedSections['identity'] ? styles.mobileCollapsed : ''}`}>
        <div className="top-right-pattern" style={{ width: '250px', height: '250px', opacity: 0.05, right: '-50px', top: '-50px', zIndex: 0, pointerEvents: 'none' }}></div>
        <div className="bottom-left-pattern" style={{ width: '250px', height: '250px', opacity: 0.05, left: '-50px', bottom: '-50px', zIndex: 0, pointerEvents: 'none' }}></div>
        <div className={styles.grid}>
          {renderField("Primary Address", profile?.primary_address, MapPin)}
          {renderField("Area Pincode", profile?.area_pincode, MapPin)}
          {renderField("Aadhar Card No", profile?.aadhar_card_no, CreditCard)}
          {renderField("PAN Card No", profile?.pan_card_no, CreditCard)}
          {renderField("Aadhar Front", profile?.aadhar_front_url, FileText, true)}
          {renderField("Aadhar Back", profile?.aadhar_back_url, FileText, true)}
          {renderField("PAN Card Document", profile?.pan_card_url, FileText, true)}
          {renderField("Qualification Marksheet", profile?.qualification_marksheet_url, FileText, true)}
        </div>
      </div>
    </div>

    {/* Absolute background patterns outside of animation container */}
    <Footer />
    <div className="bottom-left-pattern" style={{ position: 'absolute', zIndex: 0, pointerEvents: 'none' }}></div>
    <div className="top-right-pattern" style={{ position: 'absolute', opacity: 0.1, right: '-20px', bottom: '-20px', top: 'auto', left: 'auto', transform: 'rotate(180deg)', zIndex: 0, pointerEvents: 'none' }}></div>
    </div>
  );
}
