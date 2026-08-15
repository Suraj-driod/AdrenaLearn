'use client'

import React from 'react'
import Connectors from './Connectors'
import Orbiter from './Orbiter'
import Network from './Network'
import AnimatedList from './AnimatedList'
import DotMultiplier from './DotMultiplier'
import { Sparkles } from 'lucide-react'

/**
 * Validates whether the animation payload contains structured data
 */
export function validateAnimationData(data) {
  if (!data || typeof data !== 'object') return false

  const type = String(data.type || '').toLowerCase()

  if (type === 'connectors' || type === 'mindmap' || type === 'flow' || type === 'chain' || type === 'tree') {
    return Boolean(data.root || Array.isArray(data.nodes) || Array.isArray(data.branches) || Array.isArray(data.steps))
  }

  if (type === 'orbiter' || type === 'orbiters' || type === 'orbit' || type === 'revolution' || type === 'solar' || type === 'ecosystem') {
    return Boolean(data.core || Array.isArray(data.satellites) || Array.isArray(data.nodes) || Array.isArray(data.steps))
  }

  if (type === 'network' || type === 'networker' || type === 'unveil' || type === 'topology' || type === 'sequence' || type === 'protocol') {
    return Boolean(Array.isArray(data.nodes) || Array.isArray(data.actors) || Array.isArray(data.steps))
  }

  if (type === 'animatedlist' || type === 'list' || type === 'stack' || type === 'queue' || type === 'layers' || type === 'plates') {
    return Boolean(Array.isArray(data.items) || Array.isArray(data.layers) || Array.isArray(data.steps))
  }

  if (
    type === 'dotmultiplier' ||
    type === 'multiplier' ||
    type === 'gravity' ||
    type === 'particles' ||
    type === 'physics' ||
    type === 'magnet' ||
    type === 'magnetic' ||
    type === 'cells' ||
    type === 'cell'
  ) {
    return Boolean(Array.isArray(data.nodes) || Array.isArray(data.items) || Array.isArray(data.steps))
  }

  // Fallback check if it has nodes or steps
  return Boolean(Array.isArray(data.steps) || Array.isArray(data.nodes) || Array.isArray(data.items) || Array.isArray(data.layers))
}

/**
 * Main Animation Engine routing to the 5 modern animators:
 * 1. Connectors (mindmaps, hierarchies, trees)
 * 2. Orbiter (revolutions, solar systems, ecosystems)
 * 3. Network (interactive nodes & topologies)
 * 4. AnimatedList (stacks, queues, horizontal & vertical plates)
 * 5. DotMultiplier (matter.js gravity, cell multiplication, magnetic attraction/repulsion)
 */
export default function AnimationEngine({ animation, topic = '' }) {
  const isValid = validateAnimationData(animation)

  if (!isValid) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-[#0f0b14] text-white p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#ffd6e4] border-2 border-[#1e1b26] flex items-center justify-center shadow-[2px_2px_0px_#1e1b26]">
          <Sparkles className="w-6 h-6 text-[#f04e7c]" />
        </div>
        <div className="max-w-md">
          <h3 className="font-[Outfit] text-lg font-black text-[#e2dfd2]">
            {topic || 'Visual Concept'}
          </h3>
        </div>
      </div>
    )
  }

  const type = String(animation.type || '').toLowerCase()

  switch (type) {
    case 'connectors':
    case 'mindmap':
    case 'tree':
    case 'chain':
    case 'flow':
      return <Connectors data={animation} />

    case 'orbiter':
    case 'orbiters':
    case 'orbit':
    case 'revolution':
    case 'solar':
    case 'ecosystem':
      return <Orbiter data={animation} />

    case 'network':
    case 'networker':
    case 'unveil':
    case 'topology':
    case 'sequence':
    case 'protocol':
      return <Network data={animation} />

    case 'animatedlist':
    case 'list':
    case 'stack':
    case 'queue':
    case 'layers':
    case 'plates':
      return <AnimatedList data={animation} />

    case 'dotmultiplier':
    case 'multiplier':
    case 'gravity':
    case 'particles':
    case 'physics':
    case 'magnet':
    case 'magnetic':
    case 'cells':
    case 'cell':
      return <DotMultiplier data={animation} />

    default:
      // If it looks like stack/queue/layers
      if (Array.isArray(animation.layers) || Array.isArray(animation.items)) {
        return <AnimatedList data={animation} />
      }
      // If it has core or satellites
      if (animation.core || animation.satellites) {
        return <Orbiter data={animation} />
      }
      // Default to Connectors
      return <Connectors data={animation} />
  }
}
