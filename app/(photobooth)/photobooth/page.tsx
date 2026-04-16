"use client"

import Link from "next/link"
import { CameraSelector } from "@/components/photobooth/camera-selector"
import { RecentSessionsGrid } from "@/components/photobooth/recent-sessions"
import { useState } from "react"
import { Camera, Image } from "lucide-react"

export default function PhotoboothHomePage() {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null)

  return (
    <div className="photobooth-page relative flex w-full flex-col" style={{ minHeight: '100dvh' }}>
      <style jsx global>{`
        .botanical-pattern {
          background-image: radial-gradient(
              circle at 10% 20%,
              rgba(85, 107, 47, 0.1) 0%,
              transparent 40%
            ),
            radial-gradient(
              circle at 90% 80%,
              rgba(192, 90, 53, 0.05) 0%,
              transparent 40%
            ),
            url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M40 0c0 10-5 20-15 20s-15-10-15-20M0 40c10 0 20-5 20-15s-10-15-20-15m40 40c0-10 5-20 15-20s15 10 15 20m20-40c-10 0-20 5-20 15s10 15 20 15' stroke='%23556b2f' stroke-width='0.5' fill='none' opacity='0.1'/%3E%3C/svg%3E");
        }
      `}</style>

      <header className="flex items-center justify-between border-b border-[var(--pb-soft-cream)]/10 bg-[var(--pb-forest-green)]/80 backdrop-blur-md px-6 md:px-12 py-4 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-full border border-[var(--pb-champagne)]/30 text-[var(--pb-champagne)]">
            <Camera className="w-5 h-5" />
          </div>
          <h2 className="text-2xl photobooth-header-font font-medium tracking-tight text-[var(--pb-soft-cream)]">
            Lumina <span className="text-[var(--pb-champagne)] italic">Booth</span>
          </h2>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/photobooth"
            className="text-xs uppercase tracking-widest font-medium hover:text-[var(--pb-champagne)] transition-colors text-[var(--pb-soft-cream)]/70"
          >
            Dashboard
          </Link>
          <Link
            href="/photobooth/gallery"
            className="text-xs uppercase tracking-widest font-medium hover:text-[var(--pb-champagne)] transition-colors text-[var(--pb-soft-cream)]/70"
          >
            Past Events
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <CameraSelector
            selectedDeviceId={selectedDeviceId}
            onDeviceSelect={setSelectedDeviceId}
          />
        </div>
      </header>

      <main className="botanical-pattern flex-1 flex flex-col items-center justify-center px-6 py-16 max-w-6xl mx-auto w-full">
        <div className="text-center mb-20">
          <h1 className="text-6xl md:text-8xl photobooth-header-font font-light italic tracking-tight mb-6 text-[var(--pb-soft-cream)] leading-tight">
            Capture the Moment
          </h1>
          <p className="text-[var(--pb-champagne)]/70 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
            An artisanal photobooth experience tailored for your wedding day.
            Seamlessly capture, share, and cherish every memory.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-4xl">
          <Link
            href="/photobooth/session"
            className="group relative overflow-hidden rounded-[3rem] aspect-[4/3] md:aspect-square flex flex-col items-center justify-center p-8 bg-[var(--pb-terracotta)] hover:bg-[#b04d2b] transition-all duration-500 shadow-2xl shadow-black/40"
          >
            <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-700">
              <div className="w-full h-full bg-gradient-to-br from-black/20 to-transparent" />
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="size-28 mb-8 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                <div className="relative">
                  <Camera className="text-[var(--pb-soft-cream)] w-20 h-20 opacity-90" />
                </div>
              </div>
              <h3 className="text-3xl photobooth-header-font text-[var(--pb-soft-cream)] mb-2 font-medium">
                Start New Session
              </h3>
              <p className="text-[var(--pb-champagne)]/80 text-center text-sm font-medium tracking-wide">
                Enter the booth and strike a pose.
              </p>
            </div>

            <div className="absolute bottom-10 right-10 text-[var(--pb-soft-cream)]/30 group-hover:text-[var(--pb-soft-cream)] transition-colors">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </div>
          </Link>

          <Link
            href="/photobooth/gallery"
            className="group relative overflow-hidden rounded-[3rem] aspect-[4/3] md:aspect-square flex flex-col items-center justify-center p-8 bg-[var(--pb-espresso)] hover:bg-[#35251b] transition-all duration-500 shadow-2xl shadow-black/40"
          >
            <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-700">
              <div className="w-full h-full bg-gradient-to-br from-black/20 to-transparent" />
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="size-28 mb-8 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                <div className="relative">
                  <Image className="text-[var(--pb-champagne)] w-20 h-20 opacity-90" />
                </div>
              </div>
              <h3 className="text-3xl photobooth-header-font text-[var(--pb-soft-cream)] mb-2 font-medium">
                View Gallery
              </h3>
              <p className="text-[var(--pb-champagne)]/80 text-center text-sm font-medium tracking-wide">
                Browse through the collection of memories.
              </p>
            </div>

            <div className="absolute bottom-10 right-10 text-[var(--pb-champagne)]/30 group-hover:text-[var(--pb-champagne)] transition-colors">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </div>
          </Link>
        </div>

        <div className="mt-28 w-full">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <span className="h-px w-12 bg-[var(--pb-champagne)]/30"></span>
              <h4 className="text-2xl photobooth-header-font text-[var(--pb-soft-cream)] font-medium">
                Recent Sessions
              </h4>
            </div>
            <Link
              href="/photobooth/gallery"
              className="text-[var(--pb-champagne)] text-xs uppercase tracking-widest font-bold hover:text-[var(--pb-soft-cream)] transition-colors flex items-center gap-2"
            >
              See all events{" "}
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>

          <RecentSessionsGrid />
        </div>
      </main>

      <footer className="mt-auto px-12 py-12 flex flex-col md:flex-row items-center justify-between border-t border-[var(--pb-soft-cream)]/10 text-[var(--pb-champagne)]/50 text-[10px] uppercase tracking-[0.15em]">
        <p className="photobooth-header-font text-xs normal-case tracking-normal">
          © 2024 Lumina Booth Pro. Fine-line elegance for your wedding day.
        </p>
        <div className="flex gap-10 mt-6 md:mt-0 font-semibold">
          <a href="#" className="hover:text-[var(--pb-soft-cream)] transition-colors">
            Privacy
          </a>
          <a href="#" className="hover:text-[var(--pb-soft-cream)] transition-colors">
            Terms
          </a>
          <a href="#" className="hover:text-[var(--pb-soft-cream)] transition-colors">
            Inquiries
          </a>
        </div>
      </footer>
    </div>
  )
}
