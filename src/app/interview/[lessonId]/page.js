'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Send, SkipForward, X, Loader2, Brain, Sparkles, Zap } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import ProtectedRoute from '../../components/ProtectedRoute'
import { useAuth } from '../../context/AuthContext'
import { auth } from '../../../backend/firebase'
import { addInterviewPoints } from '../../../database/gameData'

function InterviewContent() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const baseScore = searchParams.get('baseScore') || '0'
  const accuracy = searchParams.get('accuracy') || '0'
  const topic = searchParams.get('topic') || ''

  const [messages, setMessages] = useState([
    {
      role: 'sensei',
      text: topic
        ? `Great mission! You did great exploring "${topic}". Now let's test your deeper understanding with a quick interview. Let's start: Can you explain the core purpose or fundamental mechanism of ${topic}?`
        : "Great game! You scored well on Variables in Python. Now is when you can get extra points if you give satisfactory answers to my interview questions. Let's start with: do you really think gamification of education has positive effects?",
    },
  ])

  useEffect(() => {
    if (typeof window !== 'undefined' && topic) {
      try {
        const cached = sessionStorage.getItem('adrenalearn_search_game_data')
        if (cached) {
          const parsed = JSON.parse(cached)
          if (parsed && parsed.interviewStarter) {
            setMessages([{ role: 'sensei', text: parsed.interviewStarter }])
          }
        }
      } catch (err) {
        console.warn('Could not read cached interview starter:', err)
      }
    }
  }, [topic])

  const [input, setInput] = useState('')
  const [bonusPoints, setBonusPoints] = useState(0)
  const [currentQ, setCurrentQ] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const totalQ = 3
  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const newMessages = [...messages, { role: 'student', text: input }]
    setMessages(newMessages)
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          currentQ: currentQ,
          totalQ: totalQ,
          topic: topic || 'Computer Science',
        }),
      })

      if (!response.ok) throw new Error('API Error')
      const data = await response.json()

      setMessages((prev) => [...prev, { role: 'sensei', text: data.reply }])

      let updatedBonus = bonusPoints
      if (data.isCorrect) {
        updatedBonus += data.pointsAwarded
        setBonusPoints(updatedBonus)
      }

      if (currentQ < totalQ) {
        setCurrentQ((q) => q + 1)
      } else {
        setIsFinished(true)
        const currentUser = auth.currentUser
        if (currentUser) {
          await addInterviewPoints(currentUser.uid, updatedBonus)
        }

        setTimeout(() => {
          router.push(
            `/results?baseScore=${baseScore}&bonus=${updatedBonus}&accuracy=${accuracy}`
          )
        }, 4000)
      }
    } catch (error) {
      console.error(error)
      setMessages((prev) => [
        ...prev,
        {
          role: 'sensei',
          text: 'Oops, my circuits got crossed! Could you try sending that again? 🤖',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = () => {
    router.push(
      `/results?baseScore=${baseScore}&bonus=${bonusPoints}&accuracy=${accuracy}`
    )
  }

  return (
    <main className="min-h-screen bg-[#f7f5f0] flex flex-col relative overflow-hidden">
      {/* Background */}
      <div className="blob w-[400px] h-[400px] bg-[#ffd6e4] top-[5%] left-[-5%] absolute rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob" />
      <div
        className="blob w-[350px] h-[350px] bg-[#fff3c4] bottom-[5%] right-[-5%] absolute rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"
        style={{ animationDelay: '3s' }}
      />

      {/* Header */}
      <div className="relative z-20 bg-white/80 backdrop-blur-xl border-b-2 border-[#eae5d9] px-4 sm:px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1e1b26] border-2 border-[#1e1b26] flex items-center justify-center shadow-[3px_3px_0px_#f04e7c]">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-[Outfit] font-black text-lg text-[#1e1b26] leading-tight">
                Kode Sensei
              </h1>
              <p className="text-[10px] font-bold text-[#8f8a9e] uppercase tracking-widest">
                {topic ? `Topic Interview: ${topic}` : 'Bonus Interview Round'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Progress */}
            <div className="flex items-center gap-2 bg-[#fbc13a] border-2 border-[#1e1b26] shadow-[3px_3px_0px_#1e1b26] rounded-full px-4 py-2">
              <Zap className="w-4 h-4 text-[#1e1b26]" />
              <span className="text-xs font-black text-[#1e1b26]">
                Q{Math.min(currentQ, totalQ)}/{totalQ}
              </span>
            </div>
            {/* Bonus Counter */}
            <div className="bg-[#d4f0e0] border-2 border-[#1e1b26] shadow-[3px_3px_0px_#1e1b26] rounded-full px-4 py-2">
              <span className="text-xs font-black text-[#1e7a4e]">
                +{bonusPoints} XP
              </span>
            </div>
            {/* Skip */}
            <button
              onClick={handleSkip}
              className="flex items-center gap-1.5 text-xs font-bold text-[#8f8a9e] hover:text-[#1e1b26] px-3 py-2 rounded-xl hover:bg-[#eae5d9]/50 transition-colors"
            >
              <SkipForward className="w-3.5 h-3.5" />
              <span>Skip</span>
            </button>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 relative z-10">
        <div className="max-w-3xl mx-auto space-y-4">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-3 ${
                  msg.role === 'student' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'sensei' && (
                  <div className="w-8 h-8 rounded-xl bg-[#1e1b26] border-2 border-[#1e1b26] flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#fbc13a]">
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl p-4 sm:p-5 border-2 border-[#1e1b26] text-sm leading-relaxed ${
                    msg.role === 'student'
                      ? 'bg-[#1e1b26] text-white shadow-[4px_4px_0px_#f04e7c]'
                      : 'bg-white text-[#1e1b26] shadow-[4px_4px_0px_#1e1b26]'
                  }`}
                >
                  <p className="font-bold whitespace-pre-wrap">{msg.text}</p>
                </div>

                {msg.role === 'student' && (
                  <div className="w-8 h-8 rounded-xl bg-[#f04e7c] border-2 border-[#1e1b26] flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#1e1b26]">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-xs font-bold text-[#8f8a9e] pl-11"
            >
              <Loader2 className="w-4 h-4 animate-spin text-[#f04e7c]" />
              <span>Kode Sensei is thinking...</span>
            </motion.div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="relative z-20 bg-white/80 backdrop-blur-xl border-t-2 border-[#eae5d9] px-4 sm:px-6 py-4">
        <div className="max-w-3xl mx-auto">
          {isFinished ? (
            <div className="text-center py-2">
              <p className="font-[Outfit] text-lg font-black text-[#1e7a4e] flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5" /> Interview Complete! Loading
                results...
              </p>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your answer..."
                disabled={isLoading}
                className="flex-1 bg-[#f7f5f0] border-2 border-[#1e1b26] shadow-[2px_2px_0px_#1e1b26] rounded-2xl px-5 py-3 text-sm font-bold text-[#1e1b26] placeholder-[#8f8a9e] focus:outline-none focus:border-[#f04e7c] transition-colors disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-[#f04e7c] text-white p-3 rounded-2xl border-2 border-[#1e1b26] shadow-[3px_3px_0px_#1e1b26] hover:bg-[#d9406a] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#1e1b26] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}

export default function InterviewPage() {
  return (
    <ProtectedRoute>
      <InterviewContent />
    </ProtectedRoute>
  )
}