"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/organism/Header";
import Footer from "@/components/organism/Footer";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

export default function LandingPage() {
  const [stats, setStats] = useState({ totalEvents: "1000+", totalUsers: "10k+" });

  useEffect(() => {
    // Attempt to fetch real stats, otherwise keep defaults
    const supabase = createClient();
    Promise.all([
      supabase.from('events').select('id', { count: 'exact', head: true }).eq('is_published', true),
      supabase.from('profiles').select('id', { count: 'exact', head: true })
    ]).then(([events, users]) => {
      if (events.count || users.count) {
        setStats({
          totalEvents: events.count ? `${events.count}+` : "1000+",
          totalUsers: users.count ? `${(users.count / 1000).toFixed(0)}k+` : "10k+"
        });
      }
    });
  }, []);

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

      <main className="responsive-section pt-[120px] md:pt-[200px] flex flex-col items-center relative z-10">
        {/* Hero Section */}
        <div className="max-w-[866px] text-center mb-8">
          <h1 className="responsive-title text-black !mb-0">
            Explorasi Kegiatan
          </h1>
          <h1 className="responsive-title bg-clip-text text-transparent bg-gradient-to-r from-[#245bd3] to-[#17bc84]">
            Tanpa Harus Mencari Satu-satu
          </h1>
        </div>

        <p className="max-w-[983px] text-center text-[#828282] text-lg md:text-2xl lg:text-[28px] font-medium leading-relaxed mb-12">
          Akses kompetisi, magang, beasiswa, volunteering, webinar, dan kegiatan lainnya yang sudah terverifikasi.
          Nikmati kemudahan pendaftaran sekali klik serta pengingat deadline kegiatan.
        </p>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row gap-4 md:gap-6 mb-20 md:mb-24 w-full sm:w-auto px-4 sm:px-0">
          <Link href="/register" className="group flex items-center justify-center gap-2 bg-[#2563eb] text-white text-xl md:text-[24px] font-semibold h-[56px] px-8 rounded-full hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl active:scale-95">
            Gabung sekarang
            <span className="text-[20px] group-hover:translate-x-1 transition-transform">❯</span>
          </Link>
          <Link href="/promote" className="flex items-center justify-center bg-white border-[1.5px] border-[#2563eb] text-[#2563eb] text-xl md:text-[24px] font-semibold h-[56px] px-8 rounded-full hover:bg-blue-50 transition-all shadow-md active:scale-95">
            Promosikan Acaramu
          </Link>
        </div>

        {/* Stats Section */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6 md:gap-10 w-full sm:w-auto px-4">
          {/* Stat Card 1 */}
          <div className="flex-1 sm:w-[225px] min-h-[110px] md:h-[119px] bg-white/20 border border-[#2563eb] rounded-[20px] shadow-[0px_4px_4px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center p-6 backdrop-blur-sm">
            <span className="text-3xl md:text-[32px] font-bold text-[#17bc84] leading-none mb-2">{stats.totalEvents}</span>
            <span className="text-xl md:text-[24px] font-semibold text-[#828282] text-center leading-tight">Event Tergabung</span>
          </div>

          {/* Stat Card 2 */}
          <div className="flex-1 sm:w-[225px] min-h-[110px] md:h-[119px] bg-white/20 border border-[#16bc83] rounded-[20px] shadow-[0px_4px_4px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center p-6 backdrop-blur-sm">
            <span className="text-3xl md:text-[32px] font-bold text-[#2563eb] leading-none mb-2">{stats.totalUsers}</span>
            <span className="text-xl md:text-[24px] font-semibold text-[#828282] text-center leading-tight">Mahasiswa Menggunakan</span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

