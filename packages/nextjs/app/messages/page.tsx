"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  CheckIcon,
  CurrencyDollarIcon,
  EllipsisVerticalIcon,
  LockClosedIcon,
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import { CheckIcon as CheckIconSolid } from "@heroicons/react/24/solid";

interface Conversation {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isCreator: boolean;
  isOnline: boolean;
  isSubscribed: boolean;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  read: boolean;
  type: "text" | "image" | "tip";
  tipAmount?: string;
  imageUrl?: string;
}

// Mock conversations
const mockConversations: Conversation[] = [
  {
    id: "1",
    username: "cryptoqueen",
    displayName: "CryptoQueen",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=queen",
    lastMessage: "Thanks for subscribing! Let me know if you have any questions 💎",
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 5),
    unreadCount: 2,
    isCreator: true,
    isOnline: true,
    isSubscribed: true,
  },
  {
    id: "2",
    username: "defimaster",
    displayName: "DeFi Master",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=defi",
    lastMessage: "The new trading signals are up!",
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 30),
    unreadCount: 0,
    isCreator: true,
    isOnline: false,
    isSubscribed: true,
  },
  {
    id: "3",
    username: "nftartist",
    displayName: "NFT Artist",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=artist",
    lastMessage: "Check out my latest drop! 🎨",
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2),
    unreadCount: 1,
    isCreator: true,
    isOnline: true,
    isSubscribed: true,
  },
  {
    id: "4",
    username: "web3builder",
    displayName: "Web3 Builder",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=builder",
    lastMessage: "Great question about smart contracts!",
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24),
    unreadCount: 0,
    isCreator: true,
    isOnline: false,
    isSubscribed: false,
  },
  {
    id: "5",
    username: "tokenmaster",
    displayName: "Token Master",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=token",
    lastMessage: "You: Thanks for the insights!",
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 48),
    unreadCount: 0,
    isCreator: true,
    isOnline: false,
    isSubscribed: true,
  },
];

// Mock messages for selected conversation
const mockMessages: Record<string, Message[]> = {
  "1": [
    {
      id: "m1",
      senderId: "cryptoqueen",
      content: "Hey! Welcome to my exclusive content 🎉",
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      read: true,
      type: "text",
    },
    {
      id: "m2",
      senderId: "me",
      content: "Thanks! Really excited to be here. Love your market analysis!",
      timestamp: new Date(Date.now() - 1000 * 60 * 55),
      read: true,
      type: "text",
    },
    {
      id: "m3",
      senderId: "cryptoqueen",
      content: "I appreciate that! I post new analysis every morning at 9 AM UTC",
      timestamp: new Date(Date.now() - 1000 * 60 * 50),
      read: true,
      type: "text",
    },
    {
      id: "m4",
      senderId: "me",
      content: "Perfect, I'll make sure to check in then!",
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      read: true,
      type: "text",
    },
    {
      id: "m5",
      senderId: "cryptoqueen",
      content: "Thanks for subscribing! Let me know if you have any questions 💎",
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      read: false,
      type: "text",
    },
    {
      id: "m6",
      senderId: "cryptoqueen",
      content: "Also, feel free to check out my Diamond tier for exclusive 1-on-1 calls!",
      timestamp: new Date(Date.now() - 1000 * 60 * 4),
      read: false,
      type: "text",
    },
  ],
};

const formatTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString();
};

const formatMessageTime = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export default function MessagesPage() {
  const [conversations] = useState<Conversation[]>(mockConversations);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(mockConversations[0]);
  const [messages, setMessages] = useState<Message[]>(mockMessages["1"] || []);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const filteredConversations = conversations.filter(
    conv =>
      conv.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.username.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConversation(conv);
    setMessages(mockMessages[conv.id] || []);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message: Message = {
      id: `m${Date.now()}`,
      senderId: "me",
      content: newMessage,
      timestamp: new Date(),
      read: false,
      type: "text",
    };

    setMessages(prev => [...prev, message]);
    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-base-200 to-base-300">
      <div className="container mx-auto px-4 py-4 h-[calc(100vh-80px)]">
        <div className="fo-card h-full overflow-hidden flex">
          {/* Conversations Sidebar */}
          <div className="w-80 border-r border-base-300 flex flex-col">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-base-300">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold flex items-center gap-2">
                  Messages
                  {totalUnread > 0 && (
                    <span className="px-2 py-0.5 bg-fo-primary text-white text-xs font-bold rounded-full">
                      {totalUnread}
                    </span>
                  )}
                </h1>
                <button className="p-2 hover:bg-base-200 rounded-full transition-colors">
                  <EllipsisVerticalIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/50" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-base-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-fo-primary"
                />
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-base-content/50">
                  <p>No conversations found</p>
                </div>
              ) : (
                filteredConversations.map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`w-full p-4 flex items-start gap-3 hover:bg-base-200 transition-colors text-left ${
                      selectedConversation?.id === conv.id ? "bg-base-200" : ""
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <Image
                        src={conv.avatar}
                        alt={conv.displayName}
                        width={48}
                        height={48}
                        className="rounded-full bg-base-300"
                      />
                      {conv.isOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-base-100 rounded-full" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold truncate">{conv.displayName}</span>
                        <span className="text-xs text-base-content/50">{formatTime(conv.lastMessageTime)}</span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-sm text-base-content/70 truncate">{conv.lastMessage}</p>
                        {conv.unreadCount > 0 && (
                          <span className="ml-2 px-2 py-0.5 bg-fo-primary text-white text-xs font-bold rounded-full">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      {!conv.isSubscribed && (
                        <span className="inline-flex items-center gap-1 mt-1 text-xs text-amber-500">
                          <LockClosedIcon className="h-3 w-3" />
                          Subscribe to message
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          {selectedConversation ? (
            <div className="flex-1 flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-base-300 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Image
                      src={selectedConversation.avatar}
                      alt={selectedConversation.displayName}
                      width={40}
                      height={40}
                      className="rounded-full bg-base-300"
                    />
                    {selectedConversation.isOnline && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-base-100 rounded-full" />
                    )}
                  </div>
                  <div>
                    <h2 className="font-semibold">{selectedConversation.displayName}</h2>
                    <p className="text-xs text-base-content/50">
                      @{selectedConversation.username} • {selectedConversation.isOnline ? "Online" : "Offline"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="fo-btn-secondary text-sm flex items-center gap-1">
                    <CurrencyDollarIcon className="h-4 w-4" />
                    Send Tip
                  </button>
                  <button className="p-2 hover:bg-base-200 rounded-full transition-colors">
                    <EllipsisVerticalIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => {
                  const isMe = message.senderId === "me";
                  const showAvatar = !isMe && (index === 0 || messages[index - 1].senderId !== message.senderId);

                  return (
                    <div key={message.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className={`flex items-end gap-2 max-w-[70%] ${isMe ? "flex-row-reverse" : ""}`}>
                        {!isMe && showAvatar && (
                          <Image
                            src={selectedConversation.avatar}
                            alt=""
                            width={32}
                            height={32}
                            className="rounded-full bg-base-300 flex-shrink-0"
                          />
                        )}
                        {!isMe && !showAvatar && <div className="w-8" />}

                        <div
                          className={`px-4 py-2 rounded-2xl ${
                            isMe
                              ? "bg-fo-primary text-white rounded-br-md"
                              : "bg-base-200 text-base-content rounded-bl-md"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <div className={`flex items-center gap-1 mt-1 ${isMe ? "justify-end" : ""}`}>
                            <span className={`text-xs ${isMe ? "text-white/70" : "text-base-content/50"}`}>
                              {formatMessageTime(message.timestamp)}
                            </span>
                            {isMe && (
                              <span className="text-white/70">
                                {message.read ? (
                                  <CheckIconSolid className="h-3 w-3" />
                                ) : (
                                  <CheckIcon className="h-3 w-3" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              {selectedConversation.isSubscribed ? (
                <div className="p-4 border-t border-base-300">
                  <div className="flex items-end gap-3">
                    <button className="p-2 hover:bg-base-200 rounded-full transition-colors flex-shrink-0">
                      <PhotoIcon className="h-6 w-6 text-base-content/70" />
                    </button>

                    <div className="flex-1 relative">
                      <textarea
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Type a message..."
                        rows={1}
                        className="w-full px-4 py-3 bg-base-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-fo-primary"
                        style={{ minHeight: "48px", maxHeight: "120px" }}
                      />
                    </div>

                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="p-3 bg-fo-primary text-white rounded-full hover:bg-fo-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                    >
                      <PaperAirplaneIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 border-t border-base-300 bg-base-200/50">
                  <div className="text-center">
                    <LockClosedIcon className="h-8 w-8 mx-auto text-base-content/40 mb-2" />
                    <p className="text-base-content/60 mb-3">Subscribe to send messages</p>
                    <button className="fo-btn-primary">Subscribe Now</button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-base-200 flex items-center justify-center">
                  <PaperAirplaneIcon className="h-12 w-12 text-base-content/30" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Your Messages</h3>
                <p className="text-base-content/60">Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
