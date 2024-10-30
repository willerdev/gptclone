import { 
  collection, 
  query, 
  where, 
  getDocs,
  addDoc,
  updateDoc,
  doc,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Chat, Message } from '../types';

export async function getUserChats(userId: string): Promise<Chat[]> {
  try {
    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef, 
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Chat));
  } catch (error) {
    console.error('Error fetching chats:', error);
    return [];
  }
}

export async function createChat(userId: string, title: string = 'New Chat'): Promise<Chat | null> {
  try {
    const chatRef = await addDoc(collection(db, 'chats'), {
      userId,
      title,
      messages: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return {
      id: chatRef.id,
      userId,
      title,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  } catch (error) {
    console.error('Error creating chat:', error);
    return null;
  }
}

export async function updateChat(chatId: string, messages: Message[]): Promise<boolean> {
  try {
    const chatRef = doc(db, 'chats', chatId);
    await updateDoc(chatRef, {
      messages,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error updating chat:', error);
    return false;
  }
}

export async function renameChat(chatId: string, newTitle: string): Promise<void> {
  try {
    const chatRef = doc(db, 'chats', chatId);
    await updateDoc(chatRef, {
      title: newTitle,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error renaming chat:', error);
    throw error;
  }
}