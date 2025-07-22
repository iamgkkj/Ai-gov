#!/usr/bin/env node

/**
 * AI-Gov Frontend Development Server
 * 
 * This script starts the React development server for the AI-Gov frontend.
 * It handles environment variable loading and server configuration.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Check if .env file exists in project root
const rootEnvPath = path.resolve(__dirname, '..', '.env');
if (fs.existsSync(rootEnvPath)) {
  console.log('Loading environment variables from root .env file');
  dotenv.config({ path: rootEnvPath });
}

// Check if .env.local file exists in frontend directory
const localEnvPath = path.resolve(__dirname, '.env.local');
if (fs.existsSync(localEnvPath)) {
  console.log('Loading environment variables from frontend .env.local file');
  dotenv.config({ path: localEnvPath });
}

console.log('Starting AI-Gov frontend development server...');

// Set environment variables for React app if they're not already set
if (!process.env.REACT_APP_API_URL) {
  process.env.REACT_APP_API_URL = 'http://localhost:8000';
  console.log(`Setting default API URL: ${process.env.REACT_APP_API_URL}`);
}

if (!process.env.REACT_APP_IPFS_GATEWAY) {
  process.env.REACT_APP_IPFS_GATEWAY = 'http://localhost:8080/ipfs/';
  console.log(`Setting default IPFS gateway: ${process.env.REACT_APP_IPFS_GATEWAY}`);
}

// Start the development server
try {
  console.log('Starting development server...');
  execSync('npm start', { stdio: 'inherit' });
} catch (error) {
  console.error('Failed to start development server:', error.message);
  process.exit(1);
}