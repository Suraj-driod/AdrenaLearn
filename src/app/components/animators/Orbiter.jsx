'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react'
import { CircleNodeBadge, getNeoColor } from './Badges'

/**
 * OrbitingCircles - Core orbital revolution primitive
 */
export function OrbitingCircles({
  className,
  children,
  reverse = false,
  duration = 20,
  radius = 160,
  path = true,
  speed = 1,
  ...props
}) {
  const calculatedDuration = duration / Math.max(0.1, speed)

  return (
    <>
      {path && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          version="1.1"
          className="pointer-events-none absolute inset-0 size-full"
        >
          <circle
            className="stroke-[#362f4c]/50 stroke-1 stroke-dashed"
            cx="50%"
            cy="50%"
            r={radius}
            fill="none"
          />
        </svg>
      )}
      {React.Children.map(children, (child, index) => {
        const count = React.Children.count(children)
        const angle = (360 / Math.max(1, count)) * index

        return (
          <motion.div
            animate={{
              rotate: reverse ? [-angle, -(angle + 360)] : [angle, angle + 360],
            }}
            transition={{
              repeat: Infinity,
              duration: calculatedDuration,
              ease: 'linear',
            }}
            style={{
              width: radius * 2,
              height: radius * 2,
            }}
            className={cn(
              'pointer-events-none absolute flex items-center justify-center',
              className
            )}
            {...props}
          >
            <div
              style={{
                transform: `translateY(-${radius}px)`,
              }}
              className="absolute pointer-events-auto"
            >
              <motion.div
                animate={{
                  rotate: reverse ? [angle, angle + 360] : [-angle, -(angle + 360)],
                }}
                transition={{
                  repeat: Infinity,
                  duration: calculatedDuration,
                  ease: 'linear',
                }}
              >
                {child}
              </motion.div>
            </div>
          </motion.div>
        )
      })}
    </>
  )
}

/**
 * Orbiter Component - Diagrammatic revolution explainer with spacious orbital rings
 */
export function Orbiter({ data }) {
  const core = useMemo(() => {
    return data?.core || data?.center || {
      label: data?.title || 'Core Hub',
      subtitle: '',
      description: data?.description || '',
      color: '#fbc13a',
    }
  }, [data])

  const satellites = useMemo(() => {
    return data?.satellites || data?.nodes || data?.steps || [
      { label: 'Inner Node', subtitle: '', description: '' },
      { label: 'Middle Node', subtitle: '', description: '' },
      { label: 'Outer Node', subtitle: '', description: '' },
    ]
  }, [data])

  const totalSatellites = satellites.length
  const [activeSatelliteIdx, setActiveSatelliteIdx] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)

  useEffect(() => {
    if (!isPlaying || totalSatellites === 0) return

    const intervalTime = 3500 / playbackSpeed
    const timer = setInterval(() => {
      setActiveSatelliteIdx((prev) => (prev + 1) % totalSatellites)
    }, intervalTime)

    return () => clearInterval(timer)
  }, [isPlaying, totalSatellites, playbackSpeed])

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleNext = () => {
    setIsPlaying(false)
    setActiveSatelliteIdx((prev) => (prev + 1) % totalSatellites)
  }

  const handlePrev = () => {
    setIsPlaying(false)
    setActiveSatelliteIdx((prev) => (prev - 1 + totalSatellites) % totalSatellites)
  }

  const handleReset = () => {
    setActiveSatelliteIdx(0)
    setIsPlaying(true)
  }

  const activeSatellite = satellites[activeSatelliteIdx] || satellites[0]

  const innerSatellites = satellites.filter((_, i) => i % 3 === 0)
  const middleSatellites = satellites.filter((_, i) => i % 3 === 1)
  const outerSatellites = satellites.filter((_, i) => i % 3 === 2)

  return (
    <div className="flex flex-col h-full w-full bg-[#0f0b14] text-white p-4 select-none overflow-y-auto">
      {/* Main Spacious Celestial Stage */}
      <div className="flex-1 flex flex-col items-center justify-center py-6 w-full relative min-h-[460px] sm:min-h-[520px] overflow-hidden">
        <div className="relative w-[440px] h-[440px] sm:w-[520px] sm:h-[520px] flex items-center justify-center">
          {/* Central Sun / Core Hub */}
          <div className="absolute z-20 flex flex-col items-center">
            <CircleNodeBadge
              label={core.label}
              subtitle={core.subtitle}
              color={core.color || '#fbc13a'}
              size={64}
              onClick={() => {
                setActiveSatelliteIdx(0)
                setIsPlaying(false)
              }}
            />
          </div>

          {/* Orbit Tier 1: Inner Orbit (radius 120px) */}
          {innerSatellites.length > 0 && (
            <OrbitingCircles
              radius={120}
              duration={18}
              speed={isPlaying ? playbackSpeed : 0.0001}
            >
              {innerSatellites.map((sat, sIdx) => {
                const globalIdx = sIdx * 3
                const isActive = globalIdx === activeSatelliteIdx
                const color = sat.color || getNeoColor(globalIdx + 1).solid

                return (
                  <CircleNodeBadge
                    key={sat.id || sIdx}
                    label={sat.label}
                    subtitle={sat.badge || sat.subtitle}
                    color={color}
                    size={48}
                    isActive={isActive}
                    isHighlighted={isActive}
                    onClick={() => {
                      setActiveSatelliteIdx(globalIdx)
                      setIsPlaying(false)
                    }}
                  />
                )
              })}
            </OrbitingCircles>
          )}

          {/* Orbit Tier 2: Middle Orbit (radius 185px) */}
          {middleSatellites.length > 0 && (
            <OrbitingCircles
              radius={185}
              duration={26}
              speed={isPlaying ? playbackSpeed : 0.0001}
              reverse
            >
              {middleSatellites.map((sat, sIdx) => {
                const globalIdx = sIdx * 3 + 1
                const isActive = globalIdx === activeSatelliteIdx
                const color = sat.color || getNeoColor(globalIdx + 1).solid

                return (
                  <CircleNodeBadge
                    key={sat.id || sIdx}
                    label={sat.label}
                    subtitle={sat.badge || sat.subtitle}
                    color={color}
                    size={48}
                    isActive={isActive}
                    isHighlighted={isActive}
                    onClick={() => {
                      setActiveSatelliteIdx(globalIdx)
                      setIsPlaying(false)
                    }}
                  />
                )
              })}
            </OrbitingCircles>
          )}

          {/* Orbit Tier 3: Outer Orbit (radius 245px) */}
          {outerSatellites.length > 0 && (
            <OrbitingCircles
              radius={245}
              duration={34}
              speed={isPlaying ? playbackSpeed : 0.0001}
            >
              {outerSatellites.map((sat, sIdx) => {
                const globalIdx = sIdx * 3 + 2
                const isActive = globalIdx === activeSatelliteIdx
                const color = sat.color || getNeoColor(globalIdx + 1).solid

                return (
                  <CircleNodeBadge
                    key={sat.id || sIdx}
                    label={sat.label}
                    subtitle={sat.badge || sat.subtitle}
                    color={color}
                    size={48}
                    isActive={isActive}
                    isHighlighted={isActive}
                    onClick={() => {
                      setActiveSatelliteIdx(globalIdx)
                      setIsPlaying(false)
                    }}
                  />
                )
              })}
            </OrbitingCircles>
          )}
        </div>
      </div>

      {/* One-Liner for Clicked / Active Satellite */}
      <AnimatePresence mode="wait">
        {activeSatellite && (activeSatellite.description || activeSatellite.label) && (
          <motion.div
            key={activeSatelliteIdx}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="bg-[#181324] border-2 border-[#362f4c] rounded-2xl p-3.5 my-2 text-center shadow-[2px_2px_0_0_#1e1b26]"
          >
            <p className="text-xs sm:text-sm font-medium text-[#e2dfd2] leading-relaxed max-w-xl mx-auto">
              {activeSatellite.description || activeSatellite.label}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Playback Controls */}
      <div className="pt-2 border-t border-[#262035] flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePlayPause}
            className="flex items-center gap-1.5 bg-[#f04e7c] hover:bg-[#e03d6b] text-white px-3 py-1 rounded-xl text-xs font-black transition-all shadow-[2px_2px_0_0_#1e1b26] active:translate-y-0.5"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3 h-3 fill-white" /> Pause
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-white" /> Orbit
              </>
            )}
          </button>

          <button
            onClick={handlePrev}
            className="p-1.5 rounded-xl bg-[#1c172a] hover:bg-[#28213b] border border-[#362f4c] text-white transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleNext}
            className="p-1.5 rounded-xl bg-[#1c172a] hover:bg-[#28213b] border border-[#362f4c] text-white transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleReset}
            className="p-1.5 rounded-xl bg-[#1c172a] hover:bg-[#28213b] border border-[#362f4c] text-[#8f8a9e] hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center gap-1 bg-[#181424] p-0.5 rounded-xl border border-[#2b243d]">
          {[0.5, 1, 2].map((spd) => (
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

export const Orbiters = Orbiter
export default Orbiter