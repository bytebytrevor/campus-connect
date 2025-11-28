import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, userProfile, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const isActive = (path) => location.pathname === path;
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  // Don't show navbar on auth pages
  if (['/login', '/register', '/forgot-password'].includes(location.pathname)) {
    return null;
  }
  
  return (
    <nav className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Mobile Layout */}
          <div className="md:hidden flex items-center justify-between w-full px-1">
            <button 
              className="p-1.5 flex-shrink-0"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex-1 flex justify-center">
              <Logo className="w-8 h-8" size="small" />
            </div>
            <button className="p-1.5 flex-shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.5 3.5a6 6 0 0 1 6 6v2l1.5 3h-15l1.5-3v-2a6 6 0 0 1 6-6z" />
              </svg>
            </button>
          </div>
          
          {/* Desktop Layout */}
          <div className="hidden md:flex items-center justify-between w-full">
            <Link to="/" className="flex items-center space-x-2">
              <img src="/logo.webp" alt="CampusConnect" style={{ width: '120px', height: '120px', mixBlendMode: 'multiply' }} />
            </Link>
            
            {currentUser && (
              <div className="flex items-center space-x-1">
                {[
                  { path: '/', label: 'Home' },
                  { path: '/events', label: 'Events' },
                  { path: '/study-groups', label: 'Groups' },
                  { path: '/profile', label: 'Profile' }
                ].map(({ path, label }) => (
                  <Link
                    key={path}
                    to={path}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      isActive(path)
                        ? 'text-white border-b-2 border-white'
                        : 'text-white/80 hover:text-white'
                    }`}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            )}
            
            <div className="flex items-center space-x-4">
              {currentUser ? (
                <>
                  <button className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors relative">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </button>
                  
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-2 hover:bg-white/10 px-2 py-1 rounded-lg transition-colors"
                    >
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center overflow-hidden border-2 border-white/20">
                        {userProfile?.photoURL ? (
                          <img src={userProfile.photoURL} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-indigo-600 font-semibold text-lg">
                            {userProfile?.firstName?.[0] || currentUser.email[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                    </button>
                    
                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border">
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Profile
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          Sign out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex space-x-3">
                  <Link
                    to="/login"
                    className="text-white/80 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {showMobileMenu && currentUser && (
          <div className="md:hidden bg-indigo-700">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {[
                { path: '/', label: 'Home' },
                { path: '/events', label: 'Events' },
                { path: '/study-groups', label: 'Study Groups' },
                { path: '/profile', label: 'Profile' }
              ].map(({ path, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive(path)
                      ? 'bg-white/20 text-white'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                  onClick={() => setShowMobileMenu(false)}
                >
                  {label}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white/80 hover:text-white hover:bg-white/10"
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;