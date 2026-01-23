import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Upload, FileText, X } from 'lucide-react';

import ProcessFeedback from '../ui/ProcessFeedback';

const MergePdf = ({ onClose }) => {
    const [files, setFiles] = useState([]);
    const [processing, setProcessing] = useState(false);
    const [mergedBlob, setMergedBlob] = useState(null);

    const handleFileUpload = (e) => {
        const uploadedFiles = Array.from(e.target.files);
        setFiles([...files, ...uploadedFiles]);
    };

    const removeFile = (index) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const mergePdfs = async () => {
        if (files.length < 2) return;
        setProcessing(true);
        setMergedBlob(null);

        try {
            const mergedPdf = await PDFDocument.create();

            for (const file of files) {
                const fileBuffer = await file.arrayBuffer();
                const pdf = await PDFDocument.load(fileBuffer);
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                copiedPages.forEach((page) => mergedPdf.addPage(page));
            }

            const pdfBytes = await mergedPdf.save();
            setMergedBlob(new Blob([pdfBytes], { type: 'application/pdf' }));
        } catch (err) {
            console.error(err);
            alert('Error merging PDFs');
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
                width: '90%', maxWidth: '600px', border: '1px solid var(--glass-border)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h2>Merge PDFs</h2>
                    <X onClick={onClose} style={{ cursor: 'pointer' }} />
                </div>

                <div style={{
                    border: '2px dashed #444', borderRadius: '10px', padding: '40px',
                    textAlign: 'center', marginBottom: '20px', cursor: 'pointer'
                }} onClick={() => document.getElementById('pdf-upload').click()}>
                    <Upload size={40} color="#888" />
                    <p>Click to upload PDFs</p>
                    <input
                        id="pdf-upload" type="file" multiple accept="application/pdf"
                        style={{ display: 'none' }} onChange={handleFileUpload}
                    />
                </div>

                <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '20px' }}>
                    {files.map((file, idx) => (
                        <div key={idx} style={{
                            background: '#333', padding: '10px', borderRadius: '8px',
                            marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <FileText size={18} />
                                <span style={{ fontSize: '0.9rem' }}>{file.name}</span>
                            </div>
                            <X size={18} style={{ cursor: 'pointer', color: '#ff6666' }} onClick={() => removeFile(idx)} />
                        </div>
                    ))}
                </div>

                <button
                    onClick={mergePdfs}
                    disabled={files.length < 2 || processing}
                    style={{
                        width: '100%', padding: '15px', borderRadius: '10px',
                        background: 'var(--accent-gold)', color: 'black', fontWeight: 'bold',
                        border: 'none', cursor: files.length < 2 ? 'not-allowed' : 'pointer',
                        opacity: files.length < 2 ? 0.5 : 1
                    }}
                >
                    {processing ? 'Merging...' : 'Merge PDFs'}
                </button>

                <ProcessFeedback
                    processing={processing}
                    resultReady={!!mergedBlob}
                    onDownload={(name) => {
                        if (mergedBlob) {
                            const link = document.createElement('a');
                            link.href = URL.createObjectURL(mergedBlob);
                            link.download = `${name}.pdf`;
                            link.click();
                        }
                    }}
                />
            </div>
        </div>
    );
};

export default MergePdf;
