"use client";
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Video, ChevronDown, CheckCircle, MapPin } from 'lucide-react';

interface InterviewModalProps {
  applicantName: string;
  isOpen: boolean;
  onClose: () => void;
}

const InterviewModal = ({ applicantName, isOpen, onClose }: InterviewModalProps) => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [interviewType, setInterviewType] = useState("Online Interview");

  // Reset success state whenever the modal is opened/closed
  useEffect(() => {
    if (!isOpen) {
      setIsSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSchedule = () => {
    console.log("Schedule button clicked!");
    setIsSuccess(true);
  };

  const handleFullClose = () => {
    console.log("Closing success view");
    setIsSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
      {/* Container */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-8 relative">
        
        {!isSuccess ? (
          /* --- STEP 1: SCHEDULING FORM --- */
          <div className="animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-bold text-slate-800 mb-6">
              Accept Application - {applicantName}
            </h2>

            <div className="space-y-6">
              {/* Interview Date & Time */}
              <div>
                <label className="block text-lg font-semibold text-slate-700 mb-3">Interview Date:</label>
                <div className="flex gap-4">
                  <div className="flex-1 relative group">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10" size={20} />
                    <input 
                      type="date" 
                      defaultValue="2026-03-02" 
                      className="w-full pl-10 pr-4 py-3 bg-slate-100 rounded-lg text-slate-600 font-medium border-none focus:ring-2 focus:ring-teal-500 outline-none cursor-pointer relative z-0"
                    />
                  </div>
                  <div className="flex-1 relative">
                    <input 
                      type="time" 
                      defaultValue="10:00" 
                      className="w-full px-4 py-3 bg-slate-100 rounded-lg text-slate-600 font-medium border-none focus:ring-2 focus:ring-teal-500 outline-none cursor-pointer"
                    />
                    <Clock className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  </div>
                </div>
              </div>

              {/* Interview Type Dropdown */}
              <div>
                <label className="block text-lg font-semibold text-slate-700 mb-3">Interview Type:</label>
                <div className="flex gap-4">
                  {/* Icon Indicator */}
                  <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-slate-200 rounded-lg text-slate-600 font-bold text-sm">
                    {interviewType === "Face to Face Interview" ? <MapPin size={18} /> : <Video size={18} />}
                    {interviewType === "Face to Face Interview" ? "In-Person" : "Video Call"}
                  </div>
                  
                  {/* Select Field */}
                  <div className="flex-1 relative">
                    <select 
                      value={interviewType}
                      onChange={(e) => {
                        console.log("New Selection:", e.target.value);
                        setInterviewType(e.target.value);
                      }}
                      className="w-full appearance-none px-4 py-3 bg-slate-100 rounded-lg text-slate-600 font-medium border border-transparent focus:border-teal-500 focus:ring-2 focus:ring-teal-500 outline-none cursor-pointer"
                    >
                      <option value="Online Interview">Online Interview</option>
                      <option value="Face to Face Interview">Face to Face Interview</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                  </div>
                </div>
              </div>

              {/* Interviewer */}
              <div className="flex items-center gap-4">
                <label className="text-lg font-semibold text-slate-700 shrink-0">Interviewer</label>
                <input 
                  type="text" 
                  defaultValue="John Smith" 
                  className="flex-1 px-4 py-3 bg-slate-100 rounded-lg text-slate-600 font-medium border-none focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              {/* Footer Buttons */}
              <div className="flex justify-between gap-4 mt-8">
                <button 
                  onClick={onClose}
                  className="px-8 py-3 bg-slate-200 text-slate-700 rounded-lg font-bold text-lg hover:bg-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSchedule}
                  className="flex-1 py-3 bg-[#10b981] text-white rounded-lg font-bold text-lg hover:bg-emerald-600 transition-all shadow-md shadow-emerald-100"
                >
                  Schedule Interview
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* --- STEP 2: SUCCESS MESSAGE --- */
          <div className="text-center py-6 animate-in fade-in scale-in duration-300">
            <div className="flex justify-center mb-6">
              <div className="bg-emerald-100 p-6 rounded-full">
                <CheckCircle size={80} className="text-emerald-500" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Success!</h2>
            <p className="text-slate-500 mb-8 px-4 text-lg">
              Interview has been scheduled for <br/>
              <span className="font-bold text-slate-700">{applicantName}</span>.
            </p>
            <button 
              onClick={handleFullClose}
              className="w-full py-4 bg-[#10b981] text-white rounded-lg font-bold text-lg hover:bg-emerald-600 transition-all shadow-lg"
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewModal;