'use client'

import { useEffect } from 'react'

export default function HRDashboardPage() {
  useEffect(() => {
    document.title = 'HR Dashboard | AVAA'
  }, [])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-white text-4xl font-bold mb-4">HR Dashboard</h1>
        <p className="text-gray-400 text-lg">Welcome to your HR Dashboard</p>
        <p className="text-gray-500 text-sm mt-2">This page is under construction</p>
      </div>
    </div>
  )
}
