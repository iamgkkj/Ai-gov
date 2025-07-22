import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-background-light py-8 border-t border-gray-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AI-Gov
            </h3>
            <p className="text-gray-400 mb-4">
              An AI-powered governance system for DAOs that uses Smart Contracts and LLMs to analyze, score, and vote on proposals autonomously.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/proposals" className="text-gray-400 hover:text-white transition-colors">
                  Proposals
                </Link>
              </li>
              <li>
                <Link to="/submit" className="text-gray-400 hover:text-white transition-colors">
                  Submit Proposal
                </Link>
              </li>
              <li>
                <Link to="/vote" className="text-gray-400 hover:text-white transition-colors">
                  Voting Panel
                </Link>
              </li>
              <li>
                <Link to="/delegate" className="text-gray-400 hover:text-white transition-colors">
                  AI Delegate Setup
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <a href="https://github.com/your-repo/ai-gov" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  GitHub
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  API
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-500">
          <p>© {new Date().getFullYear()} AI-Gov. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;