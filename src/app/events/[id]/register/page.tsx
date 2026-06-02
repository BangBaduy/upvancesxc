"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Footer from "@/components/organism/Footer";
import { createClient } from "@/lib/supabase/client";
import { 
  Loader2, 
  ChevronLeft, 
  CheckCircle2, 
  AlertCircle,
  Calendar,
  MapPin,
  CircleDollarSign,
  User,
  Mail,
  Phone,
  FileText,
  QrCode
} from "lucide-react";
import type { Database } from "@/types";

type EventRow = Database["public"]["Tables"]["events"]["Row"];

export default function EventRegistrationPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [event, setEvent] = useState<EventRow | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states (pre-filled from profile)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    institution: "",
    reason: ""
  });

  const [isProfileComplete, setIsProfileComplete] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const supabase = createClient();
      
      try {
        // 1. Fetch Event
        const eventRes = await fetch(`/api/events/${id}`);
        const eventJson = await eventRes.json();
        
        if (!eventRes.ok || eventJson.error) {
          setError(eventJson.error || "Event tidak ditemukan");
          setIsLoading(false);
          return;
        }
        setEvent(eventJson.data);

        // 2. Fetch User Profile
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
          if (prof) {
            setProfile(prof);
            
            // Define required fields for registration
            const requiredFields = [
              prof.full_name,
              user.email,
              prof.phone_number,
              prof.institution,
              prof.major,
              prof.avatar_url,
              prof.linkedin_url,
              prof.portfolio_url
            ];
            
            const isComplete = requiredFields.every(field => !!field);
            setIsProfileComplete(isComplete);

            setFormData(prev => ({
              ...prev,
              fullName: prof.full_name || "",
              email: user.email || "",
              phoneNumber: prof.phone_number || "",
              institution: prof.institution || ""
            }));
          }
        } else {
           // No user - must login
           router.push(`/login?next=${encodeURIComponent(`/events/${id}/register`)}`);
           return;
        }
      } catch (err) {
        setError("Gagal memuat data.");
      } finally {
        setIsLoading(false);
      }
    }

    if (id) fetchData();
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isProfileComplete || !event) return;
    setIsSaving(true);
    
    try {
      const res = await fetch('/api/events/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: event.id })
      });
      if (res.ok) {
        setIsSuccess(true);
      } else {
        const json = await res.json().catch(()=>({}));
        setError(json.error || "Gagal mencatat pendaftaran.");
      }
    } catch {
      setError("Gagal terhubung ke server.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen pt-[100px] flex items-center justify-center relative">
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
        <Loader2 className="w-10 h-10 text-[#2563eb] animate-spin" />
      </main>
    );
  }

  // Handle Incomplete Profile State is now a Modal at the bottom
  
  if (error || !event) {
    return (
      <main className="min-h-screen pt-[100px] flex flex-col items-center justify-center px-4 relative">
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
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h1 className="text-xl font-bold text-gray-800 mb-4">{error || "Terjadi kesalahan"}</h1>
        <Link href="/dashboard" className="px-6 py-2 bg-[#2563eb] text-white rounded-lg font-bold">
          Kembali ke Beranda
        </Link>
      </main>
    );
  }

  if (isSuccess) {
    return (
      <main className="min-h-screen pt-[100px] flex flex-col items-center justify-center px-4 text-center relative">
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
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-[28px] font-bold text-gray-900 mb-2">Pendaftaran Berhasil!</h1>
        <p className="text-gray-600 max-w-[400px] mb-8">
          Kamu telah terdaftar untuk mengikuti <strong>{event.title}</strong>. 
          Detail acara dan informasi selanjutnya akan dikirimkan melalui email kamu.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-[400px]">
          <Link href={`/events/${id}`} className="flex-1 px-6 py-3 border border-[#2563eb] text-[#2563eb] rounded-xl font-bold hover:bg-blue-50 transition-all">
            Detail Acara
          </Link>
          <Link href="/main" className="flex-1 px-6 py-3 bg-[#2563eb] text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md">
            Ke Dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen font-['Inter',sans-serif] bg-[#f8fafc] relative overflow-x-hidden">
      
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

      <main className="pt-[100px] md:pt-[120px] pb-20 px-4 md:px-10 max-w-[1000px] mx-auto relative z-10">
        <Link href={`/events/${id}`} className="inline-flex items-center gap-2 text-[#2563eb] font-bold mb-8 hover:underline">
          <ChevronLeft className="w-5 h-5" />
          Kembali ke Detail Acara
        </Link>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Form Side */}
          <div className="flex-1 flex flex-col gap-6 order-2 lg:order-1">
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
              <h1 className="text-[24px] font-bold text-gray-900 mb-2">Formulir Pendaftaran</h1>
              <p className="text-gray-500 mb-8 text-[14px]">Mohon lengkapi data berikut untuk mendaftar acara.</p>
              
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
                  <p className="text-[13px] text-[#2563eb] leading-relaxed text-center font-medium">
                    Silakan isi formulir pendaftaran dari penyelenggara di bawah ini. Setelah selesai, pastikan Anda menekan tombol <strong>&quot;Saya sudah mengisi form&quot;</strong> agar pendaftaran tercatat di sistem kami.
                  </p>
                </div>


                {/* Iframe for external form */}
                <div className="w-full h-[600px] border border-gray-200 rounded-2xl overflow-hidden bg-gray-50 relative">
                  {!event.event_url ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                      <AlertCircle className="w-8 h-8 mb-2" />
                      <p>Link formulir tidak tersedia</p>
                    </div>
                  ) : (
                    <iframe 
                      src={event.event_url} 
                      className="w-full h-full"
                      title="Form Pendaftaran"
                      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                    />
                  )}
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting || !event.event_url}
                  className="mt-6 w-full h-[56px] bg-gradient-to-r from-[#2563eb] via-[#16c475] to-[#2563eb] bg-[length:200%_auto] text-white font-bold rounded-2xl hover:bg-right transition-all duration-500 shadow-lg shadow-blue-100 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    "Saya Sudah Mengisi Form"
                  )}
                </button>
                <p className="text-[11px] text-gray-400 text-center mt-2">
                  Dengan menekan tombol di atas, Anda mengonfirmasi bahwa Anda telah benar-benar mengisi formulir penyelenggara.
                </p>
              </form>
            </div>
          </div>

          {/* Event Preview Side */}
          <div className="w-full lg:w-[320px] flex flex-col gap-6 order-1 lg:order-2">
            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 sticky top-[100px]">
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6 bg-gray-50">
                <img 
                  src={event.image_url || "/Logo.png"} 
                  alt={event.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-[18px] font-bold text-gray-900 mb-4 line-clamp-2">{event.title}</h2>
              
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar className="w-5 h-5 text-[#2563eb]" />
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-gray-400 uppercase">Waktu</span>
                    <span className="text-[13px] font-medium">
                      {event.start_date ? new Date(event.start_date).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' }) : "Segera hadir"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <MapPin className="w-5 h-5 text-[#2563eb]" />
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-gray-400 uppercase">Lokasi</span>
                    <span className="text-[13px] font-medium">
                      {event.is_online ? "Online" : (event.location || "Indonesia")}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <CircleDollarSign className="w-5 h-5 text-[#2563eb]" />
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-gray-400 uppercase">Biaya</span>
                    <span className="text-[13px] font-medium">
                      {event.is_free ? "Gratis" : `Rp ${event.price.toLocaleString("id-ID")}`}
                    </span>
                  </div>
                </div>
              </div>

              <hr className="my-6 border-gray-100" />
              
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-[#2563eb] rounded-lg">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-[12px] font-bold">Pendaftaran Terjamin</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />

      {/* Profile Incomplete Modal */}
      {!isProfileComplete && !isLoading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative bg-white w-full max-w-[450px] rounded-[30px] p-8 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-6 mx-auto">
              <AlertCircle className="w-12 h-12 text-yellow-600" />
            </div>
            <h1 className="text-[24px] font-bold text-gray-900 mb-2">Profil Belum Lengkap</h1>
            <p className="text-gray-600 mb-8 leading-relaxed text-[14px]">
              Maaf, kamu harus melengkapi profil kamu (termasuk Foto, CV/LinkedIn, dan Portofolio) 
              sebelum dapat mendaftar ke acara ini. Ini membantu penyelenggara mengenalmu lebih baik.
            </p>
            <div className="flex flex-col gap-3">
              <Link href="/settings/profile" className="w-full py-3 bg-[#2563eb] text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md">
                Lengkapi Profil Sekarang
              </Link>
              <Link href={`/events/${id}`} className="w-full py-3 border border-gray-200 text-gray-500 rounded-xl font-bold hover:bg-gray-50 transition-all">
                Kembali ke Detail Acara
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
