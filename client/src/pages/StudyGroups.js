import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';

const StudyGroups = () => {
  const [activeTab, setActiveTab] = useState('browse');
  const [studyGroups, setStudyGroups] = useState([]);
  const [loading, setLoading] = useState(true);
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Study Groups</h1>
          <p className="text-lg text-gray-600">Join or create study groups to collaborate with classmates</p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'browse', label: 'Browse Groups' },
                { id: 'create', label: 'Create Group' },
                { id: 'my-groups', label: 'My Groups' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Browse Groups Tab */}
        {activeTab === 'browse' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studyGroups.map(group => (
              <div key={group.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                      {group.course}
                    </span>
                    <span className="text-sm text-gray-500">
                      {group.memberCount || 0}/{group.maxMembers} members
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{group.title}</h3>
                  <p className="text-gray-600 mb-4">{group.description}</p>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {group.schedule}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {group.location}
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => handleJoinGroup(group.id)}
                      disabled={(group.memberCount || 0) >= group.maxMembers && !group.memberIds?.includes(currentUser?.uid)}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                        group.memberIds?.includes(currentUser?.uid)
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : (group.memberCount || 0) >= group.maxMembers
                          ? 'bg-gray-400 text-white cursor-not-allowed'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      {group.memberIds?.includes(currentUser?.uid) 
                        ? 'Leave Group' 
                        : (group.memberCount || 0) >= group.maxMembers 
                        ? 'Full' 
                        : 'Join Group'
                      }
                    </button>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Group Tab */}
        {activeTab === 'create' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Create a New Study Group</h2>
              
              <form className="space-y-6" onSubmit={handleCreateGroup}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Course Code</label>
                  <input
                    type="text"
                    name="course"
                    value={formData.course}
                    onChange={handleInputChange}
                    placeholder="e.g., CS 101"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Group Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Intro to Programming Study Group"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    rows={3}
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe what your study group will focus on..."
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Members</label>
                    <select 
                      name="maxMembers"
                      value={formData.maxMembers}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="4">4</option>
                      <option value="6">6</option>
                      <option value="8">8</option>
                      <option value="10">10</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Meeting Day</label>
                    <select 
                      name="meetingDay"
                      value={formData.meetingDay}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Select day</option>
                      <option value="Monday">Monday</option>
                      <option value="Tuesday">Tuesday</option>
                      <option value="Wednesday">Wednesday</option>
                      <option value="Thursday">Thursday</option>
                      <option value="Friday">Friday</option>
                      <option value="Saturday">Saturday</option>
                      <option value="Sunday">Sunday</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Meeting Time</label>
                    <input
                      type="time"
                      name="meetingTime"
                      value={formData.meetingTime}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="e.g., Library Room 205"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  Create Study Group
                </button>
              </form>
            </div>
          </div>
        )}

        {/* My Groups Tab */}
        {activeTab === 'my-groups' && (
          <div>
            {studyGroups.filter(group => group.memberIds?.includes(currentUser?.uid)).length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {studyGroups
                  .filter(group => group.memberIds?.includes(currentUser?.uid))
                  .map(group => (
                    <div key={group.id} className="bg-white rounded-xl shadow-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                          {group.course}
                        </span>
                        <span className="text-sm text-gray-500">
                          {group.memberCount || 0}/{group.maxMembers} members
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{group.title}</h3>
                      <p className="text-gray-600 mb-4">{group.description}</p>
                      <div className="space-y-2">
                        <div className="flex items-center text-gray-600">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {group.schedule}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          {group.location}
                        </div>
                      </div>
                    </div>
                  ))
                }
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📚</div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">No study groups yet</h3>
                <p className="text-gray-600 mb-6">Join or create your first study group to get started</p>
                <button
                  onClick={() => setActiveTab('browse')}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  Browse Groups
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyGroups;