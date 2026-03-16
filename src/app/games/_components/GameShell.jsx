"use client";

import Sidebar from "@/app/components/Sidebar";

export default function GameShell({ title, subtitle, left, right }) {
  return (
    <div className="min-h-screen bg-[#1a1520] text-white">
      <Sidebar collapsed />

      <div className="ml-16 min-h-screen flex flex-col">
        <header className="px-6 py-5 border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent">
          <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="font-[Outfit] text-2xl font-black tracking-wide text-[#fbc13a] truncate">
                {title}
              </div>
              {subtitle ? (
                <div className="text-sm text-white/60 font-medium truncate">
                  {subtitle}
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <main className="flex-1 px-6 py-6">
          <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_420px] gap-6 items-stretch">
            <section className="rounded-2xl border border-white/10 bg-black/30 shadow-[0_0_40px_rgba(0,0,0,0.25)] overflow-hidden">
              <div className="h-full w-full">{left}</div>
            </section>

            <aside className="rounded-2xl border border-white/10 bg-black/30 shadow-[0_0_40px_rgba(0,0,0,0.25)] overflow-hidden">
              <div className="h-full w-full">{right}</div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}

