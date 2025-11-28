import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [showMembers, setShowMembers] = useState(false);
  const { currentUser, userProfile } = useAuth();
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { groupId, groupTitle } = location.state || {};

  useEffect(() => {
    if (!groupId) {
      navigate('/study-groups');
      return;
    }

    const fetchGroupMembers = async () => {
      const groupDoc = await getDoc(doc(db, 'studyGroups', groupId));
      if (groupDoc.exists()) {
        const memberIds = groupDoc.data().memberIds || [];
        const memberPromises = memberIds.map(async (uid) => {
          const userDoc = await getDoc(doc(db, 'users', uid));
          return userDoc.exists() ? { uid, ...userDoc.data() } : { uid, name: 'Unknown User' };
        });
        const memberData = await Promise.all(memberPromises);
        setMembers(memberData);
      }
    };

    fetchGroupMembers();

    const messagesRef = collection(db, 'studyGroups', groupId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const msgs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMessages(msgs);
        setLoading(false);
      },
      (error) => {
        console.error('Error loading messages:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [groupId, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;

    try {
      await addDoc(collection(db, 'studyGroups', groupId, 'messages'), {
        text: newMessage,
        userId: currentUser.uid,
        userName: userProfile?.name || currentUser.email,
        timestamp: serverTimestamp()
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b px-4 py-3 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/study-groups')} className="text-gray-600 hover:text-gray-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold overflow-hidden">
              {groupTitle?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-gray-900 font-semibold">{groupTitle}</h1>
              <p className="text-xs text-gray-500">{members.length} members</p>
            </div>
          </div>
          <button 
            onClick={() => setShowMembers(!showMembers)}
            className="text-gray-600 hover:text-gray-900 p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto flex bg-gray-100">
        <div className="flex-1 max-w-4xl mx-auto p-4 pb-24 space-y-2">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-gray-600 font-medium">No messages yet</p>
                <p className="text-gray-500 text-sm">Start the conversation!</p>
              </div>
            </div>
          ) : (
            messages.map(msg => {
              const isOwn = msg.userId === currentUser?.uid;
              const timestamp = msg.timestamp?.toDate?.();
              const timeStr = timestamp ? new Date(timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : '';
              
              return (
                <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg shadow-sm ${
                    isOwn 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-white text-gray-900'
                  }`}>
                    {!isOwn && <p className="text-xs font-semibold mb-1 text-indigo-600">{msg.userName}</p>}
                    <p className="break-words">{msg.text}</p>
                    <p className={`text-[10px] text-right mt-1 ${isOwn ? 'text-indigo-200' : 'text-gray-500'}`}>{timeStr}</p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {showMembers && (
          <div className="w-72 bg-white border-l p-4">
            <h3 className="text-gray-900 font-semibold mb-4">Members ({members.length})</h3>
            <div className="space-y-1">
              {members.map(member => (
                <div key={member.uid} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden">
                    {member.photoURL ? (
                      <img src={member.photoURL} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      (member.name || member.email || 'U')[0].toUpperCase()
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 text-sm font-medium">{member.name || member.email || 'Unknown'}</p>
                    <p className="text-gray-500 text-xs">Member</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border-t p-3 pb-20 lg:pb-3">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message"
              className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button 
              type="submit"
              className="bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chat;
