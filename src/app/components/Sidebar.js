'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, BookOpen, Trophy, UserCircle, Brain, Menu, X, LogOut } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/courses', label: 'Courses', icon: BookOpen },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/profile', label: 'Profile', icon: UserCircle },
  { href: '/interview/1', label: 'Kode Sensei', icon: Brain },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b-2 border-[#eae5d9] px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-[Outfit] text-xl font-black">AdrenaLearn</Link>
        <button onClick={() => setOpen(!open)} className="text-[#1e1b26]">
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Overlay */}
      {open && <div className="lg:hidden fixed inset-0 bg-black/20 z-40" onClick={() => setOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full z-50 w-64 bg-white border-r-2 border-[#eae5d9] flex flex-col transition-transform duration-300 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6">
          <Link href="/" className="font-[Outfit] text-2xl font-black text-[#1e1b26]">AdrenaLearn</Link>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${active
                  ? 'bg-[#f04e7c] text-white shadow-[3px_3px_0px_#1e1b26] border-2 border-[#1e1b26]'
                  : 'text-[#5a5566] hover:bg-[#f7f5f0] hover:text-[#1e1b26] border-2 border-transparent'
                  }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t-2 border-[#eae5d9]">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-[#5a5566] hover:bg-[#f7f5f0] hover:text-[#1e1b26] transition-all">
            <LogOut className="w-5 h-5" />
            Log Out
          </Link>
        </div>
      </aside>
    </>
  )
}
