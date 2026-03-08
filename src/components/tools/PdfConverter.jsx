import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import * as mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import * as XLSX from 'xlsx';
import autoTable from 'jspdf-autotable';
import { FileText, Image, Upload, X, Table } from 'lucide-react';
import ProcessFeedback, { saveFile } from '../ui/ProcessFeedback';

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
                const page = await pdf.getPage(1);

                const viewport = page.getViewport({ scale: 1.5 });
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({ canvasContext: context, viewport }).promise;
                canvas.toBlob(blob => setResultBlob(blob), 'image/jpeg');
            } else if (mode === 'excel-to-pdf') {
                const arrayBuffer = await file.arrayBuffer();
                const workbook = XLSX.read(arrayBuffer, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                if (data.length === 0) {
                    alert('Excel file is empty');
                    return;
                }

                const doc = new jsPDF();
                const headers = data[0];
                const body = data.slice(1);

                autoTable(doc, {
                    head: [headers],
                    body: body,
                    theme: 'grid',
                    styles: {
                        lineColor: [0, 0, 0],
                        lineWidth: 0.5,
                        textColor: [0, 0, 0]
                    },
                    headStyles: {
                        fillColor: [240, 240, 240],
                        textColor: [0, 0, 0],
                        fontStyle: 'bold'
                    }
                });

                setResultBlob(doc.output('blob'));
            }
        } catch (err) {
            console.error(err);
            alert(`Conversion Error: ${err.message || 'Unknown Error'}`);
        } finally {
            setProcessing(false);
        }
    };

    const getModeTitle = () => {
        switch (mode) {
            case 'word-to-pdf': return 'Word to PDF';
            case 'pdf-to-jpg': return 'PDF to JPG';
            case 'excel-to-pdf': return 'Excel to PDF';
            default: return 'Converter';
        }
    };

    const getAcceptedFiles = () => {
        switch (mode) {
            case 'word-to-pdf': return ".docx";
            case 'pdf-to-jpg': return "application/pdf";
            case 'excel-to-pdf': return ".xlsx, .xls";
            default: return "*";
        }
    };

    const getIcon = () => {
        if (mode === 'excel-to-pdf') return <Table size={40} />;
        if (mode === 'pdf-to-jpg') return <Image size={40} />;
        return <FileText size={40} />;
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
                    <h2>{getModeTitle()}</h2>
                    <X onClick={onClose} style={{ cursor: 'pointer' }} />
                </div>

                <div style={{
                    border: '2px dashed #444', borderRadius: '10px', padding: '30px',
                    textAlign: 'center', cursor: 'pointer'
                }} onClick={() => document.getElementById('conv-upload').click()}>
                    {getIcon()}
                    <p>Upload {mode.split('-')[0].toUpperCase()} File</p>
                    <input
                        id="conv-upload"
                        type="file"
                        accept={getAcceptedFiles()}
                        style={{ display: 'none' }}
                        onChange={(e) => setFile(e.target.files[0])}
                    />
                </div>

                {file && (
                    <div style={{ marginTop: '10px', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.8rem', color: '#888' }}>{file.name}</p>
                        <button
                            onClick={handleProcess}
                            disabled={processing}
                            style={{
                                width: '100%', padding: '10px', borderRadius: '10px',
                                background: 'var(--accent-gold)', color: 'black', fontWeight: 'bold',
                                border: 'none', cursor: 'pointer', marginTop: '10px'
                            }}
                        >
                            {processing ? 'Processing...' : 'Convert'}
                        </button>
                    </div>
                )}

                <ProcessFeedback
                    processing={processing}
                    resultReady={!!resultBlob}
                    defaultFilename={mode}
                    onDownload={(name) => {
                        if (resultBlob) {
                            const extension = mode.endsWith('pdf') ? 'pdf' : (mode.endsWith('jpg') ? 'jpg' : 'xlsx');
                            saveFile(resultBlob, name, extension);
                        }
                    }}
                />
            </div>
        </div>
    );
};

export default PdfConverter;

