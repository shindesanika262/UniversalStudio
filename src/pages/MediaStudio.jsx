import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Video, Image, Sliders, Monitor, Film } from 'lucide-react';
import PhotoEditor from '../components/tools/PhotoEditor';
import VideoEditor from '../components/tools/VideoEditor';

const MediaStudio = () => {
    const [editorType, setEditorType] = useState(null);

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ textAlign: 'center', marginBottom: '3rem' }}
            >
                <h1>Media Studio</h1>
                <p style={{ color: '#888' }}>Professional Photo & Video Editing Suite</p>
            </motion.div>

            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <motion.div
                    whileHover={{ y: -10 }}
                    style={{ width: '300px', background: '#111', padding: '30px', borderRadius: '16px', border: '1px solid #333' }}
                >
                    <Image size={48} color="#4facfe" />
                    <h2>Photo Editor</h2>
                    <p style={{ color: '#666' }}>Crop, filter, and adjust images with precision.</p>
                    <button onClick={() => setEditorType('photo')} style={{
                        marginTop: '1rem', padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#4facfe', color: '#fff', cursor: 'pointer', fontWeight: 'bold'
                    }}>Launch Editor</button>
                </motion.div>

                <motion.div
                    whileHover={{ y: -10 }}
                    style={{ width: '300px', background: '#111', padding: '30px', borderRadius: '16px', border: '1px solid #333' }}
                >
                    <Video size={48} color="#f093fb" />
                    <h2>Video Editor</h2>
                    <p style={{ color: '#666' }}>Timeline, transitions, and export options.</p>
                    <button onClick={() => setEditorType('video')} style={{
                        marginTop: '1rem', padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#f093fb', color: '#fff', cursor: 'pointer', fontWeight: 'bold'
                    }}>Launch Studio</button>
                </motion.div>
            </div>
            {editorType === 'photo' && <PhotoEditor onClose={() => setEditorType(null)} />}
            {editorType === 'video' && <VideoEditor onClose={() => setEditorType(null)} />}
        </div >
    );
};

export default MediaStudio;
