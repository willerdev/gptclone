export interface User {
  id: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
}

export interface Chat {
  id: string;
  userId: string;
  title: string;
  createdAt: any;
  updatedAt: any;
}

export interface Message {
  id: string;
  chatId: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: any;
}