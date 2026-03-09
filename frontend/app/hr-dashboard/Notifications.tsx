"use client";

import React, { useState } from 'react';
import { 
  Bell, 
  FileText, 
  MessageSquare, 
  Calendar, 
  Info, 
  CheckCircle2,
  Trash2
} from 'lucide-react';

// Mock Notification Data
const initialNotifications = [
  { 
    id: 1, 
    type: 'application', 
    title: 'New Application Received', 
    message: 'John Doe has applied for the Senior Frontend Developer position.', 
    time: '2 mins ago', 
    read: false 
  },
  { 
    id: 2, 
    type: 'message', 
    title: 'New Message', 
    message: 'Sarah Chen sent you a message regarding her upcoming interview details.', 
    time: '1 hour ago', 
    read: false 
  },
  { 
    id: 3, 
    type: 'interview', 
    title: 'Interview Confirmed', 
    message: 'Alice Johnson confirmed the interview for tomorrow at 10:00 AM.', 
    time: '3 hours ago', 
    read: true 
  },
  { 
    id: 4, 
    type: 'system', 
    title: 'Platform Maintenance', 
    message: 'The AVAA platform will undergo scheduled maintenance this Sunday at 2:00 AM PST.', 
    time: 'Yesterday', 
    read: true 
  },
  { 
    id: 5, 
    type: 'application', 
    title: 'Application Withdrawn', 
    message: 'Michael Chen has withdrawn his application for the Product Manager role.', 
    time: '2 days ago', 
    read: true 
  },
];

export default function Notifications() {
  const [notifications, setNotifications] = useState(initialNotifications);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'application':
        return <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0"><FileText size={18} /></div>;
      case 'message':
        return <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><MessageSquare size={18} /></div>;
      case 'interview':
        return <div className="w-10 h-10 rounded-full bg-[#7EB0AB]/10 text-[#53968b] flex items-center justify-center shrink-0"><Calendar size={18} /></div>;
      case 'system':
      default:
        return <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0"><Info size={18} /></div>;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto animate-in fade-in duration-300">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Notifications</h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 bg-red-50 text-red-600 text-xs font-bold rounded-full border border-red-100">
                {unreadCount} New
              </span>
            )}
          </div>
          <p className="text-[13px] text-slate-500">Stay updated with applicant activities and system alerts.</p>
        </div>

        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-[13px] font-bold hover:bg-slate-50 transition-colors shadow-sm"
          >
            <CheckCircle2 size={16} className="text-[#53968b]" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications List Container */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {notifications.length > 0 ? (
          <div className="divide-y divide-slate-50">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                onClick={() => markAsRead(notification.id)}
                className={`p-5 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 transition-colors cursor-pointer group ${notification.read ? 'bg-white hover:bg-slate-50/50' : 'bg-emerald-50/30 hover:bg-emerald-50/50'}`}
              >
                
                {/* Left side: Icon */}
                {getIcon(notification.type)}

                {/* Middle: Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className={`text-[15px] truncate pr-4 ${notification.read ? 'font-semibold text-slate-700' : 'font-bold text-slate-900'}`}>
                      {notification.title}
                    </h3>
                    <span className="text-[12px] font-medium text-slate-400 shrink-0 whitespace-nowrap">
                      {notification.time}
                    </span>
                  </div>
                  <p className={`text-[13px] leading-relaxed pr-8 ${notification.read ? 'text-slate-500' : 'text-slate-700 font-medium'}`}>
                    {notification.message}
                  </p>
                </div>

                {/* Right side: Actions (Visible on hover) */}
                <div className="flex items-center gap-3 sm:opacity-0 group-hover:opacity-100 transition-opacity self-end sm:self-center mt-2 sm:mt-0">
                  {!notification.read && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#53968b] shadow-sm sm:hidden block"></div>
                  )}
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete notification"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                
                {/* Indicator dot for desktop */}
                {!notification.read && (
                  <div className="hidden sm:flex items-center justify-center shrink-0 w-8">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#53968b] shadow-sm"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="py-16 px-6 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
              <Bell size={28} />
            </div>
            <h3 className="text-[16px] font-bold text-slate-800 mb-1">No notifications yet</h3>
            <p className="text-[13px] text-slate-500 max-w-sm mx-auto">
              When you have new applicants, messages, or interview updates, they will appear here.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}