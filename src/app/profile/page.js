'use client'
import { Edit3, BookOpen, Gamepad2, Calendar, Clock, Award } from 'lucide-react'
import Sidebar from '../components/Sidebar'

const badges = [
  { name: 'First Lesson', icon: '📚', desc: 'Completed your first lesson', earned: true },
  { name: '3 Day Streak', icon: '🔥', desc: 'Maintained a 3 day streak', earned: true },
  { name: 'Perfect Score', icon: '💯', desc: 'Got 100% in a game round', earned: true },
  { name: 'Top 10', icon: '🏆', desc: 'Reached Top 10', earned: true },
  { name: 'Speed Demon', icon: '⚡', desc: 'Finished under 1 min', earned: false },
  { name: 'Week Warrior', icon: '🗡️', desc: '7 day streak achieved', earned: false },
]

const gamePerformance = [
  { name: 'Spaceship', icon: '🚀', avgScore: 1180, games: 12 },
  { name: 'Subway', icon: '🏃', avgScore: 950, games: 8 },
  { name: 'Balloon', icon: '🎈', avgScore: 1050, games: 10 },
  { name: 'Cat Rescue', icon: '🐱', avgScore: 890, games: 6 },
]

const recentActivity = [
  { action: 'Completed Lesson 7: Lists in Python', time: '2 hours ago', icon: '📖', color: 'bg-[#d8ecff]' },
  { action: 'Played Spaceship Mission — 1,250 pts', time: '3 hours ago', icon: '🚀', color: 'bg-[#ffd6e4]' },
  { action: 'Earned badge: Perfect Score 💯', time: '1 day ago', icon: '🏅', color: 'bg-[#fff3c4]' },
  { action: 'Played Balloon Shooter — 980 pts', time: '2 days ago', icon: '🎈', color: 'bg-[#d4f0e0]' },
  { action: 'Completed Lesson 6: Loops', time: '3 days ago', icon: '📖', color: 'bg-[#d8ecff]' },
]

const weeklyXP = [
  { day: 'Mon', xp: 350, max: 500 },
  { day: 'Tue', xp: 420, max: 500 },
  { day: 'Wed', xp: 280, max: 500 },
  { day: 'Thu', xp: 500, max: 500 },
  { day: 'Fri', xp: 380, max: 500 },
  { day: 'Sat', xp: 150, max: 500 },
  { day: 'Sun', xp: 370, max: 500 },
]

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-[#f7f5f0]">
      <Sidebar />
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">

          {/* Profile Header - Bright Yellow */}
          <div className="bg-[#fbc13a] rounded-[32px] border-2 border-[#1e1b26] shadow-[8px_8px_0px_#f04e7c] p-6 sm:p-8 mb-8 transition-all">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="w-20 h-20 rounded-[24px] bg-[#1e1b26] text-white flex items-center justify-center text-2xl font-black border-2 border-[#1e1b26] shadow-[4px_4px_0px_white]">AP</div>
              <div className="flex-1">
                <h1 className="font-[Outfit] text-2xl sm:text-3xl font-black tracking-tight text-[#1e1b26]">Arjun Patel</h1>
                <p className="text-[#1e1b26]/80 text-sm mt-0.5 font-bold">arjun.patel@email.com</p>
                <div className="flex flex-wrap items-center gap-3 mt-4">
                  <span className="bg-[#ffd6e4] text-[#c0305b] text-xs font-black px-3 py-1.5 rounded-full border-2 border-[#1e1b26]">Computer Engineering</span>
                  <span className="flex items-center gap-1.5 text-[#1e1b26] text-xs font-bold bg-white/50 border-2 border-[#1e1b26] px-3 py-1.5 rounded-full">
                    <Calendar className="w-3.5 h-3.5" /> Member since Jan 2026
                  </span>
                </div>
              </div>
              <button className="inline-flex items-center gap-2 bg-white text-[#1e1b26] font-bold px-5 py-2.5 rounded-full border-2 border-[#1e1b26] shadow-[3px_3px_0px_#1e1b26] hover:shadow-[5px_5px_0px_#1e1b26] hover:-translate-y-0.5 hover:-translate-x-0.5 transition-all text-sm shrink-0">
                <Edit3 className="w-4 h-4" />Edit Profile
              </button>
            </div>
          </div>

          {/* Stats - Colorful Backgrounds */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {[
              { label: 'Total XP', value: '2,450', icon: '⚡', color: 'bg-[#ffd6e4]' }, // Pink
              { label: 'Global Rank', value: '#42', icon: '🏆', color: 'bg-[#fff3c4]' }, // Yellow
              { label: 'Lessons Done', value: '7', icon: '📖', color: 'bg-[#d8ecff]' }, // Blue
              { label: 'Avg Accuracy', value: '78%', icon: '🎯', color: 'bg-[#d4f0e0]' }, // Green
            ].map((stat, i) => (
              <div key={i} className={`${stat.color} p-5 rounded-3xl border-2 border-[#1e1b26] shadow-[4px_4px_0px_#1e1b26] hover:shadow-[6px_6px_0px_#1e1b26] hover:-translate-y-1 hover:-translate-x-1 transition-all group`}>
                <div className={`w-12 h-12 rounded-2xl bg-white border-2 border-[#1e1b26] flex items-center justify-center text-2xl mb-3`}>{stat.icon}</div>
                <div className="font-[Outfit] text-2xl font-black text-[#1e1b26]">{stat.value}</div>
                <div className="text-[#1e1b26]/70 text-sm font-bold mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">

              {/* Badges - Lavender Box */}
              <div className="bg-[#ede4ff] p-6 rounded-[32px] border-2 border-[#1e1b26] shadow-[4px_4px_0px_#1e1b26]">
                <h3 className="font-[Outfit] font-black text-xl mb-5 flex items-center gap-2 text-[#1e1b26]">🏅 Badges</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  {badges.map((badge, i) => (
                    <div key={i} className={`p-4 rounded-2xl border-2 text-center transition-all ${badge.earned
                        ? 'bg-white border-[#1e1b26] shadow-[3px_3px_0px_#1e1b26] hover:shadow-[5px_5px_0px_#1e1b26] hover:-translate-y-1 hover:-translate-x-1 cursor-default'
                        : 'bg-white/40 border-[#1e1b26]/20 opacity-60 grayscale-[50%]'
                      }`}>
                      <div className="text-3xl mb-2">{badge.icon}</div>
                      <div className={`text-sm font-black ${badge.earned ? 'text-[#1e1b26]' : 'text-[#5a5566]'}`}>{badge.name}</div>
                      <div className="text-xs text-[#8f8a9e] mt-1 font-medium">{badge.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Game Performance - Soft Blue Box */}
              <div className="bg-[#e4f1ff] p-6 rounded-[32px] border-2 border-[#1e1b26] shadow-[4px_4px_0px_#1e1b26]">
                <h3 className="font-[Outfit] font-black text-xl mb-5 flex items-center gap-2 text-[#1e1b26]">🎮 Game Performance</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  {gamePerformance.map((game, i) => (
                    <div key={i} className="bg-white border-2 border-[#1e1b26] rounded-2xl p-4 text-center hover:shadow-[3px_3px_0px_#1e1b26] hover:-translate-y-0.5 hover:-translate-x-0.5 transition-all group">
                      <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{game.icon}</div>
                      <div className="text-sm font-bold mb-1 text-[#1e1b26]">{game.name}</div>
                      <div className="font-[Outfit] text-xl font-black text-[#f04e7c]">{game.avgScore}</div>
                      <div className="text-xs text-[#8f8a9e] mt-0.5 font-bold">{game.games} games</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly XP - Pale Yellow Box */}
              <div className="bg-[#fff8e7] p-6 rounded-[32px] border-2 border-[#1e1b26] shadow-[4px_4px_0px_#1e1b26]">
                <h3 className="font-[Outfit] font-black text-xl mb-6 flex items-center gap-2 text-[#1e1b26]">📊 Weekly XP</h3>
                <div className="flex items-end justify-between gap-2 h-40 mt-4">
                  {weeklyXP.map((day, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <span className="text-xs text-[#1e1b26] font-black">{day.xp}</span>
                      <div className="w-full relative h-28 group">
                        <div className="absolute bottom-0 w-full bg-white border-2 border-[#1e1b26] border-b-0 rounded-t-xl" style={{ height: '100%' }} />
                        <div className="absolute bottom-0 w-full bg-gradient-to-t from-[#f04e7c] to-[#fbc13a] rounded-t-xl transition-all border-2 border-[#1e1b26] border-b-0 group-hover:brightness-110" style={{ height: `${(day.xp / day.max) * 100}%` }} />
                      </div>
                      <span className="text-xs text-[#5a5566] font-bold">{day.day}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side / Recent Activity - Mint Green Box */}
            <div>
              <div className="bg-[#d4f0e0] p-6 rounded-[32px] border-2 border-[#1e1b26] shadow-[4px_4px_0px_#1e1b26] lg:sticky lg:top-6">
                <h3 className="font-[Outfit] font-black text-xl mb-5 flex items-center gap-2 text-[#1e1b26]">🕐 Recent Activity</h3>
                <div className="space-y-4">
                  {recentActivity.map((activity, i) => (
                    <div key={i} className="flex items-start gap-3 group bg-white/60 p-3 rounded-2xl border-2 border-transparent hover:border-[#1e1b26] hover:bg-white transition-all">
                      <div className={`w-10 h-10 rounded-xl border-2 border-[#1e1b26] ${activity.color} flex items-center justify-center text-lg shrink-0`}>{activity.icon}</div>
                      <div className="pt-0.5">
                        <div className="text-sm text-[#1e1b26] font-bold leading-tight">{activity.action}</div>
                        <div className="text-xs text-[#5a5566] font-medium mt-1">{activity.time}</div>
                      </div>
                    </div>
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