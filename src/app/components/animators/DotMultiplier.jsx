'use client'

import React, {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  useMemo,
} from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Matter, {
  Bodies,
  Common,
  Engine,
  Events,
  Render,
  Runner,
  World,
  Body,
} from 'matter-js'
import decomp from 'poly-decomp'
import { cn } from '@/lib/utils'
import {
  RotateCcw,
  Plus,
  Minus,
  Magnet,
} from 'lucide-react'
import { getNeoColor } from './Badges'

// Helper to calculate position from percent string or number
export function calculatePosition(value, containerSize, elementSize) {
  if (typeof value === 'string' && value.endsWith('%')) {
    const percentage = parseFloat(value) / 100
    return containerSize * percentage
  }
  if (typeof value === 'number') {
    return value
  }
  return (containerSize - elementSize) / 2
}

// Mouse position tracker hook for physics canvas
function useMousePosition(ref) {
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const handleMouseMove = (e) => {
      const rect = element.getBoundingClientRect()
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }

    const handleMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 }
    }

    element.addEventListener('mousemove', handleMouseMove)
    element.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      element.removeEventListener('mousemove', handleMouseMove)
      element.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [ref])

  return mouseRef
}

const GravityContext = createContext(null)

/**
 * MatterBody Component - Wraps child element in a Matter.js physics body
 */
export function MatterBody({
  children,
  className,
  matterBodyOptions = {
    friction: 0.05,
    restitution: 0.8,
    density: 0.002,
    isStatic: false,
  },
  bodyType = 'circle',
  isDraggable = true,
  x = '50%',
  y = '50%',
  angle = 0,
  ...props
}) {
  const elementRef = useRef(null)
  const idRef = useRef(`mb-${Math.random().toString(36).substring(7)}`)
  const context = useContext(GravityContext)

  useEffect(() => {
    if (!elementRef.current || !context) return
    context.registerElement(idRef.current, elementRef.current, {
      children,
      matterBodyOptions,
      bodyType,
      isDraggable,
      x,
      y,
      angle,
      ...props,
    })

    return () => context.unregisterElement(idRef.current)
  }, [context, bodyType, isDraggable, x, y, angle, props, children, matterBodyOptions])

  return (
    <div
      ref={elementRef}
      className={cn('absolute pointer-events-auto', className)}
    >
      {children}
    </div>
  )
}

/**
 * Gravity - Matter.js canvas engine with magnetic attractor and cursor field forces
 */
export const Gravity = forwardRef(function Gravity(
  {
    children,
    debug = false,
    attractorPoint = { x: 0.5, y: 0.5 },
    attractorStrength = 0.0008,
    cursorStrength = -0.004,
    cursorFieldRadius = 180,
    resetOnResize = true,
    addTopWall = true,
    autoStart = true,
    className,
    ...props
  },
  ref
) {
  const canvas = useRef(null)
  const engine = useRef(Engine.create())
  const render = useRef(undefined)
  const runner = useRef(undefined)
  const bodiesMap = useRef(new Map())
  const frameId = useRef(undefined)
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })
  const mouseRef = useMousePosition(canvas)
  const isRunning = useRef(false)

  const registerElement = useCallback(
    (id, element, bodyProps) => {
      if (!canvas.current) return
      const width = element.offsetWidth || 44
      const height = element.offsetHeight || 44
      const canvasRect = canvas.current.getBoundingClientRect()

      const angle = (bodyProps.angle || 0) * (Math.PI / 180)
      const x = calculatePosition(bodyProps.x, canvasRect.width || 400, width)
      const y = calculatePosition(bodyProps.y, canvasRect.height || 400, height)

      let body
      if (bodyProps.bodyType === 'circle') {
        const radius = Math.max(width, height) / 2
        body = Bodies.circle(x, y, radius, {
          ...bodyProps.matterBodyOptions,
          angle: angle,
          render: {
            fillStyle: debug ? '#888888' : '#00000000',
            strokeStyle: debug ? '#333333' : '#00000000',
            lineWidth: debug ? 2 : 0,
          },
        })
      } else {
        body = Bodies.rectangle(x, y, width, height, {
          ...bodyProps.matterBodyOptions,
          angle: angle,
          render: {
            fillStyle: debug ? '#888888' : '#00000000',
            strokeStyle: debug ? '#333333' : '#00000000',
            lineWidth: debug ? 2 : 0,
          },
        })
      }

      if (body) {
        World.add(engine.current.world, [body])
        bodiesMap.current.set(id, { element, body, props: bodyProps })
      }
    },
    [debug]
  )

  const unregisterElement = useCallback((id) => {
    const item = bodiesMap.current.get(id)
    if (item) {
      World.remove(engine.current.world, item.body)
      bodiesMap.current.delete(id)
    }
  }, [])

  const updateElements = useCallback(() => {
    bodiesMap.current.forEach(({ element, body }) => {
      const { x, y } = body.position
      const rotation = body.angle * (180 / Math.PI)

      element.style.transform = `translate(${
        x - element.offsetWidth / 2
      }px, ${y - element.offsetHeight / 2}px) rotate(${rotation}deg)`
    })

    frameId.current = requestAnimationFrame(updateElements)
  }, [])

  const initializeRenderer = useCallback(() => {
    if (!canvas.current) return

    const height = canvas.current.offsetHeight || 420
    const width = canvas.current.offsetWidth || 500

    if (decomp) {
      Common.setDecomp(decomp)
    }

    // Zero out gravity for custom magnetic attractor forces
    engine.current.gravity.x = 0
    engine.current.gravity.y = 0

    render.current = Render.create({
      element: canvas.current,
      engine: engine.current,
      options: {
        width,
        height,
        wireframes: false,
        background: '#00000000',
      },
    })

    // Boundaries / Walls
    const walls = [
      // Floor
      Bodies.rectangle(width / 2, height + 10, width + 40, 20, {
        isStatic: true,
        friction: 0.8,
        render: { visible: debug },
      }),
      // Right wall
      Bodies.rectangle(width + 10, height / 2, 20, height + 40, {
        isStatic: true,
        friction: 0.8,
        render: { visible: debug },
      }),
      // Left wall
      Bodies.rectangle(-10, height / 2, 20, height + 40, {
        isStatic: true,
        friction: 0.8,
        render: { visible: debug },
      }),
    ]

    if (addTopWall) {
      walls.push(
        Bodies.rectangle(width / 2, -10, width + 40, 20, {
          isStatic: true,
          friction: 0.8,
          render: { visible: debug },
        })
      )
    }

    World.add(engine.current.world, walls)

    runner.current = Runner.create()
    Render.run(render.current)
    updateElements()
    runner.current.enabled = false

    if (autoStart) {
      runner.current.enabled = true
      Runner.run(runner.current, engine.current)
      isRunning.current = true
    }

    // Apply Attractor Force & Cursor Magnetic Repulsion
    Events.on(engine.current, 'beforeUpdate', () => {
      const bodies = engine.current.world.bodies.filter((b) => !b.isStatic)

      const attractorX =
        typeof attractorPoint.x === 'string'
          ? (width * parseFloat(attractorPoint.x)) / 100
          : width * (attractorPoint.x || 0.5)

      const attractorY =
        typeof attractorPoint.y === 'string'
          ? (height * parseFloat(attractorPoint.y)) / 100
          : height * (attractorPoint.y || 0.5)

      bodies.forEach((body) => {
        // Attractor force towards center
        const dx = attractorX - body.position.x
        const dy = attractorY - body.position.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance > 5) {
          const forceMag = Math.min(0.002, (attractorStrength * (body.mass || 1)) / (distance * 0.1 + 1))
          Body.applyForce(body, body.position, {
            x: (dx / distance) * forceMag * (body.mass || 1),
            y: (dy / distance) * forceMag * (body.mass || 1),
          })
        }

        // Cursor magnetic field repulsion / attraction
        if (mouseRef.current && mouseRef.current.x > 0 && mouseRef.current.y > 0) {
          const mdx = mouseRef.current.x - body.position.x
          const mdy = mouseRef.current.y - body.position.y
          const mouseDistance = Math.sqrt(mdx * mdx + mdy * mdy)

          if (mouseDistance > 0 && mouseDistance < cursorFieldRadius) {
            const factor = (cursorFieldRadius - mouseDistance) / cursorFieldRadius
            Body.applyForce(body, body.position, {
              x: (mdx / mouseDistance) * cursorStrength * factor * (body.mass || 1),
              y: (mdy / mouseDistance) * cursorStrength * factor * (body.mass || 1),
            })
          }
        }
      })
    })
  }, [updateElements, debug, autoStart, attractorPoint, attractorStrength, cursorStrength, cursorFieldRadius, addTopWall, mouseRef])

  const clearRenderer = useCallback(() => {
    if (frameId.current) {
      cancelAnimationFrame(frameId.current)
    }
    if (render.current) {
      Render.stop(render.current)
      if (render.current.canvas) {
        render.current.canvas.remove()
      }
    }
    if (runner.current) {
      Runner.stop(runner.current)
    }
    if (engine.current) {
      World.clear(engine.current.world, false)
      Engine.clear(engine.current)
    }
    bodiesMap.current.clear()
  }, [])

  const handleResize = useCallback(() => {
    if (!canvas.current || !resetOnResize) return
    const newWidth = canvas.current.offsetWidth
    const newHeight = canvas.current.offsetHeight
    setCanvasSize({ width: newWidth, height: newHeight })

    clearRenderer()
    initializeRenderer()
  }, [clearRenderer, initializeRenderer, resetOnResize])

  useImperativeHandle(
    ref,
    () => ({
      start: () => {
        if (runner.current) {
          runner.current.enabled = true
          Runner.run(runner.current, engine.current)
        }
        isRunning.current = true
      },
      stop: () => {
        if (runner.current) {
          Runner.stop(runner.current)
        }
        isRunning.current = false
      },
      reset: () => {
        handleResize()
      },
    }),
    [handleResize]
  )

  useEffect(() => {
    initializeRenderer()
    return clearRenderer
  }, [initializeRenderer, clearRenderer])

  useEffect(() => {
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [handleResize])

  return (
    <GravityContext.Provider value={{ registerElement, unregisterElement }}>
      <div
        ref={canvas}
        className={cn('relative w-full h-full min-h-[380px] overflow-hidden select-none', className)}
        {...props}
      >
        {children}
      </div>
    </GravityContext.Provider>
  )
})

Gravity.displayName = 'Gravity'

/**
 * Pure Blob Component - Vibrant, organic circular blob with NO text
 */
function BlobItem({ color, size = 44, isSelected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        backgroundColor: color,
        width: `${size}px`,
        height: `${size}px`,
      }}
      className={cn(
        'rounded-full border-2 border-[#1e1b26] shadow-[2px_2px_0px_#1e1b26] cursor-pointer transition-transform hover:scale-110 active:scale-95 relative overflow-hidden flex items-center justify-center',
        isSelected && 'ring-4 ring-[#fbc13a]'
      )}
      aria-label="Physics Blob"
    >
      {/* Subtle organic glossy highlight on the blob */}
      <span className="absolute top-1 left-1.5 w-2.5 h-2.5 bg-white/40 rounded-full blur-[0.5px] pointer-events-none" />
    </button>
  )
}

/**
 * DotMultiplier Component - Interactive Matter.js physics engine for:
 * - Cell Multiplication & Mitosis
 * - Magnetic Attraction & Repulsion
 * - Particle dispersion and force fields
 * (Contains ONLY pure blobs in the sandbox, with no text on nodes)
 */
export default function DotMultiplier({ data }) {
  const initialNodes = useMemo(() => {
    return data?.nodes || data?.items || [
      { id: '1', label: 'Parent Cell', subtitle: 'Base Cell', description: 'Initial cell preparing for mitosis.' },
      { id: '2', label: 'Daughter Cell A', subtitle: 'Gen 1', description: 'Replicated cell copy with identical genetic material.' },
      { id: '3', label: 'Daughter Cell B', subtitle: 'Gen 1', description: 'Second replicated cell division copy.' },
      { id: '4', label: 'Organelle Matrix', subtitle: 'Cytoplasm', description: 'Nutrient environment supporting particle separation.' },
    ]
  }, [data])

  const [nodes, setNodes] = useState(initialNodes)
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [isRepelling, setIsRepelling] = useState(false)
  const [generation, setGeneration] = useState(1)
  const gravityRef = useRef(null)

  // Multiplication Handler: Duplicate existing cells (e.g. Mitosis 1 -> 2 -> 4 -> 8)
  const handleMultiply = () => {
    const nextGen = generation + 1
    setGeneration(nextGen)

    const newChildren = nodes.slice(0, 4).map((node, i) => ({
      id: `gen${nextGen}-${i}-${Date.now()}`,
      label: `${node.label} (${nextGen}x)`,
      subtitle: `Gen ${nextGen}`,
      description: `Replicated division ${nextGen} of ${node.label}.`,
    }))

    setNodes((prev) => [...prev, ...newChildren].slice(0, 16))
    setSelectedIdx(nodes.length)
  }

  // Pop / Reduce particles
  const handleReduce = () => {
    if (nodes.length <= 2) return
    setNodes((prev) => prev.slice(0, Math.max(2, prev.length - 2)))
    setSelectedIdx(0)
  }

  const handleReset = () => {
    setNodes(initialNodes)
    setGeneration(1)
    setSelectedIdx(0)
    setIsRepelling(false)
    if (gravityRef.current) {
      gravityRef.current.reset()
    }
  }

  const activeNode = nodes[selectedIdx] || nodes[0]

  return (
    <div className="flex flex-col h-full w-full bg-[#0f0b14] text-white p-4 select-none overflow-hidden">
      {/* Interactive Toolbar */}
      <div className="py-2 px-3 mb-2 rounded-2xl bg-[#171324] border border-[#2b243d] flex items-center justify-between flex-wrap gap-2 z-20 relative">
        <div className="flex items-center gap-2">
          {/* Multiply Button */}
          <button
            onClick={handleMultiply}
            className="flex items-center gap-1.5 bg-[#f04e7c] hover:bg-[#e03d6b] text-white font-black text-xs px-3 py-1.5 rounded-xl border-2 border-[#1e1b26] shadow-[2px_2px_0_0_#1e1b26] active:translate-y-0.5 active:shadow-none transition-all"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Multiply (Divide)</span>
          </button>

          {/* Reduce Button */}
          <button
            onClick={handleReduce}
            disabled={nodes.length <= 2}
            className="flex items-center gap-1.5 bg-[#fbc13a] hover:bg-[#eab308] disabled:opacity-40 text-[#1e1b26] font-black text-xs px-3 py-1.5 rounded-xl border-2 border-[#1e1b26] shadow-[2px_2px_0_0_#1e1b26] active:translate-y-0.5 active:shadow-none transition-all"
          >
            <Minus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Merge</span>
          </button>

          {/* Magnetic Field Toggle */}
          <button
            onClick={() => setIsRepelling(!isRepelling)}
            className={cn(
              'flex items-center gap-1.5 font-black text-xs px-3 py-1.5 rounded-xl border-2 border-[#1e1b26] shadow-[2px_2px_0_0_#1e1b26] active:translate-y-0.5 transition-all',
              isRepelling
                ? 'bg-[#a855f7] text-white'
                : 'bg-[#1c172a] text-[#8f8a9e] hover:text-white border-[#362f4c]'
            )}
          >
            <Magnet className="w-3.5 h-3.5" />
            <span>{isRepelling ? 'Repulsion Field' : 'Attractor Field'}</span>
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

      {/* Physics Matter.js Canvas - ONLY PURE BLOBS (NO TEXT) */}
      <div className="flex-1 w-full min-h-[380px] sm:min-h-[420px] relative rounded-2xl border border-[#2b243d]/60 overflow-hidden bg-[#0c0812]">
        <Gravity
          ref={gravityRef}
          attractorPoint={{ x: '50%', y: '50%' }}
          attractorStrength={isRepelling ? -0.001 : 0.0009}
          cursorStrength={isRepelling ? 0.006 : -0.005}
          cursorFieldRadius={190}
          className="w-full h-full"
        >
          {nodes.map((node, idx) => {
            const isSelected = idx === selectedIdx
            const color = node.color || getNeoColor(idx).solid

            // Spread out starting positions in a circle
            const angle = (idx / nodes.length) * (2 * Math.PI)
            const posX = 50 + Math.cos(angle) * 32
            const posY = 50 + Math.sin(angle) * 32

            return (
              <MatterBody
                key={node.id || idx}
                x={`${posX}%`}
                y={`${posY}%`}
                bodyType="circle"
                matterBodyOptions={{
                  friction: 0.05,
                  restitution: 0.85,
                  density: 0.002,
                }}
              >
                {/* Pure Blob (NO text on node) */}
                <BlobItem
                  color={color}
                  size={44}
                  isSelected={isSelected}
                  onClick={() => setSelectedIdx(idx)}
                />
              </MatterBody>
            )
          })}
        </Gravity>
      </div>

      {/* One-Liner Description for Selected Particle */}
      <AnimatePresence mode="wait">
        {activeNode && (activeNode.description || activeNode.label) && (
          <motion.div
            key={activeNode.id || selectedIdx}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="bg-[#181324] border-2 border-[#362f4c] rounded-2xl p-3.5 my-2 text-center shadow-[2px_2px_0_0_#1e1b26] z-20 relative"
          >
            <p className="text-xs sm:text-sm font-medium text-[#e2dfd2] leading-relaxed max-w-xl mx-auto">
              {activeNode.description || activeNode.label}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
