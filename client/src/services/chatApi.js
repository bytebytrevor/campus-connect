// src/services/chatApi.js
import { db } from './firebase';
import { collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';

const messagesCollection = collection(db, 'messages');

export const sendMessage = async (message) => {
  return await addDoc(messagesCollection, message);
};

export const onMessagesSnapshot = (callback) => {
  const q = query(messagesCollection, orderBy('createdAt'));
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(messages);
  });
};
