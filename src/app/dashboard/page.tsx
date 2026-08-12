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
import TwinklingStars from '@/components/TwinklingStars';

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
    <main className="page-fade-in" style={{ position: 'relative', paddingBottom: '100px', backgroundColor: 'var(--color-bg)' }}>
      <AuthHashCleaner />
      <TwinklingStars density="low" />
      <div className="top-right-pattern"></div>
      <LogoutButton />
      <Greeting />
      <DateBanner />
      <HeroCard />
      <div className="mobile-only">
        <CheckoutSlider />
      </div>
      
      <div className="mobile-only" style={{ marginTop: '32px' }}>
        <AttendanceHeader />
        <CarouselCards cards={row1} />
        <div style={{ marginTop: '-40px' }}> {/* Negative margin to reduce the gap between rows */}
          <CarouselCards cards={row2} />
        </div>
      </div>

      <div className="desktop-only" style={{ marginTop: '32px', padding: '0 24px' }}>
        <AttendanceHeader />
        <CarouselCards cards={[...row1, ...row2]} />
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
