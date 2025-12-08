import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { Mic, MicOff, Image, Send, Play, Pause, Download } from 'lucide-react';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [showMembers, setShowMembers] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [playingAudio, setPlayingAudio] = useState(null);
  const { currentUser, userProfile } = useAuth();
  const { addNotification } = useNotification();
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
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
    if ((!newMessage.trim() && !audioBlob && !selectedImage) || !currentUser) return;

    setUploading(true);
    try {
      let messageData = {
        userId: currentUser.uid,
        userName: userProfile?.name || currentUser.email,
        timestamp: serverTimestamp()
      };

      // Handle text message
      if (newMessage.trim()) {
        messageData.type = 'text';
        messageData.text = newMessage;
      }

      // Handle audio message
      if (audioBlob) {
        const audioRef = ref(storage, `chat/${groupId}/audio/${Date.now()}_${currentUser.uid}.webm`);
        await uploadBytes(audioRef, audioBlob);
        const audioUrl = await getDownloadURL(audioRef);
        messageData.type = 'audio';
        messageData.audioUrl = audioUrl;
        messageData.audioDuration = await getAudioDuration(audioBlob);
      }

      // Handle image message
      if (selectedImage) {
        const imageRef = ref(storage, `chat/${groupId}/images/${Date.now()}_${currentUser.uid}.${selectedImage.type.split('/')[1]}`);
        await uploadBytes(imageRef, selectedImage);
        const imageUrl = await getDownloadURL(imageRef);
        messageData.type = messageData.type || 'image';
        messageData.imageUrl = imageUrl;
        if (newMessage.trim()) {
          messageData.caption = newMessage;
        }
      }

      await addDoc(collection(db, 'studyGroups', groupId, 'messages'), messageData);

      // Reset form
      setNewMessage('');
      setAudioBlob(null);
      setSelectedImage(null);
    } catch (error) {
      console.error('Error sending message:', error);
      addNotification('Failed to send message. Please try again.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const getAudioDuration = (blob) => {
    return new Promise((resolve) => {
      const audio = new Audio(URL.createObjectURL(blob));
      audio.onloadedmetadata = () => {
        resolve(audio.duration);
      };
    });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      addNotification('Could not access microphone. Please check permissions.', 'error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        addNotification('Image size must be less than 5MB', 'error');
        return;
      }
      setSelectedImage(file);
    }
  };

  const playAudio = (audioUrl, messageId) => {
    if (playingAudio === messageId) {
      // Stop current audio
      setPlayingAudio(null);
    } else {
      // Start playing new audio
      setPlayingAudio(messageId);
      const audio = new Audio(audioUrl);
      audio.onended = () => setPlayingAudio(null);
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
        setPlayingAudio(null);
        addNotification('Could not play audio', 'error');
      });
    }
  };

  const cancelMedia = () => {
    setAudioBlob(null);
    setSelectedImage(null);
    if (isRecording) {
      stopRecording();
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
                  <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg shadow-sm ${isOwn
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-900'
                    }`}>
                    {!isOwn && <p className="text-xs font-semibold mb-1 text-indigo-600">{msg.userName}</p>}

                    {/* Text Message */}
                    {msg.type === 'text' && (
                      <p className="break-words">{msg.text}</p>
                    )}

                    {/* Image Message */}
                    {msg.type === 'image' && (
                      <div>
                        <img
                          src={msg.imageUrl}
                          alt="Shared image"
                          className="rounded-lg max-w-full h-auto cursor-pointer"
                          onClick={() => window.open(msg.imageUrl, '_blank')}
                        />
                        {msg.caption && <p className="break-words mt-2">{msg.caption}</p>}
                      </div>
                    )}

                    {/* Audio Message */}
                    {msg.type === 'audio' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => playAudio(msg.audioUrl, msg.id)}
                          className={`p-2 rounded-full ${isOwn ? 'bg-indigo-700 hover:bg-indigo-800' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}
                        >
                          {playingAudio === msg.id ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </button>
                        <div className="flex-1">
                          <div className="bg-gray-300 rounded-full h-2">
                            <div className="bg-indigo-600 h-2 rounded-full w-0"></div>
                          </div>
                          <p className="text-xs mt-1">
                            {msg.audioDuration ? `${Math.round(msg.audioDuration)}s` : 'Audio'}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = msg.audioUrl;
                            link.download = `audio_${msg.id}.webm`;
                            link.click();
                          }}
                          className={`p-1 rounded ${isOwn ? 'hover:bg-indigo-700' : 'hover:bg-gray-200'} transition-colors`}
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {/* Combined Image + Text */}
                    {msg.type === 'image' && msg.text && (
                      <div>
                        <img
                          src={msg.imageUrl}
                          alt="Shared image"
                          className="rounded-lg max-w-full h-auto cursor-pointer mb-2"
                          onClick={() => window.open(msg.imageUrl, '_blank')}
                        />
                        <p className="break-words">{msg.text}</p>
                      </div>
                    )}

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
          {/* Media Preview */}
          {(audioBlob || selectedImage) && (
            <div className="mb-3 p-3 bg-gray-50 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {audioBlob ? 'Audio recording ready' : 'Image selected'}
                </span>
                <button
                  type="button"
                  onClick={cancelMedia}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              {audioBlob && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <Mic className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm text-gray-600">Audio message</span>
                </div>
              )}
              {selectedImage && (
                <div className="flex items-center gap-2">
                  <img
                    src={URL.createObjectURL(selectedImage)}
                    alt="Preview"
                    className="w-8 h-8 object-cover rounded"
                  />
                  <span className="text-sm text-gray-600">{selectedImage.name}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2 items-center">
            {/* Media Buttons */}
            <div className="flex gap-1">
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={`p-3 rounded-full transition-colors ${isRecording
                    ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                disabled={uploading}
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <label className="p-3 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 cursor-pointer transition-colors">
                <Image className="w-5 h-5" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>

            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={audioBlob || selectedImage ? "Add a caption (optional)" : "Type a message"}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              disabled={uploading}
            />

            <button
              type="submit"
              disabled={uploading || (!newMessage.trim() && !audioBlob && !selectedImage)}
              className="bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chat;
