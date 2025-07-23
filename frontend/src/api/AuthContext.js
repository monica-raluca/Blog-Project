// // AuthContext.js
// import { createContext, useState, useEffect } from 'react';

// export const AuthContext = createContext();

// export function AuthProvider({ children }) {
//   const [token, setToken] = useState(localStorage.getItem('token'));
//   const [currentUser, setCurrentUser] = useState(localStorage.getItem('currentUser'));

//   useEffect(() => {
//     function handleStorage() {
//       setToken(localStorage.getItem('token'));
//       setCurrentUser(localStorage.getItem('currentUser'));
//     }
//     window.addEventListener('storage', handleStorage);
//     return () => window.removeEventListener('storage', handleStorage);
//   }, []);

//   return (
//     <AuthContext.Provider value={{ token, currentUser, setToken, setCurrentUser }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }