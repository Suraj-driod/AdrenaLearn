'use client'
import { useState, useEffect, useCallback } from 'react'
import {
  Edit3, BookOpen, Gamepad2, Calendar, Clock, Award,
  Flame, Trophy, Target, Zap, Rocket, Sword,
  Cat, Mail, CheckCircle2, Lock, Sparkles,
  Fingerprint, Loader2, X, Save, User, GraduationCap,
  Image as ImageIcon
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from '../components/Sidebar'
import ProtectedRoute from '../components/ProtectedRoute'

import { useAuth } from '../context/AuthContext'
import { fetchProfileData, updateProfileData } from '../../database/profileData'

// ─── Badge Definitions ───────────────────────────────────────────────
const badgeManifest = [
  { id: 'first-lesson', name: 'First Lesson', icon: BookOpen, color: 'text-blue-500', desc: 'Completed your first lesson' },
  { id: '3-day-streak', name: '3 Day Streak', icon: Flame, color: 'text-orange-500', desc: 'Maintained a 3 day streak' },
  { id: 'perfect-score', name: 'Perfect Score', icon: CheckCircle2, color: 'text-green-500', desc: 'Got 100% in a game round' },
  { id: 'top-10', name: 'Top 10', icon: Trophy, color: 'text-yellow-500', desc: 'Reached Top 10' },
  { id: 'speed-demon', name: 'Speed Demon', icon: Zap, color: 'text-purple-500', desc: 'Finished under 1 min' },
  { id: 'week-warrior', name: 'Week Warrior', icon: Sword, color: 'text-red-500', desc: '7 day streak achieved' },
]

// ─── Game Visual Map ─────────────────────────────────────────────────
const gameVisuals = {
  'balloon':     { icon: Target, color: 'text-[#f04e7c]', bg: 'bg-[#ffd6e4]' },
  'kat-mage':    { icon: Cat,    color: 'text-[#1e7a4e]', bg: 'bg-[#d4f0e0]' },
  'among-us':    { icon: Rocket, color: 'text-[#7c3aed]', bg: 'bg-[#e4f1ff]' },
  'spaceship':   { icon: Rocket, color: 'text-[#7c3aed]', bg: 'bg-[#ffd6e4]' },
  'subway':      { icon: Zap,    color: 'text-[#fbc13a]', bg: 'bg-[#fff3c4]' },
  'interview':   { icon: GraduationCap, color: 'text-[#3b82f6]', bg: 'bg-[#e4f1ff]' },
}

// ─── Available courses for edit dropdown ─────────────────────────────
const COURSE_OPTIONS = [
  { id: 'general', label: 'General Studies' },
  { id: 'ce', label: 'Computer Engineering' },
  { id: 'cs', label: 'Computer Science' },
  { id: 'it', label: 'Information Technology' },
]

// ─── Edit Dossier Modal ──────────────────────────────────────────────
function EditDossierModal({ isOpen, onClose, currentData, onSave }) {
  const [formData, setFormData] = useState({
    username: '',
    courseId: 'general',
    photoURL: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen && currentData) {
      // Match current course name to id
      const matchedCourse = COURSE_OPTIONS.find(
        c => c.label.toLowerCase() === currentData.course?.toLowerCase()
      )
      setFormData({
        username: currentData.name || '',
        courseId: matchedCourse?.id || 'general',
        photoURL: currentData.photoURL || '',
      })
    }
  }, [isOpen, currentData])

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave({
        username: formData.username.trim(),
        courseId: formData.courseId,
        photoURL: formData.photoURL.trim(),
      })
      onClose()
    } catch (err) {
      console.error('Failed to save profile:', err)
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#f7f5f0] w-full max-w-lg rounded-[32px] border-4 border-[#1e1b26] shadow-[8px_8px_0px_#1e1b26] overflow-hidden">
              {/* Modal Header */}
              <div className="bg-[#fbc13a] px-8 py-6 border-b-4 border-[#1e1b26] flex items-center justify-between">
                <h2 className="font-[Outfit] text-2xl font-black uppercase italic text-[#1e1b26] flex items-center gap-3">
                  <Edit3 className="w-6 h-6" /> Edit Dossier
                </h2>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-xl bg-white border-2 border-[#1e1b26] flex items-center justify-center hover:bg-red-100 transition-colors shadow-[2px_2px_0px_#1e1b26]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-8 space-y-6">
                {/* Avatar Preview */}
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-[24px] bg-[#1e1b26] text-white flex items-center justify-center text-2xl font-black border-4 border-white shadow-[4px_4px_0px_#f04e7c] shrink-0">
                    {formData.photoURL ? (
                      <img
                        src={formData.photoURL}
                        alt="Avatar"
                        className="w-full h-full rounded-[20px] object-cover"
                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
                      />
                    ) : null}
                    <span style={{ display: formData.photoURL ? 'none' : 'flex' }} className="items-center justify-center w-full h-full">
                      {(formData.username || 'U').substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#8f8a9e] mb-1 block">
                      <ImageIcon className="w-3 h-3 inline mr-1" />Avatar URL
                    </label>
                    <input
                      type="text"
                      value={formData.photoURL}
                      onChange={(e) => setFormData(prev => ({ ...prev, photoURL: e.target.value }))}
                      placeholder="https://example.com/avatar.png"
                      className="w-full bg-white border-3 border-[#1e1b26] rounded-xl px-4 py-2.5 text-sm font-bold text-[#1e1b26] placeholder:text-[#ccc] focus:outline-none focus:border-[#f04e7c] focus:shadow-[3px_3px_0px_#f04e7c] transition-all"
                    />
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#8f8a9e] mb-2 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> Display Name
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="Your display name"
                    maxLength={30}
                    className="w-full bg-white border-3 border-[#1e1b26] rounded-xl px-4 py-3 text-lg font-black text-[#1e1b26] placeholder:text-[#ccc] focus:outline-none focus:border-[#f04e7c] focus:shadow-[3px_3px_0px_#f04e7c] transition-all"
                  />
                  <p className="text-right text-[10px] text-[#8f8a9e] font-bold mt-1">{formData.username.length}/30</p>
                </div>

                {/* Study Field */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#8f8a9e] mb-2 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5" /> Study Field
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {COURSE_OPTIONS.map(course => (
                      <button
                        key={course.id}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, courseId: course.id }))}
                        className={`px-4 py-3 rounded-xl border-3 text-xs font-black uppercase tracking-wide transition-all ${
                          formData.courseId === course.id
                            ? 'bg-[#1e1b26] text-white border-[#1e1b26] shadow-[3px_3px_0px_#f04e7c]'
                            : 'bg-white text-[#1e1b26] border-[#1e1b26]/20 hover:border-[#1e1b26]'
                        }`}
                      >
                        {course.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-8 pb-8 flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 bg-white text-[#1e1b26] font-black px-6 py-3.5 rounded-2xl border-3 border-[#1e1b26] shadow-[4px_4px_0px_#1e1b26] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all uppercase text-xs tracking-widest"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !formData.username.trim()}
                  className="flex-1 bg-[#f04e7c] text-white font-black px-6 py-3.5 rounded-2xl border-3 border-[#1e1b26] shadow-[4px_4px_0px_#1e1b26] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all uppercase text-xs tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ─── Main Profile Content ────────────────────────────────────────────
function ProfileContent() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const loadProfile = useCallback(async () => {
    if (!user) return
    try {
      const profile = await fetchProfileData(user.uid)
      setData(profile)
    } catch (err) {
      console.error("Using Fallback Data", err)
      setData({
        user: {
          name: user.displayName || user.email?.split('@')[0] || 'Student',
          email: user.email || 'unknown@email.com',
          course: 'General Studies',
          photoURL: '',
          createdAt: 'Mar 2026',
          currentStreak: 0,
        },
        stats: { totalXP: 0, globalRank: '#-', lessonsDone: 0, avgAccuracy: '0%' },
        earnedBadgeIds: [],
        gamePerformance: [],
        recentActivity: []
      })
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    setLoading(true)
    loadProfile()
  }, [loadProfile, refreshKey])

  const handleSaveProfile = async (updates) => {
    if (!user) return
    await updateProfileData(user.uid, updates)
    // Refetch data after save so the page updates instantly
    setRefreshKey(k => k + 1)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f5f0] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#f04e7c] animate-spin mb-4" />
        <p className="font-[Outfit] font-black uppercase tracking-widest text-[#1e1b26]">Accessing Dossier...</p>
      </div>
    )
  }

  if (!data) return null

  const initials = data.user.name.substring(0, 2).toUpperCase()

  return (
    <div className="min-h-screen bg-[#f7f5f0] selection:bg-[#f04e7c] selection:text-white">
      <Sidebar />

      {/* Edit Modal */}
      <EditDossierModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        currentData={data.user}
        onSave={handleSaveProfile}
      />

      <main className="lg:ml-56 pt-16 lg:pt-0 min-h-screen overflow-x-hidden">
        <motion.div
          className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto"
          initial="hidden" animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >

          {/* ── Profile Header ─────────────────────────────────────── */}
          <motion.div
            variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
            className="bg-[#fbc13a] rounded-[32px] border-4 border-[#1e1b26] shadow-[8px_8px_0px_#1e1b26] p-6 sm:p-8 mb-10 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10"><Fingerprint className="w-32 h-32 rotate-12" /></div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 relative z-10">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-[28px] bg-[#1e1b26] text-white flex items-center justify-center text-3xl font-black border-4 border-white shadow-[6px_6px_0px_#f04e7c] overflow-hidden">
                {data.user.photoURL ? (
                  <img
                    src={data.user.photoURL}
                    alt={data.user.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                ) : (
                  initials
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h1 className="font-[Outfit] text-3xl font-black text-[#1e1b26] uppercase italic">{data.user.name}</h1>
                  <Sparkles className="w-6 h-6 text-[#f04e7c] fill-[#f04e7c]" />
                </div>
                <p className="text-[#1e1b26] text-sm font-bold flex items-center gap-2 mt-1 opacity-80">
                  <Mail className="w-4 h-4" /> {data.user.email}
                </p>

                <div className="flex flex-wrap items-center gap-3 mt-6">
                  <span className="bg-[#1e1b26] text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border-2 border-[#1e1b26]">
                    {data.user.course}
                  </span>
                  <span className="flex items-center gap-1.5 text-[#1e1b26] text-xs font-black bg-white border-2 border-[#1e1b26] px-4 py-2 rounded-xl shadow-[3px_3px_0px_#1e1b26]">
                    <Calendar className="w-3.5 h-3.5" /> Member Since {data.user.createdAt}
                  </span>
                  {data.user.currentStreak > 0 && (
                    <span className="flex items-center gap-1.5 text-[#1e1b26] text-xs font-black bg-[#ffd6e4] border-2 border-[#1e1b26] px-4 py-2 rounded-xl shadow-[3px_3px_0px_#1e1b26]">
                      <Flame className="w-3.5 h-3.5 text-orange-500" /> {data.user.currentStreak} Day Streak
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => setEditOpen(true)}
                className="bg-white text-[#1e1b26] font-black px-6 py-3 rounded-2xl border-4 border-[#1e1b26] shadow-[4px_4px_0px_#1e1b26] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all uppercase text-xs tracking-widest flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4" /> Edit Dossier
              </button>
            </div>
          </motion.div>

          {/* ── Quick Stats ────────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
            {[
              { label: 'Total XP', value: data.stats.totalXP.toLocaleString(), icon: Zap, color: 'bg-[#ffd6e4]', iconColor: 'text-[#f04e7c]' },
              { label: 'Global Rank', value: data.stats.globalRank, icon: Trophy, color: 'bg-[#fff3c4]', iconColor: 'text-[#ea580c]' },
              { label: 'Lessons Done', value: data.stats.lessonsDone, icon: BookOpen, color: 'bg-[#d8ecff]', iconColor: 'text-blue-600' },
              { label: 'Avg Accuracy', value: data.stats.avgAccuracy, icon: Target, color: 'bg-[#d4f0e0]', iconColor: 'text-[#1e7a4e]' },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div key={i} variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} className={`${stat.color} p-6 rounded-[32px] border-4 border-[#1e1b26] shadow-[6px_6px_0px_#1e1b26] hover:translate-y-[-4px] transition-all group`}>
                  <div className={`w-12 h-12 rounded-2xl bg-white border-2 border-[#1e1b26] flex items-center justify-center mb-4 shadow-[3px_3px_0px_#1e1b26]`}>
                    <Icon className={`w-6 h-6 stroke-[2.5] ${stat.iconColor}`} />
                  </div>
                  <div className="font-[Outfit] text-3xl font-black text-[#1e1b26]">{stat.value}</div>
                  <div className="text-[#1e1b26] text-[10px] font-black uppercase tracking-wider mt-1 opacity-60">{stat.label}</div>
                </motion.div>
              )
            })}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">

              {/* ── Badges / Collection ─────────────────────────────── */}
              <div className="bg-white p-8 rounded-[40px] border-4 border-[#1e1b26] shadow-[8px_8px_0px_#1e1b26]">
                <h3 className="font-[Outfit] font-black text-2xl mb-2 flex items-center gap-3 uppercase italic">
                  <Award className="w-7 h-7 text-[#f04e7c]" /> Collection
                </h3>
                <p className="text-[10px] font-bold text-[#8f8a9e] uppercase tracking-wider mb-8">
                  {data.earnedBadgeIds.length} / {badgeManifest.length} Badges Unlocked
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {badgeManifest.map((badge, i) => {
                    const earned = data.earnedBadgeIds.includes(badge.id);
                    const Icon = badge.icon;
                    return (
                      <motion.div
                        key={i}
                        whileHover={earned ? { y: -4, rotate: 1 } : {}}
                        className={`p-5 rounded-[24px] border-4 text-center transition-all relative overflow-hidden group ${earned ? 'bg-[#f7f5f0] border-[#1e1b26] shadow-[4px_4px_0px_#1e1b26]' : 'bg-gray-50 border-gray-200 grayscale opacity-50'}`}
                      >
                        {!earned && <Lock className="absolute top-2 right-2 w-3 h-3 text-gray-400" />}
                        {earned && (
                          <div className="absolute -top-1 -right-1">
                            <CheckCircle2 className="w-5 h-5 text-green-500 fill-green-100" />
                          </div>
                        )}
                        <div className={`w-14 h-14 mx-auto bg-white rounded-2xl border-2 ${earned ? 'border-[#1e1b26]' : 'border-gray-300'} flex items-center justify-center mb-4 shadow-[3px_3px_0px_${earned ? '#1e1b26' : '#ddd'}] group-hover:rotate-6 transition-transform`}>
                          <Icon className={`w-8 h-8 stroke-[2.5] ${earned ? badge.color : 'text-gray-400'}`} />
                        </div>
                        <div className="text-sm font-black text-[#1e1b26] uppercase tracking-tighter">{badge.name}</div>
                        <div className="text-[10px] text-[#5a5566] mt-1 font-bold leading-tight uppercase opacity-60">{badge.desc}</div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              {/* ── Game Performance / Mastery ──────────────────────── */}
              <div className="bg-[#e4f1ff] p-8 rounded-[40px] border-4 border-[#1e1b26] shadow-[8px_8px_0px_#1e1b26]">
                <h3 className="font-[Outfit] font-black text-2xl mb-8 flex items-center gap-3 uppercase italic">
                  <Gamepad2 className="w-7 h-7 text-blue-600" /> Mastery
                </h3>
                {data.gamePerformance.length === 0 ? (
                  <div className="text-center py-8 text-[#8f8a9e] font-semibold border-2 border-dashed border-[#1e1b26]/20 rounded-2xl">
                    Play games to see your mastery stats!
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {data.gamePerformance.map((game, i) => {
                      const visual = gameVisuals[game.id] || gameVisuals['spaceship'];
                      const Icon = visual.icon;
                      return (
                        <motion.div
                          key={i}
                          whileHover={{ y: -4 }}
                          className="bg-white border-4 border-[#1e1b26] rounded-3xl p-5 text-center shadow-[4px_4px_0px_#1e1b26] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group"
                        >
                          <div className={`w-12 h-12 mx-auto rounded-2xl ${visual.bg} border-2 border-[#1e1b26] flex items-center justify-center mb-3 shadow-[2px_2px_0px_#1e1b26]`}>
                            <Icon className={`w-6 h-6 stroke-[2.5] ${visual.color} group-hover:scale-110 transition-transform`} />
                          </div>
                          <div className="text-[10px] font-black text-[#8f8a9e] uppercase mb-1 tracking-wider">{game.displayName}</div>
                          <div className="font-[Outfit] text-2xl font-black text-[#1e1b26]">{game.avgScore.toLocaleString()}</div>
                          <div className="text-[10px] text-[#1e1b26] mt-1 font-black uppercase opacity-40">{game.games} Runs</div>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* ── Right Side / Timeline ─────────────────────────────── */}
            <div className="lg:sticky lg:top-8 h-fit">
              <div className="bg-[#d4f0e0] p-8 rounded-[40px] border-4 border-[#1e1b26] shadow-[8px_8px_0px_#1e1b26]">
                <h3 className="font-[Outfit] font-black text-2xl mb-8 flex items-center gap-3 uppercase italic text-[#1e1b26]">
                  <Clock className="w-7 h-7 text-green-700" /> Timeline
                </h3>
                {data.recentActivity.length === 0 ? (
                  <div className="text-center py-8 text-[#1e1b26]/50 font-semibold border-2 border-dashed border-[#1e1b26]/20 rounded-2xl">
                    Your activity will show here!
                  </div>
                ) : (
                  <div className="space-y-5 relative">
                    <div className="absolute left-[19px] top-2 bottom-2 w-1 bg-[#1e1b26] opacity-10 rounded-full" />
                    {data.recentActivity.map((activity, i) => {
                      const isGame = activity.type === 'game';
                      const visual = isGame
                        ? (gameVisuals[activity.gameId] || gameVisuals['spaceship'])
                        : { icon: BookOpen, color: 'text-blue-600', bg: 'bg-[#d8ecff]' };
                      const Icon = isGame ? visual.icon : BookOpen;
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          whileHover={{ x: 5 }}
                          className="flex items-start gap-4 relative z-10"
                        >
                          <div className={`w-10 h-10 rounded-xl border-2 border-[#1e1b26] ${visual.bg} flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#1e1b26]`}>
                            <Icon className={`w-5 h-5 stroke-[2.5] ${visual.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-[#1e1b26] font-black leading-tight uppercase tracking-tighter truncate">{activity.action}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] text-[#5a5566] font-black uppercase opacity-60">{activity.time}</span>
                              {activity.date && (
                                <span className="text-[10px] text-[#5a5566] font-bold opacity-40">· {activity.date}</span>
                              )}
                            </div>
                            {isGame && activity.score > 0 && (
                              <span className="inline-block mt-1.5 text-[9px] font-black bg-[#1e1b26] text-white px-2 py-0.5 rounded-lg uppercase">
                                +{activity.score} XP
                              </span>
                            )}
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

          </div>
        </motion.div>
      </main>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  )
}