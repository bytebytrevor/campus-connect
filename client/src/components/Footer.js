import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center space-x-6 md:order-2">
            <Link to="/about" className="text-gray-400 hover:text-gray-500">About</Link>
            <Link to="/contact" className="text-gray-400 hover:text-gray-500">Contact</Link>
            <Link to="/privacy" className="text-gray-400 hover:text-gray-500">Privacy Policy</Link>
          </div>
          <p className="mt-8 text-center text-base text-gray-400 md:mt-0 md:order-1">
            &copy; {new Date().getFullYear()} CampusConnect. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
