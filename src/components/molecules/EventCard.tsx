"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, CheckCircle2, Globe, Calendar, ChevronRight, CircleDollarSign } from "lucide-react";

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
  organizerName?: string;
  organizerLogo?: string | null;
}

const CATEGORY_COLORS: Record<string, string> = {
  Lomba: "bg-[#2563eb] text-white",
  Seminar: "bg-purple-600 text-white",
  Workshop: "bg-orange-600 text-white",
  Beasiswa: "bg-green-600 text-white",
  Magang: "bg-teal-600 text-white",
  Webinar: "bg-indigo-600 text-white",
  Volunteer: "bg-lime-600 text-white",
  Greenvity: "bg-emerald-700 text-white",
  Lainnya: "bg-gray-600 text-white",
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
  organizerName,
  organizerLogo,
}: EventCardProps) {
  const catColor = CATEGORY_COLORS[category] ?? "bg-gray-600 text-white";

  return (
    <Link href={`/events/${id}`} className="block group">
      <div className="relative w-[320px] rounded-[20px] overflow-hidden shadow-[0px_0px_15px_rgba(0,0,0,0.25)] group-hover:shadow-[0px_8px_32px_rgba(37,99,235,0.25)] group-hover:-translate-y-1 transition-all duration-300 bg-white flex flex-col p-[14px]">
        
        {/* Poster Image */}
        <div className="relative w-full aspect-[322/402] rounded-[20px] overflow-hidden bg-gray-100 mb-4">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover"
            sizes="320px"
          />
          
          {/* Category Overlay - Top Left */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1">
            <span className={`${catColor} text-[9px] font-light px-2.5 py-1 rounded-full shadow-sm`}>
              {category}
            </span>
          </div>
        </div>

        {/* Event Title */}
        <div className="px-1 mb-3">
          <h3 className="text-[14px] font-bold text-[#161616] leading-[1.25] line-clamp-2 min-h-[35px] font-['Montserrat',sans-serif]">
            {title}
          </h3>
        </div>

        {/* CTA Button */}
        <div className="px-1 mb-4">
          <div className="w-full h-[36px] bg-[#2563eb] rounded-full flex items-center justify-center gap-2 text-white text-[18px] font-bold font-['Inter',sans-serif] shadow-sm">
            <span>More Detail</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* Status & Info Rows */}
        <div className="px-1 flex flex-col gap-2 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[#374151]">
              {isOnline && location === "Online" ? (
                <Globe className="w-3.5 h-3.5 text-[#2563eb]" />
              ) : isOnline ? (
                <div className="flex items-center -space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#2563eb] bg-white rounded-full p-0.5" />
                  <Globe className="w-3.5 h-3.5 text-[#2563eb]" />
                </div>
              ) : (
                <MapPin className="w-3.5 h-3.5 text-[#2563eb]" />
              )}
              <span className="text-[10.5px] font-bold font-['Montserrat',sans-serif]">
                {isOnline && location === "Online" ? "Online" : isOnline ? `Hybrid (${location})` : location}
              </span>
            </div>

            {isVerified && (
              <div className="flex items-center gap-1 text-[#2563eb]">
                <CheckCircle2 className="w-4 h-4 fill-[#2563eb] text-white" />
                <span className="text-[13px] font-bold font-['Inter',sans-serif]">Verified</span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-0.5">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-bold text-[#161616] font-['Inter',sans-serif]">Mulai: {startDate}</span>
              <span className="text-[10.5px] font-bold text-[#dc2626] font-['Inter',sans-serif]">Deadline: {deadline}</span>
            </div>
            
            <div className="flex items-center gap-1.5 text-[#0E0E0F]">
              <CircleDollarSign className="w-4 h-4 text-[#2563eb]" />
              <span className="text-[10px] font-bold font-['Inter',sans-serif]">{price}</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100 w-full mb-3" />

        {/* Organizer Section */}
        <div className="px-1 flex items-center gap-3">
          <div className="w-[65px] h-[30px] relative shrink-0">
            {organizerLogo ? (
              <Image src={organizerLogo} alt={organizerName || ""} fill className="object-contain" />
            ) : (
              <div className="w-full h-full bg-gray-50 rounded-md flex items-center justify-center border border-gray-100">
                <Image src="/Logo_Icon.png" alt="" fill className="object-contain opacity-20 p-1" />
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-[#bababa] text-[13px] font-bold leading-tight">Diselenggarakan Oleh</span>
            <span className="text-black text-[12px] font-bold line-clamp-1">{organizerName || "Penyelenggara"}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
