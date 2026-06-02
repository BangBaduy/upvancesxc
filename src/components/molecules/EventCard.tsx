"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, CheckCircle2, Globe, Calendar, ChevronRight } from "lucide-react";

interface EventCardProps {
  id: string;
  title: string;
  location: string;
  startDate: string;
  deadline: string;
  price: string;
  image: string;
  isVerified?: boolean;
  category?: string;
  isOnline?: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  Lomba: "bg-blue-50 text-[#16558f] border-blue-200",
  Seminar: "bg-purple-50 text-purple-700 border-purple-200",
  Workshop: "bg-orange-50 text-orange-700 border-orange-200",
  Beasiswa: "bg-green-50 text-green-700 border-green-200",
  Magang: "bg-teal-50 text-teal-700 border-teal-200",
  Webinar: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Volunteer: "bg-lime-50 text-lime-700 border-lime-200",
  Greenvity: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Lainnya: "bg-gray-50 text-gray-700 border-gray-200",
};

export default function EventCard({
  id,
  title,
  location,
  startDate,
  deadline,
  price,
  image,
  isVerified = false,
  category = "Lainnya",
  isOnline = false,
}: EventCardProps) {
  const catColor = CATEGORY_COLORS[category] ?? "bg-gray-50 text-gray-700 border-gray-200";

  return (
    <Link href={`/events/${id}`} className="block group">
      <div className="relative w-[306px] rounded-[20px] overflow-hidden shadow-[0px_4px_20px_rgba(0,0,0,0.12)] group-hover:shadow-[0px_8px_32px_rgba(37,99,235,0.25)] group-hover:-translate-y-1 transition-all duration-300 bg-white flex flex-col">
        
        {/* Image Section */}
        <div className="relative w-full h-[200px] overflow-hidden bg-[#f1f5f9]">
          {/* Blurred Background to fill empty spaces for different aspect ratios */}
          <Image
            src={image}
            alt=""
            fill
            className="object-cover blur-lg opacity-40 scale-110"
            aria-hidden="true"
          />
          
          {/* Main Poster Image - Contained to show full content */}
          <Image
            src={image}
            alt={title}
            fill
            className="object-contain relative z-10 transition-transform duration-500"
            sizes="306px"
          />
          
          {/* Gradient overlay bottom - behind text but above images */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent z-20" />

          {/* Category badge — top left */}
          <span className={`absolute top-3 left-3 ${catColor} border text-[11px] font-bold px-3 py-1 rounded-full shadow-md z-30`}>
            {category}
          </span>

          {/* Verified badge — top right */}
          {isVerified && (
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm text-[#2563eb] text-[11px] font-bold px-2 py-1 rounded-full shadow z-30">
              <CheckCircle2 className="w-3 h-3" />
              Verified
            </div>
          )}

          {/* Price — bottom left overlay */}
          <div className="absolute bottom-3 left-3 z-30">
            <span className={`text-[12px] font-bold px-3 py-1 rounded-full ${
              price === "Gratis"
                ? "bg-green-500 text-white"
                : "bg-yellow-400 text-black"
            }`}>
              {price}
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-4 py-4 flex flex-col gap-3 flex-1 bg-gradient-to-br from-white via-[#f4fbff] to-[#f0fdf4]">
          {/* Title */}
          <h3 className="text-[15px] font-bold text-[#161616] leading-tight line-clamp-2 min-h-[40px]">
            {title}
          </h3>

          {/* Info rows */}
          <div className="flex flex-col gap-2">
            {/* Location */}
            <div className="flex items-center gap-2 text-[#555]">
              {isOnline ? (
                <Globe className="w-4 h-4 text-[#2563eb] shrink-0" />
              ) : (
                <MapPin className="w-4 h-4 text-[#2563eb] shrink-0" />
              )}
              <span className="text-[12px] font-medium truncate">
                {isOnline ? "Online" : location}
              </span>
            </div>

            {/* Dates */}
            <div className="flex items-center gap-2 text-[#555]">
              <Calendar className="w-4 h-4 text-[#2563eb] shrink-0" />
              <span className="text-[12px] font-medium">Mulai: {startDate}</span>
            </div>
          </div>

          {/* Deadline */}
          <div className="flex items-center justify-between pt-1 border-t border-blue-100/50 mt-auto">
            <span className="text-[11px] text-[#dc2626] font-bold">
              ⏰ Deadline: {deadline}
            </span>
          </div>

          {/* CTA Button */}
          <div className="flex items-center justify-center gap-1.5 w-full py-2 bg-gradient-to-r from-[#2563eb] via-[#1ab374] to-[#16c475] group-hover:opacity-90 rounded-[10px] text-white text-[13px] font-bold transition-all shadow-sm">
            <span>Lihat Detail</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}
