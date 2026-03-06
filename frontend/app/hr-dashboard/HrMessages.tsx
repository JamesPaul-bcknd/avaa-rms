'use client';

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/useAuth";
import { messagesApi, Message, Conversation } from "@/lib/messages";
import { formatDistanceToNow } from "date-fns";
import {
  Search,
  ArrowLeft,
  Edit,
  MoreVertical,
  Paperclip,
  Image as ImageIcon,
  Smile,
  Send,
  BellOff,
  Archive,
  Ban,
  Flag,
  Trash2
} from "lucide-react";

export default function HrMessages({ initialUserId }: { initialUserId?: string | null }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [fileInputRef, setFileInputRef] = useState<HTMLInputElement | null>(null);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [showOptionMenu, setShowOptionMenu] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth({ redirect: false });

  // Fetch conversations
  useEffect(() => {
    fetchConversations();
  }, []);

  // Handle initialUserId to select conversation
  useEffect(() => {
    if (initialUserId) {
      if (conversations.length > 0) {
        const targetConversation = conversations.find(conv => conv.user.id === parseInt(initialUserId));
        if (targetConversation) {
          setSelectedConversation(targetConversation);
          setPendingUserId(null);
        }
      } else {
        setPendingUserId(initialUserId);
      }
    }
  }, [initialUserId, conversations]);

  // Retry auto-selection when conversations are loaded
  useEffect(() => {
    if (pendingUserId && conversations.length > 0) {
      const targetConversation = conversations.find(conv => conv.user.id === parseInt(pendingUserId));
      if (targetConversation) {
        setSelectedConversation(targetConversation);
        setPendingUserId(null);
      }
    }
  }, [pendingUserId, conversations]);

  // Fetch messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.user.id);
      setShowOptionMenu(false); // Close menu on changing user
    }
  }, [selectedConversation]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
    if (!newMessage.trim() && !fileInputRef?.files?.[0]) return;
    if (!selectedConversation) return;

    try {
      setSendingMessage(true);
      const messageData: any = { content: newMessage.trim() };

      if (fileInputRef?.files?.[0]) {
        messageData.file = fileInputRef.files[0];
      }

      const response = await messagesApi.sendMessage(selectedConversation.user.id, messageData);
      setMessages(prev => [...prev, response.data]);
      setNewMessage("");

      // Clear file input
      if (fileInputRef) {
        fileInputRef.value = '';
      }

      // Update conversation list
      fetchConversations();
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Helper formatting to match UI (e.g. 09:15 AM format)
  const formatMessageTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatTimeAgo = (dateString: string) => {
    const formatted = formatDistanceToNow(new Date(dateString), { addSuffix: true });
    return formatted.replace('about ', '').replace('less than a minute ago', 'just now');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex w-full h-full bg-[#f1f5f9] overflow-hidden rounded-2xl border border-gray-200/60 shadow-sm">

      {/* ── Sidebar (Dark Theme) ── */}
      <aside className="w-full lg:w-80 bg-[#1e2632] text-white flex flex-col shrink-0">

        {/* Logo Area */}
        <div className="flex items-center gap-3 px-6 py-8">
          <div className="flex items-center justify-center w-8 h-8 bg-emerald-500/20 rounded">
            <div className="w-0 h-0 border-l-[8px] border-l-transparent border-b-[14px] border-b-emerald-400 border-r-[8px] border-r-transparent relative top-[-2px]"></div>
          </div>
          <span className="text-xl font-semibold tracking-wide">Recruiter</span>
        </div>

        {/* Header Title */}
        <div className="px-6 flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <ArrowLeft size={20} className="text-white cursor-pointer hover:text-gray-300 transition-colors" />
            <h2 className="text-xl font-semibold">Messages</h2>
          </div>
          <button className="p-2 bg-white/10 text-gray-300 rounded-lg hover:bg-white/20 transition-colors">
            <Edit size={16} />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 mb-5">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-[#2a3441] text-sm text-white rounded-lg pl-9 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 flex gap-2 mb-2">
          <button className="px-5 py-1.5 bg-[#7EB0AB] text-white text-xs font-medium rounded-md shadow-sm">
            All
          </button>
          <button className="px-5 py-1.5 bg-[#2a3441] text-gray-400 text-xs font-medium rounded-md hover:bg-[#344050] transition-colors">
            Archived
          </button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto mt-2 pb-4">
          {loading ? (
            <div className="p-6 text-center text-gray-400 text-sm">Loading conversations...</div>
          ) : conversations.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm">No conversations yet</div>
          ) : (
            conversations.map((conversation) => (
              <button
                key={conversation.user.id}
                onClick={() => setSelectedConversation(conversation)}
                className={`w-full flex items-start gap-3 px-6 py-3.5 text-left transition-colors ${selectedConversation?.user.id === conversation.user.id
                    ? 'bg-white/5 border-l-2 border-[#7EB0AB]'
                    : 'border-l-2 border-transparent hover:bg-white/5'
                  }`}
              >
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-lg bg-[#53968b] text-white flex items-center justify-center text-sm font-semibold shadow-sm">
                    {conversation.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  {conversation.unread_count > 0 && (
                    <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 border-2 border-[#1e2632] text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                      {conversation.unread_count}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 mt-0.5">
                  <div className="flex items-baseline justify-between mb-0.5">
                    <p className={`text-sm font-medium truncate ${selectedConversation?.user.id === conversation.user.id ? 'text-white' : 'text-gray-200'
                      }`}>
                      {conversation.user.name}
                    </p>
                    <span className="text-[11px] text-gray-400 shrink-0 ml-2">
                      {formatTimeAgo(conversation.updated_at)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 truncate">
                    {conversation.latest_message.type === 'file'
                      ? `📎 ${conversation.latest_message.content}`
                      : conversation.latest_message.content
                    }
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* ── Main Chat Panel ── */}
      <section className="flex-1 flex flex-col bg-white">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-white z-10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#1e3a4f] text-white flex items-center justify-center text-sm font-semibold shadow-sm">
                  {selectedConversation.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-slate-800">
                    {selectedConversation.user.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
                    <span className="text-[11px] font-semibold text-[#16a34a] uppercase tracking-wide">Online</span>
                  </div>
                </div>
              </div>

              {/* Option Menu Toggle */}
              <div className="relative">
                <button
                  onClick={() => setShowOptionMenu(!showOptionMenu)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
                >
                  <MoreVertical size={20} />
                </button>

                {/* Dropdown Menu */}
                {showOptionMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowOptionMenu(false)}></div>
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] z-50 py-2">
                      <div className="px-4 py-2 border-b border-gray-50 mb-1">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Option Menu</span>
                      </div>
                      <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                        <BellOff size={16} className="text-gray-400" />
                        Mute Notification
                      </button>
                      <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                        <Archive size={16} className="text-gray-400" />
                        Archive Conversation
                      </button>
                      <div className="h-px bg-gray-100 my-1 mx-4"></div>
                      <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                        <Ban size={16} className="text-gray-400" />
                        Block
                      </button>
                      <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                        <Flag size={16} className="text-gray-400" />
                        Report
                      </button>
                      <div className="h-px bg-gray-100 my-1 mx-4"></div>
                      <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                        <Trash2 size={16} className="text-red-400" />
                        Delete Conversation
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Messages Content */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 bg-white">

              {/* Date Divider (Mocked for UI exactly like screenshot) */}
              <div className="flex justify-center mb-6">
                <span className="px-4 py-1 bg-gray-50 border border-gray-100 text-gray-500 text-xs font-medium rounded-full">
                  Today
                </span>
              </div>

              {messages.map((message) => {
                const isMine = message.sender_id === user?.id;
                return (
                  <div key={message.id} className={`flex gap-3 ${isMine ? 'justify-end' : 'justify-start'}`}>

                    {/* Receiver Avatar */}
                    {!isMine && (
                      <div className="w-8 h-8 shrink-0 rounded-full bg-[#1e3a4f] text-white flex items-center justify-center text-xs font-semibold shadow-sm mt-1">
                        {selectedConversation.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                    )}

                    <div className={`flex flex-col gap-1.5 max-w-[75%] ${isMine ? 'items-end' : 'items-start'}`}>
                      {/* Chat Bubble */}
                      <div className={`px-5 py-3.5 text-[14px] leading-relaxed shadow-sm ${isMine
                          ? 'bg-[#7EB0AB] text-white rounded-2xl rounded-tr-sm'
                          : 'bg-white border border-gray-100 rounded-2xl rounded-tl-sm text-slate-700'
                        }`}>

                        {message.type === 'file' ? (
                          <div className="flex items-center gap-3">
                            <Paperclip size={18} className={isMine ? "text-white/80" : "text-gray-400"} />
                            <a
                              href={`http://127.0.0.1:8000/storage/${message.file_path}`}
                              target="_blank"
                              className="underline hover:opacity-80 transition-opacity"
                            >
                              {message.content}
                            </a>
                          </div>
                        ) : message.type === 'image' ? (
                          <div>
                            <Image
                              src={`http://127.0.0.1:8000/storage/${message.file_path}`}
                              alt="Shared image"
                              width={400}
                              height={300}
                              className="max-w-full rounded-xl mb-2 shadow-sm"
                            />
                            <span>{message.content}</span>
                          </div>
                        ) : (
                          message.content
                        )}

                      </div>

                      {/* Timestamp */}
                      <p className={`text-[11px] text-gray-400 font-medium px-1 ${isMine ? 'text-right' : 'text-left'}`}>
                        {formatMessageTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Composer */}
            <div className="px-6 py-4 bg-white border-t border-gray-100">
              <div className="flex items-center gap-4">

                {/* File Upload Hidden Input */}
                <input
                  type="file"
                  ref={(ref) => setFileInputRef(ref)}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx"
                />

                {/* Left Icons */}
                <div className="flex items-center gap-1 text-gray-400">
                  <button onClick={() => fileInputRef?.click()} className="p-2 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors">
                    <Paperclip size={20} />
                  </button>
                  <button onClick={() => fileInputRef?.click()} className="p-2 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors">
                    <ImageIcon size={20} />
                  </button>
                </div>

                {/* Input Area */}
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Write a message..."
                  className="flex-1 text-[15px] bg-transparent text-slate-800 placeholder-gray-400 focus:outline-none"
                />

                {/* Right Icons & Send */}
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors">
                    <Smile size={20} />
                  </button>
                  <button
                    onClick={sendMessage}
                    disabled={sendingMessage || (!newMessage.trim() && !fileInputRef?.files?.[0])}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#53968b] hover:bg-[#438278] text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    {sendingMessage ? (
                      <span className="animate-pulse">...</span>
                    ) : (
                      <Send size={18} className="ml-0.5" />
                    )}
                  </button>
                </div>

              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center text-center bg-gray-50">
            <div className="w-20 h-20 bg-white shadow-sm rounded-full flex items-center justify-center mb-5 border border-gray-100">
              <Search className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Select a conversation</h3>
            <p className="text-sm text-gray-500 max-w-sm">Choose a conversation from the sidebar to start messaging with an applicant.</p>
          </div>
        )}
      </section>
    </div>
  );
}