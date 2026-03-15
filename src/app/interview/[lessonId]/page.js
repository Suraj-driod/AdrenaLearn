'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Send, SkipForward, X, Loader2 } from 'lucide-react'
import Link from 'next/link'

const initialMessages = [
  { role: 'sensei', text: "Great game! You scored well on Variables in Python.Now is when you can get extra points if you give satisfactory answers to my interview questions.Lets start with do you really think gamification of educations has positive effects" },
]

export default function InterviewPage() {
  const router = useRouter()
  const [messages, setMessages] = useState(initialMessages)
  const [input, setInput] = useState('')
  const [bonusPoints, setBonusPoints] = useState(0)
  const [currentQ, setCurrentQ] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const totalQ = 3

  const handleSend = async () => {
    if (!input.trim() || isLoading) return
    
    // Add user message to UI immediately
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

      // Add Sensei's response to UI
      setMessages(prev => [...prev, { role: 'sensei', text: data.reply }])
      
      // Update game logic based on the AI's judgment
      if (data.isCorrect) {
        setBonusPoints(p => p + data.pointsAwarded)
      }
      
      // Advance to next question if we haven't hit the limit
      if (currentQ < totalQ) {
        setCurrentQ(q => q + 1)
      }
      else {
     // It was the final question! 
     // Let's give the user 4 seconds to read Sensei's final feedback before redirecting.
     setTimeout(() => {
       // You can pass the final score to the next page using query parameters!
       router.push(`/results?score=${bonusPoints + (data.isCorrect ? data.pointsAwarded : 0)}`)
     }, 4000)
   }

    } catch (error) {
      console.error(error)
      setMessages(prev => [...prev, { role: 'sensei', text: "Oops, my circuits got crossed! Could you try sending that again? 🤖" }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f5f0] flex flex-col relative overflow-hidden">
      <div className="blob w-[400px] h-[400px] bg-[#ffd6e4] top-[10%] left-[5%] absolute rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob" />
      <div className="blob w-[300px] h-[300px] bg-[#fff3c4] bottom-[10%] right-[5%] absolute rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob" style={{ animationDelay: '2s' }} />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 w-full flex-1 flex flex-col py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-[20px] bg-[#fbc13a] border-2 border-[#1e1b26] shadow-[3px_3px_0px_#1e1b26] flex items-center justify-center text-2xl">🥷</div>
            <div>
              <h1 className="font-[Outfit] text-lg font-bold flex items-center gap-2">Kode Sensei ✨</h1>
              <p className="text-[#5a5566] text-xs font-medium">AI Learning Mentor</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white border-2 border-[#eae5d9] rounded-full px-4 py-2 text-sm font-bold">
              Question <span className="text-[#f04e7c]">{currentQ}</span> of {totalQ}
            </div>
            <Link href="/results" className="bg-white border-2 border-[#eae5d9] hover:border-[#1e1b26] rounded-full px-4 py-2 text-sm font-bold text-[#5a5566] hover:text-[#1e1b26] transition-all flex items-center gap-1">
              <X className="w-4 h-4" /> End
            </Link>
          </div>
        </div>

        <div className="flex-1 flex gap-6">
          {/* Chat */}
          <div className="flex-1 flex flex-col bg-white rounded-[32px] border-2 border-[#eae5d9] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'student' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-start gap-3 max-w-[80%] ${msg.role === 'student' ? 'flex-row-reverse' : ''}`}>
                    {msg.role === 'sensei' && (
                      <div className="w-8 h-8 rounded-xl bg-[#fbc13a] border-2 border-[#1e1b26] flex items-center justify-center text-sm shrink-0 mt-0.5">🥷</div>
                    )}
                    <div className={`px-4 py-3 rounded-3xl text-sm leading-relaxed ${
                      msg.role === 'student'
                        ? 'bg-[#f04e7c] text-white rounded-br-lg'
                        : 'bg-[#f7f5f0] text-[#1e1b26] border-2 border-[#eae5d9] rounded-bl-lg'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}
              {/* Typing Indicator */}
              {isLoading && (
                 <div className="flex justify-start">
                   <div className="flex items-start gap-3 max-w-[80%]">
                     <div className="w-8 h-8 rounded-xl bg-[#fbc13a] border-2 border-[#1e1b26] flex items-center justify-center text-sm shrink-0 mt-0.5">🥷</div>
                     <div className="px-4 py-3 rounded-3xl bg-[#f7f5f0] text-[#1e1b26] border-2 border-[#eae5d9] rounded-bl-lg flex gap-1 items-center">
                       <span className="w-2 h-2 bg-[#8f8a9e] rounded-full animate-bounce" />
                       <span className="w-2 h-2 bg-[#8f8a9e] rounded-full animate-bounce delay-100" />
                       <span className="w-2 h-2 bg-[#8f8a9e] rounded-full animate-bounce delay-200" />
                     </div>
                   </div>
                 </div>
              )}
            </div>

            <div className="p-4 border-t-2 border-[#eae5d9]">
              <div className="flex items-center gap-3">
                <input 
                  type="text" 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
                  placeholder={isLoading ? "Sensei is typing..." : "Type your answer..."}
                  disabled={isLoading}
                  className="flex-1 bg-[#f7f5f0] border-2 border-[#eae5d9] text-[#1e1b26] placeholder-[#8f8a9e] rounded-2xl px-4 py-3 text-sm font-medium focus:border-[#f04e7c] focus:outline-none transition-colors disabled:opacity-60"
                />
                <button 
                  onClick={handleSend} 
                  disabled={isLoading}
                  className="bg-[#f04e7c] disabled:bg-[#f48eb0] hover:bg-[#d9406a] text-white p-3 rounded-2xl border-2 border-[#1e1b26] shadow-[2px_2px_0px_#1e1b26] transition-all hover:shadow-[3px_3px_0px_#1e1b26] disabled:shadow-[2px_2px_0px_#1e1b26] shrink-0"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
              <div className="flex items-center justify-between mt-3">
                <button 
                  className="text-xs text-[#5a5566] hover:text-[#f04e7c] font-semibold transition-colors flex items-center gap-1 disabled:opacity-50"
                  disabled={isLoading}
                >
                  <SkipForward className="w-3.5 h-3.5" /> Skip Question
                </button>
                <span className="text-xs text-[#8f8a9e]">Press Enter to send</span>
              </div>
            </div>
          </div>

          {/* Bonus Tracker */}
          <div className="hidden lg:block w-56 shrink-0">
            <div className="bg-white border-2 border-[#eae5d9] p-6 !rounded-3xl sticky top-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">⚡</span>
                <span className="font-[Outfit] font-bold text-sm">Bonus Points</span>
              </div>
              <div className="text-center mb-4">
                <div className="font-[Outfit] text-4xl font-black text-[#f04e7c]">+{bonusPoints}</div>
                <div className="text-xs text-[#5a5566] font-medium mt-1">pts earned</div>
              </div>
              <div className="space-y-2">
                {Array.from({ length: totalQ }, (_, i) => (
                  <div key={i} className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold border-2 ${
                    i < currentQ - 1 ? 'bg-[#d4f0e0] text-[#1e7a4e] border-[#1e7a4e]/20' :
                    i === currentQ - 1 ? 'bg-[#ffd6e4] text-[#f04e7c] border-[#f04e7c]/20' :
                    'bg-[#f7f5f0] text-[#8f8a9e] border-[#eae5d9]'
                  }`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                      i < currentQ - 1 ? 'bg-[#1e7a4e]/20' : i === currentQ - 1 ? 'bg-[#f04e7c]/20' : 'bg-[#eae5d9]'
                    }`}>
                      {i < currentQ - 1 ? '✓' : i + 1}
                    </div>
                    Q{i + 1}
                    {i < currentQ - 1 && <span className="ml-auto text-[#1e7a4e]">+3</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}