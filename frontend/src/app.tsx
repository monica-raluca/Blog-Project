import React from 'react';
import { createRoot } from 'react-dom/client';
import { BlogApp } from './BlogApp';
import { AuthProvider } from './api/AuthContext';

// Clear the existing HTML content
document.body.innerHTML = '<div id="app"></div>';

// Render your React component instead
const appElement = document.getElementById('app');
if (appElement) {
  const root = createRoot(appElement);
  root.render(
    <AuthProvider> 
      <BlogApp />
    </AuthProvider>
  );
} 