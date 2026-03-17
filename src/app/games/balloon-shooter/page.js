'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState, Suspense } from 'react'
import GameShell from '../_components/GameShell'
import { Loader2, Brain, ArrowRight, SkipForward } from 'lucide-react'
import { useRouter } from 'next/navigation'

function BalloonShooterContent() {
  const searchParams = useSearchParams()
  const topic = searchParams.get('topic') || 'variables'
  const courseId = searchParams.get('courseId') || ''
  const lessonId = searchParams.get('lessonId') || ''
  const containerRef = useRef(null)
  const gameRef = useRef(null)
  const router = useRouter()

  const [gameOverData, setGameOverData] = useState(null)

  useEffect(() => {
    const handleGameOver = (e) => {
      setGameOverData({
        score: e.detail.score,
        accuracy: e.detail.accuracy
      })
    }
    window.addEventListener('gameOver', handleGameOver)
    return () => window.removeEventListener('gameOver', handleGameOver)
  }, [])

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
        <div className="h-[70vh] min-h-[400px] lg:h-[calc(100vh-200px)] flex items-center justify-center p-3 relative">
          <div
            ref={containerRef}
            className="w-full h-full rounded-2xl overflow-hidden border-2 border-[#eae5d9] bg-[#1e1b26] flex items-center justify-center"
            style={{ cursor: 'none' }}
          />
          
          {gameOverData && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-2xl p-4">
              <div className="bg-white border-4 border-[#1e1b26] shadow-[8px_8px_0px_#f04e7c] rounded-3xl p-8 max-w-md w-full text-center transform transition-all animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 mx-auto bg-[#1e1b26] rounded-2xl border-2 border-[#1e1b26] flex items-center justify-center shadow-[4px_4px_0px_#fbc13a] mb-6">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                
                <h2 className="font-[Outfit] text-3xl font-black text-[#1e1b26] mb-2 leading-tight">
                  Face Kode Sensei!
                </h2>
                
                <p className="text-[#5a5566] text-sm font-medium mb-8">
                  Impress Kode Sensei in a quick bonus interview to earn up to <strong className="text-[#f04e7c]">9 extra XP</strong> on top of your {gameOverData.score} points!
                </p>

                <div className="space-y-3">
                  <button
                    onClick={() => router.push(`/interview/${lessonId}?baseScore=${gameOverData.score}&accuracy=${gameOverData.accuracy}`)}
                    className="w-full bg-[#f04e7c] text-white font-black py-4 px-6 rounded-xl text-sm tracking-widest uppercase border-2 border-[#1e1b26] shadow-[4px_4px_0px_#1e1b26] hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#1e1b26] transition-all flex items-center justify-center gap-2"
                  >
                    Start Interview <ArrowRight className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => router.push(`/results?baseScore=${gameOverData.score}&bonus=0&accuracy=${gameOverData.accuracy}`)}
                    className="w-full bg-white text-[#5a5566] font-bold py-4 px-6 rounded-xl text-sm tracking-widest uppercase border-2 border-[#eae5d9] hover:border-[#1e1b26] hover:text-[#1e1b26] transition-all flex items-center justify-center gap-2"
                  >
                    Skip to Results <SkipForward className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
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
