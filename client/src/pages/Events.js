import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import EventFormModal from '../components/EventFormModal';
import EventDetailsModal from '../components/EventDetailsModal';
import { Trash2 } from 'lucide-react';

// Events component to display and manage campus events
const Events = () => {
  // State for managing event filters, event data, loading status, and modal visibility
  const [filter, setFilter] = useState('all');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { currentUser } = useAuth();

  // Fetch events from Firestore on component mount
  useEffect(() => {
    fetchEvents();
  }, []);

  // Fetches all events from the 'events' collection in Firestore
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const eventsCollection = collection(db, 'events');
      const eventsSnapshot = await getDocs(eventsCollection);
      const eventsData = eventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEvents(eventsData);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handles saving a new or edited event
  const handleSaveEvent = async (eventData) => {
    try {
      if (editingEvent) {
        // Update existing event if in edit mode
        const eventRef = doc(db, 'events', editingEvent.id);
        await updateDoc(eventRef, eventData);
      } else {
        // Create a new event with default attendee info
        await addDoc(collection(db, 'events'), {
          ...eventData,
          attendeeIds: [],
          attendeeCount: 0,
          creatorId: currentUser.uid
        });
      }
      fetchEvents(); // Refresh the events list
      setIsModalOpen(false);
      setEditingEvent(null);
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  // Opens the modal to add a new event
  const addEvent = () => {
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  // Handles the edit action for an event, with permission check
  const handleEdit = (event) => {
    if (currentUser?.uid !== event.creatorId) {
      alert("You don't have permission to edit this event.");
      return;
    }
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  // Handles the RSVP action for an event
  const handleRSVP = async (eventId) => {
    if (!currentUser) return;
    
    try {
      const eventRef = doc(db, 'events', eventId);
      const event = events.find(e => e.id === eventId);
      const isRSVPed = event.attendeeIds?.includes(currentUser.uid);
      
      // Toggle RSVP status
      if (isRSVPed) {
        await updateDoc(eventRef, {
          attendeeIds: arrayRemove(currentUser.uid),
          attendeeCount: (event.attendeeCount || 1) - 1
        });
      } else {
        await updateDoc(eventRef, {
          attendeeIds: arrayUnion(currentUser.uid),
          attendeeCount: (event.attendeeCount || 0) + 1
        });
      }
      
      fetchEvents(); // Refresh events to show updated RSVP status
    } catch (error) {
      console.error('Error updating RSVP:', error);
    }
  };

  // Handles deleting an event
  const handleDelete = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      const response = await fetch(`http://localhost:5001/api/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          // Include auth token if required by your backend
          // 'Authorization': `Bearer ${currentUserToken}`
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to delete event');

      // Remove the deleted event from state so the UI updates
      setEvents(prevEvents => prevEvents.filter(e => e.id !== eventId));
      console.log('Event deleted successfully');
    } catch (error) {
      console.error('Error deleting event:', error);
      alert(error.message);
    }
  };


  // Categories for filtering events
  const categories = [
    { id: 'all', label: 'All Events' },
    { id: 'workshop', label: 'Workshops' },
    { id: 'study', label: 'Study Groups' },
    { id: 'career', label: 'Career' },
    { id: 'social', label: 'Social' }
  ];

  // Filter events based on the selected category
  const filteredEvents = filter === 'all' ? events : events.filter(event => event.category === filter);

  // Display a loading spinner while events are being fetched
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  // Render the events page
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile Header */}
        <div className="lg:hidden mb-6">
          <div className="flex items-center mb-4">
            <button className="mr-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-gray-900">Events</h1>
          </div>
          
          {/* Search Bar */}
          <div className="relative mb-4">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search events..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          {/* Filter Buttons */}
          <div className="flex gap-2 mb-6">
            <button 
              onClick={() => setFilter('workshop')}
              className={`px-4 py-2 rounded font-medium ${
                filter === 'workshop' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border'
              }`}
            >
              Workshop
            </button>
            <button 
              onClick={() => setFilter('lecture')}
              className={`px-4 py-2 rounded font-medium ${
                filter === 'lecture' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border'
              }`}
            >
              Lecture
            </button>
            <button 
              onClick={() => setFilter('club')}
              className={`px-4 py-2 rounded font-medium ${
                filter === 'club' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border'
              }`}
            >
              Club
            </button>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Events</h1>
          
          <div className="flex items-center gap-4 mb-6">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search events..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            {/* Filters Button */}
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
              </svg>
              Filters
            </button>
          </div>
          
          {/* Filter Buttons */}
          <div className="flex gap-2 mb-6">
            <button 
              onClick={() => setFilter('workshop')}
              className={`px-4 py-2 rounded font-medium ${
                filter === 'workshop' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border'
              }`}
            >
              Workshop
            </button>
            <button 
              onClick={() => setFilter('lecture')}
              className={`px-4 py-2 rounded font-medium ${
                filter === 'lecture' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border'
              }`}
            >
              Lecture
            </button>
            <button 
              onClick={() => setFilter('club')}
              className={`px-4 py-2 rounded font-medium ${
                filter === 'club' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border'
              }`}
            >
              Club
            </button>
          </div>
        </div>

        {/* Events List */}
        <div className="space-y-4">
          {filteredEvents.map(event => (
            <div key={event.id} className="bg-white rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 cursor-pointer" onClick={() => setSelectedEvent(event)}>
                  <h3 className="font-semibold text-gray-900">{event.title}</h3>
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {event.date} - {event.time}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {event.location}
                  </div>
                </div>
                <button 
                  onClick={() => handleRSVP(event.id)}
                  className={`px-4 py-2 rounded font-medium transition-colors ${
                    event.attendeeIds?.includes(currentUser?.uid)
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {event.attendeeIds?.includes(currentUser?.uid) ? 'RSVP\'d' : 'RSVP'}
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Floating Action Button */}
        <button
          onClick={addEvent}
          className="fixed bottom-20 lg:bottom-8 right-4 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-colors z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
      {/* Modal for adding/editing events */}
      <EventFormModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEvent(null);
        }}
        onSave={handleSaveEvent}
        event={editingEvent}
      />

      {selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          currentUser={currentUser}
          onClose={() => setSelectedEvent(null)}
          onUpdate={fetchEvents}
          onRSVP={handleRSVP}
        />
      )}
    </div>
  );
};

export default Events;