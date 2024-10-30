import React, { useState, useEffect } from 'react';
import { Auth } from './components/Auth';
import { ChatList } from './components/ChatList';
import { ChatWindow } from './components/ChatWindow';
import { getChats, createChat, getChatMessages, addMessage } from './services/chat';
import { generateResponse } from './services/ai';
import { renameChat } from './services/firebase';
import type { User, Chat, Message } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadChats();
    }
  }, [user]);

  useEffect(() => {
    if (activeChat) {
      loadMessages();
    }
  }, [activeChat]);

  const loadChats = async () => {
    if (!user) return;
    try {
      const userChats = await getChats(user.id);
      setChats(userChats);
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  };

  const loadMessages = async () => {
    if (!activeChat) return;
    try {
      const chatMessages = await getChatMessages(activeChat);
      setMessages(chatMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleNewChat = async () => {
    if (!user) return;
    try {
      const chatId = await createChat(user.id, 'New conversation');
      await loadChats();
      setActiveChat(chatId);
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!activeChat || !user) return;

    setIsLoading(true);
    try {
      await addMessage(activeChat, content, 'user');
      
      const aiResponse = await generateResponse(content);
      await addMessage(activeChat, aiResponse, 'assistant');
      
      await loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRenameChat = async (chatId: string, newTitle: string) => {
    try {
      await renameChat(chatId, newTitle);
      await loadChats(); // Refresh the chat list
    } catch (error) {
      console.error('Error renaming chat:', error);
    }
  };

  if (!user) {
    return <Auth onAuth={setUser} />;
  }

  return (
    <div className="flex h-screen bg-white">
      <div className="w-64 border-r p-4 bg-gray-50">
        <ChatList
          chats={chats}
          activeChat={activeChat}
          onSelectChat={setActiveChat}
          onNewChat={handleNewChat}
          onRenameChat={handleRenameChat}
        />
      </div>
      <div className="flex-1">
        {activeChat ? (
          <ChatWindow
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            Select a chat or start a new conversation
          </div>
        )}
      </div>
    </div>
  );
}

export default App;