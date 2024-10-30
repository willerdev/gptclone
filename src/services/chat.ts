import { collection, addDoc, query, where, getDocs, updateDoc, doc, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Chat, Message } from '../types';

export async function createChat(userId: string, initialMessage: string) {
  try {
    const chatRef = await addDoc(collection(db, 'chats'), {
      userId,
      title: initialMessage.slice(0, 30) + '...',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    await addDoc(collection(db, 'messages'), {
      chatId: chatRef.id,
      content: initialMessage,
      role: 'user',
      timestamp: serverTimestamp()
    });

    return chatRef.id;
  } catch (error) {
    console.error('Error creating chat:', error);
    throw error;
  }
}

export async function getChats(userId: string): Promise<Chat[]> {
  try {
    const chatsQuery = query(
      collection(db, 'chats'),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    
    const snapshot = await getDocs(chatsQuery);
    const chats = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Chat));

    return chats;
  } catch (error) {
    console.error('Error fetching chats:', error);
    throw error;
  }
}

export async function getChatMessages(chatId: string): Promise<Message[]> {
  try {
    const messagesQuery = query(
      collection(db, 'messages'),
      where('chatId', '==', chatId),
      orderBy('timestamp', 'asc')
    );
    
    const snapshot = await getDocs(messagesQuery);
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Message));

    return messages;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
}

export async function addMessage(chatId: string, content: string, role: 'user' | 'assistant') {
  try {
    await addDoc(collection(db, 'messages'), {
      chatId,
      content,
      role,
      timestamp: serverTimestamp()
    });

    await updateDoc(doc(db, 'chats', chatId), {
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error adding message:', error);
    throw error;
  }
}