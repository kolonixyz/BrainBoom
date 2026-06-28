"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Contact, Room, Message } from "@/types";

interface ChatContextType {
  contacts: Contact[];
  rooms: Room[];
  activeRoomId: number | null;
  messages: Map<number, Message[]>;
  typingUsers: Map<number, Set<number>>;
  onlineUsers: Set<number>;
  setContacts: (contacts: Contact[]) => void;
  setRooms: (rooms: Room[]) => void;
  setActiveRoomId: (roomId: number | null) => void;
  setMessages: (roomId: number, messages: Message[]) => void;
  addMessage: (roomId: number, message: Message) => void;
  updateMessage: (roomId: number, messageId: number, updates: Partial<Message>) => void;
  setTypingUser: (roomId: number, userId: number, isTyping: boolean) => void;
  setOnlineUser: (userId: number, isOnline: boolean) => void;
  updateUnreadCount: (roomId: number, count: number) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [contacts, setContactsState] = useState<Contact[]>([]);
  const [rooms, setRoomsState] = useState<Room[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<number | null>(null);
  const [messages, setMessagesState] = useState<Map<number, Message[]>>(new Map());
  const [typingUsers, setTypingUsers] = useState<Map<number, Set<number>>>(new Map());
  const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());

  const setContacts = useCallback((contacts: Contact[]) => {
    setContactsState(contacts);
  }, []);

  const setRooms = useCallback((rooms: Room[]) => {
    setRoomsState(rooms);
  }, []);

  const setMessages = useCallback((roomId: number, messages: Message[]) => {
    setMessagesState((prev) => {
      const next = new Map(prev);
      next.set(roomId, messages);
      return next;
    });
  }, []);

  const addMessage = useCallback((roomId: number, message: Message) => {
    setMessagesState((prev) => {
      const next = new Map(prev);
      const existing = next.get(roomId) || [];
      if (!existing.some((m) => m.id === message.id)) {
        next.set(roomId, [...existing, message]);
      }
      return next;
    });
  }, []);

  const updateMessage = useCallback((roomId: number, messageId: number, updates: Partial<Message>) => {
    setMessagesState((prev) => {
      const next = new Map(prev);
      const existing = next.get(roomId) || [];
      next.set(
        roomId,
        existing.map((m) => (m.id === messageId ? { ...m, ...updates } : m))
      );
      return next;
    });
  }, []);

  const setTypingUser = useCallback((roomId: number, userId: number, isTyping: boolean) => {
    setTypingUsers((prev) => {
      const next = new Map(prev);
      const users = next.get(roomId) || new Set();
      if (isTyping) {
        users.add(userId);
      } else {
        users.delete(userId);
      }
      next.set(roomId, users);
      return next;
    });
  }, []);

  const setOnlineUser = useCallback((userId: number, isOnline: boolean) => {
    setOnlineUsers((prev) => {
      const next = new Set(prev);
      if (isOnline) {
        next.add(userId);
      } else {
        next.delete(userId);
      }
      return next;
    });
  }, []);

  const updateUnreadCount = useCallback((roomId: number, count: number) => {
    setRoomsState((prev) =>
      prev.map((r) => (r.id === roomId ? { ...r, unreadCount: count } : r))
    );
  }, []);

  return (
    <ChatContext.Provider
      value={{
        contacts,
        rooms,
        activeRoomId,
        messages,
        typingUsers,
        onlineUsers,
        setContacts,
        setRooms,
        setActiveRoomId,
        setMessages,
        addMessage,
        updateMessage,
        setTypingUser,
        setOnlineUser,
        updateUnreadCount,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
}
