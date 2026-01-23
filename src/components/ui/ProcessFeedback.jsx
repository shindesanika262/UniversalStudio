import React, { useState, useEffect } from 'react';
import { Loader2, Download, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const ProcessFeedback = ({
    processing,
    progress = 0,
    resultReady,
    defaultFilename = 'document',
    onDownload,
    onCancel
}) => {
    const [filename, setFilename] = useState(defaultFilename);

    useEffect(() => {
        if (defaultFilename) setFilename(defaultFilename);
    }, [defaultFilename]);

    if (!processing && !resultReady) return null;

    return (
        <div style={{
            marginTop: '20px', padding: '20px', background: '#222',
            borderRadius: '12px', width: '100%', border: '1px solid #333'
        }}>
            {processing ? (
                <div style={{ textAlign: 'center' }}>
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        style={{ display: 'inline-block', marginBottom: '10px' }}
                    >
                        <Loader2 size={30} color="var(--accent-gold)" />
                    </motion.div>
                    <p>Processing...</p>
                    <div style={{
                        width: '100%', background: '#444', height: '8px',
                        borderRadius: '4px', marginTop: '10px', overflow: 'hidden'
                    }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            style={{ height: '100%', background: 'var(--accent-gold)' }}
                        />
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '5px' }}>{progress}%</p>
                </div>
            ) : resultReady ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#4caf50', marginBottom: '10px' }}>
                        <CheckCircle size={20} />
                        <span>Ready to Download!</span>
                    </div>

                    <label style={{ fontSize: '0.9rem', color: '#ccc' }}>Save as:</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="text"
                            value={filename}
                            onChange={(e) => setFilename(e.target.value)}
                            style={{
                                flex: 1, padding: '10px', borderRadius: '8px',
                                border: '1px solid #444', background: '#111', color: 'white'
                            }}
                        />
                        <button
                            onClick={async () => {
                                if (onDownload) {
                                    // If handling locally with new blob prop (not passed yet in legacy tools)
                                    // wrapper will just call onDownload(filename)
                                    // But we want to support both.
                                    // Ideally, parent passes blob to THIS component.
                                    // For now, let's keep it simple: existing parents use onDownload(filename).
                                    // New usage: allow parent to do the picker logic?
                                    // No, duplication.
                                    // Let's call onDownload(filename, true) where true requests a "handle" or expects internal logic?
                                    // Actually, simplest is to let onDownload be async and return nothing.
                                    onDownload(filename);
                                }
                            }}
                            style={{
                                padding: '10px 20px', background: 'var(--accent-gold)',
                                color: 'black', fontWeight: 'bold', borderRadius: '8px',
                                border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'
                            }}
                        >
                            <Download size={18} /> Save
                        </button>
                    </div>
                </div>
            ) : null}
        </div>
    );
};


export const saveFile = async (blob, filename, extension) => {
    try {
        if (window.showSaveFilePicker) {
            const handle = await window.showSaveFilePicker({
                suggestedName: `${filename}.${extension}`,
                types: [{
                    description: `${extension.toUpperCase()} File`,
                    accept: { [blob.type]: [`.${extension}`] },
                }],
            });
            const writable = await handle.createWritable();
            await writable.write(blob);
            await writable.close();
        } else {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${filename}.${extension}`;
            link.click();
        }
    } catch (err) {
        console.error('File save cancelled or failed:', err);
    }
};

export default ProcessFeedback;
