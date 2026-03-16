'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useRef, Suspense } from 'react'
import GameShell from '../_components/GameShell'
import { Loader2 } from 'lucide-react'

function BalloonShooterContent() {
  const searchParams = useSearchParams()
  const topic = searchParams.get('topic') || 'variables'
  const courseId = searchParams.get('courseId') || ''
  const lessonId = searchParams.get('lessonId') || ''
  const containerRef = useRef(null)
  const gameRef = useRef(null)

  useEffect(() => {
    let isMounted = true;
    let game = null;

    // Set topic for BalloonScene to read
    if (typeof window !== 'undefined') {
      window.__GAME_TOPIC__ = topic
      window.__GAME_COURSE_ID__ = courseId
      window.__GAME_LESSON_ID__ = lessonId
    }

    const initPhaser = async () => {
      const Phaser = (await import('phaser')).default
      const { createBalloonScene, createMenuScene } = await import('@/Games/Balloon-Shooting/scenes/BalloonScene')
      
      if (!isMounted) return;
      const MenuScene = createMenuScene(Phaser)
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
        scene: [MenuScene, BalloonScene],
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
        <div className="h-[70vh] min-h-[400px] lg:h-[calc(100vh-200px)] flex items-center justify-center p-3">
          <div
            ref={containerRef}
            className="w-full h-full rounded-2xl overflow-hidden border-2 border-[#eae5d9] bg-[#1e1b26] flex items-center justify-center"
            style={{ cursor: 'none' }}
          />
        </div>
      }
      right={
        <div className="h-[70vh] min-h-[400px] lg:h-[calc(100vh-200px)] p-6 flex flex-col justify-between">
          <div className="text-sm text-[#5a5566] font-medium">
            No code editor for this game.
          </div>
          <div className="text-xs text-[#8f8a9e] font-bold">
            Use your mouse to aim · Click to shoot
          </div>
        </div>
      }
    />
  )
}

export default function BalloonShooterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f7f5f0] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#f04e7c] animate-spin mb-4" />
        <p className="font-[Outfit] font-bold text-[#1e1b26]">Loading...</p>
      </div>
    }>
      <BalloonShooterContent />
    </Suspense>
  )
}
