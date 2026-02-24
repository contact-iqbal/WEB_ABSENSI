'use client'

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
export default function Home() {
  const [authResult, setAuthResult] = useState<any>(null);
  useEffect(() => {
    checkAuth();
  }, []);
  const router = useRouter();
  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const result = await response.json();

      if (result.success) {
        if (result.accountAccess == "owner") {
          router.push('/admin');
        } else {
          router.push('/pegawai');
        }
        setAuthResult(result);

      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/login');
    }
  };
}
