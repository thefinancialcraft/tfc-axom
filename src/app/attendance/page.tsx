import Header from '@/components/Header';

export default function AttendancePage() {
  return (
    <main>
      <Header />
      
      <div className="container" style={{ padding: '20px' }}>
        <h2>Attendance System</h2>
        <p>Mark your attendance here using Selfie or Fingerprint (Options will be added here based on your design).</p>
      </div>
    </main>
  );
}
