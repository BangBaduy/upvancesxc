"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, KeyRound, AlertCircle } from "lucide-react";
import AuthSidebar from "@/components/organism/AuthSidebar";
import { createClient } from "@/lib/supabase/client";

function ResetPasswordContent() {
  const router = useRouter();
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  useEffect(() => {
    const handleHashSession = async () => {
      const hash = window.location.hash;
      const supabase = createClient();
      if (!hash || hash.length < 2) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) setSessionReady(true);
        else setSessionError("Link tidak valid. Silakan minta link reset baru.");
        return;
      }
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      if (!accessToken || !refreshToken) { setSessionError("Link tidak valid."); return; }
      const { error: sessionErr } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
      if (sessionErr) { setSessionError("Link kedaluwarsa."); return; }
      window.history.replaceState(null, "", window.location.pathname);
      setSessionReady(true);
    };
    handleHashSession();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => { setForm((prev) => ({ ...prev, [e.target.name]: e.target.value })); setError(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) { setError("Password minimal 8 karakter"); return; }
    if (form.password !== form.confirmPassword) { setError("Password tidak cocok"); return; }
    setIsLoading(true); setError(null);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: form.password }),
      });
      const json = await res.json();
      if (!res.ok || json.error) { setError(json.error || "Gagal mengubah password."); setIsLoading(false); return; }
      setSuccess(true); setTimeout(() => router.push("/login"), 3000);
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
  <div className="absolute inset-0 z-0 pointer-events-none">

            <Image src="/background-auth.png" alt="Background" fill className="object-cover" priority sizes="(max-width: 1024px) 100vw, 60vw" />
          </div>

          <div className="w-full max-w-[450px] bg-white/95 backdrop-blur-2xl border border-white/50 rounded-[25px] p-6 md:p-12 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] relative z-10 flex flex-col items-center">
            {!sessionReady && !sessionError ? (
               <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            ) : sessionError ? (
               <div className="flex flex-col items-center"><AlertCircle className="w-12 h-12 text-red-500 mb-4" /><p className="text-red-600 text-center mb-6">{sessionError}</p><Link href="/forgot-password" className="w-full"><button className="w-full h-[46px] bg-[#2563eb] text-white font-bold rounded-[12px]">Minta Link Baru</button></Link></div>
            ) : (
              <>
                <KeyRound className="w-12 h-12 text-blue-600 mb-5" />
                <h2 className="text-[20px] md:text-[24px] font-bold text-center text-black mb-2">Buat Kata Sandi Baru</h2>
                <p className="text-[12px] md:text-[13px] text-black/60 text-center mb-6 max-w-[280px]">
                  {success ? "Password berhasil diubah!" : "Masukkan kata sandi baru untuk akunmu."}
                </p>

                {success ? (
                  <Link href="/login" className="w-full"><button className="w-full h-[46px] bg-[#2563eb] text-white font-bold rounded-[12px]">Login Sekarang</button></Link>
                ) : (
                  <form onSubmit={handleSubmit} className="w-full max-w-[301px] flex flex-col gap-[15px]" noValidate>
                    {error && <div className="bg-red-50 border border-red-200 rounded-[10px] px-3 py-2"><p className="text-[11px] text-red-600 text-center">{error}</p></div>}
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} name="password" placeholder="Kata Sandi Baru" value={form.password} onChange={handleChange} required disabled={isLoading} className={`${inputClass} pr-10`} />
                      <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                    </div>
                    <div className="relative">
                      <input type={showConfirm ? "text" : "password"} name="confirmPassword" placeholder="Konfirmasi Kata Sandi" value={form.confirmPassword} onChange={handleChange} required disabled={isLoading} className={`${inputClass} pr-10`} />
                      <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full h-[46px] bg-[#2563eb] text-white font-bold rounded-[12px] hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                      {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Menyimpan...</span></> : "Simpan Kata Sandi"}
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return <Suspense fallback={null}><ResetPasswordContent /></Suspense>;
}
