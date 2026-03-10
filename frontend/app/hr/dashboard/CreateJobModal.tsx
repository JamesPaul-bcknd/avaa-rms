"use client";

import React, { useState, useRef } from 'react';
import Image from "next/image";
import { X, Upload, ChevronDown, Plus } from 'lucide-react';

interface CreateJobModalProps {
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

const CreateJobModal = ({ onClose, onSubmit }: CreateJobModalProps) => {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [salaryError, setSalaryError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    salary: '',
    skills: '',
    description: '',
    responsibilities: '',
    qualifications: '',
    timeline: '',
    onboarding: '',
    limit: '1',
    status: 'Active'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'salary') {
      const numericValue = value.replace(/\D/g, '');
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
      setSalaryError('');
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
    setSubmitError('');
  };

  const validateSalary = (): boolean => {
    if (!formData.salary) return true;
    const isNumeric = /^\d+$/.test(formData.salary);
    if (!isNumeric) {
      setSalaryError('Numbers only.');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateSalary()) return;
    try {
      setIsSubmitting(true);
      setSubmitError('');
      await onSubmit(formData);
    } catch (error: any) {
      setSubmitError(error?.response?.data?.message || 'Unable to post job.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-5xl rounded-[30px] shadow-2xl overflow-hidden relative flex flex-col max-h-[95vh]">
        
        {/* Teal Header */}
        <div className="h-32 bg-[#84b3af] relative flex-shrink-0">
          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors z-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* --- LOGO SECTION (Fixed outside scroll area for perfect alignment) --- */}
        <div className="absolute top-32 left-12 -translate-y-1/2 z-20">
          <input type="file" ref={fileInputRef} onChange={handleLogoChange} className="hidden" accept="image/*" />
          <div 
            onClick={() => fileInputRef.current?.click()} 
            className="w-36 h-36 bg-white border-[6px] border-white rounded-full shadow-lg flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:bg-slate-50 transition-all group"
          >
            {logoPreview ? (
              <Image src={logoPreview} alt="Logo" fill className="object-cover" unoptimized />
            ) : (
              <div className="flex flex-col items-center">
                <Upload size={32} className="text-slate-300 group-hover:text-[#84b3af] transition-colors" />
                <span className="text-[11px] font-bold text-slate-400 uppercase mt-2 text-center px-4 leading-tight">Upload Logo</span>
              </div>
            )}
          </div>
          {/* Add Tags Button sitting right under the circle */}
          <button className="mt-4 flex items-center gap-1.5 px-5 py-2 bg-white border border-slate-200 text-slate-500 rounded-full text-[10px] font-bold uppercase hover:shadow-sm transition-all">
            <Plus size={14} /> Add tags
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="px-12 pb-10 pt-20 overflow-y-auto custom-scrollbar relative">
          <div className="flex flex-col md:flex-row gap-10">
            
            {/* Left Column Spacer (Keeps right side aligned while circle floats on the left) */}
            <div className="hidden md:block flex-shrink-0 w-40" />

            {/* Right Column: All Form Fields */}
            <div className="flex-1 space-y-6">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-tight">Job Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="Enter Job Title" className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-100 rounded-lg text-sm outline-none focus:border-[#84b3af] focus:bg-white transition-all" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-tight">Company</label>
                  <input type="text" name="company" value={formData.company} onChange={handleInputChange} placeholder="Company Name" className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-100 rounded-lg text-sm outline-none focus:border-[#84b3af]" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-tight">Location</label>
                  <input type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="City, Country" className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-100 rounded-lg text-sm outline-none focus:border-[#84b3af]" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-tight">Salary Range</label>
                  <input type="text" name="salary" value={formData.salary} onChange={handleInputChange} placeholder="Numbers Only" className={`w-full px-4 py-2.5 bg-slate-50/50 border ${salaryError ? 'border-red-400' : 'border-slate-100'} rounded-lg text-sm outline-none focus:border-[#84b3af]`} />
                  {salaryError && <p className="text-[10px] text-red-500 font-bold uppercase">{salaryError}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-tight">Skills Required</label>
                  <div className="relative">
                    <select name="skills" value={formData.skills} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-100 rounded-lg text-sm outline-none appearance-none text-slate-500">
                      <option value="">Select Skills</option>
                      <option value="react">React</option>
                      <option value="node">Node.js</option>
                      <option value="aws">AWS</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Text Areas */}
              {[
                { label: 'Job Description', name: 'description' },
                { label: 'Key Responsibility', name: 'responsibilities' },
                { label: 'Ideal Qualifications', name: 'qualifications' },
                { label: 'Project Timeline', name: 'timeline' },
                { label: 'Application & Onboarding Process', name: 'onboarding' }
              ].map((field) => (
                <div key={field.name} className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-tight">{field.label}</label>
                  <textarea 
                    name={field.name} 
                    rows={3} 
                    value={(formData as any)[field.name]} 
                    onChange={handleInputChange} 
                    placeholder={`Enter ${field.label.toLowerCase()}...`} 
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-100 rounded-lg text-sm outline-none focus:border-[#84b3af] resize-none" 
                  />
                </div>
              ))}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-tight">Application Limit</label>
                  <input type="number" name="limit" value={formData.limit} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-100 rounded-lg text-sm outline-none focus:border-[#84b3af]" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-tight">Status</label>
                  <div className="relative">
                    <select name="status" value={formData.status} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-100 rounded-lg text-sm outline-none appearance-none">
                      <option>Active</option>
                      <option>Inactive</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={onClose} 
                  className="px-6 py-2.5 border border-slate-200 text-slate-500 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
                >
                  Close
                </button>
                <button 
                  type="button"
                  onClick={handleSubmit} 
                  disabled={isSubmitting}
                  className="px-10 py-2.5 bg-[#84b3af] text-white rounded-xl text-sm font-bold hover:bg-[#729e9a] transition-all shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Posting...' : 'Create Job'}
                </button>
              </div>
              {submitError && <p className="text-xs text-red-500 text-right mt-2 font-bold">{submitError}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateJobModal;