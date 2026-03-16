'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useRef, Suspense } from 'react'
import GameShell from '../_components/GameShell'

function BalloonShooterContent() {
  const searchParams = useSearchParams()
  const topic = searchParams.get('topic') || 'variables'
  const containerRef = useRef(null)
  const gameRef = useRef(null)

  useEffect(() => {
    let isMounted = true;
    let game = null;

    // Set topic for BalloonScene to read
    if (typeof window !== 'undefined') {
      window.__GAME_TOPIC__ = topic
    }

    const initPhaser = async () => {
      const Phaser = (await import('phaser')).default
      const { createBalloonScene } = await import('@/Games/Balloon-Shooting/scenes/BalloonScene')
      
      if (!isMounted) return;
      const BalloonScene = createBalloonScene(Phaser)

      if (!containerRef.current) return

      // Clean out any hot-reload ghost canvases before attaching a new one
      containerRef.current.innerHTML = '';

      const width = containerRef.current.offsetWidth || 800
      const height = Math.round(width * 0.6)

      const config = {
        type: Phaser.AUTO,
        width,
        height,
        parent: containerRef.current,
        backgroundColor: '#2d1b00',
        scene: [BalloonScene],
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
        physics: {
          default: 'arcade',
          arcade: { gravity: { y: 0 }, debug: false },
        },
      }

      game = new Phaser.Game(config)
      gameRef.current = game
    }

    initPhaser()

    return () => {
      isMounted = false;
      if (game) {
        game.destroy(true)
        game = null
      }
      if (gameRef.current) {
        gameRef.current = null
      }
    }
  }, [topic])

  return (
    <GameShell
      title="Balloon Shooter"
      subtitle={`Topic: ${topic.replace(/-/g, ' ')}`}
      left={
        <div className="h-[70vh] min-h-[520px] lg:h-[calc(100vh-170px)] flex items-center justify-center p-4">
          <div
            ref={containerRef}
            className="w-full max-w-5xl aspect-video md:aspect-[5/3] rounded-xl overflow-hidden border-2 border-[#fbc13a] shadow-[0_0_30px_rgba(251,193,58,0.15)] bg-black"
            style={{ cursor: 'none', maxHeight: '100%', minHeight: '420px' }}
          />
        </div>
      }
      right={
        <div className="h-[70vh] min-h-[520px] lg:h-[calc(100vh-170px)] p-4 flex flex-col justify-between">
          <div className="text-sm text-white/60">
            No code editor for this game.
          </div>
          <div className="text-xs text-white/40 font-medium">
            Use your mouse to aim · Click to shoot
          </div>
        </div>
      }
    />
  )
}

export default function BalloonShooterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#1a1520] flex items-center justify-center text-[#fbc13a] font-bold">Loading...</div>}>
      <BalloonShooterContent />
    </Suspense>
  )
}
