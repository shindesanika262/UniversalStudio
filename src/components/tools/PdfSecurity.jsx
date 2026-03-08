import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Lock, Upload, X } from 'lucide-react';
import ProcessFeedback from '../ui/ProcessFeedback';

const PdfSecurity = ({ onClose }) => {
    const [file, setFile] = useState(null);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [processing, setProcessing] = useState(false);
    const [resultBlob, setResultBlob] = useState(null);

    const handleProcess = async () => {
        if (!file || !password) return;
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        setProcessing(true);

        try {
            const fileBuffer = await file.arrayBuffer();

            const pdfDoc = await PDFDocument.load(fileBuffer);
            const resultBytes = await pdfDoc.save({
                userPassword: password,
                ownerPassword: password // Owner gets full access
            });

            setResultBlob(new Blob([resultBytes], { type: 'application/pdf' }));
        } catch (err) {
            console.error(err);
            alert('Error processing PDF');
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
                    <h2>Protect PDF</h2>
                    <X onClick={onClose} style={{ cursor: 'pointer' }} />
                </div>

                {!file ? (
                    <div style={{
                        border: '2px dashed #444', borderRadius: '10px', padding: '30px',
                        textAlign: 'center', cursor: 'pointer'
                    }} onClick={() => document.getElementById('sec-upload').click()}>
                        <Lock size={40} />
                        <p>Upload PDF</p>
                        <input id="sec-upload" type="file" accept="application/pdf" style={{ display: 'none' }} onChange={(e) => setFile(e.target.files[0])} />
                    </div>
                ) : (
                    <div>
                        <p>Selected: {file.name}</p>
                        <input
                            type="password"
                            placeholder="Enter Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                width: '100%', padding: '10px', margin: '5px 0',
                                borderRadius: '5px', border: '1px solid #333', background: '#222', color: 'white'
                            }}
                        />
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            style={{
                                width: '100%', padding: '10px', margin: '5px 0',
                                borderRadius: '5px', border: '1px solid #333', background: '#222', color: 'white'
                            }}
                        />
                        <button
                            onClick={handleProcess}
                            disabled={processing || !password}
                            style={{
                                width: '100%', padding: '10px', borderRadius: '10px',
                                background: 'var(--accent-gold)', color: 'black', fontWeight: 'bold',
                                border: 'none', cursor: 'pointer', marginTop: '10px'
                            }}
                        >
                            {processing ? 'Processing...' : 'Encrypt'}
                        </button>

                        <ProcessFeedback
                            processing={processing}
                            resultReady={!!resultBlob}
                            defaultFilename="protected"
                            onDownload={(name) => {
                                if (resultBlob) {
                                    const link = document.createElement('a');
                                    link.href = URL.createObjectURL(resultBlob);
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

export default PdfSecurity;
