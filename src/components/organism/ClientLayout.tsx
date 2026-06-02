"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Daftar halaman yang tidak menggunakan Header utama
  const hideHeader = 
    pathname.startsWith("/login") || 
    pathname.startsWith("/register") || 
    pathname.startsWith("/admin") || 
    pathname.startsWith("/onboarding") || 
    pathname.startsWith("/forgot-password") || 
    pathname.startsWith("/verify-otp") || 
    pathname.startsWith("/reset-password");

  return (
    <>
      {!hideHeader && <Header />}
      {children}
    </>
  );
}
