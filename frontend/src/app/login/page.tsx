"use client"

import { Zap } from "lucide-react";
import { LoginMinimal } from "@/components/login-minimal";

import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const redirectTo = (provider: 'google' | 'github') => {
    const redirectUri = encodeURIComponent(`http://localhost:3000/auth/callback`);
    const backend = process.env.NEXT_PUBLIC_API_URL;

    window.location.href = `${backend}/auth/${provider}?state=frontend&redirect_uri=${redirectUri}`;
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <Zap className="size-4" />
            </div>
            NOXA
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginMinimal redirectTo={redirectTo} />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center h-screen bg-muted">
        <img
          src="/logo-transparent.png"
          alt="Noxa Logo"
          className="h-64"
        />
      </div>
    </div>
  )
}