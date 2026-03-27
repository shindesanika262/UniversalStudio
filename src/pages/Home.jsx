import React from 'react';
import { motion } from 'framer-motion';

const Home = () => {
    return (
        <div className="home-container" style={{ padding: '8rem 2rem 4rem', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <h1 style={{ 
                    fontSize: '4.5rem', 
                    fontWeight: '800',
                    lineHeight: '1.1',
                    letterSpacing: '-0.02em',
                    marginBottom: '1.5rem', 
                    background: 'linear-gradient(to bottom right, #ffffff 30%, #a1a1aa)', 
                    WebkitBackgroundClip: 'text', 
                    WebkitTextFillColor: 'transparent',
                    filter: 'drop-shadow(0 0 30px rgba(255,255,255,0.1))'
                }}>
                    Universal Studio One
                </h1>
                <p style={{ 
                    fontSize: '1.4rem', 
                    color: '#a1a1aa', 
                    maxWidth: '800px', 
                    margin: '0 auto 3rem',
                    lineHeight: '1.6' 
                }}>
                    The professional-grade digital workstation. Manage <span style={{ color: '#fff' }}>PDF Documents</span>, 
                    edit <span style={{ color: '#fff' }}>Media Files</span>, and 
                    apply <span style={{ color: '#fff' }}>AI Quality Enhancement</span> in one seamless interface.
                </p>

                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                    gap: '2rem',
                    marginTop: '4rem'
                }}>
                    {[
                        { 
                            title: 'PDF Studio', 
                            desc: 'Professional PDF conversion, merging, and compression tools.',
                            icon: '📄'
                        },
                        { 
                            title: 'Media Hub', 
                            desc: 'Advanced photo and video editing tools within your browser.',
                            icon: '🎨'
                        },
                        { 
                            title: 'AI Enhancer', 
                            desc: 'Upscale and improve image quality using state-of-the-art AI.',
                            icon: '✨'
                        }
                    ].map((feature, idx) => (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 + idx * 0.1 }}
                            style={{ 
                                padding: '2.5rem', 
                                background: 'rgba(255, 255, 255, 0.03)', 
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                borderRadius: '24px',
                                textAlign: 'left',
                                backdropFilter: 'blur(10px)'
                            }}
                        >
                            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{feature.icon}</div>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', color: '#fff' }}>{feature.title}</h2>
                            <p style={{ color: '#71717a', lineHeight: '1.5' }}>{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};


export default Home;
