'use client'
import { useState, useEffect } from 'react'
import {
  Flame, Trophy, Flag, Target, Play, Clock, Rocket, Gamepad2,
  BarChart3, Zap, ArrowUpRight, Cat, Sparkles, Loader2, Brain,
  BookOpen, ChevronRight
} from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Sidebar from '../components/Sidebar'
import ProtectedRoute from '../components/ProtectedRoute'

import { useAuth } from '../context/AuthContext'
import { fetchDashboardData } from '../../database/dashboardData'

const getGameVisuals = (gameName) => {
  const name = (gameName || '').toLowerCase();
  if (name.includes('space')) return { icon: Rocket, iconColor: 'text-[#7c3aed]', bgColor: 'bg-[#ede4ff]' };
  if (name.includes('balloon')) return { icon: Target, iconColor: 'text-[#f04e7c]', bgColor: 'bg-[#ffd6e4]' };
  if (name.includes('subway')) return { icon: Zap, iconColor: 'text-[#ea580c]', bgColor: 'bg-[#ffedd5]' };
  if (name.includes('cat')) return { icon: Cat, iconColor: 'text-[#1e7a4e]', bgColor: 'bg-[#d4f0e0]' };
  return { icon: Gamepad2, iconColor: 'text-[#f04e7c]', bgColor: 'bg-[#ffd6e4]' };
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
}

function DashboardContent() {
  const { user } = useAuth()
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        const dashboardData = await fetchDashboardData(user.uid);
        setData(dashboardData);
      } catch (error) {
        console.warn("Firestore data missing or failed to load. Using fallback data.", error);
        setData({
          user: { name: user.displayName?.split(" ")[0] || "Student", streak: 0 },
          stats: { totalXP: 0, accuracy: 0, globalRank: "-", totalLessonsDone: 0 },
          currentLesson: { name: "Introduction to Python", desc: "Start your coding journey here.", progress: 0, completed: 0, total: 15, duration: "~10 min" },
          recentGames: [],
          leaderboard: [
            { rank: 1, name: 'Priya Sharma', points: 4820, initials: 'PS' },
            { rank: 2, name: 'Rohan Mehta', points: 4560, initials: 'RM' },
          ],
          registeredCourses: []
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f7f5f0] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#f04e7c] animate-spin mb-4" />
        <p className="font-[Outfit] font-bold text-[#1e1b26]">Loading your dashboard...</p>
      </div>
    );
  }

  if (!data) return <div className="min-h-screen bg-[#f7f5f0] p-10 font-bold">Please log in to view.</div>;

  const registeredCourses = data.registeredCourses || [];

  return (
    <div className="min-h-screen bg-[#f7f5f0] selection:bg-[#f04e7c] selection:text-white">
      <Sidebar />
      <main className="lg:ml-56 pt-16 lg:pt-0 min-h-screen overflow-x-hidden">
        <motion.div
          className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Greeting */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="font-[Outfit] text-2xl sm:text-3xl font-black tracking-tight text-[#1e1b26] flex items-center gap-3">
                Welcome back, {data.user.name} <Sparkles className="w-7 h-7 text-[#fbc13a] fill-[#fbc13a]" />
              </h1>
              <p className="text-[#5a5566] mt-1 text-sm font-medium">Ready to conquer today&apos;s challenges?</p>
            </div>
            <div className="flex items-center gap-2 bg-[#fbc13a] border-2 border-[#1e1b26] shadow-[3px_3px_0px_#1e1b26] rounded-full px-5 py-2.5 self-start hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-[5px_5px_0px_#1e1b26] transition-all cursor-default">
              <Flame className="w-5 h-5 text-[#1e1b26] fill-[#1e1b26]" />
              <span className="text-sm font-bold text-[#1e1b26]">{data.user.streak} Day Streak</span>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {[
              { label: 'Total Points', value: `${data.stats.totalXP.toLocaleString()} XP`, icon: Zap, color: 'bg-[#ffd6e4]', iconColor: 'text-[#f04e7c]' },
              { label: 'Lessons Done', value: `${data.stats.totalLessonsDone || data.currentLesson.completed}`, icon: Target, color: 'bg-[#fff3c4]', iconColor: 'text-[#ea580c]' },
              { label: 'Accuracy', value: `${data.stats.accuracy}%`, icon: BarChart3, color: 'bg-[#d4f0e0]', iconColor: 'text-[#1e7a4e]' },
              { label: 'Global Rank', value: typeof data.stats.globalRank === 'number' ? `#${data.stats.globalRank}` : data.stats.globalRank, icon: Trophy, color: 'bg-[#ede4ff]', iconColor: 'text-[#7c3aed]' },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="bg-white p-5 rounded-3xl border-2 border-[#1e1b26] shadow-[4px_4px_0px_#1e1b26] hover:shadow-[6px_6px_0px_#1e1b26] hover:-translate-y-1 hover:-translate-x-1 transition-all group">
                  <div className={`w-12 h-12 rounded-2xl ${stat.color} border-2 border-[#eae5d9] group-hover:border-[#1e1b26] transition-colors flex items-center justify-center mb-3`}>
                    <Icon className={`w-6 h-6 stroke-[2.5] ${stat.iconColor}`} />
                  </div>
                  <div className="font-[Outfit] text-2xl font-black text-[#1e1b26]">{stat.value}</div>
                  <div className="text-[#5a5566] text-sm font-bold mt-0.5">{stat.label}</div>
                </div>
              );
            })}
          </motion.div>

          {/* My Courses Progress Widget */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="bg-white p-6 rounded-[32px] border-2 border-[#1e1b26] shadow-[4px_4px_0px_#1e1b26]">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-[Outfit] font-black text-xl text-[#1e1b26] flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#f04e7c]" /> My Courses
                </h3>
                <Link href="/courses" className="text-xs text-[#f04e7c] font-black flex items-center gap-1 hover:text-[#1e1b26] transition-colors">
                  Browse All <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>

              {registeredCourses.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-[#eae5d9] rounded-2xl">
                  <BookOpen className="w-10 h-10 text-[#8f8a9e] mx-auto mb-3" />
                  <p className="text-[#5a5566] font-bold mb-3">No courses registered yet</p>
                  <Link href="/courses" className="inline-flex items-center gap-2 bg-[#fbc13a] text-[#1e1b26] font-black px-5 py-2.5 rounded-full border-2 border-[#1e1b26] shadow-[3px_3px_0px_#1e1b26] hover:shadow-[5px_5px_0px_#1e1b26] hover:-translate-y-0.5 transition-all text-sm">
                    Browse Courses <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {registeredCourses.map((course) => (
                    <Link href={`/courses/${course.id}`} key={course.id} className="block">
                      <div className={`${course.bgColor} p-4 sm:p-5 rounded-2xl border-2 border-[#1e1b26] shadow-[2px_2px_0px_#1e1b26] hover:shadow-[4px_4px_0px_#1e1b26] hover:-translate-y-0.5 transition-all group`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-xl border-2 border-[#1e1b26] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                              <BookOpen className={`w-5 h-5 stroke-[2.5] ${course.iconColor}`} />
                            </div>
                            <div>
                              <h4 className="font-[Outfit] font-black text-base text-[#1e1b26] leading-tight">{course.name}</h4>
                              <p className="text-[#5a5566] text-xs font-bold mt-0.5">{course.completedLessons} / {course.totalLessons} lessons done</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="bg-white px-3 py-1 rounded-lg border-2 border-[#1e1b26] text-xs font-black text-[#1e1b26]">
                              {course.progress}%
                            </span>
                            <ChevronRight className="w-5 h-5 text-[#8f8a9e] group-hover:text-[#f04e7c] transition-colors" />
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="h-3 bg-white/80 rounded-full border-2 border-[#1e1b26] overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#f04e7c] to-[#fbc13a] rounded-full transition-all duration-700"
                            style={{ width: `${Math.max(2, course.progress)}%` }}
                          />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">

              {/* Current Lesson Hero Card */}
              <motion.div variants={itemVariants} className="bg-[#262333] text-white rounded-[32px] p-6 sm:p-8 relative border-2 border-[#1e1b26] shadow-[8px_8px_0px_#f04e7c] transition-all">
                <div className="inline-flex items-center gap-2 bg-[#fbc13a] text-[#1e1b26] border-2 border-[#1e1b26] shadow-[3px_3px_0px_#1e1b26] rounded-full px-4 py-1.5 mb-6">
                  <span className="text-xs font-black uppercase tracking-wider">Lesson {data.currentLesson.completed + 1} of {data.currentLesson.total}</span>
                </div>

                <h2 className="font-[Outfit] text-3xl sm:text-4xl font-black !text-white mb-3">
                  {data.currentLesson.name}
                </h2>
                <p className="text-[#a19db0] text-sm sm:text-base font-medium mb-8 max-w-lg leading-relaxed">
                  {data.currentLesson.desc}
                </p>

                <div className="mb-10">
                  <div className="flex flex-wrap items-center justify-between text-sm mb-4 gap-2">
                    <span className="text-white font-medium">Premium Progress</span>
                    <div className="flex items-center gap-4 font-black">
                      <span className="text-white">Progress: {data.currentLesson.progress}%</span>
                      <span className="text-white">{data.stats.totalXP.toLocaleString()} XP</span>
                    </div>
                  </div>

                  <div className="relative h-4 bg-[#3a3545] rounded-full border-2 border-[#1e1b26] w-full mt-2">
                    <div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#f04e7c] to-[#fbc13a] rounded-full transition-all duration-1000"
                      style={{ width: `${Math.max(5, data.currentLesson.progress)}%` }}
                    />
                    <div className="absolute top-1/2 -translate-y-1/2 left-0 -ml-1 w-8 h-8 bg-[#f04e7c] border-2 border-[#1e1b26] rounded-full flex items-center justify-center shadow-[2px_2px_0px_#1e1b26] z-10">
                      <Target className="w-4 h-4 text-[#1e1b26] stroke-[3]" />
                    </div>
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-8 h-8 bg-[#fbc13a] border-2 border-[#1e1b26] rounded-full flex items-center justify-center shadow-[2px_2px_0px_#1e1b26] z-10 transition-all duration-1000"
                      style={{ left: `${Math.max(5, data.currentLesson.progress)}%`, marginLeft: '-16px' }}
                    >
                      <Flag className="w-4 h-4 text-[#1e1b26] stroke-[3]" />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-black uppercase tracking-widest text-[#a19db0] mb-4">
                    Active Learning Path
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <Link href={`/courses/active/lesson-${data.currentLesson.completed + 1}`} className="inline-flex items-center gap-2 bg-[#fbc13a] text-[#1e1b26] font-black px-6 py-3 rounded-full border-2 border-[#1e1b26] shadow-[4px_4px_0px_#1e1b26] hover:shadow-[6px_6px_0px_#1e1b26] hover:-translate-y-0.5 hover:-translate-x-0.5 transition-all">
                      <Play className="w-5 h-5 fill-[#1e1b26]" /> Play Now
                    </Link>
                    <div className="flex items-center gap-2 text-[#a19db0] bg-transparent border border-[#5a5566] px-4 py-2.5 rounded-full">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-medium">{data.currentLesson.duration}</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* AI Personalization Feature Card */}
              <motion.div variants={itemVariants} className="bg-[#ede4ff] rounded-[32px] p-6 sm:p-8 border-2 border-[#1e1b26] shadow-[4px_4px_0px_#1e1b26] relative overflow-hidden group">
                <div className="absolute -right-4 -top-8 opacity-10 group-hover:rotate-12 transition-transform duration-700 pointer-events-none">
                  <Brain className="w-48 h-48 text-[#7c3aed]" />
                </div>

                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div className="max-w-md">
                    <div className="inline-flex items-center gap-1.5 bg-[#7c3aed] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border-2 border-[#1e1b26] shadow-[2px_2px_0px_#1e1b26] mb-4">
                      <Sparkles className="w-3 h-3" /> Experimental AI
                    </div>
                    <h3 className="font-[Outfit] text-2xl sm:text-3xl font-black text-[#1e1b26] mb-2 tracking-tight">
                      Custom AI Missions
                    </h3>
                    <p className="text-[#5a5566] text-sm font-bold leading-relaxed">
                      Upload your study material (PDF) and let our AI engine forge a personalized game arena tailored specifically to your syllabus.
                    </p>
                  </div>

                  <Link href="/personalization" className="shrink-0 bg-white text-[#1e1b26] border-2 border-[#1e1b26] shadow-[4px_4px_0px_#1e1b26] hover:shadow-[6px_6px_0px_#1e1b26] hover:-translate-y-1 hover:-translate-x-1 transition-all rounded-2xl px-6 py-4 font-black uppercase text-sm tracking-widest flex items-center gap-2 group-hover:bg-[#fbc13a]">
                    Upload PDF <ArrowUpRight className="w-5 h-5 stroke-[3]" />
                  </Link>
                </div>
              </motion.div>

              {/* Recent Games */}
              <motion.div variants={itemVariants} className="bg-white p-6 rounded-[32px] border-2 border-[#1e1b26] shadow-[4px_4px_0px_#1e1b26]">
                <h3 className="font-[Outfit] font-black text-xl mb-5 text-[#1e1b26] flex items-center gap-2">
                  <Gamepad2 className="w-6 h-6 text-[#f04e7c]" /> Recent Game Sessions
                </h3>

                {data.recentGames.length === 0 ? (
                  <div className="text-center py-8 text-[#8f8a9e] font-semibold border-2 border-dashed border-[#eae5d9] rounded-2xl">
                    Play a game to see your stats here!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.recentGames.map((game, i) => {
                      const visual = getGameVisuals(game.mode);
                      const Icon = visual.icon;
                      return (
                        <div key={i} className={`flex items-center gap-4 ${visual.bgColor} border-2 border-[#1e1b26] shadow-[2px_2px_0px_#1e1b26] rounded-2xl p-4 hover:shadow-[4px_4px_0px_#1e1b26] hover:-translate-y-0.5 transition-all cursor-pointer group`}>
                          <div className="w-12 h-12 rounded-xl bg-white border-2 border-[#1e1b26] flex items-center justify-center transition-colors">
                            <Icon className={`w-6 h-6 stroke-[2.5] ${visual.iconColor}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-[#1e1b26]">{game.mode}</div>
                            <div className="text-[#5a5566] font-medium text-xs mt-0.5">{game.date}</div>
                          </div>
                          <div className="text-right bg-white px-3 py-1.5 rounded-xl border-2 border-[#1e1b26]">
                            <div className="font-black text-[#1e1b26]">{game.score} pts</div>
                            <div className="text-[#5a5566] font-bold text-xs mt-0.5">{game.accuracy} acc</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">

              {/* Leaderboard */}
              <motion.div variants={itemVariants} className="bg-white p-6 rounded-[32px] border-2 border-[#1e1b26] shadow-[4px_4px_0px_#1e1b26]">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-[Outfit] font-black text-xl text-[#1e1b26] flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-[#fbc13a]" /> Weekly Top
                  </h3>
                  <Link href="/leaderboard" className="text-xs text-[#f04e7c] font-black flex items-center gap-1 hover:text-[#1e1b26] transition-colors">
                    View All <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="space-y-3">
                  {data.leaderboard.map((player, i) => {
                    const isCurrentUser = player.name === data.user.name;
                    return (
                      <div key={i} className={`flex items-center gap-3 p-3 rounded-2xl transition-all border-2 ${isCurrentUser
                        ? 'bg-[#ffd6e4] border-[#1e1b26] shadow-[3px_3px_0px_#1e1b26] -translate-y-0.5'
                        : 'bg-transparent border-transparent hover:bg-[#f7f5f0] hover:border-[#eae5d9]'
                        }`}>
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black border-2 ${i === 0 ? 'bg-[#fbc13a] border-[#1e1b26] text-[#1e1b26] shadow-[2px_2px_0px_#1e1b26]' :
                          i === 1 ? 'bg-gray-200 border-gray-400 text-gray-700' :
                            i === 2 ? 'bg-orange-200 border-orange-400 text-orange-800' :
                              'bg-[#f7f5f0] border-[#eae5d9] text-[#5a5566]'
                          }`}>
                          {player.rank}
                        </div>
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black border-2 ${isCurrentUser ? 'bg-white border-[#1e1b26] text-[#1e1b26]' : 'bg-[#1e1b26] border-[#1e1b26] text-white'}`}>
                          {player.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`font-bold text-sm truncate ${isCurrentUser ? 'text-[#1e1b26]' : 'text-[#1e1b26]'}`}>
                            {player.name} {isCurrentUser && "(You)"}
                          </div>
                        </div>
                        <div className="text-sm font-black text-[#f04e7c]">{player.points.toLocaleString()}</div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>

              {/* Quick Play */}
              <motion.div variants={itemVariants} className="bg-white p-6 rounded-[32px] border-2 border-[#1e1b26] shadow-[4px_4px_0px_#1e1b26]">
                <h3 className="font-[Outfit] font-black text-xl mb-5 text-[#1e1b26] flex items-center gap-2">
                  <Play className="w-5 h-5 text-[#7c3aed]" /> Quick Play
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {[
                    { name: 'Spaceship', icon: Rocket, iconColor: 'text-[#7c3aed]', bgColor: 'bg-[#ede4ff]' },
                    { name: 'Subway', icon: Zap, iconColor: 'text-[#ea580c]', bgColor: 'bg-[#ffedd5]' },
                    { name: 'Balloon', icon: Target, iconColor: 'text-[#f04e7c]', bgColor: 'bg-[#ffd6e4]' },
                    { name: 'Cat Rescue', icon: Cat, iconColor: 'text-[#1e7a4e]', bgColor: 'bg-[#d4f0e0]' },
                  ].map((game, i) => {
                    const Icon = game.icon;
                    return (
                      <Link href={`/games/${game.name.toLowerCase().replace(' ', '-')}`} key={i} className={`${game.bgColor} border-2 border-[#1e1b26] shadow-[2px_2px_0px_#1e1b26] rounded-2xl p-4 flex flex-col items-center justify-center hover:shadow-[4px_4px_0px_#1e1b26] hover:-translate-y-1 hover:-translate-x-1 transition-all group`}>
                        <div className="mb-2 bg-white p-2 rounded-xl border-2 border-[#1e1b26] group-hover:scale-110 transition-transform">
                          <Icon className={`w-7 h-7 stroke-[2.5] ${game.iconColor}`} />
                        </div>
                        <div className="text-xs font-black text-[#1e1b26] text-center">{game.name}</div>
                      </Link>
                    )
                  })}
                </div>
              </motion.div>

            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}