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

const initialMessages = [
  { role: 'sensei', text: "Great game! You scored well on Variables in Python. Now is when you can get extra points if you give satisfactory answers to my interview questions. Let's start with: do you really think gamification of education has positive effects?" },
]

function InterviewContent() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const baseScore = searchParams.get('baseScore') || '0'
  const accuracy = searchParams.get('accuracy') || '0'
  const [messages, setMessages] = useState(initialMessages)
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
          totalQ: totalQ
        }),
      })

      if (!response.ok) throw new Error('API Error')
      const data = await response.json()

      setMessages(prev => [...prev, { role: 'sensei', text: data.reply }])
      
      let updatedBonus = bonusPoints;
      if (data.isCorrect) {
        updatedBonus += data.pointsAwarded;
        setBonusPoints(updatedBonus);
      }
      
      if (currentQ < totalQ) {
        setCurrentQ(q => q + 1)
      } else {
        setIsFinished(true)
        const currentUser = auth.currentUser;
        if (currentUser) {
          await addInterviewPoints(currentUser.uid, updatedBonus);
        }

        setTimeout(() => {
          router.push(`/results?baseScore=${baseScore}&bonus=${updatedBonus}&accuracy=${accuracy}`)
        }, 4000)
      }
    } catch (error) {
      console.error(error)
      setMessages(prev => [...prev, { role: 'sensei', text: "Oops, my circuits got crossed! Could you try sending that again? 🤖" }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = () => {
    router.push(`/results?baseScore=${baseScore}&bonus=${bonusPoints}&accuracy=${accuracy}`)
  }

  return (
    <main className="min-h-screen bg-[#f7f5f0] flex flex-col relative overflow-hidden">
      {/* Background */}
      <div className="blob w-[400px] h-[400px] bg-[#ffd6e4] top-[5%] left-[-5%] absolute rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob" />
      <div className="blob w-[350px] h-[350px] bg-[#fff3c4] bottom-[5%] right-[-5%] absolute rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob" style={{ animationDelay: '3s' }} />

      {/* Header */}
      <div className="relative z-20 bg-white/80 backdrop-blur-xl border-b-2 border-[#eae5d9] px-4 sm:px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1e1b26] border-2 border-[#1e1b26] flex items-center justify-center shadow-[3px_3px_0px_#f04e7c]">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-[Outfit] font-black text-lg text-[#1e1b26] leading-tight">Kode Sensei</h1>
              <p className="text-[10px] font-bold text-[#8f8a9e] uppercase tracking-widest">Bonus Interview Round</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Progress */}
            <div className="flex items-center gap-2 bg-[#fbc13a] border-2 border-[#1e1b26] shadow-[3px_3px_0px_#1e1b26] rounded-full px-4 py-2">
              <Zap className="w-4 h-4 text-[#1e1b26]" />
              <span className="text-xs font-black text-[#1e1b26]">Q{Math.min(currentQ, totalQ)}/{totalQ}</span>
            </div>
            {/* Bonus Counter */}
            <div className="bg-[#d4f0e0] border-2 border-[#1e1b26] shadow-[3px_3px_0px_#1e1b26] rounded-full px-4 py-2">
              <span className="text-xs font-black text-[#1e7a4e]">+{bonusPoints} XP</span>
            </div>
            {/* Skip */}
            <button
              onClick={handleSkip}
              className="flex items-center gap-1.5 bg-white border-2 border-[#eae5d9] hover:border-[#1e1b26] px-3 py-2 rounded-xl transition-all text-xs font-bold text-[#5a5566] hover:text-[#1e1b26]"
            >
              <SkipForward className="w-4 h-4" /> Skip
            </button>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto relative z-10 pb-32">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className={`flex ${msg.role === 'student' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'sensei' && (
                  <div className="w-9 h-9 rounded-xl bg-[#1e1b26] border-2 border-[#1e1b26] flex items-center justify-center shrink-0 mr-3 mt-1 shadow-[2px_2px_0px_#f04e7c]">
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className={`max-w-[80%] p-4 rounded-[20px] border-2 border-[#1e1b26] text-sm font-medium leading-relaxed ${
                  msg.role === 'student'
                    ? 'bg-[#f04e7c] text-white shadow-[4px_4px_0px_#1e1b26] rounded-br-lg'
                    : 'bg-white text-[#1e1b26] shadow-[4px_4px_0px_#eae5d9] rounded-bl-lg'
                }`}>
                  {msg.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="w-9 h-9 rounded-xl bg-[#1e1b26] border-2 border-[#1e1b26] flex items-center justify-center shrink-0 mr-3 mt-1 shadow-[2px_2px_0px_#f04e7c]">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white p-4 rounded-[20px] border-2 border-[#1e1b26] shadow-[4px_4px_0px_#eae5d9] rounded-bl-lg flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#f04e7c]" />
                <span className="text-sm font-bold text-[#8f8a9e]">Sensei is thinking...</span>
              </div>
            </motion.div>
          )}

          {isFinished && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <div className="inline-flex items-center gap-2 bg-[#fbc13a] border-2 border-[#1e1b26] shadow-[4px_4px_0px_#1e1b26] rounded-full px-6 py-3">
                <Sparkles className="w-5 h-5 text-[#1e1b26]" />
                <span className="font-black text-sm text-[#1e1b26]">Interview Complete! Redirecting to results...</span>
              </div>
            </motion.div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t-2 border-[#eae5d9] px-4 sm:px-6 py-4 z-20">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isFinished ? "Interview complete!" : "Type your answer..."}
            disabled={isLoading || isFinished}
            className="flex-1 bg-[#f7f5f0] border-2 border-[#eae5d9] text-[#1e1b26] placeholder-[#8f8a9e] rounded-2xl px-5 py-3.5 text-sm font-medium focus:border-[#f04e7c] focus:outline-none transition-colors disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading || isFinished}
            className="w-12 h-12 rounded-2xl bg-[#f04e7c] border-2 border-[#1e1b26] shadow-[3px_3px_0px_#1e1b26] flex items-center justify-center text-white hover:shadow-[4px_4px_0px_#1e1b26] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:shadow-[3px_3px_0px_#1e1b26] disabled:hover:translate-y-0 shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
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