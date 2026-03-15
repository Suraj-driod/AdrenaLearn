'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f5f0] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#f04e7c] animate-spin mb-4" />
        <p className="font-[Outfit] font-bold text-[#1e1b26]">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect via useEffect
  }

  return children
}
