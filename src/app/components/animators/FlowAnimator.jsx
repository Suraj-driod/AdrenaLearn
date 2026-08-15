'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  ArrowDown,
  CheckCircle2,
  Layers,
  Zap
} from 'lucide-react'

const STEP_COLORS = ['#f04e7c', '#fbc13a', '#7c3aed', '#10b981', '#38bdf8', '#fb923c']

export default function FlowAnimator({ data }) {
  const steps = data?.steps || []
  const connections = data?.connections || []
  const title = data?.title || 'Process Flow'
  const description = data?.description || ''

  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [playbackSpeed, setPlaybackSpeed] = useState(1) // 1x, 1.5x, 2x

  const totalSteps = steps.length

  // Auto-play timer
  useEffect(() => {
    if (!isPlaying || totalSteps === 0) return

    const intervalTime = 3000 / playbackSpeed
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

  const activeStepData = steps[currentStep] || steps[0]

  return (
    <div className="flex flex-col h-full w-full bg-[#0f0b14] text-white p-4 sm:p-6 select-none overflow-y-auto">
      {/* Header bar with title and speed control */}
      <div className="flex items-center justify-between pb-4 border-b border-[#262035] flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#ffd6e4] border border-[#1e1b26] flex items-center justify-center">
            <Zap className="w-4 h-4 text-[#f04e7c]" />
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

        {/* Step Indicator Pills */}
        <div className="flex items-center gap-1.5 bg-[#181424] px-3 py-1.5 rounded-full border border-[#2b243d]">
          <span className="text-[11px] font-mono font-bold text-[#8f8a9e]">Step</span>
          <span className="text-xs font-mono font-black text-[#fbc13a]">
            {currentStep + 1}
          </span>
          <span className="text-[11px] font-mono text-[#8f8a9e]">/</span>
          <span className="text-xs font-mono text-[#8f8a9e]">{totalSteps}</span>
        </div>
      </div>

      {/* Main Visual Flow Stage */}
      <div className="flex-1 flex flex-col items-center justify-center py-6 sm:py-8 max-w-xl mx-auto w-full">
        <div className="w-full space-y-3 relative">
          {steps.map((step, idx) => {
            const isVisible = idx <= currentStep
            const isActive = idx === currentStep
            const isPast = idx < currentStep
            const color = STEP_COLORS[idx % STEP_COLORS.length]

            // Find connection label if any
            const connection = connections.find(
              (c) => String(c.from) === String(steps[idx - 1]?.id || idx) && String(c.to) === String(step.id || idx + 1)
            )

            return (
              <div key={step.id || idx} className="flex flex-col items-center w-full">
                {/* Connecting Arrow between steps */}
                {idx > 0 && (
                  <div className="h-9 flex flex-col items-center justify-center my-0.5 relative">
                    <svg className="w-5 h-8" viewBox="0 0 20 32" fill="none">
                      <path
                        d="M10 0 L10 26"
                        stroke={isVisible ? color : '#2b243d'}
                        strokeWidth="2.5"
                        strokeDasharray={isVisible ? 'none' : '4 4'}
                        strokeLinecap="round"
                      />
                      <polygon
                        points="5,22 10,30 15,22"
                        fill={isVisible ? color : '#2b243d'}
                      />
                    </svg>
                    {connection?.label && isVisible && (
                      <span className="absolute left-7 text-[10px] font-mono text-[#8f8a9e] bg-[#181424] px-1.5 py-0.5 rounded border border-[#2b243d] whitespace-nowrap">
                        {connection.label}
                      </span>
                    )}
                  </div>
                )}

                {/* Step Node Card */}
                <motion.div
                  onClick={() => {
                    setCurrentStep(idx)
                    setIsPlaying(false)
                  }}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{
                    opacity: isVisible ? 1 : 0.35,
                    y: 0,
                    scale: isActive ? 1.02 : 1,
                  }}
                  transition={{ duration: 0.35 }}
                  className={`w-full rounded-2xl p-4 border-2 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#1e182c] border-[#f04e7c] shadow-[0_0_20px_rgba(240,78,124,0.25)]'
                      : isPast
                      ? 'bg-[#151120] border-[#362f4c]'
                      : 'bg-[#100d18] border-[#221c30] opacity-40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Step Number Badge */}
                      <div
                        className="w-8 h-8 rounded-xl font-mono text-xs font-black flex items-center justify-center shrink-0 border border-[#1e1b26] transition-colors"
                        style={{
                          backgroundColor: isVisible ? color : '#262035',
                          color: '#0f0b14',
                        }}
                      >
                        {isPast ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>

                      {/* Step Label */}
                      <div>
                        <h4
                          className={`font-[Outfit] font-bold text-sm sm:text-base transition-colors ${
                            isActive ? 'text-white' : 'text-[#c7c3d4]'
                          }`}
                        >
                          {step.label}
                        </h4>
                        {step.badge && (
                          <span className="inline-block mt-0.5 text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-[#8f8a9e]">
                            {step.badge}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Active Pulsing Indicator */}
                    {isActive && (
                      <span className="flex h-2.5 w-2.5 relative shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f04e7c] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#f04e7c]"></span>
                      </span>
                    )}
                  </div>
                </motion.div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Synchronized Caption / Narration Banner */}
      <AnimatePresence mode="wait">
        {activeStepData?.description && (
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="bg-[#181324] border-2 border-[#362f4c] rounded-2xl p-3.5 sm:p-4 my-2 text-center"
          >
            <span className="text-[10px] font-black uppercase tracking-wider text-[#fbc13a] block mb-1">
              Step {currentStep + 1} Explanation
            </span>
            <p className="text-xs sm:text-sm font-medium text-[#e2dfd2] leading-relaxed">
              {activeStepData.description}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Timeline & Playback Control Bar */}
      <div className="pt-3 border-t border-[#262035] flex items-center justify-between flex-wrap gap-3">
        {/* Play/Pause & Stepping */}
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
            title="Previous Step"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleNext}
            disabled={currentStep === totalSteps - 1}
            className="p-2 rounded-xl bg-[#1c172a] hover:bg-[#28213b] disabled:opacity-40 disabled:cursor-not-allowed border border-[#362f4c] text-white transition-colors"
            title="Next Step"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-[#1c172a] hover:bg-[#28213b] border border-[#362f4c] text-[#8f8a9e] hover:text-white transition-colors"
            title="Restart Flow"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Speed Toggle */}
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
