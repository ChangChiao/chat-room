'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';

function CallbackContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((state) => state.login);

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      setStatus('error');
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
      return;
    }

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const user = {
          id: payload.sub,
          email: payload.email,
          name: payload.name,
          avatar: payload.avatar,
          isGoogleUser: true,
          createdAt: new Date().toISOString(),
        };
        
        login(user, token);
        setStatus('success');
        router.push('/chat');
      } catch {
        setStatus('error');
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      }
    } else {
      setStatus('error');
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    }
  }, [searchParams, router, login]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        {status === 'loading' && (
          <div>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Processing Google login...</p>
          </div>
        )}
        
        {status === 'success' && (
          <div>
            <div className="text-green-600 text-5xl mb-4">✓</div>
            <p className="text-gray-600">Login successful! Redirecting...</p>
          </div>
        )}
        
        {status === 'error' && (
          <div>
            <div className="text-red-600 text-5xl mb-4">✗</div>
            <p className="text-gray-600">Login failed. Redirecting to login page...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}