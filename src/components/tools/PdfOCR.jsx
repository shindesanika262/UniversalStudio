import React, { useState } from 'react';
import Tesseract from 'tesseract.js';
import { ScanText, X, Upload, Copy } from 'lucide-react';
import ProcessFeedback from '../ui/ProcessFeedback';

const PdfOCR = ({ onClose }) => {
    const [file, setFile] = useState(null);
    const [text, setText] = useState('');
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleProcess = async () => {
        if (!file) return;
        setProcessing(true);
        setProgress(0);

        try {
            const result = await Tesseract.recognize(
                file,
                'eng',
                {
                    logger: m => {
                        if (m.status === 'recognizing text') setProgress(Math.floor(m.progress * 100));
                    }
                }
            );
            setText(result.data.text);
        } catch (err) {
            console.error(err);
            alert('OCR Failed');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div style={{
                background: '#1a1a1a', padding: '30px', borderRadius: '20px',
                width: '90%', maxWidth: '600px', border: '1px solid var(--glass-border)',
                maxHeight: '80vh', display: 'flex', flexDirection: 'column'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h2>OCR PDF/Image</h2>
                    <X onClick={onClose} style={{ cursor: 'pointer' }} />
                </div>

                {!text ? (
                    <>
                        <div style={{
                            border: '2px dashed #444', borderRadius: '10px', padding: '30px',
                            textAlign: 'center', cursor: 'pointer'
                        }} onClick={() => document.getElementById('ocr-upload').click()}>
                            <ScanText size={40} />
                            <p>Upload Image or PDF</p>
                            <input id="ocr-upload" type="file" accept="image/*,application/pdf" style={{ display: 'none' }} onChange={(e) => setFile(e.target.files[0])} />
                        </div>

                        {file && (
                            <div style={{ marginTop: '20px' }}>
                                <p>Selected: {file.name}</p>
                                <button
                                    onClick={handleProcess}
                                    disabled={processing}
                                    style={{
                                        width: '100%', padding: '10px', borderRadius: '10px',
                                        background: 'var(--accent-gold)', color: 'black', fontWeight: 'bold',
                                        border: 'none', cursor: 'pointer', marginTop: '10px'
                                    }}
                                >
                                    {processing ? 'Scanning...' : 'Extract Text'}
                                </button>

                                <ProcessFeedback
                                    processing={processing}
                                    progress={progress}
                                    resultReady={false}
                                />
                            </div>
                        )}
                    </>
                ) : (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <textarea
                            value={text}
                            readOnly
                            style={{
                                width: '100%', height: '300px', background: '#111', color: '#ccc',
                                padding: '10px', border: '1px solid #333', borderRadius: '8px', resize: 'none'
                            }}
                        />
                        <button
                            onClick={() => { navigator.clipboard.writeText(text); alert('Copied!'); }}
                            style={{
                                padding: '10px', borderRadius: '8px', background: '#333', color: 'white',
                                border: 'none', cursor: 'pointer', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                            }}
                        >
                            <Copy size={16} /> Copy to Clipboard
                        </button>
                        <button
                            onClick={() => setText('')}
                            style={{
                                padding: '10px', borderRadius: '8px', background: 'transparent', color: '#888',
                                border: 'none', cursor: 'pointer', marginTop: '10px'
                            }}
                        >
                            Scan Another
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PdfOCR;
