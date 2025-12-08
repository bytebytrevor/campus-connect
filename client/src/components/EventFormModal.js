import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import MapLocationPicker from './MapLocationPicker';

const EventFormModal = ({ isOpen, onClose, onSave, event }) => {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    lat: null,
    lng: null,
    category: 'workshop',
    description: ''
  });
  const { currentUser } = useAuth();
  const { addNotification } = useNotification();

  useEffect(() => {
    if (event) {
      setFormData({
        ...event,
        lat: event.lat || null,
        lng: event.lng || null
      });
    } else {
      setFormData({
        title: '',
        date: '',
        time: '',
        location: '',
        lat: null,
        lng: null,
        category: 'workshop',
        description: ''
      });
    }
  }, [event]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLocationSelect = (latlng) => {
    setFormData(prev => ({
      ...prev,
      lat: latlng.lat,
      lng: latlng.lng,
      location: `${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentUser) {
      addNotification('You must be logged in to create or edit events.', 'error');
      return;
    }
    onSave({ ...formData, creatorId: currentUser.uid });
    addNotification(
      event ? 'Event updated successfully!' : 'Event created successfully!',
      'success'
    );
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">{event ? 'Edit Event' : 'Create New Event'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Event Title"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="workshop">Workshop</option>
                <option value="lecture">Lecture</option>
                <option value="club">Club</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <MapLocationPicker
                onLocationSelect={handleLocationSelect}
                initialPosition={formData.lat && formData.lng ? { lat: formData.lat, lng: formData.lng } : null}
              />
            </div>
            <div className="mb-6">
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Event Description"
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              ></textarea>
            </div>
            <div className="flex justify-end gap-4 sticky bottom-0 bg-white pt-4 border-t -mx-8 -mb-8 px-8 pb-8">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {event ? 'Save Changes' : 'Create Event'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventFormModal;
