'use client';

export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import AuthPage from '@/components/AuthPage';

export default function SignUpPage() {
    return (
        <Suspense fallback={null}>
            <AuthPage initialMode="signup" />
        </Suspense>
    );
}
