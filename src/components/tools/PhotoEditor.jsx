import React, { useState, useRef, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Upload, X, RotateCw, Download, Crop as CropIcon, Sliders, Image as ImageIcon, Layers } from 'lucide-react';
import ProcessFeedback, { saveFile } from '../ui/ProcessFeedback';

const PhotoEditor = ({ onClose }) => {
    const [imageSrc, setImageSrc] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    // Tools State
    const [activeTab, setActiveTab] = useState('filters'); // filters, crop, export
    const [filter, setFilter] = useState('none');

    // Export Settings
    const [quality, setQuality] = useState(0.9);
    const [format, setFormat] = useState('image/jpeg');
    const [resolution, setResolution] = useState(1); // 1 = 100%

    // Processing
    const [processing, setProcessing] = useState(false);
    const [resultBlob, setResultBlob] = useState(null);

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageSrc(URL.createObjectURL(file));
        }
    };

    const getCroppedImg = async () => {
        try {
            const image = await createImage(imageSrc);
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) return null;

            // Rotation logic
            const maxSize = Math.max(image.width, image.height);
            const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));
            canvas.width = safeArea;
            canvas.height = safeArea;

            ctx.translate(safeArea / 2, safeArea / 2);
            ctx.rotate((rotation * Math.PI) / 180);
            ctx.translate(-safeArea / 2, -safeArea / 2);

            ctx.drawImage(
                image,
                safeArea / 2 - image.width * 0.5,
                safeArea / 2 - image.height * 0.5
            );

            const data = ctx.getImageData(0, 0, safeArea, safeArea);
            canvas.width = croppedAreaPixels.width;
            canvas.height = croppedAreaPixels.height;

            ctx.putImageData(
                data,
                0 - safeArea / 2 + image.width * 0.5 - croppedAreaPixels.x,
                0 - safeArea / 2 + image.height * 0.5 - croppedAreaPixels.y
            );

            // Apply Filters (Simple Canvas Filters)
            if (filter !== 'none') {
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const d = imageData.data;
                for (let i = 0; i < d.length; i += 4) {
                    if (filter === 'grayscale') {
                        const avg = (d[i] + d[i + 1] + d[i + 2]) / 3;
                        d[i] = d[i + 1] = d[i + 2] = avg;
                    } else if (filter === 'sepia') {
                        const r = d[i], g = d[i + 1], b = d[i + 2];
                        d[i] = r * 0.393 + g * 0.769 + b * 0.189;
                        d[i + 1] = r * 0.349 + g * 0.686 + b * 0.168;
                        d[i + 2] = r * 0.272 + g * 0.534 + b * 0.131;
                    } else if (filter === 'invert') {
                        d[i] = 255 - d[i];
                        d[i + 1] = 255 - d[i + 1];
                        d[i + 2] = 255 - d[i + 2];
                    }
                }
                ctx.putImageData(imageData, 0, 0);
            }

            // Resize if needed
            if (resolution !== 1) {
                const scaledCanvas = document.createElement('canvas');
                scaledCanvas.width = canvas.width * resolution;
                scaledCanvas.height = canvas.height * resolution;
                const scaledCtx = scaledCanvas.getContext('2d');
                scaledCtx.drawImage(canvas, 0, 0, scaledCanvas.width, scaledCanvas.height);
                return new Promise(resolve => {
                    scaledCanvas.toBlob(blob => resolve(blob), format, quality);
                });
            }

            return new Promise(resolve => {
                canvas.toBlob(blob => resolve(blob), format, quality);
            });
        } catch (e) {
            console.error(e);
            return null;
        }
    };

    const processImage = async () => {
        setProcessing(true);
        const blob = await getCroppedImg();
        setResultBlob(blob);
        setProcessing(false);
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.95)', zIndex: 1000, display: 'flex'
        }}>
            {/* Header */}
            <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 10 }}>
                <X color="white" size={30} onClick={onClose} style={{ cursor: 'pointer' }} />
            </div>

            {!imageSrc ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{
                        border: '2px dashed #666', borderRadius: '20px', padding: '60px',
                        textAlign: 'center', cursor: 'pointer', color: 'white'
                    }} onClick={() => document.getElementById('new-photo-up').click()}>
                        <Upload size={60} color="var(--accent-gold)" />
                        <h2>Upload Photo to Edit</h2>
                        <input id="new-photo-up" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} />
                    </div>
                </div>
            ) : (
                <>
                    {/* Main Canvas / Cropper Area */}
                    <div style={{ flex: 1, position: 'relative', background: '#111' }}>
                        <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            rotation={rotation}
                            aspect={undefined} // Free crop
                            onCropChange={setCrop}
                            onCropComplete={onCropComplete}
                            onZoomChange={setZoom}
                            showGrid={activeTab === 'crop'}
                        />
                    </div>

                    {/* Sidebar Controls */}
                    <div style={{ width: '320px', background: '#1a1a1a', borderLeft: '1px solid #333', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', background: '#222', padding: '5px', borderRadius: '10px' }}>
                            <TabIcon icon={CropIcon} active={activeTab === 'crop'} onClick={() => setActiveTab('crop')} />
                            <TabIcon icon={Layers} active={activeTab === 'filters'} onClick={() => setActiveTab('filters')} />
                            <TabIcon icon={Sliders} active={activeTab === 'export'} onClick={() => setActiveTab('export')} />
                        </div>

                        {activeTab === 'crop' && (
                            <div style={sectionStyle}>
                                <h3>Transform</h3>
                                <label>Rotation: {rotation}°</label>
                                <input type="range" min={0} max={360} value={rotation} onChange={(e) => setRotation(e.target.value)} style={{ width: '100%' }} />
                                <label>Zoom: {zoom}x</label>
                                <input type="range" min={1} max={3} step={0.1} value={zoom} onChange={(e) => setZoom(e.target.value)} style={{ width: '100%' }} />
                            </div>
                        )}

                        {activeTab === 'filters' && (
                            <div style={sectionStyle}>
                                <h3>Filters</h3>
                                {['none', 'grayscale', 'sepia', 'invert'].map(f => (
                                    <button
                                        key={f} onClick={() => setFilter(f)}
                                        style={{ ...btnStyle, background: filter === f ? 'var(--accent-gold)' : '#333' }}
                                    >
                                        {f.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        )}

                        {activeTab === 'export' && (
                            <div style={sectionStyle}>
                                <h3>Export Settings</h3>
                                <label>Resolution: {Math.round(resolution * 100)}%</label>
                                <input type="range" min={0.1} max={2} step={0.1} value={resolution} onChange={(e) => setResolution(Number(e.target.value))} style={{ width: '100%' }} />

                                <label>Quality: {Math.round(quality * 100)}%</label>
                                <input type="range" min={0.1} max={1} step={0.1} value={quality} onChange={(e) => setQuality(Number(e.target.value))} style={{ width: '100%' }} />

                                <label>Format</label>
                                <select value={format} onChange={(e) => setFormat(e.target.value)} style={{ width: '100%', padding: '10px', background: '#333', color: 'white', border: 'none', borderRadius: '5px' }}>
                                    <option value="image/jpeg">JPG</option>
                                    <option value="image/png">PNG</option>
                                    <option value="image/webp">WEBP</option>
                                </select>
                            </div>
                        )}

                        <div style={{ marginTop: 'auto' }}>
                            <button onClick={processImage} style={{ ...btnStyle, background: '#4facfe', color: 'white', width: '100%', justifyContent: 'center' }}>
                                {processing ? 'Processing...' : 'Prepare Download'}
                            </button>
                            <ProcessFeedback
                                processing={processing}
                                resultReady={!!resultBlob}
                                defaultFilename="edited-image"
                                onDownload={(name) => {
                                    if (resultBlob) {
                                        const ext = format.split('/')[1];
                                        saveFile(resultBlob, name, ext);
                                    }
                                }}
                            />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

const createImage = (url) =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.setAttribute('crossOrigin', 'anonymous');
        image.src = url;
    });

const TabIcon = ({ icon: Icon, active, onClick }) => (
    <div onClick={onClick} style={{
        padding: '10px', borderRadius: '8px', cursor: 'pointer',
        background: active ? 'var(--accent-gold)' : 'transparent',
        color: active ? 'black' : '#888'
    }}>
        <Icon size={20} />
    </div>
);

const sectionStyle = { display: 'flex', flexDirection: 'column', gap: '15px', color: 'white' };
const btnStyle = { padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' };

export default PhotoEditor;
