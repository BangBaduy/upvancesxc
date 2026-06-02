"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/organism/Header";
import Footer from "@/components/organism/Footer";
import { Check, Mail, MessageCircle, Star, Zap, Crown, X, User, Calendar, ExternalLink, QrCode } from "lucide-react";

export default function PromotePage() {
  const [selectedTier, setSelectedTier] = React.useState<any>(null);
  const [step, setStep] = React.useState<"form" | "payment" | "success">("form");
  const [formData, setFormData] = React.useState({
    eventName: "",
    organizerName: "",
    eventDate: "",
    notes: ""
  });

  const tiers = [
    {
      name: "Tier 3 (Basic)",
      tagline: "Kebutuhan standar siaran acara.",
      price: "0",
      features: [
        "Publikasikan acaramu",
        "Masuk dalam rekomendasi acara",
        "Pendaftaran terintegrasi di platform",
      ],
      icon: <Zap className="w-6 h-6 text-white" />,
      iconBg: "bg-[#2563eb] border-[#2563eb]",
      color: "border-blue-200",
      btnColor: "bg-[#2563eb] hover:bg-blue-700",
    },
    {
      name: "Tier 2 (Pro/Plus)",
      tagline: "Fokus pada gamifikasi & apresiasi.",
      price: "35.000",
      features: [
        "Semua manfaat Tier Basic",
        "Badge khusus untuk peserta",
        "Prioritas dalam pencarian",
      ],
      icon: <Star className="w-6 h-6 text-white" />,
      iconBg: "bg-orange-500 border-orange-500",
      color: "border-orange-200 shadow-orange-100",
      btnColor: "bg-orange-500 hover:bg-orange-600",
      popular: true,
    },
    {
      name: "Tier 1 (Premium)",
      tagline: "Kredibilitas penuh (Paket Lengkap).",
      price: "125.000",
      features: [
        "Semua manfaat Tier Pro",
        "Sertifikat untuk peserta (UI)",
        "Analitik performa acara",
      ],
      icon: <Crown className="w-6 h-6 text-white" />,
      iconBg: "bg-purple-600 border-purple-600",
      color: "border-purple-200",
      btnColor: "bg-purple-600 hover:bg-purple-700",
    },
  ];

  const handlePilih = (tier: any) => {
    setSelectedTier(tier);
    setStep("form");
  };

  const handleNextToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("payment");
  };

  const handleContinueToWA = () => {
    const text = `Halo Upvance! Saya ingin konfirmasi pembayaran untuk paket: ${selectedTier.name}.%0A%0ADetail Acara:%0ANama: ${formData.eventName}%0APenyelenggara: ${formData.organizerName}%0ATanggal: ${formData.eventDate}%0ACatatan: ${formData.notes}`;
    window.open(`https://wa.me/628123456789?text=${text}`, '_blank');
    setStep("success");
    setSelectedTier(null);
  };

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

      <main className="pt-[120px] md:pt-[160px] pb-20 px-4 md:px-10 max-w-[1280px] mx-auto relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-[32px] md:text-[48px] font-bold text-[#161616] mb-4 tracking-tight">
            Promosikan Acaramu di Upvance
          </h1>
          <p className="text-[#6c6c6c] text-[16px] md:text-[18px] max-w-[700px] mx-auto leading-relaxed">
            Jangkau ribuan mahasiswa dan tingkatkan partisipasi acaramu dengan paket langganan kami yang fleksibel.
          </p>
        </div>

        {/* Tiers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {tiers.map((tier, i) => (
            <div 
              key={i} 
              className={`bg-white rounded-[32px] p-8 border-2 ${tier.color} shadow-lg relative flex flex-col transition-all hover:-translate-y-2 duration-300`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[12px] font-bold px-4 py-1 rounded-full shadow-md">
                  PALING POPULER
                </div>
              )}
              
              <div className="mb-8">
                <div className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center mb-4 shadow-sm ${tier.iconBg}`}>
                  {tier.icon}
                </div>
                <h2 className="text-[20px] font-bold text-[#161616] mb-2">{tier.name}</h2>
                <p className="text-[14px] text-[#6c6c6c] font-medium">{tier.tagline}</p>
              </div>

              <div className="mb-8 flex items-baseline gap-1">
                <span className="text-[16px] font-bold text-[#161616]">Rp</span>
                <span className="text-[36px] font-bold text-[#161616]">{tier.price}</span>
                <span className="text-[14px] text-[#6c6c6c] font-medium">/ acara</span>
              </div>

              <div className="flex flex-col gap-4 mb-10 flex-1">
                {tier.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="mt-1 w-5 h-5 rounded-full bg-green-50 flex items-center justify-center shrink-0 border border-green-100">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-[14px] text-[#434655] font-medium">{feature}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => handlePilih(tier)}
                className={`w-full h-[52px] ${tier.btnColor} text-white font-bold rounded-2xl flex items-center justify-center transition-all shadow-md`}
              >
                Pilih Paket Ini
              </button>
            </div>
          ))}
        </div>

        {/* Custom Package Section */}
        <div className="bg-[#2622ff] rounded-[32px] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute right-0 bottom-0 opacity-10 w-[300px] h-[300px] -mr-20 -mb-20">
             <Image src="/Logo_Icon_BW.png" alt="" fill className="object-contain brightness-0 invert" />
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-[600px]">
              <h2 className="text-[28px] md:text-[36px] font-bold mb-4">Butuh Paket Khusus?</h2>
              <p className="text-white/80 text-[16px] md:text-[18px] leading-relaxed">
                Ada manfaat tambahan yang kamu inginkan? Hubungi Event Manager kami untuk mendiskusikan kebutuhan promosi khusus acaramu.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <a 
                href="mailto:manager@upvance.com" 
                className="flex items-center justify-center gap-3 px-8 py-4 bg-white text-[#2622ff] font-bold rounded-2xl hover:bg-blue-50 transition-all shadow-lg"
              >
                <Mail className="w-5 h-5" />
                Email Manager
              </a>
              <a 
                href="https://wa.me/628123456789" 
                target="_blank"
                className="flex items-center justify-center gap-3 px-8 py-4 bg-[#16c475] text-white font-bold rounded-2xl hover:bg-green-600 transition-all shadow-lg"
              >
                <MessageCircle className="w-5 h-5" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* ─── CHECKOUT MODAL ─── */}
      {selectedTier && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#080808]/40 backdrop-blur-sm" onClick={() => setSelectedTier(null)} />
          <div className="relative bg-white rounded-[32px] w-full max-w-[500px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
               <div>
                 <h3 className="text-[#161616] font-bold text-[20px]">{step === 'form' ? "Detail Acara" : "Pembayaran"}</h3>
                 <p className="text-[#6c6c6c] text-[13px] font-medium">{selectedTier.name}</p>
               </div>
               <button onClick={() => setSelectedTier(null)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-400 transition-colors">
                 <X className="w-5 h-5" />
               </button>
            </div>

            <div className="p-8">
              {/* Step 1: Form */}
              {step === 'form' && (
                <form onSubmit={handleNextToPayment} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-bold text-gray-700 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-[#2563eb]" /> Nama Acara
                    </label>
                    <input 
                      required
                      type="text" 
                      placeholder="Masukkan nama acara kamu"
                      className="w-full h-[52px] px-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] transition-all text-gray-900"
                      value={formData.eventName}
                      onChange={e => setFormData({...formData, eventName: e.target.value})}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-bold text-gray-700 flex items-center gap-2">
                      <User className="w-4 h-4 text-[#2563eb]" /> Penyelenggara (Instansi/Org)
                    </label>
                    <input 
                      required
                      type="text" 
                      placeholder="Nama instansi atau organisasi"
                      className="w-full h-[52px] px-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] transition-all text-gray-900"
                      value={formData.organizerName}
                      onChange={e => setFormData({...formData, organizerName: e.target.value})}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-bold text-gray-700 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#2563eb]" /> Rencana Tanggal Acara
                    </label>
                    <input 
                      required
                      type="date" 
                      className="w-full h-[52px] px-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] transition-all text-gray-900"
                      value={formData.eventDate}
                      onChange={e => setFormData({...formData, eventDate: e.target.value})}
                    />
                  </div>
                  <button type="submit" className="w-full h-[56px] bg-[#2563eb] text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 mt-2">
                    Lanjut ke Pembayaran
                  </button>
                </form>
              )}

              {/* Step 2: Payment (QR Code) */}
              {step === 'payment' && (
                <div className="flex flex-col items-center text-center">
                  <div className="mb-6 p-6 bg-[#f8fafc] border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center">
                    <p className="text-[14px] font-bold text-gray-800 mb-4 uppercase tracking-widest">QRIS PAYMENT</p>
                    <div className="relative w-[200px] h-[200px] bg-white p-2 rounded-xl shadow-inner">
                      {/* Stylized QR Placeholder using UI */}
                      <div className="w-full h-full border-4 border-[#161616] flex items-center justify-center relative overflow-hidden">
                        <QrCode className="w-32 h-32 text-gray-900" />
                        <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 opacity-10">
                          {Array.from({length: 16}).map((_, i) => <div key={i} className="border border-black" />)}
                        </div>
                      </div>
                    </div>
                    <p className="mt-4 text-[12px] text-gray-500 font-medium">Scan QR di atas untuk membayar <br/><span className="text-[16px] text-gray-900 font-bold">Rp {selectedTier.price}</span></p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 mb-8 w-full">
                    <p className="text-[13px] text-[#2563eb] leading-relaxed">
                      <strong>Penting:</strong> Setelah membayar, silakan klik tombol di bawah untuk mengirim bukti bayar dan detail acara via WhatsApp.
                    </p>
                  </div>

                  <button 
                    onClick={handleContinueToWA}
                    className="w-full h-[56px] bg-[#16c475] text-white font-bold rounded-2xl hover:bg-green-600 transition-all shadow-lg shadow-green-100 flex items-center justify-center gap-3"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Kirim ke WhatsApp
                  </button>
                  <button onClick={() => setStep('form')} className="mt-4 text-[13px] text-gray-400 font-bold hover:underline">
                    Kembali ke Form
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
