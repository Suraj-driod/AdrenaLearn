'use client'
import { useState, useEffect } from 'react'
import {
  Edit3, BookOpen, Gamepad2, Calendar, Clock, Award,
  Flame, Trophy, Target, Zap, Rocket, Sword,
  Cat, BarChart3, Mail, CheckCircle2, Lock, Sparkles,
  Fingerprint, Loader2
} from 'lucide-react'
import { motion } from 'framer-motion'
import Sidebar from '../components/Sidebar'
import ProtectedRoute from '../components/ProtectedRoute'

import { useAuth } from '../context/AuthContext'
import { fetchProfileData } from '../../database/profileData'

const badgeManifest = [
  { id: 'first-lesson', name: 'First Lesson', icon: BookOpen, color: 'text-blue-500', desc: 'Completed your first lesson' },
  { id: '3-day-streak', name: '3 Day Streak', icon: Flame, color: 'text-orange-500', desc: 'Maintained a 3 day streak' },
  { id: 'perfect-score', name: 'Perfect Score', icon: CheckCircle2, color: 'text-green-500', desc: 'Got 100% in a game round' },
  { id: 'top-10', name: 'Top 10', icon: Trophy, color: 'text-yellow-500', desc: 'Reached Top 10' },
  { id: 'speed-demon', name: 'Speed Demon', icon: Zap, color: 'text-purple-500', desc: 'Finished under 1 min' },
  { id: 'week-warrior', name: 'Week Warrior', icon: Sword, color: 'text-red-500', desc: '7 day streak achieved' },
]

const gameVisuals = {
  'spaceship': { icon: Rocket, color: 'text-[#7c3aed]', bg: 'bg-[#ffd6e4]' },
  'subway': { icon: Zap, color: 'text-[#fbc13a]', bg: 'bg-[#fff3c4]' },
  'balloon': { icon: Target, color: 'text-[#f04e7c]', bg: 'bg-[#d4f0e0]' },
  'cat-rescue': { icon: Cat, color: 'text-[#1e7a4e]', bg: 'bg-[#d8ecff]' },
}

function ProfileContent() {
  const { user } = useAuth()
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      try {
        const profile = await fetchProfileData(user.uid);
        setData(profile);
      } catch (err) {
        console.error("Using Fallback Data", err);
        // Fallback data so the page doesn't crash
        setData({
          user: {
            name: user.displayName || user.email?.split('@')[0] || 'Student',
            email: user.email || 'unknown@email.com',
            course: 'General Studies',
            createdAt: 'Mar 2026'
          },
          stats: { totalXP: 0, globalRank: '#-', lessonsDone: 0, avgAccuracy: '0%' },
          earnedBadgeIds: [],
          gamePerformance: [],
          recentActivity: []
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f5f0] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#f04e7c] animate-spin mb-4" />
        <p className="font-[Outfit] font-black uppercase tracking-widest text-[#1e1b26]">Accessing Dossier...</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-[#f7f5f0] selection:bg-[#f04e7c] selection:text-white">
      <Sidebar />
      <main className="lg:ml-56 pt-16 lg:pt-0 min-h-screen overflow-x-hidden">
        <motion.div
          className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto"
          initial="hidden" animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >

          {/* Profile Header */}
          <motion.div
            variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
            className="bg-[#fbc13a] rounded-[32px] border-4 border-[#1e1b26] shadow-[8px_8px_0px_#1e1b26] p-6 sm:p-8 mb-10 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10"><Fingerprint className="w-32 h-32 rotate-12" /></div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 relative z-10">
              <div className="w-24 h-24 rounded-[28px] bg-[#1e1b26] text-white flex items-center justify-center text-3xl font-black border-4 border-white shadow-[6px_6px_0px_#f04e7c]">
                {data.user.name.substring(0, 2).toUpperCase()}
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
                </div>
              </div>

              <button className="bg-white text-[#1e1b26] font-black px-6 py-3 rounded-2xl border-4 border-[#1e1b26] shadow-[4px_4px_0px_#1e1b26] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all uppercase text-xs tracking-widest flex items-center gap-2">
                <Edit3 className="w-4 h-4" /> Edit Dossier
              </button>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
            {[
              { label: 'Total XP', value: data.stats.totalXP, icon: Zap, color: 'bg-[#ffd6e4]', iconColor: 'text-[#f04e7c]' },
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

              {/* Badges Section */}
              <div className="bg-white p-8 rounded-[40px] border-4 border-[#1e1b26] shadow-[8px_8px_0px_#1e1b26]">
                <h3 className="font-[Outfit] font-black text-2xl mb-8 flex items-center gap-3 uppercase italic">
                  <Award className="w-7 h-7 text-[#f04e7c]" /> Collection
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {badgeManifest.map((badge, i) => {
                    const earned = data.earnedBadgeIds.includes(badge.id);
                    const Icon = badge.icon;
                    return (
                      <div key={i} className={`p-5 rounded-[24px] border-4 text-center transition-all relative overflow-hidden group ${earned ? 'bg-[#f7f5f0] border-[#1e1b26] shadow-[4px_4px_0px_#1e1b26] hover:-translate-y-1' : 'bg-gray-50 border-gray-200 grayscale opacity-50'}`}>
                        {!earned && <Lock className="absolute top-2 right-2 w-3 h-3 text-gray-400" />}
                        <div className={`w-14 h-14 mx-auto bg-white rounded-2xl border-2 border-[#1e1b26] flex items-center justify-center mb-4 shadow-[3px_3px_0px_#1e1b26] group-hover:rotate-6 transition-transform`}>
                          <Icon className={`w-8 h-8 stroke-[2.5] ${badge.color}`} />
                        </div>
                        <div className="text-sm font-black text-[#1e1b26] uppercase tracking-tighter">{badge.name}</div>
                        <div className="text-[10px] text-[#5a5566] mt-1 font-bold leading-tight uppercase opacity-60">{badge.desc}</div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Game Performance */}
              <div className="bg-[#e4f1ff] p-8 rounded-[40px] border-4 border-[#1e1b26] shadow-[8px_8px_0px_#1e1b26]">
                <h3 className="font-[Outfit] font-black text-2xl mb-8 flex items-center gap-3 uppercase italic">
                  <Gamepad2 className="w-7 h-7 text-blue-600" /> Mastery
                </h3>
                {data.gamePerformance.length === 0 ? (
                  <div className="text-center py-8 text-[#8f8a9e] font-semibold border-2 border-dashed border-[#1e1b26]/20 rounded-2xl">
                    Play games to see your mastery stats!
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {data.gamePerformance.map((game, i) => {
                      const visual = gameVisuals[game.id] || gameVisuals['spaceship'];
                      const Icon = visual.icon;
                      return (
                        <div key={i} className="bg-white border-4 border-[#1e1b26] rounded-3xl p-5 text-center shadow-[4px_4px_0px_#1e1b26] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group">
                          <Icon className={`w-10 h-10 mx-auto mb-3 stroke-[2.5] ${visual.color} group-hover:scale-110 transition-transform`} />
                          <div className="text-[10px] font-black text-[#8f8a9e] uppercase mb-1">{game.id}</div>
                          <div className="font-[Outfit] text-2xl font-black text-[#1e1b26]">{game.avgScore}</div>
                          <div className="text-[10px] text-[#1e1b26] mt-1 font-black uppercase opacity-40">{game.games} Runs</div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right Side / Recent Activity */}
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
                  <div className="space-y-6 relative">
                    <div className="absolute left-[19px] top-2 bottom-2 w-1 bg-[#1e1b26] opacity-10" />
                    {data.recentActivity.map((activity, i) => {
                      const visual = gameVisuals[activity.gameId] || gameVisuals['spaceship'];
                      const Icon = activity.type === 'game' ? visual.icon : BookOpen;
                      return (
                        <motion.div key={i} whileHover={{ x: 5 }} className="flex items-start gap-4 relative z-10">
                          <div className={`w-10 h-10 rounded-xl border-2 border-[#1e1b26] ${visual.bg} flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#1e1b26]`}>
                            <Icon className={`w-5 h-5 stroke-[2.5] ${visual.color}`} />
                          </div>
                          <div>
                            <div className="text-xs text-[#1e1b26] font-black leading-tight uppercase tracking-tighter">{activity.action}</div>
                            <div className="text-[10px] text-[#5a5566] font-black uppercase mt-1 opacity-60">{activity.time}</div>
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