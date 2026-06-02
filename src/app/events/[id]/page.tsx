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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

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

  const orgName = event.organizers?.org_name ?? "";
  const orgLogo = event.organizers?.org_logo_url ?? null;

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

      <main className="pt-[100px] md:pt-[120px] pb-20 px-4 md:px-10 max-w-[1100px] mx-auto relative z-10">
        {/* Breadcrumb / Back Button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-[#2563eb] font-bold mb-8 hover:underline"
        >
          <ChevronLeft className="w-5 h-5" />
          Kembali ke Beranda
        </Link>

        {/* ─── EVENT DETAIL BOX ─── */}
        <div className="bg-white rounded-[32px] p-6 md:p-10 shadow-sm border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Left Column: Event Poster */}
            <div className="w-full lg:w-[403px] shrink-0">
              <div className="rounded-[20px] overflow-hidden shadow-lg border border-gray-100 bg-[#f8fafc]">
                <img
                  src={event.image_url ?? "/Logo.png"}
                  alt={event.title}
                  className="w-full h-auto block"
                />
              </div>
            </div>

            {/* Right Column: Event Info */}
            <div className="flex-1 flex flex-col gap-6">
              {/* Title and Verification */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <h1 className="text-[28px] md:text-[32px] font-bold text-[#161616] leading-tight">
                    {event.title}
                  </h1>
                </div>

                <div className="flex gap-2 flex-wrap items-center">
                  {event.is_verified && (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-[#2563eb] rounded-full border border-blue-100">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-[12px] font-bold uppercase">
                        Verified
                      </span>
                    </div>
                  )}
                  {event.category && (
                    <span className="px-4 py-1 bg-blue-100 border border-blue-200 rounded-full text-[12px] font-bold text-[#16558f]">
                      {event.category}
                    </span>
                  )}
                  {event.is_featured && (
                    <span className="px-4 py-1 bg-yellow-50 border border-yellow-300 rounded-full text-[12px] font-semibold text-yellow-700">
                      ⭐ Featured
                    </span>
                  )}
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Event Metadata Grid */}
              <div className="grid grid-cols-2 gap-y-6 gap-x-4 py-2">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">
                    Lokasi
                  </span>
                  <div className="flex items-center gap-2 text-[#161616]">
                    {event.is_online ? (
                      <Globe className="w-5 h-5 text-[#2563eb]" />
                    ) : (
                      <MapPin className="w-5 h-5 text-[#2563eb]" />
                    )}
                    <span className="text-[14px] font-semibold">
                      {event.is_online
                        ? "Online"
                        : event.location ?? "Indonesia"}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">
                    Mulai Acara
                  </span>
                  <div className="flex items-center gap-2 text-[#161616]">
                    <Calendar className="w-5 h-5 text-[#2563eb]" />
                    <span className="text-[14px] font-semibold">
                      {formatDate(event.start_date)}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">
                    Deadline Daftar
                  </span>
                  <div className="flex items-center gap-2 text-[#ef4444]">
                    <Calendar className="w-5 h-5" />
                    <span className="text-[14px] font-bold">
                      {formatDate(event.deadline)}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">
                    Biaya
                  </span>
                  <div className="flex items-center gap-2 text-[#161616]">
                    <CircleDollarSign className="w-5 h-5 text-[#2563eb]" />
                    <span className="text-[14px] font-semibold">
                      {formatPrice(event.is_free, event.price)}
                    </span>
                  </div>
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Organizer Section */}
              <div className="flex items-center gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                <div className="w-[50px] h-[50px] relative bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden shrink-0">
                  {orgLogo ? (
                    <Image
                      src={orgLogo}
                      alt={orgName}
                      fill
                      className="object-contain p-1"
                      sizes="50px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                      <Image src="/Logo_Icon.png" alt="" fill className="object-contain opacity-20" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Diselenggarakan Oleh
                  </span>
                  <span className="text-[16px] font-bold text-black">
                    {orgName || "Penyelenggara"}
                  </span>
                </div>
              </div>

              {/* Description Section */}
              {event.description && (
                <div className="flex flex-col gap-3 mt-2">
                  <h2 className="text-[18px] font-bold text-black">Deskripsi</h2>
                  <p className="text-[15px] text-[#4b5563] leading-[1.7] text-justify whitespace-pre-line">
                    {event.description}
                  </p>
                </div>
              )}

              {/* Event URL / Booklet Link */}
              {event.event_url && (
                <Link
                  href={`/events/${id}/register`}
                  className="flex rounded-2xl overflow-hidden shadow-sm h-[58px] hover:shadow-md transition-shadow bg-gradient-to-r from-[#2563eb] via-[#16c475] to-[#f8fafc] p-[1.5px]"
                >
                  <div className="flex w-full h-full bg-white rounded-[14px] overflow-hidden">
                    <div className="w-[140px] bg-gradient-to-r from-[#2563eb]/10 to-[#16c475]/10 flex items-center justify-center border-r border-gray-100">
                      <span className="text-[14px] font-bold text-[#2563eb]">
                        Link Acara
                      </span>
                    </div>
                    <div className="flex-1 flex items-center justify-between px-6 bg-white/60">
                      <span className="text-[14px] text-gray-700 truncate font-semibold">
                        Buka halaman pendaftaran acara
                      </span>
                      <ExternalLink className="w-5 h-5 text-[#16c475] shrink-0" />
                    </div>
                  </div>
                </Link>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 mt-6 justify-end">
                <button
                  onClick={handleBookmark}
                  disabled={bookmarkLoading}
                  className={`h-11 flex items-center gap-2 px-6 border rounded-xl font-bold text-[14px] transition-all disabled:opacity-50 ${
                    isBookmarked
                      ? "border-[#2563eb] bg-[#2563eb] text-white shadow-md shadow-blue-100"
                      : "border-gray-200 bg-white text-gray-600 hover:border-[#2563eb] hover:text-[#2563eb]"
                  }`}
                >
                  {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                  {isBookmarked ? "Tersimpan" : "Bookmark"}
                </button>
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: event.title,
                        url: window.location.href,
                      });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      alert("Link berhasil disalin!");
                    }
                  }}
                  className="h-11 flex items-center gap-2 px-6 border border-gray-200 bg-white text-gray-600 rounded-xl font-bold text-[14px] hover:border-[#2563eb] hover:text-[#2563eb] transition-all"
                >
                  <Share2 className="w-4 h-4" />
                  Bagikan
                </button>
                <button
                  onClick={handleAddToCalendar}
                  className="h-11 flex items-center gap-2 px-6 border border-gray-200 bg-white text-[#16c475] rounded-xl font-bold text-[14px] hover:border-[#16c475] hover:bg-green-50 transition-all"
                >
                  <CalendarPlus className="w-4 h-4" />
                  Simpan Kalender
                </button>
                <Link
                  href={`/events/${id}/register`}
                  className="h-11 px-10 bg-[#2563eb] text-white rounded-xl font-bold text-[14px] hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center"
                >
                  Daftar Sekarang
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
