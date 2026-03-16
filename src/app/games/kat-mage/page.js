'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'

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
      <div className="min-h-screen bg-[#f7f5f0] flex items-center justify-center">
        <p className="text-[#1e1b26] font-[Outfit] font-black text-xl animate-pulse">Loading Kat Mage...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f5f0] flex items-center justify-center">
      <GameComponent topic={topic} />
    </div>
  )
}

export default function KatMagePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f7f5f0] flex items-center justify-center text-[#1e1b26] font-bold">Loading...</div>}>
      <KatMageContent />
    </Suspense>
  )
}
