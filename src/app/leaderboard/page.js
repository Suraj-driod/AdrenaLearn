"use client";
import { useState, useEffect } from "react";
import {
  Crown, ArrowUp, ArrowDown, Trophy,
  Target, BookOpen, Star, Sparkles, TrendingUp,
  Zap, Medal, ShieldCheck, Flame, Fingerprint,
  Timer, Award, Users, Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import Sidebar from "../components/Sidebar";
import ProtectedRoute from "../components/ProtectedRoute";

import { useAuth } from "../context/AuthContext";
import { fetchLeaderboardData } from "../../database/leaderboardData";

function LeaderboardContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("Weekly");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ leaderboard: [], achievements: {} });

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        const result = await fetchLeaderboardData(user.uid);
        if (result.leaderboard.length === 0) throw new Error("Empty DB");
        setData(result);
      } catch (err) {
        console.warn("Using fallback leaderboard data");
        setData({
          leaderboard: [
            { rank: 1, name: "Priya Sharma", initials: "PS", course: "Computer Engineering", points: 4820, accuracy: "92%", streak: 12 },
            { rank: 2, name: "Rohan Mehta", initials: "RM", course: "Data Science", points: 4560, accuracy: "88%", streak: 8 },
            { rank: 3, name: "Ananya Iyer", initials: "AI", course: "Computer Engineering", points: 4210, accuracy: "85%", streak: 5 },
            { rank: 4, name: user.displayName || "You", initials: (user.displayName || user.email || "YO").substring(0, 2).toUpperCase(), course: "Computer Engineering", points: 3890, accuracy: "78%", isCurrentUser: true, streak: 4 },
            { rank: 5, name: "Sneha Reddy", initials: "SR", course: "MBA", points: 3650, accuracy: "81%", streak: 2 },
          ],
          achievements: { "Speed Demon": 124, "Perfect Aim": 82, "Top Gun": 12, "On Fire": 45 }
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f5f0] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#f04e7c] animate-spin mb-4" />
        <p className="font-[Outfit] font-black uppercase tracking-widest text-[#1e1b26]">Scanning Arena...</p>
      </div>
    );
  }

  const top3 = data.leaderboard.slice(0, 3);
  const podiumOrder = [top3[1], top3[0], top3[2]];
  const currentUser = data.leaderboard.find(s => s.isCurrentUser) || data.leaderboard[3];

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#1e1b26] selection:bg-[#fbc13a]">
      <Sidebar />

      <main className="lg:ml-56 min-h-screen relative overflow-hidden flex flex-col pt-12">
        <div className="p-6 lg:p-12 max-w-7xl mx-auto w-full relative z-10 flex-1">

          <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8">
            <div className="relative">
              <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} className="absolute -left-4 -top-4 w-12 h-12 border-t-4 border-l-4 border-[#1e1b26]" />
              <h1 className="font-[Outfit] text-6xl lg:text-8xl font-black leading-none tracking-tighter uppercase italic">
                The <br /> <span className="text-[#f04e7c]">Rankings</span>
              </h1>
            </div>

            <div className="bg-white border-4 border-[#1e1b26] p-2 rounded-2xl shadow-[8px_8px_0px_#1e1b26] flex gap-2">
              {["Weekly", "All Time", "Global"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all ${activeTab === tab ? "bg-[#1e1b26] text-white shadow-[4px_4px_0px_#f04e7c] -translate-y-1" : "hover:bg-[#f7f5f0]"
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

            <div className="lg:col-span-8 grid grid-cols-3 gap-4 items-end h-[450px] mb-12 lg:mb-0">
              <Tower card={podiumOrder[0]} height="h-[70%]" color="bg-gray-200" />
              <Tower card={podiumOrder[1]} height="h-[100%]" color="bg-[#fbc13a]" isWinner />
              <Tower card={podiumOrder[2]} height="h-[55%]" color="bg-[#fdba74]" />
            </div>

            <div className="lg:col-span-4">
              {currentUser && (
                <motion.div whileHover={{ scale: 1.02 }} className="bg-[#1e1b26] text-white p-8 rounded-[40px] border-4 border-[#1e1b26] shadow-[12px_12px_0px_#f04e7c] relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-20"><Fingerprint className="w-24 h-24" /></div>

                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-white text-[#1e1b26] flex items-center justify-center font-black text-2xl shadow-[4px_4px_0px_#f04e7c]">
                      {currentUser.initials}
                    </div>
                    <div>
                      <p className="text-[#fbc13a] font-black text-xs uppercase tracking-widest">Active Operative</p>
                      <h2 className="text-2xl font-black uppercase">{currentUser.name}</h2>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <StatRow icon={<Trophy className="w-4 h-4 text-[#fbc13a]" />} label="Current Rank" value={`#${String(currentUser.rank).padStart(2, '0')}`} color="text-[#fbc13a]" />
                    <StatRow icon={<Flame className="w-4 h-4 text-[#f04e7c]" />} label="Hot Streak" value={`${currentUser.streak} Days`} color="text-[#f04e7c]" />
                    <StatRow icon={<ShieldCheck className="w-4 h-4 text-green-400" />} label="Accuracy" value={currentUser.accuracy} color="text-green-400" />
                  </div>

                  <button className="w-full mt-8 bg-white text-[#1e1b26] font-black py-4 rounded-2xl border-2 border-white hover:bg-transparent hover:text-white transition-all uppercase text-sm tracking-widest active:translate-y-1">
                    View Full Profile
                  </button>
                </motion.div>
              )}
            </div>
          </div>

          {/* PERKS SECTION (Replaced 'The Field') */}
          <div className="mt-24">
            <h3 className="font-black text-3xl uppercase mb-8 flex items-center gap-3 italic">
              <span className="text-[#fbc13a]">/</span> Elite Perks
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

              <motion.div whileHover={{ y: -5 }} className="bg-[#f04e7c] text-white border-4 border-[#1e1b26] p-8 rounded-3xl shadow-[8px_8px_0px_#1e1b26] flex flex-col justify-between cursor-default">
                <div>
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border-4 border-[#1e1b26] mb-6 shadow-[4px_4px_0px_#1e1b26]">
                    <Target className="w-6 h-6 text-[#f04e7c]" />
                  </div>
                  <h4 className="font-black text-2xl uppercase mb-4 leading-tight">Design <br /> Your Level</h4>
                  <p className="font-bold text-white/90 text-sm">
                    Top 10 performers at the end of the season get exclusive rights to pitch and co-design a new level for the main arena.
                  </p>
                </div>
              </motion.div>

              <motion.div whileHover={{ y: -5 }} className="bg-white border-4 border-[#1e1b26] p-8 rounded-3xl shadow-[8px_8px_0px_#fbc13a] flex flex-col justify-between cursor-default">
                <div>
                  <div className="w-12 h-12 bg-[#1e1b26] rounded-xl flex items-center justify-center border-4 border-[#1e1b26] mb-6 shadow-[4px_4px_0px_#fbc13a]">
                    <Sparkles className="w-6 h-6 text-[#fbc13a]" />
                  </div>
                  <h4 className="font-black text-2xl uppercase mb-4 leading-tight">Exclusive <br /> Cosmetics</h4>
                  <p className="font-bold text-[#8f8a9e] text-sm">
                    Unlock rare avatars, animated profile borders, and custom titles that show everyone you dominate the leaderboards.
                  </p>
                </div>
              </motion.div>

              <motion.div whileHover={{ y: -5 }} className="bg-[#1e1b26] text-white border-4 border-[#1e1b26] p-8 rounded-3xl shadow-[8px_8px_0px_#f04e7c] flex flex-col justify-between cursor-default">
                <div>
                  <div className="w-12 h-12 bg-[#fbc13a] rounded-xl flex items-center justify-center border-4 border-[#1e1b26] mb-6 shadow-[4px_4px_0px_#f04e7c]">
                    <BookOpen className="w-6 h-6 text-[#1e1b26]" />
                  </div>
                  <h4 className="font-black text-2xl uppercase mb-4 leading-tight">Early <br /> Beta Access</h4>
                  <p className="font-bold text-white/70 text-sm">
                    Test upcoming learning modules and game modes before they drop. Your feedback shapes the future of AdrenaLearn.
                  </p>
                </div>
              </motion.div>

            </div>
          </div>

          {/* <div className="mt-24 grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 bg-white border-4 border-[#1e1b26] p-8 rounded-[40px] shadow-[10px_10px_0px_#1e1b26]">
              <div className="flex items-center justify-between mb-8">
                <h4 className="font-black text-2xl uppercase italic">Elite Achievements</h4>
                <Users className="w-6 h-6 text-[#8f8a9e]" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                <Achievement icon={<Zap className="text-[#fbc13a]" />} title="Speed Demon" count={data.achievements["Speed Demon"]} />
                <Achievement icon={<ShieldCheck className="text-[#3b82f6]" />} title="Perfect Aim" count={data.achievements["Perfect Aim"]} />
                <Achievement icon={<Award className="text-[#f04e7c]" />} title="Top Gun" count={data.achievements["Top Gun"]} />
                <Achievement icon={<Flame className="text-orange-500" />} title="On Fire" count={data.achievements["On Fire"]} />
              </div>
            </div>

            <div className="bg-[#fbc13a] border-4 border-[#1e1b26] p-8 rounded-[40px] shadow-[10px_10px_0px_#1e1b26] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Timer className="w-5 h-5" /><span className="font-black uppercase text-xs tracking-widest">Arena Reset</span>
                </div>
                <h4 className="text-4xl font-black uppercase leading-none mb-4">02:14:55</h4>
                <p className="text-sm font-bold opacity-80">Time remaining until the weekly leaderboard clears. Secure your rank now!</p>
              </div>
              <button className="bg-[#1e1b26] text-white font-black py-4 rounded-2xl mt-8 hover:bg-white hover:text-[#1e1b26] border-2 border-[#1e1b26] transition-all uppercase text-xs tracking-[0.2em]">Start Mission</button>
            </div>
          </div> */}
        </div>

        <footer className="p-12 border-t-4 border-[#1e1b26] mt-20 bg-white">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="font-black text-3xl italic tracking-tighter uppercase">AdrenaLearn<span className="text-[#f04e7c]">.</span>arena</div>
            <div className="flex gap-12 text-[10px] font-black uppercase tracking-widest text-[#8f8a9e]">
              <span>©2026 INTERNAL_BUILD</span><span>RANKING_ALGO_V2.4</span><span>SERVER_REGION: MUM_IND</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default function LeaderboardPage() {
  return (
    <ProtectedRoute>
      <LeaderboardContent />
    </ProtectedRoute>
  )
}

/* SUB-COMPONENTS */
function Achievement({ icon, title, count }) {
  return (
    <div className="bg-[#f7f5f0] border-2 border-[#1e1b26] p-4 rounded-2xl text-center hover:-translate-y-1 transition-transform">
      <div className="w-10 h-10 bg-white border-2 border-[#1e1b26] rounded-xl flex items-center justify-center mx-auto mb-3 shadow-[3px_3px_0px_#1e1b26]">{icon}</div>
      <p className="font-black text-[10px] uppercase mb-1">{title}</p>
      <p className="text-xs font-bold text-[#8f8a9e]">{count || 0} Users</p>
    </div>
  )
}

function Tower({ card, height, color, isWinner }) {
  if (!card) return null;
  return (
    <motion.div initial={{ height: 0 }} animate={{ height: "100%" }} className="flex flex-col items-center justify-end h-full group">
      <div className="mb-4 text-center">
        <div className="relative inline-block">
          <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className="w-12 h-12 sm:w-20 sm:h-20 rounded-[24px] bg-[#1e1b26] text-white flex items-center justify-center font-black border-4 border-[#1e1b26] shadow-[6px_6px_0px_#f04e7c]">{card.initials}</motion.div>
          {isWinner && <Crown className="absolute -top-10 -right-6 w-12 h-12 text-[#fbc13a] fill-[#fbc13a] rotate-12 drop-shadow-[0_4px_4px_rgba(0,0,0,0.2)]" />}
        </div>
        <p className="font-black text-xs sm:text-base mt-4 uppercase tracking-tighter">{card.name.split(" ")[0]}</p>
        <p className="font-bold text-[10px] text-[#f04e7c]">{card.points?.toLocaleString()} XP</p>
      </div>
      <div className={`${height} w-full ${color} border-4 border-[#1e1b26] rounded-t-[40px] shadow-[10px_0px_0px_rgba(0,0,0,0.1)] relative flex flex-col items-center pt-8 overflow-hidden`}>
        <span className="text-5xl sm:text-7xl font-black text-[#1e1b26]/10 italic select-none">#{card.rank}</span>
        <div className="absolute bottom-0 left-0 w-full bg-[#1e1b26]/5 h-[30%] animate-pulse" />
      </div>
    </motion.div>
  );
}

function StatRow({ icon, label, value, color }) {
  return (
    <div className="flex items-center justify-between border-b border-white/10 pb-4 last:border-0">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/5 rounded-lg border border-white/5">{icon}</div>
        <span className="text-xs font-bold uppercase text-white/50 tracking-widest">{label}</span>
      </div>
      <span className={`font-black text-lg ${color}`}>{value}</span>
    </div>
  );
}