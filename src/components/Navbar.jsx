import { Link, useNavigate } from 'react-router-dom';
import { LayoutGrid, FileText, Image, Sparkles, Mail, LogIn, LogOut } from 'lucide-react';

const Navbar = () => {
    const navigate = useNavigate();
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        navigate('/login');
    };

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
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <Link to="/" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.9rem' }}>
                    <LayoutGrid size={18} /> Hub
                </Link>
                <Link to="/pdf-studio" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.9rem' }}>
                    <FileText size={18} /> PDF Studio
                </Link>
                <Link to="/media-studio" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.9rem' }}>
                    <Image size={18} /> Media Studio
                </Link>
                <Link to="/contact" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.9rem' }}>
                    <Mail size={18} /> Contact
                </Link>
                
                {isAuthenticated ? (
                    <button onClick={handleLogout} style={{ 
                        color: 'white', 
                        textDecoration: 'none', 
                        display: 'flex', 
                        gap: '8px', 
                        alignItems: 'center', 
                        fontSize: '0.9rem', 
                        backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                        padding: '8px 20px', 
                        borderRadius: '12px',
                        fontWeight: '600',
                        border: '1px solid var(--glass-border)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                    }}>
                        <LogOut size={18} /> Logout
                    </button>
                ) : (
                    <Link to="/login" style={{ 
                        color: 'black', 
                        textDecoration: 'none', 
                        display: 'flex', 
                        gap: '8px', 
                        alignItems: 'center', 
                        fontSize: '0.9rem', 
                        backgroundColor: 'var(--accent-gold)', 
                        padding: '8px 20px', 
                        borderRadius: '12px',
                        fontWeight: '600',
                        transition: 'all 0.3s ease'
                    }}>
                        <LogIn size={18} /> Login
                    </Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
