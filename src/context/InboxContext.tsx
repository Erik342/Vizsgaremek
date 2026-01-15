'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export interface InboxMessage {
  id: number;
  type: 'welcome' | 'feature' | 'notification' | 'update';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  icon?: string;
}

interface InboxContextType {
  messages: InboxMessage[];
  unreadCount: number;
  addMessage: (message: Omit<InboxMessage, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (messageId: number) => void;
  markAllAsRead: () => void;
  deleteMessage: (messageId: number) => void;
  clearAllMessages: () => void;
  fetchMessages: () => Promise<void>;
  isLoading: boolean;
}

const InboxContext = createContext<InboxContextType | undefined>(undefined);

export function InboxProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/inbox/messages', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Don't log 401 errors (user not authenticated)
        if (response.status !== 401) {
          console.error(`Inbox fetch error: ${response.status} ${response.statusText}`);
          const errorData = await response.json().catch(() => ({}));
          console.error('Response:', errorData);
        }
        return;
      }

      const data = await response.json();
      const formattedMessages = (data.messages || []).map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));
      setMessages(formattedMessages);
    } catch (error) {
      // Silently fail if network error (user might be offline or not authenticated)
      console.debug('Inbox fetch error (network):', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check if user has auth token before attempting to fetch
    const hasAuth = document.cookie.includes('auth_token');

    if (hasAuth) {
      fetchMessages();
      // Refresh messages every 30 seconds
      const interval = setInterval(fetchMessages, 30000);
      return () => clearInterval(interval);
    }
  }, [fetchMessages]);

  const addMessage = useCallback((message: Omit<InboxMessage, 'id' | 'timestamp' | 'read'>) => {
    const newMessage: InboxMessage = {
      ...message,
      id: Math.random(),
      timestamp: new Date(),
      read: false,
    };
    setMessages((prev) => [newMessage, ...prev]);
  }, []);

  const markAsRead = useCallback(async (messageId: number) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, read: true } : msg
      )
    );

    try {
      await fetch('/api/inbox/messages', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, action: 'mark-read' }),
      });
    } catch (error) {
      console.error('Failed to mark message as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    setMessages((prev) =>
      prev.map((msg) => ({ ...msg, read: true }))
    );

    try {
      await fetch('/api/inbox/messages', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark-all-read' }),
      });
    } catch (error) {
      console.error('Failed to mark all messages as read:', error);
    }
  }, []);

  const deleteMessage = useCallback(async (messageId: number) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));

    try {
      await fetch('/api/inbox/messages', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, action: 'delete' }),
      });
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  }, []);

  const clearAllMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const unreadCount = messages.filter((msg) => !msg.read).length;

  return (
    <InboxContext.Provider
      value={{
        messages,
        unreadCount,
        addMessage,
        markAsRead,
        markAllAsRead,
        deleteMessage,
        clearAllMessages,
        fetchMessages,
        isLoading,
      }}
    >
      {children}
    </InboxContext.Provider>
  );
}

export function useInbox(): InboxContextType {
  const context = useContext(InboxContext);
  if (context === undefined) {
    throw new Error('useInbox must be used within an InboxProvider');
  }
  return context;
}
