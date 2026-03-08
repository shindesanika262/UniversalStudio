import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { Upload, FileDown, X } from 'lucide-react';
import ProcessFeedback from '../ui/ProcessFeedback';

const ImageToPdf = ({ onClose }) => {
    const [images, setImages] = useState([]);
    const [processing, setProcessing] = useState(false);
    const [pdfBlob, setPdfBlob] = useState(null);

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const newImages = files.map(file => ({
            file,
            url: URL.createObjectURL(file)
        }));
        setImages([...images, ...newImages]);
    };

    const removeImage = (index) => {
        const newImages = images.filter((_, i) => i !== index);
        setImages(newImages);
    };

    const convertToPdf = async () => {
        if (images.length === 0) return;
        setProcessing(true);
        setPdfBlob(null);

        try {
            const doc = new jsPDF();

            for (let i = 0; i < images.length; i++) {
                if (i > 0) doc.addPage();
                const img = images[i];
                const imgProps = doc.getImageProperties(img.url);
                const pdfWidth = doc.internal.pageSize.getWidth();
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                doc.addImage(img.url, 'JPEG', 0, 0, pdfWidth, pdfHeight);
            }

            setPdfBlob(doc.output('blob'));
        } catch (err) {
            console.error(err);
            alert('Error converting images');
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
                    <h2>Image to PDF</h2>
                    <X onClick={onClose} style={{ cursor: 'pointer' }} />
                </div>

                <div style={{
                    border: '2px dashed #444', borderRadius: '10px', padding: '40px',
                    textAlign: 'center', marginBottom: '20px', cursor: 'pointer'
                }} onClick={() => document.getElementById('img-upload').click()}>
                    <Upload size={40} color="#888" />
                    <p>Click to upload Images (JPG, PNG)</p>
                    <input
                        id="img-upload" type="file" multiple accept="image/*"
                        style={{ display: 'none' }} onChange={handleImageUpload}
                    />
                </div>

                <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', marginBottom: '20px', paddingBottom: '10px' }}>
                    {images.map((img, idx) => (
                        <div key={idx} style={{ position: 'relative', minWidth: '100px' }}>
                            <img src={img.url} alt="preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
                            <button
                                onClick={() => removeImage(idx)}
                                style={{
                                    position: 'absolute', top: -5, right: -5, background: 'red',
                                    color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer'
                                }}
                            >×</button>
                        </div>
                    ))}
                </div>

                <button
                    onClick={convertToPdf}
                    disabled={images.length === 0 || processing}
                    style={{
                        width: '100%', padding: '15px', borderRadius: '10px',
                        background: 'var(--accent-gold)', color: 'black', fontWeight: 'bold',
                        border: 'none', cursor: images.length === 0 ? 'not-allowed' : 'pointer',
                        opacity: images.length === 0 ? 0.5 : 1
                    }}
                >
                    {processing ? 'Processing...' : 'Convert to PDF'}
                </button>

                <ProcessFeedback
                    processing={processing}
                    resultReady={!!pdfBlob}
                    onDownload={(name) => {
                        if (pdfBlob) {
                            const link = document.createElement('a');
                            link.href = URL.createObjectURL(pdfBlob);
                            link.download = `${name}.pdf`;
                            link.click();
                        }
                    }}
                />
            </div>
        </div>
    );
};

export default ImageToPdf;
