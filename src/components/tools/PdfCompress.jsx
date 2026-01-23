import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Minimize2, Upload, X } from 'lucide-react';

import ProcessFeedback from '../ui/ProcessFeedback';

const PdfCompress = ({ onClose }) => {
    const [file, setFile] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [compressedBlob, setCompressedBlob] = useState(null);

    const handleCompress = async () => {
        if (!file) return;
        setProcessing(true);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);

            // Real client-side compression is hard. We can try to remove metadata or unused objects.
            // pdf-lib doesn't have a "compress" flag, but saving sometimes reduces size if it was bloated.
            // For "real" visually lossy compression, we'd need to re-render pages as images at lower quality.
            // Here we implement a "Smart Save" which often trims fat.

            const compressedPdf = await PDFDocument.create();
            const copiedPages = await compressedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
            copiedPages.forEach((page) => compressedPdf.addPage(page));

            const pdfBytes = await compressedPdf.save(); // Default save often optimizes cross-reference tables

            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `compressed-${file.name}`;
            link.click();
        } catch (err) {
            console.error(err);
            alert('Compression Failed');
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
                    <h2>Compress PDF</h2>
                    <X onClick={onClose} style={{ cursor: 'pointer' }} />
                </div>

                {!file ? (
                    <div style={{
                        border: '2px dashed #444', borderRadius: '10px', padding: '30px',
                        textAlign: 'center', cursor: 'pointer'
                    }} onClick={() => document.getElementById('comp-upload').click()}>
                        <Minimize2 size={40} />
                        <p>Upload PDF</p>
                        <input id="comp-upload" type="file" accept="application/pdf" style={{ display: 'none' }} onChange={(e) => setFile(e.target.files[0])} />
                    </div>
                ) : (
                    <div>
                        <p>Selected: {file.name}</p>
                        <small style={{ color: '#888' }}>Note: Browser-based compression is limited. This will optimize file structure.</small>
                        <button
                            onClick={handleCompress}
                            disabled={processing}
                            style={{
                                width: '100%', padding: '10px', borderRadius: '10px',
                                background: 'var(--accent-gold)', color: 'black', fontWeight: 'bold',
                                border: 'none', cursor: 'pointer', marginTop: '10px'
                            }}
                        >
                            {processing ? 'Compressing...' : 'Compress PDF'}
                        </button>

                        <ProcessFeedback
                            processing={processing}
                            resultReady={!!compressedBlob}
                            onDownload={(name) => {
                                if (compressedBlob) {
                                    const link = document.createElement('a');
                                    link.href = URL.createObjectURL(compressedBlob);
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

export default PdfCompress;
