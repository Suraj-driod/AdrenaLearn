'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState, Suspense } from 'react'

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
      <div className="min-h-screen bg-[#111118] flex items-center justify-center">
        <p className="text-red-500 font-[Outfit] font-black text-xl animate-pulse">Loading Among Us...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#111118] flex items-center justify-center p-4">
      <GameComponent topic={topic} />
    </div>
  )
}

export default function AmongUsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#111118] flex items-center justify-center text-white font-bold">Loading...</div>}>
      <AmongUsContent />
    </Suspense>
  )
}
