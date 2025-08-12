import { useState, useEffect } from 'react';

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  references?: string[];
  context?: string;
  contextData?: any[];
}

interface Chat {
  id: string;
  fileId: string;
  fileName: string;
  collectionName: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export const useChatManager = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);

  // Load chats from localStorage
  useEffect(() => {
    const savedChats = localStorage.getItem('pdfChats');
    if (savedChats) {
      try {
        const parsedChats = JSON.parse(savedChats).map((chat: any) => ({
          ...chat,
          createdAt: new Date(chat.createdAt),
          updatedAt: new Date(chat.updatedAt),
          messages: chat.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        setChats(parsedChats);
      } catch (error) {
        console.error('Error loading chats:', error);
      }
    }
  }, []);

  // Save chats to localStorage
  const saveChats = (updatedChats: Chat[]) => {
    localStorage.setItem('pdfChats', JSON.stringify(updatedChats));
    setChats(updatedChats);
  };

  // Create new chat for a file
  const createChat = (fileId: string, fileName: string, collectionName: string): string => {
    const chatId = `chat_${fileId}_${Date.now()}`;
    const newChat: Chat = {
      id: chatId,
      fileId,
      fileName,
      collectionName,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const updatedChats = [...chats, newChat];
    saveChats(updatedChats);
    setActiveChat(chatId);
    return chatId;
  };

  // Get or create chat for a file
  const getChatForFile = (fileId: string, fileName: string, collectionName: string): string => {
    const existingChat = chats.find(chat => chat.fileId === fileId);
    if (existingChat) {
      setActiveChat(existingChat.id);
      return existingChat.id;
    }
    return createChat(fileId, fileName, collectionName);
  };

  // Add message to chat
  const addMessage = (chatId: string, message: Message) => {
    const updatedChats = chats.map(chat => {
      if (chat.id === chatId) {
        return {
          ...chat,
          messages: [...chat.messages, message],
          updatedAt: new Date()
        };
      }
      return chat;
    });
    saveChats(updatedChats);
  };

  // Get messages for active chat
  const getActiveMessages = (): Message[] => {
    if (!activeChat) return [];
    const chat = chats.find(c => c.id === activeChat);
    return chat?.messages || [];
  };

  // Get active chat info
  const getActiveChatInfo = () => {
    if (!activeChat) return null;
    return chats.find(c => c.id === activeChat);
  };

  // Get chat by ID
  const getChatById = (chatId: string) => {
    return chats.find(c => c.id === chatId);
  };

  // Delete chat
  const deleteChat = (chatId: string) => {
    const updatedChats = chats.filter(chat => chat.id !== chatId);
    saveChats(updatedChats);
    if (activeChat === chatId) {
      setActiveChat(null);
    }
  };

  // Clear all messages in a chat
  const clearChat = (chatId: string) => {
    const updatedChats = chats.map(chat => {
      if (chat.id === chatId) {
        return {
          ...chat,
          messages: [],
          updatedAt: new Date()
        };
      }
      return chat;
    });
    saveChats(updatedChats);
  };

  return {
    chats,
    activeChat,
    setActiveChat,
    createChat,
    getChatForFile,
    addMessage,
    getActiveMessages,
    getActiveChatInfo,
    getChatById,
    deleteChat,
    clearChat
  };
};