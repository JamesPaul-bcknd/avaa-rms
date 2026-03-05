'use client';

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/lib/useAuth";
import { messagesApi, Message, Conversation } from "@/lib/messages";
import { formatDistanceToNow } from "date-fns";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth({ redirect: false });

  const userName = user?.name || "AA";
  const userInitials = userName
    .split(" ")
    .map((segment: string) => segment[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "AA";

  // Fetch conversations
  useEffect(() => {
    fetchConversations();
  }, []);

  // Handle URL parameter for auto-selecting conversation
  useEffect(() => {
    const userIdParam = searchParams.get('userId');
    console.log('Messages page - userIdParam:', userIdParam);
    console.log('Messages page - conversations.length:', conversations.length);
    console.log('Messages page - loading:', loading);
    console.log('Messages page - conversations:', conversations);
    
    if (userIdParam) {
      if (!loading) { // Only proceed when conversations are loaded (even if empty)
        const targetConversation = conversations.find(conv => conv.user.id === parseInt(userIdParam));
        console.log('Messages page - targetConversation:', targetConversation);
        if (targetConversation) {
          setSelectedConversation(targetConversation);
          console.log('Messages page - Conversation selected:', targetConversation.user.name);
          setPendingUserId(null); // Clear pending state
        } else {
          // No existing conversation found, create a dummy one
          console.log('Messages page - No conversation found, creating dummy conversation for userId:', userIdParam);
          const dummyConversation: Conversation = {
            user: { id: parseInt(userIdParam), name: 'Recruiter', profile_image: undefined },
            latest_message: {
              id: 0,
              sender_id: user?.id || 0,
              receiver_id: parseInt(userIdParam),
              content: 'Start a conversation',
              type: 'text',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              sender: { id: user?.id || 0, name: user?.name || 'You' },
              receiver: { id: parseInt(userIdParam), name: 'Recruiter' }
            },
            unread_count: 0,
            updated_at: new Date().toISOString()
          };
          console.log('Messages page - Creating dummy conversation:', dummyConversation);
          setSelectedConversation(dummyConversation);
          setPendingUserId(null);
        }
      } else {
        // Conversations not loaded yet, set a flag to select after loading
        console.log('Messages page - Conversations still loading, setting pending userId:', userIdParam);
        setPendingUserId(userIdParam);
      }
    }
  }, [searchParams, conversations, loading, user?.id, user?.name]);

  // Retry auto-selection when conversations are loaded
  useEffect(() => {
    if (pendingUserId && !loading) { // Changed to !loading to handle empty conversations
      const targetConversation = conversations.find(conv => conv.user.id === parseInt(pendingUserId));
      console.log('Messages page - Retry - targetConversation:', targetConversation);
      console.log('Messages page - Retry - conversations.length:', conversations.length);
      if (targetConversation) {
        setSelectedConversation(targetConversation);
        console.log('Messages page - Conversation selected after retry:', targetConversation.user.name);
        setPendingUserId(null);
      } else {
        // No existing conversation found, create a dummy one
        console.log('Messages page - Retry - No conversation found, creating dummy conversation for userId:', pendingUserId);
        const dummyConversation: Conversation = {
          user: { id: parseInt(pendingUserId), name: 'Recruiter', profile_image: undefined },
          latest_message: {
            id: 0,
            sender_id: user?.id || 0,
            receiver_id: parseInt(pendingUserId),
            content: 'Start a conversation',
            type: 'text',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            sender: { id: user?.id || 0, name: user?.name || 'You' },
            receiver: { id: parseInt(pendingUserId), name: 'Recruiter' }
          },
          unread_count: 0,
          updated_at: new Date().toISOString()
        };
        console.log('Messages page - Retry - Creating dummy conversation:', dummyConversation);
        setSelectedConversation(dummyConversation);
        setPendingUserId(null);
      }
    }
  }, [pendingUserId, conversations, loading, user?.id, user?.name]);

  // Fetch messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.user.id);
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
    if (!newMessage.trim() && !selectedFile) return;
    if (!selectedConversation) return;

    try {
      setSendingMessage(true);
      const messageData: any = { content: newMessage.trim() };
      
      if (selectedFile) {
        messageData.file = selectedFile;
      }

      const response = await messagesApi.sendMessage(selectedConversation.user.id, messageData);
      setMessages(prev => [...prev, response.data]);
      setNewMessage("");
      setSelectedFile(null);
      
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

  const formatTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type) && !file.type.startsWith('image/')) {
        alert('Invalid file type. Only images, PDFs, and Word documents are allowed.');
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-[#e5e7eb] overflow-hidden flex flex-col lg:flex-row h-[calc(100vh-200px)]">
          
          {/* Sidebar */}
          <aside className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-[#e5e7eb] flex flex-col">
            <div className="px-6 py-4 border-b border-[#f0f2f5]">
              <h1 className="text-xl font-bold text-[#1a1a1a] mb-3">Messages</h1>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className="w-full rounded-xl border border-[#e5e7eb] bg-[#f9fafb] py-2 pl-9 pr-3 text-sm text-[#111827] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#7EB0AB] focus:border-transparent"
                />
                <svg className="absolute left-3 top-2.5 text-[#9ca3af]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
              </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-[#6b7280]">Loading conversations...</div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center text-[#6b7280]">No conversations yet</div>
              ) : (
                conversations.map((conversation) => (
                  <button
                    key={conversation.user.id}
                    onClick={() => setSelectedConversation(conversation)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-[#f0f2f5] transition-colors ${
                      selectedConversation?.user.id === conversation.user.id
                        ? 'bg-[#e6f7f2]'
                        : 'hover:bg-[#f9fafb]'
                    }`}
                  >
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-[#1e3a4f] text-white flex items-center justify-center text-sm font-semibold">
                        {conversation.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      {conversation.unread_count > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
                          {conversation.unread_count}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold text-[#111827] truncate">
                          {conversation.user.name}
                        </p>
                        <span className="text-xs text-[#9ca3af] whitespace-nowrap">
                          {formatTime(conversation.updated_at)}
                        </span>
                      </div>
                      <p className="text-xs text-[#6b7280] truncate">
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

          {/* Conversation Panel */}
          <section className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Header */}
                <div className="px-6 py-4 border-b border-[#f0f2f5] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#1e3a4f] text-white flex items-center justify-center text-sm font-semibold">
                      {selectedConversation.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#111827]">
                        {selectedConversation.user.name}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
                        <span className="text-xs font-medium text-[#16a34a]">Online</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 bg-[#f9fafb]">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xl ${
                        message.sender_id === user?.id
                          ? 'order-2'
                          : 'order-1'
                      }`}>
                        <div className={`rounded-2xl px-4 py-3 text-sm shadow-sm ${
                          message.sender_id === user?.id
                            ? 'bg-[#7EB0AB] text-white rounded-tr-none'
                            : 'bg-white border border-[#e5e7eb] rounded-tl-none text-[#111827]'
                        }`}>
                          {message.type === 'file' ? (
                            <div>
                              <div className="flex items-center gap-2">
                                <span>📎</span>
                                <span>{message.content}</span>
                              </div>
                              {message.file_path && (
                                <a 
                                  href={`http://127.0.0.1:8000/storage/${message.file_path}`}
                                  target="_blank"
                                  className="text-xs underline mt-1 block"
                                >
                                  View File
                                </a>
                              )}
                            </div>
                          ) : message.type === 'image' ? (
                            <div>
                              <Image 
                                src={`http://127.0.0.1:8000/storage/${message.file_path}`}
                                alt="Shared image"
                                width={300}
                                height={200}
                                className="max-w-full rounded-lg mb-1"
                                style={{ objectFit: 'cover' }}
                              />
                              <span>{message.content}</span>
                            </div>
                          ) : (
                            message.content
                          )}
                        </div>
                        <p className={`mt-1 text-xs text-[#9ca3af] ${
                          message.sender_id === user?.id ? 'text-right' : 'text-left'
                        }`}>
                          {formatTime(message.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Composer */}
                <div className="border-t border-[#e5e7eb] bg-white px-6 py-4">
                  {selectedFile && (
                    <div className="mb-3 p-2 bg-[#f0f9ff] border border-[#bae6fd] rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>📎</span>
                        <span className="text-sm text-[#0c4a6e]">{selectedFile.name}</span>
                        <span className="text-xs text-[#64748b]">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedFile(null);
                          if (fileInputRef) fileInputRef.value = '';
                        }}
                        className="text-[#ef4444] hover:text-[#dc2626] text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      ref={(ref) => setFileInputRef(ref)}
                      className="hidden"
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={handleFileSelect}
                    />
                    <button
                      onClick={() => fileInputRef?.click()}
                      className="p-2 rounded-full hover:bg-[#f3f4f6] text-[#6b7280]"
                      title="Attach file"
                    >
                      📎
                    </button>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Write a message..."
                      className="flex-1 rounded-full border border-[#e5e7eb] bg-[#f9fafb] px-4 py-2 text-sm text-[#111827] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#7EB0AB] focus:border-transparent"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={sendingMessage || (!newMessage.trim() && !selectedFile)}
                      className="p-2 rounded-full bg-[#7EB0AB] text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sendingMessage ? '⏳' : '➤'}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center">
                <div>
                  <div className="w-16 h-16 bg-[#e5e7eb] rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-[#9ca3af]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-[#1a1a1a] mb-2">Select a conversation</h3>
                  <p className="text-[#6b7280]">Choose a conversation from the sidebar to start messaging</p>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
