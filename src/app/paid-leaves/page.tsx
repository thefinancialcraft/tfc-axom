import { redirect } from 'next/navigation';

export default function LegacyPaidLeavesPage() {
  redirect('/attendance/paid-leaves');
}
