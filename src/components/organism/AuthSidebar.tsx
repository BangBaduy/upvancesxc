"use client";

import React from "react";
import Image from "next/image";
import {
  Calendar,
  Bell,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-[15px] items-center">
      <div className="shrink-0 flex items-center justify-center w-12 h-12 bg-white/10 rounded-xl text-white">
        {icon}
      </div>
      <div className="flex flex-col">
        <h3 className="font-bold text-[23px] text-white leading-tight drop-shadow-[0px_4px_4px_rgba(0,0,0,0.25)]">
          {title}
        </h3>
        <p className="text-[18px] font-normal text-white opacity-90 leading-snug max-w-[350px]">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function AuthSidebar() {
  return (
    <div className="hidden lg:flex lg:w-[450px] xl:w-[529px] relative flex-col bg-gradient-to-b from-[#2563eb] from-[20.673%] to-[#14cb72] p-8 xl:p-[50px] text-white overflow-hidden shrink-0 min-h-screen">
      {/* Logo Section */}
      <div className="flex items-center justify-center lg:justify-start mb-12 xl:mb-[60px] relative z-10">
        <div className="w-[150px] h-[60px] relative">
          <Image
            src="/Logo_BW.png"
            alt="Upvance Logo"
            fill
            className="object-contain"
          />
        </div>
      </div>

      {/* Hero Text */}
      <div className="mb-12 xl:mb-[60px] relative z-10 max-w-[422px]">
        <h1 className="text-[32px] font-bold leading-[44px] drop-shadow-[0px_4px_4px_rgba(0,0,0,0.25)]">
          Lebih Mudah Untuk Akses{" "}
          <span className="text-[#fbc02d]">Ribuan Informasi Acara</span>
        </h1>
      </div>

      {/* Features List */}
      <div className="space-y-[30px] relative z-10">
        <FeatureItem
          icon={<Sparkles className="w-8 h-8" />}
          title="Rekomendasi Acara Otomatis"
          description="100% sesuai profil diri"
        />
        <FeatureItem
          icon={<Calendar className="w-8 h-8" />}
          title="Kalender Event"
          description="Akses info Acara, Magang, Webinar, Lomba, dan Volunteer sepanjang tahun"
        />
        <FeatureItem
          icon={<Bell className="w-8 h-8" />}
          title="Reminder Deadline"
          description="Pengingat langsung ke Google Calendar ketika menyimpan acara dan lainnya"
        />
        <FeatureItem
          icon={<ShieldCheck className="w-8 h-8" />}
          title="Acara Terverifikasi"
          description="Informasi acara yang sudah diseleksi secara ketat sehingga minim acara palsu"
        />
      </div>

      {/* Decorative background blur */}
      <div className="absolute top-[-50px] left-[-50px] w-64 h-64 bg-white/5 rounded-full blur-3xl" />
    </div>
  );
}
