"use client";

import Sidebar from "@/app/components/Sidebar";

export default function GameShell({ title, subtitle, left, right }) {
  return (
    <div className="min-h-screen bg-[#f7f5f0]">
      <Sidebar />

      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen overflow-x-hidden">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="font-[Outfit] text-2xl sm:text-3xl font-black tracking-tight text-[#1e1b26]">
                {title}
              </h1>
              {subtitle ? (
                <p className="text-[#5a5566] mt-1 text-sm font-medium">
                  {subtitle}
                </p>
              ) : null}
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-6 items-stretch">
            <section className="bg-white rounded-[32px] border-2 border-[#1e1b26] shadow-[4px_4px_0px_#1e1b26] overflow-hidden">
              <div className="h-full w-full">{left}</div>
            </section>

            <aside className="bg-white rounded-[32px] border-2 border-[#1e1b26] shadow-[4px_4px_0px_#1e1b26] overflow-hidden">
              <div className="h-full w-full">{right}</div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
