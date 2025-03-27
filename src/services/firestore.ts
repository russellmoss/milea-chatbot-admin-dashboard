import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  getDocs,
  Timestamp 
} from 'firebase/firestore';
import { Message, Conversation } from '../types/sms';

// Initialize Firebase
const app = initializeApp({
  // Your Firebase config here
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
});

const db = getFirestore(app);

// Collections
const MESSAGES_COLLECTION = 'messages';
const CONVERSATIONS_COLLECTION = 'conversations';

// Message operations
export const addMessage = async (message: Omit<Message, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, MESSAGES_COLLECTION), {
      ...message,
      timestamp: Timestamp.fromDate(new Date(message.timestamp))
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding message:', error);
    throw error;
  }
};

export const updateMessageStatus = async (messageId: string, status: Message['status']): Promise<void> => {
  try {
    const messageRef = doc(db, MESSAGES_COLLECTION, messageId);
    await updateDoc(messageRef, { status });
  } catch (error) {
    console.error('Error updating message status:', error);
    throw error;
  }
};

export const markMessageAsRead = async (messageId: string): Promise<void> => {
  try {
    const messageRef = doc(db, MESSAGES_COLLECTION, messageId);
    await updateDoc(messageRef, { 
      read: true,
      readAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    throw error;
  }
};

// Conversation operations
export const getConversation = async (phoneNumber: string): Promise<Conversation | null> => {
  try {
    const q = query(
      collection(db, CONVERSATIONS_COLLECTION),
      where('phoneNumber', '==', phoneNumber)
    );
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Conversation;
  } catch (error) {
    console.error('Error getting conversation:', error);
    throw error;
  }
};

export const createConversation = async (conversation: Omit<Conversation, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, CONVERSATIONS_COLLECTION), {
      ...conversation,
      timestamp: Timestamp.fromDate(new Date(conversation.timestamp)),
      lastMessageAt: Timestamp.fromDate(new Date(conversation.lastMessageAt))
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
};

export const updateConversation = async (conversationId: string, updates: Partial<Conversation>): Promise<void> => {
  try {
    const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
    await updateDoc(conversationRef, {
      ...updates,
      ...(updates.lastMessageAt && { lastMessageAt: Timestamp.fromDate(new Date(updates.lastMessageAt)) })
    });
  } catch (error) {
    console.error('Error updating conversation:', error);
    throw error;
  }
};

export const getConversationMessages = async (conversationId: string): Promise<Message[]> => {
  try {
    const q = query(
      collection(db, MESSAGES_COLLECTION),
      where('conversationId', '==', conversationId),
      orderBy('timestamp', 'asc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate().toISOString()
    })) as Message[];
  } catch (error) {
    console.error('Error getting conversation messages:', error);
    throw error;
  }
}; 