"use client";

import React, { useState } from "react";
import Link from "next/link";
import Footer from "@/components/organism/Footer";
import {
  MessageCircle,
  Mail,
  MapPin,
  Clock,
  ChevronLeft,
  Send,
  CheckCircle2,
  Phone,
} from "lucide-react";

export default function ContactPage() {
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("muhammadirfanali886@gmail.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen font-['Inter',sans-serif] relative overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#ecfdf5] via-[#e0f2fe] to-[#f0f9ff]" />
        <div className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full bg-[#10b981]/6 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full bg-[#0ea5e9]/6 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-white/40 blur-2xl" />
      </div>

      <main className="pt-[100px] pb-20 px-4 md:px-10 relative z-10">
        <div className="max-w-[960px] mx-auto">
          {/* Back Link */}
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-[#059669] font-semibold mb-8 hover:underline transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Kembali ke Dashboard
          </Link>

          {/* Hero */}
          <div className="bg-gradient-to-r from-[#059669] to-[#0284c7] rounded-[28px] p-8 md:p-12 mb-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10 -translate-y-20 translate-x-20" />
            <div className="absolute bottom-0 left-1/3 w-40 h-40 rounded-full bg-white/5 translate-y-10" />
            <div className="relative z-10 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <MessageCircle className="w-9 h-9 text-white" />
              </div>
              <h1 className="text-[32px] md:text-[42px] font-bold mb-4 leading-tight">
                Kontak Kami
              </h1>
              <p className="text-white/80 text-[16px] leading-relaxed max-w-[520px] mx-auto">
                Punya pertanyaan, saran, atau ingin berkolaborasi? Tim Upvance siap
                mendengar dan membantu Anda.
              </p>
            </div>
          </div>

          {/* Contact Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {/* WhatsApp Card */}
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-8 flex flex-col items-center text-center group hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-[#25D366] to-[#128C7E] rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-green-200 group-hover:scale-110 transition-transform duration-300">
                {/* WhatsApp SVG Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <h2 className="text-[20px] font-bold text-gray-900 mb-2">WhatsApp</h2>
              <p className="text-gray-500 text-[14px] mb-6 leading-relaxed">
                Chat langsung dengan tim kami. Respons cepat di jam kerja (Senin–Jumat, 09.00–17.00 WIB).
              </p>
              <div className="w-full flex flex-col gap-3">
                <a
                  href="https://wa.me/6283800499929"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 bg-[#25D366] text-white font-bold rounded-2xl hover:bg-[#128C7E] transition-all duration-200 flex items-center justify-center gap-2 text-[15px]"
                >
                  <Phone className="w-4 h-4" />
                  Hubungi Irfan
                </a>
                <a
                  href="https://wa.me/6281287804751"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 bg-[#25D366] text-white font-bold rounded-2xl hover:bg-[#128C7E] transition-all duration-200 flex items-center justify-center gap-2 text-[15px]"
                >
                  <Phone className="w-4 h-4" />
                  Hubungi Antigravity
                </a>
              </div>
            </div>

            {/* Email Card */}
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-8 flex flex-col items-center text-center group hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-[#0284c7] to-[#059669] rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform duration-300">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-[20px] font-bold text-gray-900 mb-2">Email</h2>
              <p className="text-gray-500 text-[14px] mb-6 leading-relaxed">
                Kirim pertanyaan detail, laporan bug, atau proposal kerjasama. Kami membalas dalam 1–2 hari kerja.
              </p>
              <a
                href="mailto:muhammadirfanali886@gmail.com"
                className="w-full py-3.5 bg-[#2563eb] text-white font-bold rounded-2xl hover:bg-blue-700 transition-all duration-200 flex items-center justify-center gap-2 text-[15px]"
              >
                <Send className="w-4 h-4" />
                Hubungi via Email
              </a>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="bg-gradient-to-br from-[#ecfdf5] to-[#e0f2fe] rounded-[20px] border border-[#a7f3d0] p-6 flex items-start gap-4">
              <div className="w-10 h-10 bg-[#059669]/15 rounded-xl flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-[#059669]" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Jam Operasional</h3>
                <p className="text-[14px] text-gray-600 leading-relaxed">
                  Senin – Jumat: 09.00 – 17.00 WIB<br />
                  Sabtu – Minggu: Closed<br />
                  <span className="text-[#059669] font-medium">Respons WhatsApp: &lt;2 jam (hari kerja)</span>
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#ecfdf5] to-[#e0f2fe] rounded-[20px] border border-[#a7f3d0] p-6 flex items-start gap-4">
              <div className="w-10 h-10 bg-[#0284c7]/15 rounded-xl flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-[#0284c7]" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Lokasi Tim</h3>
                <p className="text-[14px] text-gray-600 leading-relaxed">
                  UIN Syarif Hidayatullah Jakarta<br />
                  Ciputat, Tangerang Selatan<br />
                  <span className="text-[#0284c7] font-medium">Banten, Indonesia 15419</span>
                </p>
              </div>
            </div>
          </div>

          {/* FAQ CTA */}
          <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm p-8 text-center">
            <h2 className="text-[20px] font-bold text-gray-900 mb-3">
              Mau tahu lebih banyak tentang Upvance?
            </h2>
            <p className="text-gray-500 text-[14px] mb-6">
              Kunjungi halaman Tentang Kami untuk mengenal lebih jauh visi, misi, dan tim di balik Upvance.
            </p>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#059669] to-[#0284c7] text-white px-8 py-3 rounded-full font-bold text-[14px] hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
            >
              Tentang Upvance
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
