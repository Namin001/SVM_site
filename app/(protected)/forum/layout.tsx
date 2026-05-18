import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function ForumLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  return <>{children}</>;
}
