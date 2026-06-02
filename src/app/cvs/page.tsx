"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/organism/Header";
import Footer from "@/components/organism/Footer";
import { GraduationCap, Plus, FileText, Loader2, Download, X, Link as LinkIcon, ExternalLink, Trash2 } from "lucide-react";

export default function CVsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [cvs, setCvs] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCv, setNewCv] = useState({ title: "", url: "" });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCv.title || !newCv.url) return;
    setCvs([...cvs, { ...newCv, id: Date.now() }]);
    setNewCv({ title: "", url: "" });
    setIsModalOpen(false);
  };

  const removeCv = (id: number) => {
    setCvs(cvs.filter(c => c.id !== id));
  };

  return (
    <div className="min-h-screen w-full font-['Inter',sans-serif] relative overflow-x-hidden">
      <Header />
      
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
              <h1 className="text-[24px] md:text-[32px] font-bold text-[#212121]">CV Saya</h1>
              <p className="text-[#6c6c6c] text-[14px] md:text-[16px]">Simpan link CV terbaikmu untuk melamar acara.</p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#2563eb] text-white font-bold rounded-full hover:bg-blue-700 transition-all shadow-md"
            >
              <Plus className="w-5 h-5" />
              <span>Tambah Link CV</span>
            </button>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 text-[#2563eb] animate-spin" />
              <p className="text-[#2563eb] font-medium">Memuat CV...</p>
            </div>
          ) : cvs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cvs.map((c) => (
                <div key={c.id} className="bg-white/80 backdrop-blur-sm p-6 rounded-[24px] border border-gray-100 shadow-sm flex flex-col justify-between group">
                  <div>
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                      <FileText className="w-6 h-6 text-[#2563eb]" />
                    </div>
                    <h3 className="text-[18px] font-bold text-[#212121] mb-1 truncate">{c.title}</h3>
                    <p className="text-[12px] text-gray-500 truncate mb-4">{c.url}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a 
                      href={c.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#2563eb]/10 text-[#2563eb] text-[13px] font-bold rounded-xl hover:bg-[#2563eb] hover:text-white transition-all"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Buka CV
                    </a>
                    <button 
                      onClick={() => removeCv(c.id)}
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-white/50 backdrop-blur-sm rounded-[32px] border border-dashed border-gray-300">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <GraduationCap className="w-8 h-8 text-[#2563eb]" />
              </div>
              <h3 className="text-[18px] font-bold text-[#212121]">Belum Ada CV Tersimpan</h3>
              <p className="text-[#6c6c6c] text-center max-w-[350px] mt-2">
                Simpan link CV profesionalmu (Google Drive, LinkedIn, dll) untuk mempermudah pendaftaran.
              </p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="mt-6 px-8 py-2 bg-[#2563eb] text-white font-bold rounded-full hover:bg-blue-700 transition-all"
              >
                Mulai Tambah
              </button>
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
            
            <h2 className="text-[22px] font-bold text-[#212121] mb-2">Tambah Link CV</h2>
            <p className="text-[14px] text-gray-500 mb-6">Masukkan link CV yang sudah kamu simpan di cloud.</p>
            
            <form onSubmit={handleAdd} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-gray-700">Nama CV</label>
                <input 
                  autoFocus
                  required
                  type="text" 
                  placeholder="Contoh: CV ATS 2024"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30 focus:border-[#2563eb] transition-all text-gray-900"
                  value={newCv.title}
                  onChange={e => setNewCv({...newCv, title: e.target.value})}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-gray-700">URL Link</label>
                <input 
                  required
                  type="url" 
                  placeholder="https://drive.google.com/..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30 focus:border-[#2563eb] transition-all text-gray-900"
                  value={newCv.url}
                  onChange={e => setNewCv({...newCv, url: e.target.value})}
                />
              </div>
              <button 
                type="submit"
                className="mt-4 w-full h-[48px] bg-[#2563eb] text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
              >
                Simpan Link CV
              </button>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
