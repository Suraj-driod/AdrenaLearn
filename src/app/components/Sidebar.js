'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, BookOpen, Trophy, UserCircle, Brain, Menu, X, LogOut } from 'lucide-react'
import { signOut } from 'firebase/auth'
import { auth } from '../../backend/firebase'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/courses', label: 'Courses', icon: BookOpen },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/profile', label: 'Profile', icon: UserCircle },
  { href: '/interview/1', label: 'Kode Sensei', icon: Brain },
]

export default function Sidebar({ collapsed = false } = {}) {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()
  const [open, setOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  // Better active state matching
  const isActive = (href) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    if (href === '/interview/1') return pathname.startsWith('/interview')
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <>
      {!collapsed && (
        <>
          {/* Mobile top bar */}
          <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b-2 border-[#eae5d9] px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <Image src="/assets/AdrenaLearn-Logo.png" alt="AdrenaLearn Logo" width={128} height={90} className="w-24 md:w-32 h-auto" priority />
            </Link>
            <button onClick={() => setOpen(!open)} className="text-[#1e1b26]">
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Overlay */}
          {open && <div className="lg:hidden fixed inset-0 bg-black/20 z-40" onClick={() => setOpen(false)} />}
        </>
      )}

      {/* Sidebar */}
      <aside
        className={[
          "fixed top-0 left-0 h-full z-50 flex flex-col transition-transform duration-300",
          collapsed ? "w-16 bg-[#0f0b14] border-r border-white/10 translate-x-0" : "w-56 bg-white border-r-2 border-[#eae5d9] lg:translate-x-0",
          collapsed ? "" : (open ? "translate-x-0" : "-translate-x-full"),
        ].join(" ")}
      >
        {collapsed ? (
          <div className="px-3 py-4 flex items-center justify-center border-b border-white/10">
            <Link href="/" className="font-[Outfit] text-lg font-black text-[#fbc13a]" aria-label="AdrenaLearn Home">A</Link>
          </div>
        ) : (
          <div className="p-6 flex items-center justify-center">
            <Link href="/">
              <Image src="/assets/AdrenaLearn-Logo.png" alt="AdrenaLearn Logo" width={160} height={90} className="w-32 h-auto" priority />
            </Link>
          </div>
        )}

        <nav className={collapsed ? "flex-1 px-2 py-3 space-y-2" : "flex-1 px-4 space-y-1"}>
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                title={collapsed ? item.label : undefined}
                aria-label={collapsed ? item.label : undefined}
                className={
                  collapsed
                    ? [
                      "group flex items-center justify-center h-11 rounded-2xl border transition-all",
                      active
                        ? "bg-[#f04e7c] text-white border-[#1e1b26] shadow-[2px_2px_0px_#1e1b26]"
                        : "text-white/70 border-white/10 hover:bg-white/10 hover:text-white",
                    ].join(" ")
                    : `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${active
                      ? 'bg-[#f04e7c] text-white shadow-[3px_3px_0px_#1e1b26] border-2 border-[#1e1b26]'
                      : 'text-[#5a5566] hover:bg-[#f7f5f0] hover:text-[#1e1b26] border-2 border-transparent'
                    }`
                }
              >
                <Icon className="w-5 h-5" />
                {!collapsed && item.label}
              </Link>
            )
          })}
        </nav>

        <div className={collapsed ? "p-2 border-t border-white/10" : "p-4 border-t-2 border-[#eae5d9]"}>
          {!collapsed && user && (
            <div className="px-4 py-2 mb-2">
              <p className="text-xs text-[#8f8a9e] font-semibold">Signed in as</p>
              <p className="text-sm font-bold text-[#1e1b26] truncate">{user.displayName || user.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            title={collapsed ? "Log Out" : undefined}
            aria-label={collapsed ? "Log Out" : undefined}
            className={
              collapsed
                ? "flex items-center justify-center h-11 w-full rounded-2xl text-white/70 hover:bg-white/10 hover:text-white transition-all"
                : "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-[#5a5566] hover:bg-[#f7f5f0] hover:text-[#1e1b26] transition-all w-full"
            }
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && "Log Out"}
          </button>
        </div>
      </aside>
    </>
  )
}
