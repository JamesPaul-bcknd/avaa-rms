'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'recruiter' | 'user';
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole, 
  redirectTo = '/signin' 
}: ProtectedRouteProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push(redirectTo);
        return;
      }

      try {
        const response = await api.post('/auth/me');
        const user = response.data;
        
        // Check if user has required role
        if (requiredRole && user.role !== requiredRole) {
          // Redirect based on user's actual role
          if (user.role === 'admin') {
            router.replace('/admin/dashboard');
          } else if (user.role === 'recruiter') {
            router.replace('/hr/dashboard');
          } else {
            router.replace('/user/dashboard');
          }
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
        router.push(redirectTo);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, requiredRole, redirectTo]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f1f5f9]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7EB0AB]"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Will redirect in the useEffect
  }

  return <>{children}</>;
}
