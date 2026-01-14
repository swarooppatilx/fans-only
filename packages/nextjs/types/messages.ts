export interface User {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  isVerified?: boolean;
}

export interface Thread {
  id: string;
  participant: User;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}

export interface Message {
  id: string;
  text: string;
  timestamp: string;
  isMe: boolean;
}
