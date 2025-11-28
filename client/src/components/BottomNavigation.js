import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const BottomNavigation = () => {
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;
  
  // Don't show on auth pages
  if (['/login', '/register', '/forgot-password'].includes(location.pathname)) {
    return null;
  }

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
      <div className="grid grid-cols-4 h-16">
        {[
          { path: '/', label: 'Home', icon: '🏠' },
          { path: '/events', label: 'Events', icon: '📅' },
          { path: '/study-groups', label: 'Groups', icon: '👥' },
          { path: '/profile', label: 'Profile', icon: '👤' }
        ].map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center py-1 px-1 transition-colors ${
              isActive(item.path) ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span className="text-lg mb-0.5">{item.icon}</span>
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BottomNavigation;