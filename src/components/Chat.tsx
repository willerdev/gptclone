import React, { useState, useRef, useEffect } from 'react';
import { Send, User as UserIcon, Bot, LogOut } from 'lucide-react';
import { generateResponse } from '../services/ai';
import { getUserChats, createChat, updateChat } from '../services/firebase';
import { ChatList } from './ChatList';
import type { Message, User, Chat } from '../types';

interface ChatProps {
  user: User;
  onLogout: () => void;
}

export function Chat({ user, onLogout }: ChatProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadChats();
  }, [user.id]);

  const loadChats = async () => {
    const userChats = await getUserChats(user.id);
    setChats(userChats);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleNewChat = async () => {
    const newChat = await createChat(user.id);
    if (newChat) {
      setChats((prev) => [newChat, ...prev]);
      setActiveChat(newChat.id);
      setMessages([]);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeChat || isLoading) return;

    setIsLoading(true);
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');

    try {
      const response = await generateResponse(input);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        role: 'assistant',
        timestamp: new Date(),
      };

      const updatedMessages = [...newMessages, aiMessage];
      setMessages(updatedMessages);
      await updateChat(activeChat, updatedMessages);
      
      // Update chat title if it's the first message
      if (messages.length === 0) {
        const updatedChats = chats.map(chat => 
          chat.id === activeChat 
            ? { ...chat, title: input.slice(0, 30) + (input.length > 30 ? '...' : '') }
            : chat
        );
        setChats(updatedChats);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-green-700">AI.mable</h1>
        </div>
        
        <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg mb-4">
          <UserIcon className="h-6 w-6 text-green-600" />
          <div className="flex-1">
            <p className="font-medium text-gray-900">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>

        <ChatList
          chats={chats}
          activeChat={activeChat}
          onSelectChat={setActiveChat}
          onNewChat={handleNewChat}
          onRenameChat={handleRenameChat}
        />

        <button
          onClick={onLogout}
          className="mt-4 flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-3 ${
                    message.role === 'user' ? 'justify-end' : ''
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0">
                      <Bot className="h-8 w-8 text-green-600" />
                    </div>
                  )}
                  <div
                    className={`rounded-2xl p-4 max-w-[70%] ${
                      message.role === 'user'
                        ? 'bg-green-600 text-white'
                        : 'bg-white border border-gray-200'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  {message.role === 'user' && (
                    <div className="flex-shrink-0">
                      <UserIcon className="h-8 w-8 text-green-600" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-200">
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  disabled={isLoading}
                  className="flex-1 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-700 mb-2">Welcome to AI.mable</h2>
              <p className="text-gray-500">Start a new chat or select an existing ones</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}