import React from 'react';
import { motion } from 'framer-motion';

const Home = () => {
    return (
        <div style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ fontSize: '3.5rem', marginBottom: '1rem', background: 'linear-gradient(to right, #fff, #888)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
                Your Digital Creative Suite
            </motion.h1>
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                style={{ fontSize: '1.2rem', color: '#888', maxWidth: '600px' }}
            >
                All-in-one platform for PDF management, Media editing, and AI Quality enhancement.
            </motion.p>
        </div>
    );
};

export default Home;
