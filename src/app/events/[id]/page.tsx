"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Footer from "@/components/organism/Footer";
import { createClient } from "@/lib/supabase/client";
import {
  CheckCircle2,
  Calendar,
  CalendarPlus,
  CircleDollarSign,
  ChevronLeft,
  Share2,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  MapPin,
  Loader2,
  AlertCircle,
  Globe,
  ChevronRight,
  BookOpen,
  Trophy,
  Star,
  Users
} from "lucide-react";
import type { Database } from "@/types";

type EventRow = Database["public"]["Tables"]["events"]["Row"];

interface EventDetailWithOrganizer extends EventRow {
  organizers: {
    id: string;
    org_name: string;
    org_logo_url: string | null;
    is_verified: boolean;
    tier: string;
  } | null;
}

function formatDate(dateString: string | null): string {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatPrice(isFree: boolean, price: number): string {
  if (isFree) return "Gratis";
  if (price > 0) return `Rp ${price.toLocaleString("id-ID")}`;
  return "Gratis";
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [event, setEvent] = useState<EventDetailWithOrganizer | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  // ── Tugas 4: Dynamic Rating State ──
  const [ratingStats, setRatingStats] = useState<{
    average_rating: number;
    total_ratings: number;
    star_counts: Record<string, number>;
  } | null>(null);
  const [myRating, setMyRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [ratingMessage, setRatingMessage] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const fetchUserAndStatus = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setIsLoggedIn(true);
        // Fetch role
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        setRole(profile?.role || null);

        // Fetch registration status
        if (id) {
          const { data: registration } = await supabase
            .from("event_registrations")
            .select("id")
            .eq("event_id", id)
            .eq("profile_id", user.id)
            .maybeSingle();
          
          if (registration) {
            setIsRegistered(true);
          }
        }
      }
    };
    fetchUserAndStatus();
  }, [id]);

  useEffect(() => {
    async function fetchEvent() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/events/${id}`);
        const json = await res.json();

        if (!res.ok || json.error) {
          setError(json.error || "Event tidak ditemukan");
          return;
        }

        setEvent(json.data);
      } catch {
        setError("Gagal terhubung ke server. Periksa koneksi internet kamu.");
      } finally {
        setIsLoading(false);
      }
    }

    if (id) fetchEvent();
  }, [id]);

  // Cek bookmark status
  useEffect(() => {
    if (!id) return;
    fetch(`/api/bookmarks?event_id=${id}`)
      .then(r => r.json())
      .then(d => { if (d.bookmarked) setIsBookmarked(true); })
      .catch(() => {});
  }, [id]);

  // ── Tugas 4: Fetch rating stats dan rating user ──
  useEffect(() => {
    if (!id) return;
    // Fetch aggregate stats (sangat ringan - 1 baris dari server)
    fetch(`/api/events/ratings?event_id=${id}`)
      .then(r => r.json())
      .then(data => {
        if (!data.error) setRatingStats(data);
      })
      .catch(() => {});

    // Fetch rating user ini (jika sudah login)
    fetch(`/api/events/ratings?event_id=${id}`, { method: "PATCH" })
      .then(r => r.json())
      .then(data => {
        if (data.my_rating) setMyRating(data.my_rating);
      })
      .catch(() => {});
  }, [id]);

  // ── Tugas 4: Submit rating ──
  const handleRating = async (value: number) => {
    if (!isLoggedIn) {
      router.push(`/login?next=${encodeURIComponent(`/events/${id}`)}`);
      return;
    }
    setIsSubmittingRating(true);
    setRatingMessage(null);
    try {
      const res = await fetch("/api/events/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id: id, rating_value: value }),
      });
      const json = await res.json();
      if (res.ok) {
        setMyRating(value);
        // Refresh stats
        const statsRes = await fetch(`/api/events/ratings?event_id=${id}`);
        const statsData = await statsRes.json();
        if (!statsData.error) setRatingStats(statsData);
        setRatingMessage("Rating berhasil disimpan!");
        setTimeout(() => setRatingMessage(null), 3000);
      } else {
        setRatingMessage(json.error || "Gagal menyimpan rating");
      }
    } catch {
      setRatingMessage("Gagal terhubung ke server");
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const handleBookmark = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(`/events/${id}`)}`);
      return;
    }
    setBookmarkLoading(true);
    try {
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: id }),
      });
      const json = await res.json();
      if (res.ok) setIsBookmarked(json.bookmarked);
    } catch {} finally {
      setBookmarkLoading(false);
    }
  };

  const handleAddToCalendar = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(`/events/${id}`)}`);
      return;
    }
    if (!event) return;

    // Build Google Calendar URL (no API key needed)
    const title = encodeURIComponent(`[Upvance] ${event.title}`);
    const details = encodeURIComponent(
      `${event.description ?? ''}\n\nLink acara: ${typeof window !== 'undefined' ? window.location.href : ''}`
    );
    const location = encodeURIComponent(event.is_online ? 'Online' : (event.location ?? 'Indonesia'));

    const formatGCalDate = (iso: string | null): string => {
      if (!iso) return '';
      return iso.replace(/[-:]/g, '').replace('T', 'T').split('.')[0] + 'Z';
    };

    const startDate = event.start_date ? formatGCalDate(event.start_date) : formatGCalDate(event.deadline);
    const endDate = event.end_date ? formatGCalDate(event.end_date) : startDate;

    const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${details}&location=${location}`;
    window.open(calUrl, '_blank');
  };

  if (isLoading) {
    return (
      <main className="min-h-screen pt-[100px] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#2563eb] animate-spin" />
      </main>
    );
  }

  if (error || !event) {
    return (
      <main className="min-h-screen pt-[100px] flex flex-col items-center justify-center px-4">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h1 className="text-xl font-bold text-gray-800 mb-4">{error || "Event tidak ditemukan"}</h1>
        <Link href="/dashboard" className="px-6 py-2 bg-[#2563eb] text-white rounded-lg font-bold">
          Kembali ke Beranda
        </Link>
      </main>
    );
  }

  const orgName = event.organizers?.org_name ?? "Penyelenggara";
  const orgLogo = event.organizers?.org_logo_url ?? null;

  return (
    <div className="min-h-screen font-['Inter',sans-serif] bg-white relative overflow-x-hidden">
      {/* Header Spacer */}
      <div className="h-[75px]" />

      <main className="pt-10 pb-20 px-4 md:px-10 max-w-[1280px] mx-auto relative z-10">
        {/* Title and breadcrumb Row */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h1 className="text-[32px] font-bold text-[#161616] leading-[1.2] max-w-[800px] font-['Inter',sans-serif]">
              {event.title}
            </h1>
            {event.is_verified && (
              <div className="flex items-center gap-2 text-[#2563eb]">
                <CheckCircle2 className="w-7 h-7 fill-[#2563eb] text-white" />
                <span className="text-[24px] font-bold">Verified</span>
              </div>
            )}
          </div>
          <Link href="/dashboard" className="flex items-center gap-1 text-gray-400 hover:text-[#2563eb] transition-colors text-[14px] font-medium w-fit">
            <ChevronLeft className="w-4 h-4" /> Kembali ke Jelajah Acara
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* LEFT COLUMN */}
          <div className="w-full lg:w-[403px] shrink-0 flex flex-col gap-8">
            {/* Poster */}
            <div className="w-full aspect-[322/429] md:aspect-[403/537] rounded-[20px] overflow-hidden shadow-sm border border-gray-100 bg-[#f8fafc]">
              <img
                src={event.image_url ?? "/Logo.png"}
                alt={event.title}
                className="w-full h-full object-cover block"
              />
            </div>

            {/* Sidebar Divider */}
            <div className="h-px bg-gray-200 w-full" />

            {/* Organizer Profile Sidebar */}
            <div className="flex flex-col gap-6">
              <h2 className="text-[20px] font-bold text-black font-['Inter',sans-serif]">Profil Penyelenggara</h2>
              <div className="flex items-center gap-4">
                <div className="w-[63px] h-[69px] relative shrink-0">
                   {orgLogo ? (
                     <Image src={orgLogo} alt={orgName} fill className="object-contain" />
                   ) : (
                     <div className="w-full h-full bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
                        <Image src="/Logo_Icon.png" alt="" fill className="object-contain opacity-20 p-2" />
                     </div>
                   )}
                </div>
                <div className="flex flex-col">
                  <span className="text-[20px] font-bold text-[#757575] leading-tight">{orgName}</span>
                </div>
              </div>
              <p className="text-[18px] text-[#777] leading-[1.2] text-justify font-['Inter',sans-serif]">
                {orgName} adalah kementerian yang bertanggung jawab untuk menyelenggarakan suburusan pemerintahan di bidang ekonomi kreatif dan pengembangan potensi mahasiswa.
              </p>
            </div>

            {/* Rating Sidebar — Tugas 4: Dynamic & Ringan */}
            <div className="flex flex-col gap-4">
              <h2 className="text-[20px] font-bold text-black font-['Inter',sans-serif]">Rating Acara</h2>
              
              {/* Aggregate Display */}
              <div className="flex items-center gap-8">
                <div className="text-[75px] font-bold text-black leading-none">
                  {ratingStats ? ratingStats.average_rating.toFixed(1).replace(".", ",") : "–"}
                </div>
                <div className="flex flex-col flex-1 gap-1">
                  {[5, 4, 3, 2, 1].map(r => {
                    const count = ratingStats?.star_counts?.[String(r)] ?? 0;
                    const total = ratingStats?.total_ratings ?? 0;
                    const pct = total > 0 ? (count / total) * 100 : 0;
                    return (
                      <div key={r} className="flex items-center gap-2">
                        <span className="text-[16px] font-bold text-black w-3 text-center">{r}</span>
                        <div className="flex-1 h-3 bg-[rgba(217,217,217,0.5)] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#2563eb] rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-gray-400 w-6 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Star display + count */}
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i <= Math.round(ratingStats?.average_rating ?? 0)
                          ? "fill-[#2563eb] text-[#2563eb]"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[14px] font-bold text-black ml-2">
                  {ratingStats ? `${ratingStats.total_ratings} ulasan` : "Belum ada ulasan"}
                </span>
              </div>

              {/* Interactive rating input */}
              <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
                <p className="text-[13px] font-semibold text-gray-500">
                  {myRating ? `Rating kamu: ${myRating} bintang (klik untuk ubah)` : "Beri rating acara ini:"}
                </p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      disabled={isSubmittingRating}
                      onClick={() => handleRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      className="transition-transform hover:scale-110 disabled:opacity-50"
                      title={`Beri ${star} bintang`}
                    >
                      <Star
                        className={`w-7 h-7 transition-colors ${
                          star <= (hoverRating ?? myRating ?? 0)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                  {isSubmittingRating && <Loader2 className="w-4 h-4 text-gray-400 animate-spin ml-1" />}
                </div>
                {ratingMessage && (
                  <p className={`text-[12px] font-medium ${
                    ratingMessage.includes("berhasil") ? "text-green-600" : "text-red-500"
                  }`}>
                    {ratingMessage}
                  </p>
                )}
                {!isLoggedIn && (
                  <p className="text-[12px] text-gray-400">
                    <Link href={`/login?next=/events/${id}`} className="text-[#2563eb] hover:underline font-medium">Masuk</Link> untuk memberi rating
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex-1 flex flex-col gap-8">
            {/* Category and Stats */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <div className="px-4 py-1.5 bg-[rgba(172,189,227,0.3)] border border-[rgba(35,69,143,0.3)] rounded-md text-[13px] font-semibold text-black flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-[#2563eb]" />
                  {event.category || "Kompetisi"}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="flex flex-col gap-2">
                  <span className="text-[16px] font-bold text-[#161616]">Jenjang Pendidikan</span>
                  <div className="flex items-center gap-2 text-[#777]">
                    <BookOpen className="w-6 h-6 text-[#2563eb]" />
                    <span className="text-[13px] font-medium">S1, D1, D2, D3</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-[16px] font-bold text-[#161616]">Mulai Pendaftaran</span>
                  <div className="flex items-center gap-2 text-[#777]">
                    <Calendar className="w-6 h-6 text-[#2563eb]" />
                    <span className="text-[13px] font-medium">{formatDate(event.start_date)}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-[16px] font-bold text-[#161616]">Penutupan Pendaftaran</span>
                  <div className="flex items-center gap-2 text-[#e53835]">
                    <Calendar className="w-6 h-6" />
                    <span className="text-[13px] font-medium">{formatDate(event.deadline)}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-[16px] font-bold text-[#161616]">Pembayaran</span>
                  <div className="flex items-center gap-2 text-[#0E0E0F]">
                    <CircleDollarSign className="w-6 h-6 text-[#2563eb]" />
                    <span className="text-[13px] font-medium">{formatPrice(event.is_free, event.price)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-px bg-gray-200 w-full" />

            {/* Organizer Info Summary */}
            <div className="flex items-start gap-4 flex-col">
               <span className="text-[16px] font-bold text-[#bababa] uppercase">Diselenggarakan Oleh</span>
               <span className="text-[20px] font-bold text-black">{orgName}</span>
            </div>

            <div className="h-px bg-gray-200 w-full" />

            {/* Description Section */}
            <div className="flex flex-col gap-4">
              <h2 className="text-[20px] font-bold text-black font-['Inter',sans-serif]">Deskripsi</h2>
              <p className="text-[16px] text-[#777] leading-[21px] text-justify font-['Inter',sans-serif] whitespace-pre-line">
                {event.description || "Kompetisi business plan nasional yang cocok bagi mahasiswa yang memiliki ide usaha inovatif dan ingin mengembangkan kemampuan entrepreneurship. Dengan biaya pendaftaran yang terjangkau dan berbagai rangkaian mentoring serta coaching, kompetisi ini sangat potensial untuk menambah pengalaman, portofolio, dan relasi nasional mahasiswa."}
              </p>
            </div>

            {/* Terms and Requirements Box */}
            <div className="flex flex-col gap-4">
              <h2 className="text-[20px] font-bold text-black font-['Inter',sans-serif]">Persyaratan dan Ketentuan</h2>
              <div className="relative rounded-[20px] overflow-hidden shadow-[0px_0px_5px_rgba(0,0,0,0.25)] flex bg-[rgba(172,189,227,0.3)] min-h-[362px]">
                {/* Blue Side Stripe */}
                <div className="w-[158px] bg-[rgba(35,69,143,0.3)] shrink-0 absolute left-0 top-0 bottom-0 z-0" />
                
                <div className="relative z-10 w-full flex flex-col md:flex-row">
                   <div className="w-full md:w-[158px] shrink-0 pt-8 pl-6">
                      <span className="text-black font-bold text-[16px]">Lainnya</span>
                   </div>
                   <div className="flex-1 p-8 text-[16px] text-[#777] text-justify font-['Inter',sans-serif]">
                      <p className="mb-2 leading-[27px]">Persyaratan pendaftaran:</p>
                      <ol className="list-decimal pl-5 flex flex-col gap-0">
                        <li className="leading-[27px]">Peserta merupakan mahasiswa aktif D1/D2/D3/S1 dari universitas di seluruh Indonesia</li>
                        <li className="leading-[27px]">Peserta berasal dari angkatan 2023, 2024, atau 2025</li>
                        <li className="leading-[27px]">Perlombaan bersifat tim yang terdiri dari 3 orang</li>
                        <li className="leading-[27px]">Setiap tim wajib menunjuk satu ketua tim</li>
                        <li className="leading-[27px]">Ketua tim wajib mendaftarkan seluruh anggota dalam satu tim</li>
                        <li className="leading-[27px]">Peserta hanya diperbolehkan mengikuti satu tim dan tidak boleh terdaftar di tim lain</li>
                        <li className="leading-[27px]">Proposal bisnis harus sesuai dengan subtema yang dipilih</li>
                        <li className="leading-[27px]">Karya harus orisinal dan belum pernah dipublikasikan</li>
                        <li className="leading-[27px]">Peserta wajib mengikuti seluruh rangkaian kegiatan kompetisi</li>
                      </ol>
                   </div>
                </div>
              </div>
            </div>

            {/* Booklet Link Box */}
            <div className="relative rounded-[20px] overflow-hidden shadow-[0px_0px_5px_rgba(0,0,0,0.25)] flex h-[58px] bg-[rgba(172,189,227,0.3)] items-center cursor-pointer hover:bg-[#acbde3]/50 transition-colors">
              <div className="w-full max-w-[158px] h-full bg-[rgba(35,69,143,0.3)] flex items-center pl-6 shrink-0 relative z-10">
                <span className="text-[16px] font-bold text-black">Booklet</span>
              </div>
              <div className="flex-1 px-8 flex items-center justify-between relative z-10">
                <span className="text-[16px] text-[#777] underline font-['Inter',sans-serif]">Panduan Pendaftaran</span>
              </div>
            </div>

            {/* Bottom Actions Row */}
            <div className="flex flex-wrap items-center gap-4 mt-4 mb-10">
              {role === "admin" ? (
                <Link
                  href={`/admin?edit=${id}`}
                  className="h-[36px] w-full md:w-[196px] bg-[rgba(37,99,235,0.75)] hover:bg-blue-700 text-white rounded-[50px] font-bold text-[16px] transition-all flex items-center justify-center gap-2 group shadow-sm"
                >
                  Edit Event <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : isRegistered ? (
                <button
                  disabled
                  className="h-[36px] w-full md:w-[196px] bg-gray-300 text-gray-500 rounded-[50px] font-bold text-[16px] cursor-not-allowed flex items-center justify-center shadow-sm"
                >
                  Terdaftar
                </button>
              ) : (
                <Link
                  href={`/events/${id}/register`}
                  className="h-[36px] w-full md:w-[196px] bg-[#2563eb] text-white rounded-[50px] font-bold text-[16px] hover:bg-blue-700 transition-all shadow-md flex items-center justify-center gap-2 group"
                >
                  Daftar Sekarang <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}

              <button
                onClick={handleBookmark}
                disabled={bookmarkLoading}
                className="h-[36px] w-full md:w-[147px] flex items-center justify-center gap-2 border border-[#2563eb]/50 bg-white text-[#2563eb] rounded-[10px] font-semibold text-[16px] hover:bg-blue-50 transition-all disabled:opacity-50"
              >
                {isBookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                {isBookmarked ? "Tersimpan" : "Bookmark"}
              </button>

              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: event.title, url: window.location.href });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Link berhasil disalin!");
                  }
                }}
                className="h-[36px] w-full md:w-[132px] flex items-center justify-center gap-2 border border-[#2563eb]/50 bg-white text-[#2563eb] rounded-[10px] font-semibold text-[16px] hover:bg-blue-50 transition-all"
              >
                <Share2 className="w-5 h-5" />
                Bagikan
              </button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
