import React from 'react';

const GroupInfoModal = ({ isOpen, onClose, item }) => {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-gray-800">{item.title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-4">
          <p className="text-gray-600">{item.description}</p>
          <div className="flex items-center text-gray-600">
            <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
              {item.course}
            </span>
          </div>
          <div className="border-t pt-4 mt-4">
            <p className="text-sm text-gray-500">{item.memberCount || 0} members</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupInfoModal;
