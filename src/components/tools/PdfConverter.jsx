import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import * as mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import { FileText, Image, Upload, X } from 'lucide-react';
import ProcessFeedback from '../ui/ProcessFeedback';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

const PdfConverter = ({ mode, onClose }) => {
    const [file, setFile] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [resultBlob, setResultBlob] = useState(null);

    const handleProcess = async () => {
        if (!file) return;
        setProcessing(true);
        setResultBlob(null);

        try {
            if (mode === 'word-to-pdf') {
                const arrayBuffer = await file.arrayBuffer();
                const result = await mammoth.extractRawText({ arrayBuffer });
                const text = result.value;
                const doc = new jsPDF();

                // Basic wrapping
                const lines = doc.splitTextToSize(text, 180);
                let y = 10;
                lines.forEach(line => {
                    if (y > 280) { doc.addPage(); y = 10; }
                    doc.text(line, 10, y);
                    y += 7;
                });
                setResultBlob(doc.output('blob'));

            } else if (mode === 'pdf-to-jpg') {
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
                const page = await pdf.getPage(1); // First page only for demo or loop for all

                const viewport = page.getViewport({ scale: 1.5 });
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({ canvasContext: context, viewport }).promise;
                canvas.toBlob(blob => setResultBlob(blob), 'image/jpeg');
            }
        } catch (err) {
            console.error(err);
            alert('Conversion Error');
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
                    <h2>{mode === 'word-to-pdf' ? 'Word to PDF' : 'PDF to JPG'}</h2>
                    <X onClick={onClose} style={{ cursor: 'pointer' }} />
                </div>

                <div style={{
                    border: '2px dashed #444', borderRadius: '10px', padding: '30px',
                    textAlign: 'center', cursor: 'pointer'
                }} onClick={() => document.getElementById('conv-upload').click()}>
                    {mode === 'word-to-pdf' ? <FileText size={40} /> : <Image size={40} />}
                    <p>Upload {mode === 'word-to-pdf' ? 'Word Doc' : 'PDF'}</p>
                    <input
                        id="conv-upload"
                        type="file"
                        accept={mode === 'word-to-pdf' ? ".docx" : "application/pdf"}
                        style={{ display: 'none' }}
                        onChange={(e) => setFile(e.target.files[0])}
                    />
                </div>

                {file && (
                    <button
                        onClick={handleProcess}
                        disabled={processing}
                        style={{
                            width: '100%', padding: '10px', borderRadius: '10px',
                            background: 'var(--accent-gold)', color: 'black', fontWeight: 'bold',
                            border: 'none', cursor: 'pointer', marginTop: '20px'
                        }}
                    >
                        {processing ? 'Processing...' : 'Convert'}
                    </button>
                )}

                <ProcessFeedback
                    processing={processing}
                    resultReady={!!resultBlob}
                    defaultFilename={mode === 'word-to-pdf' ? 'converted-doc' : 'converted-page'}
                    onDownload={(name) => {
                        if (resultBlob) {
                            const link = document.createElement('a');
                            link.href = URL.createObjectURL(resultBlob);
                            link.download = `${name}.${mode === 'word-to-pdf' ? 'pdf' : 'jpg'}`;
                            link.click();
                        }
                    }}
                />
            </div>
        </div>
    );
};

export default PdfConverter;
