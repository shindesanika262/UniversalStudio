import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Image, Sliders, Monitor, Film, Wand2, Sparkles, Layout, Palette } from 'lucide-react';
import PhotoEditor from '../components/tools/PhotoEditor';
import VideoEditor from '../components/tools/VideoEditor';

const MediaStudio = () => {
    const [editorType, setEditorType] = useState(null);

    const studioTools = [
        {
            id: 'photo',
            name: 'Photo Editor',
            desc: 'Crop, filter, and adjust images with precision.',
            icon: Image,
            color: '#4facfe',
            btnText: 'Launch Editor',
            features: ['AI Filters', 'Smart Crop', 'Precise Adjustments']
        },
        {
            id: 'video',
            name: 'Video Editor',
            desc: 'Timeline, transitions, and export options.',
            icon: Film,
            color: '#f093fb',
            btnText: 'Launch Studio',
            features: ['Timeline Edit', 'Transitions', '4K Export']
        }
    ];

    return (
        <div style={{ 
            minHeight: '100vh', 
            background: 'linear-gradient(135deg, #050505 0%, #111 100%)',
            padding: '4rem 2rem',
            color: 'white'
        }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: 'center', marginBottom: '5rem' }}
            >
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: '20px', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Sparkles size={16} color="var(--accent-gold)" />
                    <span style={{ fontSize: '0.8rem', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase' }}>Next-Gen Media Suite</span>
                </div>
                <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '1rem', background: 'linear-gradient(to right, #fff, #888)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Media Studio
                </h1>
                <p style={{ color: '#aaa', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
                    Everything you need to create stunning visual content in one powerful environment.
                </p>
            </motion.div>

            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
                gap: '30px', 
                maxWidth: '1000px', 
                margin: '0 auto' 
            }}>
                {studioTools.map((tool, idx) => (
                    <motion.div
                        key={tool.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        whileHover={{ y: -15, boxShadow: `0 20px 40px ${tool.color}22` }}
                        style={{ 
                            background: 'rgba(255,255,255,0.02)', 
                            padding: '40px', 
                            borderRadius: '24px', 
                            border: '1px solid rgba(255,255,255,0.08)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Background Glow */}
                        <div style={{ 
                            position: 'absolute', top: '-50px', right: '-50px', 
                            width: '150px', height: '150px', 
                            background: tool.color, opacity: 0.1, filter: 'blur(60px)',
                            borderRadius: '50%'
                        }} />

                        <div style={{ 
                            width: '64px', height: '64px', 
                            background: `linear-gradient(135deg, ${tool.color}33, ${tool.color}11)`, 
                            borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginBottom: '2rem'
                        }}>
                            <tool.icon size={32} color={tool.color} />
                        </div>

                        <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '1rem' }}>{tool.name}</h2>
                        <p style={{ color: '#888', marginBottom: '2rem', lineHeight: '1.6', fontSize: '1.1rem' }}>{tool.desc}</p>
                        
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '2.5rem' }}>
                            {tool.features.map(f => (
                                <span key={f} style={{ 
                                    fontSize: '0.75rem', padding: '6px 12px', background: 'rgba(255,255,255,0.05)', 
                                    borderRadius: '100px', border: '1px solid rgba(255,255,255,0.1)', color: '#ccc'
                                }}>
                                    {f}
                                </span>
                            ))}
                        </div>

                        <motion.button 
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setEditorType(tool.id)}
                            style={{
                                width: '100%', 
                                padding: '16px', 
                                borderRadius: '12px', 
                                border: 'none', 
                                background: `linear-gradient(135deg, ${tool.color}, ${tool.color}cc)`, 
                                color: '#fff', 
                                cursor: 'pointer', 
                                fontWeight: '700',
                                fontSize: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                boxShadow: `0 10px 20px ${tool.color}33`
                            }}
                        >
                            {tool.btnText}
                            <Wand2 size={18} />
                        </motion.button>
                    </motion.div>
                ))}
            </div>

            {/* Editor Modals with AnimatePresence */}
            <AnimatePresence>
                {editorType === 'photo' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        style={{ position: 'fixed', inset: 0, zIndex: 1000 }}
                    >
                        <PhotoEditor onClose={() => setEditorType(null)} />
                    </motion.div>
                )}
                {editorType === 'video' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        style={{ position: 'fixed', inset: 0, zIndex: 1000 }}
                    >
                        <VideoEditor onClose={() => setEditorType(null)} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
};

export default MediaStudio;
