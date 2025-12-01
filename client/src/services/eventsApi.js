// src/services/eventsApi.js
import { db } from './firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

const eventsCollection = collection(db, 'events');

export const getEvents = async () => {
  const snapshot = await getDocs(eventsCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createEvent = async (eventData) => {
  return await addDoc(eventsCollection, eventData);
};

export const updateEvent = async (id, eventData) => {
  const eventDoc = doc(db, 'events', id);
  return await updateDoc(eventDoc, eventData);
};

export const deleteEvent = async (id) => {
  const eventDoc = doc(db, 'events', id);
  return await deleteDoc(eventDoc);
};