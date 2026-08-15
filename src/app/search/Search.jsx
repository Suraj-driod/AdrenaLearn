'use client'

import { useState, useRef, useMemo, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import {
  Search as SearchIcon,
  Copy,
  Check,
  RotateCcw,
  ArrowRight,
  Loader2,
  AlertCircle,
  Film,
  Gamepad2,
  Sparkles,
  Crosshair,
  Cat,
  Target,
  Clock,
  X,
  Play,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import AnimationEngine from '../components/animators/AnimationEngine'
import { getNeoColor } from '../components/animators/Badges'
import { useAuth } from '../context/AuthContext'

// Dynamically import Lottie to prevent SSR hydration mismatches
const Lottie = dynamic(() => import('lottie-react'), { ssr: false })

/**
 * PlanetOrbitLoader - Uses Planet Orbit.json lottie animation from /public
 */
function PlanetOrbitLoader() {
  const [animationData, setAnimationData] = useState(null)

  useEffect(() => {
    fetch('/Planet Orbit.json')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load lottie JSON')
        return res.json()
      })
      .then((data) => setAnimationData(data))
      .catch((err) => console.error('Lottie fetch error:', err))
  }, [])

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-4 py-2">
      <div className="w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center">
        {animationData ? (
          <Lottie
            animationData={animationData}
            loop={true}
            autoplay={true}
            className="w-full h-full"
          />
        ) : (
          <div className="w-14 h-14 rounded-2xl bg-[#ffd6e4] border-2 border-[#1e1b26] flex items-center justify-center animate-bounce">
            <Loader2 className="w-7 h-7 text-[#f04e7c] animate-spin" />
          </div>
        )}
      </div>
      <h3 className="font-[Outfit] text-lg sm:text-xl font-black text-[#1e1b26] tracking-tight">
        Brewing up some magic
      </h3>
    </div>
  )
}

/**
 * HopOnGameModal - Choose game with curated questions for the searched topic
 */
function HopOnGameModal({ isOpen, onClose, topic, definition, animation }) {
  const router = useRouter()
  const [isPreparing, setIsPreparing] = useState(false)
  const [selectedGameId, setSelectedGameId] = useState(null)

  const games = [
    {
      id: 'balloon-shooter',
      name: 'Precision Pop',
      icon: Crosshair,
      difficulty: 'Easy',
      time: '1 min',
      desc: 'Pop balloons matching correct answers based directly on this topic.',
      bgColor: 'bg-[#ffd6e4]',
      iconColor: 'text-[#c0305b]',
      route: '/games/balloon-shooter',
    },
    {
      id: 'kat-mage',
      name: 'Kat Mage',
      icon: Cat,
      difficulty: 'Medium',
      time: '2 min',
      desc: 'Guide Kat Mage past hazardous obstacles by solving curated topic challenges.',
      bgColor: 'bg-[#d4f0e0]',
      iconColor: 'text-[#1e7a4e]',
      route: '/games/kat-mage',
    },
    {
      id: 'among-us',
      name: 'Space Academia',
      icon: Target,
      difficulty: 'Hard',
      time: '2 min',
      desc: 'Explore space station terminals and repair the ship with topic solutions.',
      bgColor: 'bg-[#e4f1ff]',
      iconColor: 'text-[#3b82f6]',
      route: '/games/among-us',
    },
  ]

  const handleSelectGame = async (game) => {
    setSelectedGameId(game.id)
    setIsPreparing(true)

    try {
      // Pre-generate game pack for this topic if not already cached
      const res = await fetch('/api/search/generate-game-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, definition, animation }),
      })

      if (res.ok) {
        const gameData = await res.json()
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('adrenalearn_search_game_data', JSON.stringify(gameData))
        }
      }
    } catch (err) {
      console.warn('Game data prefetch error:', err)
    } finally {
      setIsPreparing(false)
      onClose()
      const targetUrl = `${game.route}?topic=${encodeURIComponent(topic)}&source=search&lessonName=${encodeURIComponent(topic)}`
      router.push(targetUrl)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-[#1e1b26]/70 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="relative z-10 w-full max-w-2xl bg-[#f7f5f0] border-4 border-[#1e1b26] shadow-[10px_10px_0px_#1e1b26] rounded-[32px] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-[#fbc13a] px-6 sm:px-8 py-5 border-b-4 border-[#1e1b26] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#1e1b26] flex items-center justify-center shadow-[2px_2px_0px_#f04e7c]">
                <Gamepad2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#1e1b26]/70">
                  Topic Mission Arena
                </span>
                <h3 className="font-[Outfit] text-xl sm:text-2xl font-black text-[#1e1b26] uppercase tracking-tight leading-none">
                  Hop on a Game: {topic}
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 bg-white border-2 border-[#1e1b26] shadow-[2px_2px_0px_#1e1b26] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 rounded-xl flex items-center justify-center transition-all"
            >
              <X className="w-4 h-4 text-[#1e1b26] stroke-[3]" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 sm:p-8 space-y-4">
            <p className="text-xs sm:text-sm font-bold text-[#5a5566] leading-relaxed">
              All questions and challenges in this session are <strong className="text-[#f04e7c]"> curated for {topic}</strong> based on the AI explanation. Choose where you want to test your skills:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {games.map((game) => {
                const Icon = game.icon
                const isSelected = selectedGameId === game.id

                return (
                  <div
                    key={game.id}
                    className={`${game.bgColor} p-4 sm:p-5 rounded-2xl border-3 border-[#1e1b26] shadow-[4px_4px_0px_#1e1b26] hover:shadow-[6px_6px_0px_#1e1b26] hover:-translate-y-1 transition-all flex flex-col justify-between`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-11 h-11 bg-white border-2 border-[#1e1b26] shadow-[2px_2px_0px_#1e1b26] rounded-xl flex items-center justify-center">
                          <Icon className={`w-6 h-6 stroke-[2.5] ${game.iconColor}`} />
                        </div>
                        <span className="flex items-center gap-1 text-[9px] font-black uppercase text-[#1e1b26] bg-white px-2 py-0.5 rounded-md border border-[#1e1b26]">
                          <Clock className="w-2.5 h-2.5" /> {game.time}
                        </span>
                      </div>
                      <h4 className="font-[Outfit] font-black text-base text-[#1e1b26] uppercase mb-1">
                        {game.name}
                      </h4>
                      <p className="text-[11px] font-bold text-[#1e1b26]/80 leading-snug mb-4">
                        {game.desc}
                      </p>
                    </div>

                    <button
                      onClick={() => handleSelectGame(game)}
                      disabled={isPreparing}
                      className="w-full bg-white text-[#1e1b26] hover:bg-[#fbc13a] active:bg-[#fbc13a] font-black text-xs py-2.5 rounded-xl border-2 border-[#1e1b26] shadow-[2px_2px_0px_#1e1b26] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider"
                    >
                      {isPreparing && isSelected ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#f04e7c]" />
                          Curating...
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 fill-current" />
                          Launch
                        </>
                      )}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default function Search() {
  const { userProfile } = useAuth()
  const [query, setQuery] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')
  const [result, setResult] = useState(null)
  const [activeMode, setActiveMode] = useState('explainer')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [copiedDefinition, setCopiedDefinition] = useState(false)
  const [animKey, setAnimKey] = useState(0)
  const [isGameModalOpen, setIsGameModalOpen] = useState(false)
  const inputRef = useRef(null)
  const resultRef = useRef(null)

  const executeSearch = async (searchTerm) => {
    const term = (searchTerm || query).trim()
    if (!term || isLoading) return

    setSubmittedQuery(term)
    setQuery(term)
    setIsLoading(true)
    setError(null)
    setResult(null)
    setActiveMode('explainer')
    setAnimKey((prev) => prev + 1)

    const userInterests = userProfile?.interests || (typeof window !== 'undefined' ? localStorage.getItem('adrenalearn_user_interests') || '' : '')

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: term, interests: userInterests }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch search result.')
      }

      let sanitizedHtml = data.interactiveHtml || null
      if (sanitizedHtml && typeof sanitizedHtml === 'string') {
        sanitizedHtml = sanitizedHtml.replace(/<button[^>]*>\s*(?:🔄\s*|🔁\s*)?(?:Reset|Restart|Replay|Clear\s*All|Clear)\s*<\/button>/gi, '')
      }

      setResult({
        definition: data.definition || '',
        animation: data.animation || null,
        hasInteractive: Boolean(data.hasInteractive && sanitizedHtml),
        interactiveHtml: sanitizedHtml,
        personalizedExample: data.personalizedExample || null,
      })

      // Eagerly prefetch game questions in background for seamless "Hop on Game" click
      fetch('/api/search/generate-game-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: term, definition: data.definition || '', animation: data.animation }),
      })
        .then((r) => r.json())
        .then((gameData) => {
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('adrenalearn_search_game_data', JSON.stringify(gameData))
          }
        })
        .catch((e) => console.warn('Background game data prefetch error:', e))

      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    } catch (err) {
      console.error('Search error:', err)
      setError(err.message || 'An unexpected error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      executeSearch()
    }
  }

  const handleCopyDefinition = async () => {
    if (!result?.definition) return
    try {
      await navigator.clipboard.writeText(result.definition)
      setCopiedDefinition(true)
      setTimeout(() => setCopiedDefinition(false), 2000)
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }

  // Extract components list from animation payload for breakdown below diagram
  const componentsList = useMemo(() => {
    if (!result?.animation) return []
    const anim = result.animation
    if (anim.root && anim.branches) {
      return [anim.root, ...anim.branches]
    }
    if (anim.core && anim.satellites) {
      return [anim.core, ...anim.satellites]
    }
    if (Array.isArray(anim.nodes) && anim.nodes.length > 0) return anim.nodes
    if (Array.isArray(anim.items) && anim.items.length > 0) return anim.items
    if (Array.isArray(anim.steps) && anim.steps.length > 0) return anim.steps
    if (Array.isArray(anim.branches) && anim.branches.length > 0) return anim.branches
    if (Array.isArray(anim.satellites) && anim.satellites.length > 0) return anim.satellites
    return []
  }, [result?.animation])

  const hasResultOrLoading = Boolean(result || isLoading || error)

  return (
    <div
      className={`max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 transition-all ${!hasResultOrLoading ? 'min-h-[75vh] flex flex-col justify-center' : 'space-y-8'
        }`}
    >
      {/* Title & Search Bar Container */}
      <div className={`w-full text-center space-y-6 ${!hasResultOrLoading ? 'my-auto' : ''}`}>
        {/* Main Title */}
        <h1 className="font-[Outfit] text-3xl sm:text-4xl md:text-5xl font-black text-[#1e1b26] tracking-tight">
          Visualize Knowledge? Don&apos;t worry we got it
        </h1>

        {/* Neo-brutalist Search Bar */}
        <div className="bg-white p-3 sm:p-4 rounded-[28px] border-2 border-[#1e1b26] shadow-[5px_5px_0px_#1e1b26] transition-all focus-within:shadow-[7px_7px_0px_#1e1b26] focus-within:-translate-y-0.5 max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <SearchIcon className="w-5 h-5 text-[#8f8a9e] ml-2 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search any concept..."
              className="w-full bg-transparent border-none text-[#1e1b26] placeholder-[#8f8a9e] text-sm sm:text-base font-bold focus:outline-none"
            />
            <button
              onClick={() => executeSearch()}
              disabled={isLoading || !query.trim()}
              className="bg-[#f04e7c] text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-2xl font-black text-sm border-2 border-[#1e1b26] shadow-[3px_3px_0px_#1e1b26] hover:bg-[#d9406a] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#1e1b26] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0 flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Search</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results / Status Area */}
      <div ref={resultRef} className="w-full">
        {/* Loading State with Planet Orbit Lottie */}
        {isLoading && (
          <div className="py-8">
            <PlanetOrbitLoader />
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 border-2 border-red-500 rounded-2xl p-6 flex items-start gap-4 shadow-[4px_4px_0px_#ef4444]">
            <div className="w-10 h-10 rounded-xl bg-red-100 border border-red-400 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-[Outfit] font-black text-red-900 text-base">Error</h4>
              <p className="text-sm font-medium text-red-800 mt-1">{error}</p>
              <button
                onClick={() => executeSearch(submittedQuery)}
                className="mt-3 inline-flex items-center gap-1.5 bg-white text-[#1e1b26] text-xs font-bold px-3 py-1.5 rounded-lg border border-[#1e1b26] shadow-[2px_2px_0px_#1e1b26] hover:bg-[#fff3c4] transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Try Again
              </button>
            </div>
          </div>
        )}

        {/* Search Results Display */}
        {result && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* 1. DEFINITION CARD + HOP ON GAME BUTTON */}
            {result.definition && (
              <div className="bg-[#fff9e6] rounded-2xl border-2 border-[#1e1b26] shadow-[4px_4px_0px_#1e1b26] p-5 sm:p-6 relative overflow-hidden">
                <div className="flex items-center justify-between gap-4 mb-3 flex-wrap">
                  <span className="text-xs font-black uppercase tracking-wider text-[#b45309]">
                    Definition
                  </span>

                  <div className="flex items-center gap-2">
                    {/* Hop on Game Button */}
                    <button
                      onClick={() => setIsGameModalOpen(true)}
                      className="flex items-center gap-1.5 bg-[#f04e7c] text-white font-black text-xs px-3.5 py-1.5 rounded-xl border-2 border-[#1e1b26] shadow-[2px_2px_0px_#1e1b26] hover:bg-[#d9406a] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#1e1b26] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
                    >
                      <Gamepad2 className="w-4 h-4 text-white animate-bounce" />
                      <span>Hop on game</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>

                    <button
                      onClick={handleCopyDefinition}
                      className="flex items-center gap-1 text-xs font-bold text-[#8f8a9e] hover:text-[#1e1b26] transition-colors p-1"
                      title="Copy definition"
                    >
                      {copiedDefinition ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
                <p className="font-[Outfit] text-base sm:text-lg font-bold text-[#1e1b26] leading-relaxed">
                  {result.definition}
                </p>
              </div>
            )}

            {/* 2. SANDBOX WITH DIAGRAM */}
            <div className="bg-white rounded-[28px] border-2 border-[#1e1b26] shadow-[5px_5px_0px_#1e1b26] overflow-hidden p-4 sm:p-6 space-y-4">
              {/* Toolbar & Sandbox Toggle if interactive */}
              <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b-2 border-[#eae5d9]">
                <div className="flex items-center gap-2">
                  <span className="font-[Outfit] font-black text-sm text-[#1e1b26]">
                    {submittedQuery}
                  </span>

                  {result.hasInteractive && result.interactiveHtml && (
                    <div className="flex items-center gap-1.5 ml-3 bg-[#f2efe9] p-1 rounded-xl border border-[#1e1b26]">
                      <button
                        onClick={() => setActiveMode('explainer')}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black transition-all ${activeMode === 'explainer'
                          ? 'bg-[#1e1b26] text-white shadow-sm'
                          : 'text-[#5a5566] hover:text-[#1e1b26]'
                          }`}
                      >
                        <Film className="w-3 h-3 text-[#f04e7c]" />
                        <span>Diagram</span>
                      </button>
                      <button
                        onClick={() => setActiveMode('interactive')}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black transition-all ${activeMode === 'interactive'
                          ? 'bg-[#f04e7c] text-white shadow-sm'
                          : 'text-[#5a5566] hover:text-[#1e1b26]'
                          }`}
                      >
                        <Gamepad2 className="w-3 h-3 text-white" />
                        <span>Sandbox</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAnimKey((prev) => prev + 1)}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#8f8a9e] hover:text-[#1e1b26] transition-colors p-1"
                    title="Restart Animation"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Replay</span>
                  </button>
                </div>
              </div>

              {/* Visual Diagram Box */}
              <div className="rounded-2xl border-2 border-[#1e1b26] shadow-[3px_3px_0px_#1e1b26] overflow-hidden bg-[#0f0b14] min-h-[440px] flex flex-col">
                {activeMode === 'interactive' && result.interactiveHtml ? (
                  <iframe
                    key={`${animKey}-interactive`}
                    srcDoc={result.interactiveHtml}
                    sandbox="allow-scripts"
                    className="w-full h-full min-h-[440px] sm:min-h-[520px] border-0 block bg-[#0f0b14]"
                    title={`Interactive sandbox for ${submittedQuery}`}
                  />
                ) : (
                  <AnimationEngine
                    key={`${animKey}-explainer`}
                    animation={result.animation}
                    topic={submittedQuery}
                  />
                )}
              </div>
            </div>

            {/* 3. SIMPLE COMPONENT EXPLANATIONS BELOW THE DIAGRAM */}
            {componentsList.length > 0 && (
              <div className="bg-white rounded-[28px] border-2 border-[#1e1b26] shadow-[5px_5px_0px_#1e1b26] p-5 sm:p-7 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-[Outfit] font-black text-base sm:text-lg text-[#1e1b26]">
                    Components Overview
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {componentsList.map((item, idx) => {
                    const color = item.color || getNeoColor(idx).solid

                    return (
                      <div
                        key={item.id || idx}
                        className="bg-[#fcfbf9] rounded-2xl p-4 border-2 border-[#1e1b26] shadow-[2px_2px_0px_#1e1b26] flex items-start gap-3 transition-transform hover:-translate-y-0.5"
                      >
                        <div
                          style={{ backgroundColor: color }}
                          className="w-4 h-4 rounded-full border-2 border-[#1e1b26] shrink-0 mt-1 shadow-[1px_1px_0px_#1e1b26]"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-[Outfit] font-bold text-sm text-[#1e1b26]">
                            {item.label || item.name}
                          </h4>
                          {(item.description || item.subtitle) && (
                            <p className="text-xs text-[#5a5566] font-medium mt-0.5 leading-relaxed">
                              {item.description || item.subtitle}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* 4. HOBBY / REAL-WORLD ANALOGY (SEPARATELY AT THE END) */}
            {result.personalizedExample && result.personalizedExample.analogyText && (
              <div className="bg-[#ede4ff] rounded-[28px] border-2 border-[#1e1b26] shadow-[5px_5px_0px_#1e1b26] p-5 sm:p-7 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#7c3aed] text-white border-2 border-[#1e1b26] flex items-center justify-center shadow-[2px_2px_0px_#1e1b26]">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider text-[#7c3aed]">
                    Real-World Analogy ({result.personalizedExample.interest || 'Your Interest'})
                  </span>
                </div>

                {result.personalizedExample.analogyTitle && (
                  <h4 className="font-[Outfit] font-black text-base sm:text-lg text-[#1e1b26]">
                    {result.personalizedExample.analogyTitle}
                  </h4>
                )}

                <p className="text-xs sm:text-sm font-medium text-[#2e2640] leading-relaxed">
                  {result.personalizedExample.analogyText}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Hop on Game Selection Modal */}
      <HopOnGameModal
        isOpen={isGameModalOpen}
        onClose={() => setIsGameModalOpen(false)}
        topic={submittedQuery}
        definition={result?.definition || ''}
        animation={result?.animation || null}
      />
    </div>
  )
}
