'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Layers as LayersIcon,
  ArrowLeft,
  ArrowDown,
  Sparkles,
  Zap
} from 'lucide-react'

const LAYER_COLORS = ['#f04e7c', '#fbc13a', '#7c3aed', '#10b981', '#38bdf8', '#fb923c']

export default function LayersAnimator({ data }) {
  const layers = data?.layers || []
  const title = data?.title || 'Layered Stack Concept'
  const description = data?.description || ''
  const topLabel = data?.topLabel || 'TOP (LIFO)'

  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)

  const totalSteps = layers.length

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

  // Find active layer (0-indexed based on currentStep)
  const activeLayer = layers[currentStep] || layers[0]

  return (
    <div className="flex flex-col h-full w-full bg-[#0f0b14] text-white p-4 sm:p-6 select-none overflow-y-auto">
      {/* Header bar with title */}
      <div className="flex items-center justify-between pb-4 border-b border-[#262035] flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#ffd6e4] border border-[#1e1b26] flex items-center justify-center">
            <LayersIcon className="w-4 h-4 text-[#f04e7c]" />
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
          <span className="text-[11px] font-mono font-bold text-[#8f8a9e]">Layer</span>
          <span className="text-xs font-mono font-black text-[#fbc13a]">
            {currentStep + 1}
          </span>
          <span className="text-[11px] font-mono text-[#8f8a9e]">/</span>
          <span className="text-xs font-mono text-[#8f8a9e]">{totalSteps}</span>
        </div>
      </div>

      {/* Stacked Tiers Visual Stage */}
      <div className="flex-1 flex flex-col items-center justify-center py-6 sm:py-8 max-w-lg mx-auto w-full">
        {/* Stack Container with Border Base */}
        <div className="w-full relative flex flex-col items-center space-y-2.5 p-4 rounded-3xl bg-[#14101e] border-2 border-[#2c243f] shadow-[4px_4px_0px_#1e1b26]">
          {/* TOP Indicator Badge */}
          <div className="w-full flex items-center justify-between px-2 pb-1 border-b border-[#262035] text-xs font-mono text-[#8f8a9e]">
            <span className="flex items-center gap-1 text-[#f04e7c] font-black uppercase text-[11px]">
              <Zap className="w-3.5 h-3.5 fill-[#f04e7c]" /> {topLabel}
            </span>
            <span>{totalSteps} Levels</span>
          </div>

          {/* Stack Tiers */}
          <div className="w-full space-y-2.5 flex flex-col">
            {layers.map((layer, idx) => {
              // Stack renders with index: 0 at top or 0 at bottom
              // Let's highlight layer matching currentStep
              const isVisible = idx <= currentStep
              const isActive = idx === currentStep
              const color = layer.color || LAYER_COLORS[idx % LAYER_COLORS.length]

              return (
                <motion.div
                  key={layer.id || idx}
                  onClick={() => {
                    setCurrentStep(idx)
                    setIsPlaying(false)
                  }}
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{
                    opacity: isVisible ? 1 : 0.25,
                    scale: isActive ? 1.02 : 1,
                    y: 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className={`w-full rounded-2xl p-4 border-2 transition-all cursor-pointer relative overflow-hidden ${
                    isActive
                      ? 'bg-[#1e182c] border-[#f04e7c] shadow-[0_0_20px_rgba(240,78,124,0.3)]'
                      : isVisible
                      ? 'bg-[#181324] border-[#362f4c]'
                      : 'bg-[#100d18] border-[#221c30] opacity-30'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 relative z-10">
                    <div className="flex items-center gap-3">
                      {/* Tier Number Pill */}
                      <div
                        className="w-7 h-7 rounded-xl font-mono text-xs font-black flex items-center justify-center shrink-0 border border-[#1e1b26]"
                        style={{
                          backgroundColor: isVisible ? color : '#262035',
                          color: '#0f0b14',
                        }}
                      >
                        {idx + 1}
                      </div>

                      <div>
                        <h4
                          className={`font-[Outfit] font-bold text-sm sm:text-base ${
                            isActive ? 'text-white' : 'text-[#c7c3d4]'
                          }`}
                        >
                          {layer.label}
                        </h4>
                        {layer.badge && (
                          <span className="inline-block mt-0.5 text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-[#8f8a9e]">
                            {layer.badge}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* TOP Arrow Badge for Active/Topmost */}
                    {isActive && (
                      <div className="flex items-center gap-1 bg-[#ffd6e4] text-[#f04e7c] px-2.5 py-1 rounded-xl text-[11px] font-black border border-[#1e1b26] shadow-[1px_1px_0px_#1e1b26] animate-pulse">
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>ACTIVE</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Stack Container Bottom Floor */}
          <div className="w-full text-center pt-2 border-t-2 border-dashed border-[#362f4c] text-[10px] font-mono font-bold text-[#8f8a9e] uppercase tracking-wider">
            Stack Base
          </div>
        </div>
      </div>

      {/* Narration Banner */}
      <AnimatePresence mode="wait">
        {activeLayer?.description && (
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="bg-[#181324] border-2 border-[#362f4c] rounded-2xl p-3.5 sm:p-4 my-2 text-center"
          >
            <span className="text-[10px] font-black uppercase tracking-wider text-[#fbc13a] block mb-1">
              Tier {currentStep + 1} Description
            </span>
            <p className="text-xs sm:text-sm font-medium text-[#e2dfd2] leading-relaxed">
              {activeLayer.description}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Timeline & Controls */}
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
