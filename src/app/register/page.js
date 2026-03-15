"use client";
import { useState } from "react";
import Toast from "../../toast/toast";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Rocket,
  BookOpen,
  Gamepad2,
  Brain,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { signInWithGoogle } from "../../backend/googleLogin";
import { registerWithEmail } from "../../backend/emailLogin"; 

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const router = useRouter();

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrorMsg("");
  }

  const handleGoogleAuth = async () => {
    try {
      const user = await signInWithGoogle();
      console.log("Success! User:", user);
      
      setToastMessage("Successfully signed in with Google! 🚀");
      setShowToast(true);
      
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (error) {
      console.error("Google Auth failed:", error);
      setErrorMsg("Google Sign-In failed. Please try again.");
    }
  };

  const handleEmailRegister = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!form.email || !form.password) {
      return setErrorMsg("Please fill in all fields.");
    }
    if (form.password.length < 8) {
      return setErrorMsg("Password must be at least 8 characters.");
    }
    if (!agreed) {
      return setErrorMsg("You must agree to the Terms and Privacy Policy.");
    }

    setIsLoading(true);

    try {
      const user = await registerWithEmail(null, form.email, form.password);
      console.log("Success! Email account created for:", user);
      
      setToastMessage("Account created successfully!");
      setShowToast(true);

      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (error) {
      console.error("Email Registration failed:", error);
      if (error.code === 'auth/email-already-in-use') {
        setErrorMsg("An account with this email already exists.");
      } else {
        setErrorMsg(error.message || "Failed to create account.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f5f0] flex relative overflow-hidden">
      <Toast 
        message={toastMessage} 
        isVisible={showToast} 
        onClose={() => setShowToast(false)} 
        duration={4000} 
      />

      <div className="blob w-[500px] h-[500px] bg-[#ffd6e4] top-[10%] left-[0%] absolute rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob" />
      <div
        className="blob w-[400px] h-[400px] bg-[#fff3c4] bottom-[5%] right-[0%] absolute rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"
        style={{ animationDelay: "3s" }}
      />

      <div className="hidden lg:flex w-1/2 relative items-center justify-center p-12">
        <motion.div 
          className="relative z-10 max-w-lg"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div variants={fadeUp}>
            <Link
              href="/"
              className="font-[Outfit] text-4xl font-black text-[#1e1b26] inline-block mb-8"
            >
              adrenalearn
            </Link>
          </motion.div>

          <motion.h2 variants={fadeUp} className="font-[Outfit] text-[48px] xl:text-[56px] font-black leading-[1.1] tracking-[-2px] mb-6">
            Learn. Play.
            <br />
            <span className="text-[#f04e7c]">Conquer.</span>
          </motion.h2>

          <motion.p variants={fadeUp} className="text-lg text-[#5a5566] mb-10 leading-relaxed">
            Join thousands of students mastering code through gamified
            challenges and AI mentorship.
          </motion.p>

          <motion.div variants={staggerContainer} className="space-y-5">
            {[
              {
                icon: <BookOpen className="w-6 h-6 text-[#f04e7c]" />,
                title: "Expert-crafted Lessons",
                desc: "Bite-sized video content from industry experts",
              },
              {
                icon: <Gamepad2 className="w-6 h-6 text-[#fbc13a]" />,
                title: "4 Unique Game Modes",
                desc: "Spaceship, Subway, Balloon, and Cat Rescue",
              },
              {
                icon: <Brain className="w-6 h-6 text-[#1e7a4e]" />,
                title: "AI-Powered Mentorship",
                desc: "Kode Sensei gives instant personalized feedback",
              },
              {
                icon: <Rocket className="w-6 h-6 text-[#7c3aed]" />,
                title: "Track Progress & Compete",
                desc: "XP, streaks, badges, and live leaderboards",
              },
            ].map((f, i) => (
              <motion.div variants={fadeUp} key={i} className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-white border-2 border-[#eae5d9] flex items-center justify-center shrink-0 group-hover:border-[#f04e7c] group-hover:shadow-[2px_2px_0px_#f04e7c] transition-all">
                  {f.icon}
                </div>
                <div>
                  <h4 className="font-bold text-[15px]">{f.title}</h4>
                  <p className="text-[#5a5566] text-sm">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 relative z-10">
        <motion.div
          className="w-full max-w-[460px]"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
        >
          <div className="bg-white rounded-[40px] border-2 border-[#eae5d9] p-8 sm:p-10 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
            <div className="lg:hidden mb-5">
              <Link href="/" className="font-[Outfit] text-2xl font-black">
                adrenalearn
              </Link>
            </div>

            <h1 className="font-[Outfit] text-2xl font-bold mb-1">
              Create Account
            </h1>
            <p className="text-[#5a5566] text-sm mb-6">
              Start your coding adventure today
            </p>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl font-medium">
                {errorMsg}
              </div>
            )}

            <button
              onClick={handleGoogleAuth}
              type="button"
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-[#eae5d9] text-[#1e1b26] font-bold py-3.5 rounded-2xl hover:border-[#1e1b26] hover:shadow-[3px_3px_0px_#1e1b26] active:translate-y-[2px] active:shadow-none transition-all mb-6"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Sign up with Google
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-[2px] bg-[#eae5d9]"></div>
              <span className="text-[#8f8a9e] text-xs font-bold uppercase tracking-wider">Or register with email</span>
              <div className="flex-1 h-[2px] bg-[#eae5d9]"></div>
            </div>

            <form onSubmit={handleEmailRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8f8a9e]" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="you@example.com"
                    disabled={isLoading}
                    className="w-full bg-[#f7f5f0] border-2 border-[#eae5d9] text-[#1e1b26] placeholder-[#8f8a9e] rounded-2xl pl-11 pr-4 py-3 text-sm font-medium focus:border-[#f04e7c] focus:outline-none transition-colors disabled:opacity-60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8f8a9e]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    placeholder="Min 8 characters"
                    disabled={isLoading}
                    className="w-full bg-[#f7f5f0] border-2 border-[#eae5d9] text-[#1e1b26] placeholder-[#8f8a9e] rounded-2xl pl-11 pr-11 py-3 text-sm font-medium focus:border-[#f04e7c] focus:outline-none transition-colors disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8f8a9e] hover:text-[#1e1b26] transition-colors disabled:opacity-60"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <label className="flex items-start gap-3 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={() => {
                    setAgreed(!agreed);
                    setErrorMsg("");
                  }}
                  disabled={isLoading}
                  className="w-4 h-4 rounded border-2 border-[#eae5d9] accent-[#f04e7c] mt-0.5 disabled:opacity-60"
                />
                <span className="text-sm text-[#5a5566]">
                  I agree to the{" "}
                  <a href="#" className="text-[#f04e7c] font-semibold hover:underline">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-[#f04e7c] font-semibold hover:underline">
                    Privacy Policy
                  </a>
                </span>
              </label>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-[#f04e7c] text-white font-bold py-3.5 rounded-2xl border-2 border-[#1e1b26] shadow-[3px_3px_0px_#1e1b26] hover:bg-[#d9406a] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#1e1b26] transition-all mt-4 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[3px_3px_0px_#1e1b26]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <p className="text-center text-sm text-[#5a5566] mt-6">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-[#f04e7c] hover:text-[#1e1b26] font-bold transition-colors underline decoration-2 underline-offset-2"
              >
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}