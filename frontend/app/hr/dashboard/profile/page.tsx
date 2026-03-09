"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import Image from "next/image";
import { ArrowLeft, User, Mail, Phone, MapPin, Briefcase, Calendar, Edit } from "lucide-react";
import api from "@/lib/axios";

interface ProfileData {
  id: number;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
  profile_image_url?: string;
  role: string;
  position?: string;
  company_name?: string;
  company_number?: string;
  skills?: string[];
  created_at: string;
}

export default function HRProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    position: '',
    company_name: '',
    company_number: '',
    skills: [] as string[]
  });

  const fetchProfile = useCallback(async () => {
    try {
      // Fetch from HR profile API
      const response = await api.get('/hr/profile');
      const result = response.data;

      if (result.success && result.data) {
        const profileData: ProfileData = {
          id: result.data.id,
          name: result.data.name,
          email: result.data.email,
          phone: result.data.phone || '',
          location: result.data.location || '',
          bio: result.data.bio || '',
          profile_image_url: result.data.profile_image_url || '',
          role: result.data.role || 'recruiter',
          position: result.data.position || 'Senior Tech Talent Partner',
          company_name: result.data.company_name || '',
          company_number: result.data.company_number || '',
          skills: result.data.skills || [],
          created_at: result.data.created_at || new Date().toISOString()
        };
        setProfile(profileData);
        setFormData({
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone || '',
          location: profileData.location || '',
          bio: profileData.bio || '',
          position: profileData.position || '',
          company_name: profileData.company_name || '',
          company_number: profileData.company_number || '',
          skills: profileData.skills || []
        });
      } else {
        // Fallback to auth user data if API fails
        if (user) {
          const profileData: ProfileData = {
            id: user.id || 0,
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            location: user.location || '',
            bio: user.bio || '',
            profile_image_url: user.profile_image_url || '',
            role: user.role || 'recruiter',
            position: user.position || 'Senior Tech Talent Partner',
            company_name: user.company_name || '',
            company_number: user.company_number || '',
            skills: user.skills || [],
            created_at: user.created_at || new Date().toISOString()
          };
          setProfile(profileData);
          setFormData({
            name: profileData.name,
            email: profileData.email,
            phone: profileData.phone || '',
            location: profileData.location || '',
            bio: profileData.bio || '',
            position: profileData.position || '',
            company_name: profileData.company_name || '',
            company_number: profileData.company_number || '',
            skills: profileData.skills || []
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile, user]);

  const handleSave = async () => {
    try {
      const response = await api.put('/hr/profile', formData);
      const result = response.data;

      if (result.success) {
        alert('Profile updated successfully!');
        setIsEditing(false);
        
        // Update local profile state
        if (profile) {
          setProfile({
            ...profile,
            ...formData
          });
        }
      } else {
        alert('Failed to update profile: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to current profile
    if (profile) {
      setFormData({
        name: profile.name,
        email: profile.email,
        phone: profile.phone || '',
        location: profile.location || '',
        bio: profile.bio || '',
        position: profile.position || '',
        company_name: profile.company_name || '',
        company_number: profile.company_number || '',
        skills: profile.skills || []
      });
    }
  };

  const addSkill = () => {
    const newSkill = prompt('Add a new skill:');
    if (newSkill && newSkill.trim()) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
    }
  };

  const removeSkill = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, index) => index !== indexToRemove)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load profile</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">
            This information will be displayed to job seekers in the "Meet the Recruiter" section
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  {profile.profile_image_url ? (
                    <Image
                      src={profile.profile_image_url}
                      alt={profile.name}
                      width={120}
                      height={120}
                      className="w-30 h-30 rounded-full object-cover border-4 border-teal-100"
                    />
                  ) : (
                    <div className="w-30 h-30 rounded-full bg-teal-500 flex items-center justify-center text-white text-2xl font-bold border-4 border-teal-100">
                      {profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                  )}
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="absolute bottom-0 right-0 bg-teal-500 text-white p-2 rounded-full hover:bg-teal-600"
                    >
                      <Edit size={16} />
                    </button>
                  )}
                </div>
                
                <h2 className="text-xl font-bold text-gray-900">{profile.name}</h2>
                <p className="text-teal-600 font-medium">{profile.position}</p>
                <p className="text-gray-500 text-sm">{profile.role}</p>
              </div>

              {/* Quick Stats */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Member Since</span>
                    <span className="font-medium">
                      {new Date(profile.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short' 
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Profile Status</span>
                    <span className="text-green-600 font-medium">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Profile Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Profile Information</h3>
              
              {isEditing ? (
                <div className="space-y-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="+63 912 345 6789"
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Manila, Philippines"
                    />
                  </div>

                  {/* Company Name - Only for recruiters */}
                  {profile?.role === 'recruiter' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                    <input
                      type="text"
                      value={formData.company_name || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Company Name"
                    />
                  </div>
                  )}

                  {/* Company Number - Only for recruiters */}
                  {profile?.role === 'recruiter' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Number</label>
                    <input
                      type="tel"
                      value={formData.company_number || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, company_number: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Company Phone Number"
                    />
                  </div>
                  )}

                  {/* Position */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                    <input
                      type="text"
                      value={formData.position}
                      onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Senior Tech Talent Partner"
                    />
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Tell job seekers about yourself and your recruitment approach..."
                    />
                  </div>

                  {/* Skills */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {formData.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm"
                        >
                          {skill}
                          <button
                            onClick={() => removeSkill(index)}
                            className="ml-1 text-teal-600 hover:text-teal-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      <button
                        onClick={addSkill}
                        className="px-3 py-1 border border-dashed border-teal-300 text-teal-600 rounded-full text-sm hover:bg-teal-50"
                      >
                        + Add Skill
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleSave}
                      className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 font-medium"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Profile Information */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <User size={16} className="text-gray-400" />
                      Profile Information
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-600 w-32">Full Name:</span>
                        <span className="font-medium">{profile.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-600 w-32">Email:</span>
                        <span className="font-medium">{profile.email}</span>
                      </div>
                      {profile.phone && (
                        <div className="flex items-center gap-3">
                          <span className="text-gray-600 w-32">Phone:</span>
                          <span className="font-medium">{profile.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Company Information - Only for recruiters */}
                  {profile.role === 'recruiter' && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Briefcase size={16} className="text-gray-400" />
                      Company Information
                    </h4>
                    <div className="space-y-3">
                      {profile.company_name && (
                        <div className="flex items-center gap-3">
                          <span className="text-gray-600 w-32">Company Name:</span>
                          <span className="font-medium">{profile.company_name}</span>
                        </div>
                      )}
                      {profile.company_number && (
                        <div className="flex items-center gap-3">
                          <span className="text-gray-600 w-32">Company Number:</span>
                          <span className="font-medium">{profile.company_number}</span>
                        </div>
                      )}
                      {profile.location && (
                        <div className="flex items-center gap-3">
                          <span className="text-gray-600 w-32">Company Location:</span>
                          <span className="font-medium">{profile.location}</span>
                        </div>
                      )}
                      {profile.position && (
                        <div className="flex items-center gap-3">
                          <span className="text-gray-600 w-32">Position:</span>
                          <span className="font-medium">{profile.position}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  )}

                  {/* Professional Information */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Briefcase size={16} className="text-gray-400" />
                      Professional Information
                    </h4>
                    <div className="space-y-3">
                      {profile.bio && (
                        <div>
                          <span className="text-gray-600 block mb-2">Bio:</span>
                          <p className="text-gray-800 leading-relaxed">{profile.bio}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Skills */}
                  {profile.skills && profile.skills.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <User size={16} className="text-gray-400" />
                        Skills
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Edit Button */}
                  <div className="pt-4">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 font-medium flex items-center gap-2"
                    >
                      <Edit size={16} />
                      Edit Profile
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
