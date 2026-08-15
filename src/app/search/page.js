'use client'

import Sidebar from '../components/Sidebar'
import ProtectedRoute from '../components/ProtectedRoute'
import Search from './Search'

function SearchPageContent() {
  return (
    <div className="min-h-screen bg-[#f7f5f0] selection:bg-[#f04e7c] selection:text-white">
      <Sidebar />
      <main className="lg:ml-56 pt-16 lg:pt-0 min-h-screen overflow-x-hidden">
        <Search />
      </main>
    </div>
  )
}

export default function SearchPage() {
  return (
    <ProtectedRoute>
      <SearchPageContent />
    </ProtectedRoute>
  )
}
