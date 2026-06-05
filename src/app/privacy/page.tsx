"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/organism/Footer";
import { Shield, Lock, Eye, Database, UserCheck, Bell, ChevronLeft } from "lucide-react";

const sections = [
  {
    icon: <Database className="w-6 h-6" />,
    title: "Informasi yang Kami Kumpulkan",
    content: [
      "Informasi identitas: nama lengkap, alamat email, nomor telepon, dan foto profil yang Anda berikan saat mendaftar.",
      "Informasi akademik: institusi pendidikan, jurusan, dan semester yang Anda isi di profil.",
      "Data penggunaan: halaman yang dikunjungi, acara yang didaftarkan, dan preferensi konten.",
      "Informasi teknis: alamat IP, jenis perangkat, dan browser yang digunakan untuk keperluan keamanan.",
    ],
  },
  {
    icon: <Eye className="w-6 h-6" />,
    title: "Cara Kami Menggunakan Informasi Anda",
    content: [
      "Menyediakan, mengoperasikan, dan meningkatkan layanan platform Upvance.",
      "Mengirimkan notifikasi tentang acara, beasiswa, dan kompetisi yang relevan dengan minat Anda.",
      "Memproses pendaftaran acara dan mengelola akun pengguna.",
      "Menganalisis data agregat (anonim) untuk meningkatkan pengalaman pengguna secara keseluruhan.",
      "Mematuhi kewajiban hukum yang berlaku.",
    ],
  },
  {
    icon: <Lock className="w-6 h-6" />,
    title: "Keamanan Data",
    content: [
      "Semua data sensitif dienkripsi menggunakan standar industri (TLS/SSL).",
      "Kata sandi disimpan dalam bentuk hash yang tidak dapat dikembalikan.",
      "Akses ke database dibatasi dengan kebijakan Row Level Security (RLS) Supabase.",
      "Kami melakukan audit keamanan secara berkala untuk melindungi data Anda.",
    ],
  },
  {
    icon: <UserCheck className="w-6 h-6" />,
    title: "Hak-Hak Anda",
    content: [
      "Hak Akses: Anda dapat melihat semua data pribadi yang kami simpan melalui halaman profil.",
      "Hak Koreksi: Anda dapat memperbarui informasi yang tidak akurat kapan saja.",
      "Hak Penghapusan: Anda dapat meminta penghapusan akun dan semua data terkait.",
      "Hak Portabilitas: Anda dapat meminta ekspor data Anda dalam format yang dapat dibaca mesin.",
    ],
  },
  {
    icon: <Bell className="w-6 h-6" />,
    title: "Cookie & Teknologi Pelacakan",
    content: [
      "Kami menggunakan cookie sesi untuk menjaga status login Anda tetap aktif.",
      "Cookie analitik digunakan secara anonim untuk memahami pola penggunaan platform.",
      "Anda dapat menolak cookie melalui pengaturan browser, namun beberapa fitur mungkin terganggu.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen font-['Inter',sans-serif] relative overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden bg-[#f0fdf8]">
        <div className="absolute inset-0 w-full h-full">
          <div className="absolute inset-0 bg-gradient-to-br from-[#ecfdf5] via-[#e0f2fe] to-white" />
          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[#10b981]/8 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-[#0ea5e9]/8 blur-3xl" />
        </div>
      </div>

      <main className="pt-[100px] pb-20 px-4 md:px-10 relative z-10">
        <div className="max-w-[860px] mx-auto">
          {/* Back Link */}
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-[#059669] font-semibold mb-8 hover:underline transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Kembali ke Dashboard
          </Link>

          {/* Hero */}
          <div className="bg-gradient-to-r from-[#059669] to-[#0284c7] rounded-[24px] p-8 md:p-12 mb-10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/10 -translate-y-12 translate-x-12" />
            <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/5 translate-y-8 -translate-x-8" />
            <div className="relative z-10 flex items-start gap-5">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-[28px] md:text-[36px] font-bold mb-3 leading-tight">
                  Kebijakan Privasi
                </h1>
                <p className="text-white/80 text-[15px] leading-relaxed max-w-[540px]">
                  Kami berkomitmen untuk melindungi privasi dan keamanan data pribadi Anda.
                  Dokumen ini menjelaskan bagaimana Upvance mengumpulkan, menggunakan, dan
                  melindungi informasi Anda.
                </p>
                <p className="text-white/50 text-[13px] mt-4">
                  Terakhir diperbarui: Juni 2025
                </p>
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="flex flex-col gap-5">
            {sections.map((section, idx) => (
              <div
                key={idx}
                className="bg-white rounded-[20px] border border-gray-100 shadow-sm p-6 md:p-8 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#059669]/15 to-[#0284c7]/15 flex items-center justify-center text-[#059669]">
                    {section.icon}
                  </div>
                  <h2 className="text-[18px] font-bold text-gray-900">{section.title}</h2>
                </div>
                <ul className="flex flex-col gap-3">
                  {section.content.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-[14px] text-gray-600 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] shrink-0 mt-2" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Contact Banner */}
            <div className="bg-gradient-to-r from-[#ecfdf5] to-[#e0f2fe] rounded-[20px] border border-[#a7f3d0] p-6 md:p-8 text-center">
              <h2 className="text-[18px] font-bold text-gray-900 mb-2">
                Ada Pertanyaan tentang Privasi?
              </h2>
              <p className="text-[14px] text-gray-600 mb-5">
                Jika Anda memiliki pertanyaan atau kekhawatiran tentang kebijakan privasi ini,
                jangan ragu untuk menghubungi tim kami.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#059669] to-[#0284c7] text-white px-6 py-3 rounded-full font-bold text-[14px] hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
              >
                Hubungi Kami
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
