'use client'

import React, { useState, useMemo } from 'react'
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
 * Network / Networker Component - Interactive network explorer with stable clean visuals
 */
export function Network({ data }) {
  const nodes = useMemo(() => {
    return data?.nodes || [
      { id: '1', label: 'Gateway Ingress', subtitle: '', description: 'Primary entry firewall and reverse proxy.' },
      { id: '2', label: 'Auth Service', subtitle: '', description: 'Manages sessions and OAuth JWT tokens.' },
      { id: '3', label: 'Database Cluster', subtitle: '', description: 'Distributed relational data storage.' },
      { id: '4', label: 'Memory Cache', subtitle: '', description: 'In-memory fast lookup cache.' },
      { id: '5', label: 'Message Queue', subtitle: '', description: 'Pub/sub streaming event bus.' },
      { id: '6', label: 'Analytics Worker', subtitle: '', description: 'Background telemetry processing.' },
    ]
  }, [data])

  const totalNodes = nodes.length

  const [isOpen, setIsOpen] = useState(true)
  const [selectedNodeIdx, setSelectedNodeIdx] = useState(0)
  const [isSendingPulse, setIsSendingPulse] = useState(false)

  const toggleMenu = () => {
    setIsOpen((prev) => !prev)
  }

  const handleSendPacket = () => {
    if (!isOpen) setIsOpen(true)
    setIsSendingPulse(true)
    setTimeout(() => {
      setIsSendingPulse(false)
    }, 1500)
  }

  const handleReset = () => {
    setIsOpen(true)
    setSelectedNodeIdx(0)
    setIsSendingPulse(false)
  }

  const selectedNode = nodes[selectedNodeIdx] || nodes[0]
  const radius = 165

  const menuContainerVariants = {
    open: {
      transition: {
        staggerChildren: 0.07,
      },
    },
    closed: {
      transition: {
        staggerChildren: 0.05,
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
      const angle = (index * (2 * Math.PI)) / Math.max(1, totalNodes) - Math.PI / 2
      return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
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
      {/* Interactive Action Bar */}
      <div className="py-2 px-3 mb-2 rounded-2xl bg-[#171324] border border-[#2b243d] flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMenu}
            className="flex items-center gap-1.5 bg-[#f04e7c] hover:bg-[#e03d6b] text-white font-black text-xs px-3 py-1.5 rounded-xl border-2 border-[#1e1b26] shadow-[2px_2px_0_0_#1e1b26] active:translate-y-0.5 active:shadow-none transition-all"
          >
            {isOpen ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{isOpen ? 'Veil' : 'Unveil'}</span>
          </button>

          <button
            onClick={handleSendPacket}
            disabled={isSendingPulse}
            className="flex items-center gap-1.5 bg-[#10b981] hover:bg-[#059669] disabled:opacity-40 text-[#0f0b14] font-black text-xs px-3 py-1.5 rounded-xl border-2 border-[#1e1b26] shadow-[2px_2px_0_0_#1e1b26] active:translate-y-0.5 active:shadow-none transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Signal</span>
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

      {/* Main Radial Network Stage */}
      <div className="flex-1 flex flex-col items-center justify-center py-6 w-full relative min-h-[400px] sm:min-h-[460px] overflow-hidden">
        <motion.div
          variants={menuContainerVariants}
          initial="closed"
          animate={isOpen ? 'open' : 'closed'}
          className="relative w-[380px] h-[380px] sm:w-[440px] sm:h-[440px] rounded-full flex items-center justify-center"
        >
          {/* Boundary Ring */}
          <div className="absolute inset-0 rounded-full border border-dashed border-[#2b243d]/60 pointer-events-none" />

          {/* Central Interactive Unveil Button Node */}
          <motion.div
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
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

          {/* Radially Unveiled Nodes */}
          <AnimatePresence>
            {isOpen &&
              nodes.map((node, index) => {
                const isSelected = index === selectedNodeIdx
                const color = node.color || getNeoColor(index).solid

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
                      color={color}
                      size={52}
                      isActive={isSelected}
                      onClick={() => setSelectedNodeIdx(index)}
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
