'use client'
import { useState, useEffect, use } from 'react'
import { Clock, Star, ArrowLeft, Loader2, Target, Cat, BookOpen, Crosshair, Lock, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Sidebar from '../../../../components/Sidebar'
import ProtectedRoute from '../../../../components/ProtectedRoute'
import { useAuth } from '../../../../context/AuthContext'
import { db } from '../../../../../backend/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { isUserRegistered, registerForCourse } from '../../../../../database/courseData'

const games = [
  {
    id: 'balloon-shooter',
    icon: Crosshair,
    name: 'Balloon Shooter',
    desc: 'Pop balloons with correct answers before time runs out. Precision matters.',
    difficulty: 'Medium',
    time: '5 min',
    recommended: true,
    bgColor: 'bg-[#ffd6e4]',
    iconColor: 'text-[#c0305b]',
    route: '/games/balloon-shooter'
  },
  {
    id: 'among-us',
    icon: Target,
    name: 'Among Us: Code Edition',
    desc: 'Explore the room, find objects, and solve code challenges before time runs out.',
    difficulty: 'Hard',
    time: '6 min',
    recommended: false,
    bgColor: 'bg-[#e4f1ff]',
    iconColor: 'text-[#3b82f6]',
    route: '/games/among-us'
  },
  {
    id: 'kat-mage',
    icon: Cat,
    name: 'Kat Mage',
    desc: 'Guide the cat through dangerous levels. Solve code puzzles to survive each scene.',
    difficulty: 'Medium',
    time: '5 min',
    recommended: false,
    bgColor: 'bg-[#d4f0e0]',
    iconColor: 'text-[#1e7a4e]',
    route: '/games/kat-mage'
  },
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
  const [lessonTopic, setLessonTopic] = useState('variables')
  const [loading, setLoading] = useState(true)
  const [registered, setRegistered] = useState(false)
  const [checkingRegistration, setCheckingRegistration] = useState(true)
  const [enrolling, setEnrolling] = useState(false)

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const lessonSnap = await getDoc(doc(db, 'lessons', lessonId))
        if (lessonSnap.exists()) {
          const data = lessonSnap.data()
          setLessonName(data.lessonName)
          setLessonTopic(data.topic || 'variables')
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

  useEffect(() => {
    if (!user) return
    const checkRegistration = async () => {
      try {
        const result = await isUserRegistered(user.uid, courseId)
        setRegistered(result)
      } catch (err) {
        console.error('Error checking registration:', err)
      } finally {
        setCheckingRegistration(false)
      }
    }
    checkRegistration()
  }, [user, courseId])

  const handleEnroll = async () => {
    if (!user || enrolling) return
    setEnrolling(true)
    try {
      await registerForCourse(user.uid, courseId)
      setRegistered(true)
    } catch (err) {
      console.error('Enrollment failed:', err)
    } finally {
      setEnrolling(false)
    }
  }

  const diffColors = {
    Easy: 'bg-[#d4f0e0] text-[#1e1b26]',
    Medium: 'bg-[#fff3c4] text-[#1e1b26]',
    Hard: 'bg-[#ffd6e4] text-[#1e1b26]'
  }

  if (loading || checkingRegistration) {
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
      <main className="lg:ml-56 pt-16 lg:pt-0 min-h-screen relative overflow-hidden">

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

          {/* Gating Banner */}
          {!registered && (
            <motion.div variants={itemVars} className="bg-[#262333] border-4 border-[#1e1b26] shadow-[6px_6px_0px_#f04e7c] rounded-[24px] p-6 sm:p-8 mb-10 text-center">
              <div className="w-16 h-16 mx-auto bg-[#3a3545] rounded-2xl border-2 border-[#4a4555] flex items-center justify-center mb-5">
                <Lock className="w-8 h-8 text-[#fbc13a] stroke-[2.5]" />
              </div>
              <h2 className="font-[Outfit] text-2xl sm:text-3xl font-black text-white mb-3 tracking-tight">
                Games Locked
              </h2>
              <p className="text-[#a19db0] text-sm font-medium mb-6 max-w-md mx-auto leading-relaxed">
                Register for this course to unlock game challenges and start earning XP. Your progress will be tracked automatically.
              </p>
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="bg-[#fbc13a] text-[#1e1b26] font-black px-8 py-4 rounded-full border-2 border-[#1e1b26] shadow-[4px_4px_0px_#1e1b26] hover:shadow-[6px_6px_0px_#1e1b26] hover:-translate-x-1 hover:-translate-y-1 transition-all disabled:opacity-50 inline-flex items-center gap-2 uppercase tracking-widest text-sm"
              >
                {enrolling ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Enrolling...</>
                ) : (
                  <><CheckCircle2 className="w-5 h-5 stroke-[2.5]" /> Register Now</>
                )}
              </button>
            </motion.div>
          )}

          {/* Games Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {games.map((game, i) => {
              const Icon = game.icon;
              const gameUrl = `${game.route}?topic=${encodeURIComponent(lessonTopic)}&lessonId=${encodeURIComponent(lessonId)}&courseId=${encodeURIComponent(courseId)}`;

              return (
                <motion.div
                  key={i}
                  variants={itemVars}
                  whileHover={registered ? { y: -4, x: -4 } : {}}
                  className={`${game.bgColor} p-6 rounded-[28px] border-4 border-[#1e1b26] shadow-[6px_6px_0px_#1e1b26] transition-all ${registered ? 'hover:shadow-[10px_10px_0px_#1e1b26]' : 'opacity-60 grayscale-[30%]'} group relative flex flex-col`}
                >
                  {game.recommended && registered && (
                    <div className="absolute -top-4 left-6 bg-[#f04e7c] text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border-2 border-[#1e1b26] shadow-[2px_2px_0px_#1e1b26] flex items-center gap-1 z-20">
                      <Star className="w-3 h-3 fill-white" /> Recommended
                    </div>
                  )}

                  {!registered && (
                    <div className="absolute top-4 right-4 w-8 h-8 bg-white/80 border-2 border-[#1e1b26] rounded-lg flex items-center justify-center z-20">
                      <Lock className="w-4 h-4 text-[#5a5566] stroke-[2.5]" />
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
                    {registered ? (
                      <Link
                        href={gameUrl}
                        className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-[16px] text-xs uppercase tracking-widest font-black border-4 border-[#1e1b26] transition-all cursor-pointer ${game.recommended
                          ? 'bg-[#f04e7c] text-white shadow-[4px_4px_0px_#1e1b26] hover:bg-[#d9406a] hover:shadow-[2px_2px_0px_#1e1b26] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none'
                          : 'bg-white text-[#1e1b26] shadow-[4px_4px_0px_#1e1b26] hover:bg-[#fbc13a] hover:shadow-[2px_2px_0px_#1e1b26] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none'
                          }`}
                      >
                        Start Mission
                      </Link>
                    ) : (
                      <div className="w-full flex items-center justify-center gap-2 py-3.5 rounded-[16px] text-xs uppercase tracking-widest font-black border-4 border-[#1e1b26]/40 bg-[#eae5d9] text-[#8f8a9e] cursor-not-allowed">
                        <Lock className="w-3.5 h-3.5 stroke-[2.5]" /> Locked
                      </div>
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