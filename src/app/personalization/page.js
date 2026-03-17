'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, FileText, Loader2, ArrowLeft, Brain, X, Terminal, Gamepad2, Target, Cat } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

export default function PersonalizationPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [file, setFile] = useState(null)
  const [isHovering, setIsHovering] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const [progressText, setProgressText] = useState('')
  const fileInputRef = useRef(null)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsHovering(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsHovering(false)
  }

  const validateAndSetFile = (selectedFile) => {
    setError('')
    if (!selectedFile) return

    if (selectedFile.type !== 'application/pdf') {
      setError('Only PDF files are supported.')
      return
    }

    if (selectedFile.size > 2 * 1024 * 1024) {
      setError('File size must be under 2MB to prevent timeouts.')
      return
    }

    setFile(selectedFile)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsHovering(false)
    const droppedFile = e.dataTransfer.files[0]
    validateAndSetFile(droppedFile)
  }

  const handleChange = (e) => {
    const selectedFile = e.target.files[0]
    validateAndSetFile(selectedFile)
  }

  const handleSubmit = async () => {
    if (!file) return

    if (!user) {
      setError('You must be logged in to create a custom mission.')
      return
    }

    setIsUploading(true)
    setError('')
    setProgressText('INITIALIZING UPLOAD SEQUENCE...')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('uid', user.uid)

      setTimeout(() => setProgressText('EXTRACTING KNOWLEDGE MATRIX...'), 1500)
      setTimeout(() => setProgressText('FORGING CUSTOM ARENA...'), 4000)

      const res = await fetch('/api/personalization/generate-mission', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Failed to forge mission.')

      setProgressText('MISSION FORGED! REDIRECTING...')

      setTimeout(() => {
        router.push(`/games/personalization/${data.missionId}?topic=Custom-Mission`)
      }, 1000)

    } catch (err) {
      console.error(err)
      setError(err.message || 'An unexpected error occurred.')
      setIsUploading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f5f0] relative overflow-hidden font-[Outfit] text-[#1e1b26] selection:bg-[#fbc13a] selection:text-[#1e1b26]">

      {/* Soft Animated Background Blobs */}
      <div className="absolute top-[-5%] left-[-5%] w-[500px] h-[500px] bg-[#ede4ff] rounded-full mix-blend-multiply filter blur-[80px] opacity-70 pointer-events-none animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#ffd6e4] rounded-full mix-blend-multiply filter blur-[80px] opacity-60 pointer-events-none animate-pulse" style={{ animationDuration: '6s' }} />

      <div className="relative z-10 min-h-screen flex flex-col p-6 sm:p-10 max-w-6xl mx-auto">

        {/* Navigation Bar */}
        <div className="w-full mb-10 flex justify-start">
          <Link
            href="/dashboard"
            className="group flex items-center gap-2 bg-white text-[#1e1b26] font-black py-2.5 px-4 rounded-xl border-[3px] border-[#1e1b26] shadow-[4px_4px_0px_#1e1b26] hover:-translate-y-[2px] hover:-translate-x-[2px] hover:shadow-[6px_6px_0px_#1e1b26] active:translate-y-[2px] active:translate-x-[2px] active:shadow-[2px_2px_0px_#1e1b26] transition-all uppercase tracking-widest text-[10px]"
          >
            <ArrowLeft className="w-4 h-4 stroke-[3] group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </Link>
        </div>

        {/* Two-Column Layout */}
        <div className="flex-grow flex flex-col lg:flex-row items-start justify-center gap-10 lg:gap-16 pb-20">

          {/* Left Column: Header & Forge Terminal */}
          <div className="flex-1 w-full max-w-2xl flex flex-col items-center lg:items-start text-center lg:text-left mx-auto lg:mx-0">

            {/* Header Typography */}
            <div className="w-14 h-14 bg-[#7c3aed] rounded-[16px] border-[3px] border-[#1e1b26] flex items-center justify-center shadow-[4px_4px_0px_#1e1b26] mb-5 transform -rotate-6 group hover:rotate-0 transition-transform">
              <Brain className="w-7 h-7 text-white stroke-[2.5]" />
            </div>

            <h1 className="text-4xl sm:text-5xl font-black text-[#1e1b26] tracking-tighter mb-3 uppercase leading-none drop-shadow-sm">
              Custom <span className="text-[#7c3aed] relative">
                Forge
              </span>
            </h1>
            <p className="text-[#5a5566] text-sm font-bold max-w-md font-sans leading-relaxed mb-10">
              Upload your syllabus or study guide. Our AI will automatically generate a playable coding arena tailored to your material.
            </p>

            {/* Neo-Brutalist Terminal Window Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border-[3px] border-[#1e1b26] shadow-[8px_8px_0px_#1e1b26] rounded-[24px] w-full relative flex flex-col overflow-hidden"
            >

              {/* Terminal Window Chrome Header */}
              <div className="bg-[#fbc13a] border-b-[3px] border-[#1e1b26] px-5 py-3 flex items-center justify-between">
                <div className="flex gap-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#f04e7c] border-[2px] border-[#1e1b26] shadow-[1px_1px_0px_#1e1b26]" />
                  <div className="w-3.5 h-3.5 rounded-full bg-white border-[2px] border-[#1e1b26] shadow-[1px_1px_0px_#1e1b26]" />
                  <div className="w-3.5 h-3.5 rounded-full bg-[#1e7a4e] border-[2px] border-[#1e1b26] shadow-[1px_1px_0px_#1e1b26]" />
                </div>
                <div className="flex items-center gap-2 text-[#1e1b26] opacity-80">
                  <Terminal className="w-4 h-4 stroke-[3]" />
                  <span className="font-black text-[10px] uppercase tracking-widest font-sans">Forge.exe</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 sm:p-8">
                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      className="bg-[#fff0f4] border-[3px] border-[#c0305b] text-[#c0305b] py-3 px-4 rounded-xl font-black flex items-center justify-between shadow-[4px_4px_0px_#c0305b] uppercase tracking-widest text-[10px]"
                    >
                      <span>{error}</span>
                      <button onClick={() => setError('')} className="hover:scale-110 active:scale-95 transition-transform">
                        <X className="w-4 h-4 stroke-[3]" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {!file ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-[3px] border-dashed rounded-[20px] p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-[240px] ${isHovering
                      ? 'border-[#7c3aed] bg-[#f5f0ff] scale-[0.98]'
                      : 'border-[#1e1b26]/30 bg-[#f7f5f0]/50 hover:border-[#1e1b26] hover:bg-[#f7f5f0]'
                      }`}
                  >
                    <input type="file" ref={fileInputRef} onChange={handleChange} accept="application/pdf" className="hidden" />

                    <div className={`w-14 h-14 rounded-2xl border-[3px] border-[#1e1b26] flex items-center justify-center mb-4 shadow-[4px_4px_0px_rgba(0,0,0,0.1)] transition-all ${isHovering ? 'bg-[#7c3aed] -translate-y-2' : 'bg-white'}`}>
                      <Upload className={`w-6 h-6 stroke-[3] ${isHovering ? 'text-white' : 'text-[#1e1b26]'}`} />
                    </div>

                    <h3 className="text-xl font-black mb-1 text-[#1e1b26] uppercase tracking-tight">Drop PDF Here</h3>
                    <p className="text-[#8f8a9e] font-black text-[10px] uppercase tracking-widest mb-5 font-sans">or click to browse</p>

                    <div className="flex items-center justify-center gap-3 mt-auto text-[#5a5566] text-[9px] font-black uppercase tracking-widest bg-white px-3 py-1.5 rounded-lg border-[2px] border-[#eae5d9]">
                      <span>Max: 2MB</span>
                      <span className="w-1 h-1 bg-[#1e1b26]/30 rounded-full" />
                      <span>Pages: 5</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-4">

                    {/* Selected File Ticket */}
                    <div className="w-full bg-[#f7f5f0] border-[3px] border-[#1e1b26] rounded-[20px] p-4 mb-8 flex items-center gap-4 shadow-[4px_4px_0px_rgba(0,0,0,0.05)]">
                      <div className="w-12 h-12 bg-[#d4f0e0] rounded-xl border-[3px] border-[#1e7a4e] flex items-center justify-center shrink-0">
                        <FileText className="w-6 h-6 text-[#1e7a4e] stroke-[2.5]" />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <h3 className="text-sm font-black text-[#1e1b26] truncate tracking-tight mb-0.5">
                          {file.name}
                        </h3>
                        <p className="text-[#8f8a9e] font-black text-[10px] uppercase tracking-widest font-sans">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                      {!isUploading && (
                        <button onClick={() => setFile(null)} className="p-2 hover:bg-[#ffd6e4] hover:text-[#c0305b] rounded-lg transition-colors text-[#8f8a9e]">
                          <X className="w-5 h-5 stroke-[3]" />
                        </button>
                      )}
                    </div>

                    {isUploading ? (
                      <div className="w-full flex flex-col items-center justify-center py-4">
                        <Loader2 className="w-10 h-10 text-[#7c3aed] animate-spin mb-4 stroke-[3]" />
                        <p className="text-[#7c3aed] font-black text-center uppercase tracking-widest text-[10px] font-sans bg-[#ede4ff] px-4 py-2 rounded-lg border-[2px] border-[#7c3aed]/20">
                          {progressText}
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={handleSubmit}
                        className="w-full bg-[#7c3aed] text-white font-black py-4 rounded-xl border-[3px] border-[#1e1b26] shadow-[4px_4px_0px_#1e1b26] hover:-translate-y-[2px] hover:-translate-x-[2px] hover:shadow-[6px_6px_0px_#1e1b26] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 group"
                      >
                        <Sparkles className="w-4 h-4 fill-white group-hover:rotate-12 transition-transform" />
                        Forge Custom Mission
                      </button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column: Supported Games Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="w-full lg:w-[340px] shrink-0 bg-white border-[3px] border-[#1e1b26] shadow-[8px_8px_0px_#1e1b26] rounded-[24px] overflow-hidden"
          >
            {/* Panel Header */}
            <div className="bg-[#ede4ff] border-b-[3px] border-[#1e1b26] px-6 py-4 flex items-center gap-3">
              <Gamepad2 className="w-5 h-5 text-[#7c3aed] stroke-[2.5]" />
              <h3 className="font-black text-[#1e1b26] uppercase tracking-widest text-sm">Supported Arenas</h3>
            </div>

            {/* Panel Body / Games List */}
            <div className="p-6 flex flex-col gap-5">

              {/* Game 1: Precision Pop */}
              <div className="group border-[2px] border-[#eae5d9] hover:border-[#1e1b26] rounded-[20px] p-4 transition-all hover:shadow-[4px_4px_0px_#1e1b26] hover:-translate-y-1 bg-[#f7f5f0]/50 hover:bg-[#fff0f4] cursor-default">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white border-[2px] border-[#c0305b] shadow-[2px_2px_0px_#c0305b] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Target className="w-5 h-5 text-[#c0305b] stroke-[2.5]" />
                  </div>
                  <h4 className="font-black text-[#1e1b26] uppercase tracking-tight text-sm">1. Precision Pop</h4>
                </div>
                <p className="text-[#5a5566] text-[10px] font-bold uppercase tracking-widest font-sans leading-relaxed">
                  Pop balloons carrying the correct answers before time runs out. Requires fast reflexes.
                </p>
              </div>

              {/* Game 2: Kat Mage */}
              <div className="group border-[2px] border-[#eae5d9] hover:border-[#1e1b26] rounded-[20px] p-4 transition-all hover:shadow-[4px_4px_0px_#1e1b26] hover:-translate-y-1 bg-[#f7f5f0]/50 hover:bg-[#e4f1ff] cursor-default">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white border-[2px] border-[#2563eb] shadow-[2px_2px_0px_#2563eb] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Cat className="w-5 h-5 text-[#2563eb] stroke-[2.5]" />
                  </div>
                  <h4 className="font-black text-[#1e1b26] uppercase tracking-tight text-sm">2. Kat Mage</h4>
                </div>
                <p className="text-[#5a5566] text-[10px] font-bold uppercase tracking-widest font-sans leading-relaxed">
                  Cast spells using your custom knowledge matrix to defeat approaching enemies.
                </p>
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </main>
  )
}