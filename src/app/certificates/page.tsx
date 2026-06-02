"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/organism/Footer";
import { Award, Search, Download, ExternalLink, Loader2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function CertificatesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [certificates, setCertificates] = useState<any[]>([]);

  useEffect(() => {
    async function loadCerts() {
      try {
        const res = await fetch('/api/user/certificates');
        const json = await res.json();
        if (res.ok && json.data) {
          setCertificates(json.data);
        }
      } catch (err) {
        console.error("Failed to load Certificates");
      } finally {
        setIsLoading(false);
      }
    }
    loadCerts();
  }, []);

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
              <h1 className="text-[24px] md:text-[32px] font-bold text-[#212121]">Sertifikat Saya</h1>
              <p className="text-[#6c6c6c] text-[14px] md:text-[16px]">Lihat dan unduh sertifikat dari acara yang telah kamu selesaikan.</p>
            </div>
            <div className="relative w-full md:w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Cari sertifikat..." 
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#2563eb] transition-all"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 text-[#2563eb] animate-spin" />
              <p className="text-[#2563eb] font-medium">Memuat sertifikat...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-white/50 backdrop-blur-sm rounded-[32px] border border-dashed border-gray-300">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <Award className="w-8 h-8 text-[#2563eb]" />
              </div>
              <h3 className="text-[18px] font-bold text-[#212121]">Belum Ada Sertifikat</h3>
              <p className="text-[#6c6c6c] text-center max-w-[300px] mt-2">
                Selesaikan acara yang kamu ikuti untuk mendapatkan sertifikat resmi.
              </p>
              <Link href="/dashboard" className="mt-6 px-8 py-2 bg-[#2563eb] text-white font-bold rounded-full hover:bg-blue-700 transition-all">
                Cari Acara
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
