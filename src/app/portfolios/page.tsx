"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/organism/Footer";
import { createClient } from "@/lib/supabase/client";
import { FileText, Plus, Search, Loader2, X, Link as LinkIcon, ExternalLink, Trash2, Globe } from "lucide-react";

export default function PortfoliosPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPortfolio, setNewPortfolio] = useState({ title: "", url: "" });

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        const [portRes, profRes] = await Promise.all([
          fetch('/api/user/portfolios'),
          user ? supabase.from('profiles').select('portfolio_url').eq('id', user.id).single() : Promise.resolve({ data: null })
        ]);

        const portJson = await portRes.json();
        if (portRes.ok && portJson.data) {
          setPortfolios(portJson.data);
        }
        if (profRes.data) {
          setProfile(profRes.data);
        }
      } catch (err) {
        console.error("Failed to load Data");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPortfolio.title || !newPortfolio.url) return;
    try {
      const res = await fetch('/api/user/portfolios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPortfolio)
      });
      const json = await res.json();
      if (res.ok && json.data) {
        setPortfolios([json.data, ...portfolios]);
        setNewPortfolio({ title: "", url: "" });
        setIsModalOpen(false);
      } else {
        alert(json.error || "Gagal menyimpan Portofolio");
      }
    } catch (err) {
      alert("Gagal terhubung ke server");
    }
  };

  const removePortfolio = async (id: number) => {
    if (!confirm("Hapus Portofolio ini?")) return;
    try {
      const res = await fetch(`/api/user/portfolios?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPortfolios(portfolios.filter(c => c.id !== id));
      } else {
        alert("Gagal menghapus Portofolio");
      }
    } catch {
      alert("Gagal terhubung ke server");
    }
  };

  return (
    <div className="min-h-screen w-full font-['Inter',sans-serif] relative overflow-x-hidden">
      
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

      <main className="pt-[100px] md:pt-[110px] pb-20 px-4 md:px-10 max-w-[1280px] mx-auto relative z-10">
        <div className="flex flex-col gap-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-[24px] md:text-[32px] font-bold text-[#212121]">Portofolio Saya</h1>
              <p className="text-[#6c6c6c] text-[14px] md:text-[16px]">Kelola dan tampilkan karya terbaikmu via link eksternal.</p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#15c475] text-white font-bold rounded-full hover:bg-green-600 transition-all shadow-md"
            >
              <Plus className="w-5 h-5" />
              <span>Tambah Portofolio</span>
            </button>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 text-[#15c475] animate-spin" />
              <p className="text-[#15c475] font-medium">Memuat portofolio...</p>
            </div>
          ) : (
            <div className="flex flex-col gap-10">
              {/* Main Profile Portfolio (Featured) */}
              {profile?.portfolio_url && (
                <div className="bg-gradient-to-br from-[#15c475] to-[#0ea05d] p-8 rounded-[32px] text-white shadow-xl shadow-green-100 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-white/20 rounded-[22px] backdrop-blur-md flex items-center justify-center shrink-0">
                      <Globe className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-[20px] md:text-[24px] font-bold">Portfolio / Website Utama</h2>
                      <p className="text-white/80 text-[14px] md:text-[15px] max-w-[400px]">Ini adalah link utama yang terhubung dengan profil publik kamu.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <a 
                      href={profile.portfolio_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-white text-[#15c475] font-bold rounded-2xl hover:bg-gray-50 transition-all shadow-lg"
                    >
                      <ExternalLink className="w-5 h-5" />
                      Kunjungi Situs
                    </a>
                    <Link 
                      href="/settings/profile" 
                      className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl border border-white/30 transition-all"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              )}

              {/* Sub-Portfolios Grid */}
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#15c475]" />
                  <h3 className="text-[18px] font-bold text-[#212121]">Koleksi Link Portofolio ({portfolios.length})</h3>
                </div>

                {portfolios.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {portfolios.map((p) => (
                      <div key={p.id} className="bg-white/80 backdrop-blur-sm p-6 rounded-[24px] border border-gray-100 shadow-sm flex flex-col justify-between group">
                        <div>
                          <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mb-4">
                            <LinkIcon className="w-6 h-6 text-[#15c475]" />
                          </div>
                          <h3 className="text-[18px] font-bold text-[#212121] mb-1 truncate">{p.title}</h3>
                          <p className="text-[12px] text-gray-500 truncate mb-4">{p.url}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <a 
                            href={p.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#15c475]/10 text-[#15c475] text-[13px] font-bold rounded-xl hover:bg-[#15c475] hover:text-white transition-all"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Buka Link
                          </a>
                          <button 
                            onClick={() => removePortfolio(p.id)}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : !profile?.portfolio_url ? (
                  <div className="flex flex-col items-center justify-center py-20 bg-white/50 backdrop-blur-sm rounded-[32px] border border-dashed border-gray-300">
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                      <FileText className="w-8 h-8 text-[#15c475]" />
                    </div>
                    <h3 className="text-[18px] font-bold text-[#212121]">Belum Ada Portofolio</h3>
                    <p className="text-[#6c6c6c] text-center max-w-[350px] mt-2">
                      Simpan link hasil karyamu, proyek, atau pencapaian untuk membangun profil profesional.
                    </p>
                    <button 
                      onClick={() => setIsModalOpen(true)}
                      className="mt-6 px-8 py-2 bg-[#15c475] text-white font-bold rounded-full hover:bg-green-600 transition-all"
                    >
                      Mulai Tambah
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal Add Link */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white w-full max-w-[450px] rounded-[30px] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute right-6 top-6 p-2 hover:bg-gray-100 rounded-full transition-all"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
            
            <h2 className="text-[22px] font-bold text-[#212121] mb-2">Tambah Portofolio</h2>
            <p className="text-[14px] text-gray-500 mb-6">Masukkan link hasil karyamu (Drive, Behance, GitHub, dll).</p>
            
            <form onSubmit={handleAdd} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-gray-700">Judul Karya</label>
                <input 
                  autoFocus
                  required
                  type="text" 
                  placeholder="Contoh: Desain UI App Bank"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#15c475]/30 focus:border-[#15c475] transition-all text-gray-900"
                  value={newPortfolio.title}
                  onChange={e => setNewPortfolio({...newPortfolio, title: e.target.value})}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-gray-700">URL Link</label>
                <input 
                  required
                  type="url" 
                  placeholder="https://..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#15c475]/30 focus:border-[#15c475] transition-all text-gray-900"
                  value={newPortfolio.url}
                  onChange={e => setNewPortfolio({...newPortfolio, url: e.target.value})}
                />
              </div>
              <button 
                type="submit"
                className="mt-4 w-full h-[48px] bg-[#15c475] text-white font-bold rounded-xl hover:bg-green-600 transition-all shadow-lg shadow-green-200"
              >
                Simpan Portofolio
              </button>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
