'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import GameShell from '../_components/GameShell'
import EditorPanel from '../_components/EditorPanel'
import handleCodeSubmit from '@/Games/Among-Us/actualBackend/submitToBackend.js'

function KatMageContent() {
  const searchParams = useSearchParams()
  const topic = searchParams.get('topic') || 'variables'
  const [GameComponent, setGameComponent] = useState(null)

  useEffect(() => {
    // Dynamically import the Kat Mage game component
    import('@/Games/Kat-Mage/page').then((mod) => {
      setGameComponent(() => mod.default)
    })
  }, [])

  if (!GameComponent) {
    return (
      <div className="min-h-screen bg-[#1a1520] flex items-center justify-center">
        <p className="text-[#fbc13a] font-[Outfit] font-black text-xl animate-pulse">Loading Kat Mage...</p>
      </div>
    )
  }

  return (
    <GameShell
      title="Kat Mage"
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

export default function KatMagePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#1a1520] flex items-center justify-center text-[#fbc13a] font-bold">Loading...</div>}>
      <KatMageContent />
    </Suspense>
  )
}
