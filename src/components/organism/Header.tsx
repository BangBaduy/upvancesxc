"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Search, User, LogOut, ChevronDown, Bookmark, Menu, X, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/dashboard?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/dashboard");
    }
    setShowMobileMenu(false);
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setIsLoadingUser(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    try { await fetch('/api/auth/clear', { method: 'POST' }); } catch (e) {}
    document.cookie.split(';').forEach(c => {
      const name = c.split('=')[0].trim();
      if (name.startsWith('sb-')) document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
    });
    setShowDropdown(false);
    router.push("/");
  };

  const navLinks = [
    { name: "Rekomendasi Acara", href: "/dashboard" },
    { name: "Kalender", href: "/calendar" },
    { name: "About Us", href: "/about" },
  ];

  const displayName: string =
    (user?.user_metadata?.full_name as string | undefined) ||
    user?.email?.split("@")[0] ||
    "Pengguna";
  const avatarUrl: string | null =
    (user?.user_metadata?.avatar_url as string | undefined) ?? null;

  return (
    <header className="fixed top-0 left-0 w-full h-[75px] bg-white border-b border-black/10 shadow-[0px_4px_2px_rgba(0,0,0,0.1)] z-50 flex items-center justify-center px-4 md:px-10">
      <div className="max-w-[1280px] w-full flex items-center justify-between gap-4">
        {/* Logo Section */}
        <Link href="/" className="flex items-center shrink-0">
          <div className="relative w-[32px] h-[32px] md:hidden">
            <Image src="/Logo_Icon.png" alt="Upvance Logo" fill className="object-contain" sizes="32px" />
          </div>
          <div className="relative hidden md:block w-[100px] lg:w-[120px] h-[35px] lg:h-[40px]">
            <Image src="/Logo.png" alt="Upvance Logo" fill className="object-contain" sizes="120px" />
          </div>
        </Link>

        {/* Desktop Group: Search + Nav (Synced with Figma Typography) */}
        <div className="hidden lg:flex flex-1 items-center justify-center gap-6 xl:gap-10">
          {/* Search Bar - Figma Styled */}
          <form onSubmit={handleSearch} className="relative w-full max-w-[286px]">
            <input
              type="text"
              placeholder="Ketik acara yang dicari"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-[38px] bg-[#6d6d6d]/10 border border-[#b4b4b4] rounded-[30px] pl-11 pr-4 text-[14px] text-gray-800 outline-none focus:ring-2 focus:ring-[#2563eb]/20 transition-all placeholder:text-[#707070]"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#707070]" />
          </form>

          {/* Nav Links - Inter SemiBold 18px */}
          <nav className="flex items-center gap-6 xl:gap-10">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <div key={link.href} className="relative group">
                  <Link
                    href={link.href}
                    className={`text-[15px] xl:text-[18px] font-semibold whitespace-nowrap transition-colors ${
                      isActive ? "text-[#2563eb]" : "text-[#212121] hover:text-[#2563eb]"
                    }`}
                  >
                    {link.name}
                  </Link>
                  {isActive && <div className="absolute -bottom-1 left-0 w-full h-[2px] bg-[#2563eb] rounded-full" />}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Mobile Search - Compact Center */}
        <div className="flex-1 flex lg:hidden justify-center mx-2 max-w-[200px] sm:max-w-[300px]">
          <form onSubmit={handleSearch} className="relative w-full">
            <input
              type="text"
              placeholder="Cari..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-[36px] bg-gray-100 border border-gray-200 rounded-[30px] pl-9 pr-3 text-[12px] text-gray-800 outline-none"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </form>
        </div>

        {/* User Area & Mobile Menu */}
        <div className="flex items-center gap-1 md:gap-3 shrink-0">
          {isLoadingUser ? (
            <div className="hidden sm:block w-[80px] lg:w-[120px] h-[38px] bg-gray-100 rounded-[50px] animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-2 md:gap-4">
              <Link href="/main" className="hidden xl:block">
                <button className={`px-6 py-1.5 rounded-[50px] text-[18px] font-semibold transition-all ${pathname === "/main" ? "bg-[#2563eb] text-white" : "bg-white border border-[#2563eb] text-[#2563eb] hover:bg-blue-50"}`}>
                  Dashboard
                </button>
              </Link>
              <div className="relative">
                <button onClick={() => setShowDropdown((v) => !v)} className="flex items-center gap-2 bg-[#f0f5ff] border border-[#2563eb]/20 text-[#2563eb] p-1.5 md:px-4 md:py-1.5 rounded-full md:rounded-[50px] hover:bg-[#e0ecff] transition-colors">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName} className="w-6 h-6 md:w-7 md:h-7 rounded-full object-cover" />
                  ) : (
                    <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-[#2563eb] flex items-center justify-center">
                      <span className="text-white text-[10px] md:text-[11px] font-bold">{displayName.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                  <span className="hidden sm:inline text-[13px] md:text-[14px] font-semibold max-w-[60px] lg:max-w-[100px] truncate">{displayName}</span>
                  <ChevronDown className="hidden sm:block w-3 h-3 md:w-4 md:h-4 transition-transform" />
                </button>
                {showDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                    <div className="absolute right-0 top-[calc(100%+8px)] bg-white border border-gray-100 rounded-[12px] shadow-lg py-1 w-[200px] z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-[12px] text-gray-500">Masuk sebagai</p>
                        <p className="text-[13px] font-semibold text-gray-800 truncate">{user.email}</p>
                      </div>
                      <Link href="/main" onClick={() => setShowDropdown(false)} className="flex lg:hidden items-center gap-2 px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"><Calendar className="w-4 h-4" /> Dashboard</Link>
                      <Link href="/settings/profile" onClick={() => setShowDropdown(false)} className="flex items-center gap-2 px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"><User className="w-4 h-4" /> Edit Profil</Link>
                      <Link href="/bookmarks" onClick={() => setShowDropdown(false)} className="flex items-center gap-2 px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"><Bookmark className="w-4 h-4" /> Bookmark Saya</Link>
                      <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-[13px] text-red-500 hover:bg-red-50 transition-colors border-t border-gray-100"><LogOut className="w-4 h-4" /> Keluar</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <Link href="/login">
              <button className="flex items-center gap-2 bg-[#2563eb] text-white p-2 md:px-6 md:py-1.5 rounded-full md:rounded-[50px] hover:bg-blue-700 transition-colors shadow-md">
                <User className="w-5 h-5 md:w-6 md:h-6" />
                <span className="hidden sm:inline text-[16px] md:text-[18px] font-semibold">Masuk</span>
              </button>
            </Link>
          )}
          <button className="block lg:hidden p-2 text-[#212121]" onClick={() => setShowMobileMenu(!showMobileMenu)} aria-label="Toggle menu">
            {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Side Drawer Menu */}
      {showMobileMenu && (
        <>
          <div className="fixed inset-0 top-[75px] bg-black/40 z-[55] animate-in fade-in duration-200" onClick={() => setShowMobileMenu(false)} />
          <div className="fixed right-0 top-[75px] bottom-0 w-[280px] bg-white z-[60] flex flex-col p-6 shadow-[-10px_0_30px_rgba(0,0,0,0.1)] animate-in slide-in-from-right duration-300">
            <nav className="flex flex-col gap-5">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setShowMobileMenu(false)} className={`text-[18px] font-semibold py-2 transition-colors ${pathname === link.href ? "text-[#2563eb]" : "text-[#212121] active:text-[#2563eb]"}`}>
                  {link.name}
                </Link>
              ))}
            </nav>
            <div className="mt-auto pt-6 border-t border-gray-100">
              <p className="text-[12px] text-gray-400 mb-4">© 2024 Upvance</p>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
