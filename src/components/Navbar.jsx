import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, FileText, Image, Sparkles, Mail } from 'lucide-react';

const Navbar = () => {
    return (
        <nav style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 2rem',
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid var(--glass-border)',
            position: 'sticky',
            top: 0,
            zIndex: 100
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Sparkles size={24} color="var(--accent-gold)" />
                <h2 style={{ margin: 0, fontWeight: 700, letterSpacing: '-0.5px' }}>Universal Studio</h2>
            </div>
            <div style={{ display: 'flex', gap: '2rem' }}>
                <Link to="/" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.9rem' }}>
                    <LayoutGrid size={18} /> Hub
                </Link>
                <Link to="/pdf-studio" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.9rem' }}>
                    <FileText size={18} /> PDF Studio
                </Link>
                <Link to="/media-studio" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.9rem' }}>
                    <Image size={18} /> Media Studio
                </Link>
                <Link to="/contact" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.9rem', border: '1px solid var(--accent-gold)', padding: '5px 15px', borderRadius: '20px', backgroundColor: 'rgba(255, 215, 0, 0.1)' }}>
                    <Mail size={18} /> Contact Us
                </Link>
            </div>
        </nav>
    );
};

export default Navbar;
