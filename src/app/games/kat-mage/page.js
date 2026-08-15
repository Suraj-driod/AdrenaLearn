'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import GameShell from '../_components/GameShell'
import EditorPanel from '../_components/EditorPanel'
import handleCodeSubmit from '@/Games/Among-Us/actualBackend/submitToBackend.js'
import { Loader2, Brain, ArrowRight, SkipForward } from 'lucide-react'
import { useRouter } from 'next/navigation'

function KatMageContent() {
  const searchParams = useSearchParams()
  const topic = searchParams.get('topic') || 'variables'
  const lessonName = searchParams.get('lessonName') || null
  const courseId = searchParams.get('courseId') || ''
  const lessonId = searchParams.get('lessonId') || ''
  const source = searchParams.get('source') || ''
  const isSearchSource = source === 'search'

  const [GameComponent, setGameComponent] = useState(null)
  const [isCodeRelated, setIsCodeRelated] = useState(true)
  const [loadingGameData, setLoadingGameData] = useState(false)
  const [gameOverData, setGameOverData] = useState(null)
  const router = useRouter()

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
    // Set globals for Phaser scenes to read
    if (typeof window !== 'undefined') {
      window.__GAME_COURSE_ID__ = courseId
      window.__GAME_LESSON_ID__ = lessonId
      window.currentGameTopic = topic
    }

    const initSearchChallenges = async () => {
      if (isSearchSource) {
        setLoadingGameData(true)
        try {
          let loaded = false
          if (typeof window !== 'undefined') {
            const cached = sessionStorage.getItem('adrenalearn_search_game_data')
            if (cached) {
              const parsed = JSON.parse(cached)
              if (parsed && Array.isArray(parsed.challenges) && parsed.challenges.length > 0) {
                window.__CUSTOM_MISSION_ACTIVE__ = true
                window.__CUSTOM_MISSION_CHALLENGES__ = parsed.challenges
                window.__GAME_IS_CODE_RELATED__ = Boolean(parsed.isCodeRelated)
                setIsCodeRelated(Boolean(parsed.isCodeRelated))
                loaded = true
              }
            }
          }

          if (!loaded) {
            const res = await fetch('/api/search/generate-game-data', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ topic }),
            })
            if (res.ok) {
              const data = await res.json()
              if (Array.isArray(data.challenges) && data.challenges.length > 0) {
                window.__CUSTOM_MISSION_ACTIVE__ = true
                window.__CUSTOM_MISSION_CHALLENGES__ = data.challenges
                window.__GAME_IS_CODE_RELATED__ = Boolean(data.isCodeRelated)
                setIsCodeRelated(Boolean(data.isCodeRelated))
                if (typeof window !== 'undefined') {
                  sessionStorage.setItem('adrenalearn_search_game_data', JSON.stringify(data))
                }
              }
            }
          }
        } catch (err) {
          console.warn('Kat Mage custom search challenges init error:', err)
        } finally {
          setLoadingGameData(false)
        }
      }
    }

    initSearchChallenges()

    // Dynamically import the Kat Mage game component
    import('@/Games/Kat-Mage/page').then((mod) => {
      setGameComponent(() => mod.default)
    })

    return () => {
      if (typeof window !== 'undefined') {
        window.__CUSTOM_MISSION_ACTIVE__ = false
        window.__CUSTOM_MISSION_CHALLENGES__ = null
      }
    }
  }, [topic, courseId, lessonId, isSearchSource])

  if (!GameComponent || loadingGameData) {
    return (
      <div className="min-h-screen bg-[#f7f5f0] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#f04e7c] animate-spin mb-4" />
        <p className="font-[Outfit] font-bold text-[#1e1b26]">
          {isSearchSource ? `Curating ${topic} challenges for Kat Mage...` : 'Loading Kat Mage...'}
        </p>
      </div>
    )
  }

  const interviewTargetUrl = isSearchSource
    ? `/interview/search?topic=${encodeURIComponent(topic)}&baseScore=${gameOverData?.score || 0}&accuracy=${gameOverData?.accuracy || 0}&source=search`
    : `/interview/${lessonId || 'general'}?baseScore=${gameOverData?.score || 0}&accuracy=${gameOverData?.accuracy || 0}`

  return (
    <GameShell
      title="Kat Mage"
      subtitle={`Topic: ${lessonName ? lessonName : topic.replace(/-/g, ' ')}`}
      left={
        <div className="h-[70vh] min-h-[400px] lg:h-[calc(100vh-200px)] flex items-center justify-center p-3 relative">
          <div className="w-full h-full bg-[#1e1b26] rounded-2xl overflow-hidden flex items-center justify-center border-2 border-[#eae5d9]">
            <GameComponent topic={topic} />
          </div>

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
                  Impress Kode Sensei in a quick interview on <strong className="text-[#f04e7c]">{topic}</strong> to earn up to <strong className="text-[#f04e7c]">9 extra XP</strong> on top of your {gameOverData.score} points!
                </p>

                <div className="space-y-3">
                  <button
                    onClick={() => router.push(interviewTargetUrl)}
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
        <div className="h-[70vh] min-h-[400px] lg:h-[calc(100vh-200px)]">
          <EditorPanel 
            title={isCodeRelated ? "Code Editor" : "Explanation Panel"} 
            checkCode={handleCodeSubmit}
            isCodeRelated={isCodeRelated}
          />
        </div>
      }
    />
  )
}

export default function KatMagePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f7f5f0] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#f04e7c] animate-spin mb-4" />
        <p className="font-[Outfit] font-bold text-[#1e1b26]">Loading...</p>
      </div>
    }>
      <KatMageContent />
    </Suspense>
  )
}
