import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import PdfStudio from './pages/PdfStudio';
import MediaStudio from './pages/MediaStudio';
import Enhancer from './pages/Enhancer';
import ContactUs from './pages/ContactUs';

function App() {
    return (
        <Router>
            <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                <Navbar />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/pdf-studio" element={<PdfStudio />} />
                    <Route path="/media-studio" element={<MediaStudio />} />
                    <Route path="/enhancer" element={<Enhancer />} />
                    <Route path="/contact" element={<ContactUs />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
