'use client'

import React, { useEffect, useState, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react'
import { CircleNodeBadge, getNeoColor } from './Badges'

/**
 * Connectors Component - Clean diagrammatic engine for Mind Maps & Chains
 */
export default function Connectors({ data }) {
  const pattern = (data?.pattern || data?.type || 'mindmap').toLowerCase()
  const isChain = pattern === 'chain' || pattern === 'one-to-one'

  const rootNode = useMemo(() => {
    return data?.root || (data?.nodes && data.nodes[0]) || {
      id: 'root',
      label: data?.title || 'Core Topic',
      subtitle: '',
      description: data?.description || '',
    }
  }, [data])

  const branchNodes = useMemo(() => {
    return data?.branches || (data?.nodes && data.nodes.slice(1)) || data?.steps || [
      { id: '1', label: 'Component A', subtitle: '', description: '' },
      { id: '2', label: 'Component B', subtitle: '', description: '' },
      { id: '3', label: 'Component C', subtitle: '', description: '' },
    ]
  }, [data])

  const allNodes = useMemo(() => [rootNode, ...branchNodes], [rootNode, branchNodes])
  const totalNodes = allNodes.length

  const [activeStep, setActiveStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)

  const containerRef = useRef(null)
  const rootRef = useRef(null)
  const nodeRefs = useRef({})
  const [lines, setLines] = useState([])

  // Calculate connector lines without cyclic re-renders
  useEffect(() => {
    const calculateLines = () => {
      if (!containerRef.current) return
      const containerRect = containerRef.current.getBoundingClientRect()
      if (containerRect.width === 0 || containerRect.height === 0) return

      const newLines = []

      if (!isChain && rootRef.current) {
        const rRect = rootRef.current.getBoundingClientRect()
        const startX = rRect.left - containerRect.left + rRect.width / 2
        const startY = rRect.top - containerRect.top + rRect.height / 2

        branchNodes.forEach((branch, idx) => {
          const el = nodeRefs.current[branch.id || idx]
          if (el) {
            const bRect = el.getBoundingClientRect()
            const endX = bRect.left - containerRect.left + bRect.width / 2
            const endY = bRect.top - containerRect.top + bRect.height / 2
            const controlY = (startY + endY) / 2 + (idx % 2 === 0 ? 15 : -15)
            const d = `M ${startX},${startY} Q ${(startX + endX) / 2},${controlY} ${endX},${endY}`

            newLines.push({
              id: `line-${idx}`,
              d,
              idx: idx + 1,
              color: getNeoColor(idx + 1).solid,
            })
          }
        })
      } else if (isChain) {
        for (let i = 0; i < allNodes.length - 1; i++) {
          const fromEl = nodeRefs.current[allNodes[i].id || i] || (i === 0 ? rootRef.current : null)
          const toEl = nodeRefs.current[allNodes[i + 1].id || (i + 1)]

          if (fromEl && toEl) {
            const fRect = fromEl.getBoundingClientRect()
            const tRect = toEl.getBoundingClientRect()
            const startX = fRect.left - containerRect.left + fRect.width / 2
            const startY = fRect.top - containerRect.top + fRect.height / 2
            const endX = tRect.left - containerRect.left + tRect.width / 2
            const endY = tRect.top - containerRect.top + tRect.height / 2
            const d = `M ${startX},${startY} L ${endX},${endY}`

            newLines.push({
              id: `chain-line-${i}`,
              d,
              idx: i + 1,
              color: getNeoColor(i + 1).solid,
            })
          }
        }
      }

      setLines(newLines)
    }

    calculateLines()
    const timer1 = setTimeout(calculateLines, 60)
    const timer2 = setTimeout(calculateLines, 250)

    window.addEventListener('resize', calculateLines)
    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      window.removeEventListener('resize', calculateLines)
    }
  }, [data, isChain, branchNodes, allNodes])

  // Auto-play timer
  useEffect(() => {
    if (!isPlaying || totalNodes <= 1) return

    const intervalTime = 3200 / playbackSpeed
    const timer = setInterval(() => {
      setActiveStep((prev) => {
        if (prev >= totalNodes - 1) {
          setIsPlaying(false)
          return prev
        }
        return prev + 1
      })
    }, intervalTime)

    return () => clearInterval(timer)
  }, [isPlaying, totalNodes, playbackSpeed])

  const handlePlayPause = () => {
    if (!isPlaying && activeStep >= totalNodes - 1) {
      setActiveStep(0)
    }
    setIsPlaying(!isPlaying)
  }

  const handleNext = () => {
    setIsPlaying(false)
    setActiveStep((prev) => Math.min(totalNodes - 1, prev + 1))
  }

  const handlePrev = () => {
    setIsPlaying(false)
    setActiveStep((prev) => Math.max(0, prev - 1))
  }

  const handleReset = () => {
    setActiveStep(0)
    setIsPlaying(true)
  }

  const activeNode = allNodes[activeStep] || rootNode

  return (
    <div className="flex flex-col h-full w-full bg-[#0f0b14] text-white p-4 select-none overflow-y-auto">
      {/* Main Connection Canvas */}
      <div
        ref={containerRef}
        className="flex-1 flex flex-col items-center justify-center py-6 w-full relative min-h-[340px]"
      >
        {/* SVG Connector Layer */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
          xmlns="http://www.w3.org/2000/svg"
        >
          {lines.map((line) => {
            const isActive = line.idx <= activeStep
            return (
              <g key={line.id}>
                <path
                  d={line.d}
                  fill="none"
                  stroke={isActive ? line.color : '#2b243d'}
                  strokeWidth={isActive ? '2.5' : '1.5'}
                  strokeOpacity={isActive ? '0.7' : '0.25'}
                  strokeLinecap="round"
                  className="transition-colors duration-300"
                />
                {isActive && (
                  <path
                    d={line.d}
                    fill="none"
                    stroke={line.color}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeDasharray="8 12"
                    className="animate-[dash_2s_linear_infinite]"
                  />
                )}
              </g>
            )
          })}
        </svg>

        {/* ONE-TO-MANY MINDMAP PATTERN */}
        {!isChain && (
          <div className="w-full max-w-2xl flex flex-col items-center gap-12 relative z-10">
            {/* Root Node */}
            <div ref={rootRef} className="relative z-10">
              <CircleNodeBadge
                label={rootNode.label}
                subtitle={rootNode.subtitle}
                color={rootNode.color || getNeoColor(0).solid}
                size={62}
                isActive={activeStep === 0}
                onClick={() => {
                  setActiveStep(0)
                  setIsPlaying(false)
                }}
              />
            </div>

            {/* Child Branches */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 sm:gap-10 w-full justify-items-center relative z-10">
              {branchNodes.map((branch, idx) => {
                const nodeIndex = idx + 1
                const isVisible = nodeIndex <= activeStep
                const isActive = nodeIndex === activeStep
                const color = branch.color || getNeoColor(nodeIndex).solid

                return (
                  <div
                    key={branch.id || idx}
                    ref={(el) => {
                      nodeRefs.current[branch.id || idx] = el
                    }}
                    className="relative flex flex-col items-center"
                  >
                    <CircleNodeBadge
                      label={branch.label}
                      subtitle={branch.badge || branch.subtitle}
                      color={color}
                      size={52}
                      isActive={isActive}
                      isHighlighted={isVisible}
                      onClick={() => {
                        setActiveStep(nodeIndex)
                        setIsPlaying(false)
                      }}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ONE-TO-ONE CHAIN PATTERN */}
        {isChain && (
          <div className="w-full max-w-3xl flex flex-wrap items-center justify-center gap-6 sm:gap-10 relative z-10 py-6">
            {allNodes.map((node, idx) => {
              const isVisible = idx <= activeStep
              const isActive = idx === activeStep
              const color = node.color || getNeoColor(idx).solid

              return (
                <div
                  key={node.id || idx}
                  ref={(el) => {
                    if (idx === 0) rootRef.current = el
                    nodeRefs.current[node.id || idx] = el
                  }}
                  className="flex flex-col items-center relative z-10"
                >
                  <CircleNodeBadge
                    label={node.label}
                    subtitle={node.badge || node.subtitle}
                    color={color}
                    size={54}
                    isActive={isActive}
                    onClick={() => {
                      setActiveStep(idx)
                      setIsPlaying(false)
                    }}
                  />
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* One-Liner for Clicked / Active Node */}
      <AnimatePresence mode="wait">
        {activeNode && (activeNode.description || activeNode.label) && (
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="bg-[#181324] border-2 border-[#362f4c] rounded-2xl p-3.5 my-2 text-center shadow-[2px_2px_0_0_#1e1b26]"
          >
            <p className="text-xs sm:text-sm font-medium text-[#e2dfd2] leading-relaxed max-w-xl mx-auto">
              {activeNode.description || activeNode.label}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timeline Controls */}
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
                <Play className="w-3 h-3 fill-white" /> Play
              </>
            )}
          </button>

          <button
            onClick={handlePrev}
            disabled={activeStep === 0}
            className="p-1.5 rounded-xl bg-[#1c172a] hover:bg-[#28213b] disabled:opacity-40 disabled:cursor-not-allowed border border-[#362f4c] text-white transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleNext}
            disabled={activeStep === totalNodes - 1}
            className="p-1.5 rounded-xl bg-[#1c172a] hover:bg-[#28213b] disabled:opacity-40 disabled:cursor-not-allowed border border-[#362f4c] text-white transition-colors"
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
