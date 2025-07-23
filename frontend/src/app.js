import { createRoot } from 'react-dom/client';
import { BlogApp} from './BlogApp';
import { AuthProvider } from './api/AuthContext';

// Clear the existing HTML content
document.body.innerHTML = '<div id="app"></div>';

// Render your React component instead
const root = createRoot(document.getElementById('app'));
root.render(<AuthProvider> 
    <BlogApp/>
</AuthProvider>);

// // console.log('Hello world!');
// import { createRoot } from 'react-dom/client';

// // Clear the existing HTML content
// document.body.innerHTML = '<div id="app"></div>';

// // Render your React component instead
// const root = createRoot(document.getElementById('app'));
// root.render(<h1>Hello, world</h1>);
