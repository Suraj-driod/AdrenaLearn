'use client'
import { useSearchParams } from 'next/navigation'
import { ArrowUp, RotateCcw, Gamepad2, Trophy, Target, Zap, Star } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import ProtectedRoute from '../components/ProtectedRoute'

function ResultsContent() {
  const searchParams = useSearchParams()
  
  // Get values from URL or use defaults
  const baseScore = parseInt(searchParams.get('baseScore') || '0')
  const bonus = parseInt(searchParams.get('bonus') || '0')
  const accuracy = searchParams.get('accuracy') || '0'
  const totalScore = baseScore + bonus

  return (
    <main className="min-h-screen bg-[#f7f5f0] relative overflow-hidden">
      {/* Background blobs and confetti dots remain same */}
      
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center mb-10"
        >
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="font-[Outfit] text-[36px] sm:text-[48px] font-black tracking-[-2px] mb-2 text-[#1e1b26]">Mission Complete!</h1>
          <p className="text-[#5a5566] text-lg font-bold uppercase tracking-widest">Rank Updated: Sergeant</p>
        </motion.div>

        {/* Dynamic Score Card */}
        <div className="bg-white border-4 border-[#1e1b26] shadow-[12px_12px_0px_#1e1b26] rounded-[40px] p-8 text-center mb-10">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-12">
            <div className="relative">
              <svg className="w-40 h-40 -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="#eae5d9" strokeWidth="12" />
                <motion.circle 
                  initial={{ strokeDasharray: "0 327" }}
                  animate={{ strokeDasharray: `${(parseInt(accuracy) / 100) * 327} 327` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  cx="60" cy="60" r="52" fill="none" stroke="#f04e7c" strokeWidth="12" strokeLinecap="round" 
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-[Outfit] text-4xl font-black">{accuracy}%</span>
                <span className="text-[10px] text-[#5a5566] font-black uppercase">Accuracy</span>
              </div>
            </div>
            <div className="text-center sm:text-left">
              <div className="text-xs font-black text-[#8f8a9e] uppercase tracking-widest mb-1 text-center">Total Yield</div>
              <div className="font-[Outfit] text-[72px] font-black text-[#f04e7c] leading-none drop-shadow-[4px_4px_0px_#1e1b26] inline-block">
                {totalScore.toLocaleString()}
              </div>
              <div className="text-sm text-[#1e1b26] font-black uppercase mt-2 text-center">Points Earned</div>
            </div>
          </div>
        </div>

        {/* Real Breakdown */}
        <div className="grid grid-cols-2 gap-4 mb-8">
           <div className="bg-[#fff3c4] border-2 border-[#1e1b26] p-5 rounded-3xl shadow-[4px_4px_0px_#1e1b26]">
              <p className="text-[10px] font-black uppercase opacity-60">Base Reward</p>
              <p className="text-2xl font-black">{baseScore} XP</p>
           </div>
           <div className="bg-[#ffd6e4] border-2 border-[#1e1b26] p-5 rounded-3xl shadow-[4px_4px_0px_#1e1b26]">
              <p className="text-[10px] font-black uppercase opacity-60">Sensei Bonus</p>
              <p className="text-2xl font-black text-[#f04e7c]">+{bonus} XP</p>
           </div>
        </div>

        {/* CTAs */}
        <div className="grid sm:grid-cols-2 gap-6 mb-12">
          <Link href="/courses" className="bg-[#1e1b26] text-white font-black py-5 rounded-2xl border-4 border-[#1e1b26] shadow-[8px_8px_0px_#f04e7c] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all text-center uppercase tracking-widest text-sm">
             Next Lesson →
          </Link>
          <button onClick={() => window.location.reload()} className="bg-white text-[#1e1b26] font-black py-5 rounded-2xl border-4 border-[#1e1b26] shadow-[8px_8px_0px_#1e1b26] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all text-center uppercase tracking-widest text-sm flex items-center justify-center gap-2">
            <RotateCcw className="w-5 h-5" /> Retry Mission
          </button>
        </div>
      </div>
    </main>
  )
}

export default function ResultsPage() {
  return (
    <ProtectedRoute>
      <ResultsContent />
    </ProtectedRoute>
  )
}