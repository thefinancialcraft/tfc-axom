import LogoutButton from '@/components/LogoutButton';
import Greeting from '@/components/Greeting';
import DateBanner from '@/components/DateBanner';
import HeroCard from '@/components/HeroCard';
import CheckoutSlider from '@/components/CheckoutSlider';
import CarouselCards from '@/components/CarouselCards';
import AttendanceHeader from '@/components/AttendanceHeader';
import ActivitySection from '@/components/ActivitySection';
import SummarySection from '@/components/SummarySection';
import CalendarSection from '@/components/CalendarSection';
import AllRecordsSection from '@/components/AllRecordsSection';
import Footer from '@/components/Footer';
import AuthHashCleaner from '@/components/AuthHashCleaner';

export default function Home() {
  const row1 = [
    { title: 'Check-in', image: '/chkin.png', time: '12:00', status: 'ON TIME' },
    { title: 'Check-out', image: '/chkout.png', time: '18:00', status: 'ON TIME' }
  ];

  const row2 = [
    { title: 'Break Time', image: '/brktime.png', message: 'Coming soon', flipImage: true, marginLeft: '-60px' },
    { title: 'Status', image: '/fnlst.png', message: 'On time', scale: 1.3, marginTop: '30px' }
  ];

  return (
    <main style={{ position: 'relative', overflowX: 'hidden', paddingBottom: '100px', backgroundColor: 'var(--color-bg)' }}>
      <AuthHashCleaner />
      <div className="top-right-pattern"></div>
      <LogoutButton />
      <Greeting />
      <DateBanner />
      <HeroCard />
      <CheckoutSlider />
      
      <div style={{ marginTop: '32px' }}>
        <AttendanceHeader />

        <CarouselCards cards={row1} />
        <div style={{ marginTop: '-40px' }}> {/* Negative margin to reduce the gap between rows */}
          <CarouselCards cards={row2} />
        </div>
      </div>
      
      <ActivitySection />
      <SummarySection />
      <CalendarSection />
      <AllRecordsSection />
      <Footer />
      <div className="bottom-left-pattern"></div>
    </main>
  );
}
