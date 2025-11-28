import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../services/firebase';

const Home = () => {
  const { currentUser, userProfile } = useAuth();
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [myStudyGroups, setMyStudyGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch events
      const eventsQuery = query(
        collection(db, 'events'),
        limit(3)
      );
      const eventsSnapshot = await getDocs(eventsQuery);
      const eventsData = eventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUpcomingEvents(eventsData);

      // Fetch study groups
      const groupsQuery = query(
        collection(db, 'studyGroups'),
        limit(3)
      );
      const groupsSnapshot = await getDocs(groupsQuery);
      const groupsData = groupsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMyStudyGroups(groupsData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  
  const quickActions = [
    { label: 'Create Event', icon: '📅', path: '/events' },
    { label: 'Join Study Group', icon: '👥', path: '/study-groups' },
    { label: 'Update Profile', icon: '👤', path: '/profile' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 lg:py-8">
        {/* Welcome Section */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-xl lg:text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {userProfile?.firstName || currentUser?.email?.split('@')[0] || 'John Smith'}
          </h1>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-6">
          {/* Upcoming Events */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
              <Link to="/events" className="text-indigo-600 hover:text-indigo-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="space-y-3">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded border">
                  <h4 className="font-medium text-gray-900 text-sm">{event.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">{event.date}</p>
                  <p className="text-xs text-gray-500">{event.location}</p>
                </div>
              ))}
            </div>
          </div>

          {/* My Study Groups */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">My Study Groups</h2>
              <Link to="/study-groups" className="text-indigo-600 hover:text-indigo-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="space-y-3">
              {myStudyGroups.map((group, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded border">
                  <h4 className="font-medium text-gray-900 text-sm">{group.course}</h4>
                  <p className="text-xs text-gray-600 mt-1">{group.title}</p>
                  <p className="text-xs text-gray-500">{group.memberCount || 0} members</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              {quickActions.map((action, index) => (
                <Link key={index} to={action.path} className="block w-full p-3 text-left border rounded hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <span className="mr-3">{action.icon}</span>
                    {action.label}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden space-y-4">
          {/* Upcoming Events */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-gray-900">Upcoming Events</h2>
              <Link to="/events" className="text-indigo-600 hover:text-indigo-800">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="space-y-2">
              {upcomingEvents.slice(0, 2).map((event, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 text-sm leading-tight">{event.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">{event.date} at {event.time}</p>
                  <p className="text-xs text-gray-500 truncate">{event.location}</p>
                </div>
              ))}
            </div>
          </div>

          {/* My Study Groups */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-gray-900">My Study Groups</h2>
              <Link to="/study-groups" className="text-indigo-600 hover:text-indigo-800">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="space-y-2">
              {myStudyGroups.slice(0, 2).map((group, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 text-sm">{group.course}</h4>
                  <p className="text-xs text-gray-600 mt-1 truncate">{group.title}</p>
                  <p className="text-xs text-gray-500">{group.memberCount || 0} members</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h2 className="text-base font-semibold text-gray-900 mb-3">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.slice(0, 2).map((action, index) => (
                <Link key={index} to={action.path} className="block p-3 text-center border border-gray-200 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors">
                  <div className="text-xl mb-1">{action.icon}</div>
                  <div className="text-xs font-medium text-gray-700">{action.label}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};

export default Home;