import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import PdfStudio from './pages/PdfStudio';
import MediaStudio from './pages/MediaStudio';
import Enhancer from './pages/Enhancer';
import ContactUs from './pages/ContactUs';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';



function App() {
    return (
        <Router>
            <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                <Navbar />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/pdf-studio" element={<ProtectedRoute><PdfStudio /></ProtectedRoute>} />
                    <Route path="/media-studio" element={<ProtectedRoute><MediaStudio /></ProtectedRoute>} />
                    <Route path="/enhancer" element={<ProtectedRoute><Enhancer /></ProtectedRoute>} />
                    <Route path="/contact" element={<ProtectedRoute><ContactUs /></ProtectedRoute>} />
                    <Route path="/login" element={<Login />} />
                </Routes>

            </div>
        </Router>
    );
}

export default App;
