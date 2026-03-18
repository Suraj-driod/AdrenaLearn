'use client'

import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/backend/firebase'
import { useAuth } from '@/app/context/AuthContext'
import GameShell from '../../_components/GameShell'
import EditorPanel from '../../_components/EditorPanel'
import { Loader2, Brain, ArrowRight, SkipForward } from 'lucide-react'

// Custom submit handler that hits our dedicated personalization grader
async function handleCustomCodeSubmit(code) {
  try {
    const question = window.currentAmongQuestion || "";
    // Note: window.currentAmongQuestion in Kat-Mage holds the full string or object.
    // If it's an object from our custom array, we might need to extract the string.
    const questionStr = typeof question === 'string' ? question : (question.question || JSON.stringify(question));

    const res = await fetch("/api/personalization/evaluate-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, question: questionStr })
    });

    if (!res.ok) return false;

    const data = await res.json();
    return data.correct === true;
  } catch (error) {
    console.error("Submission error:", error);
    return false;
  }
}

function PersonalizationMissionContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const missionId = params.missionId
  const topic = searchParams.get('topic') || 'Custom MasterClass'
  const lessonId = searchParams.get('lessonId') || 'custom'
  const game = (searchParams.get('game') || 'kat-mage').toLowerCase()
  const isBalloon = game === 'balloon-shooter' || game === 'precision-pop'

  const [GameComponent, setGameComponent] = useState(null)
  const [missionData, setMissionData] = useState(null)
  const [loadingMission, setLoadingMission] = useState(true)
  const [error, setError] = useState('')
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
    if (authLoading) return
    if (!user) {
      router.push('/login')
      return
    }

    const fetchMission = async () => {
      try {
        const docRef = doc(db, 'users', user.uid, 'customMissions', missionId)
        const snap = await getDoc(docRef)
        if (!snap.exists()) {
          setError('Custom mission not found or access denied.')
          return
        }

        const data = snap.data()
        setMissionData(data)

        // Inject the challenges globally for Kat-Mage to read
        window.__CUSTOM_MISSION_ACTIVE__ = true
        window.__CUSTOM_MISSION_CHALLENGES__ = data.challenges
        window.__CUSTOM_MISSION_BALLOON_QUESTIONS__ = data.balloonQuestions || null

        if (game === 'balloon-shooter' || game === 'precision-pop') {
          import('@/Games/Balloon-Shooting/component/games/BalloonShooterEmbedded').then((mod) => {
            setGameComponent(() => mod.default)
          })
        } else {
          // Default: Kat Mage
          import('@/Games/Kat-Mage/page').then((mod) => {
            setGameComponent(() => mod.default)
          })
        }

      } catch (err) {
        console.error(err)
        setError('Failed to load custom mission.')
      } finally {
        setLoadingMission(false)
      }
    }

    fetchMission()

    return () => {
      window.__CUSTOM_MISSION_ACTIVE__ = false
      window.__CUSTOM_MISSION_CHALLENGES__ = null
      window.__CUSTOM_MISSION_BALLOON_QUESTIONS__ = null
    }
  }, [user, authLoading, missionId, game])

  if (authLoading || loadingMission || !GameComponent) {
    return (
      <div className="min-h-screen bg-[#f7f5f0] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#f04e7c] animate-spin mb-4" />
        <p className="font-[Outfit] font-bold text-[#1e1b26]">Loading Arena...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f7f5f0] flex flex-col items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl border-4 border-[#1e1b26] shadow-[8px_8px_0px_#1e1b26] text-center max-w-md">
          <h2 className="font-[Outfit] text-2xl font-black text-[#f04e7c] mb-2">Error</h2>
          <p className="text-[#5a5566] font-bold mb-6">{error}</p>
          <button onClick={() => router.push('/dashboard')} className="w-full bg-[#1e1b26] text-white font-black py-3 rounded-xl uppercase tracking-widest text-sm shadow-[4px_4px_0px_#fbc13a]">
            Return Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <GameShell
      title={isBalloon ? 'Custom Precision Pop' : 'Custom Kat Mage'}
      subtitle={`${missionData.filename || 'PDF Forge'} · Topic: ${topic.replace(/-/g, ' ')}`}
      left={
        <div
          className={[
            "flex items-center justify-center p-3 relative",
            isBalloon
              ? "h-[calc(100vh-220px)] lg:h-[calc(100vh-200px)] flex-1"
              : "h-[calc(100vh-220px)] lg:h-[calc(100vh-200px)] flex-1",
          ].join(" ")}
        >
          <div className={`w-full h-full flex items-center justify-center ${isBalloon ? '' : 'bg-[#1e1b26] rounded-2xl overflow-hidden border-2 border-[#eae5d9]'}`}>
            <GameComponent topic={topic} lessonId={lessonId} />
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
        isBalloon ? null : (
          <div className="h-[70vh] min-h-[400px] lg:h-[calc(100vh-200px)]">
            <EditorPanel title="Code Editor" checkCode={handleCustomCodeSubmit} />
          </div>
        )
      }
    />
  )
}

export default function PersonalizationMissionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f7f5f0] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#f04e7c] animate-spin mb-4" />
        <p className="font-[Outfit] font-bold text-[#1e1b26]">Loading...</p>
      </div>
    }>
      <PersonalizationMissionContent />
    </Suspense>
  )
}
