import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';
import IssuedBooks from './IssuedBooks';
import Members from './Members'; 
import Inventory from './Inventory';
import 'bootstrap/dist/css/bootstrap.min.css';


function App() {
 
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const savedAuth = localStorage.getItem("isLoggedIn");
    return savedAuth === "true";
  });

  useEffect(() => {
    localStorage.setItem("isLoggedIn", isLoggedIn);
  }, [isLoggedIn]);

  return (
    <Router>
      <Routes>
        {/* Login Page */}
        <Route 
          path="/login" 
          element={!isLoggedIn ? <Login setAuth={setIsLoggedIn} /> : <Navigate to="/dashboard" />} 
        />
        
        {/* Dashboard Page (Protected) */}
        <Route 
          path="/dashboard" 
          element={isLoggedIn ? <Dashboard setAuth={setIsLoggedIn} /> : <Navigate to="/login" />} 
        />

        {/* Issued Books Page (Protected) */}
        <Route 
          path="/issued" 
          element={isLoggedIn ? <IssuedBooks /> : <Navigate to="/login" />} 
        />

        {/* Members List Page */}
        <Route 
          path="/members" 
          element={isLoggedIn ? <Members /> : <Navigate to="/login" />} 
        />
        
        {/* Default Route */}
        <Route path="*" element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} />} />

        <Route path="/inventory" element={<Inventory />} />
      </Routes>
    </Router>
  );
}

export default App;