import React, { useState, useRef, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
// Set worker source to CDN to ensure it loads flawlessly across environments
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

import { jsPDF } from 'jspdf';
import { Download, X, PenTool, Trash2 } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';

import ProcessFeedback, { saveFile } from '../ui/ProcessFeedback';

const PdfEditor = ({ onClose }) => {
    const [file, setFile] = useState(null);
    const [pdfPage, setPdfPage] = useState(null);
    const canvasRef = useRef(null);
    const sigCanvasRef = useRef(null);
    const [processing, setProcessing] = useState(false);
    const [resultBlob, setResultBlob] = useState(null);
    const [penColor, setPenColor] = useState('black');
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    const handleUpload = async (e) => {
        const f = e.target.files[0];
        if (f) {
            setFile(f);
            const arrayBuffer = await f.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
            const page = await pdf.getPage(1); // Single page edit for now
            setPdfPage(page);
        }
    };

    useEffect(() => {
        if (pdfPage && canvasRef.current) {
            // Scale rendering by a fixed scale (like 1.0)
            const viewport = pdfPage.getViewport({ scale: 1.0 });
            setDimensions({ width: viewport.width, height: viewport.height });

            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderContext = {
                canvasContext: context,
                viewport: viewport,
            };
            pdfPage.render(renderContext);
        }
    }, [pdfPage]);

    const savePdf = () => {
        setProcessing(true);
        setTimeout(() => {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = dimensions.width;
            tempCanvas.height = dimensions.height;
            const ctx = tempCanvas.getContext('2d');

            // Draw underlying PDF render
            if (canvasRef.current) {
                ctx.drawImage(canvasRef.current, 0, 0);
            }

            // Draw signature layer on top
            if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
                ctx.drawImage(sigCanvasRef.current.getCanvas(), 0, 0);
            }

            const imgData = tempCanvas.toDataURL('image/jpeg', 0.95);
            const doc = new jsPDF({
                orientation: dimensions.width > dimensions.height ? 'l' : 'p',
                unit: 'px',
                format: [dimensions.width, dimensions.height]
            });
            doc.addImage(imgData, 'JPEG', 0, 0, dimensions.width, dimensions.height);

            setResultBlob(doc.output('blob'));
            setProcessing(false);
        }, 300); // give UI time to show "Saving..."
    };

    const clearCanvas = () => {
        if (sigCanvasRef.current) {
            sigCanvasRef.current.clear();
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(5px)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div style={{ position: 'absolute', top: 20, right: 20 }}>
                <X color="white" size={30} onClick={onClose} style={{ cursor: 'pointer' }} />
            </div>

            {!file ? (
                <div style={{ color: 'white', textAlign: 'center', cursor: 'pointer', padding: '50px', border: '2px dashed #444', borderRadius: '15px' }} onClick={() => document.getElementById('edit-up').click()}>
                    <PenTool size={60} style={{ margin: '0 auto', display: 'block' }} color="var(--accent-gold)" />
                    <h2 style={{ marginTop: '20px' }}>Upload PDF to Edit</h2>
                    <input id="edit-up" type="file" accept="application/pdf" style={{ display: 'none' }} onChange={handleUpload} />
                </div>
            ) : (
                <div style={{ display: 'flex', gap: '20px', width: '90%', maxWidth: '1200px', height: '80vh' }}>
                    <div style={{ width: '250px', background: '#222', padding: '20px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <h3 style={{ margin: 0, color: 'white', borderBottom: '1px solid #444', paddingBottom: '10px' }}>Editing Tools</h3>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                            <button onClick={() => setPenColor('black')} style={{ width: 40, height: 40, background: 'black', borderRadius: '50%', border: penColor === 'black' ? '2px solid var(--accent-gold)' : '2px solid transparent', cursor: 'pointer' }}></button>
                            <button onClick={() => setPenColor('#ef4444')} style={{ width: 40, height: 40, background: '#ef4444', borderRadius: '50%', border: penColor === '#ef4444' ? '2px solid var(--accent-gold)' : '2px solid transparent', cursor: 'pointer' }}></button>
                            <button onClick={() => setPenColor('#3b82f6')} style={{ width: 40, height: 40, background: '#3b82f6', borderRadius: '50%', border: penColor === '#3b82f6' ? '2px solid var(--accent-gold)' : '2px solid transparent', cursor: 'pointer' }}></button>
                        </div>

                        <button onClick={clearCanvas} style={{ background: '#444', color: 'white', border: 'none', padding: '10px', borderRadius: '5px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', cursor: 'pointer', marginTop: '10px' }}>
                            <Trash2 size={18} /> Clear Drawings
                        </button>

                        <button onClick={savePdf} disabled={processing} style={{ background: 'var(--accent-gold)', border: 'none', padding: '12px', borderRadius: '5px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', cursor: 'pointer', marginTop: 'auto' }}>
                            <Download size={18} /> {processing ? 'Processing...' : 'Export PDF'}
                        </button>

                        <ProcessFeedback
                            processing={processing}
                            resultReady={!!resultBlob}
                            defaultFilename="edited-document"
                            onDownload={(name) => {
                                if (resultBlob) {
                                    saveFile(resultBlob, name, 'pdf');
                                }
                            }}
                        />
                    </div>

                    <div style={{ flex: 1, border: '1px solid #444', background: '#111', overflow: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '10px' }}>
                        {dimensions.width > 0 && (
                            <div style={{ position: 'relative', width: dimensions.width, height: dimensions.height, background: 'white', margin: '20px', boxShadow: '0 0 20px rgba(0,0,0,0.5)' }}>
                                <canvas
                                    ref={canvasRef}
                                    style={{ position: 'absolute', top: 0, left: 0 }}
                                />
                                <div style={{ position: 'absolute', top: 0, left: 0, width: dimensions.width, height: dimensions.height, zIndex: 10 }}>
                                    <SignatureCanvas
                                        ref={sigCanvasRef}
                                        penColor={penColor}
                                        canvasProps={{
                                            width: dimensions.width,
                                            height: dimensions.height,
                                            className: 'sigCanvas',
                                            style: { cursor: 'crosshair' }
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PdfEditor;
