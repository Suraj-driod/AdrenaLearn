'use client'
import { useState, useEffect } from 'react'
import { 
  BookOpen, Play, ArrowRight, Target, Flag, Code, 
  Briefcase, Database, Globe, Loader2 
} from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from '../components/Sidebar'
import ProtectedRoute from '../components/ProtectedRoute'

import { useAuth } from '../context/AuthContext'
import { fetchUserCourses } from '../../database/courseData'

const iconMap = {
  'ce': Code,
  'mba': Briefcase,
  'ds': Database,
  'web': Globe,
  'default': BookOpen
};

const fallbackCourses = [
  { id: 'ce', name: 'Computer Engineering', lessons: 15, difficulty: 'Beginner', desc: 'Master the fundamentals of programming with Python. From variables to algorithms, build a strong foundation.', progress: 0, started: false, category: 'Computer Engineering', bgColor: 'bg-[#e4f1ff]', iconColor: 'text-[#3b82f6]' },
  { id: 'mba', name: 'MBA Fundamentals', lessons: 12, difficulty: 'Intermediate', desc: 'Learn business analytics and data-driven decision making. Apply coding to real-world business problems.', progress: 0, started: false, category: 'MBA', bgColor: 'bg-[#fff8e7]', iconColor: 'text-[#ea580c]' },
];

const filters = ['All', 'Computer Engineering', 'MBA', 'Data Science']

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } }
}

function CoursesContent() {
  const { user } = useAuth()
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    if (!user) return;

    const loadCourses = async () => {
      try {
        const data = await fetchUserCourses(user.uid);
        setCourses(data.length > 0 ? data : fallbackCourses);
      } catch (err) {
        console.error("Firebase fetch failed, using fallback UI", err);
        setCourses(fallbackCourses);
      } finally {
        setIsLoading(false);
      }
    };

    loadCourses();
  }, [user]);

  const filtered = activeFilter === 'All' ? courses : courses.filter(c => c.category === activeFilter);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f7f5f0] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#f04e7c] animate-spin mb-4" />
        <p className="font-[Outfit] font-bold text-[#1e1b26]">Loading paths...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f5f0]">
      <Sidebar />
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen overflow-x-hidden">
        <motion.div 
          className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div variants={cardVariants} className="mb-8">
            <h1 className="font-[Outfit] text-3xl sm:text-4xl font-black tracking-tight mb-2 text-[#1e1b26]">
              Choose Your <span className="text-[#f04e7c]">Course</span>
            </h1>
            <p className="text-[#5a5566] text-lg font-bold">Select a path and start your learning journey today.</p>
          </motion.div>

          {/* Filters */}
          <motion.div variants={cardVariants} className="flex flex-wrap gap-4 mb-8">
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
          </motion.div>

          {/* Course Grid */}
          <motion.div layout className="grid md:grid-cols-2 gap-6">
            <AnimatePresence mode='popLayout'>
              {filtered.map((course) => {
                const Icon = iconMap[course.id] || iconMap['default'];
                // Build proper lesson link - use first lesson from courseLessons if available
                const firstLessonId = course.courseLessons?.[0] || 'lesson-1';
                
                return (
                  <motion.div 
                    layout
                    key={course.id} 
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`${course.bgColor} p-6 sm:p-8 rounded-[32px] border-2 border-[#1e1b26] shadow-[4px_4px_0px_#1e1b26] transition-all hover:shadow-[8px_8px_0px_#1e1b26] hover:-translate-x-1 hover:-translate-y-1 group flex flex-col justify-between`}
                  >
                    <div className="flex items-start gap-5 mb-6">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[24px] bg-white border-2 border-[#1e1b26] shadow-[4px_4px_0px_#1e1b26] flex items-center justify-center shrink-0 group-hover:-translate-y-1 transition-all duration-300">
                        <Icon className={`w-8 h-8 sm:w-10 sm:h-10 stroke-[2.5] ${course.iconColor}`} />
                      </div>

                      <div className="flex-1 min-w-0 pt-1">
                        <h3 className="font-[Outfit] text-xl sm:text-2xl font-black text-[#1e1b26] mb-3 leading-tight tracking-tight">
                          {course.name}
                        </h3>

                        <div className="flex flex-wrap items-center gap-3">
                          <span className="inline-flex items-center gap-2 bg-white border-2 border-[#1e1b26] px-3 py-1.5 rounded-xl shadow-[2px_2px_0px_#1e1b26] text-[#1e1b26] text-xs font-black">
                            <BookOpen className="w-4 h-4 stroke-[2.5] text-[#f04e7c]" />
                            {course.lessons} lessons
                          </span>
                          <span className={`text-xs font-black px-3 py-1.5 rounded-xl border-2 border-[#1e1b26] shadow-[2px_2px_0px_#1e1b26] ${course.difficulty === 'Beginner' ? 'bg-[#d4f0e0] text-[#1e7a4e]' : 'bg-[#fff3c4] text-[#d97706]'}`}>
                            {course.difficulty}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-[#1e1b26]/80 font-medium text-sm leading-relaxed mb-6">
                      {course.desc}
                    </p>

                    {(course.started || course.progress > 0) && (
                      <div className="mb-6 pt-2">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3 bg-white/60 px-3 py-1 rounded-full border-2 border-[#1e1b26]">
                            <span className="text-[#1e1b26] font-black text-xs tracking-wide uppercase">Progress: {course.progress}%</span>
                          </div>
                        </div>

                        <div className="relative h-4 bg-white border-2 border-[#1e1b26] rounded-full w-full flex items-center shadow-[3px_3px_0px_#1e1b26]">
                          <div
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#f04e7c] to-[#fbc13a] rounded-full border-r-2 border-[#1e1b26]"
                            style={{ width: `${course.progress}%` }}
                          />
                          <div className="absolute left-0 -translate-x-2 w-9 h-9 bg-[#f04e7c] border-2 border-[#1e1b26] rounded-full flex items-center justify-center z-10 shadow-[2px_2px_0px_#1e1b26]">
                            <Target className="w-5 h-5 text-white stroke-[3]" />
                          </div>
                          <div
                            className="absolute w-9 h-9 bg-[#fbc13a] border-2 border-[#1e1b26] rounded-full flex items-center justify-center z-10 transition-all duration-500 shadow-[2px_2px_0px_#1e1b26]"
                            style={{ left: `${course.progress}%`, transform: 'translateX(-50%)' }}
                          >
                            <Flag className="w-5 h-5 text-[#1e1b26] stroke-[3]" />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className={!course.started ? "mt-auto pt-6" : ""}>
                      <Link href={`/courses/${course.id}/${firstLessonId}`}
                        className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-full text-sm font-black border-2 border-[#1e1b26] transition-all ${course.started
                          ? 'bg-[#f04e7c] text-white shadow-[4px_4px_0px_#1e1b26] hover:shadow-[6px_6px_0px_#1e1b26] hover:-translate-x-1 hover:-translate-y-1'
                          : 'bg-white text-[#1e1b26] shadow-[4px_4px_0px_#1e1b26] hover:bg-[#fbc13a] hover:shadow-[6px_6px_0px_#1e1b26] hover:-translate-x-1 hover:-translate-y-1'
                          }`}
                      >
                        {course.started ? (
                          <>
                            <Play className="w-5 h-5 fill-current" /> Continue Learning
                          </>
                        ) : (
                          <>
                            Start Course <ArrowRight className="w-5 h-5 stroke-[3]" />
                          </>
                        )}
                      </Link>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}

export default function CoursesPage() {
  return (
    <ProtectedRoute>
      <CoursesContent />
    </ProtectedRoute>
  )
}