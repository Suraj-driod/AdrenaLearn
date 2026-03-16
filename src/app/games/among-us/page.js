'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState, Suspense } from 'react'
import GameShell from '../_components/GameShell'
import EditorPanel from '../_components/EditorPanel'
import handleCodeSubmit from '@/Games/Among-Us/actualBackend/submitToBackend.js'

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
      <div className="min-h-screen bg-[#1a1520] flex items-center justify-center">
        <p className="text-red-500 font-[Outfit] font-black text-xl animate-pulse">Loading Among Us...</p>
      </div>
    )
  }

  return (
    <GameShell
      title="AMONG US — Code Edition"
      subtitle={`Topic: ${topic.replace(/-/g, ' ')}`}
      left={
        <div className="h-[70vh] min-h-[520px] lg:h-[calc(100vh-170px)] flex items-center justify-center p-4">
          <div className="w-full max-w-[900px] aspect-square bg-black rounded-xl overflow-hidden">
            <GameComponent topic={topic} />
          </div>
        </div>
      }
      right={
        <div className="h-[70vh] min-h-[520px] lg:h-[calc(100vh-170px)]">
          <EditorPanel title="Code Editor" checkCode={handleCodeSubmit} />
        </div>
      }
    />
  )
}

export default function AmongUsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#1a1520] flex items-center justify-center text-white font-bold">Loading...</div>}>
      <AmongUsContent />
    </Suspense>
  )
}
