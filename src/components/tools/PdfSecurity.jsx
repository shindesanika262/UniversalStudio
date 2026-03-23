import React, { useState } from 'react';
import { encryptPDF } from '@pdfsmaller/pdf-encrypt-lite';
import { decryptPDF } from '@pdfsmaller/pdf-decrypt-lite';
import { Lock, Unlock, Upload, X } from 'lucide-react';
import ProcessFeedback from '../ui/ProcessFeedback';

const PdfSecurity = ({ mode = 'protect', onClose }) => {
    const [file, setFile] = useState(null);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [processing, setProcessing] = useState(false);
    const [resultBlob, setResultBlob] = useState(null);
    const [error, setError] = useState('');

    const handleProcess = async () => {
        if (!file || !password) return;
        
        if (mode === 'protect' && password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setProcessing(true);
        setError('');

        try {
            const fileBuffer = await file.arrayBuffer();
            const pdfBytes = new Uint8Array(fileBuffer);
            
            let resultBytes;
            if (mode === 'protect') {
                // Apply password encryption
                resultBytes = await encryptPDF(pdfBytes, password);
            } else {
                // Remove password encryption (Unlock)
                try {
                    resultBytes = await decryptPDF(pdfBytes, password);
                } catch (decryptErr) {
                    console.error('Decryption error:', decryptErr);
                    throw new Error('Incorrect password or invalid protected PDF.');
                }
            }

            setResultBlob(new Blob([resultBytes], { type: 'application/pdf' }));
        } catch (err) {
            console.error(err);
            setError(err.message || 'Error processing PDF');
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
                    <h2>{mode === 'protect' ? 'Protect PDF' : 'Unlock PDF'}</h2>
                    <X onClick={onClose} style={{ cursor: 'pointer' }} />
                </div>

                {!file ? (
                    <div style={{
                        border: '2px dashed #444', borderRadius: '10px', padding: '30px',
                        textAlign: 'center', cursor: 'pointer'
                    }} onClick={() => document.getElementById('sec-upload').click()}>
                        {mode === 'protect' ? <Lock size={40} /> : <Unlock size={40} />}
                        <p>Upload PDF to {mode === 'protect' ? 'Protect' : 'Unlock'}</p>
                        <input id="sec-upload" type="file" accept="application/pdf" style={{ display: 'none' }} onChange={(e) => setFile(e.target.files[0])} />
                    </div>
                ) : (
                    <div>
                        <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '1rem' }}>Selected: {file.name}</p>
                        
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ fontSize: '0.75rem', color: '#ccc' }}>
                                {mode === 'protect' ? 'Set Encryption Password' : 'Enter Current Password'}
                            </label>
                            <input
                                type="password"
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{
                                    width: '100%', padding: '10px', marginTop: '5px',
                                    borderRadius: '5px', border: '1px solid #333', background: '#222', color: 'white'
                                }}
                            />
                        </div>

                        {mode === 'protect' && (
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ fontSize: '0.75rem', color: '#ccc' }}>Confirm Password</label>
                                <input
                                    type="password"
                                    placeholder="Confirm password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    style={{
                                        width: '100%', padding: '10px', marginTop: '5px',
                                        borderRadius: '5px', border: '1px solid #333', background: '#222', color: 'white'
                                    }}
                                />
                            </div>
                        )}

                        {error && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: '1rem' }}>{error}</p>}

                        <button
                            onClick={handleProcess}
                            disabled={processing || !password}
                            style={{
                                width: '100%', padding: '12px', borderRadius: '10px',
                                background: 'var(--accent-gold)', color: 'black', fontWeight: 'bold',
                                border: 'none', cursor: 'pointer'
                            }}
                        >
                            {processing ? 'Processing...' : (mode === 'protect' ? 'Encrypt & Protect' : 'Unlock & Remove Password')}
                        </button>

                        <ProcessFeedback
                            processing={processing}
                            resultReady={!!resultBlob}
                            defaultFilename={mode === 'protect' ? 'protected' : 'unlocked'}
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
