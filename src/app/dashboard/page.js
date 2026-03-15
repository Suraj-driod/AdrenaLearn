'use client'
import {
  Flame, Trophy, Flag, Target, Play, Clock, Rocket, Gamepad2,
  BarChart3, Zap, ArrowUpRight
} from 'lucide-react'
import Link from 'next/link'
import Sidebar from '../components/Sidebar'

const recentGames = [
  { mode: 'Spaceship Mission', icon: '🚀', score: 1250, accuracy: '80%', date: 'Mar 14, 2026' },
  { mode: 'Balloon Shooter', icon: '🎈', score: 980, accuracy: '72%', date: 'Mar 13, 2026' },
  { mode: 'Subway Runner', icon: '🏃', score: 1100, accuracy: '85%', date: 'Mar 12, 2026' },
]

const leaderboard = [
  { rank: 1, name: 'Priya Sharma', points: 4820, initials: 'PS' },
  { rank: 2, name: 'Rohan Mehta', points: 4560, initials: 'RM' },
  { rank: 3, name: 'Ananya Iyer', points: 4210, initials: 'AI' },
  { rank: 4, name: 'Arjun Patel', points: 3890, initials: 'AP' },
  { rank: 5, name: 'Sneha Reddy', points: 3650, initials: 'SR' },
]

const games = [
  { name: 'Spaceship', icon: '🚀' },
  { name: 'Subway', icon: '🏃' },
  { name: 'Balloon', icon: '🎈' },
  { name: 'Cat Rescue', icon: '🐱' },
]

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#f7f5f0]">
      <Sidebar />
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {/* Greeting */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="font-[Outfit] text-2xl sm:text-3xl font-black tracking-tight text-[#1e1b26]">
                Welcome back, Arjun 👋
              </h1>
              <p className="text-[#5a5566] mt-1 text-sm font-medium">Ready to conquer today&apos;s challenges?</p>
            </div>
            <div className="flex items-center gap-2 bg-[#fbc13a] border-2 border-[#1e1b26] shadow-[3px_3px_0px_#1e1b26] rounded-full px-5 py-2.5 self-start hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-[5px_5px_0px_#1e1b26] transition-all cursor-default">
              <Flame className="w-5 h-5 text-[#1e1b26]" />
              <span className="text-sm font-bold text-[#1e1b26]">4 Day Streak</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {[
              { label: 'Total Points', value: '2,450 XP', icon: '⚡', color: 'bg-[#ffd6e4]' },
              { label: 'Lessons Done', value: '7 / 15', icon: '🎯', color: 'bg-[#fff3c4]' },
              { label: 'Accuracy', value: '78%', icon: '📊', color: 'bg-[#d4f0e0]' },
              { label: 'Global Rank', value: '#42', icon: '🏆', color: 'bg-[#ede4ff]' },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-5 rounded-3xl border-2 border-[#1e1b26] shadow-[4px_4px_0px_#1e1b26] hover:shadow-[6px_6px_0px_#1e1b26] hover:-translate-y-1 hover:-translate-x-1 transition-all group">
                <div className={`w-12 h-12 rounded-2xl ${stat.color} border-2 border-[#eae5d9] group-hover:border-[#1e1b26] transition-colors flex items-center justify-center text-2xl mb-3`}>{stat.icon}</div>
                <div className="font-[Outfit] text-2xl font-black text-[#1e1b26]">{stat.value}</div>
                <div className="text-[#5a5566] text-sm font-bold mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">

              {/* Current Lesson Hero Card */}
              <div className="bg-[#262333] text-white rounded-[32px] p-6 sm:p-8 relative border-2 border-[#1e1b26] shadow-[8px_8px_0px_#f04e7c] transition-all">

                {/* Top Badge */}
                <div className="inline-flex items-center gap-2 bg-[#fbc13a] text-[#1e1b26] border-2 border-[#1e1b26] shadow-[3px_3px_0px_#1e1b26] rounded-full px-4 py-1.5 mb-6">
                  <span className="text-xs font-black uppercase tracking-wider">Lesson 8 of 15</span>
                </div>

                {/* Header & Description - Forced White Text Here */}
                <h2 className="font-[Outfit] text-3xl sm:text-4xl font-black !text-white mb-3">
                  Functions in Python
                </h2>
                <p className="text-[#a19db0] text-sm sm:text-base font-medium mb-8 max-w-lg leading-relaxed">
                  Learn about defining, calling, and passing arguments to functions. Master key concepts.
                </p>

                {/* Premium Progress Section */}
                <div className="mb-10">
                  <div className="flex flex-wrap items-center justify-between text-sm mb-4 gap-2">
                    <span className="text-white font-medium">Premium Progress</span>
                    <div className="flex items-center gap-4 font-black">
                      <span className="text-white">Progress: 10%</span>
                      <span className="text-white">2,450 XP</span>
                    </div>
                  </div>

                  {/* Custom Progress Bar with Nodes */}
                  <div className="relative h-4 bg-[#3a3545] rounded-full border-2 border-[#1e1b26] w-full mt-2">
                    {/* Gradient Fill */}
                    <div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#f04e7c] to-[#fbc13a] rounded-full"
                      style={{ width: '10%' }}
                    />

                    {/* Start Node (Target) */}
                    <div className="absolute top-1/2 -translate-y-1/2 left-0 -ml-1 w-8 h-8 bg-[#f04e7c] border-2 border-[#1e1b26] rounded-full flex items-center justify-center shadow-[2px_2px_0px_#1e1b26] z-10">
                      <Target className="w-4 h-4 text-[#1e1b26] stroke-[3]" />
                    </div>

                    {/* Current Progress Node (Flag) */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-8 h-8 bg-[#fbc13a] border-2 border-[#1e1b26] rounded-full flex items-center justify-center shadow-[2px_2px_0px_#1e1b26] z-10 transition-all duration-500"
                      style={{ left: '10%', marginLeft: '-16px' }}
                    >
                      <Flag className="w-4 h-4 text-[#1e1b26] stroke-[3]" />
                    </div>
                  </div>
                </div>

                {/* Bottom Controls */}
                <div>
                  <div className="text-xs font-black uppercase tracking-widest text-[#a19db0] mb-4">
                    Active Learning Path
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <Link href="/courses/ce/lesson-8" className="inline-flex items-center gap-2 bg-[#fbc13a] text-[#1e1b26] font-black px-6 py-3 rounded-full border-2 border-[#1e1b26] shadow-[4px_4px_0px_#1e1b26] hover:shadow-[6px_6px_0px_#1e1b26] hover:-translate-y-0.5 hover:-translate-x-0.5 transition-all">
                      <Play className="w-5 h-5 fill-[#1e1b26]" /> Play Now
                    </Link>

                    <div className="flex items-center gap-2 text-[#a19db0] bg-transparent border border-[#5a5566] px-4 py-2.5 rounded-full">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-medium">~12 min</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Games */}
              <div className="bg-white p-6 rounded-[32px] border-2 border-[#1e1b26] shadow-[4px_4px_0px_#1e1b26]">
                <h3 className="font-[Outfit] font-black text-xl mb-5 text-[#1e1b26]">Recent Game Sessions</h3>
                <div className="space-y-3">
                  {recentGames.map((game, i) => (
                    <div key={i} className="flex items-center gap-4 bg-[#f7f5f0] border-2 border-[#eae5d9] rounded-2xl p-4 hover:border-[#1e1b26] hover:shadow-[4px_4px_0px_#1e1b26] hover:-translate-y-0.5 transition-all cursor-pointer group">
                      <div className="w-12 h-12 rounded-xl bg-white border-2 border-[#eae5d9] group-hover:border-[#1e1b26] flex items-center justify-center text-2xl transition-colors">{game.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-[#1e1b26]">{game.mode}</div>
                        <div className="text-[#5a5566] font-medium text-xs mt-0.5">{game.date}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-[#f04e7c]">{game.score} pts</div>
                        <div className="text-[#5a5566] font-bold text-xs mt-0.5">{game.accuracy} acc</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">

              {/* Leaderboard */}
              <div className="bg-white p-6 rounded-[32px] border-2 border-[#1e1b26] shadow-[4px_4px_0px_#1e1b26]">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-[Outfit] font-black text-xl text-[#1e1b26]">Weekly Top 5</h3>
                  <Link href="/leaderboard" className="text-xs text-[#f04e7c] font-black flex items-center gap-1 hover:text-[#1e1b26] transition-colors">
                    View All <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="space-y-3">
                  {leaderboard.map((player, i) => (
                    <div key={i} className={`flex items-center gap-3 p-3 rounded-2xl transition-all border-2 ${i === 3
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
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black border-2 ${i === 3 ? 'bg-white border-[#1e1b26] text-[#1e1b26]' : 'bg-[#1e1b26] border-[#1e1b26] text-white'}`}>
                        {player.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`font-bold text-sm truncate ${i === 3 ? 'text-[#1e1b26]' : 'text-[#1e1b26]'}`}>{player.name}</div>
                      </div>
                      <div className="text-sm font-black text-[#f04e7c]">{player.points.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Play */}
              <div className="bg-white p-6 rounded-[32px] border-2 border-[#1e1b26] shadow-[4px_4px_0px_#1e1b26]">
                <h3 className="font-[Outfit] font-black text-xl mb-5 text-[#1e1b26]">Quick Play</h3>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {games.map((game, i) => (
                    <button key={i} className="bg-[#f7f5f0] border-2 border-[#eae5d9] rounded-2xl p-4 text-center hover:border-[#1e1b26] hover:shadow-[4px_4px_0px_#1e1b26] hover:-translate-y-1 hover:-translate-x-1 transition-all group">
                      <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{game.icon}</div>
                      <div className="text-xs font-black text-[#5a5566] group-hover:text-[#1e1b26]">{game.name}</div>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  )
}