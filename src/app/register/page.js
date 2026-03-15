'use client'
import { useState } from 'react'
import { Eye, EyeOff, Mail, Lock, User, GraduationCap, Rocket, BookOpen, Gamepad2, Brain, ChevronDown } from 'lucide-react'
import Link from 'next/link'

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [experience, setExperience] = useState('beginner')
  const [agreed, setAgreed] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', course: '' })

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  return (
    <main className="min-h-screen bg-[#f7f5f0] flex relative overflow-hidden">
      {/* Blobs */}
      <div className="blob w-[500px] h-[500px] bg-[#ffd6e4] top-[10%] left-[0%]" />
      <div className="blob w-[400px] h-[400px] bg-[#fff3c4] bottom-[5%] right-[0%]" style={{ animationDelay: '3s' }} />

      {/* Left Branding (hidden mobile) */}
      <div className="hidden lg:flex w-1/2 relative items-center justify-center p-12">
        <div className="relative z-10 max-w-lg animate-slide-up">
          <Link href="/" className="font-[Outfit] text-4xl font-black text-[#1e1b26] inline-block mb-8">adrenalinal</Link>

          <h2 className="font-[Outfit] text-[48px] xl:text-[56px] font-black leading-[1.1] tracking-[-2px] mb-6">
            Learn. Play.<br />
            <span className="text-[#f04e7c]">Conquer.</span>
          </h2>

          <p className="text-lg text-[#5a5566] mb-10 leading-relaxed">
            Join thousands of students mastering code through gamified challenges and AI mentorship.
          </p>

          <div className="space-y-5">
            {[
              { icon: '📖', title: 'Expert-crafted Lessons', desc: 'Bite-sized video content from industry experts' },
              { icon: '🎮', title: '4 Unique Game Modes', desc: 'Spaceship, Subway, Balloon, and Cat Rescue' },
              { icon: '🧠', title: 'AI-Powered Mentorship', desc: 'Kode Sensei gives instant personalized feedback' },
              { icon: '🚀', title: 'Track Progress & Compete', desc: 'XP, streaks, badges, and live leaderboards' },
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-white border-2 border-[#eae5d9] flex items-center justify-center text-2xl shrink-0 group-hover:border-[#f04e7c] transition-colors">
                  {f.icon}
                </div>
                <div>
                  <h4 className="font-bold text-[15px]">{f.title}</h4>
                  <p className="text-[#5a5566] text-sm">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 relative z-10">
        <div className="w-full max-w-[460px] animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="bg-white rounded-[40px] border-2 border-[#eae5d9] p-8 sm:p-10 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
            {/* Mobile logo */}
            <div className="lg:hidden mb-5">
              <Link href="/" className="font-[Outfit] text-2xl font-black">adrenalinal</Link>
            </div>

            <h1 className="font-[Outfit] text-2xl font-bold mb-1">Create Account</h1>
            <p className="text-[#5a5566] text-sm mb-6">Start your coding adventure today</p>

            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8f8a9e]" />
                  <input type="text" value={form.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="John Doe" className="w-full bg-[#f7f5f0] border-2 border-[#eae5d9] text-[#1e1b26] placeholder-[#8f8a9e] rounded-2xl pl-11 pr-4 py-3 text-sm font-medium focus:border-[#f04e7c] focus:outline-none transition-colors" />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8f8a9e]" />
                  <input type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} placeholder="you@example.com" className="w-full bg-[#f7f5f0] border-2 border-[#eae5d9] text-[#1e1b26] placeholder-[#8f8a9e] rounded-2xl pl-11 pr-4 py-3 text-sm font-medium focus:border-[#f04e7c] focus:outline-none transition-colors" />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8f8a9e]" />
                  <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => handleChange('password', e.target.value)} placeholder="Min 8 characters" className="w-full bg-[#f7f5f0] border-2 border-[#eae5d9] text-[#1e1b26] placeholder-[#8f8a9e] rounded-2xl pl-11 pr-11 py-3 text-sm font-medium focus:border-[#f04e7c] focus:outline-none transition-colors" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8f8a9e] hover:text-[#1e1b26]">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm */}
              <div>
                <label className="block text-sm font-semibold mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8f8a9e]" />
                  <input type={showConfirm ? 'text' : 'password'} value={form.confirm} onChange={(e) => handleChange('confirm', e.target.value)} placeholder="Re-enter password" className="w-full bg-[#f7f5f0] border-2 border-[#eae5d9] text-[#1e1b26] placeholder-[#8f8a9e] rounded-2xl pl-11 pr-11 py-3 text-sm font-medium focus:border-[#f04e7c] focus:outline-none transition-colors" />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8f8a9e] hover:text-[#1e1b26]">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Course */}
              <div>
                <label className="block text-sm font-semibold mb-1.5">Course</label>
                <div className="relative">
                  <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8f8a9e]" />
                  <select value={form.course} onChange={(e) => handleChange('course', e.target.value)} className="w-full bg-[#f7f5f0] border-2 border-[#eae5d9] text-[#1e1b26] rounded-2xl pl-11 pr-10 py-3 text-sm font-medium focus:border-[#f04e7c] focus:outline-none transition-colors appearance-none cursor-pointer">
                    <option value="">Select your course</option>
                    <option value="ce">Computer Engineering</option>
                    <option value="mba">MBA</option>
                    <option value="ds">Data Science</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8f8a9e] pointer-events-none" />
                </div>
              </div>

              {/* Experience Level */}
              <div>
                <label className="block text-sm font-semibold mb-2">Experience Level</label>
                <div className="flex gap-2">
                  {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                    <button key={level} type="button" onClick={() => setExperience(level.toLowerCase())}
                      className={`flex-1 py-2.5 rounded-full text-sm font-bold border-2 transition-all ${
                        experience === level.toLowerCase()
                          ? 'bg-[#f04e7c] text-white border-[#1e1b26] shadow-[3px_3px_0px_#1e1b26]'
                          : 'bg-white text-[#5a5566] border-[#eae5d9] hover:border-[#1e1b26]'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Terms */}
              <label className="flex items-start gap-3 cursor-pointer pt-1">
                <input type="checkbox" checked={agreed} onChange={() => setAgreed(!agreed)} className="w-4 h-4 rounded border-2 border-[#eae5d9] accent-[#f04e7c] mt-0.5" />
                <span className="text-sm text-[#5a5566]">
                  I agree to the <a href="#" className="text-[#f04e7c] font-semibold">Terms of Service</a> and <a href="#" className="text-[#f04e7c] font-semibold">Privacy Policy</a>
                </span>
              </label>

              <button type="submit" className="btn-brutal w-full text-center mt-2">Create Account</button>
            </form>

            <p className="text-center text-sm text-[#5a5566] mt-5">
              Already have an account?{' '}
              <Link href="/login" className="text-[#f04e7c] hover:text-[#d9406a] font-bold transition-colors">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
