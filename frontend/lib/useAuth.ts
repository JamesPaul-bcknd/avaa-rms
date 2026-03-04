'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

export function useAuth(options?: { redirect?: boolean }) {
    const shouldRedirect = options?.redirect !== false;
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    const setUserState = (nextUser: any, broadcast = false) => {
        setUser(nextUser);
        setIsAuthenticated(!!nextUser);
        if (broadcast && typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('auth:user-updated', { detail: nextUser }));
        }
    };

    useEffect(() => {
        let cancelled = false;

        const checkAuth = async () => {
            const token = localStorage.getItem('token');

            if (!token) {
                if (!cancelled) {
                    setIsLoading(false);
                    if (shouldRedirect) router.replace('/signin');
                }
                return;
            }

            try {
                const response = await api.post('/auth/me');
                if (!cancelled) {
                    setUserState(response.data, true);
                    setIsLoading(false);
                }
            } catch (err) {
                console.error('Auth check failed:', err);
                if (!cancelled) {
                    localStorage.removeItem('token');
                    setIsLoading(false);
                    if (shouldRedirect) router.replace('/signin');
                }
            }
        };

        checkAuth();

        const handleUserUpdated = (event: Event) => {
            const detail = (event as CustomEvent).detail;
            setUser(detail);
            setIsAuthenticated(!!detail);
        };

        window.addEventListener('auth:user-updated', handleUserUpdated as EventListener);

        return () => {
            cancelled = true;
            window.removeEventListener('auth:user-updated', handleUserUpdated as EventListener);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const refreshUser = async () => {
        const response = await api.post('/auth/me');
        setUserState(response.data, true);
        return response.data;
    };

    const logout = async (redirectPath: string = '/signin') => {
        try {
            await api.post('/auth/logout');
        } catch {
            // Ignore errors during logout
        } finally {
            localStorage.removeItem('token');
            setUserState(null, true);
            router.replace('/signin');
        }
    };

    return { isAuthenticated, isLoading, user, logout, refreshUser, setUser: (nextUser: any) => setUserState(nextUser, true) };
}
