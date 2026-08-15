'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  ArrowLeft,
  Server,
  Monitor,
  Database,
  Radio,
  CheckCircle2
} from 'lucide-react'

const ACTOR_ICONS = [Monitor, Server, Database, Radio]
const MESSAGE_COLORS = ['#f04e7c', '#fbc13a', '#7c3aed', '#10b981', '#38bdf8', '#fb923c']

export default function SequenceAnimator({ data }) {
  const actors = data?.actors || [
    { id: 'client', label: 'Client' },
    { id: 'server', label: 'Server' },
  ]
  const messages = data?.messages || []
  const title = data?.title || 'Sequence Interaction'
  const description = data?.description || ''

  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)

  const totalSteps = messages.length

  useEffect(() => {
    if (!isPlaying || totalSteps === 0) return

    const intervalTime = 3200 / playbackSpeed
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= totalSteps - 1) {
          setIsPlaying(false)
          return prev
        }
        return prev + 1
      })
    }, intervalTime)

    return () => clearInterval(timer)
  }, [isPlaying, totalSteps, playbackSpeed])

  const handlePlayPause = () => {
    if (!isPlaying && currentStep >= totalSteps - 1) {
      setCurrentStep(0)
    }
    setIsPlaying(!isPlaying)
  }

  const handleNext = () => {
    setIsPlaying(false)
    setCurrentStep((prev) => Math.min(totalSteps - 1, prev + 1))
  }

  const handlePrev = () => {
    setIsPlaying(false)
    setCurrentStep((prev) => Math.max(0, prev - 1))
  }

  const handleReset = () => {
    setCurrentStep(0)
    setIsPlaying(true)
  }

  const activeMessage = messages[currentStep] || messages[0]

  // Map actor id to column index
  const getActorIndex = (actorId) => {
    const idx = actors.findIndex(
      (a) => String(a.id).toLowerCase() === String(actorId).toLowerCase()
    )
    return idx >= 0 ? idx : 0
  }

  return (
    <div className="flex flex-col h-full w-full bg-[#0f0b14] text-white p-4 sm:p-6 select-none overflow-y-auto">
      {/* Top Title & Step Counter */}
      <div className="flex items-center justify-between pb-4 border-b border-[#262035] flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#ffd6e4] border border-[#1e1b26] flex items-center justify-center">
            <Radio className="w-4 h-4 text-[#f04e7c]" />
          </div>
          <div>
            <h3 className="font-[Outfit] font-black text-sm sm:text-base text-[#e2dfd2]">
              {title}
            </h3>
            {description && (
              <p className="text-xs text-[#8f8a9e] font-medium">{description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-[#181424] px-3 py-1.5 rounded-full border border-[#2b243d]">
          <span className="text-[11px] font-mono font-bold text-[#8f8a9e]">Message</span>
          <span className="text-xs font-mono font-black text-[#fbc13a]">
            {currentStep + 1}
          </span>
          <span className="text-[11px] font-mono text-[#8f8a9e]">/</span>
          <span className="text-xs font-mono text-[#8f8a9e]">{totalSteps}</span>
        </div>
      </div>

      {/* Sequence Diagram Body */}
      <div className="flex-1 flex flex-col justify-start py-6 max-w-2xl mx-auto w-full">
        {/* Actors Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full relative mb-6">
          {actors.map((actor, idx) => {
            const Icon = ACTOR_ICONS[idx % ACTOR_ICONS.length]
            return (
              <div key={actor.id || idx} className="flex flex-col items-center">
                <div className="w-full bg-[#181324] border-2 border-[#362f4c] rounded-2xl p-3 flex items-center justify-center gap-2 shadow-[2px_2px_0px_#1e1b26]">
                  <Icon className="w-4 h-4 text-[#fbc13a]" />
                  <span className="font-[Outfit] font-bold text-xs sm:text-sm text-[#e2dfd2] truncate">
                    {actor.label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Message Exchanges Stream */}
        <div className="space-y-4 w-full relative">
          {messages.map((msg, idx) => {
            const isVisible = idx <= currentStep
            const isActive = idx === currentStep
            const fromIdx = getActorIndex(msg.from)
            const toIdx = getActorIndex(msg.to)
            const isLeftToRight = fromIdx <= toIdx
            const color = MESSAGE_COLORS[idx % MESSAGE_COLORS.length]

            return (
              <motion.div
                key={idx}
                onClick={() => {
                  setCurrentStep(idx)
                  setIsPlaying(false)
                }}
                initial={{ opacity: 0, x: isLeftToRight ? -20 : 20 }}
                animate={{
                  opacity: isVisible ? 1 : 0.2,
                  scale: isActive ? 1.02 : 1,
                }}
                transition={{ duration: 0.3 }}
                className={`w-full rounded-2xl p-3.5 border-2 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#1e182c] border-[#f04e7c] shadow-[0_0_18px_rgba(240,78,124,0.25)]'
                    : isVisible
                    ? 'bg-[#14101e] border-[#2b243d]'
                    : 'bg-[#0f0b14] border-[#1f192b] opacity-30'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-6 h-6 rounded-lg text-xs font-mono font-black flex items-center justify-center border border-[#1e1b26]"
                      style={{
                        backgroundColor: isVisible ? color : '#262035',
                        color: '#0f0b14',
                      }}
                    >
                      {idx + 1}
                    </span>

                    <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-[#8f8a9e]">
                      <span className="text-[#fbc13a]">{msg.from}</span>
                      {isLeftToRight ? (
                        <ArrowRight className="w-3.5 h-3.5 text-white" />
                      ) : (
                        <ArrowLeft className="w-3.5 h-3.5 text-white" />
                      )}
                      <span className="text-[#38bdf8]">{msg.to}</span>
                    </div>
                  </div>

                  <span className="font-[Outfit] font-bold text-xs sm:text-sm text-white truncate">
                    {msg.label}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Narration Banner */}
      <AnimatePresence mode="wait">
        {activeMessage?.description && (
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="bg-[#181324] border-2 border-[#362f4c] rounded-2xl p-3.5 sm:p-4 my-2 text-center"
          >
            <span className="text-[10px] font-black uppercase tracking-wider text-[#fbc13a] block mb-1">
              Message {currentStep + 1} Action
            </span>
            <p className="text-xs sm:text-sm font-medium text-[#e2dfd2] leading-relaxed">
              {activeMessage.description}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Playback Controls */}
      <div className="pt-3 border-t border-[#262035] flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePlayPause}
            className="flex items-center gap-1.5 bg-[#f04e7c] hover:bg-[#e03d6b] text-white px-3.5 py-1.5 rounded-xl text-xs font-black transition-all shadow-[2px_2px_0px_#1e1b26] active:translate-y-0.5"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-white" /> Pause
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-white" /> Play
              </>
            )}
          </button>

          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="p-2 rounded-xl bg-[#1c172a] hover:bg-[#28213b] disabled:opacity-40 disabled:cursor-not-allowed border border-[#362f4c] text-white transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleNext}
            disabled={currentStep === totalSteps - 1}
            className="p-2 rounded-xl bg-[#1c172a] hover:bg-[#28213b] disabled:opacity-40 disabled:cursor-not-allowed border border-[#362f4c] text-white transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-[#1c172a] hover:bg-[#28213b] border border-[#362f4c] text-[#8f8a9e] hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-1 bg-[#181424] p-1 rounded-xl border border-[#2b243d]">
          {[1, 1.5, 2].map((spd) => (
            <button
              key={spd}
              onClick={() => setPlaybackSpeed(spd)}
              className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg transition-all ${
                playbackSpeed === spd
                  ? 'bg-[#fbc13a] text-[#0f0b14]'
                  : 'text-[#8f8a9e] hover:text-white'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
