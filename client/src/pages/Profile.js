import React, { useState, useEffect } from 'react';
import { doc, updateDoc, collection, query, where, getDocs, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  
  const { currentUser, userProfile, setUserProfile } = useAuth();
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    major: '',
    year: '',
    bio: '',
    interests: []
  });
  const [newInterest, setNewInterest] = useState('');

  useEffect(() => {
    if (userProfile) {
      setProfile({
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        email: userProfile.email || currentUser?.email || '',
        major: userProfile.major || '',
        year: userProfile.year || '',
        bio: userProfile.bio || '',
        interests: userProfile.interests || []
      });
    }
  }, [userProfile, currentUser]);

  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [myGroups, setMyGroups] = useState([]);

  useEffect(() => {
    if (currentUser) {
      fetchUserEvents();
      fetchUserGroups();
    }
  }, [currentUser, activeTab]);

  const fetchUserEvents = async () => {
    if (activeTab !== 'events') return;
    try {
      const eventsQuery = query(
        collection(db, 'events'),
        where('attendeeIds', 'array-contains', currentUser.uid)
      );
      const eventsSnapshot = await getDocs(eventsQuery);
      const eventsData = eventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUpcomingEvents(eventsData);
    } catch (error) {
      console.error('Error fetching user events:', error);
    }
  };

  const fetchUserGroups = async () => {
    if (activeTab !== 'groups') return;
    try {
      const groupsQuery = query(
        collection(db, 'studyGroups'),
        where('memberIds', 'array-contains', currentUser.uid)
      );
      const groupsSnapshot = await getDocs(groupsQuery);
      const groupsData = groupsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMyGroups(groupsData);
    } catch (error) {
      console.error('Error fetching user groups:', error);
    }
  };

  const handleSaveProfile = async () => {
    if (!currentUser) return;
    
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        firstName: profile.firstName,
        lastName: profile.lastName,
        major: profile.major,
        year: profile.year,
        bio: profile.bio,
        interests: profile.interests
      });
      // Also update the user profile in the auth context
      if (userProfile) {
        setUserProfile({ ...userProfile, ...profile });
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleInputChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  const handleAddInterest = () => {
    if (newInterest && !profile.interests.includes(newInterest)) {
      setProfile(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest]
      }));
      setNewInterest('');
    } else if (profile.interests.includes(newInterest)) {
      alert('This interest has already been added.');
    }
  };

  const handleRemoveInterest = (interestToRemove) => {
    setProfile(prev => ({
      ...prev,
      interests: prev.interests.filter(interest => interest !== interestToRemove)
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-32"></div>
          <div className="relative px-8 pb-8">
            <div className="flex items-end -mt-16">
              <div className="w-24 h-24 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                <span className="text-2xl font-bold text-indigo-600">
                  {profile.firstName?.[0]}{profile.lastName?.[0]}
                </span>
              </div>
              <div className="ml-6 pb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {profile.firstName} {profile.lastName}
                </h1>
                <p className="text-gray-600">{profile.major} • {profile.year}</p>
              </div>
              <div className="ml-auto pb-2">
                <button
                  onClick={isEditing ? handleSaveProfile : () => setIsEditing(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  {isEditing ? 'Save Changes' : 'Edit Profile'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'profile', label: 'Profile' },
                { id: 'events', label: 'My Events' },
                { id: 'groups', label: 'My Groups' },
                { id: 'settings', label: 'Settings' }
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

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h2>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="firstName"
                          value={profile.firstName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      ) : (
                        <p className="text-gray-900">{profile.firstName}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="lastName"
                          value={profile.lastName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      ) : (
                        <p className="text-gray-900">{profile.lastName}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <p className="text-gray-900">{profile.email}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Major</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="major"
                          value={profile.major}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      ) : (
                        <p className="text-gray-900">{profile.major}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                      {isEditing ? (
                        <select 
                          name="year"
                          value={profile.year}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="">Select year</option>
                          <option value="Freshman">Freshman</option>
                          <option value="Sophomore">Sophomore</option>
                          <option value="Junior">Junior</option>
                          <option value="Senior">Senior</option>
                          <option value="Graduate">Graduate</option>
                        </select>
                      ) : (
                        <p className="text-gray-900">{profile.year}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                    {isEditing ? (
                      <textarea
                        rows={3}
                        name="bio"
                        value={profile.bio}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.bio || 'No bio added yet.'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium flex items-center"
                    >
                      {interest}
                      {isEditing && (
                        <button 
                          onClick={() => handleRemoveInterest(interest)}
                          className="ml-2 text-indigo-600 hover:text-indigo-800"
                        >
                          &times;
                        </button>
                      )}
                    </span>
                  ))}
                   {profile.interests.length === 0 && !isEditing && (
                    <p className="text-gray-500 text-sm">No interests added yet.</p>
                  )}
                </div>
                {isEditing && (
                  <div className="mt-4 flex gap-2">
                    <input
                      type="text"
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                      placeholder="Add an interest"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                    <button 
                      onClick={handleAddInterest}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* My Events Tab */}
        {activeTab === 'events' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Events</h2>
            <div className="space-y-4">
              {upcomingEvents.length > 0 ? upcomingEvents.map(event => (
                <div key={event.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-900">{event.title}</h3>
                    <p className="text-gray-600">{event.date} at {event.time}</p>
                  </div>
                  <button className="text-indigo-600 hover:text-indigo-700 font-medium">View Details</button>
                </div>
              )) : <p className="text-gray-500">You have no upcoming events.</p>}
            </div>
          </div>
        )}

        {/* My Groups Tab */}
        {activeTab === 'groups' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">My Study Groups</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {myGroups.length > 0 ? myGroups.map(group => (
                <div key={group.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                      {group.course}
                    </span>
                    <span className="text-sm text-gray-500">{group.memberCount || 0} members</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-4">{group.title}</h3>
                  <button className="text-indigo-600 hover:text-indigo-700 font-medium">View Group</button>
                </div>
              )) : <p className="text-gray-500">You are not in any study groups.</p>}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div>
                  <h3 className="font-medium text-gray-900">Email Notifications</h3>
                  <p className="text-gray-600">Receive notifications about events and groups</p>
                </div>
                <button className="bg-gray-200 relative inline-flex h-6 w-11 items-center rounded-full">
                  <span className="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition"></span>
                </button>
              </div>
              
              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div>
                  <h3 className="font-medium text-gray-900">Profile Visibility</h3>
                  <p className="text-gray-600">Allow others to see your profile</p>
                </div>
                <button className="bg-indigo-600 relative inline-flex h-6 w-11 items-center rounded-full">
                  <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition"></span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;