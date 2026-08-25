import { redirect } from 'next/navigation';

export default function LegacyAttendanceRecordsPage() {
  redirect('/attendance/records');
}
