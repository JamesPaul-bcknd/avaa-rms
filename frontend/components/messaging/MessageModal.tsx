'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Send, Paperclip } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/lib/useAuth';
import { messagesApi, Message, Conversation } from '@/lib/messages';
import { formatDistanceToNow } from 'date-fns';

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  recruiterId: number;
  recruiterName?: string;
}

export default function MessageModal({ isOpen, onClose, recruiterId, recruiterName }: MessageModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [fileInputRef, setFileInputRef] = useState<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth({ redirect: false });

  const userName = user?.name || "You";
  const userInitials = userName
    .split(" ")
    .map((segment: string) => segment[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "YO";

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await messagesApi.getConversation(recruiterId);
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && recruiterId) {
      fetchMessages();
    }
  }, [isOpen, recruiterId]);

  const sendMessage = async () => {
    if (!newMessage.trim() && !fileInputRef?.files?.[0]) return;

    try {
      setSendingMessage(true);
      const messageData: any = { content: newMessage.trim() };
      
      if (fileInputRef?.files?.[0]) {
        messageData.file = fileInputRef.files[0];
      }

      const response = await messagesApi.sendMessage(recruiterId, messageData);
      setMessages(prev => [...prev, response.data]);
      setNewMessage("");
      
      // Clear file input
      if (fileInputRef) {
        fileInputRef.value = '';
      }
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-500 text-white flex items-center justify-center text-sm font-semibold">
              {recruiterName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'RE'}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{recruiterName || 'Recruiter'}</h3>
              <p className="text-sm text-gray-500">Active now</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
              <span className="ml-2 text-gray-500">Loading messages...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Start a conversation with {recruiterName || 'this recruiter'}</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs ${
                  message.sender_id === user?.id
                    ? 'order-2'
                    : 'order-1'
                }`}>
                  <div className={`rounded-2xl px-4 py-3 text-sm shadow-sm ${
                    message.sender_id === user?.id
                      ? 'bg-teal-500 text-white rounded-tr-none'
                      : 'bg-gray-100 text-gray-900 rounded-tl-none'
                  }`}>
                    {message.type === 'file' ? (
                      <div>
                        <div className="flex items-center gap-2">
                          <Paperclip size={16} />
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
                          width={400}
                          height={300}
                          className="max-w-full rounded-lg mb-1"
                        />
                        <span>{message.content}</span>
                      </div>
                    ) : (
                      message.content
                    )}
                  </div>
                  <p className={`mt-1 text-xs text-gray-400 ${
                    message.sender_id === user?.id ? 'text-right' : 'text-left'
                  }`}>
                    {formatTime(message.created_at)}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <input
              type="file"
              ref={(ref) => setFileInputRef(ref)}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx"
            />
            <button
              onClick={() => fileInputRef?.click()}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
            >
              <Paperclip size={20} />
            </button>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${recruiterName || 'recruiter'}...`}
              className="flex-1 rounded-full border border-gray-300 bg-gray-50 px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            <button
              onClick={sendMessage}
              disabled={sendingMessage || (!newMessage.trim() && !fileInputRef?.files?.[0])}
              className="p-2 rounded-full bg-teal-500 text-white hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
