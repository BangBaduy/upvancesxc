"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import Footer from "@/components/organism/Footer";
import EventCard from "@/components/molecules/EventCard";
import { ChevronLeft, ChevronRight, Loader2, AlertCircle, X } from "lucide-react";
import type { Database } from "@/types";
import { createClient } from "@/lib/supabase/client";

type EventRow = Database["public"]["Tables"]["events"]["Row"] & {
  organizers?: {
    org_name: string;
    org_logo_url: string | null;
  } | null;
};
type EventCategory = EventRow["category"];

interface EventsApiResponse {
  data: EventRow[] | null;
  meta: { total: number; page: number; limit: number; total_pages: number } | null;
  error: string | null;
}

const ITEMS_PER_PAGE = 6;

// Semua kategori yang tersedia
const ALL_CATEGORIES: { label: string; value: EventCategory; color: string; segment: "umum" | "green" }[] = [
  { label: "Lomba",     value: "Lomba",     color: "bg-blue-100 text-blue-700 border-blue-300",      segment: "umum"  },
  { label: "Seminar",   value: "Seminar",   color: "bg-purple-100 text-purple-700 border-purple-300", segment: "umum"  },
  { label: "Workshop",  value: "Workshop",  color: "bg-orange-100 text-orange-700 border-orange-300", segment: "umum"  },
  { label: "Beasiswa",  value: "Beasiswa",  color: "bg-green-100 text-green-700 border-green-300",    segment: "umum"  },
  { label: "Magang",    value: "Magang",    color: "bg-teal-100 text-teal-700 border-teal-300",       segment: "umum"  },
  { label: "Webinar",   value: "Webinar",   color: "bg-indigo-100 text-indigo-700 border-indigo-300", segment: "umum"  },
  { label: "Volunteer", value: "Volunteer", color: "bg-lime-100 text-lime-700 border-lime-300",       segment: "green" },
  { label: "Greenvity", value: "Greenvity", color: "bg-emerald-100 text-emerald-700 border-emerald-300", segment: "green" },
  { label: "Lainnya",   value: "Lainnya",   color: "bg-gray-100 text-gray-600 border-gray-300",       segment: "umum"  },
];

const GREEN_CATEGORIES: EventCategory[] = ["Volunteer", "Greenvity"];
const UMUM_CATEGORIES: EventCategory[] = ALL_CATEGORIES.filter(c => c.segment === "umum").map(c => c.value);

function DashboardContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  const [events, setEvents] = useState<EventRow[]>([]);
  const [meta, setMeta] = useState<EventsApiResponse["meta"]>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInterestsLoaded, setIsInterestsLoaded] = useState(false);

  // Filter state
  const [activeSegment, setActiveSegment] = useState<"rekomendasi" | "all" | "umum" | "green" | "saved">("rekomendasi");
  const [selectedCategories, setSelectedCategories] = useState<Set<EventCategory>>(new Set());
  const [isFreeOnly, setIsFreeOnly] = useState(false);
  const [userInterests, setUserInterests] = useState<EventCategory[]>([]);

  useEffect(() => {
    let mounted = true;
    const timeout = setTimeout(() => {
      if (mounted) setIsInterestsLoaded(true);
    }, 1000);

    const loadInterests = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user && mounted) {
          const { data: profile } = await supabase.from('profiles').select('interests').eq('id', user.id).single();
          if (profile?.interests && profile.interests.length > 0) {
            const mapped = profile.interests.filter((i: string) => ALL_CATEGORIES.some(c => c.value === i)) as EventCategory[];
            setUserInterests(mapped.length > 0 ? mapped : UMUM_CATEGORIES);
          } else {
            setUserInterests(UMUM_CATEGORIES);
          }
        } else if (mounted) {
          setUserInterests(UMUM_CATEGORIES);
        }
      } catch (err) {
        if (mounted) setUserInterests(UMUM_CATEGORIES);
      } finally {
        if (mounted) {
          clearTimeout(timeout);
          setIsInterestsLoaded(true);
        }
      }
    };
    loadInterests();

    return () => {
      mounted = false;
      clearTimeout(timeout);
    };
  }, []);

  const fetchEvents = useCallback(async (currentPage: number, search: string, cats: Set<EventCategory>, freeOnly: boolean, segment: string, interests: EventCategory[]) => {
    setIsLoading(true);
    setError(null);
    try {
      // Jika segment 'saved', fetch dari endpoint bookmarks
      if (segment === "saved") {
        const res = await fetch(`/api/bookmarks`);
        const json = await res.json();
        if (!res.ok || json.error) { setError(json.error || "Gagal memuat bookmark"); setEvents([]); setMeta(null); return; }
        
        // Map bookmarks to event rows (bookmarks response is { data: [ { event: { ... } } ] })
        const bookmarkedEvents = json.data?.map((b: any) => b.event) || [];
        
        // Client-side filtering for search/free/categories if needed on saved items
        let filtered = bookmarkedEvents;
        if (search) {
          filtered = filtered.filter((e: any) => e.title.toLowerCase().includes(search.toLowerCase()));
        }
        if (freeOnly) {
          filtered = filtered.filter((e: any) => e.is_free || e.price === 0);
        }
        if (cats.size > 0) {
          filtered = filtered.filter((e: any) => cats.has(e.category));
        }

        setEvents(filtered);
        setMeta({ total: filtered.length, page: 1, limit: 100, total_pages: 1 });
        return;
      }

      const params = new URLSearchParams({ page: String(currentPage), limit: String(ITEMS_PER_PAGE) });
      if (search) params.set("search", search);
      if (freeOnly) params.set("is_free", "true");

      // Resolve kategori
      let activeCats: EventCategory[] = [];
      if (cats.size > 0) {
        activeCats = Array.from(cats);
      } else if (segment === "rekomendasi") {
        activeCats = interests.length > 0 ? interests : UMUM_CATEGORIES;
      } else if (segment === "umum") {
        activeCats = UMUM_CATEGORIES;
      } else if (segment === "green") {
        activeCats = GREEN_CATEGORIES;
      }

      if (activeCats.length === 1) {
        params.set("category", activeCats[0]);
      } else if (activeCats.length > 1) {
        params.set("categories", activeCats.join(","));
      }


      const res = await fetch(`/api/events?${params.toString()}`);

      // Jika middleware mendeteksi cookie overflow (431 prevention)
      if (res.status === 401) {
        const json401 = await res.json().catch(() => ({}));
        if (json401.error === 'session_expired') {
          // Clear semua cookie sb- lalu redirect ke login
          document.cookie.split(';').forEach(c => {
            const name = c.split('=')[0].trim();
            if (name.startsWith('sb-')) {
              document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
            }
          });
          window.location.href = '/login?reason=session_reset';
          return;
        }
        setError('Sesi berakhir, silakan login ulang.');
        setEvents([]); setMeta(null);
        return;
      }

      const json: EventsApiResponse = await res.json();
      if (!res.ok || json.error) { setError(json.error || "Gagal memuat acara"); setEvents([]); setMeta(null); return; }
      setEvents(json.data ?? []);
      setMeta(json.meta);
    } catch (err) {
      console.error(err);
      // Jika terjadi Network Error (seperti HTTP 431 Header Too Large)
      setError("Mereset sesi yang korup... mohon tunggu.");
      try {
        await fetch('/api/auth/clear', { method: 'POST' });
        document.cookie.split(';').forEach(c => {
          const name = c.split('=')[0].trim();
          if (name.startsWith('sb-')) document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
        });
        window.location.href = '/login?reason=session_reset';
      } catch {
        setError("Gagal memuat acara. Coba refresh halaman.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { setPage(1); }, [searchQuery, selectedCategories, isFreeOnly, activeSegment, userInterests]);
  useEffect(() => { 
    if (activeSegment === "rekomendasi" && !isInterestsLoaded) return;
    fetchEvents(page, searchQuery, selectedCategories, isFreeOnly, activeSegment, userInterests); 
  }, [page, searchQuery, selectedCategories, isFreeOnly, activeSegment, userInterests, fetchEvents, isInterestsLoaded]);

  const toggleCategory = (cat: EventCategory) => {
    setSelectedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat); else next.add(cat);
      return next;
    });
    setActiveSegment("all"); // reset segment saat pilih kategori manual
  };

  const clearFilters = () => { setSelectedCategories(new Set()); setIsFreeOnly(false); setActiveSegment("rekomendasi"); };
  const hasFilter = selectedCategories.size > 0 || isFreeOnly || activeSegment !== "rekomendasi";

  const totalEvents = meta?.total ?? 0;
  const totalPages = meta?.total_pages ?? 1;

  return (
    <div className="min-h-screen w-full relative font-['Inter',sans-serif] overflow-x-hidden">
      {/* Background Layer */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden bg-[#f8fafc]">
        {/* Main Background Image with Fade */}
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

        {/* Blur Ellipse from Figma 266:437 */}
        <div className="absolute top-[659px] left-[-185px] w-[377px] h-[337px] rotate-[-5deg] opacity-10 md:opacity-40">
          <div className="w-full h-full bg-gradient-to-br from-[#2563eb]/30 to-[#14cb72]/30 rounded-full blur-3xl transform-gpu will-change-transform" />
        </div>
      </div>

      <main className="responsive-section pt-[110px] pb-20 relative z-10 min-h-screen">
        <div className="max-w-[1280px] mx-auto relative z-10">
          {/* Title */}
          <div className="text-center mb-10">
            {isLoading ? (
              <div className="h-[44px] w-[280px] md:w-[400px] mx-auto bg-gray-200 animate-pulse rounded-lg" />
            ) : error ? null : (
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-[#3e74eb] max-w-[800px] mx-auto !mb-0 leading-tight">
                {searchQuery
                  ? `Hasil pencarian "${searchQuery}"`
                  : activeSegment === "saved"
                  ? "🔖 Acara Tersimpan Kamu"
                  : activeSegment === "green"
                  ? "🌿 Acara Green & Volunteer"
                  : activeSegment === "umum"
                  ? "🎓 Acara Umum Mahasiswa"
                  : `Ada ${totalEvents} Kompetisi yang 100% cocok dengan profil kamu`}
              </h1>
            )}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 text-[#2563eb] animate-spin" />
              <p className="text-[#2563eb] font-medium">Memuat acara...</p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <AlertCircle className="w-12 h-12 text-red-400" />
              <p className="text-red-500 font-medium text-center max-w-md">{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && events.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <p className="text-gray-400 font-medium text-center">
                Belum ada acara yang tersedia{hasFilter ? " dengan filter ini" : ""}.
              </p>
              {hasFilter && (
                <button onClick={clearFilters} className="text-[#2563eb] hover:underline text-sm font-semibold">
                  Hapus semua filter
                </button>
              )}
            </div>
          )}

          {/* Events Grid */}
          {!isLoading && !error && events.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center mb-20">
                {events.map((event) => (
                  <EventCard
                    key={event.id}
                    id={event.id}
                    title={event.title}
                    location={event.location ?? "Indonesia"}
                    startDate={event.start_date ? new Date(event.start_date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                    deadline={event.deadline ? new Date(event.deadline).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                    price={event.is_free ? "Gratis" : event.price > 0 ? `Rp ${event.price.toLocaleString("id-ID")}` : "Gratis"}
                    image={event.image_url ?? "/Logo.png"}
                    isVerified={event.is_verified}
                    category={event.category}
                    isOnline={event.is_online}
                    organizerName={event.organizers?.org_name}
                    organizerLogo={event.organizers?.org_logo_url}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 py-8">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                  </button>
                  <span className="text-[14px] text-gray-500 font-medium">{page} / {totalPages}</span>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                    <ChevronRight className="w-5 h-5 text-gray-700" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function DashboardPage() {
  return <Suspense fallback={null}><DashboardContent /></Suspense>;
}

