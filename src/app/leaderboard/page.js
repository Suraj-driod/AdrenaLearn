"use client";
import { useState } from "react";
import { Crown, ArrowUp, ArrowDown, Minus } from "lucide-react";
import Sidebar from "../components/Sidebar";

const students = [
  {
    rank: 1,
    name: "Priya Sharma",
    initials: "PS",
    course: "Computer Engineering",
    points: 4820,
    lessons: 14,
    accuracy: "92%",
    change: "up",
  },
  {
    rank: 2,
    name: "Rohan Mehta",
    initials: "RM",
    course: "Data Science",
    points: 4560,
    lessons: 10,
    accuracy: "88%",
    change: "up",
  },
  {
    rank: 3,
    name: "Ananya Iyer",
    initials: "AI",
    course: "Computer Engineering",
    points: 4210,
    lessons: 13,
    accuracy: "85%",
    change: "down",
  },
  {
    rank: 4,
    name: "Arjun Patel",
    initials: "AP",
    course: "Computer Engineering",
    points: 3890,
    lessons: 7,
    accuracy: "78%",
    change: "up",
    isCurrentUser: true,
  },
  {
    rank: 5,
    name: "Sneha Reddy",
    initials: "SR",
    course: "MBA",
    points: 3650,
    lessons: 11,
    accuracy: "81%",
    change: "same",
  },
  {
    rank: 6,
    name: "Vikram Singh",
    initials: "VS",
    course: "Data Science",
    points: 3420,
    lessons: 9,
    accuracy: "76%",
    change: "down",
  },
  {
    rank: 7,
    name: "Neha Gupta",
    initials: "NG",
    course: "MBA",
    points: 3190,
    lessons: 10,
    accuracy: "74%",
    change: "up",
  },
  {
    rank: 8,
    name: "Karthik Nair",
    initials: "KN",
    course: "Computer Engineering",
    points: 2980,
    lessons: 8,
    accuracy: "79%",
    change: "up",
  },
  {
    rank: 9,
    name: "Divya Joshi",
    initials: "DJ",
    course: "Data Science",
    points: 2750,
    lessons: 7,
    accuracy: "72%",
    change: "down",
  },
  {
    rank: 10,
    name: "Amit Verma",
    initials: "AV",
    course: "MBA",
    points: 2530,
    lessons: 6,
    accuracy: "70%",
    change: "same",
  },
];

const tabs = ["Weekly", "All Time", "By Course"];

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState("Weekly");
  const top3 = students.slice(0, 3);
  const podiumOrder = [top3[1], top3[0], top3[2]];

  const courseColors = {
    "Computer Engineering": "bg-[#ffd6e4] text-[#c0305b]",
    "Data Science": "bg-[#d8ecff] text-[#2563eb]",
    MBA: "bg-[#fff3c4] text-[#92600e]",
  };

  return (
    <div className="min-h-screen bg-[#f7f5f0]">
      <Sidebar />
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="font-[Outfit] text-3xl sm:text-4xl font-black tracking-tight mb-2">
              <span className="text-[#fbc13a]">Leaderboard</span>
            </h1>
            <p className="text-[#5a5566] text-lg">
              See how you stack up against other adrenalearn users
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 bg-white border-2 border-[#eae5d9] rounded-full p-1 w-fit">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                  activeTab === tab
                    ? "bg-[#f04e7c] text-white border-2 border-[#1e1b26] shadow-[2px_2px_0px_#1e1b26]"
                    : "text-[#5a5566] hover:text-[#1e1b26] border-2 border-transparent"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Podium */}
          <div className="flex items-end justify-center gap-4 sm:gap-6 mb-12">
            {podiumOrder.map((student, i) => {
              const isFirst = i === 1;
              const height = isFirst ? "h-44" : i === 0 ? "h-36" : "h-28";
              const avatarSize = isFirst
                ? "w-20 h-20 text-xl"
                : "w-16 h-16 text-sm";
              const textSize = isFirst ? "text-xl" : "text-base";

              return (
                <div key={student.rank} className="flex flex-col items-center">
                  <div className="relative mb-3">
                    <div
                      className={`${avatarSize} rounded-[20px] bg-[#1e1b26] text-white border-2 border-[#1e1b26] flex items-center justify-center font-bold ${isFirst ? "shadow-[4px_4px_0px_#f04e7c]" : "shadow-[3px_3px_0px_#eae5d9]"}`}
                    >
                      {student.initials}
                    </div>
                    {isFirst && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Crown className="w-7 h-7 text-[#fbc13a] fill-[#fbc13a]" />
                      </div>
                    )}
                  </div>
                  <span className={`font-[Outfit] font-bold ${textSize} mb-1`}>
                    {student.name.split(" ")[0]}
                  </span>
                  <span className="text-sm font-bold text-[#f04e7c]">
                    {student.points.toLocaleString()} XP
                  </span>
                  <div
                    className={`${height} w-24 sm:w-32 mt-3 border-2 border-[#eae5d9] rounded-t-3xl flex items-start justify-center pt-4 ${
                      isFirst
                        ? "bg-[#fbc13a]/10 border-[#fbc13a]"
                        : i === 0
                          ? "bg-gray-100"
                          : "bg-orange-50 border-orange-200"
                    }`}
                  >
                    <span
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black ${
                        isFirst
                          ? "bg-[#fbc13a] text-[#1e1b26]"
                          : i === 0
                            ? "bg-gray-200 text-gray-600"
                            : "bg-orange-200 text-orange-700"
                      }`}
                    >
                      {student.rank}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Table */}
          <div className="bento-card !rounded-3xl !p-0 overflow-hidden">
            <div className="hidden sm:grid grid-cols-[60px_1fr_140px_100px_100px_100px_60px] gap-4 items-center px-6 py-3 border-b-2 border-[#eae5d9] text-xs font-bold text-[#8f8a9e] uppercase tracking-wider">
              <span>Rank</span>
              <span>Student</span>
              <span>Course</span>
              <span className="text-right">Points</span>
              <span className="text-right">Lessons</span>
              <span className="text-right">Accuracy</span>
              <span className="text-center">Δ</span>
            </div>

            {students.map((student) => (
              <div
                key={student.rank}
                className={`grid grid-cols-[60px_1fr_auto] sm:grid-cols-[60px_1fr_140px_100px_100px_100px_60px] gap-4 items-center px-6 py-4 border-b-2 border-[#eae5d9] last:border-b-0 transition-all ${
                  student.isCurrentUser
                    ? "bg-[#ffd6e4] border-l-4 border-l-[#f04e7c]"
                    : "hover:bg-[#f7f5f0]"
                }`}
              >
                <div className="flex items-center justify-center">
                  {student.rank <= 3 ? (
                    <Crown
                      className={`w-5 h-5 ${student.rank === 1 ? "text-[#fbc13a] fill-[#fbc13a]" : student.rank === 2 ? "text-gray-400 fill-gray-400" : "text-orange-400 fill-orange-400"}`}
                    />
                  ) : (
                    <span className="text-sm font-black text-[#5a5566]">
                      {student.rank}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#1e1b26] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {student.initials}
                  </div>
                  <span className="font-semibold text-sm truncate">
                    {student.name}
                    {student.isCurrentUser && (
                      <span className="text-[#f04e7c] text-xs ml-2 font-bold">
                        (You)
                      </span>
                    )}
                  </span>
                </div>
                <span
                  className={`hidden sm:inline-block text-xs font-bold px-2.5 py-1 rounded-full w-fit ${courseColors[student.course]}`}
                >
                  {student.course.split(" ")[0]}
                </span>
                <div className="hidden sm:block text-right text-sm font-black text-[#f04e7c]">
                  {student.points.toLocaleString()}
                </div>
                <div className="hidden sm:block text-right text-sm font-medium text-[#5a5566]">
                  {student.lessons}
                </div>
                <div className="hidden sm:block text-right text-sm font-medium text-[#5a5566]">
                  {student.accuracy}
                </div>
                <div className="hidden sm:flex items-center justify-center">
                  {student.change === "up" && (
                    <ArrowUp className="w-4 h-4 text-[#1e7a4e]" />
                  )}
                  {student.change === "down" && (
                    <ArrowDown className="w-4 h-4 text-[#c0305b]" />
                  )}
                  {student.change === "same" && (
                    <Minus className="w-4 h-4 text-[#8f8a9e]" />
                  )}
                </div>
                <div className="sm:hidden text-right text-sm font-black text-[#f04e7c]">
                  {student.points.toLocaleString()} XP
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
