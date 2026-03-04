"use client";
import React, { useState, useRef } from 'react';
import { 
  Upload, Phone, MapPin, Plus, Briefcase, 
  Building2, ArrowLeft, Wrench, X, FileText,
  CheckCircle2, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { useAuth } from '@/lib/useAuth';

// --- MODAL COMPONENT ---
const StatusModal = ({ 
  isOpen, 
  type, 
  message, 
  onClose 
}: { 
  isOpen: boolean; 
  type: 'success' | 'error'; 
  message: string; 
  onClose: () => void 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border-2 border-black transform animate-in zoom-in duration-300">
        <div className="flex flex-col items-center text-center">
          {type === 'success' ? (
            <CheckCircle2 size={64} className="text-emerald-500 mb-4" />
          ) : (
            <AlertCircle size={64} className="text-red-500 mb-4" />
          )}
          <h2 className="text-2xl font-black text-slate-800 mb-2">
            {type === 'success' ? 'Awesome!' : 'Oops!'}
          </h2>
          <p className="text-slate-600 font-bold mb-6">{message}</p>
          <button 
            onClick={onClose}
            className={`w-full py-3 rounded-xl font-black text-white transition-all shadow-md active:translate-y-1 ${
              type === 'success' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'
            }`}
          >
            {type === 'success' ? 'Continue' : 'Try Again'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function RegistrationPage() {
  const [role, setRole] = useState<'job-seeker' | 'recruiter'>('job-seeker');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { setUser } = useAuth({ redirect: false });
  const router = useRouter();
  
  // Modal States
  const [modalConfig, setModalConfig] = useState<{isOpen: boolean, type: 'success' | 'error', message: string}>({
    isOpen: false,
    type: 'success',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    phoneNumber: '',
    location: '',
    companyName: '',
    companyNumber: '',
    companyLocation: '',
    position: ''
  });

  const [skills, setSkills] = useState<string[]>(['']);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Restriction: Only allow numbers for phone fields
    if (name === 'phoneNumber' || name === 'companyNumber') {
      const onlyNums = value.replace(/[^0-9]/g, '');
      setFormData(prev => ({ ...prev, [name]: onlyNums }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation Logic
    const isJobSeeker = role === 'job-seeker';
    const trimmedSkills = skills.map((s) => s.trim()).filter(Boolean);
    const commonValid = isJobSeeker 
      ? formData.phoneNumber && formData.location && selectedFile && trimmedSkills.length === skills.length
      : formData.companyName && formData.companyNumber && formData.companyLocation && formData.position;

    if (!commonValid) {
      setModalConfig({
        isOpen: true,
        type: 'error',
        message: 'Please fill in all fields and upload required files.'
      });
      return;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      setModalConfig({
        isOpen: true,
        type: 'error',
        message: 'Please sign in to complete your profile.'
      });
      return;
    }

    const payload = new FormData();
    payload.append('_method', 'PUT');

    if (isJobSeeker) {
      payload.append('phone', formData.phoneNumber);
      payload.append('location', formData.location);
      payload.append('skills', JSON.stringify(trimmedSkills));
      if (selectedFile) {
        payload.append('profile_image', selectedFile);
      }
      payload.append('role', 'user');
    } else {
      payload.append('company_name', formData.companyName);
      payload.append('company_number', formData.companyNumber);
      payload.append('company_location', formData.companyLocation);
      payload.append('position', formData.position);
      payload.append('role', 'recruiter');
    }

    setIsSubmitting(true);

    try {
      const response = await api.post('/auth/profile', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setUser(response.data);
      if (typeof window !== 'undefined') {
        localStorage.setItem('accountType', role);
      }
      setModalConfig({
        isOpen: true,
        type: 'success',
        message: 'Your profile has been successfully updated!'
      });
      router.replace(isJobSeeker ? '/user/dashboard' : '/hr-dashboard');
    } catch (err: any) {
      const message = err.response?.data?.error || 'Unable to save your profile right now.';
      setModalConfig({
        isOpen: true,
        type: 'error',
        message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addSkillField = () => setSkills([...skills, '']);
  const updateSkill = (index: number, value: string) => {
    const newSkills = [...skills];
    newSkills[index] = value;
    setSkills(newSkills);
  };
  const removeSkill = (index: number) => {
    if (skills.length > 1) setSkills(skills.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col items-center justify-center p-6 font-sans">
      
      <StatusModal 
        isOpen={modalConfig.isOpen}
        type={modalConfig.type}
        message={modalConfig.message}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
      />

      {/* Role Toggle */}
      <div className="bg-white p-1 rounded-xl shadow-sm mb-8 flex gap-1 border border-black">
        <button
          type="button"
          onClick={() => setRole('job-seeker')}
          className={`px-10 py-3 rounded-lg text-sm font-bold transition-all ${
            role === 'job-seeker' ? 'bg-[#84b2ac] text-white shadow-md' : 'text-slate-500'
          }`}
        >
          Job Seeker
        </button>
        <button
          type="button"
          onClick={() => setRole('recruiter')}
          className={`px-10 py-3 rounded-lg text-sm font-bold transition-all ${
            role === 'recruiter' ? 'bg-[#84b2ac] text-white shadow-md' : 'text-slate-500'
          }`}
        >
          Recruiter
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-xl w-full max-w-4xl p-8 md:p-12 border border-slate-200">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-20 h-20 bg-[#84b2ac]/20 rounded-2xl flex items-center justify-center mb-4 border-2 border-black">
            <span className="text-[#3d6b66] font-black text-3xl">AVA</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800">
            Complete your {role === 'job-seeker' ? 'Job Seeker' : 'Recruiter'} Profile
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {role === 'job-seeker' ? (
            <>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Upload Profile Image *</label>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-black rounded-2xl p-10 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 cursor-pointer transition-all"
                >
                  {selectedFile ? (
                    <div className="flex flex-col items-center text-emerald-600">
                      <FileText size={40} className="mb-2" />
                      <p className="text-lg font-bold">{selectedFile.name}</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="text-blue-600 mb-2" size={40} />
                      <p className="text-base text-slate-700 font-medium">Choose File (Required)</p>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Phone Number (Numbers Only) *</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                      name="phoneNumber"
                      type="text"
                      inputMode="numeric"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      placeholder="e.g. 09123456789"
                      className="w-full pl-12 pr-4 py-4 bg-white border-2 border-black rounded-xl focus:ring-2 focus:ring-[#84b2ac] outline-none text-black font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Location *</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-4 bg-white border-2 border-black rounded-xl focus:ring-2 focus:ring-[#84b2ac] outline-none text-black font-bold"
                    />
                  </div>
                </div>
              </div>

              <div>
                <button type="button" onClick={addSkillField} className="flex items-center gap-2 text-[#2d4f4b] font-black text-sm bg-[#84b2ac]/20 border border-black px-5 py-2.5 rounded-lg mb-4 hover:bg-[#84b2ac]/40 transition-colors">
                  <Plus size={20} strokeWidth={3} /> Add Skills
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {skills.map((skill, index) => (
                    <div key={index} className="relative">
                      <Wrench className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="text" 
                        value={skill}
                        onChange={(e) => updateSkill(index, e.target.value)}
                        placeholder="Required skill..."
                        className="w-full pl-12 pr-12 py-3 border-2 border-black rounded-xl bg-white text-black font-bold"
                      />
                      {skills.length > 1 && (
                        <button type="button" onClick={() => removeSkill(index)} className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500">
                          <X size={20} strokeWidth={3} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: 'Company Name', name: 'companyName', icon: Building2, type: 'text' },
                { label: 'Company Number (Numbers Only)', name: 'companyNumber', icon: Phone, type: 'text' },
                { label: 'Company Location', name: 'companyLocation', icon: MapPin, type: 'text' },
                { label: 'Position', name: 'position', icon: Briefcase, type: 'text' },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-bold text-slate-700 mb-1">{field.label} *</label>
                  <div className="relative">
                    <field.icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                      name={field.name}
                      value={(formData as any)[field.name]}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-4 bg-white border-2 border-black rounded-xl focus:ring-2 focus:ring-[#84b2ac] outline-none text-black font-bold"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-10 flex flex-col items-center">
            <button type="submit" disabled={isSubmitting} className="w-full md:w-2/3 bg-[#84b2ac] hover:bg-[#6e9691] text-white py-5 rounded-xl font-black text-2xl transition-all shadow-lg active:translate-y-1 disabled:opacity-60 disabled:cursor-not-allowed">
              {isSubmitting ? 'Saving...' : 'Submit Information'}
            </button>
            <Link href="/" className="mt-6 flex items-center justify-center gap-2 text-slate-500 font-bold hover:text-black underline decoration-2">
              <ArrowLeft size={20} strokeWidth={3} /> Return to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}