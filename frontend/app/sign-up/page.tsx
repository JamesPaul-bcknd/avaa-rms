import AuthPage from '@/components/AuthPage';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

export default function SignUpAliasPage() {
  return (
    <Suspense fallback={null}>
      <AuthPage initialMode="signup" />
    </Suspense>
  );
}
