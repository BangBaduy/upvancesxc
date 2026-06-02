"use client";

import React, { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Mail } from "lucide-react";
import AuthSidebar from "@/components/organism/AuthSidebar";

function ForgotPasswordContent() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) { setError("Email tidak valid"); return; }
    setIsLoading(true); setError(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok || json.error) { setError(json.error || "Gagal mengirim email."); setIsLoading(false); return; }
      setSent(true); setIsLoading(false);
    } catch {
      setError("Gagal terhubung ke server."); setIsLoading(false);
    }
  };

  const inputClass = "w-full h-[46px] px-[20px] bg-white rounded-[12px] border border-gray-200 focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10 outline-none text-[14px] text-gray-900 transition-all";

  return (
    <div className="min-h-screen w-full flex bg-[#F8FAFC] overflow-x-hidden font-['Inter',sans-serif]">
      <div className="flex-1 lg:flex-none w-full lg:max-w-full flex min-h-screen relative overflow-hidden">
        <AuthSidebar />

        <div className="flex-1 relative flex flex-col items-center justify-center p-4 md:p-12 overflow-y-auto bg-white min-h-screen">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 z-20">
            <Link href="/">
              <div className="w-[120px] h-[48px] relative">
                <Image src="/Logo.png" alt="Upvance Logo" fill className="object-contain" />
              </div>
            </Link>
          </div>

          <div className="absolute inset-0 z-0 pointer-events-none">
            <Image src="/background-auth.png" alt="Background" fill className="object-cover" priority sizes="(max-width: 1024px) 100vw, 60vw" />
          </div>

          {/* Decorative Shapes */}
          <div className="absolute top-[5%] right-[2%] w-[15vw] max-w-[200px] aspect-square bg-gradient-to-br from-yellow-400/20 to-transparent rounded-full blur-2xl pointer-events-none z-0" />
          <div className="absolute bottom-[5%] right-[2%] w-[18vw] max-w-[250px] aspect-square bg-gradient-to-tr from-blue-400/10 to-transparent rounded-full blur-3xl pointer-events-none z-0" />
          <div className="absolute top-[8%] left-[10%] w-[18vw] max-w-[300px] aspect-square bg-gradient-to-bl from-green-400/10 to-transparent rounded-full blur-3xl pointer-events-none z-0" />

          {/* Card */}
          <div className="w-full max-w-[450px] bg-white/95 backdrop-blur-2xl border border-white/50 rounded-[25px] p-6 md:p-12 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] relative z-10 flex flex-col items-center">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-100 rounded-full flex items-center justify-center mb-5">
              <Mail className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
            </div>

            <h2 className="text-[20px] md:text-[24px] font-bold text-center text-black mb-2">Lupa Kata Sandi?</h2>
            <p className="text-[12px] md:text-[13px] text-black/60 text-center mb-6 max-w-[280px]">
              {sent ? "Cek email kamu untuk link reset password." : "Masukkan email akunmu dan kami akan mengirimkan link reset."}
            </p>

            {sent ? (
              <div className="w-full max-w-[301px] flex flex-col gap-4">
                <div className="bg-green-50 border border-green-200 rounded-[10px] px-4 py-3"><p className="text-[12px] text-green-700 text-center font-semibold">Link terkirim!</p></div>
                <Link href="/login" className="w-full"><button className="w-full h-[46px] bg-[#2563eb] text-white font-bold text-[14px] rounded-[12px] hover:bg-blue-700 transition-all">Kembali ke Login</button></Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="w-full max-w-[301px] flex flex-col gap-[15px]" noValidate>
                {error && <div className="bg-red-50 border border-red-200 rounded-[10px] px-3 py-2"><p className="text-[11px] text-red-600 text-center">{error}</p></div>}
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} className={inputClass} />
                <button type="submit" disabled={isLoading} className="w-full h-[46px] bg-[#2563eb] text-white font-bold text-[14px] rounded-[12px] hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                  {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Mengirim...</span></> : "Kirim Link Reset"}
                </button>
                <div className="text-center"><Link href="/login" className="text-[12px] text-black/60 hover:underline">← Kembali ke Login</Link></div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return <Suspense fallback={null}><ForgotPasswordContent /></Suspense>;
}
