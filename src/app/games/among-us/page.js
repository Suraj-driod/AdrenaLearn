'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState, Suspense } from 'react'
import GameShell from '../_components/GameShell'
import EditorPanel from '../_components/EditorPanel'
import handleCodeSubmit from '@/Games/Among-Us/actualBackend/submitToBackend.js'
import { Loader2 } from 'lucide-react'

function AmongUsContent() {
  const searchParams = useSearchParams()
  const topic = searchParams.get('topic') || 'variables'
  const containerRef = useRef(null)
  const [GameComponent, setGameComponent] = useState(null)

  useEffect(() => {
    // Dynamically import the Among Us game component
    import('@/Games/Among-Us/api/Among_us/page').then((mod) => {
      setGameComponent(() => mod.default)
    })
  }, [])

  if (!GameComponent) {
    return (
      <div className="min-h-screen bg-[#f7f5f0] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#f04e7c] animate-spin mb-4" />
        <p className="font-[Outfit] font-bold text-[#1e1b26]">Loading Among Us...</p>
      </div>
    )
  }

  return (
    <GameShell
      title="AMONG US — Code Edition"
      subtitle={`Topic: ${topic.replace(/-/g, ' ')}`}
      left={
        <div className="h-[70vh] min-h-[400px] lg:h-[calc(100vh-200px)] flex items-center justify-center p-3">
          <div className="w-full h-full bg-[#1e1b26] rounded-2xl overflow-hidden flex items-center justify-center border-2 border-[#eae5d9]">
            <GameComponent topic={topic} />
          </div>
        </div>
      }
      right={
        <div className="h-[70vh] min-h-[400px] lg:h-[calc(100vh-200px)]">
          <EditorPanel title="Code Editor" checkCode={handleCodeSubmit} />
        </div>
      }
    />
  )
}

export default function AmongUsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f7f5f0] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#f04e7c] animate-spin mb-4" />
        <p className="font-[Outfit] font-bold text-[#1e1b26]">Loading...</p>
      </div>
    }>
      <AmongUsContent />
    </Suspense>
  )
}
