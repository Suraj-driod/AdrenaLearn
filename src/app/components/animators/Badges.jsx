'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

// Curated neo-brutalist color palette
export const NEO_COLORS = [
  { bg: '#ffd6e4', solid: '#f04e7c', text: '#1e1b26', name: 'pink' },
  { bg: '#fef08a', solid: '#fbc13a', text: '#1e1b26', name: 'yellow' },
  { bg: '#ede4ff', solid: '#7c3aed', text: '#ffffff', name: 'purple' },
  { bg: '#e0f2fe', solid: '#38bdf8', text: '#1e1b26', name: 'cyan' },
  { bg: '#d1fae5', solid: '#10b981', text: '#ffffff', name: 'emerald' },
  { bg: '#ffedd5', solid: '#ea580c', text: '#ffffff', name: 'orange' },
  { bg: '#f3e8ff', solid: '#a855f7', text: '#ffffff', name: 'violet' },
  { bg: '#cffafe', solid: '#06b6d4', text: '#1e1b26', name: 'teal' },
  { bg: '#fce7f3', solid: '#ec4899', text: '#ffffff', name: 'rose' },
]

export function getNeoColor(index = 0) {
  const safeIdx = Math.abs(Number(index) || 0) % NEO_COLORS.length
  return NEO_COLORS[safeIdx]
}

/**
 * NeobrutalBadge - Neobrutalism badge with solid borders and hard shadows
 */
export function NeobrutalBadge({
  children,
  variant = 'pink',
  color,
  bg,
  textColor,
  icon: Icon,
  size = 'md',
  isActive = false,
  className = '',
  onClick,
  ...props
}) {
  const sizeClasses = {
    xs: 'px-2 py-0.5 text-[10px]',
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-xs sm:text-sm',
    lg: 'px-4 py-2 text-sm sm:text-base font-bold',
  }[size] || 'px-3 py-1.5 text-xs'

  const variantStyles = {
    info: 'bg-blue-100 text-blue-900 border-black',
    success: 'bg-green-100 text-green-900 border-black',
    error: 'bg-red-100 text-red-900 border-black',
    pink: 'bg-[#ffd6e4] text-[#1e1b26] border-[#1e1b26]',
    yellow: 'bg-[#fef08a] text-[#1e1b26] border-[#1e1b26]',
    purple: 'bg-[#ede4ff] text-[#7c3aed] border-[#1e1b26]',
    cyan: 'bg-[#e0f2fe] text-[#0369a1] border-[#1e1b26]',
    emerald: 'bg-[#d1fae5] text-[#065f46] border-[#1e1b26]',
    orange: 'bg-[#ffedd5] text-[#9a3412] border-[#1e1b26]',
  }[variant] || 'bg-[#ffd6e4] text-[#1e1b26] border-[#1e1b26]'

  return (
    <motion.span
      whileHover={{ y: -1, scale: 1.02 }}
      whileTap={{ y: 1, scale: 0.98 }}
      onClick={onClick}
      style={{
        backgroundColor: bg,
        color: textColor,
        borderColor: color ? '#1e1b26' : undefined,
      }}
      className={cn(
        'inline-flex items-center gap-1.5 font-[Outfit] font-semibold border-2 rounded-lg shadow-[2px_2px_0_0_#1e1b26] transition-all select-none',
        variantStyles,
        sizeClasses,
        isActive ? 'ring-2 ring-[#f04e7c] shadow-[3px_3px_0_0_#1e1b26] -translate-y-0.5' : '',
        onClick ? 'cursor-pointer' : '',
        className
      )}
      {...props}
    >
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      <span>{children}</span>
    </motion.span>
  )
}

/**
 * CircleNodeBadge - Solid colored circle node with text below.
 * Clean, stable visual representation with NO blinking or pulsing effects.
 */
export function CircleNodeBadge({
  label,
  subtitle,
  icon: Icon,
  symbol,
  color = '#f04e7c',
  size = 54,
  isActive = false,
  isHighlighted = false,
  onClick,
  className = '',
}) {
  const diameter = Math.max(36, size)

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex flex-col items-center select-none transition-all',
        onClick ? 'cursor-pointer group' : '',
        className
      )}
    >
      <div className="relative flex items-center justify-center">
        <motion.div
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          style={{
            width: diameter,
            height: diameter,
            backgroundColor: color,
          }}
          className={cn(
            'rounded-full border-2 border-[#1e1b26] flex items-center justify-center font-[Outfit] font-black text-white relative z-10 transition-all shadow-[3px_3px_0_0_#1e1b26]',
            isActive
              ? 'shadow-[4px_4px_0_0_#1e1b26] ring-4 ring-[#fbc13a]'
              : isHighlighted
              ? 'ring-2 ring-white/60'
              : 'group-hover:shadow-[4px_4px_0_0_#1e1b26]'
          )}
        >
          {Icon ? (
            <Icon className="w-5 h-5 text-[#1e1b26] stroke-[2.5]" />
          ) : symbol ? (
            <span className="text-sm font-black text-[#1e1b26] leading-none">
              {symbol}
            </span>
          ) : (
            <span className="w-3.5 h-3.5 rounded-full bg-white/90 border border-[#1e1b26]" />
          )}
        </motion.div>
      </div>

      {label && (
        <div className="mt-2 text-center max-w-[130px] flex flex-col items-center">
          <span
            className={cn(
              'font-[Outfit] font-extrabold text-xs sm:text-sm leading-tight transition-colors line-clamp-2',
              isActive
                ? 'text-[#fbc13a] scale-105'
                : 'text-[#e2dfd2] group-hover:text-white'
            )}
          >
            {label}
          </span>
          {subtitle && (
            <span className="text-[10px] font-mono font-medium text-[#8f8a9e] mt-0.5 line-clamp-1">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * PlateBadge - Horizontal plate card for Stack (LIFO) and list sequences
 */
export function PlateBadge({
  index,
  label,
  subtitle,
  badge,
  color = '#ffd6e4',
  isActive = false,
  isTarget = false,
  onClick,
  className = '',
}) {
  return (
    <motion.div
      layout
      whileHover={{ scale: 1.01, x: 2 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      style={{
        backgroundColor: isActive ? '#241e35' : '#171324',
        borderLeftColor: color,
      }}
      className={cn(
        'w-full rounded-2xl p-3.5 sm:p-4 border-2 border-[#2b243d] border-l-8 shadow-[3px_3px_0_0_#1e1b26] transition-all',
        isActive
          ? 'ring-2 ring-[#fbc13a] shadow-[4px_4px_0_0_#1e1b26] bg-[#241e35]'
          : isTarget
          ? 'border-[#f04e7c]'
          : 'hover:border-[#3d3357]',
        onClick ? 'cursor-pointer' : '',
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {index !== undefined && (
            <div
              style={{ backgroundColor: color }}
              className="w-7 h-7 rounded-xl font-mono text-xs font-black text-[#1e1b26] border border-[#1e1b26] flex items-center justify-center shrink-0 shadow-[1px_1px_0_0_#1e1b26]"
            >
              {index}
            </div>
          )}
          <div className="min-w-0">
            <h4
              className={cn(
                'font-[Outfit] font-bold text-sm sm:text-base leading-snug truncate',
                isActive ? 'text-white font-black' : 'text-[#e2dfd2]'
              )}
            >
              {label}
            </h4>
            {subtitle && (
              <p className="text-xs text-[#8f8a9e] font-medium mt-0.5 truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {badge && (
          <span
            style={{ backgroundColor: color }}
            className="shrink-0 text-[10px] font-mono font-black uppercase text-[#1e1b26] px-2.5 py-1 rounded-full border border-[#1e1b26] shadow-[1px_1px_0_0_#1e1b26]"
          >
            {badge}
          </span>
        )}
      </div>
    </motion.div>
  )
}

/**
 * VerticalPlateBadge - Standing upright plate card for Queue (FIFO) and horizontal queues
 */
export function VerticalPlateBadge({
  index,
  label,
  subtitle,
  badge,
  color = '#ffd6e4',
  isActive = false,
  onClick,
  className = '',
}) {
  return (
    <motion.div
      layout
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      style={{
        backgroundColor: isActive ? '#241e35' : '#171324',
        borderTopColor: color,
      }}
      className={cn(
        'w-24 sm:w-28 h-36 sm:h-44 rounded-2xl p-3 border-2 border-[#2b243d] border-t-8 shadow-[3px_3px_0_0_#1e1b26] flex flex-col justify-between items-center text-center transition-all select-none',
        isActive
          ? 'ring-2 ring-[#fbc13a] shadow-[4px_4px_0_0_#1e1b26] bg-[#241e35] -translate-y-1'
          : 'hover:border-[#3d3357]',
        onClick ? 'cursor-pointer' : '',
        className
      )}
    >
      {/* Index Pill */}
      {index !== undefined && (
        <div
          style={{ backgroundColor: color }}
          className="w-6 h-6 rounded-lg font-mono text-[11px] font-black text-[#1e1b26] border border-[#1e1b26] flex items-center justify-center shadow-[1px_1px_0_0_#1e1b26]"
        >
          {index}
        </div>
      )}

      {/* Plate Label */}
      <div className="w-full my-auto px-1">
        <h4
          className={cn(
            'font-[Outfit] font-bold text-xs sm:text-sm leading-tight line-clamp-2',
            isActive ? 'text-white font-black text-[#fbc13a]' : 'text-[#e2dfd2]'
          )}
        >
          {label}
        </h4>
        {subtitle && (
          <p className="text-[10px] text-[#8f8a9e] font-medium mt-1 line-clamp-1">
            {subtitle}
          </p>
        )}
      </div>

      {/* Badge Tag at Bottom */}
      {badge && (
        <span
          style={{ backgroundColor: color }}
          className="text-[9px] font-mono font-black uppercase text-[#1e1b26] px-2 py-0.5 rounded-full border border-[#1e1b26] shadow-[1px_1px_0_0_#1e1b26] whitespace-nowrap"
        >
          {badge}
        </span>
      )}
    </motion.div>
  )
}

export default {
  NEO_COLORS,
  getNeoColor,
  NeobrutalBadge,
  CircleNodeBadge,
  PlateBadge,
  VerticalPlateBadge,
}