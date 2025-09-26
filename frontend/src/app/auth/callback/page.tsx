"use client"

import { useEffect } from "react";

export default function CallbackPage() {
  const backend = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${backend}/auth/session`, { credentials: 'include' });
        
        if (res.ok)
          window.location.href = '/dashboard';
        else
          window.location.href = '/login'
      } catch (err) {
        console.log('Session check error', err);
        window.location.href = '/login';
      }
    })();
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '120px'}}>
      <p>Finishing sign-in ...</p>
    </div>
  )
} 