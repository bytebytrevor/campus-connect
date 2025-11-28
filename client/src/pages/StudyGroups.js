import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, addDoc, updateDoc, doc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import GroupDetailsModal from '../components/GroupDetailsModal';

const StudyGroups = () => {
  const [activeTab, setActiveTab] = useState('browse');
  const [studyGroups, setStudyGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    course: '',
    title: '',
    description: '',
    maxMembers: '6',
    meetingDay: '',
    meetingTime: '',
    location: ''
  });
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchStudyGroups();
  }, []);

  const fetchStudyGroups = async () => {
    try {
      const groupsCollection = collection(db, 'studyGroups');
      const groupsSnapshot = await getDocs(groupsCollection);
      const groupsData = groupsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setStudyGroups(groupsData);
    } catch (error) {
      console.error('Error fetching study groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (groupId) => {
    if (!currentUser) return;
    
    try {
      const groupRef = doc(db, 'studyGroups', groupId);
      const group = studyGroups.find(g => g.id === groupId);
      const isMember = group.memberIds?.includes(currentUser.uid);
      
      if (isMember) {
        await updateDoc(groupRef, {
          memberIds: arrayRemove(currentUser.uid),
          memberCount: (group.memberCount || 1) - 1
        });
      } else {
        if ((group.memberCount || 0) < group.maxMembers) {
          await updateDoc(groupRef, {
            memberIds: arrayUnion(currentUser.uid),
            memberCount: (group.memberCount || 0) + 1
          });
        }
      }
      
      fetchStudyGroups();
    } catch (error) {
      console.error('Error joining/leaving group:', error);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    
    try {
      await addDoc(collection(db, 'studyGroups'), {
        ...formData,
        maxMembers: parseInt(formData.maxMembers),
        memberIds: [currentUser.uid],
        memberCount: 1,
        createdBy: currentUser.uid,
        createdAt: new Date(),
        schedule: `${formData.meetingDay}s ${formData.meetingTime}`
      });
      
      setFormData({
        course: '',
        title: '',
        description: '',
        maxMembers: '6',
        meetingDay: '',
        meetingTime: '',
        location: ''
      });
      
      setActiveTab('browse');
      fetchStudyGroups();
    } catch (error) {
      console.error('Error creating study group:', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleOpenChat = (group) => {
    if (!group.memberIds?.includes(currentUser?.uid)) {
      alert('You must join the group to access the chat');
      return;
    }
    navigate('/chat', { 
      state: { 
        groupId: group.id, 
        groupTitle: `${group.course} - ${group.title}` 
      } 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading study groups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile Header */}
        <div className="lg:hidden mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <button className="mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-bold text-gray-900">Study Groups</h1>
            </div>
          </div>
          
          <button 
            onClick={() => setActiveTab('create')}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium mb-6 flex items-center justify-center hover:bg-indigo-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Group
          </button>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Study Groups</h1>
          <button 
            onClick={() => setActiveTab('create')}
            className="bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium flex items-center hover:bg-indigo-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Group
          </button>
        </div>

        {/* Create Group Form */}
        {activeTab === 'create' && (
          <div className="bg-white rounded-lg border p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Create Study Group</h2>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="course"
                  placeholder="Course Code (e.g., CS 301)"
                  value={formData.course}
                  onChange={handleInputChange}
                  required
                  className="border rounded-lg px-4 py-2"
                />
                <input
                  type="text"
                  name="title"
                  placeholder="Group Title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="border rounded-lg px-4 py-2"
                />
              </div>
              <textarea
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className="w-full border rounded-lg px-4 py-2"
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="number"
                  name="maxMembers"
                  placeholder="Max Members"
                  value={formData.maxMembers}
                  onChange={handleInputChange}
                  min="2"
                  required
                  className="border rounded-lg px-4 py-2"
                />
                <input
                  type="text"
                  name="meetingDay"
                  placeholder="Meeting Day"
                  value={formData.meetingDay}
                  onChange={handleInputChange}
                  className="border rounded-lg px-4 py-2"
                />
                <input
                  type="text"
                  name="meetingTime"
                  placeholder="Meeting Time"
                  value={formData.meetingTime}
                  onChange={handleInputChange}
                  className="border rounded-lg px-4 py-2"
                />
              </div>
              <input
                type="text"
                name="location"
                placeholder="Location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full border rounded-lg px-4 py-2"
              />
              <div className="flex gap-2">
                <button type="submit" className="bg-indigo-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-indigo-700">
                  Create Group
                </button>
                <button 
                  type="button" 
                  onClick={() => setActiveTab('browse')}
                  className="border border-gray-300 text-gray-700 py-2 px-6 rounded-lg font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Study Groups Grid */}
        <div className="space-y-4 lg:grid lg:grid-cols-3 lg:gap-6 lg:space-y-0">
          {studyGroups.map(group => {
            const isMember = group.memberIds?.includes(currentUser?.uid);
            const isFull = (group.memberCount || 0) >= group.maxMembers;
            
            return (
              <div key={group.id} className="bg-white rounded-lg border p-4 lg:p-6">
                <div className="flex items-center justify-between mb-3 lg:mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900">{group.course}</h3>
                    <p className="text-sm text-gray-600">{group.title}</p>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    {group.memberCount || 0}/{group.maxMembers}
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedGroup(group)}
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-medium mb-2"
                >
                  View Details
                </button>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleOpenChat(group)}
                    disabled={!isMember}
                    className={`flex-1 border py-2 px-3 rounded text-sm lg:text-base font-medium ${
                      isMember 
                        ? 'border-gray-300 text-gray-700 hover:bg-gray-50' 
                        : 'border-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Chat
                  </button>
                  <button 
                    onClick={() => handleJoinGroup(group.id)}
                    disabled={!isMember && isFull}
                    className={`py-2 px-4 rounded text-sm lg:text-base font-medium transition-colors ${
                      isMember 
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : isFull
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {isMember ? 'Leave' : isFull ? 'Full' : 'Join'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedGroup && (
        <GroupDetailsModal
          group={selectedGroup}
          currentUser={currentUser}
          onClose={() => setSelectedGroup(null)}
          onUpdate={fetchStudyGroups}
        />
      )}
    </div>
  );
};

export default StudyGroups;