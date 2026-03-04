"use client";

import React, { useState, useRef } from 'react';
import Image from "next/image";
import { X, Upload, Plus, ChevronDown, DollarSign, Calendar, Users, MapPin } from 'lucide-react';

interface CreateJobModalProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const CreateJobModal = ({ onClose, onSubmit }: CreateJobModalProps) => {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false); // Controls which view is shown
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form States to capture data for the preview
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    salary: '',
    skills: ['React', 'Node.JS', 'AWS (EC2, Lambda)'], // Placeholder skills
    description: '',
    limit: '1',
    status: 'Active'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-5xl rounded-[24px] shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-200">
        
        {/* Dynamic Header based on state */}
        <div className="px-10 pt-8 pb-2 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {isPreview ? `Job Details: ${formData.title || 'Untitled Position'}` : 'Create New Job Posting'}
            </h2>
            {isPreview && formData.location && (
              <div className="flex items-center gap-1 text-slate-500 text-sm mt-0.5">
                <MapPin size={14} /> {formData.location}
              </div>
            )}
          </div>
          <button 
            onClick={onClose} 
            className="group p-1.5 rounded-full border border-slate-300 text-slate-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all duration-200 ease-in-out"
          >
            <X size={20} className="transition-transform duration-200 group-hover:rotate-90" />
          </button>
        </div>
        
        <div className="mx-10 border-b border-slate-200 mb-6"></div>

        <div className="px-10 pb-10 max-h-[80vh] overflow-y-auto">
          {!isPreview ? (
            /* --- STEP 1: CREATE JOB FORM (Your original code) --- */
            <div className="flex flex-col md:flex-row gap-12">
              <div className="flex flex-col items-center pt-4">
                <input type="file" ref={fileInputRef} onChange={handleLogoChange} className="hidden" accept="image/*" />
                <div onClick={() => fileInputRef.current?.click()} className="w-36 h-36 border-2 border-dashed border-slate-300 rounded-full flex flex-col items-center justify-center overflow-hidden bg-slate-50 hover:bg-slate-100 cursor-pointer transition-all group mb-4 relative">
                  {logoPreview ? (
                    <Image src={logoPreview} alt="Company logo preview" fill className="object-cover" unoptimized sizes="144px" />
                  ) : (
                    <>
                      <Upload size={28} className="mb-1 text-slate-400 group-hover:text-[#8abeb2]" />
                      <span className="text-[11px] font-medium text-slate-400">Upload Logo</span>
                    </>
                  )}
                </div>
                <button className="flex items-center gap-1.5 px-4 py-1.5 bg-white border border-slate-200 text-slate-500 rounded-full text-xs font-bold hover:shadow-sm transition-all">
                  <Plus size={14} /> Add tags
                </button>
              </div>

              <div className="flex-1 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">Job Title</label>
                  <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="Job Title" className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-[#8abeb2]/20 focus:border-[#8abeb2] transition-all placeholder:text-slate-400" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">Company</label>
                    <input type="text" name="company" value={formData.company} onChange={handleInputChange} placeholder="Company" className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-[#8abeb2]/20 focus:border-[#8abeb2]" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">Location</label>
                    <input type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="Location" className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-[#8abeb2]/20 focus:border-[#8abeb2]" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">Salary Range</label>
                    <input type="text" name="salary" value={formData.salary} onChange={handleInputChange} placeholder="Salary Range" className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-[#8abeb2]/20 focus:border-[#8abeb2]" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">Skills Required</label>
                    <div className="relative">
                      <select className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-[#8abeb2]/20 focus:border-[#8abeb2] appearance-none">
                        <option value="" disabled selected>Select Skills</option>
                        <option>React</option>
                        <option>TypeScript</option>
                        <option>Tailwind CSS</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">Job Description</label>
                  <textarea rows={3} name="description" value={formData.description} onChange={handleInputChange} placeholder="Describe the role..." className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-[#8abeb2]/20 focus:border-[#8abeb2] resize-none" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">Application Limit</label>
                    <input type="number" name="limit" value={formData.limit} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-[#8abeb2]/20 focus:border-[#8abeb2]" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">Status</label>
                    <div className="relative">
                      <select name="status" value={formData.status} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-[#8abeb2]/20 focus:border-[#8abeb2] appearance-none">
                        <option>Active</option>
                        <option>Inactive</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button onClick={() => setIsPreview(true)} className="px-8 py-2.5 bg-[#8abeb2] text-white rounded-xl font-bold text-sm hover:bg-[#79a89d] transition-all shadow-md">
                    Create Job
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* --- STEP 2: PREVIEW / VIEW DETAILS MODAL (Matching image_384878.png) --- */
            <div className="animate-in slide-in-from-bottom-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
                
                {/* Logo and Tags Section */}
                <div className="md:col-span-3 flex flex-col items-center gap-4">
                  <div className="w-40 h-40 rounded-full bg-[#1e454e] flex items-center justify-center text-white text-4xl font-bold overflow-hidden relative">
                    {logoPreview ? (
                      <Image src={logoPreview} alt="Company logo" fill className="object-cover" unoptimized sizes="160px" />
                    ) : (
                      formData.company?.substring(0, 2).toUpperCase() || "TN"
                    )}
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {['React', 'API Design', 'TechStack', 'Leadership'].map(tag => (
                      <span key={tag} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold border border-slate-200">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Info Cards Grid */}
                <div className="md:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Job Overview Card */}
                  <div className="p-6 border border-slate-100 rounded-[20px] shadow-sm bg-white flex flex-col items-center">
                    <h3 className="text-slate-800 font-bold tracking-[0.2em] mb-6 uppercase">Job Overview</h3>
                    <div className="w-full space-y-4">
                      <div className="flex items-center gap-3 text-slate-600">
                        <div className="p-1.5 border border-slate-900 rounded-md"><DollarSign size={16} /></div>
                        <span className="text-sm font-semibold">Salary Range: {formData.salary || "$120k - $160k"}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-600">
                        <div className="p-1.5 border border-slate-900 rounded-md"><Calendar size={16} /></div>
                        <span className="text-sm font-semibold">Posted Date: 2026-02-07</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-600">
                        <div className="p-1.5 border border-slate-900 rounded-md"><Users size={16} /></div>
                        <span className="text-sm font-semibold">Application Limit: {formData.limit}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tech Stack Card */}
                  <div className="p-6 border border-slate-100 rounded-[20px] shadow-sm bg-white flex flex-col items-center">
                    <h3 className="text-slate-800 font-bold tracking-[0.2em] mb-6 uppercase">Technical Requirements</h3>
                    <div className="w-full space-y-4">
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">*Must-Have Skills:</p>
                        <div className="flex flex-wrap gap-2">
                          {['React', 'Node.JS', 'AWS (EC2, Lambda)'].map(skill => (
                            <span key={skill} className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-[10px] font-bold border border-slate-200">{skill}</span>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">*Preferred Skills:</p>
                        <div className="flex flex-wrap gap-2">
                          {['Docker', 'UI/UX Principles'].map(skill => (
                            <span key={skill} className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-[10px] font-bold border border-slate-200">{skill}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Job Description Section */}
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-slate-800">JOB DESCRIPTION</h3>
                <div className="p-6 border border-slate-200 rounded-[20px] bg-white">
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {formData.description || "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat..."}
                  </p>
                </div>
              </div>

              {/* Final Submit Button */}
              <div className="flex justify-end pt-8 gap-4">
                <button onClick={() => setIsPreview(false)} className="px-6 py-2.5 border border-slate-300 text-slate-500 rounded-xl font-bold text-sm hover:bg-slate-50">
                  Edit
                </button>
                <button onClick={() => onSubmit(formData)} className="px-10 py-2.5 bg-[#8abeb2] text-white rounded-xl font-bold text-sm hover:bg-[#79a89d] transition-all shadow-md">
                  Post Job
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateJobModal;