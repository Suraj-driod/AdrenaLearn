'use client'

import { useState, useEffect, use } from 'react'
import {
  BookOpen, Play, ChevronRight, Clock, ArrowLeft,
  Loader2, CheckCircle2, Gamepad2, Lock
} from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Sidebar from '../../components/Sidebar'
import ProtectedRoute from '../../components/ProtectedRoute'
import { useAuth } from '../../context/AuthContext'
import { db } from '../../../backend/firebase'
import { doc, getDoc, collection, getDocs } from 'firebase/firestore'
import { seedCELessons } from '../../../database/seedLessons'
import { registerForCourse } from '../../../database/courseData'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
}

function CourseDetailContent({ params }) {
  const { courseId } = params
  const { user } = useAuth()
  const [course, setCourse] = useState(null)
  const [lessons, setLessons] = useState([])
  const [completedLessons, setCompletedLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [enrolling, setEnrolling] = useState(false)

  useEffect(() => {
    if (!user) return

    const loadCourseData = async () => {
      try {
        // Fetch course
        const courseSnap = await getDoc(doc(db, 'courses', courseId))
        if (!courseSnap.exists()) {
          setLoading(false)
          return
        }

        const courseData = { id: courseSnap.id, ...courseSnap.data() }
        setCourse(courseData)

        // Fetch all lessons for this course
        const lessonIds = courseData.courseLessons || []
        const lessonDocs = await Promise.all(
          lessonIds.map(id => getDoc(doc(db, 'lessons', id)))
        )

        const lessonList = lessonDocs
          .filter(snap => snap.exists())
          .map(snap => ({ id: snap.id, ...snap.data() }))

        setLessons(lessonList)

        // Fetch user doc to check registration
        const userSnap = await getDoc(doc(db, 'users', user.uid))
        if (userSnap.exists()) {
          const userData = userSnap.data()
          const userCourses = userData.userCourses || []
          setIsRegistered(userCourses.some(c => c.courseId === courseId))
        }

        // Fetch user's completed lessons for this course
        const progressSnap = await getDocs(collection(db, `users/${user.uid}/lessonProgress`))
        const completed = progressSnap.docs
          .filter(d => d.data().status === 'completed' && d.data().courseId === courseId)
          .map(d => d.data().lessonId)

        setCompletedLessons(completed)
      } catch (err) {
        console.error('Error loading course:', err)
      } finally {
        setLoading(false)
      }
    }

    loadCourseData()
  }, [user, courseId])

  const handleSeedLessons = async () => {
    setSeeding(true)
    try {
      await seedCELessons()
      window.location.reload()
    } catch (err) {
      console.error('Seed failed:', err)
      setSeeding(false)
    }
  }

  const handleEnroll = async () => {
    if (!user || enrolling) return
    setEnrolling(true)
    try {
      await registerForCourse(user.uid, courseId)
      setIsRegistered(true)
    } catch (err) {
      console.error('Enrollment failed:', err)
    } finally {
      setEnrolling(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f5f0] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#f04e7c] animate-spin mb-4" />
        <p className="font-[Outfit] font-bold text-[#1e1b26]">Loading course...</p>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#f7f5f0]">
        <Sidebar />
        <main className="lg:ml-56 pt-16 lg:pt-0 min-h-screen">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
            <h1 className="font-[Outfit] text-3xl font-black text-[#1e1b26] mb-4">Course Not Found</h1>
            <p className="text-[#5a5566] font-bold mb-6">This course doesn&apos;t exist yet or has no data.</p>

            {courseId === 'ce' && (
              <button
                onClick={handleSeedLessons}
                disabled={seeding}
                className="bg-[#f04e7c] text-white font-black px-8 py-4 rounded-2xl border-2 border-[#1e1b26] shadow-[4px_4px_0px_#1e1b26] hover:shadow-[6px_6px_0px_#1e1b26] hover:-translate-y-1 hover:-translate-x-1 transition-all disabled:opacity-50"
              >
                {seeding ? 'Seeding...' : '🌱 Seed CE Course Data'}
              </button>
            )}

            <div className="mt-6">
              <Link href="/courses" className="text-[#f04e7c] font-bold hover:text-[#1e1b26] transition-colors">
                ← Back to Courses
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const progress = lessons.length > 0
    ? Math.round((completedLessons.length / lessons.length) * 100)
    : 0

  return (
    <div className="min-h-screen bg-[#f7f5f0]">
      <Sidebar />
      <main className="lg:ml-56 pt-16 lg:pt-0 min-h-screen overflow-x-hidden">
        <motion.div
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Breadcrumb */}
          <motion.nav variants={itemVariants} className="flex items-center gap-2 text-sm mb-8">
            <Link href="/courses" className="text-[#5a5566] hover:text-[#f04e7c] font-semibold transition-colors">
              Courses
            </Link>
            <ChevronRight className="w-4 h-4 text-[#8f8a9e]" />
            <span className="font-bold text-[#1e1b26]">{course.courseName}</span>
          </motion.nav>

          {/* Course Header */}
          <motion.div variants={itemVariants} className="bg-[#262333] text-white rounded-[32px] p-6 sm:p-8 mb-8 border-2 border-[#1e1b26] shadow-[8px_8px_0px_#f04e7c]">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="bg-[#fbc13a] text-[#1e1b26] text-xs font-black px-4 py-1.5 rounded-full border-2 border-[#1e1b26] uppercase tracking-wider">
                {course.difficulty || 'Beginner'}
              </span>
              <span className="flex items-center gap-1 text-[#a19db0] text-xs font-bold">
                <Clock className="w-3.5 h-3.5" /> {course.estimatedDuration || '~1 hr'}
              </span>
              <span className="flex items-center gap-1 text-[#a19db0] text-xs font-bold">
                <BookOpen className="w-3.5 h-3.5" /> {lessons.length} lessons
              </span>
              {isRegistered && (
                <span className="flex items-center gap-1.5 bg-[#d4f0e0] text-[#1e7a4e] text-xs font-black px-3 py-1.5 rounded-full border-2 border-[#1e7a4e]/30">
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" /> Enrolled
                </span>
              )}
            </div>
            <h1 className="font-[Outfit] text-3xl sm:text-4xl font-black !text-white mb-3 tracking-tight">
              {course.courseName}
            </h1>
            <p className="text-[#a19db0] text-sm sm:text-base font-medium max-w-xl leading-relaxed">
              {course.courseDesc}
            </p>

            {/* Registration CTA */}
            {!isRegistered && (
              <div className="mt-6 bg-[#3a3545] rounded-2xl p-5 border border-[#4a4555]">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-white font-black text-sm mb-1">Ready to start learning?</h3>
                    <p className="text-[#a19db0] text-xs font-medium">Register to track your progress and unlock game challenges.</p>
                  </div>
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="shrink-0 bg-[#fbc13a] text-[#1e1b26] font-black px-6 py-3 rounded-full border-2 border-[#1e1b26] shadow-[4px_4px_0px_#1e1b26] hover:shadow-[6px_6px_0px_#1e1b26] hover:-translate-x-1 hover:-translate-y-1 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {enrolling ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Enrolling...</>
                    ) : (
                      <><CheckCircle2 className="w-5 h-5 stroke-[2.5]" /> Register for Course</>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Progress Bar */}
            {isRegistered && progress > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between text-xs font-bold text-[#a19db0] mb-2">
                  <span>Progress</span>
                  <span>{progress}% Complete</span>
                </div>
                <div className="h-3 bg-[#3a3545] rounded-full border border-[#4a4555] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#f04e7c] to-[#fbc13a] rounded-full transition-all duration-700"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </motion.div>

          {/* Lessons List */}
          <motion.div variants={itemVariants} className="mb-4">
            <h2 className="font-[Outfit] text-xl font-black text-[#1e1b26] mb-1">Course Lessons</h2>
            <p className="text-[#5a5566] text-sm font-medium">Complete each lesson and test your knowledge with games.</p>
          </motion.div>

          <div className="space-y-4">
            {lessons.map((lesson, index) => {
              const isCompleted = completedLessons.includes(lesson.id)
              return (
                <motion.div key={lesson.id} variants={itemVariants}>
                  <Link href={`/courses/${courseId}/${lesson.id}`}>
                    <div className={`bg-white p-5 sm:p-6 rounded-[24px] border-2 border-[#1e1b26] shadow-[4px_4px_0px_#1e1b26] hover:shadow-[6px_6px_0px_#1e1b26] hover:-translate-y-0.5 hover:-translate-x-0.5 transition-all group cursor-pointer ${isCompleted ? 'bg-[#d4f0e0]/30' : ''}`}>
                      <div className="flex items-center gap-4">
                        {/* Lesson Number */}
                        <div className={`w-12 h-12 rounded-2xl border-2 border-[#1e1b26] shadow-[2px_2px_0px_#1e1b26] flex items-center justify-center shrink-0 font-[Outfit] font-black text-lg transition-colors ${isCompleted
                          ? 'bg-[#d4f0e0] text-[#1e7a4e]'
                          : 'bg-[#e4f1ff] text-[#3b82f6] group-hover:bg-[#fbc13a] group-hover:text-[#1e1b26]'
                          }`}>
                          {isCompleted ? <CheckCircle2 className="w-6 h-6 stroke-[2.5]" /> : index + 1}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-[Outfit] text-lg font-black text-[#1e1b26] tracking-tight leading-tight mb-1">
                            {lesson.lessonName}
                          </h3>
                          <p className="text-[#5a5566] text-xs font-medium line-clamp-1">
                            {lesson.lessonDesc}
                          </p>
                        </div>

                        {/* Meta */}
                        <div className="hidden sm:flex items-center gap-3 shrink-0">
                          <span className="flex items-center gap-1 text-[#5a5566] text-xs font-bold bg-[#f7f5f0] px-3 py-1.5 rounded-xl border border-[#eae5d9]">
                            <Clock className="w-3.5 h-3.5" /> {lesson.lessonDuration || '15 min'}
                          </span>
                          <ChevronRight className="w-5 h-5 text-[#8f8a9e] group-hover:text-[#f04e7c] transition-colors" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>

          {/* Empty state if no lessons */}
          {lessons.length === 0 && (
            <motion.div variants={itemVariants} className="text-center py-12 bg-white rounded-[24px] border-2 border-dashed border-[#eae5d9]">
              <p className="text-[#5a5566] font-bold mb-4">No lessons found for this course.</p>
              {courseId === 'ce' && (
                <button
                  onClick={handleSeedLessons}
                  disabled={seeding}
                  className="bg-[#f04e7c] text-white font-black px-6 py-3 rounded-xl border-2 border-[#1e1b26] shadow-[3px_3px_0px_#1e1b26] hover:shadow-[5px_5px_0px_#1e1b26] transition-all disabled:opacity-50"
                >
                  {seeding ? 'Seeding...' : '🌱 Seed CE Lessons'}
                </button>
              )}
            </motion.div>
          )}

          {/* Back link */}
          <motion.div variants={itemVariants} className="text-center mt-8">
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 text-sm text-[#5a5566] hover:text-[#f04e7c] font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Courses
            </Link>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}

export default function CourseDetailPage({ params }) {
  const resolvedParams = use(params)

  return (
    <ProtectedRoute>
      <CourseDetailContent params={resolvedParams} />
    </ProtectedRoute>
  )
}
