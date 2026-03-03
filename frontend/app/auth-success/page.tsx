'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function AuthSuccessHandler() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        // 1. Get the token from the URL (e.g., ?token=ey...)
        const token = searchParams.get('token');

        if (token) {
            // 2. Store the token in localStorage
            localStorage.setItem('token', token);

            // 3. Redirect to the user dashboard
            router.replace('/user/dashboard');
        } else {
            // If no token, send back to login
            router.replace('/signin');
        }
    }, [searchParams, router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600 font-medium">Authenticating, please wait...</p>
        </div>
    );
}

export default function AuthSuccessPage() {
    return (
        // Suspense is required when using useSearchParams in the App Router
        <Suspense fallback={<div>Loading...</div>}>
            <AuthSuccessHandler />
        </Suspense>
    );
}