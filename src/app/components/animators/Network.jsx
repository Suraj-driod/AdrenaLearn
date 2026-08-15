'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  Eye,
  EyeOff,
  Send,
  RotateCcw,
} from 'lucide-react'
import { CircleNodeBadge, getNeoColor } from './Badges'

/**
 * Network Component - Clean, simple single-line sequence connecting blob to blob
 */
export function Network({ data }) {
  const rawNodes = useMemo(() => {
    return data?.nodes || [
      { id: '1', label: 'Node 1', subtitle: 'Start', description: 'First step in the network sequence.' },
      { id: '2', label: 'Node 2', subtitle: 'Step 2', description: 'Second step in the network sequence.' },
      { id: '3', label: 'Node 3', subtitle: 'Step 3', description: 'Third step in the network sequence.' },
      { id: '4', label: 'Node 4', subtitle: 'Step 4', description: 'Fourth step in the network sequence.' },
      { id: '5', label: 'Node 5', subtitle: 'Step 5', description: 'Fifth step in the network sequence.' },
      { id: '6', label: 'Node 6', subtitle: 'Step 6', description: 'Sixth step in the network sequence.' },
    ]
  }, [data])

  const totalNodes = rawNodes.length
  const radius = 160
  const centerCoord = 220 // ViewBox is 440 x 440

  // Calculate coordinates for each node in circle
  const nodes = useMemo(() => {
    return rawNodes.map((node, index) => {
      const angle = (index * (2 * Math.PI)) / Math.max(1, totalNodes) - Math.PI / 2
      const relX = Math.cos(angle) * radius
      const relY = Math.sin(angle) * radius
      const svgX = centerCoord + relX
      const svgY = centerCoord + relY
      const color = node.color || getNeoColor(index).solid
      return {
        ...node,
        index,
        angle,
        relX,
        relY,
        svgX,
        svgY,
        color,
      }
    })
  }, [rawNodes, totalNodes, radius, centerCoord])

  // Single continuous SVG path string connecting blob 0 -> blob 1 -> blob 2 -> ... -> blob 0
  const singleLinePath = useMemo(() => {
    if (nodes.length < 2) return ''
    const points = nodes.map((n, i) => `${i === 0 ? 'M' : 'L'} ${n.svgX} ${n.svgY}`)
    return `${points.join(' ')} Z`
  }, [nodes])

  const [isOpen, setIsOpen] = useState(true)
  const [selectedNodeIdx, setSelectedNodeIdx] = useState(0)
  const [isSendingSignal, setIsSendingSignal] = useState(false)
  const [activeSignalIndex, setActiveSignalIndex] = useState(0)

  const toggleMenu = () => {
    setIsOpen((prev) => !prev)
  }

  const handleSendSignal = () => {
    if (!isOpen) setIsOpen(true)
    setIsSendingSignal(true)
    setActiveSignalIndex(0)
    setSelectedNodeIdx(0)

    // Step through each blob in sequence
    const stepDuration = 2000 / Math.max(1, totalNodes)
    nodes.forEach((_, idx) => {
      setTimeout(() => {
        setActiveSignalIndex(idx)
        setSelectedNodeIdx(idx)
      }, idx * stepDuration)
    })

    setTimeout(() => {
      setIsSendingSignal(false)
    }, 2200)
  }

  const handleReset = () => {
    setIsOpen(true)
    setSelectedNodeIdx(0)
    setIsSendingSignal(false)
    setActiveSignalIndex(0)
  }

  const selectedNode = nodes[selectedNodeIdx] || nodes[0]

  const menuContainerVariants = {
    open: {
      transition: {
        staggerChildren: 0.05,
      },
    },
    closed: {
      transition: {
        staggerChildren: 0.03,
        staggerDirection: -1,
      },
    },
  }

  const menuItemVariants = {
    hidden: {
      x: 0,
      y: 0,
      opacity: 0,
      scale: 0,
    },
    visible: (index) => {
      const node = nodes[index] || {}
      return {
        x: node.relX || 0,
        y: node.relY || 0,
        opacity: 1,
        scale: 1,
        transition: { type: 'spring', stiffness: 320, damping: 22 },
      }
    },
    exit: {
      x: 0,
      y: 0,
      opacity: 0,
      scale: 0,
      transition: { type: 'spring', stiffness: 300, damping: 20 },
    },
  }

  return (
    <div className="flex flex-col h-full w-full bg-[#0f0b14] text-white p-4 select-none overflow-y-auto">
      {/* Action Bar */}
      <div className="py-2 px-3 mb-2 rounded-2xl bg-[#171324] border border-[#2b243d] flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMenu}
            className="flex items-center gap-1.5 bg-[#f04e7c] hover:bg-[#e03d6b] text-white font-black text-xs px-3 py-1.5 rounded-xl border-2 border-[#1e1b26] shadow-[2px_2px_0_0_#1e1b26] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
          >
            {isOpen ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{isOpen ? 'Veil' : 'Unveil'}</span>
          </button>

          {/* Send Signal Button */}
          <button
            onClick={handleSendSignal}
            disabled={isSendingSignal}
            className="flex items-center gap-1.5 bg-[#10b981] hover:bg-[#059669] disabled:opacity-50 text-[#0f0b14] font-black text-xs px-3.5 py-1.5 rounded-xl border-2 border-[#1e1b26] shadow-[2px_2px_0_0_#1e1b26] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSendingSignal ? 'Sending Signal...' : 'Send Signal'}</span>
          </button>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1 text-xs text-[#8f8a9e] hover:text-white p-1 rounded-lg transition-colors font-bold cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Main Radial Network Stage */}
      <div className="flex-1 flex flex-col items-center justify-center py-6 w-full relative min-h-[400px] sm:min-h-[460px] overflow-hidden">
        <motion.div
          variants={menuContainerVariants}
          initial="closed"
          animate={isOpen ? 'open' : 'closed'}
          className="relative w-[380px] h-[380px] sm:w-[440px] sm:h-[440px] rounded-full flex items-center justify-center"
        >
          {/* Single Sequential Line Connecting One Blob to the Next */}
          <svg
            viewBox="0 0 440 440"
            className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
          >
            {isOpen && singleLinePath && (
              <>
                {/* 1. Base Subtle Line connecting blob to blob */}
                <path
                  d={singleLinePath}
                  fill="none"
                  stroke="#362f4c"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  opacity="0.8"
                />

                {/* 2. Single Animated Signal Line that travels from one blob to other */}
                {isSendingSignal && (
                  <motion.path
                    d={singleLinePath}
                    fill="none"
                    stroke="#00f5d4"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{
                      duration: 2,
                      ease: 'easeInOut',
                    }}
                  />
                )}
              </>
            )}
          </svg>

          {/* Central Hub Button (Unveil / Veil Toggle) */}
          <motion.div
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
            className="relative z-30 flex flex-col items-center"
          >
            <button
              onClick={toggleMenu}
              className="w-14 h-14 rounded-full bg-[#f04e7c] text-white border-2 border-[#1e1b26] shadow-[3px_3px_0_0_#1e1b26] flex items-center justify-center cursor-pointer relative group"
              title="Toggle Unveil"
            >
              <div className="flex flex-col items-center justify-center gap-1">
                <motion.span
                  animate={{
                    rotate: isOpen ? 45 : 0,
                    y: isOpen ? 5 : 0,
                  }}
                  className="w-6 h-[2.5px] bg-white rounded-full transition-transform"
                />
                <motion.span
                  animate={{ opacity: isOpen ? 0 : 1 }}
                  className="w-6 h-[2.5px] bg-white rounded-full"
                />
                <motion.span
                  animate={{
                    rotate: isOpen ? -45 : 0,
                    y: isOpen ? -5 : 0,
                  }}
                  className="w-6 h-[2.5px] bg-white rounded-full transition-transform"
                />
              </div>
            </button>
          </motion.div>

          {/* Circular Blobs connected sequentially */}
          <AnimatePresence>
            {isOpen &&
              nodes.map((node, index) => {
                const isSelected = index === selectedNodeIdx
                const isCurrentInSignal = isSendingSignal && index === activeSignalIndex

                return (
                  <motion.div
                    key={node.id || index}
                    custom={index}
                    variants={menuItemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="absolute z-20"
                  >
                    <CircleNodeBadge
                      label={node.label}
                      subtitle={node.subtitle}
                      color={node.color}
                      size={52}
                      isActive={isSelected || isCurrentInSignal}
                      onClick={() => {
                        setSelectedNodeIdx(index)
                      }}
                    />
                  </motion.div>
                )
              })}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* One-Liner for Selected Node */}
      <AnimatePresence mode="wait">
        {selectedNode && (selectedNode.description || selectedNode.label) && (
          <motion.div
            key={selectedNode.id || selectedNodeIdx}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="bg-[#181324] border-2 border-[#362f4c] rounded-2xl p-3.5 my-2 text-center shadow-[2px_2px_0_0_#1e1b26]"
          >
            <p className="text-xs sm:text-sm font-medium text-[#e2dfd2] leading-relaxed max-w-xl mx-auto">
              {selectedNode.description || selectedNode.label}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export const Networker = Network
export default Network
