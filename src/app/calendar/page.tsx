"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import Footer from "@/components/organism/Footer";
import EventCard from "@/components/molecules/EventCard";
import { Filter, ChevronLeft, ChevronRight, Loader2, AlertCircle } from "lucide-react";
import type { Database } from "@/types";

type EventRow = Database["public"]["Tables"]["events"]["Row"];
type EventCategory = EventRow["category"];

const months = [
  { label: "Jan", value: 1 }, { label: "Feb", value: 2 }, { label: "Mar", value: 3 },
  { label: "Apr", value: 4 }, { label: "Mei", value: 5 }, { label: "Jun", value: 6 },
  { label: "Jul", value: 7 }, { label: "Agu", value: 8 }, { label: "Sep", value: 9 },
  { label: "Okt", value: 10 }, { label: "Nov", value: 11 }, { label: "Des", value: 12 },
];

// Segmentasi: Umum vs Green
const UMUM_CATEGORIES: { label: string; value: EventCategory }[] = [
  { label: "Lomba", value: "Lomba" },
  { label: "Seminar", value: "Seminar" },
  { label: "Workshop", value: "Workshop" },
  { label: "Beasiswa", value: "Beasiswa" },
  { label: "Magang", value: "Magang" },
  { label: "Webinar", value: "Webinar" },
  { label: "Lainnya", value: "Lainnya" },
];

const GREEN_CATEGORIES: { label: string; value: EventCategory }[] = [
  { label: "🌿 Volunteer", value: "Volunteer" },
  { label: "🌍 Greenvity", value: "Greenvity" },
];

const ALL_CATEGORIES = [...UMUM_CATEGORIES, ...GREEN_CATEGORIES];
const ITEMS_PER_PAGE = 50; // Fetch more to allow client-side filtering by month
const EVENTS_PER_PAGE = 6; // Display 6 events per slide
const currentYear = new Date().getFullYear();

function CalendarContent() {
  const currentMonth = new Date().getMonth() + 1;
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedCategories, setSelectedCategories] = useState<Set<EventCategory>>(new Set());
  const [isFreeOnly, setIsFreeOnly] = useState(false);
  const [activeSegment, setActiveSegment] = useState<"all" | "umum" | "green" | "saved">("all");

  const [events, setEvents] = useState<EventRow[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let allEvents: EventRow[] = [];

      if (activeSegment === "saved") {
        const res = await fetch(`/api/bookmarks`);
        const json = await res.json();
        if (!res.ok || json.error) { setError(json.error || "Gagal memuat bookmark"); setEvents([]); return; }
        allEvents = json.data?.map((b: any) => b.events) || [];
      } else {
        const params = new URLSearchParams({
          page: "1",
          limit: String(ITEMS_PER_PAGE),
        });

        // Tentukan kategori berdasarkan segmen + filter kategori yang dipilih
        let activeCats: EventCategory[] = [];
        if (selectedCategories.size > 0) {
          activeCats = Array.from(selectedCategories);
        } else if (activeSegment === "umum") {
          activeCats = UMUM_CATEGORIES.map(c => c.value);
        } else if (activeSegment === "green") {
          activeCats = GREEN_CATEGORIES.map(c => c.value);
        }

        if (activeCats.length === 1) {
          params.set("category", activeCats[0]);
        } else if (activeCats.length > 1) {
          params.set("categories", activeCats.join(","));
        }

        if (isFreeOnly) params.set("is_free", "true");

        const res = await fetch(`/api/events?${params.toString()}`);
        const json = await res.json();
        if (!res.ok || json.error) { setError(json.error || "Gagal memuat acara"); setEvents([]); return; }
        allEvents = json.data ?? [];
      }

      // Filter bulan di client (API tidak support filter tanggal untuk efisiensi)
      const filtered = allEvents.filter((e) => {
        if (!e.start_date && !e.deadline) return true;
        const dateStr = e.start_date || e.deadline || "";
        const date = new Date(dateStr);
        return date.getMonth() + 1 === selectedMonth && date.getFullYear() === selectedYear;
      });

      setEvents(filtered);
      setTotalPages(Math.ceil(filtered.length / EVENTS_PER_PAGE) || 1);
    } catch {
      setError("Gagal terhubung ke server.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth, selectedYear, selectedCategories, isFreeOnly, activeSegment]);

  useEffect(() => { setPage(1); fetchEvents(); }, [selectedMonth, selectedYear, selectedCategories, isFreeOnly, activeSegment]);

  const toggleCategory = (cat: EventCategory) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat); else next.add(cat);
      return next;
    });
  };

  const clearFilters = () => {
    setSelectedCategories(new Set());
    setIsFreeOnly(false);
    setActiveSegment("all");
  };

  const hasFilters = selectedCategories.size > 0 || isFreeOnly || activeSegment !== "all";

  const [showMobileFilters, setShowMobileFilters] = useState(false);

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

      <main className="pt-[100px] pb-10 px-4 md:px-10 relative z-10">
        <div className="max-w-[1280px] mx-auto flex flex-col lg:flex-row gap-4 lg:gap-4">

        {/* Mobile/Tablet Filter Toggle (Visible below 1024px) */}
        <div className="lg:hidden w-full flex justify-center mb-6">
          <button 
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex items-center justify-center gap-2 bg-[#16558f] text-white py-2.5 px-8 rounded-xl font-bold shadow-md active:scale-95 transition-all w-full max-w-[280px]"
          >
            <Filter className="w-4 h-4" />
            <span className="text-[13px]">{showMobileFilters ? "Tutup Filter" : "Lihat Filter Acara"}</span>
          </button>
        </div>

        {/* Sidebar Filters - Stacked on Tablet, Side-by-side on Desktop */}
        <aside className={`${showMobileFilters ? 'block' : 'hidden'} lg:block w-full lg:w-[220px] shrink-0 lg:sticky lg:top-[100px] h-fit z-20 mb-8 lg:mb-0`}>
          <div className="bg-[#eaf6ff] rounded-[10.5px] p-3 flex flex-col gap-3 shadow-sm border border-blue-50">
            <div className="flex items-center justify-between pb-3 border-b border-[#cbd5e1]">
              <div className="flex items-center gap-2">
                <Filter className="w-6 h-6 text-[#080808]" />
                <span className="text-[14px] font-bold text-[#080808]">Filter</span>
              </div>
              {hasFilters && (
                <button onClick={clearFilters} className="text-[11px] text-blue-600 hover:underline font-medium">
                  Reset
                </button>
              )}
            </div>

            {/* Segmentasi */}
            <div className="flex flex-col gap-2">
              <span className="text-[14px] font-bold text-[#080808]">Segmen</span>
              {[
                { label: "Semua Acara", value: "all" as const },
                { label: "🎓 Umum", value: "umum" as const },
                { label: "🌿 Green & Volunteer", value: "green" as const },
                { label: "🔖 Bookmarks", value: "saved" as const },
              ].map((seg) => (
                <button
                  key={seg.value}
                  onClick={() => { 
                    setActiveSegment(seg.value); 
                    if (seg.value === "green") {
                      setSelectedCategories(new Set(["Volunteer", "Greenvity"]));
                    } else if (seg.value === "umum") {
                      setSelectedCategories(new Set(UMUM_CATEGORIES.map(c => c.value)));
                    } else {
                      setSelectedCategories(new Set());
                    }
                  }}
                  className={`text-left px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors ${
                    activeSegment === seg.value
                      ? "bg-[#16558f] text-white"
                      : "bg-white/60 text-[#161616] hover:bg-blue-100"
                  }`}
                >
                  {seg.label}
                </button>
              ))}
            </div>

            <div className="h-px bg-[#cbd5e1] w-full" />

            {/* Biaya */}
            <div className="flex flex-col gap-2">
              <span className="text-[14px] font-bold text-[#080808]">Biaya</span>
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-[12.3px] font-extralight text-[#161616] group-hover:text-blue-600 transition-colors">
                  Gratis saja
                </span>
                <input
                  type="checkbox"
                  checked={isFreeOnly}
                  onChange={(e) => setIsFreeOnly(e.target.checked)}
                  className="w-[21px] h-[21px] rounded-[7px] border-[#16558f] text-[#16558f] focus:ring-[#16558f]"
                />
              </label>
            </div>

            <div className="h-px bg-[#cbd5e1] w-full" />

            {/* Kategori Umum */}
            <div className="flex flex-col gap-2">
              <span className="text-[12.3px] font-bold text-[#161616]">Kategori Umum</span>
              <div className="flex flex-col gap-2">
                {UMUM_CATEGORIES.map((opt) => (
                  <label key={opt.value} className="flex items-center justify-between cursor-pointer group">
                    <span className="text-[12.3px] font-extralight text-[#161616] group-hover:text-blue-600 transition-colors">
                      {opt.label}
                    </span>
                    <input
                      type="checkbox"
                      checked={selectedCategories.has(opt.value)}
                      onChange={() => { setActiveSegment("all"); toggleCategory(opt.value); }}
                      className="w-[21px] h-[21px] rounded-[7px] border-[#16558f] text-[#16558f] focus:ring-[#16558f]"
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="h-px bg-[#cbd5e1] w-full" />

            {/* Kategori Green */}
            <div className="flex flex-col gap-2">
              <span className="text-[12.3px] font-bold text-green-700">🌿 Green & Volunteer</span>
              <div className="flex flex-col gap-2">
                {GREEN_CATEGORIES.map((opt) => (
                  <label key={opt.value} className="flex items-center justify-between cursor-pointer group">
                    <span className="text-[12.3px] font-extralight text-[#161616] group-hover:text-green-600 transition-colors">
                      {opt.label}
                    </span>
                    <input
                      type="checkbox"
                      checked={selectedCategories.has(opt.value)}
                      onChange={() => { setActiveSegment("all"); toggleCategory(opt.value); }}
                      className="w-[21px] h-[21px] rounded-[7px] border-green-600 text-green-600 focus:ring-green-500"
                    />
                  </label>
                ))}
              </div>
            </div>

          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Year and Month Navigation */}
          <section className="flex flex-col gap-3.5">
            <div className="flex items-center gap-2">
              <h1 className="text-[21px] font-bold text-[#161616]">{selectedYear}</h1>
              <div className="flex items-center">
                <button onClick={() => setSelectedYear((y) => y - 1)} className="p-1 rounded-full hover:bg-gray-100" aria-label="Tahun sebelumnya">
                  <ChevronLeft className="w-[17.5px] h-[17.5px] text-[#16558f]" />
                </button>
                <button onClick={() => setSelectedYear((y) => y + 1)} className="p-1 rounded-full hover:bg-gray-100" aria-label="Tahun berikutnya">
                  <ChevronRight className="w-[17.5px] h-[17.5px] text-[#16558f]" />
                </button>
              </div>
            </div>
            <div className="flex overflow-x-auto no-scrollbar gap-1 pb-2">
              {months.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setSelectedMonth(m.value)}
                  className={`h-[32px] md:h-[42px] px-3 md:px-4 shrink-0 flex items-center justify-center rounded-[6px] border text-[10px] md:text-[12.3px] uppercase font-light transition-all shadow-sm ${
                    selectedMonth === m.value
                      ? "bg-[#16558f] border-[#16558f] text-white font-bold"
                      : "bg-[#eaf6ff] border-[#eaf6ff] text-[#131516] hover:border-[#16558f]"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </section>

          {isLoading && <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-[#2563eb] animate-spin" /></div>}
          {error && !isLoading && (
            <div className="flex flex-col items-center py-12 gap-3">
              <AlertCircle className="w-10 h-10 text-red-400" />
              <p className="text-red-500 text-center">{error}</p>
            </div>
          )}
          {!isLoading && !error && events.length === 0 && (
            <div className="flex flex-col items-center py-16 gap-3">
              <p className="text-gray-400 text-center">
                Tidak ada acara pada {months.find((m) => m.value === selectedMonth)?.label} {selectedYear}.
              </p>
            </div>
          )}

          {!isLoading && !error && events.length > 0 && (
            <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 justify-items-center">
              {events.slice((page - 1) * EVENTS_PER_PAGE, page * EVENTS_PER_PAGE).map((event) => (
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
                />
              ))}
            </section>
          )}

          {!isLoading && totalPages > 1 && (
            <div className="flex flex-row items-center justify-between mt-10 gap-2">
              <button 
                onClick={() => setPage((p) => Math.max(1, p - 1))} 
                disabled={page <= 1} 
                className="flex-1 md:flex-none md:px-8 py-2 border border-[#2563eb] text-[#2563eb] text-[13px] md:text-[14px] font-bold rounded-lg flex items-center justify-center gap-1 md:gap-2 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> <span>Sebelumnya</span>
              </button>
              
              <span className="text-[12px] md:text-[14px] text-gray-500 font-medium whitespace-nowrap px-2">
                {page} / {totalPages}
              </span>
              
              <button 
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))} 
                disabled={page >= totalPages} 
                className="flex-1 md:flex-none md:px-8 py-2 border border-[#2563eb] text-[#2563eb] text-[13px] md:text-[14px] font-bold rounded-lg flex items-center justify-center gap-1 md:gap-2 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <span>Selanjutnya</span> <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
      </main>
      <Footer />
    </div>
  );
}

export default function CalendarPage() {
  return <Suspense fallback={null}><CalendarContent /></Suspense>;
}
