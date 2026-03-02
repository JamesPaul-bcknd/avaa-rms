'use client'

import { useState } from 'react'
import ProfileModal from '@/components/modals/ProfileModal'

export default function ProfileModalPreviewPage() {
  const [showModal, setShowModal] = useState(true)

  const handleJobSeekerSubmit = (data: any) => {
    console.log('Job Seeker Profile Data:', data)
    alert('Job Seeker profile submitted! (Check console for data)')
    setShowModal(false)
  }

  const handleRecruiterSubmit = (data: any) => {
    console.log('Recruiter Profile Data:', data)
    alert('Recruiter profile submitted! (Check console for data)')
    setShowModal(false)
  }

  const handleReturnToLogin = () => {
    console.log('Return to login clicked')
    setShowModal(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Profile Modal Preview
        </h1>
        <p className="text-gray-600 mb-8">
          This page shows the profile completion modal without authentication
        </p>
        
        {!showModal && (
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Show Profile Modal Again
          </button>
        )}
      </div>

      <ProfileModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onJobSeekerSubmit={handleJobSeekerSubmit}
        onRecruiterSubmit={handleRecruiterSubmit}
        onReturnToLogin={handleReturnToLogin}
      />
    </div>
  )
}
