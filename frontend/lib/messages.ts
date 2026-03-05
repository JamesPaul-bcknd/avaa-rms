import api from './axios';

export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  type: 'text' | 'file' | 'image';
  file_path?: string;
  read_at?: string;
  created_at: string;
  updated_at: string;
  sender: {
    id: number;
    name: string;
    profile_image?: string;
  };
  receiver: {
    id: number;
    name: string;
    profile_image?: string;
  };
}

export interface Conversation {
  user: {
    id: number;
    name: string;
    profile_image?: string;
  };
  latest_message: Message;
  unread_count: number;
  updated_at: string;
}

export interface SendMessageRequest {
  content?: string;
  file?: File;
}

export const messagesApi = {
  // Get all conversations for current user
  getConversations: async (): Promise<{ success: boolean; data: Conversation[] }> => {
    const response = await api.get('/messages/conversations');
    return response.data;
  },

  // Get conversation with specific user
  getConversation: async (userId: number): Promise<{ success: boolean; data: Message[] }> => {
    const response = await api.get(`/messages/conversation/${userId}`);
    return response.data;
  },

  // Send message to user
  sendMessage: async (userId: number, data: SendMessageRequest): Promise<{ success: boolean; data: Message }> => {
    const formData = new FormData();
    if (data.content) {
      formData.append('content', data.content);
    }
    if (data.file) {
      formData.append('file', data.file);
    }

    const response = await api.post(`/messages/conversation/${userId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Mark message as read
  markAsRead: async (messageId: number): Promise<{ success: boolean; data: Message }> => {
    const response = await api.put(`/messages/${messageId}/read`);
    return response.data;
  },

  // Delete conversation
  deleteConversation: async (userId: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/messages/conversation/${userId}`);
    return response.data;
  },

  // Get unread count
  getUnreadCount: async (): Promise<{ success: boolean; data: { unread_count: number } }> => {
    const response = await api.get('/messages/unread-count');
    return response.data;
  },
};
