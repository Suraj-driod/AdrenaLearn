'use client'
import { useState, useEffect, use } from 'react'
import { Clock, Star, ArrowLeft, Loader2, Rocket, Footprints, Target, Cat, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Sidebar from '../../../../components/Sidebar'
import ProtectedRoute from '../../../../components/ProtectedRoute'
import { useAuth } from '../../../../context/AuthContext'
import { db } from '../../../../../backend/firebase'
import { doc, getDoc } from 'firebase/firestore'

const games = [
  { id: 'spaceship', icon: Rocket, name: 'Spaceship Mission', desc: 'Navigate through code questions as your spaceship flies through the galaxy.', difficulty: 'Medium', time: '5 min', recommended: true, bgColor: 'bg-[#e4f1ff]', iconColor: 'text-blue-600' },
  { id: null, icon: Footprints, name: 'Subway Runner', desc: 'Race through challenges at speed. Dodge wrong answers, collect correct ones.', difficulty: 'Easy', time: '4 min', recommended: false, bgColor: 'bg-[#fff8e7]', iconColor: 'text-[#ea580c]' },
  { id: null, icon: Target, name: 'Balloon Shooter', desc: 'Pop balloons with correct answers before time runs out. Precision matters.', difficulty: 'Hard', time: '6 min', recommended: false, bgColor: 'bg-[#ffd6e4]', iconColor: 'text-[#c0305b]' },
  { id: 'cat-rescue', icon: Cat, name: 'Cat Rescue', desc: 'Solve puzzles to save stranded cats. Each correct answer builds a rescue bridge.', difficulty: 'Medium', time: '5 min', recommended: false, bgColor: 'bg-[#d4f0e0]', iconColor: 'text-[#1e7a4e]' },
]

// Framer Motion Variants
const containerVars = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVars = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
}

function GameSelectionContent({ params }) {
  const { courseId, lessonId } = params
  const { user } = useAuth()
  const [lessonName, setLessonName] = useState('Loading...')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const lessonSnap = await getDoc(doc(db, 'lessons', lessonId))
        if (lessonSnap.exists()) {
          setLessonName(lessonSnap.data().lessonName)
        } else {
          setLessonName('Unknown Lesson')
        }
      } catch (err) {
        console.error('Error fetching lesson name:', err)
        setLessonName('Unknown Lesson')
      } finally {
        setLoading(false)
      }
    }
    fetchLesson()
  }, [lessonId])

  const diffColors = {
    Easy: 'bg-[#d4f0e0] text-[#1e1b26]',
    Medium: 'bg-[#fff3c4] text-[#1e1b26]',
    Hard: 'bg-[#ffd6e4] text-[#1e1b26]'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f5f0] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#f04e7c] animate-spin mb-4" />
        <p className="font-[Outfit] font-black uppercase tracking-widest text-[#1e1b26]">Loading Arena...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f5f0] selection:bg-[#f04e7c] selection:text-white">
      <Sidebar />
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen relative overflow-hidden">

        {/* Background Decorative Elements */}
        <div className="absolute top-[10%] left-[5%] w-[400px] h-[400px] bg-[#ffd6e4] rounded-full mix-blend-multiply filter blur-3xl opacity-50 pointer-events-none" />
        <div className="absolute bottom-[10%] right-[5%] w-[400px] h-[400px] bg-[#fff3c4] rounded-full mix-blend-multiply filter blur-3xl opacity-50 pointer-events-none" />

        <motion.div
          className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
          variants={containerVars}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div variants={itemVars} className="text-center mb-8">
            <h1 className="font-[Outfit] text-[40px] sm:text-[56px] font-black tracking-tight mb-2 text-[#1e1b26] leading-none uppercase">
              Choose Your <br /><span className="text-[#f04e7c]">Challenge</span>
            </h1>
            <p className="text-[#5a5566] text-sm sm:text-base font-bold uppercase tracking-widest mt-3">How do you want to test your knowledge?</p>
          </motion.div>

          {/* Current Lesson Indicator */}
          <motion.div variants={itemVars} className="bg-white border-4 border-[#1e1b26] shadow-[6px_6px_0px_#1e1b26] rounded-[24px] px-5 py-3 mb-12 flex items-center gap-4 max-w-max mx-auto">
            <div className="w-10 h-10 rounded-[14px] bg-[#fbc13a] border-2 border-[#1e1b26] shadow-[2px_2px_0px_#f04e7c] flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5 stroke-[2.5] text-[#1e1b26]" />
            </div>
            <div>
              <div className="text-[9px] text-[#8f8a9e] font-black uppercase tracking-widest">Currently Learning</div>
              <div className="font-black text-base text-[#1e1b26] tracking-tight leading-none mt-0.5">{lessonName}</div>
            </div>
          </motion.div>

          {/* Compact Games Grid */}
          <div className="grid sm:grid-cols-2 gap-6 mb-16">
            {games.map((game, i) => {
              const Icon = game.icon;
              return (
                <motion.div
                  key={i}
                  variants={itemVars}
                  whileHover={{ y: -4, x: -4 }}
                  className={`${game.bgColor} p-6 rounded-[28px] border-4 border-[#1e1b26] shadow-[6px_6px_0px_#1e1b26] transition-all hover:shadow-[10px_10px_0px_#1e1b26] group relative flex flex-col`}
                >
                  {game.recommended && (
                    <div className="absolute -top-4 left-6 bg-[#f04e7c] text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border-2 border-[#1e1b26] shadow-[2px_2px_0px_#1e1b26] flex items-center gap-1 z-20">
                      <Star className="w-3 h-3 fill-white" /> Recommended
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-5">
                    <div className="w-16 h-16 bg-white border-2 border-[#1e1b26] shadow-[4px_4px_0px_#1e1b26] rounded-2xl flex items-center justify-center shrink-0 group-hover:rotate-6 group-hover:scale-105 transition-transform">
                      <Icon className={`w-8 h-8 stroke-[2.5] ${game.iconColor}`} />
                    </div>
                    <div className="flex flex-col items-end gap-2 mt-1">
                      <span className={`text-[9px] font-black px-3 py-1 rounded-lg border-2 border-[#1e1b26] shadow-[2px_2px_0px_rgba(0,0,0,0.1)] uppercase tracking-widest ${diffColors[game.difficulty]}`}>
                        {game.difficulty}
                      </span>
                      <span className="flex items-center gap-1 text-[9px] text-[#1e1b26] bg-white px-3 py-1 rounded-lg border-2 border-[#1e1b26] shadow-[2px_2px_0px_rgba(0,0,0,0.1)] font-black uppercase tracking-widest">
                        <Clock className="w-3 h-3 stroke-[2.5]" /> {game.time}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-[Outfit] text-2xl font-black mb-2 text-[#1e1b26] uppercase tracking-tight leading-none">{game.name}</h3>
                  <p className="text-[#1e1b26]/80 text-xs font-bold leading-relaxed mb-6 flex-1">{game.desc}</p>

                  <div className="mt-auto">
                    {game.id ? (
                      <Link
                        href={`/courses/${courseId}/lessons/${lessonId}/games/${game.id}`}
                        className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-[16px] text-xs uppercase tracking-widest font-black border-4 border-[#1e1b26] transition-all cursor-pointer ${game.recommended
                          ? 'bg-[#f04e7c] text-white shadow-[4px_4px_0px_#1e1b26] hover:bg-[#d9406a] hover:shadow-[2px_2px_0px_#1e1b26] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none'
                          : 'bg-white text-[#1e1b26] shadow-[4px_4px_0px_#1e1b26] hover:bg-[#fbc13a] hover:shadow-[2px_2px_0px_#1e1b26] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none'
                          }`}
                      >
                        Start Mission
                      </Link>
                    ) : (
                      <Link href="/results"
                        className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-[16px] text-xs uppercase tracking-widest font-black border-4 border-[#1e1b26] transition-all ${game.recommended
                          ? 'bg-[#f04e7c] text-white shadow-[4px_4px_0px_#1e1b26] hover:bg-[#d9406a] hover:shadow-[2px_2px_0px_#1e1b26] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none'
                          : 'bg-white text-[#1e1b26] shadow-[4px_4px_0px_#1e1b26] hover:bg-[#fbc13a] hover:shadow-[2px_2px_0px_#1e1b26] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none'
                          }`}
                      >
                        Start Mission
                      </Link>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>

          <motion.div variants={itemVars} className="text-center">
            <Link href={`/courses/${courseId}/${lessonId}`} className="bg-white border-4 border-[#1e1b26] px-6 py-4 rounded-[20px] shadow-[4px_4px_0px_#1e1b26] text-xs text-[#1e1b26] uppercase tracking-widest hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] font-black transition-all inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4 stroke-[3]" /> Not ready? Review intel
            </Link>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}

export default function GameSelectionPage({ params }) {
  const resolvedParams = use(params)

  return (
    <ProtectedRoute>
      <GameSelectionContent params={resolvedParams} />
    </ProtectedRoute>
  )
}