"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Image as ImageIcon, Info, Search, Send, Settings, Smile } from "lucide-react";
import { MOCK_MESSAGES, MOCK_THREADS } from "~~/constants/messages";

export const MessagesView: React.FC = () => {
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(MOCK_THREADS[0].id);
  const [inputText, setInputText] = useState("");

  const activeThread = MOCK_THREADS.find(t => t.id === selectedThreadId);
  const activeUser = activeThread?.participant;

  return (
    <div className="flex flex-1 min-h-screen border-r border-slate-800 max-w-5xl w-full bg-slate-900">
      {/* Thread List - Hidden on mobile if thread selected */}
      <div
        className={`${selectedThreadId ? "hidden md:flex" : "flex"} flex-col w-full md:w-[350px] border-r border-slate-800`}
      >
        <div className="p-4 border-b border-slate-800 flex justify-between items-center h-[60px]">
          <h2 className="text-xl font-bold text-slate-100">Messages</h2>
          <Settings size={20} className="text-slate-400 hover:text-slate-100 cursor-pointer transition-colors" />
        </div>

        <div className="p-3 border-b border-slate-800">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search Direct Messages"
              className="w-full bg-slate-800 text-slate-200 rounded-full py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#00aff0] focus:bg-slate-900 transition-all placeholder:text-slate-500 border border-slate-700 focus:border-[#00aff0]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {MOCK_THREADS.map(thread => (
            <div
              key={thread.id}
              onClick={() => setSelectedThreadId(thread.id)}
              className={`p-4 flex gap-3 hover:bg-slate-800/50 cursor-pointer transition-colors border-r-2 ${selectedThreadId === thread.id ? "border-[#00aff0] bg-slate-800/30" : "border-transparent"}`}
            >
              <Image
                src={thread.participant.avatar}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover border border-slate-700"
                alt=""
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="font-bold text-slate-100 truncate">{thread.participant.name}</span>
                  <span className="text-xs text-slate-500">{thread.timestamp}</span>
                </div>
                <p
                  className={`text-sm truncate ${thread.unreadCount > 0 ? "text-slate-200 font-semibold" : "text-slate-500"}`}
                >
                  {thread.lastMessage}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      {selectedThreadId ? (
        <div className="flex-1 flex flex-col h-screen bg-slate-900">
          {/* Chat Header */}
          <div className="h-[60px] px-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <button
                className="md:hidden text-slate-400 hover:text-slate-100"
                onClick={() => setSelectedThreadId(null)}
              >
                ←
              </button>
              {activeUser && (
                <>
                  <Image
                    src={activeUser.avatar}
                    width={36}
                    height={36}
                    className="w-9 h-9 rounded-full border border-slate-700"
                    alt=""
                  />
                  <span className="font-bold text-slate-100 text-lg">{activeUser.name}</span>
                </>
              )}
            </div>
            <Info size={20} className="text-slate-400 hover:text-[#00aff0] cursor-pointer transition-colors" />
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-slate-900">
            {MOCK_MESSAGES.map(msg => (
              <div key={msg.id} className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[70%] px-5 py-3 rounded-2xl shadow-sm ${
                    msg.isMe ? "bg-[#00aff0] text-white rounded-br-none" : "bg-slate-800 text-slate-200 rounded-bl-none"
                  }`}
                >
                  <p className="text-[15px] leading-relaxed">{msg.text}</p>
                  <p className={`text-[10px] mt-1 text-right ${msg.isMe ? "text-blue-100" : "text-slate-400"}`}>
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-slate-800 bg-slate-900">
            <div className="flex gap-2 items-end bg-slate-800/50 border border-slate-700 p-2 rounded-2xl focus-within:border-[#00aff0] focus-within:ring-1 focus-within:ring-[#00aff0]/20 transition-all">
              <button className="p-2 text-[#00aff0] hover:bg-slate-700 rounded-full transition-colors">
                <ImageIcon size={22} />
              </button>
              <div className="flex-1">
                <textarea
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder="Start a new message"
                  className="w-full bg-transparent text-slate-200 placeholder:text-slate-500 focus:outline-none resize-none h-[44px] pt-2.5"
                />
              </div>
              <button className="p-2 text-[#00aff0] hover:bg-slate-700 rounded-full transition-colors">
                <Smile size={22} />
              </button>
              <button
                disabled={!inputText}
                className="p-2 bg-[#00aff0] text-white rounded-full hover:bg-[#009bd6] disabled:opacity-50 disabled:bg-slate-700 disabled:text-slate-500 transition-all"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center flex-col text-slate-500 bg-slate-950">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-500">
            <Send size={32} className="ml-1 mt-1" />
          </div>
          <p className="text-2xl font-bold text-slate-200 mb-2">Select a message</p>
          <p className="max-w-xs text-center">
            Choose from your existing conversations, start a new one, or just keep swimming.
          </p>
        </div>
      )}
    </div>
  );
};
