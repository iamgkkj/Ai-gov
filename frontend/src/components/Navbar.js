import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const Navbar = () => {
  const location = useLocation();
  
  const navItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'Proposals', path: '/proposals' },
    { name: 'Submit', path: '/submit' },
    { name: 'Vote', path: '/vote' },
    { name: 'Delegate', path: '/delegate' },
  ];

  return (
    <nav className="bg-background-light py-4 border-b border-gray-800">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AI-Gov
            </span>
          </Link>
          
          <div className="hidden md:flex space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`${location.pathname === item.path ? 'text-primary font-medium' : 'text-gray-400 hover:text-white'} transition-colors`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
        
        <div className="flex items-center">
          <ConnectButton />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;