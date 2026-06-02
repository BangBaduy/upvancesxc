"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Facebook, Linkedin, Twitter, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full px-4 md:px-10 pb-10 mt-10 flex justify-center">
      {/* 
         Main Container: matches Figma's bg-[#2622ff], rounded-[20px], and w-[1236px]
         Shadow: drop-shadow-[130px_140px_125px_rgba(0,0,0,0.18)] is very large, 
         simplified to shadow-xl for web usability while maintaining depth.
      */}
      <div className="max-w-[1236px] w-full bg-[#2622ff] rounded-[20px] relative overflow-hidden p-6 md:p-0 md:h-[160px]">
        
        {/* Background Watermark */}
        <div className="absolute left-[4.17%] top-[50%] -translate-y-[calc(50%-5px)] w-[200px] h-[140px] opacity-10 pointer-events-none hidden md:block">
          <Image
            src="/Logo_Icon_BW.png"
            alt=""
            fill
            className="object-contain brightness-0 invert"
          />
        </div>

        {/* Brand Section */}
        <div className="md:absolute md:left-[4.17%] md:top-[40%] md:-translate-y-1/2 flex items-center gap-2 z-10 mb-6 md:mb-0">
          <div className="relative w-[36px] h-[20px]">
            <Image
              src="/Logo_Icon_BW.png"
              alt="Upvance Logo"
              fill
              className="object-contain"
            />
          </div>
          <span className="text-[18px] md:text-[24px] font-semibold text-white tracking-tight leading-tight">Upvance</span>
        </div>

        {/* Navigation Links */}
        <nav className="md:absolute md:left-[24px] md:bottom-[20px] flex flex-wrap gap-x-6 gap-y-2 z-10 mb-6 md:mb-0">
          <Link href="/about" className="text-white text-[12px] md:text-[14px] font-bold hover:underline transition-all">
            Tentang Kami
          </Link>
          <Link href="/contact" className="text-white text-[12px] md:text-[14px] font-bold hover:underline transition-all">
            Kontak Kami
          </Link>
          <Link href="/privacy" className="text-white text-[12px] md:text-[14px] font-bold hover:underline transition-all">
            Privacy Policy
          </Link>
          <Link href="/promote" className="text-white text-[12px] md:text-[14px] font-bold hover:underline transition-all">
            Promosikan Acara
          </Link>
        </nav>

        {/* Social Section */}
        <div className="md:absolute md:right-[4.17%] md:top-[45%] md:-translate-y-1/2 flex flex-col items-start md:items-end gap-2 z-10">
          <span className="text-white text-[13px] md:text-[14px] font-bold">Ikuti Kami</span>
          <div className="flex gap-2">
            {[
              { Icon: Facebook, href: "#" },
              { Icon: Linkedin, href: "#" },
              { Icon: Twitter, href: "#" },
              { Icon: Instagram, href: "#" },
            ].map(({ Icon, href }, i) => (
              <Link 
                key={i} 
                href={href} 
                className="w-7 h-7 flex items-center justify-center text-white hover:bg-white/10 rounded-md transition-colors"
              >
                <Icon className="w-5 h-5" />
              </Link>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="md:absolute md:bottom-3 md:right-10 mt-6 md:mt-0 text-white/40 text-[9px] uppercase tracking-widest text-center md:text-right w-full md:w-auto">
          © 2024 UPVANCE. ALL RIGHTS RESERVED.
        </div>

      </div>
    </footer>
  );
}
