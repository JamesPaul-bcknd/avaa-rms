'use client';

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/lib/useAuth";
import { messagesApi, Message, Conversation } from "@/lib/messages";
import { formatDistanceToNow } from "date-fns";
import {
  Search, MoreVertical, Paperclip, ImageIcon,
  Smile, Send, Ban, Flag, ArrowLeft,
  BellOff, Archive, Trash2, Edit
} from "lucide-react";

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [fileInputRef, setFileInputRef] = useState<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [messageMenuOpen, setMessageMenuOpen] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [selectedReportOption, setSelectedReportOption] = useState("inappropriate");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth({ redirect: false });

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const makeDummy = (userId: string): Conversation => ({
    user: { id: parseInt(userId), name: 'Recruiter', profile_image: undefined },
    latest_message: {
      id: 0,
      sender_id: user?.id || 0,
      receiver_id: parseInt(userId),
      content: 'Start a conversation',
      type: 'text',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sender: { id: user?.id || 0, name: user?.name || 'You' },
      receiver: { id: parseInt(userId), name: 'Recruiter' }
    },
    unread_count: 0,
    updated_at: new Date().toISOString()
  });

  // ── Data fetching ─────────────────────────────────────────
  useEffect(() => { fetchConversations(); }, []);

  useEffect(() => {
    const userIdParam = searchParams.get('userId');
    if (userIdParam) {
      if (!loading) {
        const target = conversations.find(conv => conv.user.id === parseInt(userIdParam));
        setSelectedConversation(target || makeDummy(userIdParam));
        setPendingUserId(null);
      } else {
        setPendingUserId(userIdParam);
      }
    }
  }, [searchParams, conversations, loading, user?.id, user?.name]);

  useEffect(() => {
    if (pendingUserId && !loading) {
      const target = conversations.find(conv => conv.user.id === parseInt(pendingUserId));
      setSelectedConversation(target || makeDummy(pendingUserId));
      setPendingUserId(null);
    }
  }, [pendingUserId, conversations, loading, user?.id, user?.name]);

  useEffect(() => {
    if (selectedConversation) fetchMessages(selectedConversation.user.id);
  }, [selectedConversation]);

  useEffect(() => { scrollToBottom(); }, [messages]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await messagesApi.getConversations();
      setConversations(response.data);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId: number) => {
    try {
      const response = await messagesApi.getConversation(userId);
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() && !selectedFile) return;
    if (!selectedConversation) return;
    try {
      setSendingMessage(true);
      const messageData: any = { content: newMessage.trim() };
      if (selectedFile) messageData.file = selectedFile;
      const response = await messagesApi.sendMessage(selectedConversation.user.id, messageData);
      setMessages(prev => [...prev, response.data]);
      setNewMessage("");
      setSelectedFile(null);
      if (fileInputRef) fileInputRef.value = '';
      fetchConversations();
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  const formatTime = (dateString: string) =>
    formatDistanceToNow(new Date(dateString), { addSuffix: true });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert('File size must be less than 10MB'); return; }
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type) && !file.type.startsWith('image/')) {
      alert('Invalid file type. Only images, PDFs, and Word documents are allowed.');
      return;
    }
    setSelectedFile(file);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const returnToChat = () => { setIsComposing(false); setIsReporting(false); };

  // ── Report options — matches HR dashboard exactly ─────────
  const reportOptions = [
    { value: "inappropriate", label: "Inappropriate behavior", desc: "Unprofessional language, harassment, or offensive communication style." },
    { value: "spam", label: "Spam or automated content", desc: "Unsolicited marketing, bots, or excessive repetitive messages." },
    { value: "scam", label: "Suspicious job offer or scam", desc: 'Asking for bank details, external payments, or "get rich quick" schemes.' },
    { value: "identity1", label: "Identity theft or faking profile", desc: "Using a fake name, photo, or pretending to represent a company they don't." },
    { value: "other", label: "Other concern", desc: "None of the above matches my specific concern." },
  ];

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <div className="px-6 lg:px-10 py-8">

        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-[28px] font-bold text-[#1a1a1a] mb-1">Messages</h1>
          <p className="text-[15px] text-[#5a6a75]">Your conversations with recruiters.</p>
        </div>

        {/* Messages panel */}
        <div
          className="flex overflow-hidden rounded-2xl border border-[#e5e7eb] shadow-sm"
          style={{ height: "calc(100vh - 220px)" }}
        >

          {/* ── Left: dark conversation sidebar ── */}
          <aside className="w-[280px] bg-[#1a232f] text-white flex flex-col shrink-0 rounded-l-2xl">

            <div className="px-5 pt-6 pb-3 flex items-center justify-between">
              <h2 className="text-[15px] font-bold text-white">Conversations</h2>
              <button
                onClick={() => { setIsComposing(true); setIsReporting(false); }}
                className="p-1.5 bg-white/10 text-gray-300 rounded-lg hover:bg-white/20 transition-colors"
              >
                <Edit size={14} />
              </button>
            </div>

            <div className="px-4 mb-3">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className="w-full bg-[#2a3441] text-sm text-white rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#7EB0AB]/50 placeholder-gray-400"
                />
              </div>
            </div>

            {/* All / Archived tabs */}
            <div className="px-4 flex gap-2 mb-3">
              <button className="px-4 py-1 bg-[#7EB0AB] text-white text-xs font-semibold rounded-md">All</button>
              <button className="px-4 py-1 bg-[#4b5563] text-gray-300 text-xs font-semibold rounded-md hover:bg-gray-600 transition-colors">Archived</button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
              {loading ? (
                <div className="p-4 text-center text-gray-400 text-sm">Loading conversations...</div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-400 text-sm">No conversations yet</div>
              ) : (
                conversations.map((conversation) => (
                  <button
                    key={conversation.user.id}
                    onClick={() => { setSelectedConversation(conversation); setIsComposing(false); setIsReporting(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${selectedConversation?.user.id === conversation.user.id
                        ? "bg-[#24303f]"
                        : "hover:bg-white/5"
                      }`}
                  >
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-lg bg-[#7EB0AB] text-white flex items-center justify-center text-sm font-bold">
                        {getInitials(conversation.user.name)}
                      </div>
                      {conversation.unread_count > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] flex items-center justify-center font-bold">
                          {conversation.unread_count}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold truncate text-white">{conversation.user.name}</p>
                        <span className="text-[10px] text-gray-400 shrink-0 ml-1">{formatTime(conversation.updated_at)}</span>
                      </div>
                      <p className="text-xs truncate text-gray-400 mt-0.5">
                        {conversation.latest_message.type === 'file'
                          ? `📎 ${conversation.latest_message.content}`
                          : conversation.latest_message.content}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </aside>

          {/* ── Right: chat area ── */}
          <div className="flex-1 flex flex-col min-w-0 bg-white rounded-r-2xl overflow-hidden">
            {isComposing ? (
              <>
                <div className="px-6 py-5 border-b border-[#f0f2f5] flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <span className="text-[14px] font-bold text-[#1a1a1a] w-[100px] shrink-0">New message</span>
                    <input
                      type="text"
                      placeholder="Type a name or multiple names"
                      className="flex-1 px-4 py-2.5 border border-[#e5e7eb] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#7EB0AB] placeholder-gray-400 text-[#1a1a1a]"
                    />
                  </div>
                </div>
                <div className="flex-1 bg-white" />
                <div className="border-t border-[#f0f2f5] bg-white px-6 py-4 flex items-center gap-4">
                  <div className="flex items-center gap-1 text-[#9ca3af] shrink-0">
                    <button className="p-2 hover:text-[#5a6a75] hover:bg-[#f5f7fa] rounded-full transition-colors"><Paperclip size={20} /></button>
                    <button className="p-2 hover:text-[#5a6a75] hover:bg-[#f5f7fa] rounded-full transition-colors"><ImageIcon size={20} /></button>
                  </div>
                  <input type="text" placeholder="Write a message..." className="flex-1 text-[15px] bg-transparent text-[#1a1a1a] placeholder-gray-400 focus:outline-none" />
                  <div className="flex items-center gap-2 shrink-0">
                    <button className="p-2 text-[#9ca3af] hover:text-[#5a6a75] hover:bg-[#f5f7fa] rounded-full transition-colors"><Smile size={20} /></button>
                    <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#7EB0AB] hover:bg-[#6a9e99] text-white shadow-sm ml-1"><Send size={18} className="ml-0.5" /></button>
                  </div>
                </div>
              </>
            ) : selectedConversation ? (
              <>
                {/* Chat header — always visible unless reporting */}
                {!isReporting && (
                  <div className="px-6 py-4 flex items-center justify-between border-b border-[#f0f2f5]">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#1e3a4f] text-white flex items-center justify-center text-sm font-bold">
                        {getInitials(selectedConversation.user.name)}
                      </div>
                      <div>
                        <p className="text-[14px] font-bold text-[#1a1a1a]">{selectedConversation.user.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Online</span>
                        </div>
                      </div>
                    </div>

                    {/* ⋮ Option menu */}
                    <div className="relative">
                      <button
                        onClick={() => setMessageMenuOpen(!messageMenuOpen)}
                        className="p-2 text-[#9ca3af] hover:bg-[#f0f2f5] rounded-full transition-colors"
                      >
                        <MoreVertical size={17} />
                      </button>
                      {messageMenuOpen && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setMessageMenuOpen(false)} />
                          <div className="absolute right-0 mt-1 w-52 bg-white border border-[#e5e7eb] rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] z-50 py-1.5">
                            <div className="px-4 py-2 border-b border-[#f0f2f5] mb-1">
                              <span className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider">Option Menu</span>
                            </div>
                            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-[#5a6a75] hover:bg-[#f5f7fa]">
                              <BellOff size={15} className="text-[#9ca3af]" /> Mute Notification
                            </button>
                            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-[#5a6a75] hover:bg-[#f5f7fa]">
                              <Archive size={15} className="text-[#9ca3af]" /> Archive Conversation
                            </button>
                            <div className="h-px bg-[#f0f2f5] my-1 mx-4" />
                            <button
                              onClick={() => { setIsBlockModalOpen(true); setMessageMenuOpen(false); }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-[#5a6a75] hover:bg-[#f5f7fa]"
                            >
                              <Ban size={15} className="text-[#9ca3af]" /> Block
                            </button>
                            <button
                              onClick={() => { setIsReporting(true); setMessageMenuOpen(false); }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-[#5a6a75] hover:bg-[#f5f7fa]"
                            >
                              <Flag size={15} className="text-[#9ca3af]" /> Report
                            </button>
                            <div className="h-px bg-[#f0f2f5] my-1 mx-4" />
                            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50">
                              <Trash2 size={15} className="text-red-400" /> Delete Conversation
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* ── Report UI ── */}
                {isReporting ? (
                  <div className="flex-1 overflow-y-auto px-8 lg:px-14 py-10 bg-white">
                    <button
                      onClick={returnToChat}
                      className="flex items-center gap-2 text-sm font-bold text-[#7EB0AB] hover:text-[#6a9e99] mb-8 transition-colors"
                    >
                      <ArrowLeft size={18} /> Back to Messages
                    </button>

                    <div className="max-w-2xl">
                      <h2 className="text-[22px] font-bold text-[#1a1a1a] mb-2">Report Safety Concern</h2>
                      <p className="text-[13px] text-[#5a6a75] mb-8">Your safety is our priority. Reports are handled confidentially by our trust and safety team.</p>

                      {/* Reported user card */}
                      <div className="flex items-center gap-4 p-4 border border-[#e5e7eb] rounded-xl mb-10">
                        <div className="w-11 h-11 rounded-full bg-[#1e3a4f] text-white flex items-center justify-center text-sm font-bold shrink-0">
                          {getInitials(selectedConversation.user.name)}
                        </div>
                        <div>
                          <p className="text-[14px] font-bold text-[#1a1a1a]">Reporting: {selectedConversation.user.name}</p>
                        </div>
                      </div>

                      <h3 className="text-[15px] font-bold text-[#1a1a1a] mb-4">What's the main reason for your report?</h3>

                      <div className="space-y-3 mb-10">
                        {reportOptions.map((opt) => (
                          <label
                            key={opt.value}
                            className={`flex items-start gap-4 p-4 rounded-xl cursor-pointer border transition-colors ${selectedReportOption === opt.value
                                ? "border-[#7EB0AB] bg-[#e6f7f2]"
                                : "border-[#e5e7eb] hover:bg-[#f5f7fa]"
                              }`}
                          >
                            <input
                              type="radio"
                              name="report"
                              value={opt.value}
                              checked={selectedReportOption === opt.value}
                              onChange={(e) => setSelectedReportOption(e.target.value)}
                              className="mt-0.5 w-4 h-4 text-[#7EB0AB] focus:ring-[#7EB0AB] border-gray-300"
                            />
                            <div>
                              <p className="text-[14px] font-bold text-[#1a1a1a] mb-0.5">{opt.label}</p>
                              <p className="text-[13px] text-[#5a6a75]">{opt.desc}</p>
                            </div>
                          </label>
                        ))}
                      </div>

                      <h3 className="text-[14px] font-bold text-[#1a1a1a] mb-3">Additional details (Optional)</h3>
                      <textarea
                        className="w-full border border-[#e5e7eb] rounded-xl p-4 text-[14px] text-[#1a1a1a] focus:outline-none focus:ring-1 focus:ring-[#7EB0AB] resize-none h-28 mb-2 placeholder-gray-400"
                        placeholder="Please provide more context or specific examples to help us investigate..."
                      />
                      <p className="text-[12px] text-[#9ca3af] mb-8">Maximum 1000 characters.</p>

                      <div className="flex justify-end gap-3 mb-10">
                        <button
                          onClick={returnToChat}
                          className="px-6 py-2.5 border border-[#e5e7eb] rounded-xl text-sm font-bold text-[#5a6a75] hover:bg-[#f5f7fa] transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={returnToChat}
                          className="px-6 py-2.5 bg-[#7EB0AB] hover:bg-[#6a9e99] text-white rounded-xl text-sm font-bold transition-colors shadow-sm"
                        >
                          Submit Report
                        </button>
                      </div>
                    </div>
                  </div>

                ) : (
                  <>
                    {/* ── Messages ── */}
                    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 bg-[#f9fafb]">
                      <div className="flex justify-center mb-4">
                        <span className="px-4 py-1 bg-white border border-[#e5e7eb] text-[#9ca3af] text-[10px] font-semibold uppercase tracking-wide rounded-full">Today</span>
                      </div>

                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className="max-w-xl">
                            <div className={`rounded-2xl px-5 py-3.5 text-[14px] leading-relaxed shadow-sm ${message.sender_id === user?.id
                                ? 'bg-[#7EB0AB] text-white rounded-tr-none'
                                : 'bg-white border border-[#e5e7eb] rounded-tl-none text-[#1a1a1a]'
                              }`}>
                              {message.type === 'file' ? (
                                <div>
                                  <div className="flex items-center gap-2"><span>📎</span><span>{message.content}</span></div>
                                  {message.file_path && (
                                    <a href={`http://127.0.0.1:8000/storage/${message.file_path}`} target="_blank" className="text-xs underline mt-1 block">View File</a>
                                  )}
                                </div>
                              ) : message.type === 'image' ? (
                                <div>
                                  <Image src={`http://127.0.0.1:8000/storage/${message.file_path}`} alt="Shared image" width={300} height={200} className="max-w-full rounded-lg mb-1" style={{ objectFit: 'cover' }} />
                                  <span>{message.content}</span>
                                </div>
                              ) : message.content}
                            </div>
                            <p className={`mt-1 text-[11px] text-[#9ca3af] font-medium px-1 ${message.sender_id === user?.id ? 'text-right' : 'text-left'}`}>
                              {formatTime(message.created_at)}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* ── Composer ── */}
                    <div className="border-t border-[#f0f2f5] bg-white px-6 py-4">
                      {selectedFile && (
                        <div className="mb-3 p-2 bg-[#e6f7f2] border border-[#7EB0AB]/30 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span>📎</span>
                            <span className="text-sm text-[#1e3a4f] font-medium">{selectedFile.name}</span>
                            <span className="text-xs text-[#5a6a75]">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                          </div>
                          <button onClick={() => { setSelectedFile(null); if (fileInputRef) fileInputRef.value = ''; }} className="text-red-400 hover:text-red-500 font-bold">✕</button>
                        </div>
                      )}
                      <div className="flex items-center gap-4">
                        <input type="file" ref={(ref) => setFileInputRef(ref)} className="hidden" accept="image/*,.pdf,.doc,.docx" onChange={handleFileSelect} />
                        <div className="flex items-center gap-1 text-[#9ca3af] shrink-0">
                          <button onClick={() => fileInputRef?.click()} className="p-2 hover:text-[#5a6a75] hover:bg-[#f5f7fa] rounded-full transition-colors" title="Attach file">
                            <Paperclip size={20} />
                          </button>
                          <button className="p-2 hover:text-[#5a6a75] hover:bg-[#f5f7fa] rounded-full transition-colors">
                            <ImageIcon size={20} />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Write a message..."
                          className="flex-1 text-[15px] bg-transparent text-[#1a1a1a] placeholder-gray-400 focus:outline-none"
                        />
                        <div className="flex items-center gap-2 shrink-0">
                          <button className="p-2 text-[#9ca3af] hover:text-[#5a6a75] hover:bg-[#f5f7fa] rounded-full transition-colors">
                            <Smile size={20} />
                          </button>
                          <button
                            onClick={sendMessage}
                            disabled={sendingMessage || (!newMessage.trim() && !selectedFile)}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#7EB0AB] hover:bg-[#6a9e99] text-white shadow-sm ml-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Send size={18} className="ml-0.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : (
              /* Empty state */
              <div className="flex-1 flex items-center justify-center text-center">
                <div>
                  <div className="w-16 h-16 bg-[#e6f7f2] rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7EB0AB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                    </svg>
                  </div>
                  <h3 className="text-[16px] font-bold text-[#1a1a1a] mb-1">Select a conversation</h3>
                  <p className="text-[13px] text-[#5a6a75]">Choose a conversation from the left to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Block modal ── */}
      {isBlockModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] w-full max-w-[360px] p-8 shadow-2xl flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-5 border border-red-100">
              <Ban size={28} strokeWidth={1.5} />
            </div>
            <h2 className="text-[20px] font-bold text-[#1a1a1a] mb-2">Block this Person?</h2>
            <p className="text-[13px] text-[#5a6a75] mb-8 px-4">Are you sure you want to block this person? They won't be able to message you anymore.</p>
            <div className="w-full flex flex-col gap-3">
              <button onClick={() => setIsBlockModalOpen(false)} className="w-full py-3 bg-[#7EB0AB] hover:bg-[#6a9e99] text-white text-[15px] font-bold rounded-xl transition-colors shadow-sm">
                Block
              </button>
              <button onClick={() => setIsBlockModalOpen(false)} className="w-full py-3 text-[#5a6a75] text-[15px] font-bold hover:bg-[#f5f7fa] rounded-xl transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}