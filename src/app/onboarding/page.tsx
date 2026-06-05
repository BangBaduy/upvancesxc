"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  ChevronRight, ChevronLeft, Check, Loader2,
  GraduationCap, Target, User2, Building2, BookOpen, Hash, X,
  Calendar, Bell, ShieldCheck, Sparkles
} from "lucide-react";

// ─── DATA ────────────────────────────────────────────────────────────
const INTERESTS = [
  { label: "Lomba & Kompetisi", value: "Lomba" },
  { label: "Beasiswa",          value: "Beasiswa" },
  { label: "Magang & Karir",    value: "Magang" },
  { label: "Seminar",           value: "Seminar" },
  { label: "Workshop",          value: "Workshop" },
  { label: "Webinar",           value: "Webinar" },
  { label: "Volunteer",         value: "Volunteer" },
  { label: "Lingkungan",        value: "Greenvity" },
  { label: "Startup & Bisnis",  value: "Startup" },
  { label: "Teknologi & IT",    value: "Teknologi" },
  { label: "Desain & Kreatif",  value: "Desain" },
  { label: "Sains & Riset",     value: "Sains" },
  { label: "Hukum & Sosial",    value: "Hukum" },
  { label: "Kesehatan",         value: "Kesehatan" },
  { label: "Public Speaking",   value: "PublicSpeaking" },
  { label: "Data & AI",         value: "DataAI" },
];

const GOALS = [
  { label: "Tambah Portofolio",  value: "Tambah Portofolio" },
  { label: "Cari Beasiswa",      value: "Cari Beasiswa" },
  { label: "Networking",         value: "Networking" },
  { label: "Pengalaman Kerja",   value: "Pengalaman Kerja" },
  { label: "Kembangkan Skill",   value: "Kembangkan Skill" },
  { label: "Kontribusi Sosial",  value: "Kontribusi Sosial" },
  { label: "Mulai Bisnis",       value: "Mulai Bisnis" },
  { label: "Persiapan Karir",    value: "Persiapan Karir" },
  { label: "Cari Rekan Tim",     value: "Cari Rekan Tim" },
  { label: "Menang Lomba",       value: "Menang Lomba" },
];

const STEPS = ["Profil", "Minat", "Tujuan"];

// ─── COMPONENTS ──────────────────────────────────────────────────
function FeatureItem({
  icon,
  title,
  description,
  active,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  active: boolean;
}) {
  return (
    <div className={`flex gap-[15px] items-center transition-all duration-300 ${active ? "opacity-100 translate-x-2" : "opacity-40"}`}>
      <div className={`shrink-0 flex items-center justify-center w-10 h-10 rounded-xl transition-all ${active ? "bg-white text-[#2563eb]" : "bg-white/10 text-white"}`}>
        {icon}
      </div>
      <div className="flex flex-col">
        <h3 className="font-bold text-[18px] text-white leading-tight drop-shadow-[0px_4px_4px_rgba(0,0,0,0.25)]">
          {title}
        </h3>
        <p className="text-[13px] font-normal text-white opacity-90 leading-snug max-w-[250px]">
          {description}
        </p>
      </div>
    </div>
  );
}

function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative px-4 py-2 rounded-[10px] text-[13px] font-semibold border-2 transition-all duration-150 ${
        selected
          ? "bg-[#2563eb] text-white border-[#2563eb] shadow-[0_2px_10px_rgba(37,99,235,0.3)]"
          : "bg-white text-[#374151] border-gray-200 hover:border-[#2563eb] hover:text-[#2563eb]"
      }`}
    >
      {selected && (
        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
          <Check className="w-2.5 h-2.5 text-white" />
        </span>
      )}
      {label}
    </button>
  );
}

// ─── MAIN PAGE ───────────────────────────────────────────────────────
function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get("edit") === "true";
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const [form, setForm] = useState({
    full_name: "",
    institution: "",
    major: "",
    semester: "",
    bio: "",
    interests: [] as string[],
    goals: [] as string[],
    account_type: "regular_user",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        const name = (data.user.user_metadata?.full_name as string) || "";
        setForm((f) => ({ ...f, full_name: name }));

        const { data: profile } = await supabase
          .from("profiles")
          .select("has_completed_onboarding, interests, goals, institution, major, semester, bio")
          .eq("id", data.user.id)
          .maybeSingle();

        if (profile?.has_completed_onboarding && !isEditMode) {
          router.replace("/main");
          return;
        }

        if (profile) {
          setForm((f) => ({
            ...f,
            institution: profile.institution || "",
            major: profile.major || "",
            semester: profile.semester ? String(profile.semester) : "",
            bio: profile.bio || "",
            interests: profile.interests || [],
            goals: profile.goals || [],
          }));
        }
      }

      setIsChecking(false);
    });
  }, [router, isEditMode]);

  const toggleItem = (field: "interests" | "goals", value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: "" }));
  };

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (step === 1 && !form.full_name.trim()) newErrors.full_name = "Nama tidak boleh kosong";
    if (step === 2 && form.interests.length === 0) newErrors.interests = "Pilih minimal 1 minat";
    if (step === 3 && form.goals.length === 0) newErrors.goals = "Pilih minimal 1 tujuan";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => { if (!validateStep()) return; if (step < STEPS.length) setStep((s) => s + 1); };

  const handleFinish = async () => {
    if (!validateStep()) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) { alert(json.error || "Gagal menyimpan"); setIsSaving(false); return; }
      router.replace("/main");
    } catch { alert("Gagal terhubung ke server"); setIsSaving(false); }
  };

  const handleSkip = async () => {
    setIsSaving(true);
    try {
      await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          interests: form.interests.length > 0 ? form.interests : ["Lainnya"],
          goals: form.goals.length > 0 ? form.goals : ["Persiapan Karir"],
        }),
      });
    } catch {}
    router.replace("/main");
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#2563eb] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-['Inter',sans-serif]">
      {/* Left panel (Auth Style) */}
      <div className="hidden lg:flex lg:w-[450px] xl:w-[529px] relative flex-col bg-gradient-to-b from-[#2563eb] from-[20.673%] to-[#14cb72] p-8 xl:p-[50px] text-white overflow-hidden shrink-0 min-h-screen">
        {/* Logo Section */}
        <div className="flex items-center justify-center lg:justify-start mb-12 xl:mb-[60px] relative z-10">
          <div className="w-[150px] h-[60px] relative">
            <Image
              src="/Logo_BW.png"
              alt="Upvance Logo"
              fill
              className="object-contain"
            />
          </div>
        </div>

        {/* Hero Text */}
        <div className="mb-12 xl:mb-[60px] relative z-10">
          <h1 className="text-[32px] font-bold leading-[44px] drop-shadow-[0px_4px_4px_rgba(0,0,0,0.25)]">
            Lengkapi Profil Untuk{" "}
            <span className="text-[#fbc02d]">Pengalaman Terbaik</span>
          </h1>
        </div>

        {/* Steps List */}
        <div className="space-y-[40px] relative z-10">
          <FeatureItem
            icon={<User2 className="w-6 h-6" />}
            title="Profil Dasar"
            description="Bantu kami mengenal kamu lebih dekat melalui info akademik"
            active={step === 1}
          />
          <FeatureItem
            icon={<Sparkles className="w-6 h-6" />}
            title="Topik Minat"
            description="Pilih kategori acara yang ingin kamu ikuti setiap hari"
            active={step === 2}
          />
          <FeatureItem
            icon={<Target className="w-6 h-6" />}
            title="Tujuan Personal"
            description="Tentukan apa yang ingin kamu capai bersama Upvance"
            active={step === 3}
          />
        </div>

        {/* Decorative background blur */}
        <div className="absolute top-[-50px] left-[-50px] w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <p className="text-white/40 text-[12px] mt-auto relative z-10">
          © 2024 Upvance. Membangun masa depan mahasiswa Indonesia.
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col relative">
        {/* Background Image (Same as Auth) */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <Image 
            src="/background-auth.png" 
            alt="" 
            fill 
            className="object-cover opacity-80" 
            priority 
          />
          <div className="absolute inset-0 bg-[#f8fafc]/40" />
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center px-4 md:px-6 py-10 overflow-y-auto relative z-10">
          <div className="w-full max-w-[550px] bg-white rounded-[32px] border border-gray-100 p-6 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
            {/* Mobile bar */}
            <div className="lg:hidden flex items-center justify-between mb-8">
              <Image src="/Logo.png" alt="Upvance" width={100} height={35} className="object-contain" />
              <button onClick={handleSkip} className="text-[13px] text-[#2563eb] font-bold">Lewati</button>
            </div>

            {/* Step header */}
            <div className="mb-8 relative">
              {/* Desktop skip button */}
              <button onClick={handleSkip} className="hidden lg:flex absolute -top-4 -right-4 items-center gap-1 text-[13px] text-gray-400 hover:text-[#2563eb] transition-colors p-2">
                Lewati <X className="w-3.5 h-3.5" />
              </button>
              
              <p className="text-[13px] text-[#2563eb] font-bold mb-1 uppercase tracking-wider">Langkah {step} dari 3</p>
              <h1 className="text-[28px] font-bold text-[#161616]">
                {step === 1 ? "Halo! Kenalan dulu" :
                 step === 2 ? "Apa minat kamu?" :
                 "Apa tujuan kamu?"}
              </h1>
              <p className="text-[15px] text-[#6c6c6c] mt-2 font-medium">
                {step === 1 ? "Lengkapi profil dasar kamu untuk pengalaman yang lebih personal." :
                 step === 2 ? "Pilih topik yang kamu minati — kami akan rekomendasikan acara yang relevan." :
                 "Pilih tujuan kamu agar kami bisa bantu mencapainya."}
              </p>
            </div>

            {/* ─── STEP 1 ─── */}
            {step === 1 && (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Nama Lengkap *</label>
                  <div className="relative">
                    <User2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={form.full_name}
                      onChange={(e) => { setForm((f) => ({ ...f, full_name: e.target.value })); setErrors((e2) => ({ ...e2, full_name: "" })); }}
                      placeholder="Nama lengkap kamu"
                      className="w-full h-[46px] pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-[12px] text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-[#2563eb]/10 focus:border-[#2563eb] focus:bg-white transition-all shadow-sm"
                    />
                  </div>
                  {errors.full_name && <p className="text-red-500 text-[12px] mt-1">{errors.full_name}</p>}
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Perguruan Tinggi / Institusi</label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={form.institution}
                      onChange={(e) => setForm((f) => ({ ...f, institution: e.target.value }))}
                      placeholder="Cth: UIN Jakarta"
                      className="w-full h-[46px] pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-[12px] text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-[#2563eb]/10 focus:border-[#2563eb] focus:bg-white transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Jurusan / Prodi</label>
                    <div className="relative">
                      <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={form.major}
                        onChange={(e) => setForm((f) => ({ ...f, major: e.target.value }))}
                        placeholder="Cth: Teknik Informatika"
                        className="w-full h-[46px] pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-[12px] text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-[#2563eb]/10 focus:border-[#2563eb] focus:bg-white transition-all shadow-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Semester</label>
                    <div className="relative">
                      <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        value={form.semester}
                        onChange={(e) => setForm((f) => ({ ...f, semester: e.target.value }))}
                        placeholder="Cth: 4"
                        min={1} max={14}
                        className="w-full h-[46px] pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-[12px] text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-[#2563eb]/10 focus:border-[#2563eb] focus:bg-white transition-all shadow-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ─── STEP 2 ─── */}
            {step === 2 && (
              <div className="flex flex-col gap-4">
                {errors.interests && (
                  <div className="px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-[13px]">
                    {errors.interests}
                  </div>
                )}
                <p className="text-[13px] text-gray-500">
                  Dipilih: <span className="text-[#2563eb] font-bold">{form.interests.length}</span> minat
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {INTERESTS.map((item) => (
                    <Chip key={item.value} label={item.label} selected={form.interests.includes(item.value)} onClick={() => toggleItem("interests", item.value)} />
                  ))}
                </div>
              </div>
            )}

            {/* ─── STEP 3 ─── */}
            {step === 3 && (
              <div className="flex flex-col gap-4">
                {errors.goals && (
                  <div className="px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-[13px]">
                    {errors.goals}
                  </div>
                )}
                <p className="text-[13px] text-gray-500">
                  Dipilih: <span className="text-[#2563eb] font-bold">{form.goals.length}</span> tujuan
                </p>
                <div className="flex flex-wrap gap-2.5 mb-4">
                  {GOALS.map((item) => (
                    <Chip key={item.value} label={item.label} selected={form.goals.includes(item.value)} onClick={() => toggleItem("goals", item.value)} />
                  ))}
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Bio Singkat (opsional)</label>
                  <textarea
                    value={form.bio}
                    onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                    placeholder="Ceritakan sedikit tentang dirimu..."
                    rows={3}
                    maxLength={200}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-[12px] text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-[#2563eb]/10 focus:border-[#2563eb] focus:bg-white transition-all resize-none shadow-sm"
                  />
                  <p className="text-gray-400 text-[11px] text-right mt-1">{form.bio.length}/200</p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
              {step > 1 ? (
                <button
                  onClick={() => setStep((s) => s - 1)}
                  className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 text-gray-600 rounded-[10px] font-semibold text-[14px] hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Kembali
                </button>
              ) : <div />}

              {step < STEPS.length ? (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-8 py-2.5 bg-[#2563eb] hover:bg-blue-700 text-white font-bold text-[14px] rounded-[10px] transition-colors shadow-[0_4px_12px_rgba(37,99,235,0.3)]"
                >
                  Selanjutnya <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleFinish}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-8 py-2.5 bg-[#2563eb] hover:bg-blue-700 text-white font-bold text-[14px] rounded-[10px] transition-colors shadow-[0_4px_12px_rgba(37,99,235,0.3)] disabled:opacity-60"
                >
                  {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : <>Mulai Eksplorasi <ChevronRight className="w-4 h-4" /></>}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={null}>
      <OnboardingContent />
    </Suspense>
  );
}
