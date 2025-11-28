import React, { useState } from 'react';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

const GroupDetailsModal = ({ group, currentUser, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    course: group.course,
    title: group.title,
    description: group.description || '',
    maxMembers: group.maxMembers,
    meetingDay: group.meetingDay || '',
    meetingTime: group.meetingTime || '',
    location: group.location || ''
  });

  const isCreator = group.createdBy === currentUser?.uid;
  const isMember = group.memberIds?.includes(currentUser?.uid);

  const handleEdit = async () => {
    try {
      await updateDoc(doc(db, 'studyGroups', group.id), formData);
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating group:', error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this group?')) return;
    try {
      await deleteDoc(doc(db, 'studyGroups', group.id));
      onClose();
      onUpdate();
    } catch (error) {
      console.error('Error deleting group:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{group.course} - {group.title}</h2>
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
                value={formData.course}
                onChange={(e) => setFormData({...formData, course: e.target.value})}
                className="w-full border rounded-lg px-4 py-2"
                placeholder="Course Code"
              />
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full border rounded-lg px-4 py-2"
                placeholder="Title"
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
                  type="number"
                  value={formData.maxMembers}
                  onChange={(e) => setFormData({...formData, maxMembers: parseInt(e.target.value)})}
                  className="border rounded-lg px-4 py-2"
                  placeholder="Max Members"
                />
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="border rounded-lg px-4 py-2"
                  placeholder="Location"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <h3 className="font-semibold text-gray-700">Description</h3>
                <p className="text-gray-600">{group.description || 'No description provided'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-700">Members</h3>
                  <p className="text-gray-600">{group.memberCount || 0}/{group.maxMembers}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">Location</h3>
                  <p className="text-gray-600">{group.location || 'TBD'}</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">Schedule</h3>
                <p className="text-gray-600">{group.schedule || 'Not set'}</p>
              </div>
            </>
          )}

          <div className="flex gap-2 pt-4">
            {isCreator && (
              <>
                {isEditing ? (
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
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupDetailsModal;
