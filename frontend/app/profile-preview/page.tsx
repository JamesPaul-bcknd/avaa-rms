'use client'

import { useState } from 'react'
import JobSeekerProfileModal from '@/components/modals/JobSeekerProfileModal'

export default function ProfilePreviewPage() {
  const [showModal, setShowModal] = useState(true)

  const handleProfileSubmit = (data: any) => {
    console.log('Profile data:', data)
    alert('Profile submitted! (Check console for data)')
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
          Job Seeker Profile Preview
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

      <JobSeekerProfileModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleProfileSubmit}
        onReturnToLogin={handleReturnToLogin}
      />
    </div>
  )
}
