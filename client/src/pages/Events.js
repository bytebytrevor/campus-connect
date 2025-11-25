import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import EventFormModal from '../components/EventFormModal';
import { Trash2 } from 'lucide-react';

// Events component to display and manage campus events
const Events = () => {
  // State for managing event filters, event data, loading status, and modal visibility
  const [filter, setFilter] = useState('all');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
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
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Campus Events</h1>
          <p className="text-lg text-gray-600">Discover and join exciting events happening around campus</p>
        </div>

        {/* Filter Buttons */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setFilter(category.id)}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  filter === category.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(event => (
            <div key={event.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden flex flex-col">
              <div className="p-6 flex-grow">
                <div className="flex items-center justify-between mb-4">
                  {/* Event Category Badge */}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    event.category === 'workshop' ? 'bg-blue-100 text-blue-800' :
                    event.category === 'study' ? 'bg-green-100 text-green-800' :
                    event.category === 'career' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                  </span>
                  <span className="text-sm text-gray-500">{event.attendeeCount || 0} attending</span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                <p className="text-gray-600 mb-4 flex-grow">{event.description}</p>
                
                {/* Event Details */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {event.date} at {event.time}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {event.location}
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="p-6 bg-gray-50 flex items-center gap-2">
                {/* Show edit button if the current user is the event creator */}
                <button 
                  onClick={() => handleRSVP(event.id)}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                    event.attendeeIds?.includes(currentUser?.uid)
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {event.attendeeIds?.includes(currentUser?.uid) ? 'RSVP\'d' : 'RSVP Now'}
                </button>
                {/* Show edit button if the current user is the event creator */}
                {currentUser?.uid === event.creatorId && (
                  <button 
                    onClick={() => handleEdit(event)}
                    className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path></svg>
                  </button>
                )}
                {currentUser?.uid === event.creatorId && (
                  <>

                    {/* Delete button */}
                    <button 
                      onClick={() => handleDelete(event.id)}
                      className="p-2 bg-red-200 text-red-700 rounded-lg hover:bg-red-300"
                    >
                      <Trash2 />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Floating Action Button to Add Event */}
        <div className="fixed bottom-8 right-8">
          <button
            onClick={addEvent}
            className="bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
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
    </div>
  );
};

export default Events;