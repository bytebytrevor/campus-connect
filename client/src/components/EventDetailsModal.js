import React, { useState } from 'react';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

const EventDetailsModal = ({ event, currentUser, onClose, onUpdate, onRSVP }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: event.title,
    description: event.description || '',
    date: event.date,
    time: event.time,
    location: event.location,
    category: event.category || ''
  });

  const isCreator = event.creatorId === currentUser?.uid;
  const isRSVPed = event.attendeeIds?.includes(currentUser?.uid);

  const handleEdit = async () => {
    try {
      await updateDoc(doc(db, 'events', event.id), formData);
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await deleteDoc(doc(db, 'events', event.id));
      onClose();
      onUpdate();
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{event.title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          {isEditing ? (
            <>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full border rounded-lg px-4 py-2"
                placeholder="Event Title"
              />
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full border rounded-lg px-4 py-2"
                rows="3"
                placeholder="Description"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="border rounded-lg px-4 py-2"
                />
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                  className="border rounded-lg px-4 py-2"
                />
              </div>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="w-full border rounded-lg px-4 py-2"
                placeholder="Location"
              />
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full border rounded-lg px-4 py-2"
              >
                <option value="">Select Category</option>
                <option value="workshop">Workshop</option>
                <option value="study">Study Group</option>
                <option value="career">Career</option>
                <option value="social">Social</option>
              </select>
            </>
          ) : (
            <>
              <div>
                <h3 className="font-semibold text-gray-700">Description</h3>
                <p className="text-gray-600">{event.description || 'No description provided'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-700">Date & Time</h3>
                  <p className="text-gray-600">{event.date} at {event.time}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">Location</h3>
                  <p className="text-gray-600">{event.location}</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">Attendees</h3>
                <p className="text-gray-600">{event.attendeeCount || 0} people attending</p>
              </div>
              {event.category && (
                <div>
                  <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">
                    {event.category}
                  </span>
                </div>
              )}
            </>
          )}

          <div className="flex gap-2 pt-4">
            {isCreator ? (
              isEditing ? (
                <>
                  <button onClick={handleEdit} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                    Save
                  </button>
                  <button onClick={() => setIsEditing(false)} className="border px-4 py-2 rounded-lg hover:bg-gray-50">
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => setIsEditing(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                    Edit
                  </button>
                  <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
                    Delete
                  </button>
                </>
              )
            ) : (
              <button 
                onClick={() => onRSVP(event.id)}
                className={`px-6 py-2 rounded-lg font-medium ${
                  isRSVPed 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {isRSVPed ? "RSVP'd" : 'RSVP'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsModal;
