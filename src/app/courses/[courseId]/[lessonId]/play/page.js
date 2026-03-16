'use client'
<<<<<<< HEAD
import { useState } from 'react'
import { Clock, Star, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import Sidebar from '../../../../components/Sidebar'

// Lazy-load the Among Us game (uses Phaser which needs window/document)
const AmongUsGame = dynamic(
  () => import('@/Games/Among-Us/api/Among_us/page.js'),
  { ssr: false, loading: () => (
    <div className="flex items-center justify-center h-[600px] bg-[#1e1b26] rounded-[32px] border-2 border-[#1e1b26]">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#f04e7c] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white font-black text-lg">Loading Game...</p>
      </div>
    </div>
  )}
)
=======
import { useState, useEffect, use } from 'react'
import { Clock, Star, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Sidebar from '../../../../components/Sidebar'
import ProtectedRoute from '../../../../components/ProtectedRoute'
import { useAuth } from '../../../../context/AuthContext'
import { db } from '../../../../../backend/firebase'
import { doc, getDoc } from 'firebase/firestore'
>>>>>>> origin/main

const games = [
  { id: 'among-us', icon: '🚀', name: 'Spaceship Mission', desc: 'Navigate through code questions as your spaceship flies through the galaxy.', difficulty: 'Medium', time: '5 min', recommended: true, bgColor: 'bg-[#e4f1ff]' },
  { id: null, icon: '🏃', name: 'Subway Runner', desc: 'Race through challenges at speed. Dodge wrong answers, collect correct ones.', difficulty: 'Easy', time: '4 min', recommended: false, bgColor: 'bg-[#fff8e7]' },
  { id: null, icon: '🎈', name: 'Balloon Shooter', desc: 'Pop balloons with correct answers before time runs out. Precision matters.', difficulty: 'Hard', time: '6 min', recommended: false, bgColor: 'bg-[#ffd6e4]' },
  { id: null, icon: '🐱', name: 'Cat Rescue', desc: 'Solve puzzles to save stranded cats. Each correct answer builds a rescue bridge.', difficulty: 'Medium', time: '5 min', recommended: false, bgColor: 'bg-[#d4f0e0]' },
]

<<<<<<< HEAD
export default function GameSelectionPage() {
  const [selectedGame, setSelectedGame] = useState(null)
=======
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
>>>>>>> origin/main

  const diffColors = {
    Easy: 'bg-[#d4f0e0] text-[#1e1b26]',
    Medium: 'bg-[#fff3c4] text-[#1e1b26]',
    Hard: 'bg-[#ffd6e4] text-[#1e1b26]'
  }

<<<<<<< HEAD
  // If a game is selected, show that game
  if (selectedGame === 'among-us') {
    return (
      <div className="min-h-screen bg-[#1e1b26]">
        <Sidebar />
        <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <button
              onClick={() => setSelectedGame(null)}
              className="mb-6 bg-white border-2 border-[#1e1b26] px-6 py-3 rounded-full shadow-[4px_4px_0px_#1e1b26] text-sm text-[#1e1b26] hover:shadow-[6px_6px_0px_#1e1b26] font-black transition-all inline-flex items-center gap-2 hover:-translate-y-1"
            >
              <ArrowLeft className="w-5 h-5 stroke-[3]" /> Back to Games
            </button>
            <AmongUsGame />
          </div>
        </main>
=======
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f5f0] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#f04e7c] animate-spin mb-4" />
        <p className="font-[Outfit] font-bold text-[#1e1b26]">Loading game options...</p>
>>>>>>> origin/main
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f5f0]">
      <Sidebar />
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen relative overflow-hidden">

        {/* Background Decorative Elements */}
        <div className="blob w-[300px] h-[300px] bg-[#ffd6e4] top-[10%] left-[5%]" />
        <div className="blob w-[300px] h-[300px] bg-[#fff3c4] bottom-[10%] right-[5%]" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-10 animate-slide-up">
            <h1 className="font-[Outfit] text-[40px] sm:text-[56px] font-black tracking-tight mb-3 text-[#1e1b26]">
              Choose Your <span className="text-[#f04e7c]">Challenge</span>
            </h1>
            <p className="text-[#5a5566] text-xl font-bold">How do you want to test your knowledge?</p>
          </div>

          {/* Current Lesson Indicator */}
          <div className="bg-white border-2 border-[#1e1b26] shadow-[4px_4px_0px_#1e1b26] rounded-3xl px-6 py-4 mb-10 flex items-center gap-4 max-w-max mx-auto animate-slide-up [animation-delay:0.1s]">
            <div className="w-12 h-12 rounded-2xl bg-[#fbc13a] border-2 border-[#1e1b26] flex items-center justify-center text-2xl">📖</div>
            <div>
              <div className="text-[10px] text-[#8f8a9e] font-black uppercase tracking-widest">Currently Learning</div>
              <div className="font-black text-lg text-[#1e1b26]">{lessonName}</div>
            </div>
          </div>

          {/* Games Grid */}
          <div className="grid sm:grid-cols-2 gap-8 mb-12">
            {games.map((game, i) => (
              <div
                key={i}
                className={`${game.bgColor} p-8 rounded-[32px] border-2 border-[#1e1b26] shadow-[6px_6px_0px_#1e1b26] transition-all hover:shadow-[10px_10px_0px_#1e1b26] hover:-translate-y-1 hover:-translate-x-1 group relative animate-slide-up`}
                style={{ animationDelay: `${0.2 + i * 0.1}s` }}
              >
                {game.recommended && (
                  <div className="absolute -top-4 left-8 bg-[#f04e7c] text-white text-[10px] font-black px-4 py-2 rounded-full border-2 border-[#1e1b26] shadow-[3px_3px_0px_#1e1b26] flex items-center gap-1.5 z-20">
                    <Star className="w-3.5 h-3.5 fill-white" /> RECOMMENDED
                  </div>
                )}

                <div className="flex items-start justify-between mb-6">
                  <div className="w-20 h-20 bg-white border-2 border-[#1e1b26] shadow-[4px_4px_0px_#1e1b26] rounded-2xl flex items-center justify-center text-[52px] group-hover:scale-110 transition-transform">
                    {game.icon}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-[10px] font-black px-3 py-1.5 rounded-full border-2 border-[#1e1b26] shadow-[2px_2px_0px_#1e1b26] ${diffColors[game.difficulty]}`}>
                      {game.difficulty.toUpperCase()}
                    </span>
                    <span className="flex items-center gap-1.5 text-[10px] text-[#1e1b26] bg-white px-3 py-1.5 rounded-full border-2 border-[#1e1b26] shadow-[2px_2px_0px_#1e1b26] font-black uppercase">
                      <Clock className="w-3.5 h-3.5 stroke-[3]" /> {game.time}
                    </span>
                  </div>
                </div>

                <h3 className="font-[Outfit] text-2xl font-black mb-3 text-[#1e1b26]">{game.name}</h3>
                <p className="text-[#1e1b26]/70 text-sm font-bold leading-relaxed mb-8">{game.desc}</p>

                {game.id ? (
                  <button
                    onClick={() => setSelectedGame(game.id)}
                    className={`w-full flex items-center justify-center gap-2 py-4 rounded-full text-base font-black border-2 border-[#1e1b26] transition-all cursor-pointer ${game.recommended
                      ? 'bg-[#f04e7c] text-white shadow-[4px_4px_0px_#1e1b26] hover:shadow-[6px_6px_0px_#1e1b26] hover:translate-x-[-1px] hover:translate-y-[-1px]'
                      : 'bg-white text-[#1e1b26] shadow-[4px_4px_0px_#1e1b26] hover:bg-[#fbc13a] hover:shadow-[6px_6px_0px_#1e1b26] hover:translate-x-[-1px] hover:translate-y-[-1px]'
                      }`}
                  >
                    Start Game Challenge
                  </button>
                ) : (
                  <Link href="/results"
                    className={`w-full flex items-center justify-center gap-2 py-4 rounded-full text-base font-black border-2 border-[#1e1b26] transition-all ${game.recommended
                      ? 'bg-[#f04e7c] text-white shadow-[4px_4px_0px_#1e1b26] hover:shadow-[6px_6px_0px_#1e1b26] hover:translate-x-[-1px] hover:translate-y-[-1px]'
                      : 'bg-white text-[#1e1b26] shadow-[4px_4px_0px_#1e1b26] hover:bg-[#fbc13a] hover:shadow-[6px_6px_0px_#1e1b26] hover:translate-x-[-1px] hover:translate-y-[-1px]'
                      }`}
                  >
                    Start Game Challenge
                  </Link>
                )}
              </div>
            ))}
          </div>

          <div className="text-center animate-slide-up [animation-delay:0.8s]">
            <Link href={`/courses/${courseId}/${lessonId}`} className="bg-white border-2 border-[#1e1b26] px-8 py-4 rounded-full shadow-[4px_4px_0px_#1e1b26] text-sm text-[#1e1b26] hover:shadow-[6px_6px_0px_#1e1b26] font-black transition-all inline-flex items-center gap-2 hover:-translate-y-1">
              <ArrowLeft className="w-5 h-5 stroke-[3]" /> Not ready yet? Review the lesson again
            </Link>
          </div>
        </div>
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