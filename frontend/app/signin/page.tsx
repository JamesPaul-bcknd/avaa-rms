'use client';

export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import AuthPage from '@/components/AuthPage';

export default function SignInPage() {
    return (
        <Suspense fallback={null}>
            <AuthPage initialMode="signin" />
        </Suspense>
    );
}
