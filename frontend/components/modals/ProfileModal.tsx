'use client'

import React, { useState } from 'react'
import { MapPin, Phone, Plus, Building, User } from 'lucide-react'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  onJobSeekerSubmit: (data: any) => void
  onRecruiterSubmit: (data: any) => void
  onReturnToLogin: () => void
}

interface JobSeekerData {
  phoneNumber: string
  location: string
  skills: string[]
}

interface RecruiterData {
  companyName: string
  companyNumber: string
  companyLocation: string
  position: string
}

export default function ProfileModal({
  isOpen,
  onClose,
  onJobSeekerSubmit,
  onRecruiterSubmit,
  onReturnToLogin
}: ProfileModalProps) {
  const [selectedRole, setSelectedRole] = useState<'jobseeker' | 'recruiter'>('recruiter')

  // Job Seeker State
  const [jobSeekerData, setJobSeekerData] = useState<JobSeekerData>({
    phoneNumber: '',
    location: '',
    skills: ['Programming']
  })

  // Recruiter State
  const [recruiterData, setRecruiterData] = useState<RecruiterData>({
    companyName: '',
    companyNumber: '',
    companyLocation: '',
    position: ''
  })

  const addSkill = () => {
    const newSkill = prompt('Enter a new skill:')
    if (newSkill && newSkill.trim() && !jobSeekerData.skills.includes(newSkill.trim())) {
      setJobSeekerData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }))
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setJobSeekerData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }))
  }

  const handleSubmit = () => {
    if (selectedRole === 'jobseeker') {
      onJobSeekerSubmit(jobSeekerData)
    } else {
      onRecruiterSubmit(recruiterData)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-semibold text-gray-900">
            Complete your {selectedRole === 'jobseeker' ? 'Job Seeker' : 'Recruiter'} Profile
          </h2>
          
          {/* Toggle Switch */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSelectedRole('jobseeker')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedRole === 'jobseeker'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              Job Seeker
            </button>
            <button
              onClick={() => setSelectedRole('recruiter')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedRole === 'recruiter'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              Recruiter
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {selectedRole === 'jobseeker' ? (
            <>
              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone
                    size={18}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="tel"
                    value={jobSeekerData.phoneNumber}
                    onChange={(e) => setJobSeekerData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    placeholder="Enter your phone number"
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <div className="relative">
                  <MapPin
                    size={18}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={jobSeekerData.location}
                    onChange={(e) => setJobSeekerData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Enter your location"
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skills
                </label>
                <div className="space-y-3">
                  {/* Existing Skills */}
                  <div className="flex flex-wrap gap-2">
                    {jobSeekerData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                      >
                        {skill}
                        <button
                          onClick={() => removeSkill(skill)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Add New Skill */}
                  <button
                    onClick={addSkill}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Add Skill
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <div className="relative">
                  <Building
                    size={18}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={recruiterData.companyName}
                    onChange={(e) => setRecruiterData(prev => ({ ...prev, companyName: e.target.value }))}
                    placeholder="Certi Code"
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Company Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Number
                </label>
                <div className="relative">
                  <Phone
                    size={18}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="tel"
                    value={recruiterData.companyNumber}
                    onChange={(e) => setRecruiterData(prev => ({ ...prev, companyNumber: e.target.value }))}
                    placeholder="+63 912 345 6789"
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Company Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Location
                </label>
                <div className="relative">
                  <MapPin
                    size={18}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={recruiterData.companyLocation}
                    onChange={(e) => setRecruiterData(prev => ({ ...prev, companyLocation: e.target.value }))}
                    placeholder="e.g., Block 5, Sunrise Village, Greenfield City, North Valley"
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Position */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position
                </label>
                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={recruiterData.position}
                    onChange={(e) => setRecruiterData(prev => ({ ...prev, position: e.target.value }))}
                    placeholder="e.g., HR Manager, Recruiter"
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
          <button
            onClick={onReturnToLogin}
            className="px-6 py-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            Return to login
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Submit Information
          </button>
        </div>
      </div>
    </div>
  )
}
