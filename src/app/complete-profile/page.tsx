'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Phone, Users, AlertCircle, Building, User, CreditCard, Hash, MapPin, Map, FileText, Link as LinkIcon, Calendar, Image as ImageIcon, Info } from 'lucide-react';
import LogoutButton from '@/components/LogoutButton';
import { supabase } from '@/lib/supabase';
import ScrollPicker from '@/components/ScrollPicker';
import { updateAuthUserAdmin } from '../actions/auth';
import ContactDetailsForm from '@/components/ContactDetailsForm';
import BankingInfoForm from '@/components/BankingInfoForm';
import IdentityDocsForm from '@/components/IdentityDocsForm';

import { getUserProfile } from '@/lib/profile';

const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
// Years from 1950 to current year
const YEARS = Array.from({ length: new Date().getFullYear() - 1950 + 1 }, (_, i) => String(new Date().getFullYear() - i));
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function CompleteProfilePage() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [hideGreeting, setHideGreeting] = useState(false);
  const [showQuestion, setShowQuestion] = useState(false);
  const [step, setStep] = useState<'ask_name' | 'input_name' | 'upload_avatar' | 'input_father_name' | 'input_dob' | 'input_gender_blood' | 'input_contact_details' | 'input_banking_info' | 'input_identity_docs'>('ask_name');
  const [newName, setNewName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [fatherName, setFatherName] = useState('');
  const [dobDay, setDobDay] = useState('01');
  const [dobMonth, setDobMonth] = useState('Jan');
  const [dobYear, setDobYear] = useState('2000');
  const [gender, setGender] = useState('Male');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [alternateContact, setAlternateContact] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUserFetched, setIsUserFetched] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showAvatarInfo, setShowAvatarInfo] = useState(false);
  
  // Banking Info
  const [bankName, setBankName] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [branchCity, setBranchCity] = useState('');
  const [branchState, setBranchState] = useState('');
  const [branchPincode, setBranchPincode] = useState('');
  const [bankPassbookUrl, setBankPassbookUrl] = useState('');

  // Identity Docs
  const [primaryAddress, setPrimaryAddress] = useState('');
  const [areaPincode, setAreaPincode] = useState('');
  const [aadharCardNo, setAadharCardNo] = useState('');
  const [aadharFrontUrl, setAadharFrontUrl] = useState('');
  const [aadharBackUrl, setAadharBackUrl] = useState('');
  const [panCardNo, setPanCardNo] = useState('');
  const [panCardUrl, setPanCardUrl] = useState('');
  const [qualificationMarksheetUrl, setQualificationMarksheetUrl] = useState('');

  const [originalProfile, setOriginalProfile] = useState<any>(null);

  const goToStep = (nextStep: typeof step) => {
    setIsTransitioning(true);
    
    setTimeout(() => {
      setStep(nextStep);
      setIsTransitioning(false);
    }, 500);
  };

  const calculateAge = () => {
    if (!dobDay || !dobMonth || !dobYear || dobYear.length < 4) return null;
    const birthDate = new Date(`${dobMonth} ${dobDay}, ${dobYear}`);
    if (isNaN(birthDate.getTime())) return null;
    
    // Check if future date
    if (birthDate.getTime() > Date.now()) return null;

    const ageDifMs = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDifMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    return age;
  };

  const handleUpdateName = async () => {
    if (!newName.trim()) return;
    
    // Skip DB hit if unchanged
    if (originalProfile && newName.trim() === originalProfile.user_name) {
      goToStep('upload_avatar');
      return;
    }

    setIsUpdating(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      // Update user_profiles table
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ 
          user_name: newName.trim()
        })
        .eq('user_id', session.user.id);
        
      if (profileError) throw profileError;

      // Update auth metadata to keep it synced
      await supabase.auth.updateUser({
        data: { full_name: newName.trim(), name: newName.trim() }
      });

      goToStep('upload_avatar');
    } catch (error) {
      console.error('Error updating name:', error);
      alert('Failed to update name. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateAvatar = async () => {
    if (originalProfile && !avatarFile && avatarUrl === (originalProfile.profile_pic_url || '')) {
      goToStep('input_father_name');
      return;
    }

    setIsUpdating(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      let finalAvatarUrl = avatarUrl;
      
      // If a new file was selected, upload it to storage
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const filePath = `${session.user.id}/avatar-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('user-uploads')
          .upload(filePath, avatarFile, { upsert: true });
          
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('user-uploads')
          .getPublicUrl(filePath);
          
        finalAvatarUrl = publicUrl;
      }

      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ 
          profile_pic_url: finalAvatarUrl
        })
        .eq('user_id', session.user.id);
        
      if (profileError) throw profileError;

      goToStep('input_father_name');
    } catch (error) {
      console.error('Error updating avatar:', error);
      alert('Failed to upload and update avatar. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const checkTransparency = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      // JPEGs don't support transparency
      if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
        resolve(false);
        return;
      }

      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(true); // Fallback if canvas is not supported
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        try {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          
          let hasTransparency = false;
          // Check every 4th value (alpha channel)
          // We can skip some pixels for performance if it's a huge image, but usually avatars are small.
          // Checking every 4th pixel to make it faster
          for (let i = 3; i < data.length; i += 16) {
            if (data[i] < 255) {
              hasTransparency = true;
              break;
            }
          }
          
          URL.revokeObjectURL(objectUrl);
          resolve(hasTransparency);
        } catch (e) {
          // CORS or other errors, fallback to true
          resolve(true);
        }
      };
      
      img.onerror = () => {
        resolve(true); // Fallback on error
      };
      
      img.src = objectUrl;
    });
  };

  const handleUpdateFatherName = async () => {
    if (!fatherName.trim()) return;
    
    if (originalProfile && fatherName.trim() === originalProfile.father_name) {
      goToStep('input_dob');
      return;
    }

    setIsUpdating(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      // Update user_profiles table
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ 
          father_name: fatherName.trim()
        })
        .eq('user_id', session.user.id);
        
      if (profileError) throw profileError;

      goToStep('input_dob');
    } catch (error) {
      console.error('Error updating father name:', error);
      alert('Failed to update father name. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateDob = async () => {
    if (!dobDay || !dobMonth || !dobYear) return;
    
    const dateStr = `${dobYear}-${String(new Date(`${dobMonth} 1`).getMonth() + 1).padStart(2, '0')}-${dobDay.padStart(2, '0')}`;
    
    if (originalProfile && dateStr === originalProfile.date_of_birth) {
      goToStep('input_gender_blood');
      return;
    }

    setIsUpdating(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      // Update user_profiles table
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ 
          date_of_birth: dateStr
        })
        .eq('user_id', session.user.id);
        
      if (profileError) throw profileError;

      goToStep('input_gender_blood');
      
    } catch (error) {
      console.error('Error updating DOB:', error);
      alert('Failed to update DOB. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateGenderBlood = async () => {
    if (originalProfile && gender === originalProfile.gender && bloodGroup === originalProfile.blood_group) {
      goToStep('input_contact_details');
      return;
    }

    setIsUpdating(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ 
          gender: gender,
          blood_group: bloodGroup
        })
        .eq('user_id', session.user.id);
        
      if (profileError) throw profileError;

      goToStep('input_contact_details');
      
    } catch (error) {
      console.error('Error updating details:', error);
      alert('Failed to update details. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateContact = async () => {
    if (originalProfile && email === (originalProfile.email || '') && phone === (originalProfile.phone || '') && alternateContact === (originalProfile.alternate_contact || '') && emergencyContact === (originalProfile.emergency_contact_no || '')) {
      goToStep('input_banking_info');
      return;
    }

    setIsUpdating(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      // Update auth.users table using Service Role Key (Admin Bypass)
      const authUpdates: { email?: string; phone?: string } = {};
      if (email && email.trim() !== '' && email !== session.user.email) authUpdates.email = email;
      if (phone && phone.trim() !== '' && phone !== session.user.phone) authUpdates.phone = phone;
      
      if (Object.keys(authUpdates).length > 0) {
        const authResult = await updateAuthUserAdmin(session.user.id, authUpdates);
        if (!authResult.success) {
          console.warn('Admin auth table update failed. Continuing to update profile...', authResult.error);
        } else {
          console.log('Successfully updated auth table via Service Key.');
        }
      }

      // Update user_profiles table
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ 
          email: email,
          phone: phone,
          alternate_contact: alternateContact,
          emergency_contact_no: emergencyContact
        })
        .eq('user_id', session.user.id);
        
      if (profileError) throw profileError;

      goToStep('input_banking_info');
      
    } catch (error) {
      console.error('Error updating contacts:', error);
      alert('Failed to update contact details. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateBanking = async () => {
    setIsUpdating(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ 
          bank_name: bankName.trim(),
          account_holder_name: accountHolderName.trim(),
          account_number: accountNumber.trim(),
          ifsc_code: ifscCode.trim(),
          branch_city: branchCity.trim(),
          branch_state: branchState.trim(),
          branch_pincode: branchPincode.trim(),
          bank_passbook_url: bankPassbookUrl
        })
        .eq('user_id', session.user.id);
        
      if (profileError) throw profileError;

      goToStep('input_identity_docs');
    } catch (error) {
      console.error('Error updating banking info:', error);
      alert('Failed to update banking details. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateIdentity = async () => {
    setIsUpdating(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ 
          primary_address: primaryAddress.trim(),
          area_pincode: areaPincode.trim(),
          aadhar_card_no: aadharCardNo.trim(),
          aadhar_front_url: aadharFrontUrl,
          aadhar_back_url: aadharBackUrl,
          pan_card_no: panCardNo.trim(),
          pan_card_url: panCardUrl,
          qualification_marksheet_url: qualificationMarksheetUrl
        })
        .eq('user_id', session.user.id);
        
      if (profileError) throw profileError;

      router.push('/dashboard');
    } catch (error) {
      console.error('Error updating identity docs:', error);
    } finally {
      setIsUpdating(false);
    }
  };


  useEffect(() => {
    async function fetchUser() {
      const result = await getUserProfile();
      if (result) {
        const { session, profile } = result;
        const authName = session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'User';
        
        if (profile) setOriginalProfile(profile);
        
        // Auth fallback
        if (session.user.email) setEmail(session.user.email);

        // Set user name for greeting and input
        setUserName(profile?.user_name || authName);
        if (profile?.user_name) setNewName(profile.user_name);
        if (profile?.profile_pic_url) {
          setAvatarUrl(profile.profile_pic_url);
          setAvatarPreview(profile.profile_pic_url);
        }
        
        // Set other fields if they exist
        if (profile?.father_name) setFatherName(profile.father_name);
        
        if (profile?.date_of_birth) {
          const [y, m, d] = profile.date_of_birth.split('-');
          if (y && m && d) {
            setDobYear(y);
            setDobDay(d);
            const monthIndex = parseInt(m, 10) - 1;
            if (monthIndex >= 0 && monthIndex < 12) {
              setDobMonth(MONTHS[monthIndex]);
            }
          }
        }
        
        if (profile?.gender) setGender(profile.gender);
        if (profile?.blood_group) setBloodGroup(profile.blood_group);
        
        if (profile?.email) setEmail(profile.email);
        if (profile?.phone) setPhone(profile.phone);
        if (profile?.alternate_contact) setAlternateContact(profile.alternate_contact);
        if (profile?.emergency_contact_no) setEmergencyContact(profile.emergency_contact_no);
        
        // Banking Info
        if (profile?.bank_name) setBankName(profile.bank_name);
        if (profile?.account_holder_name) setAccountHolderName(profile.account_holder_name);
        if (profile?.account_number) setAccountNumber(profile.account_number);
        if (profile?.ifsc_code) setIfscCode(profile.ifsc_code);
        if (profile?.branch_city) setBranchCity(profile.branch_city);
        if (profile.branch_state) setBranchState(profile.branch_state);
        if (profile.branch_pincode) setBranchPincode(profile.branch_pincode);
        if (profile.bank_passbook_url) setBankPassbookUrl(profile.bank_passbook_url);

        // Identity Docs
        if (profile.primary_address) setPrimaryAddress(profile.primary_address);
        if (profile.area_pincode) setAreaPincode(profile.area_pincode);
        if (profile.aadhar_card_no) setAadharCardNo(profile.aadhar_card_no);
        if (profile.aadhar_front_url) setAadharFrontUrl(profile.aadhar_front_url);
        if (profile.aadhar_back_url) setAadharBackUrl(profile.aadhar_back_url);
        if (profile.pan_card_no) setPanCardNo(profile.pan_card_no);
        if (profile.pan_card_url) setPanCardUrl(profile.pan_card_url);
        if (profile.qualification_marksheet_url) setQualificationMarksheetUrl(profile.qualification_marksheet_url);
      }
      setIsUserFetched(true);
    }
    fetchUser();
  }, []);

  useEffect(() => {
    if (!isUserFetched) return;

    const hideTimer = setTimeout(() => {
      setHideGreeting(true);
    }, 3000);

    const questionTimer = setTimeout(() => {
      setShowQuestion(true);
    }, 3800); // 0.8s after greeting starts hiding

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(questionTimer);
    };
  }, [isUserFetched]);

  return (
    <main id="top-of-page" style={{ 
      position: 'relative', 
      overflowX: 'hidden', 
      backgroundColor: (step === 'input_contact_details' || step === 'input_banking_info' || step === 'input_identity_docs') ? '#F9FAFB' : 'var(--color-black)', 
      transition: 'background-color 1s ease-in-out',
      minHeight: '100vh', 
      padding: (step === 'input_contact_details' || step === 'input_banking_info' || step === 'input_identity_docs') ? '40px 24px' : '24px' 
    }}>
      <LogoutButton variant={(step === 'input_contact_details' || step === 'input_banking_info' || step === 'input_identity_docs') ? 'dark' : 'light'} />
      <div className="top-right-pattern" style={{ 
        filter: (step === 'input_contact_details' || step === 'input_banking_info' || step === 'input_identity_docs') ? 'invert(1) opacity(0.4)' : 'none', 
        transition: 'filter 1s ease-in-out' 
      }}></div>
      <div className="bottom-left-pattern" style={{ 
        filter: (step === 'input_contact_details' || step === 'input_banking_info' || step === 'input_identity_docs') ? 'invert(1) opacity(0.4)' : 'none', 
        transition: 'filter 1s ease-in-out' 
      }}></div>
      
      <style>{`
        @keyframes mirror-sweep {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(40px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes twinkle {
          0% { opacity: 0.1; }
          50% { opacity: 0.8; transform: scale(1.02); }
          100% { opacity: 0.1; }
        }
        @keyframes move-stars-1 {
          from { background-position: 0 0; }
          to { background-position: -400px 400px; }
        }
        @keyframes move-stars-2 {
          from { background-position: 0 0; }
          to { background-position: 300px 300px; }
        }
        @keyframes move-stars-3 {
          from { background-position: 0 0; }
          to { background-position: 500px -500px; }
        }
        @keyframes move-stars-4 {
          from { background-position: 0 0; }
          to { background-position: -600px -200px; }
        }
        @keyframes move-stars-5 {
          from { background-position: 0 0; }
          to { background-position: 400px -600px; }
        }
        @keyframes move-stars-6 {
          from { background-position: 0 0; }
          to { background-position: -200px 700px; }
        }
        .animate-fade-in-up {
          animation: fade-in-up 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
          opacity: 0;
        }
        .star-layer {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          pointer-events: none;
          z-index: 1;
        }
        .stars-1 {
          background: radial-gradient(1.5px 1.5px at 20px 30px, #fff, rgba(0,0,0,0)),
                      radial-gradient(1.5px 1.5px at 140px 70px, #fff, rgba(0,0,0,0)),
                      radial-gradient(1.5px 1.5px at 250px 160px, #fff, rgba(0,0,0,0)),
                      radial-gradient(1.5px 1.5px at 90px 240px, #fff, rgba(0,0,0,0)),
                      radial-gradient(1.5px 1.5px at 330px 180px, #fff, rgba(0,0,0,0));
          background-repeat: repeat;
          background-size: 400px 400px;
          animation: twinkle 3s infinite alternate, move-stars-1 50s linear infinite;
        }
        .stars-2 {
          background: radial-gradient(1px 1px at 50px 100px, #fff, rgba(0,0,0,0)),
                      radial-gradient(1px 1px at 200px 150px, #fff, rgba(0,0,0,0)),
                      radial-gradient(1px 1px at 350px 50px, #fff, rgba(0,0,0,0)),
                      radial-gradient(1px 1px at 150px 350px, #fff, rgba(0,0,0,0));
          background-repeat: repeat;
          background-size: 300px 300px;
          animation: twinkle 4s infinite alternate-reverse, move-stars-2 40s linear infinite;
        }
        .stars-3 {
          background: radial-gradient(2px 2px at 80px 200px, #fff, rgba(0,0,0,0)),
                      radial-gradient(2px 2px at 180px 300px, rgba(52, 187, 136, 0.8), rgba(0,0,0,0)),
                      radial-gradient(2px 2px at 380px 80px, #fff, rgba(0,0,0,0));
          background-repeat: repeat;
          background-size: 500px 500px;
          animation: twinkle 5s infinite alternate, move-stars-3 70s linear infinite;
        }
        .stars-4 {
          background: radial-gradient(1px 1px at 10px 40px, #fff, rgba(0,0,0,0)),
                      radial-gradient(1px 1px at 220px 80px, #fff, rgba(0,0,0,0)),
                      radial-gradient(1.5px 1.5px at 320px 240px, rgba(52, 187, 136, 0.6), rgba(0,0,0,0)),
                      radial-gradient(1px 1px at 150px 450px, #fff, rgba(0,0,0,0));
          background-repeat: repeat;
          background-size: 600px 600px;
          animation: twinkle 4.5s infinite alternate-reverse, move-stars-4 60s linear infinite;
        }
        .stars-5 {
          background: radial-gradient(2px 2px at 120px 90px, #fff, rgba(0,0,0,0)),
                      radial-gradient(1.5px 1.5px at 280px 350px, #fff, rgba(0,0,0,0)),
                      radial-gradient(1px 1px at 450px 150px, #fff, rgba(0,0,0,0));
          background-repeat: repeat;
          background-size: 450px 450px;
          animation: twinkle 3.5s infinite alternate, move-stars-5 45s linear infinite;
        }
        .stars-6 {
          background: radial-gradient(1.5px 1.5px at 60px 320px, #fff, rgba(0,0,0,0)),
                      radial-gradient(2px 2px at 240px 110px, #fff, rgba(0,0,0,0)),
                      radial-gradient(1px 1px at 410px 290px, rgba(52, 187, 136, 0.7), rgba(0,0,0,0)),
                      radial-gradient(1.5px 1.5px at 170px 40px, #fff, rgba(0,0,0,0));
          background-repeat: repeat;
          background-size: 550px 550px;
          animation: twinkle 6s infinite alternate-reverse, move-stars-6 80s linear infinite;
        }
        @keyframes button-shine {
          0% { left: -100%; }
          20% { left: 200%; }
          100% { left: 200%; }
        }
        .mirror-btn {
          position: relative;
          overflow: hidden;
        }
        .mirror-btn::before {
          content: '';
          position: absolute;
          top: 0; 
          left: -100%;
          width: 50%; 
          height: 100%;
          background: linear-gradient(
            to right, 
            transparent, 
            rgba(255,255,255,0.4), 
            transparent
          );
          transform: skewX(-25deg);
          animation: button-shine 6s infinite;
          pointer-events: none;
        }
        .mirror-text {
          background: linear-gradient(
            110deg,
            var(--color-white) 35%,
            rgba(255, 255, 255, 0.4) 45%,
            rgba(255, 255, 255, 0.9) 50%,
            rgba(255, 255, 255, 0.4) 55%,
            var(--color-white) 65%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: mirror-sweep 4s linear infinite;
        }
        .mirror-text-green {
          background: linear-gradient(
            110deg,
            var(--color-green) 35%,
            rgba(52, 187, 136, 0.4) 45%,
            rgba(255, 255, 255, 0.8) 50%,
            rgba(52, 187, 136, 0.4) 55%,
            var(--color-green) 65%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: mirror-sweep 4s linear infinite;
        }
        .minimal-input::placeholder {
          color: rgba(255, 255, 255, 0.2);
        }
      `}</style>

      {/* Twinkling Stars Background */}
      <div className="star-layer stars-1" style={{ filter: (step === 'input_contact_details' || step === 'input_banking_info' || step === 'input_identity_docs') ? 'invert(1) opacity(1.0)' : 'none', transition: 'filter 1s ease-in-out' }}></div>
      <div className="star-layer stars-2" style={{ filter: (step === 'input_contact_details' || step === 'input_banking_info' || step === 'input_identity_docs') ? 'invert(1) opacity(1.0)' : 'none', transition: 'filter 1s ease-in-out' }}></div>
      <div className="star-layer stars-3" style={{ filter: (step === 'input_contact_details' || step === 'input_banking_info' || step === 'input_identity_docs') ? 'invert(1) opacity(1.0)' : 'none', transition: 'filter 1s ease-in-out' }}></div>
      <div className="star-layer stars-4" style={{ filter: (step === 'input_contact_details' || step === 'input_banking_info' || step === 'input_identity_docs') ? 'invert(1) opacity(1.0)' : 'none', transition: 'filter 1s ease-in-out' }}></div>
      <div className="star-layer stars-5" style={{ filter: (step === 'input_contact_details' || step === 'input_banking_info' || step === 'input_identity_docs') ? 'invert(1) opacity(1.0)' : 'none', transition: 'filter 1s ease-in-out' }}></div>
      <div className="star-layer stars-6" style={{ filter: (step === 'input_contact_details' || step === 'input_banking_info' || step === 'input_identity_docs') ? 'invert(1) opacity(1.0)' : 'none', transition: 'filter 1s ease-in-out' }}></div>

      {isUserFetched && (
        <>
        <div className="animate-fade-in-up" style={{ 
          position: 'relative', 
          zIndex: 10, 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: (step === 'input_contact_details' || step === 'input_banking_info' || step === 'input_identity_docs') ? 'flex-start' : 'center',
          textAlign: 'center',
          minHeight: 'calc(100vh - 80px)',
          width: '100%',
          padding: '0'
        }}>
          
          {/* Greeting Block */}
          <div style={{
            position: 'absolute',
            opacity: hideGreeting ? 0 : 1,
            transform: hideGreeting ? 'translateY(-20px) scale(0.95)' : 'translateY(0) scale(1)',
            transition: 'all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)',
            pointerEvents: hideGreeting ? 'none' : 'auto'
          }}>
            <h1 className="mirror-text" style={{ 
              fontSize: '38px', 
              fontWeight: '500', 
              lineHeight: '1.2',
              letterSpacing: '-1px',
              margin: 0,
              whiteSpace: 'nowrap'
            }}>
              Hey,{' '}
              <span className="mirror-text-green" style={{ fontWeight: '700' }}>
                {userName ? userName.split(' ')[0] : '...'}
              </span>
            </h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', marginTop: '12px', fontSize: '13px' }}>
              Let's set up your profile to get you started.
            </p>
          </div>

          {/* Dynamic Question / Input Block */}
        <div style={{
          position: 'absolute',
          opacity: showQuestion ? (isTransitioning ? 0 : 1) : 0,
          transform: showQuestion 
            ? (isTransitioning ? 'translateY(-20px) scale(0.95)' : 'translateY(0) scale(1)') 
            : 'translateY(20px) scale(0.95)',
          transition: 'all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
          pointerEvents: showQuestion && !isTransitioning ? 'auto' : 'none',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
            
            {step === 'ask_name' && (
              <div style={{ animation: 'fade-in-up 0.5s' }}>
                <p style={{ color: 'var(--color-white)', fontSize: '18px', fontWeight: '500', marginBottom: '24px' }}>
                  Do you want to update your user name?
                </p>
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                  <button 
                    className="mirror-btn" 
                    onClick={() => goToStep('input_name')}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: 'rgba(52, 187, 136, 0.15)',
                      color: 'var(--color-green, #34BB88)',
                      border: '1px solid rgba(52, 187, 136, 0.3)',
                      borderRadius: '30px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      fontSize: '13px',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)'
                    }}
                  >
                    Yes, update
                  </button>
                  <button 
                    className="mirror-btn" 
                    onClick={() => goToStep('upload_avatar')}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      color: 'rgba(255, 255, 255, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '30px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      fontSize: '13px',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)'
                    }}
                  >
                    No, it's fine
                  </button>
                </div>
              </div>
            )}

            {step === 'input_name' && (
              <div style={{ animation: 'fade-in-up 0.5s', width: '100%', maxWidth: '300px' }}>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '15px', fontWeight: '400', marginBottom: '32px' }}>
                  What should we call you?
                </p>
                
                <input 
                  type="text" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="minimal-input"
                  style={{
                    width: '240px',
                    display: 'block',
                    margin: '0 auto 40px auto',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: '2px solid rgba(255, 255, 255, 0.2)',
                    color: 'var(--color-white)',
                    fontSize: '24px',
                    fontWeight: '500',
                    padding: '8px 4px',
                    outline: 'none',
                    textAlign: 'center',
                    transition: 'border-color 0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderBottom = '2px solid var(--color-green)'}
                  onBlur={(e) => {
                    if (!newName) e.target.style.borderBottom = '2px solid rgba(255, 255, 255, 0.2)';
                  }}
                />

                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                  <button 
                    onClick={() => goToStep('ask_name')}
                    style={{
                      padding: '10px 24px',
                      backgroundColor: 'transparent',
                      color: 'rgba(255, 255, 255, 0.6)',
                      border: 'none',
                      fontWeight: '500',
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}
                  >
                    Back
                  </button>
                  <button 
                    className="mirror-btn" 
                    onClick={handleUpdateName}
                    disabled={!newName.trim() || isUpdating}
                    style={{
                      padding: '10px 24px',
                      backgroundColor: 'rgba(52, 187, 136, 0.15)',
                      color: 'var(--color-green, #34BB88)',
                      border: '1px solid rgba(52, 187, 136, 0.3)',
                      borderRadius: '30px',
                      fontWeight: '500',
                      cursor: (newName.trim() && !isUpdating) ? 'pointer' : 'not-allowed',
                      fontSize: '13px',
                      opacity: (newName.trim() && !isUpdating) ? 1 : 0.5,
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)'
                    }}
                  >
                    {isUpdating ? 'Updating...' : (originalProfile && newName.trim() === originalProfile.user_name ? 'Next' : 'Update Name')}
                  </button>
                </div>
              </div>
            )}

            {step === 'upload_avatar' && (
              <div style={{ animation: 'fade-in-up 0.5s', width: '100%', maxWidth: '300px' }}>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '15px', fontWeight: '400', marginBottom: '8px' }}>
                  Upload your avatar
                </p>
                <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px', marginBottom: '32px', lineHeight: '1.4' }}>
                  Please ensure the image is passport-sized with a transparent background.
                </p>
                
                <div style={{ position: 'relative', width: '120px', margin: '0 auto 40px auto' }}>
                  <div style={{ position: 'relative', width: '120px', height: '120px', borderRadius: '50%', border: '2px dashed rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    onChange={async (e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        
                        // Check transparency
                        const isTransparent = await checkTransparency(file);
                        if (!isTransparent) {
                          alert('Please upload an image with a transparent background. JPEGs or images with solid backgrounds are not allowed.');
                          e.target.value = ''; // Reset input
                          return;
                        }
                        
                        setAvatarFile(file);
                        setAvatarUrl(file.name);
                        setAvatarPreview(URL.createObjectURL(file));
                      }
                    }}
                    style={{ display: 'none' }}
                  />
                  <label
                    htmlFor="avatar-upload"
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', cursor: 'pointer', backgroundColor: 'rgba(255,255,255,0.05)',
                      backgroundImage: avatarPreview 
                        ? `url(${avatarPreview}), repeating-linear-gradient(45deg, #333333 25%, transparent 25%, transparent 75%, #333333 75%, #333333), repeating-linear-gradient(45deg, #333333 25%, #000000 25%, #000000 75%, #333333 75%, #333333)`
                        : 'none',
                      backgroundSize: avatarPreview ? 'cover, 16px 16px, 16px 16px' : 'cover',
                      backgroundPosition: avatarPreview ? 'center, 0 0, 8px 8px' : 'center',
                      backgroundRepeat: 'no-repeat, repeat, repeat',
                      transform: avatarPreview ? 'scale(1.15)' : 'scale(1)',
                      filter: avatarPreview ? 'grayscale(100%)' : 'none',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {!avatarPreview && (
                      <>
                        <ImageIcon size={24} color="#888" style={{ marginBottom: '8px' }} />
                        <span style={{ fontSize: '12px', color: '#888' }}>Upload</span>
                      </>
                    )}
                  </label>
                </div>
                
                {/* Info button */}
                <button 
                  onClick={() => setShowAvatarInfo(true)}
                  style={{ position: 'absolute', top: 0, right: '-35px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: '4px' }}
                >
                  <Info size={20} />
                </button>
                </div>

                {/* Info Modal */}
                {showAvatarInfo && (
                  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
                    <div style={{ backgroundColor: '#1a1a1a', padding: '24px', borderRadius: '24px', width: '100%', maxWidth: '320px', position: 'relative', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                      
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                        <div style={{ 
                          width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden', 
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          backgroundImage: 'repeating-linear-gradient(45deg, #333333 25%, transparent 25%, transparent 75%, #333333 75%, #333333), repeating-linear-gradient(45deg, #333333 25%, #000000 25%, #000000 75%, #333333 75%, #333333)',
                          backgroundSize: '16px 16px, 16px 16px',
                          backgroundPosition: '0 0, 8px 8px',
                          border: '2px solid rgba(255,255,255,0.1)'
                        }}>
                          <img src="/avatar-demo.png" alt="Demo" style={{ height: '110px', transform: 'translateY(10px)', filter: 'grayscale(100%)' }} />
                        </div>
                      </div>

                      <h3 style={{ color: 'var(--text-color)', marginTop: 0, marginBottom: '16px', fontSize: '15px', fontWeight: '400' }}>Avatar Guidelines</h3>
                      <ul style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', paddingLeft: '16px', marginBottom: '32px', lineHeight: '1.5', fontWeight: '300' }}>
                        <li style={{ marginBottom: '8px' }}>Image must be in <span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '400' }}>PNG format</span> with a transparent background.</li>
                        <li style={{ marginBottom: '8px' }}>Must have a <span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '400' }}>1:1 ratio (Square)</span> shape.</li>
                        <li style={{ marginBottom: '8px' }}>Should <span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '400' }}>not show more than the shoulders</span>.</li>
                        <li>Leave a little <span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '400' }}>space above the head</span>.</li>
                      </ul>
                      
                      <button 
                        onClick={() => setShowAvatarInfo(false)}
                        style={{ width: '100%', padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: '#34BB88', color: 'black', fontWeight: '500', cursor: 'pointer', fontSize: '14px' }}
                      >
                        Got it
                      </button>
                    </div>
                  </div>
                )}
                
                {avatarUrl && !avatarPreview && (
                  <p style={{ color: 'var(--color-green)', fontSize: '12px', marginBottom: '20px' }}>
                    {avatarUrl.length > 20 ? avatarUrl.substring(0, 20) + '...' : avatarUrl}
                  </p>
                )}

                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                  <button 
                    onClick={() => goToStep('ask_name')}
                    style={{
                      padding: '10px 24px',
                      backgroundColor: 'transparent',
                      color: 'rgba(255, 255, 255, 0.6)',
                      border: 'none',
                      fontWeight: '500',
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}
                  >
                    Back
                  </button>
                  <button 
                    className="mirror-btn" 
                    onClick={handleUpdateAvatar}
                    disabled={isUpdating}
                    style={{
                      padding: '10px 24px',
                      backgroundColor: 'rgba(52, 187, 136, 0.15)',
                      color: 'var(--color-green, #34BB88)',
                      border: '1px solid rgba(52, 187, 136, 0.3)',
                      borderRadius: '30px',
                      fontWeight: '500',
                      cursor: !isUpdating ? 'pointer' : 'not-allowed',
                      fontSize: '13px',
                      opacity: !isUpdating ? 1 : 0.5,
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)'
                    }}
                  >
                    {isUpdating ? 'Updating...' : (originalProfile && avatarUrl === (originalProfile.profile_pic_url || '') ? 'Next' : 'Upload')}
                  </button>
                </div>
              </div>
            )}

            {step === 'input_father_name' && (
              <div style={{ animation: 'fade-in-up 0.5s', width: '100%', maxWidth: '300px' }}>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '15px', fontWeight: '400', marginBottom: '32px' }}>
                  What is your Father's name?
                </p>
                
                <input 
                  type="text" 
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  placeholder="e.g. Robert Doe"
                  className="minimal-input"
                  style={{
                    width: '240px',
                    display: 'block',
                    margin: '0 auto 40px auto',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: '2px solid rgba(255, 255, 255, 0.2)',
                    color: 'var(--color-white)',
                    fontSize: '24px',
                    fontWeight: '500',
                    padding: '8px 4px',
                    outline: 'none',
                    textAlign: 'center',
                    transition: 'border-color 0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderBottom = '2px solid var(--color-green)'}
                  onBlur={(e) => {
                    if (!fatherName) e.target.style.borderBottom = '2px solid rgba(255, 255, 255, 0.2)';
                  }}
                />

                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                  <button 
                    onClick={() => goToStep('ask_name')}
                    style={{
                      padding: '10px 24px',
                      backgroundColor: 'transparent',
                      color: 'rgba(255, 255, 255, 0.6)',
                      border: 'none',
                      fontWeight: '500',
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}
                  >
                    Back
                  </button>
                  <button 
                    className="mirror-btn" 
                    onClick={handleUpdateFatherName}
                    disabled={!fatherName.trim() || isUpdating}
                    style={{
                      padding: '10px 24px',
                      backgroundColor: 'rgba(52, 187, 136, 0.15)',
                      color: 'var(--color-green, #34BB88)',
                      border: '1px solid rgba(52, 187, 136, 0.3)',
                      borderRadius: '30px',
                      fontWeight: '500',
                      cursor: (fatherName.trim() && !isUpdating) ? 'pointer' : 'not-allowed',
                      fontSize: '13px',
                      opacity: (fatherName.trim() && !isUpdating) ? 1 : 0.5,
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)'
                    }}
                  >
                    {isUpdating ? 'Updating...' : (originalProfile && fatherName.trim() === originalProfile.father_name ? 'Next' : 'Submit')}
                  </button>
                </div>
              </div>
            )}

            {step === 'input_dob' && (
              <div style={{ animation: 'fade-in-up 0.5s', width: '100%', maxWidth: '350px' }}>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '15px', fontWeight: '400', marginBottom: '32px' }}>
                  When were you born?
                </p>
                
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '16px' }}>
                  <ScrollPicker 
                    items={DAYS} 
                    value={dobDay} 
                    onChange={setDobDay} 
                    width="60px" 
                  />
                  <ScrollPicker 
                    items={MONTHS} 
                    value={dobMonth} 
                    onChange={setDobMonth} 
                    width="80px" 
                  />
                  <ScrollPicker 
                    items={YEARS} 
                    value={dobYear} 
                    onChange={setDobYear} 
                    width="80px" 
                  />
                </div>

                <div style={{ height: '24px', marginBottom: '32px' }}>
                  {calculateAge() !== null && (
                    <p style={{ color: 'var(--color-green)', fontSize: '14px', fontWeight: '500', margin: 0, animation: 'fade-in-up 0.3s' }}>
                      You're {calculateAge()} yrs old
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                  <button 
                    onClick={() => goToStep('input_father_name')}
                    style={{
                      padding: '10px 24px',
                      backgroundColor: 'transparent',
                      color: 'rgba(255, 255, 255, 0.6)',
                      border: 'none',
                      fontWeight: '500',
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}
                  >
                    Back
                  </button>
                  <button 
                    className="mirror-btn" 
                    onClick={handleUpdateDob}
                    disabled={calculateAge() === null || isUpdating}
                    style={{
                      padding: '10px 24px',
                      backgroundColor: 'rgba(52, 187, 136, 0.15)',
                      color: 'var(--color-green, #34BB88)',
                      border: '1px solid rgba(52, 187, 136, 0.3)',
                      borderRadius: '30px',
                      fontWeight: '500',
                      cursor: (calculateAge() !== null && !isUpdating) ? 'pointer' : 'not-allowed',
                      fontSize: '13px',
                      opacity: (calculateAge() !== null && !isUpdating) ? 1 : 0.5,
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)'
                    }}
                  >
                    {isUpdating ? 'Updating...' : (
                      originalProfile && 
                      `${dobYear}-${String(new Date(`${dobMonth} 1`).getMonth() + 1).padStart(2, '0')}-${dobDay.padStart(2, '0')}` === originalProfile.date_of_birth 
                      ? 'Next' : 'Submit'
                    )}
                  </button>
                </div>
              </div>
            )}

            {step === 'input_gender_blood' && (
              <div style={{ animation: 'fade-in-up 0.5s', width: '100%', maxWidth: '350px' }}>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '15px', fontWeight: '400', marginTop: '40px', marginBottom: '32px' }}>
                  Need a few more details about you
                </p>
                
                <div style={{ marginBottom: '32px' }}>
                  <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Gender</p>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    {[
                      {
                        label: 'Male',
                        icon: <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '6px' }}><circle cx="10" cy="14" r="5"/><line x1="13.54" y1="10.46" x2="21" y2="3"/><line x1="16" y1="3" x2="21" y2="3"/><line x1="21" y1="8" x2="21" y2="3"/></svg>
                      },
                      {
                        label: 'Female',
                        icon: <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '6px' }}><circle cx="12" cy="10" r="5"/><line x1="12" y1="15" x2="12" y2="22"/><line x1="9" y1="19" x2="15" y2="19"/></svg>
                      },
                      {
                        label: 'Other',
                        icon: <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '6px' }}><circle cx="12" cy="12" r="5"/><line x1="12" y1="17" x2="12" y2="22"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="15.5" y1="8.5" x2="20" y2="4"/><line x1="16" y1="4" x2="20" y2="4"/><line x1="20" y1="8" x2="20" y2="4"/></svg>
                      }
                    ].map(option => (
                      <button
                        key={option.label}
                        onClick={() => setGender(option.label)}
                        style={{
                          flex: 1,
                          padding: '16px 0',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: gender === option.label ? 'rgba(52, 187, 136, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                          color: gender === option.label ? 'var(--color-green)' : 'rgba(255, 255, 255, 0.6)',
                          border: `1px solid ${gender === option.label ? 'rgba(52, 187, 136, 0.5)' : 'rgba(255, 255, 255, 0.05)'}`,
                          borderRadius: '16px',
                          fontSize: '13px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {option.icon}
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '40px' }}>
                  <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Blood Group</p>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <ScrollPicker 
                      items={BLOOD_GROUPS} 
                      value={bloodGroup} 
                      onChange={setBloodGroup} 
                      width="120px" 
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                  <button 
                    onClick={() => goToStep('input_dob')}
                    style={{
                      padding: '10px 24px',
                      backgroundColor: 'transparent',
                      color: 'rgba(255, 255, 255, 0.6)',
                      border: 'none',
                      fontWeight: '500',
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}
                  >
                    Back
                  </button>
                  <button 
                    className="mirror-btn" 
                    onClick={handleUpdateGenderBlood}
                    disabled={isUpdating}
                    style={{
                      padding: '10px 24px',
                      backgroundColor: 'rgba(52, 187, 136, 0.15)',
                      color: 'var(--color-green, #34BB88)',
                      border: '1px solid rgba(52, 187, 136, 0.3)',
                      borderRadius: '30px',
                      fontWeight: '500',
                      cursor: !isUpdating ? 'pointer' : 'not-allowed',
                      fontSize: '13px',
                      opacity: !isUpdating ? 1 : 0.5,
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)'
                    }}
                  >
                    {isUpdating ? 'Updating...' : (
                      originalProfile && gender === originalProfile.gender && bloodGroup === originalProfile.blood_group
                      ? 'Next' : 'Submit'
                    )}
                  </button>
                </div>
              </div>
            )}

            {step === 'input_contact_details' && (
              <div style={{ animation: 'fade-in-up 0.8s ease-out both', width: '100%' }}>
                <ContactDetailsForm
                  email={email} setEmail={setEmail}
                  phone={phone} setPhone={setPhone}
                  alternateContact={alternateContact} setAlternateContact={setAlternateContact}
                  emergencyContact={emergencyContact} setEmergencyContact={setEmergencyContact}
                  isUpdating={isUpdating} goToStep={goToStep} handleUpdateContact={handleUpdateContact}
                  originalProfile={originalProfile}
                />
              </div>
            )}

            {step === 'input_banking_info' && (
              <div style={{ animation: 'fade-in-up 0.8s ease-out both', width: '100%' }}>
                <BankingInfoForm
                  bankName={bankName} setBankName={setBankName}
                  accountHolderName={accountHolderName} setAccountHolderName={setAccountHolderName}
                  accountNumber={accountNumber} setAccountNumber={setAccountNumber}
                  ifscCode={ifscCode} setIfscCode={setIfscCode}
                  branchCity={branchCity} setBranchCity={setBranchCity}
                  branchState={branchState} setBranchState={setBranchState}
                  branchPincode={branchPincode} setBranchPincode={setBranchPincode}
                  bankPassbookUrl={bankPassbookUrl} setBankPassbookUrl={setBankPassbookUrl}
                  isUpdating={isUpdating} goToStep={goToStep} handleUpdateBanking={handleUpdateBanking}
                  originalProfile={originalProfile}
                />
              </div>
            )}

            {step === 'input_identity_docs' && (
              <div style={{ animation: 'fade-in-up 0.8s ease-out both', width: '100%' }}>
                <IdentityDocsForm
                  primaryAddress={primaryAddress} setPrimaryAddress={setPrimaryAddress}
                  areaPincode={areaPincode} setAreaPincode={setAreaPincode}
                  aadharCardNo={aadharCardNo} setAadharCardNo={setAadharCardNo}
                  aadharFrontUrl={aadharFrontUrl} setAadharFrontUrl={setAadharFrontUrl}
                  aadharBackUrl={aadharBackUrl} setAadharBackUrl={setAadharBackUrl}
                  panCardNo={panCardNo} setPanCardNo={setPanCardNo}
                  panCardUrl={panCardUrl} setPanCardUrl={setPanCardUrl}
                  qualificationMarksheetUrl={qualificationMarksheetUrl} setQualificationMarksheetUrl={setQualificationMarksheetUrl}
                  isUpdating={isUpdating} goToStep={goToStep} handleUpdateIdentity={handleUpdateIdentity}
                  originalProfile={originalProfile}
                />
              </div>
            )}
          </div>
        </div>
        </>
      )}
    </main>
  );
}
