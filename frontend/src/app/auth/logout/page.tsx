"use client"

import { useEffect } from "react";

const backend = process.env.NEXT_PUBLIC_API_URL;

export default function LogoutPage() {
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${backend}/auth/logout`, { credentials: 'include' });
        console.log(res);
        if (res.ok)
          window.location.href = '/login';
      } catch (err) {
        console.log(`Logout failed: ${err}`)
      }
    })();
  }, [])

  return (
    <div>Logout</div>
  )
}