"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
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
  Cat,
  Wind,
  GraduationCap,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import ClickSpark from "@/react bits/clickSpark";

/* ========================================
   REACT BITS: SCROLL REVEAL COMPONENT
   ======================================== */
const ScrollReveal = ({
  children,
  className = "",
  baseOpacity = 0,
  enableBlur = true,
  baseRotation = 0,
  blurStrength = 10,
  yOffset = 40,
  delay = 0,
  duration = 0.6,
}) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(ref.current);
        }
      },
      { threshold: 0.1, rootMargin: "-50px" }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{
        opacity: baseOpacity,
        y: yOffset,
        rotate: baseRotation,
        filter: enableBlur ? `blur(${blurStrength}px)` : "none",
      }}
      animate={{
        opacity: inView ? 1 : baseOpacity,
        y: inView ? 0 : yOffset,
        rotate: inView ? 0 : baseRotation,
        filter: inView ? "blur(0px)" : enableBlur ? `blur(${blurStrength}px)` : "none",
      }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1], // Smooth custom easing
      }}
    >
      {children}
    </motion.div>
  );
};

/* ========================================
   REACT BITS: BLUR TEXT COMPONENT
   ======================================== */
const buildKeyframes = (from, steps) => {
  const keys = new Set([...Object.keys(from), ...steps.flatMap(s => Object.keys(s))]);

  const keyframes = {};
  keys.forEach(k => {
    keyframes[k] = [from[k], ...steps.map(s => s[k])];
  });
  return keyframes;
};

const BlurText = ({
  text = '',
  delay = 200,
  className = '',
  animateBy = 'words',
  direction = 'top',
  threshold = 0.1,
  rootMargin = '0px',
  animationFrom,
  animationTo,
  easing = t => t,
  onAnimationComplete,
  stepDuration = 0.35
}) => {
  const elements = animateBy === 'words' ? text.split(' ') : text.split('');
  const [inView, setInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(ref.current);
        }
      },
      { threshold, rootMargin }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  const defaultFrom = useMemo(
    () =>
      direction === 'top' ? { filter: 'blur(10px)', opacity: 0, y: -50 } : { filter: 'blur(10px)', opacity: 0, y: 50 },
    [direction]
  );

  const defaultTo = useMemo(
    () => [
      {
        filter: 'blur(5px)',
        opacity: 0.5,
        y: direction === 'top' ? 5 : -5
      },
      { filter: 'blur(0px)', opacity: 1, y: 0 }
    ],
    [direction]
  );

  const fromSnapshot = animationFrom ?? defaultFrom;
  const toSnapshots = animationTo ?? defaultTo;

  const stepCount = toSnapshots.length + 1;
  const totalDuration = stepDuration * (stepCount - 1);
  const times = Array.from({ length: stepCount }, (_, i) => (stepCount === 1 ? 0 : i / (stepCount - 1)));

  return (
    <p ref={ref} className={className} style={{ display: 'flex', flexWrap: 'wrap' }}>
      {elements.map((segment, index) => {
        const animateKeyframes = buildKeyframes(fromSnapshot, toSnapshots);

        const spanTransition = {
          duration: totalDuration,
          times,
          delay: (index * delay) / 1000
        };
        spanTransition.ease = easing;

        return (
          <motion.span
            className="inline-block will-change-[transform,filter,opacity]"
            key={index}
            initial={fromSnapshot}
            animate={inView ? animateKeyframes : fromSnapshot}
            transition={spanTransition}
            onAnimationComplete={index === elements.length - 1 ? onAnimationComplete : undefined}
          >
            {segment === ' ' ? '\u00A0' : segment}
            {animateBy === 'words' && index < elements.length - 1 && '\u00A0'}
          </motion.span>
        );
      })}
    </p>
  );
};

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
          AdrenaLearn
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
   HERO SECTION
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

      {/* Floating icons */}
      <div
        className="absolute left-[8%] bottom-[25%] animate-float hidden lg:block"
        style={{ transform: "rotate(-10deg)" }}
      >
        <Rocket className="w-16 h-16 sm:w-20 sm:h-20 text-[#f04e7c]" />
      </div>
      <div
        className="absolute right-[8%] bottom-[30%] animate-float hidden lg:block"
        style={{ animationDelay: "2.5s", transform: "rotate(10deg)" }}
      >
        <Gamepad2 className="w-16 h-16 sm:w-20 sm:h-20 text-[#fbc13a]" />
      </div>

      <div className="relative z-10 max-w-[900px] mx-auto px-6 flex flex-col items-center">

        {/* Animated Blur Hero Text */}
        <div className="font-[Outfit] text-[56px] sm:text-[72px] lg:text-[96px] leading-[1.05] font-black tracking-[-3px] mb-7 text-[#1e1b26] flex flex-col items-center">
          <BlurText
            text="A luxurious, serene"
            className="justify-center text-center"
            delay={100}
            animateBy="words"
          />
          <BlurText
            text="learning nexus."
            className="text-[#f04e7c] justify-center text-center mt-2 lg:mt-4"
            delay={100}
            animateBy="words"
          />
        </div>

        <div className="text-lg sm:text-[22px] text-[#5a5566] max-w-[600px] mx-auto mb-10 leading-relaxed">
          <BlurText
            text="Master academics through mini-games, AI mentorship, and hands on game personalization — making your learning faster, more fun, and addictive."
            className="justify-center text-center"
            delay={30}
            animateBy="words"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <Link href="/register" className="btn-brutal text-lg">
            GET STARTED NOW
          </Link>


        </motion.div>
      </div>
    </section>
  );
}

/* ========================================
   BENTO: HOW IT WORKS (WITH SCROLL REVEAL)
   ======================================== */
function HowItWorks() {
  const steps = [
    {
      icon: <BookOpen className="w-12 h-12" />,
      title: "Watch.",
      desc: "Learn through bite-sized video lessons crafted by experts. Each covers one key concept clearly.",
      highlight: false,
    },
    {
      icon: <Gamepad2 className="w-12 h-12" />,
      title: "Play.",
      desc: "Test what you learned in 4 exciting mini-games. Space Academia, Subway Nerds, Precision Pop, Kat Mage!",
      highlight: true,
    },
    {
      icon: <Brain className="w-12 h-12" />,
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
            <ScrollReveal
              key={i}
              delay={i * 0.15} // Staggering effect
              yOffset={40}
              blurStrength={8}
            >
              <div
                className={`bento-card min-h-[280px] h-full`}
                style={
                  step.highlight
                    ? { backgroundColor: "#fbc13a", borderColor: "#fbc13a" }
                    : {}
                }
              >
                <div className="mb-5 text-[#1e1b26]">{step.icon}</div>
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
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ========================================
   GAME MODES — BENTO CARDS (WITH SCROLL REVEAL)
   ======================================== */
function GameModes() {
  const games = [
    {
      icon: <Rocket className="w-12 h-12 text-[#f04e7c]" />,
      name: "Space Academia",
      desc: "Navigate through asteroid fields of questions. Each correct answer fuels your ship further.",
    },
    {
      icon: <Wind className="w-12 h-12 text-[#fbc13a]" />,
      name: "Subway Nerds",
      desc: "Race through challenges at speed. Dodge wrong answers and keep your streak alive.",
    },
    {
      icon: <Target className="w-12 h-12 text-[#7c3aed]" />,
      name: "Precision Pop",
      desc: "Pop the balloons carrying right answers before time runs out. Precision earns bonus.",
    },
    {
      icon: <Cat className="w-12 h-12 text-[#1e7a4e]" />,
      name: "Kat Mage",
      desc: "Save stranded cats by solving puzzles. Each correct answer rescues the cat.",
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
            <ScrollReveal
              key={i}
              delay={i * 0.15} // Staggering effect
              yOffset={40}
              blurStrength={8}
            >
              <div className="bento-card group cursor-pointer min-h-[250px] h-full">
                <div className="mb-4 group-hover:animate-pulse-soft">
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
            </ScrollReveal>
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
    { value: "5,000+", label: "Students", icon: <GraduationCap className="w-8 h-8" /> },
    { value: "20+", label: "Lessons", icon: <BookOpen className="w-8 h-8" /> },
    { value: "4", label: "Game Modes", icon: <Gamepad2 className="w-8 h-8" /> },
    { value: "98%", label: "Engagement", icon: <TrendingUp className="w-8 h-8" /> },
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
            Join now and enhance your learning through AdrenaLearn.
          </p>

          <div className="grid grid-cols-2 gap-8 relative z-10">
            {stats.map((stat, i) => (
              <div key={i} className="border-t border-white/10 pt-5">
                <div className="mb-1 text-white">{stat.icon}</div>
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
            Start Learning Now
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
      q: "What is game based personalization?",
      a: "Game based personalization is a learning method that uses pdfs uploaded to integrate text content into games as questions. It is a fun and engaging way to learn, and it is also effective way for undergrads to practice",
    },
    {
      q: "What programming language is currently taught?",
      a: "We primarily teach Python — the most beginner-friendly and in-demand language. Our lessons cover variables, loops, functions, data structures, and more.",
    },
    {
      q: "How does the gamified learning work?",
      a: "After watching a lesson, you play mini-games that quiz you on concepts. Then Kode Sensei (AI) interviews you for deeper understanding. You earn XP, badges, and climb the leaderboard!",
    },
    {
      q: "Can I use AdrenaLearn on mobile?",
      a: "Absolutely. AdrenaLearn is fully responsive and works beautifully on phones, tablets, and desktops.",
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
        great together.
      </h2>

      <Link href="/register" className="btn-brutal mb-16 inline-flex">
        Get Started Now
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

      <p className="text-[#5a5566] text-[15px] flex items-center justify-center gap-1">
        © 2026 AdrenaLearn. Learn. Play. Conquer. <Rocket className="w-4 h-4 text-[#f04e7c]" />
      </p>
    </footer>
  );
}

/* ========================================
   LANDING PAGE
   ======================================== */
export default function LandingPage() {
  return (
    <ClickSpark sparkColor='#fff'
      sparkSize={10}
      sparkRadius={15}
      sparkCount={8}
      duration={400}>
      <main className="bg-[#f7f5f0]">
        <Navbar />
        <HeroSection />
        <HowItWorks />
        <GameModes />
        <StatsBar />
        <FAQSection />
        <Footer />
      </main>
    </ClickSpark>
  );
}