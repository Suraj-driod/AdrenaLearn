'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  Minus,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  ArrowDown,
} from 'lucide-react'
import { PlateBadge, VerticalPlateBadge, getNeoColor } from './Badges'

/**
 * AnimatedListItem - Spring-animated plate item wrapper
 */
export function AnimatedListItem({ children, className, isHorizontal = false }) {
  return (
    <motion.div
      initial={isHorizontal ? { scale: 0.85, opacity: 0, x: 40 } : { scale: 0.85, opacity: 0, y: -15 }}
      animate={{ scale: 1, opacity: 1, originY: 0, y: 0, x: 0 }}
      exit={isHorizontal ? { scale: 0.85, opacity: 0, x: -60 } : { scale: 0.85, opacity: 0, x: 80 }}
      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
      layout
      className={cn(isHorizontal ? 'shrink-0' : 'mx-auto w-full', className)}
    >
      {children}
    </motion.div>
  )
}

/**
 * AnimatedList Component - Supports both Stack (Horizontal stacked plates)
 * and Queue (Vertical standing plates in a horizontal queue line).
 */
export default function AnimatedList({ data }) {
  const mode = (data?.mode || data?.type || 'stack').toLowerCase()
  const isQueue = mode === 'queue' || mode === 'fifo' || data?.orientation === 'vertical-plates'
  const isStack = mode === 'stack' || mode === 'lifo' || mode === 'layers'

  const initialItems = useMemo(() => {
    return data?.items || data?.layers || data?.steps || [
      { id: '1', label: 'Item 1', subtitle: '', badge: isStack ? 'Base' : 'Front' },
      { id: '2', label: 'Item 2', subtitle: '', badge: 'Tier 2' },
      { id: '3', label: 'Item 3', subtitle: '', badge: 'Tier 3' },
      { id: '4', label: 'Item 4', subtitle: '', badge: isStack ? 'TOP' : 'Rear' },
    ]
  }, [data, isStack])

  const [items, setItems] = useState(initialItems)
  const [activeIdx, setActiveIdx] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)

  useEffect(() => {
    if (!isPlaying || items.length === 0) return

    const intervalTime = 3000 / playbackSpeed
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % items.length)
    }, intervalTime)

    return () => clearInterval(timer)
  }, [isPlaying, items.length, playbackSpeed])

  const handlePushOrEnqueue = () => {
    const nextNum = items.length + 1
    const newItem = {
      id: `item-${Date.now()}`,
      label: `Item ${nextNum}`,
      subtitle: '',
      badge: isStack ? 'TOP' : 'Rear',
    }

    if (isStack) {
      setItems([newItem, ...items])
      setActiveIdx(0)
    } else {
      setItems([...items, newItem])
      setActiveIdx(items.length)
    }
  }

  const handlePopOrDequeue = () => {
    if (items.length <= 1) return

    if (isStack) {
      setItems(items.slice(1))
      setActiveIdx(0)
    } else {
      setItems(items.slice(1))
      setActiveIdx(0)
    }
  }

  const handleReset = () => {
    setItems(initialItems)
    setActiveIdx(0)
    setIsPlaying(true)
  }

  const activeItem = items[activeIdx] || items[0]

  return (
    <div className="flex flex-col h-full w-full bg-[#0f0b14] text-white p-4 select-none overflow-y-auto">
      {/* Interactive Manipulation Bar */}
      <div className="py-2 px-3 mb-3 rounded-2xl bg-[#171324] border border-[#2b243d] flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePushOrEnqueue}
            className="flex items-center gap-1.5 bg-[#f04e7c] hover:bg-[#e03d6b] text-white font-black text-xs px-3 py-1.5 rounded-xl border-2 border-[#1e1b26] shadow-[2px_2px_0_0_#1e1b26] active:translate-y-0.5 active:shadow-none transition-all"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>{isStack ? 'Push (Top)' : 'Enqueue (Rear)'}</span>
          </button>

          <button
            onClick={handlePopOrDequeue}
            disabled={items.length <= 1}
            className="flex items-center gap-1.5 bg-[#fbc13a] hover:bg-[#eab308] disabled:opacity-40 text-[#1e1b26] font-black text-xs px-3 py-1.5 rounded-xl border-2 border-[#1e1b26] shadow-[2px_2px_0_0_#1e1b26] active:translate-y-0.5 active:shadow-none transition-all"
          >
            <Minus className="w-3.5 h-3.5 stroke-[3]" />
            <span>{isStack ? 'Pop (Top)' : 'Dequeue (Front)'}</span>
          </button>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1 text-xs text-[#8f8a9e] hover:text-white p-1 rounded-lg transition-colors font-bold"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Main Plates Stage */}
      <div className="flex-1 flex flex-col items-center justify-center py-4 w-full">
        {/* VARIATION 1: QUEUE (FIFO) -> Vertical Standing Plates in a Horizontal Queue Line */}
        {isQueue && (
          <div className="w-full flex flex-col items-center justify-center space-y-4">
            {/* Flow Indicators */}
            <div className="w-full max-w-xl flex items-center justify-between px-4 text-xs font-mono text-[#8f8a9e]">
              <span className="flex items-center gap-1 text-[#f04e7c] font-black uppercase text-[11px]">
                <ChevronLeft className="w-4 h-4" /> Dequeue Exit (Front)
              </span>
              <span className="flex items-center gap-1 text-[#10b981] font-black uppercase text-[11px]">
                Enqueue Entry (Rear) <ChevronRight className="w-4 h-4" />
              </span>
            </div>

            {/* Horizontal Line of Vertical Plates */}
            <div className="w-full overflow-x-auto py-3 px-4 flex items-center justify-center gap-3 sm:gap-4 min-h-[190px]">
              <AnimatePresence mode="popLayout">
                {items.map((item, idx) => {
                  const isFirst = idx === 0
                  const isLast = idx === items.length - 1
                  const isActive = idx === activeIdx
                  const color = getNeoColor(idx).solid

                  return (
                    <AnimatedListItem key={item.id || idx} isHorizontal={true}>
                      <VerticalPlateBadge
                        index={idx + 1}
                        label={item.label}
                        subtitle={item.description || item.subtitle}
                        badge={
                          isFirst
                            ? 'FRONT'
                            : isLast
                            ? 'REAR'
                            : item.badge
                        }
                        color={color}
                        isActive={isActive}
                        onClick={() => {
                          setActiveIdx(idx)
                          setIsPlaying(false)
                        }}
                      />
                    </AnimatedListItem>
                  )
                })}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* VARIATION 2: STACK (LIFO) -> Horizontal Plates in a Vertical Stack */}
        {!isQueue && (
          <div className="w-full max-w-lg space-y-3 flex flex-col">
            <AnimatePresence mode="popLayout">
              {items.map((item, idx) => {
                const isFirst = idx === 0
                const isLast = idx === items.length - 1
                const isActive = idx === activeIdx
                const color = getNeoColor(idx).solid

                return (
                  <AnimatedListItem key={item.id || idx}>
                    <PlateBadge
                      index={idx + 1}
                      label={item.label}
                      subtitle={item.description || item.subtitle}
                      badge={
                        isFirst
                          ? 'TOP'
                          : isLast
                          ? 'BASE'
                          : item.badge
                      }
                      color={color}
                      isActive={isActive}
                      onClick={() => {
                        setActiveIdx(idx)
                        setIsPlaying(false)
                      }}
                    />
                  </AnimatedListItem>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* One-Liner for Active Plate */}
      <AnimatePresence mode="wait">
        {activeItem && (activeItem.description || activeItem.label) && (
          <motion.div
            key={`${activeIdx}-${items.length}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="bg-[#181324] border-2 border-[#362f4c] rounded-2xl p-3.5 my-2 text-center shadow-[2px_2px_0_0_#1e1b26]"
          >
            <p className="text-xs sm:text-sm font-medium text-[#e2dfd2] leading-relaxed max-w-xl mx-auto">
              {activeItem.description || activeItem.label}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Timeline Controls */}
      <div className="pt-2 border-t border-[#262035] flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 bg-[#f04e7c] hover:bg-[#e03d6b] text-white px-3 py-1 rounded-xl text-xs font-black transition-all shadow-[2px_2px_0_0_#1e1b26] active:translate-y-0.5"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3 h-3 fill-white" /> Pause
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-white" /> Play
              </>
            )}
          </button>

          <button
            onClick={() => {
              setIsPlaying(false)
              setActiveIdx((prev) => Math.max(0, prev - 1))
            }}
            disabled={activeIdx === 0}
            className="p-1.5 rounded-xl bg-[#1c172a] hover:bg-[#28213b] disabled:opacity-40 disabled:cursor-not-allowed border border-[#362f4c] text-white transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              setIsPlaying(false)
              setActiveIdx((prev) => Math.min(items.length - 1, prev + 1))
            }}
            disabled={activeIdx === items.length - 1}
            className="p-1.5 rounded-xl bg-[#1c172a] hover:bg-[#28213b] disabled:opacity-40 disabled:cursor-not-allowed border border-[#362f4c] text-white transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center gap-1 bg-[#181424] p-0.5 rounded-xl border border-[#2b243d]">
          {[1, 1.5, 2].map((spd) => (
            <button
              key={spd}
              onClick={() => setPlaybackSpeed(spd)}
              className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-lg transition-all ${
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
