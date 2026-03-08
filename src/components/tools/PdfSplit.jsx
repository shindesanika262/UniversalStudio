import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Scissors, Upload, X } from 'lucide-react';

import ProcessFeedback from '../ui/ProcessFeedback';

const PdfSplit = ({ onClose }) => {
    const [file, setFile] = useState(null);
    const [range, setRange] = useState('');
    const [processing, setProcessing] = useState(false);
    const [splitBlob, setSplitBlob] = useState(null);

    const handleSplit = async () => {
        if (!file || !range) return;
        setProcessing(true);

        try {
            const fileBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(fileBuffer);
            const newPdf = await PDFDocument.create();

            // Parse range: e.g. "1-3, 5" -> [0, 1, 2, 4]
            const pagesToKeep = new Set();
            const parts = range.split(',');

            parts.forEach(part => {
                if (part.includes('-')) {
                    const [start, end] = part.split('-').map(n => parseInt(n.trim()));
                    for (let i = start; i <= end; i++) pagesToKeep.add(i - 1);
                } else {
                    pagesToKeep.add(parseInt(part.trim()) - 1);
                }
            });

            const indices = Array.from(pagesToKeep).filter(i => i >= 0 && i < pdfDoc.getPageCount());
            const copiedPages = await newPdf.copyPages(pdfDoc, indices);
            copiedPages.forEach(page => newPdf.addPage(page));

            const pdfBytes = await newPdf.save();
            setSplitBlob(new Blob([pdfBytes], { type: 'application/pdf' }));
        } catch (err) {
            console.error(err);
            alert('Error splitting PDF. Check page ranges.');
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
                width: '90%', maxWidth: '400px', border: '1px solid var(--glass-border)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h2>Split PDF</h2>
                    <X onClick={onClose} style={{ cursor: 'pointer' }} />
                </div>

                {!file ? (
                    <div style={{
                        border: '2px dashed #444', borderRadius: '10px', padding: '30px',
                        textAlign: 'center', cursor: 'pointer'
                    }} onClick={() => document.getElementById('split-upload').click()}>
                        <Scissors size={40} />
                        <p>Upload PDF</p>
                        <input id="split-upload" type="file" accept="application/pdf" style={{ display: 'none' }} onChange={(e) => setFile(e.target.files[0])} />
                    </div>
                ) : (
                    <div>
                        <p>Selected: {file.name}</p>
                        <input
                            type="text"
                            placeholder="Page Range (e.g., 1-3, 5)"
                            value={range}
                            onChange={(e) => setRange(e.target.value)}
                            style={{
                                width: '100%', padding: '10px', margin: '10px 0',
                                borderRadius: '5px', border: '1px solid #333', background: '#222', color: 'white'
                            }}
                        />
                        <button
                            onClick={handleSplit}
                            disabled={processing || !range}
                            style={{
                                width: '100%', padding: '10px', borderRadius: '10px',
                                background: 'var(--accent-gold)', color: 'black', fontWeight: 'bold',
                                border: 'none', cursor: 'pointer', marginTop: '10px'
                            }}
                        >
                            {processing ? 'Processing...' : 'Split PDF'}
                        </button>

                        <ProcessFeedback
                            processing={processing}
                            resultReady={!!splitBlob}
                            onDownload={(name) => {
                                if (splitBlob) {
                                    const link = document.createElement('a');
                                    link.href = URL.createObjectURL(splitBlob);
                                    link.download = `${name}.pdf`;
                                    link.click();
                                }
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default PdfSplit;
