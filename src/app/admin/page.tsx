"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/organism/Header";
import Footer from "@/components/organism/Footer";
import { createClient } from "@/lib/supabase/client";
import { uploadImage } from "@/lib/imageUpload";
import {
  LayoutDashboard, Users, Calendar, Bookmark, Clock, Plus,
  CheckCircle2, XCircle, LogOut, AlertCircle, Loader2, ShieldCheck,
  Trash2, Eye, EyeOff, X, MapPin, Pencil, BarChart3, Save
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar } from 'recharts';

interface AdminStats {
  totalEvents: number;
  totalUsers: number;
  pendingEvents: number;
  totalBookmarks: number;
}

interface EventRow {
  id: string;
  title: string;
  category: string;
  is_published: boolean;
  is_verified: boolean;
  is_free: boolean;
  price: number;
  start_date: string | null;
  deadline: string | null;
  location: string | null;
  created_at: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  Lomba: "bg-[#2563eb] text-white",
  Seminar: "bg-purple-600 text-white",
  Workshop: "bg-orange-600 text-white",
  Beasiswa: "bg-green-600 text-white",
  Magang: "bg-teal-600 text-white",
  Webinar: "bg-indigo-600 text-white",
  Volunteer: "bg-lime-600 text-white",
  Greenvity: "bg-emerald-700 text-white",
  Lainnya: "bg-gray-600 text-white",
};

const ALL_CATEGORIES = ["Lomba","Seminar","Workshop","Beasiswa","Magang","Webinar","Volunteer","Greenvity","Lainnya"];

const EMPTY_FORM = {
  title: "", category: "Lomba", location: "", is_online: false,
  is_free: true, price: 0, start_date: "", deadline: "",
  event_url: "", description: "", image_url: "",
  organizer_name: "", organizer_logo_url: "",
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [chartsData, setChartsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "events" | "analytics">("overview");
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  // Add/Edit event modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [addForm, setAddForm] = useState(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [addError, setAddError] = useState("");
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingPoster, setIsUploadingPoster] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'poster') => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setAddError("File harus berupa gambar");
      return;
    }
    
    setAddError("");
    if (type === 'logo') setIsUploadingLogo(true);
    else setIsUploadingPoster(true);

    const result = await uploadImage(file, type === 'logo' ? "organizers" : "events");
    
    if (result.error) {
      setAddError(result.error);
    } else {
      if (type === 'logo') setAddForm(f => ({...f, organizer_logo_url: result.url ?? ""}));
      else setAddForm(f => ({...f, image_url: result.url ?? ""}));
    }
    
    if (type === 'logo') setIsUploadingLogo(false);
    else setIsUploadingPoster(false);
    e.target.value = '';
  };

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const ensureUrlProtocol = (url: string) => {
    if (!url || !url.trim()) return "";
    const t = url.trim();
    if (t.startsWith("data:image/")) return t; // allow base64
    if (/^https?:\/\//i.test(t)) return t;
    return `https://${t}`;
  };

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setAdminEmail(user?.email ?? "Guest Admin");

      try {
        const [statsRes, eventsRes] = await Promise.all([
          fetch("/api/admin/stats"),
          fetch("/api/admin/events"),
        ]);

        if (statsRes.ok) { 
          const j = await statsRes.json(); 
          setStats(j.stats); 
          setChartsData(j.charts);
        }
        if (eventsRes.ok) { 
          const j = await eventsRes.json(); 
          const loadedEvents = j.data ?? [];
          setEvents(loadedEvents); 

          // Check for edit query param
          const editEventId = searchParams.get("edit");
          if (editEventId) {
            const eventToEdit = loadedEvents.find((e: EventRow) => e.id === editEventId);
            if (eventToEdit) {
              setActiveTab("events");
              handleEditClick(eventToEdit);
            }
          }
        }
      } catch (err) {
        console.error("Gagal memuat data admin:", err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [router, searchParams]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/dashboard");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus event ini secara permanen?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/events/${id}`, { method: "DELETE" });
      if (res.ok) {
        setEvents(ev => ev.filter(e => e.id !== id));
      } else {
        const json = await res.json().catch(() => ({}));
        alert(json.error || "Gagal menghapus event");
      }
    } catch { alert("Gagal terhubung"); }
    setDeletingId(null);
  };

  const handleTogglePublish = async (event: EventRow) => {
    try {
      const res = await fetch(`/api/admin/events/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_published: !event.is_published }),
      });
      if (res.ok) {
        setEvents(ev => ev.map(e => e.id === event.id ? { ...e, is_published: !e.is_published } : e));
      } else {
        const json = await res.json().catch(() => ({}));
        alert(json.error || "Gagal memperbarui event");
      }
    } catch { alert("Gagal terhubung"); }
  };

  const handleEditClick = async (event: EventRow) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/events/${event.id}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      
      const d = json.data;
      setAddForm({
        title: d.title || "",
        category: d.category || "Lomba",
        location: d.location || "",
        is_online: d.is_online || false,
        is_free: d.is_free || false,
        price: d.price || 0,
        start_date: d.start_date ? d.start_date.split('T')[0] : "",
        deadline: d.deadline ? d.deadline.split('T')[0] : "",
        event_url: d.event_url || "",
        description: d.description || "",
        image_url: d.image_url || "",
        organizer_name: d.organizers?.org_name || "",
        organizer_logo_url: d.organizers?.org_logo_url || "",
      });
      setEditId(event.id);
      setIsEditing(true);
      setShowAddModal(true);
    } catch (err: any) {
      alert("Gagal mengambil detail event: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.title.trim()) { setAddError("Judul wajib diisi"); return; }
    setIsSaving(true);
    setAddError("");
    try {
      const url = isEditing ? `/api/admin/events/${editId}` : "/api/admin/events";
      const method = isEditing ? "PATCH" : "POST";
      
      const payload = { 
        ...addForm, 
        price: addForm.is_free ? 0 : addForm.price,
        event_url: ensureUrlProtocol(addForm.event_url),
        image_url: ensureUrlProtocol(addForm.image_url),
        organizer_logo_url: ensureUrlProtocol(addForm.organizer_logo_url)
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) { setAddError(json.error || "Gagal menyimpan event"); setIsSaving(false); return; }
      
      // Refresh list
      const listRes = await fetch("/api/admin/events");
      if (listRes.ok) { const j = await listRes.json(); setEvents(j.data ?? []); }
      
      setShowAddModal(false);
      setAddForm(EMPTY_FORM);
      setIsEditing(false);
      setEditId(null);
    } catch { setAddError("Gagal terhubung ke server"); }
    setIsSaving(false);
  };

  const setF = (field: keyof typeof EMPTY_FORM) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setAddForm(f => ({ ...f, [field]: e.target.value }));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-[#2563eb] animate-spin" />
          <p className="text-gray-500 font-medium">Memasuki Ruang Admin...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center px-4">
          <AlertCircle className="w-16 h-12 text-red-500" />
          <p className="text-gray-900 font-bold text-xl">{error}</p>
          <Link href="/dashboard" className="px-6 py-2 bg-[#2563eb] text-white rounded-full font-bold">Kembali</Link>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: "Total Event",     value: stats?.totalEvents   ?? 0, icon: Calendar, color: "text-white", bg: "bg-[#2563eb]"   },
    { label: "Total Pengguna",  value: stats?.totalUsers    ?? 0, icon: Users,    color: "text-white", bg: "bg-[#16c475]"  },
    { label: "Event Pending",   value: stats?.pendingEvents ?? 0, icon: Clock,    color: "text-white", bg: "bg-[#f59e0b]" },
    { label: "Total Bookmark",  value: stats?.totalBookmarks?? 0, icon: Bookmark, color: "text-white", bg: "bg-purple-600" },
  ];

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

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 md:px-10 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm font-['Inter',sans-serif]">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 relative flex items-center justify-center">
            <Image 
              src="/Logo_Icon.png" 
              alt="Upvance Logo" 
              fill 
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="text-[#161616] font-bold text-[18px]">Panel Admin</h1>
            <p className="text-[#6c6c6c] text-[12px] font-medium">{adminEmail}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 px-6 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-full text-[13px] font-bold transition-all shadow-sm">
            <LayoutDashboard className="w-4 h-4 text-[#2563eb]" /> Lihat Situs
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-2 px-6 py-2 bg-[#ef4444] text-white hover:bg-red-700 rounded-full text-[13px] font-bold transition-all shadow-md shadow-red-100">
            <LogOut className="w-4 h-4" /> Keluar
          </button>
        </div>
      </header>

      <main className="p-6 md:p-10 max-w-[1280px] mx-auto relative z-10">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mb-8 bg-gray-200/50 p-1.5 rounded-[15px] w-fit">
          {(["overview", "events", "analytics"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-2.5 rounded-[12px] text-[14px] font-bold transition-all ${
                activeTab === tab ? "bg-white text-[#2563eb] shadow-md" : "text-[#6c6c6c] hover:text-[#161616]"
              }`}
            >
              {tab === "overview" ? "Ringkasan" : tab === "events" ? "Kelola Event" : "Analitik"}
            </button>
          ))}
        </div>

        {/* ─── OVERVIEW TAB ─── */}
        {activeTab === "overview" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
              <h2 className="text-[#161616] text-[28px] font-bold tracking-tight">Selamat Datang, Admin!</h2>
              <p className="text-[#6c6c6c] text-[16px] font-medium">Berikut adalah perkembangan platform Upvance hari ini.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {statCards.map((card) => (
                <div key={card.label} className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className={`w-12 h-12 ${card.bg} rounded-2xl flex items-center justify-center mb-4`}>
                    <card.icon className={`w-6 h-6 ${card.color}`} />
                  </div>
                  <div>
                    <p className="text-[#6c6c6c] text-[14px] font-semibold mb-1">{card.label}</p>
                    <p className="text-[#161616] text-[32px] font-bold leading-tight">{card.value.toLocaleString("id-ID")}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
               <h3 className="text-[#161616] text-[18px] font-bold mb-6">Aksi Cepat</h3>
               <div className="flex flex-wrap gap-4">
                  <button onClick={() => {setActiveTab("events"); setShowAddModal(true);}} className="flex items-center gap-2 px-6 py-3 bg-[#2563eb] text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
                    <Plus className="w-5 h-5" /> Tambah Event Baru
                  </button>
               </div>
            </div>
          </div>
        )}

        {/* ─── EVENTS TAB ─── */}
        {activeTab === "events" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-[#161616] text-[28px] font-bold tracking-tight">Manajemen Event</h2>
                <p className="text-[#6c6c6c] text-[16px] font-medium">{events.length} event terdaftar dalam database</p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-[#2563eb] hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-100"
              >
                <Plus className="w-5 h-5" /> Buat Event
              </button>
            </div>

            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100">
                      <th className="text-left text-[#6c6c6c] text-[12px] font-bold uppercase px-6 py-4 tracking-wider">Info Event</th>
                      <th className="text-left text-[#6c6c6c] text-[12px] font-bold uppercase px-4 py-4 tracking-wider">Kategori</th>
                      <th className="text-left text-[#6c6c6c] text-[12px] font-bold uppercase px-4 py-4 tracking-wider">Status</th>
                      <th className="text-left text-[#6c6c6c] text-[12px] font-bold uppercase px-4 py-4 tracking-wider">Deadline</th>
                      <th className="text-center text-[#6c6c6c] text-[12px] font-bold uppercase px-6 py-4 tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {events.length === 0 ? (
                      <tr><td colSpan={5} className="text-center text-[#9a9a9a] py-16 text-[15px] font-medium italic">Belum ada data event tersedia</td></tr>
                    ) : events.map((event) => (
                      <tr key={event.id} className="hover:bg-blue-50/30 transition-colors group">
                        <td className="px-6 py-5">
                          <Link href={`/events/${event.id}`} target="_blank" className="text-[#161616] text-[15px] font-bold hover:text-[#2563eb] transition-colors line-clamp-1 max-w-[280px] block mb-1">
                            {event.title}
                          </Link>
                          <div className="flex items-center gap-2 text-[#6c6c6c] text-[12px]">
                            <MapPin className="w-3 h-3 text-blue-400" />
                            <span>{event.location || "Indonesia"}</span>
                          </div>
                        </td>
                        <td className="px-4 py-5">
                          <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${CATEGORY_COLORS[event.category] ?? "bg-gray-50 text-gray-600 border-gray-200"}`}>
                            {event.category}
                          </span>
                        </td>
                        <td className="px-4 py-5">
                          <div className="flex flex-col gap-1.5">
                            {!event.is_published && (
                              <span className="inline-flex items-center justify-center gap-1.5 text-[11px] font-bold w-[100px] py-1 rounded-full text-white shadow-sm bg-[#f59e0b]">
                                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                Pending
                              </span>
                            )}
                            {event.is_verified && (
                              <span className="text-white text-[11px] font-bold flex items-center justify-center gap-1 bg-[#2563eb] w-[100px] py-1 rounded-full shadow-sm">
                                <CheckCircle2 className="w-3.5 h-3.5 text-white" /> Verified
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-5 text-[#6c6c6c] text-[13px] font-semibold">
                          {event.deadline ? new Date(event.deadline).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleTogglePublish(event)}
                              title={event.is_published ? "Unpublish" : "Publish"}
                              className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all shadow-sm ${
                                event.is_published 
                                  ? "bg-[#f59e0b] text-white hover:bg-orange-600" 
                                  : "bg-[#16c475] text-white hover:bg-green-600"
                              }`}
                            >
                              {event.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => handleEditClick(event)}
                              title="Edit event"
                              className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#2563eb] text-white hover:bg-blue-700 transition-all shadow-sm"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(event.id)}
                              disabled={deletingId === event.id}
                              title="Hapus permanen"
                              className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#ef4444] text-white hover:bg-red-700 transition-all shadow-sm disabled:opacity-50"
                            >
                              {deletingId === event.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ─── ANALYTICS TAB ─── */}
        {activeTab === "analytics" && isMounted && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <div className="mb-6">
              <h2 className="text-[#161616] text-[28px] font-bold tracking-tight">Analisis & Performa</h2>
              <p className="text-[#6c6c6c] text-[16px] font-medium">Pantau pertumbuhan pengguna dan sebaran acara Upvance.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Trend Pendaftaran Acara (Area Chart) */}
              <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm flex flex-col lg:col-span-2">
                <h3 className="text-[#161616] text-[16px] font-bold mb-6 w-full text-left">Trend Pendaftaran Acara (7 Hari Terakhir)</h3>
                <div className="w-full h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartsData?.trend || []}>
                      <defs>
                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6c6c6c', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#6c6c6c', fontSize: 12}} />
                      <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                      <Area type="monotone" dataKey="views" name="Pendaftar" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pendaftar Kategori (Pie Chart) */}
              <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm flex flex-col items-center">
                <h3 className="text-[#161616] text-[16px] font-bold mb-6 w-full text-left">Pendaftar per Kategori Acara</h3>
                <div className="w-full h-[250px]">
                  {chartsData?.kategori && chartsData.kategori.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartsData.kategori}
                          cx="50%" cy="50%" innerRadius={60} outerRadius={85}
                          dataKey="value" stroke="none"
                          label={(props: any) => `${props.name} ${((props.percent || 0) * 100).toFixed(0)}%`}
                        >
                          {chartsData.kategori.map((entry: any, index: number) => {
                            const colors = ['#2563eb', '#16c475', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e', '#84cc16', '#64748b'];
                            return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                          })}
                        </Pie>
                        <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-gray-400">Belum ada pendaftaran</div>
                  )}
                </div>
              </div>

              {/* Asal Kampus (Bar Chart) */}
              <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm flex flex-col items-center">
                <h3 className="text-[#161616] text-[16px] font-bold mb-6 w-full text-left">Top Asal Kampus Pengguna</h3>
                <div className="w-full h-[250px]">
                  {chartsData?.kampus && chartsData.kampus.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartsData.kampus} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#6c6c6c', fontSize: 11}} width={120} />
                        <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                        <Bar dataKey="value" name="Pengguna" fill="#16c475" radius={[0, 4, 4, 0]} barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-gray-400">Belum ada data kampus</div>
                  )}
                </div>
              </div>

              {/* Minat (Donut Chart) */}
              <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm flex flex-col items-center">
                <h3 className="text-[#161616] text-[16px] font-bold mb-6 w-full text-left">Proporsi Minat Pengguna (Donut Chart)</h3>
                <div className="w-full h-[250px]">
                  {chartsData?.minat && chartsData.minat.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartsData.minat}
                          cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                          dataKey="value" stroke="none"
                          label={(props: any) => `${props.name} ${((props.percent || 0) * 100).toFixed(0)}%`}
                        >
                          {chartsData.minat.map((entry: any, index: number) => {
                            const colors = ['#8b5cf6', '#ec4899', '#f43f5e', '#3b82f6', '#14b8a6', '#f59e0b', '#10b981'];
                            return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                          })}
                        </Pie>
                        <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-gray-400">Belum ada data minat</div>
                  )}
                </div>
              </div>

              {/* Semester (Pie/Bar Chart) */}
              <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm flex flex-col items-center">
                <h3 className="text-[#161616] text-[16px] font-bold mb-6 w-full text-left">Sebaran Semester</h3>
                <div className="w-full h-[250px]">
                  {chartsData?.semester && chartsData.semester.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartsData.semester} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6c6c6c', fontSize: 11}} dy={5} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#6c6c6c', fontSize: 11}} />
                        <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                        <Bar dataKey="value" name="Pengguna" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-gray-400">Belum ada data semester</div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}
      </main>

      <Footer />

      {/* ─── ADD/EDIT EVENT MODAL ─── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#080808]/40 backdrop-blur-sm" onClick={() => { setShowAddModal(false); setIsEditing(false); setEditId(null); setAddForm(EMPTY_FORM); }} />
          <div className="relative bg-white rounded-[32px] border border-gray-100 w-full max-w-[650px] max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200 font-['Inter',sans-serif]">
            <div className="sticky top-0 bg-white px-8 py-6 border-b border-gray-50 flex items-center justify-between z-10">
              <div>
                <h3 className="text-[#161616] font-bold text-[22px]">{isEditing ? "Edit Event" : "Tambah Event Baru"}</h3>
                <p className="text-[#6c6c6c] text-[13px] font-medium">{isEditing ? "Perbarui detail acara yang sudah ada." : "Lengkapi formulir untuk mempublikasikan acara."}</p>
              </div>
              <button onClick={() => { setShowAddModal(false); setIsEditing(false); setEditId(null); setAddError(""); setAddForm(EMPTY_FORM); }} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-[#6c6c6c] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-8 flex flex-col gap-6">
              {addError && (
                <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[13px] font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> {addError}
                </div>
              )}

              <Field label="Judul Event *">
                <input type="text" value={addForm.title} onChange={setF("title")} placeholder="Contoh: Kompetisi Bisnis Nasional 2024" required className={uInput} />
              </Field>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Kategori *">
                  <select value={addForm.category} onChange={setF("category")} className={uInput}>
                    {ALL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Tipe Pelaksanaan *">
                  <select 
                    value={!addForm.is_online ? "offline" : (addForm.location === "Online" ? "online" : "hybrid")} 
                    onChange={e => {
                      const val = e.target.value;
                      if (val === "offline") setAddForm(f => ({ ...f, is_online: false, location: f.location === "Online" ? "" : f.location }));
                      else if (val === "online") setAddForm(f => ({ ...f, is_online: true, location: "Online" }));
                      else if (val === "hybrid") setAddForm(f => ({ ...f, is_online: true, location: f.location === "Online" ? "" : f.location }));
                    }} 
                    className={uInput}
                  >
                    <option value="offline">Offline (Tatap Muka)</option>
                    <option value="online">Online (Daring)</option>
                    <option value="hybrid">Hybrid (Offline & Online)</option>
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(!addForm.is_online || (addForm.is_online && addForm.location !== "Online")) && (
                  <Field label="Lokasi *">
                    <input type="text" value={addForm.location} onChange={setF("location")} placeholder="Contoh: Jakarta Selatan" required className={uInput} />
                  </Field>
                )}
                <Field label="Tipe Biaya *">
                  <select value={addForm.is_free ? "free" : "paid"} onChange={e => setAddForm(f => ({ ...f, is_free: e.target.value === "free", price: e.target.value === "free" ? 0 : f.price }))} className={uInput}>
                    <option value="free">Gratis (Tanpa Biaya)</option>
                    <option value="paid">Berbayar</option>
                  </select>
                </Field>
              </div>

              {!addForm.is_free && (
                <Field label="Biaya Pendaftaran (Rp) *">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-[14px]">Rp</span>
                    <input type="number" value={addForm.price} onChange={e => setAddForm(f => ({ ...f, price: parseInt(e.target.value) || 0 }))} min={0} required={!addForm.is_free} className={`${uInput} pl-11`} />
                  </div>
                </Field>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Tanggal Mulai">
                  <input type="date" value={addForm.start_date} onChange={setF("start_date")} className={uInput} />
                </Field>
                <Field label="Deadline Pendaftaran">
                  <input type="date" value={addForm.deadline} onChange={setF("deadline")} className={uInput} />
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Nama Penyelenggara (Opsional)">
                  <input type="text" value={addForm.organizer_name} onChange={setF("organizer_name")} placeholder="Contoh: BEM Universitas" className={uInput} />
                </Field>
                <Field label="Logo Penyelenggara">
                  <div className="flex items-center gap-2">
                    <input type="url" value={addForm.organizer_logo_url} onChange={setF("organizer_logo_url")} placeholder="https://..." className={uInput} />
                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'logo')} className="hidden" id="upload-logo" />
                    <label htmlFor="upload-logo" className="h-[52px] px-6 bg-gray-100 hover:bg-gray-200 text-[#161616] font-bold rounded-xl flex items-center justify-center cursor-pointer transition-all whitespace-nowrap">
                      {isUploadingLogo ? <Loader2 className="w-5 h-5 animate-spin" /> : "Upload"}
                    </label>
                  </div>
                </Field>
              </div>

              <Field label="Link Pendaftaran (URL)">
                <input type="url" value={addForm.event_url} onChange={setF("event_url")} placeholder="https://uphance.com/daftar/..." className={uInput} />
              </Field>

              <Field label="Poster Acara">
                <div className="flex items-center gap-2">
                  <input type="url" value={addForm.image_url} onChange={setF("image_url")} placeholder="https://..." className={uInput} />
                  <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'poster')} className="hidden" id="upload-poster" />
                  <label htmlFor="upload-poster" className="h-[52px] px-6 bg-gray-100 hover:bg-gray-200 text-[#161616] font-bold rounded-xl flex items-center justify-center cursor-pointer transition-all whitespace-nowrap">
                    {isUploadingPoster ? <Loader2 className="w-5 h-5 animate-spin" /> : "Upload"}
                  </label>
                </div>
              </Field>

              <Field label="Deskripsi Acara">
                <textarea value={addForm.description} onChange={setF("description")} placeholder="Jelaskan detail acara secara menarik..." rows={4} className={`${uInput} resize-none h-auto py-3`} />
              </Field>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => { setShowAddModal(false); setIsEditing(false); setEditId(null); setAddForm(EMPTY_FORM); }} className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-[#6c6c6c] font-bold rounded-2xl transition-all">
                  Batalkan
                </button>
                <button type="submit" disabled={isSaving} className="flex-[2] py-4 bg-[#2563eb] hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 disabled:opacity-60">
                  {isSaving ? <><Loader2 className="w-5 h-5 animate-spin" /> Menyimpan...</> : <>{isEditing ? <><Save className="w-5 h-5" /> Simpan Perubahan</> : <><Plus className="w-5 h-5" /> Publikasikan Event</>}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const uInput = "w-full h-[52px] px-4 bg-white border border-gray-200 rounded-xl text-[#161616] text-[14px] font-medium focus:outline-none focus:ring-2 focus:ring-[#2563eb]/10 focus:border-[#2563eb] transition-all placeholder:text-gray-400";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[13px] font-bold text-[#161616] px-1">{label}</label>
      {children}
    </div>
  );
}
