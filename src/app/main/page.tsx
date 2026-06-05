"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/organism/Footer";
import { createClient } from "@/lib/supabase/client";
import { 
  Bookmark, 
  FileText, 
  GraduationCap, 
  Award, 
  ChevronRight,
  CheckCircle2,
  Calendar,
  Globe,
  ExternalLink
} from "lucide-react";

export default function UserDashboard() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activityData, setActivityData] = useState<number[]>(new Array(7).fill(0));
  const [registeredEvents, setRegisteredEvents] = useState<any[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user);
        
        Promise.all([
          supabase.from('profiles').select('id, full_name, avatar_url, bio, institution, major, phone_number, linkedin_url, portfolio_url').eq('id', data.user.id).maybeSingle(),
          supabase.from('event_registrations').select('created_at, events(id, title, image_url, start_date, is_published)').eq('profile_id', data.user.id).order('created_at', { ascending: false }),
        ]).then(([{ data: profileData }, { data: regData }]) => {
          setProfile(profileData);
          
          // Filter out unpublished events
          const validRegs = (regData || []).filter((r: any) => r.events && r.events.is_published === true);
          setRegisteredEvents(validRegs);
          
          if (validRegs) {
            // Calculate activity for the last 7 days based on registrations
            const counts = new Array(7).fill(0);
            const now = new Date();
            // Create a date object for the beginning of today (local time)
            const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            
            validRegs.forEach((r: any) => {
              const rDate = new Date(r.created_at);
              // Create a date object for the beginning of the registration day
              const startOfRDate = new Date(rDate.getFullYear(), rDate.getMonth(), rDate.getDate());
              
              // Calculate difference in days
              const diffTime = startOfToday.getTime() - startOfRDate.getTime();
              const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
              
              if (diffDays >= 0 && diffDays < 7) {
                // index 6 is today, index 0 is 6 days ago
                counts[6 - diffDays]++;
              }
            });
            setActivityData(counts);
          }

          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });
  }, []);

  const stats = [
    { label: "Acara Tersimpan", desc: "Lihat dan kelola acara yang sudah kamu simpan", icon: <Bookmark className="w-10 h-10 md:w-12 md:h-12 text-[#2563eb]" />, color: "text-[#2563eb]", href: "/bookmarks", btnLabel: "Lihat Acara" },
    { label: "Sertifikat", desc: "Lihat sertifikat dari acara yang pernah kamu ikuti", icon: <Award className="w-10 h-10 md:w-12 md:h-12 text-[#16c475]" />, color: "text-[#16c475]", href: "/certificates", btnLabel: "Lihat Sertifikat" },
    { label: "Portofolio", desc: "Kelola dan tampilkan karya terbaikmu", icon: <FileText className="w-10 h-10 md:w-12 md:h-12 text-[#15c475]" />, color: "text-[#15c475]", href: "/portfolios", btnLabel: "Lihat Portofolio" },
    { label: "CV Tersimpan", desc: "Buat, kelola, dan tampilkan CV terbaikmu", icon: <GraduationCap className="w-10 h-10 md:w-12 md:h-12 text-[#2563eb]" />, color: "text-[#2563eb]", href: "/cvs", btnLabel: "Lihat CV" },
  ];

  const profileSteps = [
    { label: "Foto Profil", done: !!(profile?.avatar_url || user?.user_metadata?.avatar_url) },
    { label: "Data Diri", done: !!(profile?.full_name && profile?.phone_number) },
    { label: "CV", done: !!profile?.linkedin_url }, // LinkedIn as proxy for professional presence/CV
    { label: "Pendidikan", done: !!(profile?.institution && profile?.major) },
    { label: "Portofolio", done: !!profile?.portfolio_url },
  ];

  const completedSteps = profileSteps.filter(s => s.done).length;
  const progressPercent = Math.round((completedSteps / profileSteps.length) * 100);

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center relative">
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
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-blue-600 font-medium animate-pulse">Memuat dashboard...</p>
        </div>
      </main>
    );
  }

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
        <h1 className="text-[20px] md:text-[24px] font-semibold text-[#212121] mb-6 md:mb-8">
          Halo, {profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || "User"}
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Content */}
          <div className="flex-1 flex flex-col gap-8 order-2 lg:order-1">
            {/* Stats Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              {stats.map((stat, i) => (
                <div key={i} className="bg-white rounded-[15px] p-5 md:p-6 shadow-[0px_0px_7px_rgba(0,0,0,0.15)] flex flex-col justify-between h-[170px] md:h-[185px] relative">
                  <div className="flex justify-between items-start gap-2 relative z-10">
                    <div className="flex flex-col gap-1">
                      <span className={`text-[18px] md:text-[20px] font-semibold ${stat.color}`}>
                        {stat.label}
                      </span>
                      <p className="text-[12px] md:text-[13px] text-[#7d7d7d] leading-tight max-w-[150px] md:max-w-[180px]">
                        {stat.desc}
                      </p>
                    </div>
                    <div className="shrink-0 scale-75 md:scale-100 origin-top-right">
                      {stat.icon}
                    </div>
                  </div>
                  <Link href={stat.href} className="w-full bg-[#2563eb] text-white text-[14px] md:text-[15px] font-bold h-[31px] rounded-[15px] flex items-center justify-center hover:bg-blue-700 transition-all relative z-10">
                    {stat.btnLabel}
                  </Link>
                </div>
              ))}
            </div>

            {/* Activity Graph Placeholder */}
            <div className="bg-white rounded-[24px] md:rounded-[32px] p-5 md:p-8 border border-gray-100 shadow-[0px_10px_30px_rgba(0,0,0,0.04)]">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 md:mb-10">
                <h3 className="text-[16px] font-normal text-[#181c1f]">Acara yang diikuti</h3>
                <div className="bg-[#f2f4f8] rounded-full px-4 py-2 flex items-center gap-2 text-[13px] md:text-[14px]">
                  <span className="text-[#181c1f] font-medium">7 hari terakhir</span>
                  <ChevronRight className="w-4 h-4 rotate-90 text-[#181c1f]" />
                </div>
              </div>
              
              {/* Bar Chart Dynamic */}
              <div className="flex items-end justify-between h-[150px] md:h-[200px] gap-1.5 md:gap-4 px-2 md:px-4">
                {activityData.map((count, i) => {
                  const maxCount = Math.max(...activityData, 1);
                  const h = (count / maxCount) * 100;
                  const dayNames = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
                  // Rotate day names based on current day
                  const today = new Date().getDay(); // 0 is Sun, 1 is Mon...
                  const labels = [];
                  for(let j=6; j>=0; j--) {
                    const d = new Date();
                    d.setDate(d.getDate() - j);
                    labels.push(dayNames[(d.getDay() + 6) % 7]); // Adjust so 0 is Mon
                  }

                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 md:gap-4">
                      <div 
                        className={`w-full max-w-[40px] rounded-t-[16px] md:rounded-t-[32px] transition-all duration-700 ${i === 6 ? 'bg-[#004ac6]' : 'bg-[#004ac6]/20'}`} 
                        style={{ height: `${Math.max(h, count > 0 ? 10 : 2)}%` }}
                      />
                      <span className="text-[10px] md:text-[12px] font-semibold text-[#434655] uppercase tracking-tighter sm:tracking-wider">
                        {labels[i]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Registered Events History */}
            <div className="bg-white rounded-[24px] md:rounded-[32px] p-5 md:p-8 border border-gray-100 shadow-[0px_10px_30px_rgba(0,0,0,0.04)] mt-2 md:mt-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h3 className="text-[16px] md:text-[18px] font-bold text-[#181c1f]">Riwayat Pendaftaran Acara</h3>
              </div>
              
              <div className="flex flex-col gap-4">
                {registeredEvents.length > 0 ? (
                  registeredEvents.map((reg, i) => (
                    <Link key={i} href={`/events/${reg.events?.id}`} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 border border-gray-100 transition-all">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                        <img src={reg.events?.image_url || "/Logo.png"} alt={reg.events?.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col gap-1 flex-1">
                        <h4 className="text-[14px] md:text-[15px] font-bold text-gray-900 line-clamp-1">{reg.events?.title}</h4>
                        <div className="flex items-center gap-2 text-[12px] text-gray-500">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{reg.events?.start_date ? new Date(reg.events.start_date).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' }) : "Segera hadir"}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </Link>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <p className="text-[14px] text-gray-500 font-medium mb-4">Belum ada acara yang diikuti.</p>
                    <Link href="/dashboard" className="px-5 py-2 bg-[#2563eb] text-white text-[13px] font-bold rounded-lg hover:bg-blue-700 transition-all">
                      Cari Acara
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar: Profile Summary */}
          <div className="w-full lg:w-[288px] flex flex-col gap-0 order-1 lg:order-2">
            {/* Header Blue Box */}
            <div className="bg-[#2622ff] rounded-t-[30px] h-[100px] md:h-[120px] relative">
              <div className="absolute -bottom-10 md:-bottom-12 left-1/2 -translate-x-1/2 w-[100px] h-[100px] md:w-[116px] md:h-[116px] bg-white rounded-full p-1 shadow-md">
                <div className="w-full h-full bg-gray-100 rounded-full overflow-hidden flex items-center justify-center relative">
                   {profile?.avatar_url || user?.user_metadata?.avatar_url ? (
                     <img src={profile?.avatar_url || user?.user_metadata?.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                   ) : (
                     <span className="text-3xl md:text-4xl font-bold text-gray-300">{(profile?.full_name || user?.user_metadata?.full_name || "U").charAt(0)}</span>
                   )}
                </div>
              </div>
            </div>

            {/* Profile Info White Box */}
            <div className="bg-white border border-[#9a9a9a] rounded-b-[30px] pt-14 md:pt-16 pb-8 px-6 flex flex-col items-center text-center shadow-sm">
              <h2 className="text-[20px] md:text-[24px] font-semibold text-[#212121] mb-1">{profile?.full_name || "User"}</h2>
              <p className="text-[14px] md:text-[16px] font-semibold text-[#6c6c6c] mb-0.5">{profile?.major || "Mahasiswa"}</p>
              <p className="text-[14px] md:text-[16px] font-semibold text-[#6c6c6c] mb-4">{profile?.institution || "Institusi"}</p>
              <p className="text-[12px] font-medium text-[#6c6c6c] leading-snug mb-6">
                {profile?.bio || "Lengkapi bio untuk menarik minat penyelenggara acara"}
              </p>

              {profile?.portfolio_url && (
                <a 
                  href={profile.portfolio_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 mb-6 px-4 py-2 bg-green-50/50 border border-green-100 rounded-xl text-[13px] font-bold text-[#16c475] hover:bg-green-50 transition-all group"
                >
                  <Globe className="w-4 h-4" />
                  <span className="truncate max-w-[150px]">{profile.portfolio_url.replace(/^https?:\/\//, '')}</span>
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              )}

              <div className="w-full h-px bg-gray-200 mb-6" />

              {/* Progress */}
              <div className="w-full flex flex-col gap-4">
                <div className="flex justify-between items-center text-[14px] md:text-[16px] font-semibold">
                  <span>Progress Profil</span>
                  <span className="text-[12px]">{progressPercent}%</span>
                </div>
                
                <div className="w-full h-[10px] md:h-[12px] bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#2563eb] rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
                </div>

                <p className="text-[12px] font-medium text-[#6c6c6c] text-left mb-2">
                  {progressPercent < 100 ? "Lengkapi profilmu agar semakin mudah mendaftar acara." : "Profilmu sudah lengkap! Siap untuk eksplorasi lebih jauh."}
                </p>

                <div className="flex flex-col gap-3">
                  {profileSteps.map((step, i) => (
                    <div key={i} className="flex justify-between items-center text-[12px] font-medium text-[#6c6c6c]">
                      <span>{step.label}</span>
                      {step.done ? (
                        <CheckCircle2 className="w-4 h-4 text-[#16c475]" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-gray-300" />
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-2 mt-4">
                  <Link href="/settings/profile" className="w-full bg-[#2563eb] text-white text-[15px] font-semibold h-[38px] rounded-[50px] flex items-center justify-center hover:bg-blue-700 transition-all">
                    {progressPercent < 100 ? "Lengkapi Profil" : "Edit Profil"}
                  </Link>
                  
                  {profileSteps.find(s => s.label === "CV")?.done && (
                    <Link href="/cvs" className="w-full bg-white border border-[#2563eb] text-[#2563eb] text-[15px] font-semibold h-[38px] rounded-[50px] flex items-center justify-center hover:bg-blue-50 transition-all">
                      Lihat CV Tersimpan
                    </Link>
                  )}

                  {profileSteps.find(s => s.label === "Portofolio")?.done && (
                    <Link 
                      href={profile?.portfolio_url || "/portfolios"} 
                      target={profile?.portfolio_url ? "_blank" : "_self"}
                      rel={profile?.portfolio_url ? "noopener noreferrer" : undefined}
                      className="w-full bg-white border border-[#15c475] text-[#15c475] text-[15px] font-semibold h-[38px] rounded-[50px] flex items-center justify-center hover:bg-green-50 transition-all"
                    >
                      Lihat Portofolio
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
