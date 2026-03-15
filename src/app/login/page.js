"use client";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, Hand } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  return (
    <main className="min-h-screen bg-[#f7f5f0] flex items-center justify-center relative overflow-hidden px-6">
      {/* Blobs */}
      <div className="blob w-[350px] h-[350px] bg-[#ffd6e4] top-[15%] left-[10%]" />
      <div
        className="blob w-[400px] h-[400px] bg-[#fff3c4] bottom-[10%] right-[8%]"
        style={{ animationDelay: "2s" }}
      />

      <div className="relative z-10 w-full max-w-[440px] animate-slide-up">
        <div className="bg-white rounded-[40px] border-2 border-[#eae5d9] p-8 sm:p-10 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link
              href="/"
              className="font-[Outfit] text-3xl font-black text-[#1e1b26] inline-block mb-3"
            >
              adrenalearn
            </Link>
            <h1 className="font-[Outfit] text-2xl font-bold flex items-center justify-center gap-2">
              Welcome Back <Hand className="w-6 h-6 text-[#fbc13a]" />
            </h1>
            <p className="text-[#5a5566] text-sm mt-1">
              Sign in to continue your quest
            </p>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-[#1e1b26] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#8f8a9e]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-[#f7f5f0] border-2 border-[#eae5d9] text-[#1e1b26] placeholder-[#8f8a9e] rounded-2xl pl-12 pr-4 py-3.5 text-sm font-medium focus:border-[#f04e7c] focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-[#1e1b26] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#8f8a9e]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-[#f7f5f0] border-2 border-[#eae5d9] text-[#1e1b26] placeholder-[#8f8a9e] rounded-2xl pl-12 pr-12 py-3.5 text-sm font-medium focus:border-[#f04e7c] focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8f8a9e] hover:text-[#1e1b26] transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-[18px] h-[18px]" />
                  ) : (
                    <Eye className="w-[18px] h-[18px]" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={() => setRemember(!remember)}
                  className="w-4 h-4 rounded border-2 border-[#eae5d9] accent-[#f04e7c]"
                />
                <span className="text-sm text-[#5a5566] group-hover:text-[#1e1b26] transition-colors">
                  Remember me
                </span>
              </label>
              <a
                href="#"
                className="text-sm text-[#f04e7c] hover:text-[#d9406a] font-semibold transition-colors"
              >
                Forgot password?
              </a>
            </div>

            {/* Submit */}
            <button type="submit" className="btn-brutal w-full text-center">
              Sign In
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-[2px] bg-[#eae5d9]" />
            <span className="text-xs text-[#8f8a9e] font-semibold">
              or continue with
            </span>
            <div className="flex-1 h-[2px] bg-[#eae5d9]" />
          </div>

          {/* Google */}
          <button className="btn-brutal btn-brutal-outline w-full text-center text-sm">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-sm text-[#5a5566] mt-6">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-[#f04e7c] hover:text-[#d9406a] font-bold transition-colors"
            >
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
