"use client";
import { useState, useEffect, use, useRef } from 'react'
import {
  ChevronRight,
  Clock,
  BookOpen,
  Loader2,
  Gamepad2,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import ProtectedRoute from '../../../components/ProtectedRoute'
import { useAuth } from '../../../context/AuthContext'
import { db } from '../../../../backend/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { markLessonCompleted } from '../../../../database/courseData'

function LessonContent({ params }) {
  const { courseId, lessonId } = params
  const { user } = useAuth()
  const [lesson, setLesson] = useState(null)
  const [courseName, setCourseName] = useState('')
  const [nextLessonId, setNextLessonId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [videoClicked, setVideoClicked] = useState(false)
  const [markedDone, setMarkedDone] = useState(false)
  const overlayRef = useRef(null)

  useEffect(() => {
    const loadLesson = async () => {
      try {
        // Fetch lesson data
        const lessonSnap = await getDoc(doc(db, 'lessons', lessonId))
        if (lessonSnap.exists()) {
          setLesson({ id: lessonSnap.id, ...lessonSnap.data() })
        }

        // Fetch course name and next lesson
        const courseSnap = await getDoc(doc(db, 'courses', courseId))
        if (courseSnap.exists()) {
          const courseData = courseSnap.data()
          setCourseName(courseData.courseName)
          // Find next lesson in the array
          const lessonList = courseData.courseLessons || []
          const currentIndex = lessonList.indexOf(lessonId)
          if (currentIndex !== -1 && currentIndex < lessonList.length - 1) {
            setNextLessonId(lessonList[currentIndex + 1])
          }
        }

        // Check if lesson is already completed
        if (user) {
          const progressSnap = await getDoc(doc(db, `users/${user.uid}/lessonProgress`, `${courseId}_${lessonId}`))
          if (progressSnap.exists() && progressSnap.data().status === 'completed') {
            setMarkedDone(true)
            setVideoClicked(true)
          }
        }
      } catch (err) {
        console.error('Error loading lesson:', err)
      } finally {
        setLoading(false)
      }
    }

    loadLesson()
  }, [courseId, lessonId, user])

  const handleVideoClick = async () => {
    if (videoClicked || !user) return
    setVideoClicked(true)

    try {
      await markLessonCompleted(user.uid, courseId, lessonId)
      setMarkedDone(true)
      // Auto-hide the toast after 4 seconds
      setTimeout(() => {
        const toast = document.getElementById('lesson-toast')
        if (toast) toast.style.opacity = '0'
      }, 4000)
    } catch (err) {
      console.error('Error marking lesson complete:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f5f0] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#f04e7c] animate-spin mb-4" />
        <p className="font-[Outfit] font-bold text-[#1e1b26]">Loading lesson...</p>
      </div>
    )
  }

  // Fallback if lesson not found in Firestore
  if (!lesson) {
    return (
      <main className="min-h-screen bg-[#f7f5f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <nav className="flex items-center gap-2 text-sm mb-6">
            <Link href="/courses" className="text-[#5a5566] hover:text-[#f04e7c] font-semibold transition-colors">Courses</Link>
            <ChevronRight className="w-4 h-4 text-[#8f8a9e]" />
            <span className="font-bold text-[#1e1b26]">Lesson Not Found</span>
          </nav>
          <div className="bento-card !rounded-3xl text-center py-12">
            <p className="text-[#5a5566] text-lg font-bold mb-4">This lesson doesn&apos;t exist yet.</p>
            <Link href="/courses" className="btn-brutal">← Back to Courses</Link>
          </div>
        </div>
      </main>
    )
  }

  const concepts = (lesson.concepts || []).map((name, i) => {
    const icons = ["🔤", "📦", "✏️", "#️⃣", "🔁", "⚡", "📊", "🧩"]
    return { icon: icons[i % icons.length], name }
  })

  const chapters = lesson.chapters || []
  const lessonNumber = lessonId.split('-').pop() || '1'

  return (
    <main className="min-h-screen bg-[#f7f5f0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-6">
          <Link
            href="/courses"
            className="text-[#5a5566] hover:text-[#f04e7c] font-semibold transition-colors"
          >
            Courses
          </Link>
          <ChevronRight className="w-4 h-4 text-[#8f8a9e]" />
          <Link
            href={`/courses/${courseId}`}
            className="text-[#5a5566] hover:text-[#f04e7c] font-semibold transition-colors"
          >
            {courseName || courseId}
          </Link>
          <ChevronRight className="w-4 h-4 text-[#8f8a9e]" />
          <span className="font-bold text-[#1e1b26]">Lesson {lessonNumber}</span>
        </nav>

        {/* Watched Toast */}
        {markedDone && !videoClicked && (
          <div id="lesson-toast" className="fixed top-6 right-6 z-50 bg-[#d4f0e0] border-2 border-[#1e7a4e]/30 rounded-2xl px-5 py-3 shadow-lg flex items-center gap-3 transition-opacity duration-500">
            <CheckCircle2 className="w-5 h-5 text-[#1e7a4e] stroke-[2.5]" />
            <span className="text-[#1e7a4e] font-black text-sm">Lesson marked as watched!</span>
          </div>
        )}

        <div className="grid lg:grid-cols-[1fr_380px] gap-8">
          {/* Left */}
          <div className="space-y-6">
            <div className="aspect-video bg-white rounded-[32px] border-2 border-[#eae5d9] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.04)] relative">
              {/* Clickable overlay to detect first play */}
              {!videoClicked && (
                <div
                  ref={overlayRef}
                  onClick={handleVideoClick}
                  className="absolute inset-0 z-10 cursor-pointer"
                  style={{ background: 'transparent' }}
                />
              )}
              <iframe
                className="w-full h-full"
                src={lesson.lessonLink || "https://www.youtube.com/embed/kqtD5dpn9C8"}
                title={lesson.lessonName}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-[#ffd6e4] text-[#f04e7c] text-xs font-bold px-3 py-1 rounded-full border border-[#f04e7c]/20">
                  Lesson {lessonNumber}
                </span>
                <span className="flex items-center gap-1 text-[#5a5566] text-xs font-medium">
                  <Clock className="w-3.5 h-3.5" /> {lesson.lessonDuration || '15 min'}
                </span>
                {markedDone && (
                  <span className="inline-flex items-center gap-1.5 bg-[#d4f0e0] text-[#1e7a4e] text-xs font-black px-3 py-1 rounded-full border border-[#1e7a4e]/20">
                    <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" /> Watched
                  </span>
                )}
              </div>
              <h1 className="font-[Outfit] text-2xl sm:text-3xl font-black tracking-tight">
                {lesson.lessonName}
              </h1>
            </div>

            {/* Chapters */}
            {chapters.length > 0 && (
              <div className="bento-card !rounded-3xl">
                <h3 className="font-[Outfit] font-bold mb-4 flex items-center gap-2">
                  📚 Chapter Markers
                </h3>
                <div className="space-y-2">
                  {chapters.map((ch, i) => (
                    <button
                      key={i}
                      className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-[#f7f5f0] transition-all text-left group border-2 border-transparent hover:border-[#eae5d9]"
                    >
                      <span className="text-xs font-mono text-[#f04e7c] bg-[#ffd6e4] px-2.5 py-1 rounded-lg font-bold">
                        {ch.time}
                      </span>
                      <span className="text-sm text-[#5a5566] group-hover:text-[#1e1b26] font-medium transition-colors">
                        {ch.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="bento-card !rounded-3xl">
              <h3 className="font-[Outfit] font-bold mb-4 flex items-center gap-2">
                🧩 About This Lesson
              </h3>
              <p className="text-[#5a5566] text-sm leading-relaxed">
                {lesson.lessonDesc}
              </p>
            </div>
          </div>

          {/* Right Sidebar */}
          <div>
            <div className="lg:sticky lg:top-6 space-y-6">
              <div className="bento-card !rounded-3xl">
                <h3 className="font-[Outfit] font-bold mb-4">
                  Lesson Overview
                </h3>
                <div className="flex items-center gap-2 text-sm text-[#5a5566] mb-6">
                  <Clock className="w-4 h-4" /> Estimated time:{" "}
                  <span className="font-bold text-[#1e1b26]">{lesson.lessonDuration || '15 min'}</span>
                </div>
                {concepts.length > 0 && (
                  <>
                    <h4 className="text-sm font-bold mb-3">Key Concepts</h4>
                    <div className="space-y-2 mb-6">
                      {concepts.map((c, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-3 bg-[#f7f5f0] rounded-2xl border-2 border-[#eae5d9]"
                        >
                          <span className="text-xl">{c.icon}</span>
                          <span className="text-sm font-semibold">{c.name}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                <Link
                  href={`/courses/${courseId}/${lessonId}/play`}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full text-sm font-black border-2 border-[#1e1b26] bg-[#f04e7c] text-white shadow-[4px_4px_0px_#1e1b26] hover:shadow-[6px_6px_0px_#1e1b26] hover:-translate-x-1 hover:-translate-y-1 transition-all"
                >
                  <Gamepad2 className="w-5 h-5" /> Start Game Challenge
                </Link>

                {nextLessonId && (
                  <Link
                    href={`/courses/${courseId}/${nextLessonId}`}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-sm font-bold border-2 border-[#1e1b26] bg-[#fbc13a] text-[#1e1b26] shadow-[3px_3px_0px_#1e1b26] hover:shadow-[5px_5px_0px_#1e1b26] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all mt-3"
                  >
                    Next Lesson <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </Link>
                )}
              </div>
              <Link
                href={`/courses/${courseId}`}
                className="block text-center text-sm text-[#5a5566] hover:text-[#f04e7c] font-semibold transition-colors"
              >
                ← Back to Course
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Toast for first-time marking */}
      {markedDone && videoClicked && (
        <div id="lesson-toast" className="fixed bottom-6 right-6 z-50 bg-[#d4f0e0] border-2 border-[#1e7a4e]/30 rounded-2xl px-5 py-3 shadow-lg flex items-center gap-3 transition-opacity duration-500 animate-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-5 h-5 text-[#1e7a4e] stroke-[2.5]" />
          <span className="text-[#1e7a4e] font-black text-sm">Lesson marked as watched!</span>
        </div>
      )}
    </main>
  );
}

export default function LessonPage({ params }) {
  // In Next.js 15, params is a Promise - unwrap it
  const resolvedParams = use(params)

  return (
    <ProtectedRoute>
      <LessonContent params={resolvedParams} />
    </ProtectedRoute>
  )
}
