"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  ChevronRight, ChevronLeft, Check, Loader2,
  GraduationCap, Target, User2, Building2, BookOpen, Hash, X
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

// ─── CHIP COMPONENT ──────────────────────────────────────────────────
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
          router.replace("/dashboard");
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
  }, [router]);

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
      router.replace("/dashboard");
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
    router.replace("/dashboard");
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#2563eb] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex font-['Inter',sans-serif]">
      {/* Left panel */}
      <div className="hidden lg:flex w-[380px] shrink-0 bg-[#2563eb] flex-col items-center justify-center px-10 py-12 gap-8">
        <Image src="/Logo.png" alt="Upvance" width={120} height={40} className="object-contain brightness-200" />
        <div className="flex flex-col gap-6 w-full">
          {STEPS.map((s, i) => (
            <div key={s} className={`flex items-center gap-4 transition-all ${i + 1 === step ? "opacity-100" : "opacity-40"}`}>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-bold text-[14px] ${
                i + 1 < step ? "bg-green-400 text-white" :
                i + 1 === step ? "bg-white text-[#2563eb]" :
                "bg-white/20 text-white"
              }`}>
                {i + 1 < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <div>
                <p className={`font-bold text-[15px] ${i + 1 === step ? "text-white" : "text-white/60"}`}>{s}</p>
                <p className="text-white/40 text-[12px]">
                  {i === 0 ? "Info dasar & akademik" : i === 1 ? "Topik yang kamu minati" : "Tujuan di Upvance"}
                </p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-white/30 text-[12px] text-center mt-auto">
          Data kamu aman dan tidak dibagikan tanpa izin.
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col relative">
        {/* Background Image */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Image 
            src="/background-auth.png" 
            alt="" 
            fill 
            className="object-cover opacity-60" 
            priority 
          />
        </div>

        {/* Top bar */}
        <div className="flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-sm border-b border-gray-100 relative z-10">
          {/* Mobile logo */}
          <Image src="/Logo.png" alt="Upvance" width={90} height={30} className="object-contain lg:invisible" />
          {/* Progress mobile */}
          <div className="lg:hidden flex items-center gap-2">
            {STEPS.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all ${i + 1 <= step ? "bg-[#2563eb] w-8" : "bg-gray-200 w-4"}`} />
            ))}
          </div>
          <button onClick={handleSkip} className="text-[13px] text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors">
            Lewati <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-start justify-center px-4 md:px-6 py-10 overflow-y-auto relative z-10">
          <div className="w-full max-w-[550px] bg-white/90 backdrop-blur-md rounded-[32px] border border-white/50 p-6 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
            {/* Step header */}
            <div className="mb-8">
              <p className="text-[13px] text-[#2563eb] font-semibold mb-1">Langkah {step} dari {STEPS.length}</p>
              <h1 className="text-[28px] font-bold text-[#161616]">
                {step === 1 ? "Halo! Kenalan dulu" :
                 step === 2 ? "Apa minat kamu?" :
                 "Apa tujuan kamu?"}
              </h1>
              <p className="text-[14px] text-gray-500 mt-1">
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
