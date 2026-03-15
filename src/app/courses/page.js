'use client'
import { useState } from 'react'
import { BookOpen, Play, ArrowRight, Monitor, Briefcase, Database, Globe, Target, Flag } from 'lucide-react'
import Link from 'next/link'
import Sidebar from '../components/Sidebar'

const courses = [
  { id: 'ce', name: 'Computer Engineering', icon: '💻', lessons: 15, difficulty: 'Beginner', desc: 'Master the fundamentals of programming with Python. From variables to algorithms, build a strong foundation.', progress: 47, started: true, category: 'Computer Engineering', bgColor: 'bg-[#e4f1ff]' },
  { id: 'mba', name: 'MBA Fundamentals', icon: '📊', lessons: 12, difficulty: 'Intermediate', desc: 'Learn business analytics and data-driven decision making. Apply coding to real-world business problems.', progress: 25, started: true, category: 'MBA', bgColor: 'bg-[#fff8e7]' },
  { id: 'ds', name: 'Data Science Basics', icon: '🧬', lessons: 10, difficulty: 'Beginner', desc: 'Dive into data analysis, visualization, and machine learning fundamentals.', progress: 0, started: false, category: 'Data Science', bgColor: 'bg-[#ede4ff]' },
  { id: 'web', name: 'Web Development', icon: '🌐', lessons: 18, difficulty: 'Intermediate', desc: 'Build modern web applications from scratch. HTML, CSS, JavaScript, React, and beyond.', progress: 0, started: false, category: 'Computer Engineering', bgColor: 'bg-[#d4f0e0]' },
]

const filters = ['All', 'Computer Engineering', 'MBA', 'Data Science']

export default function CoursesPage() {
  const [activeFilter, setActiveFilter] = useState('All')
  const filtered = activeFilter === 'All' ? courses : courses.filter(c => c.category === activeFilter)

  return (
    <div className="min-h-screen bg-[#f7f5f0]">
      <Sidebar />
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">

          {/* Header */}
          <div className="mb-8">
            <h1 className="font-[Outfit] text-3xl sm:text-4xl font-black tracking-tight mb-2 text-[#1e1b26]">
              Choose Your <span className="text-[#f04e7c]">Course</span>
            </h1>
            <p className="text-[#5a5566] text-lg font-bold">Select a path and start your learning journey today.</p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-8">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-6 py-2.5 rounded-2xl text-sm font-black border-2 border-[#1e1b26] transition-all duration-200 ${activeFilter === filter
                  ? 'bg-[#f04e7c] text-white shadow-[4px_4px_0px_#1e1b26] -translate-y-1 -translate-x-1'
                  : 'bg-white text-[#1e1b26] hover:shadow-[4px_4px_0px_#1e1b26] hover:-translate-y-0.5'
                  }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Course Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {filtered.map((course) => (
              <div key={course.id} className={`${course.bgColor} p-6 sm:p-8 rounded-[32px] border-2 border-[#1e1b26] shadow-[4px_4px_0px_#1e1b26] transition-all hover:shadow-[8px_8px_0px_#1e1b26] hover:-translate-x-1 hover:-translate-y-1 group flex flex-col justify-between`}>

                {/* Card Header */}
                <div className="flex items-start gap-5 mb-6">
                  {/* Icon Container - Tactile Shadow & Border */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[24px] bg-white border-2 border-[#1e1b26] shadow-[4px_4px_0px_#1e1b26] flex items-center justify-center text-3xl sm:text-4xl shrink-0 group-hover:-translate-y-1 transition-all duration-300">
                    {course.icon}
                  </div>

                  <div className="flex-1 min-w-0 pt-1">
                    {/* Course Title */}
                    <h3 className="font-[Outfit] text-xl sm:text-2xl font-black text-[#1e1b26] mb-3 leading-tight tracking-tight">
                      {course.name}
                    </h3>

                    {/* Badges Row */}
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Lessons Badge */}
                      <span className="inline-flex items-center gap-2 bg-white border-2 border-[#1e1b26] px-3 py-1.5 rounded-xl shadow-[3px_3px_0px_#1e1b26] text-[#1e1b26] text-xs font-black hover:-translate-y-0.5 transition-transform">
                        <BookOpen className="w-4 h-4 stroke-[2.5]" />
                        {course.lessons} lessons
                      </span>

                      {/* Difficulty Badge - Dynamic Colors with Brutalist styling */}
                      <span className={`text-xs font-black px-3 py-1.5 rounded-xl border-2 border-[#1e1b26] shadow-[3px_3px_0px_#1e1b26] hover:-translate-y-0.5 transition-transform ${course.difficulty === 'Beginner'
                        ? 'bg-[#d4f0e0] text-[#1e1b26]'
                        : 'bg-[#fff3c4] text-[#1e1b26]'
                        }`}>
                        {course.difficulty}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-[#1e1b26]/80 font-medium text-sm leading-relaxed mb-6">
                  {course.desc}
                </p>

                {/* Progress Bar (Only if started) */}
                {course.started && (
                  <div className="mb-6 pt-2">

                    {/* Header Labels - Updated for high contrast on light backgrounds */}
                    <div className="flex items-center justify-between mb-4">

                      <div className="flex items-center gap-3 bg-white/50 px-3 py-1 rounded-full border-2 border-[#1e1b26]">
                        <span className="text-[#1e1b26] font-black text-xs tracking-wide">Progress: {course.progress}%</span>
                        <span className="text-[#f04e7c] font-black text-xs tracking-wide">2,450 XP</span>
                      </div>
                    </div>

                    {/* Custom Track - Thick borders and solid shadows */}
                    <div className="relative h-4 bg-white border-2 border-[#1e1b26] rounded-full w-full flex items-center shadow-[3px_3px_0px_#1e1b26]">
                      {/* Gradient Fill */}
                      <div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#f04e7c] to-[#fbc13a] rounded-full border-r-2 border-[#1e1b26]"
                        style={{ width: `${course.progress}%` }}
                      />

                      {/* Start Node (Target) */}
                      <div className="absolute left-0 -translate-x-2 w-9 h-9 bg-[#f04e7c] border-2 border-[#1e1b26] rounded-full flex items-center justify-center z-10 shadow-[2px_2px_0px_#1e1b26] hover:-translate-y-0.5 transition-transform">
                        <Target className="w-5 h-5 text-[#1e1b26] stroke-[3]" />
                      </div>

                      {/* Current Node (Flag) */}
                      <div
                        className="absolute w-9 h-9 bg-[#fbc13a] border-2 border-[#1e1b26] rounded-full flex items-center justify-center z-10 transition-all duration-500 shadow-[2px_2px_0px_#1e1b26] hover:-translate-y-0.5"
                        style={{ left: `${course.progress}%`, transform: 'translateX(-50%)' }}
                      >
                        <Flag className="w-5 h-5 text-[#1e1b26] stroke-[3]" />
                      </div>
                    </div>
                  </div>
                )}
                {/* Action Button */}
                <div className={!course.started ? "mt-auto pt-6" : ""}>
                  <Link href={`/courses/${course.id}/lesson-1`}
                    className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-full text-sm font-black border-2 border-[#1e1b26] transition-all ${course.started
                      ? 'bg-[#f04e7c] text-white shadow-[4px_4px_0px_#1e1b26] hover:shadow-[6px_6px_0px_#1e1b26] hover:-translate-x-1 hover:-translate-y-1'
                      : 'bg-white text-[#1e1b26] shadow-[4px_4px_0px_#1e1b26] hover:bg-[#fbc13a] hover:shadow-[6px_6px_0px_#1e1b26] hover:-translate-x-1 hover:-translate-y-1'
                      }`}
                  >
                    {course.started ? <><Play className="w-5 h-5 fill-current" /> Continue Learning</> : <>Start Course <ArrowRight className="w-5 h-5 stroke-[3]" /></>}
                  </Link>
                </div>

              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}