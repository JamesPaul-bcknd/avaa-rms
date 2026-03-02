// Example usage of JobSeekerProfileModal in your authentication flow
// This shows how to integrate it after email verification

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import JobSeekerProfileModal from '@/components/modals/JobSeekerProfileModal'

export default function VerifyOTPPage() {
  const [showProfileModal, setShowProfileModal] = useState(true)
  const router = useRouter()

  const handleProfileSubmit = async (profileData: any) => {
    try {
      // Save profile data to your backend
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(profileData)
      })

      if (response.ok) {
        // Profile completed successfully, redirect to dashboard
        setShowProfileModal(false)
        router.push('/user/dashboard')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
    }
  }

  const handleReturnToLogin = () => {
    // Clear any stored tokens and redirect to login
    localStorage.removeItem('token')
    router.push('/auth')
  }

  return (
    <div>
      {/* Your existing OTP verification content */}
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Verify Your Email
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              We've sent a verification code to your email
            </p>
          </div>
          
          {/* Your OTP verification form goes here */}
          
        </div>
      </div>

      {/* Job Seeker Profile Modal */}
      <JobSeekerProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onSubmit={handleProfileSubmit}
        onReturnToLogin={handleReturnToLogin}
      />
    </div>
  )
}
