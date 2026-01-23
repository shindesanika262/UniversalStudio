import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Image, Scissors, Layers, Eye, Smartphone, Download, Upload, Cloud } from 'lucide-react';
import ImageToPdf from '../components/tools/ImageToPdf';
import MergePdf from '../components/tools/MergePdf';
import PdfSplit from '../components/tools/PdfSplit';
import PdfCompress from '../components/tools/PdfCompress';
import PdfConverter from '../components/tools/PdfConverter';
import PdfSecurity from '../components/tools/PdfSecurity';
import PdfOCR from '../components/tools/PdfOCR';
import PdfEditor from '../components/tools/PdfEditor';

const tools = [
    { name: 'Word to PDF', icon: FileText, desc: 'Convert Docx to PDF' },
    { name: 'JPG to PDF', icon: Image, desc: 'Convert Images to PDF' },
    { name: 'Merge PDF', icon: Layers, desc: 'Combine multiple PDFs' },
    { name: 'Split PDF', icon: Scissors, desc: 'Extract pages from PDF' },
    { name: 'Compress PDF', icon: Download, desc: 'Reduce file size' },
    { name: 'PDF to Word', icon: FileText, desc: 'Convert PDF to Docx' },
    { name: 'PDF to JPG', icon: Image, desc: 'Convert PDF to Images' },
    { name: 'Edit PDF', icon: Smartphone, desc: 'View and save PDF' },
    { name: 'Unlock PDF', icon: Upload, desc: 'Remove password' },
    { name: 'Protect PDF', icon: Cloud, desc: 'Add password encryption' },
    { name: 'OCR PDF', icon: FileText, desc: 'Extract text from scans' },
];

const PdfStudio = () => {
    const [activeTool, setActiveTool] = useState(null);

    const handleToolClick = (toolName) => {
        if (toolName === 'JPG to PDF') setActiveTool('jpg-to-pdf');
        else if (toolName === 'Merge PDF') setActiveTool('merge-pdf');
        else if (toolName === 'Split PDF') setActiveTool('split-pdf');
        else if (toolName === 'Compress PDF') setActiveTool('compress-pdf');
        else if (toolName === 'Word to PDF') setActiveTool('word-to-pdf');
        else if (toolName === 'PDF to Word') alert('Use Word to PDF logic inverse (Coming Soon)'); // Simplified for demo
        else if (toolName === 'PDF to JPG') setActiveTool('pdf-to-jpg');
        else if (toolName === 'Protect PDF') setActiveTool('protect-pdf');
        else if (toolName === 'Unlock PDF') setActiveTool('unlock-pdf');
        else if (toolName === 'OCR PDF') setActiveTool('ocr-pdf');
        else if (toolName === 'Edit PDF') setActiveTool('edit-pdf');
        else alert('This tool is under development!');
    };
    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ fontSize: '2.5rem', marginBottom: '2rem', textAlign: 'center' }}
            >
                PDF Studio
            </motion.h1>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px'
            }}>
                {tools.map((tool, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '12px',
                            padding: '20px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            cursor: 'pointer',
                            transition: 'background 0.3s'
                        }}
                        onClick={() => handleToolClick(tool.name)}
                        whileHover={{ scale: 1.05, background: 'rgba(255, 255, 255, 0.08)' }}
                    >
                        <tool.icon size={40} color="var(--accent-gold)" style={{ marginBottom: '1rem' }} />
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem' }}>{tool.name}</h3>
                        <p style={{ margin: 0, color: '#888', fontSize: '0.9rem', textAlign: 'center' }}>{tool.desc}</p>
                    </motion.div>
                ))}
            </div>
            {activeTool === 'jpg-to-pdf' && <ImageToPdf onClose={() => setActiveTool(null)} />}
            {activeTool === 'merge-pdf' && <MergePdf onClose={() => setActiveTool(null)} />}
            {activeTool === 'split-pdf' && <PdfSplit onClose={() => setActiveTool(null)} />}
            {activeTool === 'compress-pdf' && <PdfCompress onClose={() => setActiveTool(null)} />}
            {activeTool === 'word-to-pdf' && <PdfConverter mode="word-to-pdf" onClose={() => setActiveTool(null)} />}
            {activeTool === 'pdf-to-jpg' && <PdfConverter mode="pdf-to-jpg" onClose={() => setActiveTool(null)} />}
            {activeTool === 'protect-pdf' && <PdfSecurity mode="protect" onClose={() => setActiveTool(null)} />}
            {activeTool === 'unlock-pdf' && <PdfSecurity mode="unlock" onClose={() => setActiveTool(null)} />}
            {activeTool === 'ocr-pdf' && <PdfOCR onClose={() => setActiveTool(null)} />}
            {activeTool === 'edit-pdf' && <PdfEditor onClose={() => setActiveTool(null)} />}
        </div>
    );
};

export default PdfStudio;
