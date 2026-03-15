'use client'
import { ArrowUp, Brain, RotateCcw, Gamepad2, ChevronRight, Trophy, Clock, Target, Zap } from 'lucide-react'
import Link from 'next/link'

export default function ResultsPage() {
  return (
    <main className="min-h-screen bg-[#f7f5f0] relative overflow-hidden">
      {/* Confetti dots */}
      <div className="absolute inset-0 pointer-events-none">
        {[
          { top: '8%', left: '5%', color: 'bg-[#f04e7c]', size: 'w-3 h-3' },
          { top: '12%', left: '15%', color: 'bg-[#fbc13a]', size: 'w-2 h-2' },
          { top: '6%', left: '30%', color: 'bg-[#4ade80]', size: 'w-2.5 h-2.5' },
          { top: '15%', right: '12%', color: 'bg-[#f04e7c]', size: 'w-2 h-2' },
          { top: '10%', right: '25%', color: 'bg-[#fbc13a]', size: 'w-3 h-3' },
          { top: '4%', right: '35%', color: 'bg-[#60a5fa]', size: 'w-2 h-2' },
          { top: '18%', left: '45%', color: 'bg-[#4ade80]', size: 'w-2 h-2' },
          { top: '7%', left: '60%', color: 'bg-[#f04e7c]', size: 'w-2.5 h-2.5' },
        ].map((d, i) => (
          <div key={i} className={`absolute ${d.size} ${d.color} rounded-full animate-pulse-soft`} style={{ top: d.top, left: d.left, right: d.right, animationDelay: `${i * 0.3}s` }} />
        ))}
      </div>

      <div className="blob w-[400px] h-[400px] bg-[#ffd6e4] top-[20%] left-[5%]" />
      <div className="blob w-[350px] h-[350px] bg-[#fff3c4] bottom-[15%] right-[5%]" style={{ animationDelay: '2s' }} />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-10 animate-slide-up">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="font-[Outfit] text-[36px] sm:text-[48px] font-black tracking-[-2px] mb-2">Mission Complete!</h1>
          <p className="text-[#5a5566] text-lg">You crushed the Spaceship Mission challenge</p>
        </div>

        {/* Score Card */}
        <div className="bento-card !rounded-[40px] p-8 text-center mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            <div className="relative">
              <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="#eae5d9" strokeWidth="10" />
                <circle cx="60" cy="60" r="52" fill="none" stroke="url(#scoreGrad)" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 52 * 0.8} ${2 * Math.PI * 52 * 0.2}`} />
                <defs>
                  <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f04e7c" />
                    <stop offset="100%" stopColor="#fbc13a" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-[Outfit] text-3xl font-black">80%</span>
                <span className="text-xs text-[#5a5566] font-semibold">Accuracy</span>
              </div>
            </div>
            <div>
              <div className="text-sm text-[#5a5566] font-medium mb-1">Total Score</div>
              <div className="font-[Outfit] text-[56px] font-black text-[#f04e7c] leading-none">1,250</div>
              <div className="text-sm text-[#5a5566] font-medium mt-1">points</div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {[
            { icon: '🎯', value: '8/10', label: 'Correct', color: 'bg-[#d4f0e0]' },
            { icon: '⏱️', value: '1:45', label: 'Time', color: 'bg-[#fff3c4]' },
            { icon: '⚡', value: '10', label: 'Tasks', color: 'bg-[#ede4ff]' },
          ].map((s, i) => (
            <div key={i} className="bento-card !rounded-3xl !p-4 text-center">
              <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center text-xl mx-auto mb-2`}>{s.icon}</div>
              <div className="font-[Outfit] text-xl font-black">{s.value}</div>
              <div className="text-xs text-[#5a5566] font-medium">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Comparison + Rank */}
        <div className="grid sm:grid-cols-2 gap-4 mb-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="bento-card !rounded-3xl !p-5">
            <div className="text-sm text-[#5a5566] font-medium mb-2">vs your last round</div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#d4f0e0] flex items-center justify-center"><ArrowUp className="w-4 h-4 text-[#1e7a4e]" /></div>
              <span className="font-[Outfit] text-2xl font-black text-[#1e7a4e]">+150</span>
              <span className="text-sm text-[#5a5566]">points up</span>
            </div>
          </div>
          <div className="bento-card !rounded-3xl !p-5">
            <div className="text-sm text-[#5a5566] font-medium mb-2">Weekly Ranking</div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#fff3c4] flex items-center justify-center">🏆</div>
              <span className="font-[Outfit] text-2xl font-black">#38</span>
              <span className="text-sm text-[#5a5566]">You moved up!</span>
            </div>
          </div>
        </div>

        {/* Bonus */}
        <div className="bg-[#fbc13a] border-2 border-[#1e1b26] shadow-[4px_4px_0px_#1e1b26] rounded-3xl p-5 flex items-center gap-4 mb-8 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="text-3xl">🧠</div>
          <div className="flex-1">
            <div className="font-bold text-sm">Kode Sensei Bonus</div>
            <div className="text-[#5a5566] text-xs">Answer Sensei&apos;s follow-up questions</div>
          </div>
          <div className="font-[Outfit] text-xl font-black text-[#1e1b26]">+6 pts</div>
        </div>

        {/* CTAs */}
        <div className="grid sm:grid-cols-2 gap-4 mb-6 animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <Link href="/interview/1" className="btn-brutal w-full text-center">🧠 Talk to Kode Sensei</Link>
          <Link href="/courses/ce/lesson-2" className="btn-brutal btn-brutal-outline w-full text-center">Next Lesson →</Link>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-[#5a5566] font-semibold">
          <button className="flex items-center gap-1 hover:text-[#f04e7c] transition-colors"><RotateCcw className="w-4 h-4" /> Retry Same Game</button>
          <span className="text-[#eae5d9]">•</span>
          <Link href="/courses/ce/lesson-1/play" className="flex items-center gap-1 hover:text-[#f04e7c] transition-colors"><Gamepad2 className="w-4 h-4" /> Try Different Mode</Link>
        </div>
      </div>
    </main>
  )
}
