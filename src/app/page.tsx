import LogoutButton from '@/components/LogoutButton';
import Greeting from '@/components/Greeting';
import DateBanner from '@/components/DateBanner';
import HeroCard from '@/components/HeroCard';
import CheckoutSlider from '@/components/CheckoutSlider';

export default function Home() {
  return (
    <main style={{ position: 'relative', minHeight: '100vh', width: '100%' }}>
      <LogoutButton />
      <Greeting />
      <DateBanner />
      <HeroCard />
      <CheckoutSlider />
    </main>
  );
}
