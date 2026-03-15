"use client";
import {
  ChevronRight,
  Clock,
  BookOpen,
  Gamepad2,
  Code2,
  Variable,
  Type,
  Hash,
  Edit3,
} from "lucide-react";
import Link from "next/link";

const concepts = [
  { icon: <Variable className="w-5 h-5 text-[#f04e7c]" />, name: "Variables" },
  { icon: <Type className="w-5 h-5 text-[#fbc13a]" />, name: "Data Types" },
  { icon: <Edit3 className="w-5 h-5 text-[#7c3aed]" />, name: "Assignment Operator" },
  { icon: <Hash className="w-5 h-5 text-[#1e7a4e]" />, name: "Naming Rules" },
];

const chapters = [
  { time: "0:00", title: "Introduction to Variables" },
  { time: "2:15", title: "What is a Variable?" },
  { time: "5:30", title: "Data Types in Python" },
  { time: "8:45", title: "Assignment Operator" },
  { time: "11:20", title: "Variable Naming Rules" },
  { time: "14:00", title: "Summary & Next Steps" },
];

export default function LessonPage() {
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
          <span className="text-[#5a5566] font-semibold">
            Computer Engineering
          </span>
          <ChevronRight className="w-4 h-4 text-[#8f8a9e]" />
          <span className="font-bold text-[#1e1b26]">Lesson 1</span>
        </nav>

        <div className="grid lg:grid-cols-[1fr_380px] gap-8">
          {/* Left */}
          <div className="space-y-6">
            <div className="aspect-video bg-white rounded-[32px] border-2 border-[#eae5d9] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/kqtD5dpn9C8"
                title="Variables in Python"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-[#ffd6e4] text-[#f04e7c] text-xs font-bold px-3 py-1 rounded-full border border-[#f04e7c]/20">
                  Lesson 1
                </span>
                <span className="flex items-center gap-1 text-[#5a5566] text-xs font-medium">
                  <Clock className="w-3.5 h-3.5" /> 15 min
                </span>
              </div>
              <h1 className="font-[Outfit] text-2xl sm:text-3xl font-black tracking-tight">
                Variables in Python
              </h1>
            </div>

            {/* Chapters */}
            <div className="bento-card !rounded-3xl">
              <h3 className="font-[Outfit] font-bold mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#f04e7c]" /> Chapter Markers
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

            {/* Code Summary */}
            <div className="bento-card !rounded-3xl">
              <h3 className="font-[Outfit] font-bold mb-4 flex items-center gap-2">
                <Code2 className="w-5 h-5 text-[#7c3aed]" /> Concept Summary
              </h3>
              <p className="text-[#5a5566] text-sm leading-relaxed mb-4">
                Variables in Python are containers for storing data values.
                Unlike other languages, Python has no command for declaring a
                variable — one is created the moment you first assign a value.
              </p>
              <div className="bg-[#1e1b26] rounded-2xl overflow-hidden border-2 border-[#1e1b26]">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-[#2a2636]">
                  <div className="w-3 h-3 rounded-full bg-[#f04e7c]" />
                  <div className="w-3 h-3 rounded-full bg-[#fbc13a]" />
                  <div className="w-3 h-3 rounded-full bg-[#4ade80]" />
                  <span className="text-xs text-[#8f8a9e] ml-2">
                    variables.py
                  </span>
                </div>
                <pre className="p-5 text-sm overflow-x-auto">
                  <code className="text-gray-300">
                    {`# Creating variables
`}
                    <span className="text-[#f04e7c]">name</span>
                    {` = `}
                    <span className="text-[#4ade80]">
                      &quot;adrenalearn&quot;
                    </span>
                    {`     `}
                    <span className="text-[#8f8a9e]"># string</span>
                    {`
`}
                    <span className="text-[#f04e7c]">age</span>
                    {` = `}
                    <span className="text-[#fbc13a]">21</span>
                    {`                 `}
                    <span className="text-[#8f8a9e]"># integer</span>
                    {`
`}
                    <span className="text-[#f04e7c]">score</span>
                    {` = `}
                    <span className="text-[#fbc13a]">98.5</span>
                    {`             `}
                    <span className="text-[#8f8a9e]"># float</span>
                    {`
`}
                    <span className="text-[#f04e7c]">is_active</span>
                    {` = `}
                    <span className="text-[#fbc13a]">True</span>
                    {`         `}
                    <span className="text-[#8f8a9e]"># boolean</span>
                    {`

`}
                    <span className="text-[#8f8a9e]"># Using variables</span>
                    {`
`}
                    <span className="text-[#f04e7c]">print</span>
                    {`(`}
                    <span className="text-[#4ade80]">f&quot;Welcome, </span>
                    <span className="text-[#fbc13a]">{`{name}`}</span>
                    <span className="text-[#4ade80]">!&quot;</span>
                    {`)
`}
                    <span className="text-[#f04e7c]">print</span>
                    {`(`}
                    <span className="text-[#4ade80]">f&quot;Your score: </span>
                    <span className="text-[#fbc13a]">{`{score}`}</span>
                    <span className="text-[#4ade80]">&quot;</span>
                    {`)`}
                  </code>
                </pre>
              </div>
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
                  <Clock className="w-4 h-4" /> Estimated read time:{" "}
                  <span className="font-bold text-[#1e1b26]">15 min</span>
                </div>
                <h4 className="text-sm font-bold mb-3">Key Concepts</h4>
                <div className="space-y-2 mb-6">
                  {concepts.map((c, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 bg-[#f7f5f0] rounded-2xl border-2 border-[#eae5d9]"
                    >
                      <span>{c.icon}</span>
                      <span className="text-sm font-semibold">{c.name}</span>
                    </div>
                  ))}
                </div>
                <Link
                  href="/courses/ce/lesson-1/play"
                  className="btn-brutal w-full text-center"
                >
                  <Gamepad2 className="w-5 h-5 inline mr-1" /> Start Game Challenge
                </Link>
              </div>
              <Link
                href="/courses"
                className="block text-center text-sm text-[#5a5566] hover:text-[#f04e7c] font-semibold transition-colors"
              >
                ← Back to Courses
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
