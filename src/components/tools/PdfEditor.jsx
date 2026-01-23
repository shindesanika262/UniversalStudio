import React, { useState, useRef, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
// Set worker source
// pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
import { jsPDF } from 'jspdf';
import { Download, X } from 'lucide-react';

import ProcessFeedback, { saveFile } from '../ui/ProcessFeedback';

const PdfEditor = ({ onClose }) => {
    const [file, setFile] = useState(null);
    const [pdfPage, setPdfPage] = useState(null);
    const canvasRef = useRef(null);
    const [processing, setProcessing] = useState(false);
    const [resultBlob, setResultBlob] = useState(null);

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
            const viewport = pdfPage.getViewport({ scale: 1.0 });
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
        // Just saving the original/rendered view for now since signing is removed
        // If we want to support text later, we'd add it here.
        // For now, it seems this just re-saves the rendered canvas (rasterized).
        const canvas = canvasRef.current;
        const imgData = canvas.toDataURL('image/jpeg');
        const doc = new jsPDF({
            orientation: canvas.width > canvas.height ? 'l' : 'p',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });
        doc.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
        setResultBlob(doc.output('blob'));
        setProcessing(false);
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
                <div style={{ color: 'white', textAlign: 'center', cursor: 'pointer' }} onClick={() => document.getElementById('edit-up').click()}>
                    <PenTool size={60} />
                    <h2>Upload PDF</h2>
                    <input id="edit-up" type="file" accept="application/pdf" style={{ display: 'none' }} onChange={handleUpload} />
                </div>
            ) : (
                <div style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ background: '#222', padding: '10px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {/* Tools removed as requested */}
                        <button onClick={savePdf} style={{ background: '#4facfe', border: 'none', padding: '10px', borderRadius: '5px' }}><Download /></button>

                        <div style={{ position: 'absolute', bottom: 10, left: 10, right: 10, zIndex: 10 }}>
                            <ProcessFeedback
                                processing={processing}
                                resultReady={!!resultBlob}
                                defaultFilename="document"
                                onDownload={(name) => {
                                    if (resultBlob) {
                                        saveFile(resultBlob, name, 'pdf');
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <div style={{ border: '1px solid #fff', background: 'white' }}>
                        <canvas
                            ref={canvasRef}
                            style={{ cursor: 'default' }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default PdfEditor;
