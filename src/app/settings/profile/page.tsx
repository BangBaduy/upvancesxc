"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { uploadImage } from "@/lib/imageUpload";
import {
  User, Camera, Save, Loader2, CheckCircle2, AlertCircle, ArrowLeft,
  Building2, BookOpen, Hash, Phone, Linkedin, Globe, FileText, ChevronRight,
  Upload, X
} from "lucide-react";

type ProfileForm = {
  full_name: string;
  avatar_url: string;
  bio: string;
  phone_number: string;
  linkedin_url: string;
  portfolio_url: string;
  institution: string;
  major: string;
  semester: string;
};

export default function ProfileSettingsPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [form, setForm] = useState<ProfileForm>({
    full_name: "", avatar_url: "", bio: "",
    phone_number: "", linkedin_url: "", portfolio_url: "",
    institution: "", major: "", semester: "",
  });
  const [points, setPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        setEmail(data.user.email ?? "");

        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, avatar_url, bio, phone_number, linkedin_url, portfolio_url, institution, major, semester, points")
          .eq("id", data.user.id)
          .maybeSingle();

        if (profile) {
          setForm({
            full_name: profile.full_name || (data.user.user_metadata?.full_name as string) || "",
            avatar_url: profile.avatar_url || (data.user.user_metadata?.avatar_url as string) || "",
            bio: profile.bio || "",
            phone_number: profile.phone_number || "",
            linkedin_url: profile.linkedin_url || "",
            portfolio_url: profile.portfolio_url || "",
            institution: profile.institution || "",
            major: profile.major || "",
            semester: profile.semester ? String(profile.semester) : "",
          });
          setPoints(profile.points ?? 0);
        }
      }
      // Stop loading regardless of whether user exists
      setIsLoading(false);
    });
  }, [router]);

  const set = (field: keyof ProfileForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [field]: e.target.value }));

  const ensureUrlProtocol = (url: string) => {
    if (!url || !url.trim()) return "";
    const t = url.trim();
    if (t.startsWith("data:image/")) return t;
    if (/^https?:\/\//i.test(t)) return t;
    return `https://${t}`;
  };

  /**
   * Tugas 1: Upload gambar high-performance.
   * - Kompres di browser (max 200KB, format WebP) via browser-image-compression
   * - Upload ke Supabase Storage
   * - Simpan public URL ke form (bukan Base64)
   */
  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi tipe file
    if (!file.type.startsWith("image/")) {
      setStatus({ type: "error", message: "File harus berupa gambar (JPG, PNG, WebP, dll.)" });
      return;
    }

    setIsUploading(true);
    setUploadProgress("Mengompres gambar...");
    setStatus(null);

    const result = await uploadImage(file, "avatars");

    if (result.error) {
      setStatus({ type: "error", message: result.error });
      setIsUploading(false);
      setUploadProgress("");
      return;
    }

    // Simpan URL hasil upload ke form
    setForm(p => ({ ...p, avatar_url: result.url ?? "" }));
    setUploadProgress("");
    setIsUploading(false);
    setStatus({ type: "success", message: "Foto berhasil diupload! Jangan lupa klik 'Simpan Perubahan'." });

    // Reset input file agar bisa upload file yang sama lagi
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

const handleSave = async (e: React.FormEvent) => {
  e.preventDefault();
  if (form.avatar_url?.trim().startsWith("data:image/")) {
    setStatus({ type: "error", message: "URL foto profil tidak boleh menggunakan format base64 (data:image/...)" });
    return;
  }

  setIsSaving(true);
  setStatus(null);
  try {
    const payload = {
      ...form,
      avatar_url: ensureUrlProtocol(form.avatar_url),
      linkedin_url: ensureUrlProtocol(form.linkedin_url),
      portfolio_url: ensureUrlProtocol(form.portfolio_url),
      semester: form.semester ? parseInt(form.semester) : null,
    };

    const res = await fetch("/api/settings/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok || json.error) {
      setStatus({ type: "error", message: json.error || "Gagal menyimpan" });
    } else {
      setStatus({ type: "success", message: "Profil berhasil diperbarui! Mengalihkan..." });

      // ── Tugas 1: Global State Sync ──
      // Refresh sesi Supabase agar user_metadata (avatar_url, full_name) terupdate,
      // lalu panggil router.refresh() agar Next.js cache diinvalidasi dan
      // Header/Navbar langsung menampilkan avatar terbaru tanpa hard reload.
      const supabase = createClient();
      await supabase.auth.refreshSession();
      router.refresh();

      setTimeout(() => {
        router.push("/main");
      }, 1200);
    }
  } catch {
    setStatus({ type: "error", message: "Gagal terhubung ke server" });
  } finally {
    setIsSaving(false);
  }
};

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 className="w-8 h-8 text-[#2563eb] animate-spin" /></div>;
  }

  const displayName = form.full_name || email.split("@")[0] || "Pengguna";

  return (
    <div className="min-h-screen font-['Inter',sans-serif] relative overflow-x-hidden">
      {/* Background Layer */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden bg-[#f8fafc]">
        <div className="absolute inset-0 w-full h-full">
          <Image 
            src="/Background.png" 
            alt="" 
            fill 
            className="object-cover opacity-80 object-top" 
            priority 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-[#f8fafc]/40 to-[#f8fafc]" />
        </div>
      </div>

      <main className="pt-[100px] md:pt-[110px] pb-16 px-4 max-w-[700px] mx-auto relative z-10">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-[#2563eb] font-semibold mb-6 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
        </Link>

        <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden">
          {/* Header gradient with avatar */}
          <div className="bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] px-8 py-8 flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-white/20 border-4 border-white shadow-lg flex items-center justify-center relative">
                {isUploading ? (
                  <div className="flex flex-col items-center justify-center text-white text-center p-2">
                    <Loader2 className="w-6 h-6 animate-spin mb-1" />
                    <span className="text-[9px] font-medium leading-tight">{uploadProgress}</span>
                  </div>
                ) : form.avatar_url ? (
                  <img src={form.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-white" />
                )}
              </div>
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarFileChange}
                disabled={isUploading}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors disabled:opacity-60"
                title="Upload foto profil"
              >
                <Camera className="w-4 h-4 text-[#2563eb]" />
              </button>
            </div>
            <div className="text-center">
              <p className="text-white font-bold text-[18px]">{displayName}</p>
              <p className="text-white/70 text-[13px]">{email}</p>
            </div>
            <div className="flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full">
              <span className="text-yellow-300 text-[14px]">⭐</span>
              <span className="text-white font-bold text-[13px]">{points} Poin</span>
            </div>
          </div>

          <form onSubmit={handleSave} className="px-8 py-8 flex flex-col gap-6">
            {status && (
              <div className={`flex items-center gap-3 px-4 py-3 rounded-lg text-[13px] font-medium ${
                status.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"
              }`}>
                {status.type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                {status.message}
              </div>
            )}

            {/* ─── Identitas ─── */}
            <div>
              <h3 className="text-[13px] font-bold text-gray-400 uppercase tracking-wider mb-3">Identitas</h3>
              <div className="flex flex-col gap-4">
                <Field label="Nama Lengkap" icon={<User className="w-4 h-4" />}>
                  <input type="text" value={form.full_name} onChange={set("full_name")} placeholder="Nama lengkap" className={inputClass} />
                </Field>
                <Field label="Email" icon={<User className="w-4 h-4" />}>
                  <input type="email" value={email} disabled className={`${inputClass} bg-gray-50 text-gray-400 cursor-not-allowed`} />
                </Field>
                {/* Tugas 1: Upload Gambar - tombol upload + input URL manual sebagai fallback */}
                <Field label="Foto Profil" icon={<Camera className="w-4 h-4" />}>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="w-full h-[44px] border-2 border-dashed border-[#2563eb]/40 rounded-[10px] flex items-center justify-center gap-2 text-[14px] text-[#2563eb] font-semibold hover:bg-blue-50 hover:border-[#2563eb] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isUploading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" />{uploadProgress || "Mengupload..."}</>
                      ) : (
                        <><Upload className="w-4 h-4" />Upload Foto</>
                      )}
                    </button>
                    {form.avatar_url && !form.avatar_url.startsWith("data:") && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-[8px]">
                        <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                        <span className="text-[12px] text-green-700 truncate flex-1" title={form.avatar_url}>
                          {form.avatar_url.length > 50 ? form.avatar_url.slice(0, 47) + "..." : form.avatar_url}
                        </span>
                        <button type="button" onClick={() => setForm(p => ({ ...p, avatar_url: "" }))} className="text-gray-400 hover:text-gray-600">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                    <p className="text-[11px] text-gray-400">Atau tempel URL gambar langsung:</p>
                    <input type="url" value={form.avatar_url} onChange={set("avatar_url")} placeholder="https://..." className={inputClass} />
                  </div>
                </Field>
                <Field label="Bio" icon={<FileText className="w-4 h-4" />}>
                  <textarea value={form.bio} onChange={set("bio")} placeholder="Ceritakan tentang dirimu..." rows={3} maxLength={200}
                    className="w-full px-4 py-3 border border-gray-200 rounded-[10px] text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30 focus:border-[#2563eb] transition-all resize-none" />
                </Field>
              </div>
            </div>

            {/* ─── Akademik ─── */}
            <div>
              <h3 className="text-[13px] font-bold text-gray-400 uppercase tracking-wider mb-3">Akademik</h3>
              <div className="flex flex-col gap-4">
                <Field label="Institusi / Perguruan Tinggi" icon={<Building2 className="w-4 h-4" />}>
                  <input type="text" value={form.institution} onChange={set("institution")} placeholder="UIN Syarif Hidayatullah Jakarta" className={inputClass} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Jurusan / Prodi" icon={<BookOpen className="w-4 h-4" />}>
                    <input type="text" value={form.major} onChange={set("major")} placeholder="Teknik Informatika" className={inputClass} />
                  </Field>
                  <Field label="Semester" icon={<Hash className="w-4 h-4" />}>
                    <input type="number" value={form.semester} onChange={set("semester")} placeholder="4" min={1} max={14} className={inputClass} />
                  </Field>
                </div>
              </div>
            </div>

            {/* ─── Kontak & Profesional ─── */}
            <div>
              <h3 className="text-[13px] font-bold text-gray-400 uppercase tracking-wider mb-3">Kontak & Profesional</h3>
              <div className="flex flex-col gap-4">
                <Field label="No. WhatsApp" icon={<Phone className="w-4 h-4" />}>
                  <input type="tel" value={form.phone_number} onChange={set("phone_number")} placeholder="+62 812 xxxx xxxx" className={inputClass} />
                </Field>
                <Field label="LinkedIn URL" icon={<Linkedin className="w-4 h-4" />}>
                  <input type="url" value={form.linkedin_url} onChange={set("linkedin_url")} placeholder="https://linkedin.com/in/username" className={inputClass} />
                </Field>
                <Field label="Portfolio / Website" icon={<Globe className="w-4 h-4" />}>
                  <input type="url" value={form.portfolio_url} onChange={set("portfolio_url")} placeholder="https://portfolioku.com" className={inputClass} />
                </Field>
              </div>
            </div>

            <button type="submit" disabled={isSaving}
              className="w-full h-[44px] bg-[#2563eb] hover:bg-blue-700 text-white font-bold rounded-[10px] flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
              {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : <><Save className="w-4 h-4" /> Simpan Perubahan</>}
            </button>

            <div className="mt-4 pt-6 border-t border-gray-100 flex flex-col items-center">
              <Link href="/onboarding?edit=true" className="text-[14px] font-bold text-[#2563eb] hover:underline flex items-center gap-2">
                Ubah minat & tujuan eksplorasi kamu
                <ChevronRight className="w-4 h-4" />
              </Link>
              <p className="text-[12px] text-gray-500 mt-1">Sesuaikan rekomendasi acara berdasarkan ketertarikanmu.</p>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

const inputClass = "w-full h-[44px] px-4 border border-gray-200 rounded-[10px] text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30 focus:border-[#2563eb] transition-all";

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1.5 text-[13px] font-semibold text-gray-600">
        <span className="text-gray-400">{icon}</span> {label}
      </label>
      {children}
    </div>
  );
}
