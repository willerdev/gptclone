import React, { useState } from 'react';
import { MessageSquarePlus, Edit2, Check, X } from 'lucide-react';
import type { Chat } from '../types';

interface ChatListProps {
  chats: Chat[];
  activeChat: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onRenameChat: (chatId: string, newTitle: string) => void;
}

export function ChatList({ chats, activeChat, onSelectChat, onNewChat, onRenameChat }: ChatListProps) {
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const handleEditStart = (chat: Chat, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(chat.id);
    setEditTitle(chat.title);
  };

  const handleEditSave = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      await onRenameChat(chatId, editTitle.trim());
    }
    setEditingChatId(null);
  };

  const handleEditCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(null);
  };

  return (
    <div className="flex flex-col h-full">
      <button
        onClick={onNewChat}
        className="flex items-center justify-center space-x-2 mb-4 w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        <MessageSquarePlus className="h-5 w-5" />
        <span>New Chat</span>
      </button>

      <div className="flex-1 overflow-y-auto space-y-2">
        {chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className={`group flex items-center justify-between w-full px-4 py-2 rounded-lg transition-colors ${
              chat.id === activeChat
                ? 'bg-green-100 text-green-800'
                : 'hover:bg-gray-100'
            }`}
          >
            {editingChatId === chat.id ? (
              <div className="flex items-center space-x-2 w-full" onClick={e => e.stopPropagation()}>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  autoFocus
                />
                <button
                  onClick={(e) => handleEditSave(chat.id, e)}
                  className="p-1 hover:text-green-600"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={handleEditCancel}
                  className="p-1 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <p className="truncate text-sm">{chat.title}</p>
                <button
                  onClick={(e) => handleEditStart(chat, e)}
                  className="p-1 opacity-0 group-hover:opacity-100 hover:text-green-600"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}