"use client";

import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Plus, XCircle } from 'lucide-react';

interface CreateJobModalProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const PRESET_SKILLS = ['React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Vue', 'GraphQL', 'Docker', 'Kubernetes', 'PostgreSQL', 'Figma', 'Go', 'Rust', 'Swift'];
const PRESET_TAGS = ['Full-time', 'Part-time', 'Remote', 'Hybrid', 'On-site', 'Contract', 'Internship', 'Senior', 'Junior', 'Mid-level'];

function ComboBox({
  label,
  placeholder,
  items,
  selected,
  onAdd,
  onRemove,
}: {
  label: string;
  placeholder: string;
  items: string[];
  selected: string[];
  onAdd: (val: string) => void;
  onRemove: (val: string) => void;
}) {
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const filtered = items.filter(
    s => s.toLowerCase().includes(input.toLowerCase()) && !selected.includes(s)
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const add = (val: string) => {
    const t = val.trim();
    if (t && !selected.includes(t)) onAdd(t);
    setInput('');
    setOpen(false);
  };

  return (
    <div>
      {label && <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>}
      <div
        ref={wrapRef}
        className="relative border border-slate-200 rounded-lg bg-white focus-within:border-[#4c8479] focus-within:ring-1 focus-within:ring-[#4c8479]/30 transition-all"
      >
        <div className="flex flex-wrap gap-1.5 px-3 pt-2.5 pb-0">
          {selected.map(s => (
            <span key={s} className="inline-flex items-center gap-1 bg-[#4c8479]/10 text-[#4c8479] text-xs font-semibold px-2.5 py-1 rounded-full">
              {s}
              <button type="button" onClick={() => onRemove(s)} className="hover:text-red-400 transition-colors">
                <XCircle size={12} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex items-center px-3 py-2 gap-2">
          <input
            type="text"
            value={input}
            onChange={e => { setInput(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onKeyDown={e => {
              if (e.key === 'Enter' && input.trim()) { e.preventDefault(); add(input); }
              if (e.key === 'Escape') setOpen(false);
            }}
            placeholder={placeholder}
            className="flex-1 text-sm text-slate-700 placeholder-slate-300 outline-none bg-transparent min-w-0"
          />
          {input.trim() && (
            <button type="button" onClick={() => add(input)}
              className="shrink-0 flex items-center gap-0.5 text-xs text-[#4c8479] font-bold hover:underline whitespace-nowrap">
              <Plus size={12} /> Add
            </button>
          )}
        </div>
        {open && filtered.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-50 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-y-auto max-h-44">
            {filtered.map(s => (
              <button key={s} type="button" onMouseDown={() => add(s)}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-[#4c8479]/5 hover:text-[#4c8479] transition-colors">
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const CreateJobModal = ({ onClose, onSubmit }: CreateJobModalProps) => {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    salary: '',
    skills: [] as string[],
    tags: [] as string[],
    description: '',
    keyResponsibility: '',
    idealQualifications: '',
    projectTimeline: '',
    onboardingProcess: '',
    limit: '1',
    status: 'Active',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSalary = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData(prev => ({ ...prev, salary: e.target.value.replace(/[^0-9\-]/g, '') }));

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.company.trim()) return;
    onSubmit(formData);
  };

  const inputCls = 'w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-300 focus:outline-none focus:border-[#4c8479] focus:ring-1 focus:ring-[#4c8479]/30 transition-all bg-white';
  const labelCls = 'block text-sm font-semibold text-slate-700 mb-1.5';
  const textareaCls = `${inputCls} resize-none`;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div
        className="bg-white w-full rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ maxWidth: '820px', maxHeight: '90vh', animation: 'modalIn 0.18s ease' }}
      >
        {/* ── Solid teal header ── */}
        <div className="relative shrink-0" style={{ backgroundColor: '#4c8479', height: '108px' }}>
          {/* Logo */}
          <div className="absolute left-8" style={{ bottom: '-36px' }}>
            <input type="file" ref={fileInputRef} onChange={handleLogoChange} className="hidden" accept="image/*" />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center overflow-hidden transition-all group"
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '14px',
                border: '4px solid white',
                background: 'white',
                boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
              }}
            >
              {logoPreview ? (
                <img src={logoPreview} alt="logo" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-1 text-slate-300 group-hover:text-[#4c8479] transition-colors">
                  <Upload size={16} />
                  <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.04em' }}>LOGO</span>
                </div>
              )}
            </button>
          </div>

          {/* Title in header */}
          <div className="absolute" style={{ bottom: '16px', left: '108px' }}>
            <p className="font-bold text-white" style={{ fontSize: '16px' }}>Post a New Job</p>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>Fill in the details to publish a listing</p>
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute flex items-center justify-center transition-colors"
            style={{
              top: '14px', right: '14px',
              width: '32px', height: '32px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.18)',
            }}
            onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.28)')}
            onMouseOut={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.18)')}
          >
            <X size={15} className="text-white" />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="overflow-y-auto flex-1 px-8 pb-7" style={{ paddingTop: '56px' }}>
          <div className="space-y-4">

            {/* Tags */}
            <ComboBox
              label="Tags"
              placeholder="Add tags (e.g. Remote, Full-time, Senior…)"
              items={PRESET_TAGS}
              selected={formData.tags}
              onAdd={v => setFormData(p => ({ ...p, tags: [...p.tags, v] }))}
              onRemove={v => setFormData(p => ({ ...p, tags: p.tags.filter(t => t !== v) }))}
            />

            <div className="border-t border-slate-100" />

            {/* Job Title */}
            <div>
              <label className={labelCls}>Job Title</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange}
                placeholder="e.g. Senior Frontend Developer" className={inputCls} />
            </div>

            {/* Company + Location */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Company</label>
                <input type="text" name="company" value={formData.company} onChange={handleChange}
                  placeholder="Company name" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Location</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange}
                  placeholder="e.g. Remote · New York" className={inputCls} />
              </div>
            </div>

            {/* Salary + Skills */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Salary Range</label>
                <input type="text" name="salary" value={formData.salary} onChange={handleSalary}
                  placeholder="e.g. 80000-120000" className={inputCls} />
              </div>
              <ComboBox
                label="Skills Required"
                placeholder="Select or type a skill…"
                items={PRESET_SKILLS}
                selected={formData.skills}
                onAdd={v => setFormData(p => ({ ...p, skills: [...p.skills, v] }))}
                onRemove={v => setFormData(p => ({ ...p, skills: p.skills.filter(s => s !== v) }))}
              />
            </div>

            <div className="border-t border-slate-100" />

            {/* Description */}
            <div>
              <label className={labelCls}>Job Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange}
                placeholder="Briefly describe the role and its goals…" rows={2} className={textareaCls} />
            </div>

            {/* Key Responsibility + Ideal Qualifications */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Key Responsibility</label>
                <textarea name="keyResponsibility" value={formData.keyResponsibility} onChange={handleChange}
                  placeholder="Main day-to-day responsibilities…" rows={3} className={textareaCls} />
              </div>
              <div>
                <label className={labelCls}>Ideal Qualifications</label>
                <textarea name="idealQualifications" value={formData.idealQualifications} onChange={handleChange}
                  placeholder="Required skills, experience…" rows={3} className={textareaCls} />
              </div>
            </div>

            {/* Timeline + Onboarding */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Project Timeline</label>
                <textarea name="projectTimeline" value={formData.projectTimeline} onChange={handleChange}
                  placeholder="Expected duration or milestones…" rows={3} className={textareaCls} />
              </div>
              <div>
                <label className={labelCls}>Application & Onboarding Process</label>
                <textarea name="onboardingProcess" value={formData.onboardingProcess} onChange={handleChange}
                  placeholder="Hiring funnel and onboarding steps…" rows={3} className={textareaCls} />
              </div>
            </div>

            <div className="border-t border-slate-100" />

            {/* Limit + Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Application Limit</label>
                <input type="number" name="limit" value={formData.limit} onChange={handleChange} min={1}
                  className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Status</label>
                <div className="relative">
                  <select name="status" value={formData.status} onChange={handleChange}
                    className={`${inputCls} appearance-none cursor-pointer`}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none w-4 h-4"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="px-8 py-4 border-t border-slate-100 bg-white flex justify-end gap-3 shrink-0 rounded-b-2xl">
          <button onClick={onClose}
            className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-all">
            Cancel
          </button>
          <button onClick={handleSubmit}
            className="px-7 py-2.5 text-white rounded-lg text-sm font-bold transition-all shadow-sm active:scale-95"
            style={{ backgroundColor: '#4c8479' }}
            onMouseOver={e => (e.currentTarget.style.backgroundColor = '#3d6e64')}
            onMouseOut={e => (e.currentTarget.style.backgroundColor = '#4c8479')}
          >
            Create Job
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.98) translateY(6px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default CreateJobModal;