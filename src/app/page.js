"use client";
import { useState } from "react";
import {
  Rocket,
  Gamepad2,
  Brain,
  Trophy,
  Users,
  BookOpen,
  Zap,
  ChevronRight,
  Play,
  Menu,
  X,
  Sparkles,
  Target,
  Star,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

/* ========================================
   FLOATING GLASS NAVBAR
   ======================================== */
function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <header className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[1000px] z-50">
      <nav className="flex items-center justify-between bg-white/70 backdrop-blur-[16px] px-6 sm:px-8 py-3.5 rounded-full border border-white/40 shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
        <Link
          href="/"
          className="font-[Outfit] text-2xl sm:text-[28px] font-black tracking-tight text-[#1e1b26] no-underline"
        >
          adrenalearn
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className="text-[15px] font-semibold text-[#1e1b26] hover:text-[#f04e7c] transition-colors"
          >
            Home
          </Link>
          <Link
            href="/courses"
            className="text-[15px] font-semibold text-[#1e1b26] hover:text-[#f04e7c] transition-colors"
          >
            Courses
          </Link>
          <Link
            href="/leaderboard"
            className="text-[15px] font-semibold text-[#1e1b26] hover:text-[#f04e7c] transition-colors"
          >
            Leaderboard
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-5">
          <Link
            href="/login"
            className="text-[15px] font-bold text-[#1e1b26] hover:text-[#f04e7c] transition-colors"
          >
            Log in
          </Link>
          <Link href="/register" className="btn-brutal btn-brutal-small">
            Get Started
          </Link>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-[#1e1b26]"
        >
          {mobileOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </nav>

      {mobileOpen && (
        <div className="md:hidden mt-3 bg-white/90 backdrop-blur-xl rounded-3xl p-5 border border-[#eae5d9] shadow-lg animate-slide-up">
          <div className="flex flex-col gap-2">
            <Link
              href="/"
              className="text-[15px] font-semibold px-4 py-2.5 rounded-xl hover:bg-[#f7f5f0]"
            >
              Home
            </Link>
            <Link
              href="/courses"
              className="text-[15px] font-semibold px-4 py-2.5 rounded-xl hover:bg-[#f7f5f0]"
            >
              Courses
            </Link>
            <Link
              href="/leaderboard"
              className="text-[15px] font-semibold px-4 py-2.5 rounded-xl hover:bg-[#f7f5f0]"
            >
              Leaderboard
            </Link>
            <hr className="border-[#eae5d9] my-1" />
            <Link href="/login" className="text-[15px] font-bold px-4 py-2.5">
              Log in
            </Link>
            <Link
              href="/register"
              className="btn-brutal btn-brutal-small text-center"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

/* ========================================
   HERO WITH CSS BLOBS
   ======================================== */
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center text-center pt-24 pb-16 overflow-hidden">
      {/* Animated Blobs */}
      <div className="blob w-[400px] h-[400px] bg-[#ffd6e4] top-[20%] left-[10%]" />
      <div
        className="blob w-[500px] h-[500px] bg-[#fff3c4] bottom-[10%] right-[5%]"
        style={{ animationDelay: "2s" }}
      />

      {/* Floating emojis */}
      <div
        className="absolute left-[8%] bottom-[25%] text-6xl sm:text-7xl animate-float hidden lg:block"
        style={{ transform: "rotate(-10deg)" }}
      >
        🚀
      </div>
      <div
        className="absolute right-[8%] bottom-[30%] text-6xl sm:text-7xl animate-float hidden lg:block"
        style={{ animationDelay: "2.5s", transform: "rotate(10deg)" }}
      >
        🎮
      </div>

      <div className="relative z-10 max-w-[900px] mx-auto px-6">
        <h1 className="font-[Outfit] text-[56px] sm:text-[72px] lg:text-[96px] leading-[1] font-black tracking-[-3px] mb-7 text-[#1e1b26]">
          A sweet, secret <br className="hidden sm:block" />
          <span className="text-[#f04e7c] relative inline-block">
            learning ingredient.
          </span>
        </h1>

        <p className="text-lg sm:text-[22px] text-[#5a5566] max-w-[600px] mx-auto mb-10 leading-relaxed">
          Master coding through gamified mini-games, AI mentorship, and real
          challenges — making your learning faster, more fun, and addictive.
        </p>

        <Link href="/register" className="btn-brutal text-lg">
          GET STARTED FREE
        </Link>

        <div className="mt-5 text-sm font-semibold text-[#5a5566]">
          No credit card required. Cancel anytime! ✨
        </div>
      </div>
    </section>
  );
}

/* ========================================
   BENTO: HOW IT WORKS
   ======================================== */
function HowItWorks() {
  const steps = [
    {
      icon: "📖",
      title: "Watch.",
      desc: "Learn through bite-sized video lessons crafted by experts. Each covers one key concept clearly.",
      highlight: false,
    },
    {
      icon: "🎮",
      title: "Play.",
      desc: "Test what you learned in 4 exciting mini-games. Spaceship, Subway, Balloon, Cat Rescue!",
      highlight: true,
    },
    {
      icon: "🧠",
      title: "Master.",
      desc: "Talk to Kode Sensei — your AI mentor. Get personalized feedback and earn bonus points.",
      highlight: false,
    },
  ];

  return (
    <section className="py-24 px-6">
      <div className="max-w-[1200px] mx-auto">
        <h2 className="font-[Outfit] text-center text-[42px] sm:text-[56px] font-black tracking-[-2px] leading-[1.1] mb-14 text-[#1e1b26]">
          It&apos;s just how you&apos;ve always
          <br />
          wanted learning to work.
        </h2>

        <div className="grid md:grid-cols-3 gap-7">
          {steps.map((step, i) => (
            <div
              key={i}
              className={`bento-card min-h-[280px]`}
              style={
                step.highlight
                  ? { backgroundColor: "#fbc13a", borderColor: "#fbc13a" }
                  : {}
              }
            >
              <div className="text-[48px] mb-5">{step.icon}</div>
              <div>
                <h3 className="font-[Outfit] text-[28px] sm:text-[32px] font-black mb-2">
                  {step.title}
                </h3>
                <p
                  className={`text-[17px] leading-relaxed ${step.highlight ? "text-[#1e1b26]" : "text-[#5a5566]"}`}
                >
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ========================================
   GAME MODES — BENTO CARDS
   ======================================== */
function GameModes() {
  const games = [
    {
      icon: "🚀",
      name: "Spaceship Mission",
      desc: "Navigate through asteroid fields of code questions. Each correct answer fuels your ship further.",
    },
    {
      icon: "🏃",
      name: "Subway Runner",
      desc: "Race through challenges at speed. Dodge wrong answers and keep your streak alive.",
    },
    {
      icon: "🎈",
      name: "Balloon Shooter",
      desc: "Pop the balloons carrying right answers before time runs out. Precision earns bonus.",
    },
    {
      icon: "🐱",
      name: "Cat Rescue",
      desc: "Save stranded cats by solving puzzles. Each correct answer builds a rescue bridge.",
    },
  ];

  return (
    <section className="py-24 px-6">
      <div className="max-w-[1200px] mx-auto">
        <h2 className="font-[Outfit] text-center text-[42px] sm:text-[56px] font-black tracking-[-2px] leading-[1.1] mb-14 text-[#1e1b26]">
          Choose your <span className="text-[#f04e7c]">battle.</span>
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {games.map((game, i) => (
            <div
              key={i}
              className="bento-card group cursor-pointer min-h-[250px]"
            >
              <div className="text-[48px] mb-4 group-hover:animate-pulse-soft">
                {game.icon}
              </div>
              <div>
                <h3 className="font-[Outfit] text-xl font-bold mb-2">
                  {game.name}
                </h3>
                <p className="text-[15px] text-[#5a5566] leading-relaxed">
                  {game.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ========================================
   STATS BAR — DARK PRICING STYLE
   ======================================== */
function StatsBar() {
  const stats = [
    { value: "5,000+", label: "Students", icon: "👨‍🎓" },
    { value: "20+", label: "Lessons", icon: "📚" },
    { value: "4", label: "Game Modes", icon: "🎮" },
    { value: "98%", label: "Engagement", icon: "📈" },
  ];

  return (
    <section className="py-20 px-6">
      <div className="max-w-[600px] mx-auto">
        <div className="bg-[#1e1b26] text-white rounded-[48px] p-12 sm:p-16 relative overflow-hidden">
          {/* Glossy diagonal */}
          <div
            className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-br from-white/10 to-transparent rotate-[-15deg] pointer-events-none"
            style={{ backgroundSize: "100% 40%" }}
          />

          <h3 className="font-[Outfit] text-[#fbc13a] text-[28px] sm:text-[32px] font-bold mb-2 relative z-10">
            By the numbers
          </h3>
          <p className="text-[#8f8a9e] text-lg mb-10 relative z-10">
            Join thousands of students already learning with adrenalearn.
          </p>

          <div className="grid grid-cols-2 gap-8 relative z-10">
            {stats.map((stat, i) => (
              <div key={i} className="border-t border-white/10 pt-5">
                <div className="text-3xl mb-1">{stat.icon}</div>
                <div className="font-[Outfit] text-[36px] sm:text-[42px] font-black leading-none">
                  {stat.value}
                </div>
                <div className="text-[#8f8a9e] text-sm font-medium mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/register"
            className="btn-brutal btn-brutal-white mt-10 w-full text-center relative z-10"
          >
            Start Learning Free
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ========================================
   FAQ SECTION
   ======================================== */
function FAQSection() {
  const faqs = [
    {
      q: "Is adrenalearn really free to use?",
      a: "Yes! adrenalearn is currently free for all students. You get access to all courses, game modes, and Kode Sensei AI mentorship at no cost.",
    },
    {
      q: "What programming language is taught?",
      a: "We primarily teach Python — the most beginner-friendly and in-demand language. Our lessons cover variables, loops, functions, data structures, and more.",
    },
    {
      q: "How does the gamified learning work?",
      a: "After watching a lesson, you play mini-games that quiz you on concepts. Then Kode Sensei (AI) interviews you for deeper understanding. You earn XP, badges, and climb the leaderboard!",
    },
    {
      q: "Can I use adrenalearn on mobile?",
      a: "Absolutely. adrenalearn is fully responsive and works beautifully on phones, tablets, and desktops.",
    },
  ];

  return (
    <section className="py-20 px-6">
      <div className="max-w-[800px] mx-auto">
        <h2 className="font-[Outfit] text-center text-[42px] sm:text-[56px] font-black tracking-[-2px] mb-14 text-[#1e1b26]">
          FAQs
        </h2>
        {faqs.map((faq, i) => (
          <details key={i}>
            <summary>{faq.q}</summary>
            <div className="faq-content">{faq.a}</div>
          </details>
        ))}
      </div>
    </section>
  );
}

/* ========================================
   FOOTER
   ======================================== */
function Footer() {
  return (
    <footer className="bg-[#1e1b26] text-white text-center pt-20 sm:pt-24 pb-12 rounded-t-[60px] sm:rounded-t-[100px]">
      <h2 className="font-[Outfit] text-[40px] sm:text-[64px] font-black tracking-[-2px] mb-12 px-6 leading-tight">
        Let&apos;s make something
        <br />
        sweet together.
      </h2>

      <Link href="/register" className="btn-brutal mb-16 inline-flex">
        Get Started Free
      </Link>

      <div className="flex flex-wrap justify-center gap-8 sm:gap-10 mb-12 px-6">
        <Link
          href="/courses"
          className="text-[#8f8a9e] font-semibold hover:text-white transition-colors text-sm"
        >
          Courses
        </Link>
        <Link
          href="/leaderboard"
          className="text-[#8f8a9e] font-semibold hover:text-white transition-colors text-sm"
        >
          Leaderboard
        </Link>
        <Link
          href="/dashboard"
          className="text-[#8f8a9e] font-semibold hover:text-white transition-colors text-sm"
        >
          Dashboard
        </Link>
        <a
          href="#"
          className="text-[#8f8a9e] font-semibold hover:text-white transition-colors text-sm"
        >
          Terms of Service
        </a>
      </div>

      <p className="text-[#5a5566] text-[15px]">
        © 2026 adrenalearn. Learn. Play. Conquer. 🚀
      </p>
    </footer>
  );
}

/* ========================================
   LANDING PAGE
   ======================================== */
export default function LandingPage() {
  return (
    <main className="bg-[#f7f5f0]">
      <Navbar />
      <HeroSection />
      <HowItWorks />
      <GameModes />
      <StatsBar />
      <FAQSection />
      <Footer />
    </main>
  );
}
