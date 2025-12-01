// src/pages/Chat.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { sendMessage, onMessagesSnapshot } from '../services/chatApi';
import { serverTimestamp } from 'firebase/firestore';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const { currentUser } = useAuth();

  useEffect(() => {
    const unsubscribe = onMessagesSnapshot(setMessages);
    return () => unsubscribe();
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    try {
      await sendMessage({
        text: newMessage,
        createdAt: serverTimestamp(),
        uid: currentUser.uid,
        displayName: currentUser.displayName,
        photoURL: currentUser.photoURL,
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-grow p-4 overflow-y-auto">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-start mb-4 ${msg.uid === currentUser.uid ? 'justify-end' : ''}`}>
            <div className={`flex items-center ${msg.uid === currentUser.uid ? 'flex-row-reverse' : ''}`}>
              <img
                src={msg.photoURL || 'https://via.placeholder.com/40'}
                alt="avatar"
                className="w-10 h-10 rounded-full"
              />
              <div
                className={`mx-3 p-3 rounded-lg ${
                  msg.uid === currentUser.uid ? 'bg-indigo-600 text-white' : 'bg-gray-200'
                }`}
              >
                <p className="font-bold">{msg.displayName}</p>
                <p>{msg.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage} className="p-4 bg-white">
        <div className="flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-grow p-2 border rounded-l-lg"
            placeholder="Type a message..."
          />
          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-r-lg">
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
