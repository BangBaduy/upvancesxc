"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/organism/Footer";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Bookmark, Calendar, MapPin, ExternalLink,
  Trash2, Loader2, Search, Tag, Filter, BookmarkX
} from "lucide-react";

interface BookmarkEvent {
  id: string;
  title: string;
  slug?: string;
  category: string;
  location?: string | null;
  is_online: boolean;
  is_free: boolean;
  price?: number;
  start_date?: string | null;
  deadline?: string | null;
  image_url?: string | null;
  event_url?: string | null;
  is_published: boolean;
}

interface BookmarkItem {
  id: string;
  created_at: string;
  event: BookmarkEvent;
}

const CATEGORY_COLORS: Record<string, string> = {
  Lomba:     "bg-blue-100 text-blue-700 border-blue-200",
  Seminar:   "bg-purple-100 text-purple-700 border-purple-200",
  Workshop:  "bg-orange-100 text-orange-700 border-orange-200",
  Beasiswa:  "bg-green-100 text-green-700 border-green-200",
  Magang:    "bg-teal-100 text-teal-700 border-teal-200",
  Webinar:   "bg-indigo-100 text-indigo-700 border-indigo-200",
  Volunteer: "bg-lime-100 text-lime-700 border-lime-200",
  Greenvity: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Lainnya:   "bg-gray-100 text-gray-600 border-gray-200",
};

function formatDate(dateStr?: string | null) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function isDeadlineSoon(deadline?: string | null) {
  if (!deadline) return false;
  const d = new Date(deadline);
  const now = new Date();
  const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= 7;
}

function isDeadlinePassed(deadline?: string | null) {
  if (!deadline) return false;
  return new Date(deadline) < new Date();
}

export default function BookmarksPage() {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [filtered, setFiltered] = useState<BookmarkItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.replace("/login?next=/bookmarks"); return; }
      fetchBookmarks();
    });
  }, [router]);

  const fetchBookmarks = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/bookmarks");
      const json = await res.json();
      const items: BookmarkItem[] = (json.data ?? []).filter((b: BookmarkItem) => !!b.event);
      setBookmarks(items);
      setFiltered(items);
    } catch {
      setBookmarks([]);
      setFiltered([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter effect
  useEffect(() => {
    let result = bookmarks;
    if (activeCategory !== "Semua") {
      result = result.filter(b => b.event.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(b =>
        b.event.title.toLowerCase().includes(q) ||
        b.event.category.toLowerCase().includes(q) ||
        (b.event.location ?? "").toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [bookmarks, activeCategory, search]);

  const handleRemove = async (bookmarkId: string, eventId: string) => {
    setRemovingId(bookmarkId);
    try {
      await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id: eventId }),
      });
      setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
    } catch {}
    setRemovingId(null);
  };

  // Kategori unik dari bookmark user
  const categories = ["Semua", ...Array.from(new Set(bookmarks.map(b => b.event.category)))];

  return (
    <div className="min-h-screen w-full relative font-['Inter',sans-serif] overflow-x-hidden">
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

      <main className="pt-[85px] pb-16 px-4 max-w-[1100px] mx-auto relative z-10">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6 mt-4">
          <div>
            <h1 className="text-[26px] font-bold text-[#161616] flex items-center gap-2.5">
              <Bookmark className="w-6 h-6 text-[#2563eb]" />
              Bookmark Saya
            </h1>
            <p className="text-gray-500 text-[14px] mt-1">
              {bookmarks.length} event tersimpan
            </p>
          </div>
          <Link href="/dashboard" className="text-[13px] text-[#2563eb] hover:underline font-semibold">
            + Temukan Event Lain
          </Link>
        </div>

        {/* Search + Filter */}
        <div className="bg-white rounded-[16px] border border-gray-100 shadow-sm p-4 mb-6 flex flex-col gap-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari event yang disimpan..."
              className="w-full h-[42px] pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-[10px] text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30 focus:border-[#2563eb] transition-all"
            />
          </div>

          {/* Category filter pills */}
          {categories.length > 1 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-semibold border transition-all ${
                    activeCategory === cat
                      ? "bg-[#2563eb] text-white border-[#2563eb]"
                      : "bg-white text-gray-600 border-gray-200 hover:border-[#2563eb] hover:text-[#2563eb]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#2563eb] animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
              <BookmarkX className="w-8 h-8 text-[#2563eb]" />
            </div>
            <div className="text-center">
              <p className="text-[#161616] font-bold text-[18px]">
                {bookmarks.length === 0 ? "Belum ada bookmark" : "Tidak ditemukan"}
              </p>
              <p className="text-gray-500 text-[14px] mt-1">
                {bookmarks.length === 0
                  ? "Simpan event menarik dengan klik ikon bookmark"
                  : "Coba ubah kata kunci atau filter"}
              </p>
            </div>
            {bookmarks.length === 0 && (
              <Link href="/dashboard" className="px-6 py-2.5 bg-[#2563eb] text-white font-bold text-[14px] rounded-[10px] hover:bg-blue-700 transition-colors">
                Jelajahi Event
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(bookmark => {
              const ev = bookmark.event;
              const deadlinePassed = isDeadlinePassed(ev.deadline);
              const deadlineSoon = isDeadlineSoon(ev.deadline);
              const catColor = CATEGORY_COLORS[ev.category] ?? CATEGORY_COLORS.Lainnya;

              return (
                <div
                  key={bookmark.id}
                  className={`bg-white rounded-[16px] border shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md hover:-translate-y-0.5 ${
                    deadlinePassed ? "opacity-70 border-gray-200" : "border-gray-100"
                  }`}
                >
                  {/* Image */}
                  <div className="relative h-[160px] bg-gradient-to-br from-blue-50 to-indigo-100 shrink-0">
                    {ev.image_url ? (
                      <Image
                        src={ev.image_url}
                        alt={ev.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Calendar className="w-10 h-10 text-blue-200" />
                      </div>
                    )}

                    {/* Category badge */}
                    <span className={`absolute top-3 left-3 text-[11px] font-bold px-2.5 py-1 rounded-full border ${catColor}`}>
                      {ev.category}
                    </span>

                    {/* Status badges */}
                    <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
                      {ev.is_free && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500 text-white">
                          Gratis
                        </span>
                      )}
                      {deadlinePassed && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-500 text-white">
                          Berakhir
                        </span>
                      )}
                      {!deadlinePassed && deadlineSoon && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500 text-white">
                          Segera Berakhir
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 flex flex-col gap-2 flex-1">
                    <h3 className="font-bold text-[15px] text-[#161616] line-clamp-2 leading-snug">
                      {ev.title}
                    </h3>

                    <div className="flex flex-col gap-1.5 text-[12px] text-gray-500">
                      {(ev.location || ev.is_online) && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                          <span className="truncate">{ev.is_online ? "Online" : ev.location}</span>
                        </div>
                      )}
                      {ev.deadline && (
                        <div className={`flex items-center gap-1.5 ${deadlineSoon && !deadlinePassed ? "text-orange-600 font-semibold" : ""}`}>
                          <Calendar className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                          <span>Deadline: {formatDate(ev.deadline)}</span>
                        </div>
                      )}
                      {ev.start_date && (
                        <div className="flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                          <span>Mulai: {formatDate(ev.start_date)}</span>
                        </div>
                      )}
                    </div>

                    {/* Price */}
                    {!ev.is_free && ev.price && ev.price > 0 && (
                      <p className="text-[13px] font-bold text-[#2563eb]">
                        Rp {ev.price.toLocaleString("id-ID")}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="px-4 pb-4 flex gap-2 mt-auto">
                    <Link
                      href={`/events/${ev.id}`}
                      className="flex-1 h-[36px] flex items-center justify-center gap-1.5 bg-[#2563eb] hover:bg-blue-700 text-white text-[12px] font-bold rounded-[8px] transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Lihat Detail
                    </Link>
                    <button
                      onClick={() => handleRemove(bookmark.id, ev.id)}
                      disabled={removingId === bookmark.id}
                      title="Hapus bookmark"
                      className="w-[36px] h-[36px] flex items-center justify-center rounded-[8px] border border-red-200 bg-red-50 hover:bg-red-100 text-red-500 transition-colors disabled:opacity-50 shrink-0"
                    >
                      {removingId === bookmark.id
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <Trash2 className="w-3.5 h-3.5" />
                      }
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
