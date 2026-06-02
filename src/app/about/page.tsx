"use client";

import React from "react";
import Image from "next/image";
import Header from "@/components/organism/Header";
import Footer from "@/components/organism/Footer";

export default function AboutUsPage() {
  return (
    <div className="min-h-screen font-['Inter',sans-serif] relative overflow-x-hidden">
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

      <main className="pt-[100px] pb-20 px-4 md:px-10 relative z-10">
        <div className="max-w-[1280px] mx-auto flex flex-col items-center">
          {/* Hero Illustration/Logo Section */}
          <div className="relative w-full max-w-[626px] h-[168px] mb-8">
            <Image 
              src="https://www.figma.com/api/mcp/asset/c1110b5e-9c6f-4a91-ace3-ae5c5dae6abe" 
              alt="Upvance Illustration" 
              fill 
              className="object-contain"
            />
          </div>

          {/* Hero Title */}
          <h1 className="text-[30px] font-bold text-[#2a52aa] text-center mb-16">
            Discover <span className="text-[#2a52aa]">Opportunities Without Limits</span>
          </h1>

          {/* Section 1: Problem Statement */}
          <div className="flex flex-col lg:flex-row items-center gap-12 mb-24 w-full">
            <div className="flex-1">
              <p className="text-[20px] text-[#013d95] text-justify leading-relaxed font-medium">
                Di era digital yang serba cepat seperti sekarang, peluang sebenarnya ada di mana-mana, 
                tetapi begitu juga dengan information overload. Banyak mahasiswa kesulitan mengikuti 
                informasi mengenai kompetisi, program volunteer, seminar, webinar, dan kegiatan 
                pengembangan diri karena informasi tersebar di Instagram, grup WhatsApp, channel 
                Telegram, dan berbagai website lainnya. Akibatnya, banyak peluang berharga terlewat 
                hanya karena sulit ditemukan, sulit dipantau, atau kurang terpercaya.
              </p>
            </div>
            <div className="w-full lg:w-[430px] h-[226px] relative rounded-[20px] overflow-hidden shadow-lg">
              <Image 
                src="https://www.figma.com/api/mcp/asset/e8d070e4-14d4-4069-a1e1-0fdf03d31241" 
                alt="Students Seminar" 
                fill 
                className="object-cover"
              />
            </div>
          </div>

          {/* Section 2: Solution Highlight */}
          <div className="w-full text-center mb-16">
            <h2 className="text-[36px] font-bold text-[#34a853]">
              Upvance hadir untuk mengubah pengalaman tersebut.
            </h2>
          </div>

          {/* Section 3: Vision/Mission Details */}
          <div className="flex flex-col lg:flex-row-reverse items-center gap-12 w-full">
            <div className="flex-1">
              <p className="text-[20px] text-[#2a52aa] text-justify leading-relaxed font-medium">
                Kami bukan sekadar platform event biasa, Upvance adalah tempat untuk menemukan peluang, 
                membangun koneksi, mengembangkan kemampuan, dan bertumbuh menjadi versi terbaik dari 
                diri mereka sendiri. Dengan mengumpulkan berbagai opportunity terpercaya ke dalam satu 
                platform terpusat, kami membantu mahasiswa menghemat waktu, lebih terorganisir, dan 
                fokus pada hal yang benar-benar penting: perkembangan diri dan pengalaman.
              </p>
            </div>
            <div className="w-full lg:w-[492px] h-[183px] relative rounded-[20px] overflow-hidden shadow-lg">
              <Image 
                src="https://www.figma.com/api/mcp/asset/3b432955-6a03-466c-960d-681248536019" 
                alt="Community Growth" 
                fill 
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
