import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import Draggable from 'react-draggable';
import { 
    Upload, X, RotateCw, Download, Crop as CropIcon, 
    Sliders, Image as ImageIcon, Layers, Wand2, Sun, 
    Contrast, Droplets, Type, Square, Circle, Trash2, 
    Plus, MousePointer2, Maximize, Smartphone, Grab 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProcessFeedback, { saveFile } from '../ui/ProcessFeedback';

const PhotoEditor = ({ onClose }) => {
    const [imageSrc, setImageSrc] = useState(null);
    const [completedCrop, setCompletedCrop] = useState(null);
    const [crop, setCrop] = useState({ unit: '%', width: 50, height: 50, x: 25, y: 25 });
    
    // Tools & Layers
    const [activeTab, setActiveTab] = useState('crop');
    const [layers, setLayers] = useState([]);
    const [selectedLayerId, setSelectedLayerId] = useState(null);

    // Image Props
    const [rotation, setRotation] = useState(0);
    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(100);
    const [saturation, setSaturation] = useState(100);
    const [blur, setBlur] = useState(0);
    const [filter, setFilter] = useState('none');

    const imgRef = useRef(null);

    const FILTER_MODES = {
        none: '',
        clarendon: 'contrast(1.2) brightness(1.1)',
        gingham: 'brightness(1.05) hue-rotate(-10deg)',
        lark: 'brightness(1.1) contrast(1.1) saturate(1.3)',
        juno: 'sepia(0.2) contrast(1.1) brightness(1.1) saturate(1.4)',
        nashville: 'sepia(0.2) contrast(1.2) brightness(1.05) saturate(1.2)',
        inkwell: 'grayscale(1) brightness(1.1) contrast(1.1)',
        '1977': 'sepia(0.3) saturate(1.1) hue-rotate(-30deg)',
        kelvin: 'sepia(0.4) saturate(2.4) brightness(1.2) contrast(1.1)'
    };

    const handleUpload = (e) => {
        const file = e.target.files[0];
        if (file) setImageSrc(URL.createObjectURL(file));
    };

    const addTextLayer = () => {
        const newLayer = { id: Date.now(), type: 'text', text: 'TEXT OVERLAY', x: 20, y: 20, fontSize: 32, color: '#ffffff', fontFamily: 'Arial' };
        setLayers([...layers, newLayer]);
        setSelectedLayerId(newLayer.id);
        setActiveTab('text');
    };

    const getCroppedImg = async () => {
        if (!completedCrop || !imgRef.current) return null;
        
        const image = imgRef.current;
        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        
        canvas.width = completedCrop.width * scaleX;
        canvas.height = completedCrop.height * scaleY;
        const ctx = canvas.getContext('2d');

        // Apply Global Filters during export
        const adjustmentFilter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px)`;
        const instagramFilter = FILTER_MODES[filter] || '';
        ctx.filter = `${adjustmentFilter} ${instagramFilter}`.trim();

        ctx.drawImage(
            image,
            completedCrop.x * scaleX,
            completedCrop.y * scaleY,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
            0,
            0,
            canvas.width,
            canvas.height
        );

        // Draw Layers
        ctx.filter = 'none';
        layers.forEach(l => {
            if (l.type === 'text') {
                ctx.font = `bold ${l.fontSize}px ${l.fontFamily || 'sans-serif'}`;
                ctx.fillStyle = l.color;
                // Coordinate adjustments for output
                ctx.fillText(l.text, l.x * scaleX, (l.y + l.fontSize) * scaleY);
            }
        });

        return new Promise(resolve => canvas.toBlob(b => resolve(b), 'image/jpeg', 0.95));
    };

    const [processing, setProcessing] = useState(false);
    const [resultBlob, setResultBlob] = useState(null);

    return (
        <div style={{ position: 'fixed', inset: 0, background: '#0a0a0a', zIndex: 1000, display: 'flex', color: 'white' }}>
            {/* Header */}
            <div style={{ position: 'absolute', top: 0, insetX: 0, height: '60px', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', zIndex: 100, borderBottom: '1px solid #333', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <ImageIcon size={22} color="#4facfe" />
                    <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>STUDIO EDITOR</span>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => setRotation(r => (r + 90) % 360)} className="top-btn"><RotateCw size={16}/> Rotate</button>
                    <button onClick={addTextLayer} className="top-btn" style={{ color: '#4facfe' }}><Plus size={16}/> Add Text</button>
                    <button onClick={async () => { setProcessing(true); const b = await getCroppedImg(); setResultBlob(b); setProcessing(false); }} style={{ background: '#4facfe', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '6px', fontWeight: 'bold' }}>Export Pro</button>
                    <X color="#666" size={24} onClick={onClose} style={{ cursor: 'pointer' }} />
                </div>
            </div>

            {/* Sidebar */}
            <div style={{ width: '80px', marginTop: '60px', background: '#111', borderRight: '1px solid #333', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '20px', gap: '30px' }}>
                <SideTool icon={CropIcon} label="Crop" active={activeTab === 'crop'} onClick={() => setActiveTab('crop')} />
                <SideTool icon={Sliders} label="Adjust" active={activeTab === 'adjust'} onClick={() => setActiveTab('adjust')} />
                <SideTool icon={Type} label="Text" active={activeTab === 'text'} onClick={() => setActiveTab('text')} />
                <SideTool icon={ImageIcon} label="Filters" active={activeTab === 'filters'} onClick={() => setActiveTab('filters')} />
            </div>

            <div style={{ flex: 1, display: 'flex', marginTop: '60px' }}>
                {/* Control Panel */}
                <div style={{ width: '310px', background: '#161616', borderRight: '1px solid #333', padding: '25px', overflowY: 'auto' }}>
                    {activeTab === 'crop' && (
                        <div style={sectionStyle}>
                            <h3 style={titleStyle}>Free Crop Controls</h3>
                            <p style={{ fontSize: '0.8rem', color: '#666' }}>Drag the corners or edges on the image to define your crop area manually.</p>
                            <button onClick={() => setCrop({ unit: '%', width: 90, height: 90, x: 5, y: 5 })} style={{ ...btnStyle, background: '#333' }}>Reset Crop Box</button>
                        </div>
                    )}
                    {activeTab === 'adjust' && (
                        <div style={sectionStyle}>
                            <h3 style={titleStyle}>Manual Settings</h3>
                            <AdjustSlider label="Brightness" value={brightness} min={0} max={200} onChange={setBrightness} />
                            <AdjustSlider label="Contrast" value={contrast} min={0} max={200} onChange={setContrast} />
                            <AdjustSlider label="Saturation" value={saturation} min={0} max={200} onChange={setSaturation} />
                            <AdjustSlider label="Blur Level" value={blur} min={0} max={15} onChange={setBlur} />
                        </div>
                    )}
                    {activeTab === 'text' && (
                        <div style={sectionStyle}>
                            <h3 style={titleStyle}>Text Config</h3>
                            {selectedLayerId ? (
                                <>
                                    <input type="text" value={layers.find(l => l.id === selectedLayerId)?.text} onChange={(e) => setLayers(layers.map(l => l.id === selectedLayerId ? { ...l, text: e.target.value } : l))} style={inputStyle} />
                                    <select value={layers.find(l => l.id === selectedLayerId)?.fontFamily} onChange={(e) => setLayers(layers.map(l => l.id === selectedLayerId ? { ...l, fontFamily: e.target.value } : l))} style={inputStyle}>
                                        <option value="Arial">Arial</option>
                                        <option value="Times New Roman">Times New Roman</option>
                                        <option value="Courier New">Courier</option>
                                    </select>
                                    <AdjustSlider label="Size" value={layers.find(l => l.id === selectedLayerId)?.fontSize} min={10} max={200} onChange={(v) => setLayers(layers.map(l => l.id === selectedLayerId ? { ...l, fontSize: v } : l))} />
                                    <input type="color" value={layers.find(l => l.id === selectedLayerId)?.color} onChange={(e) => setLayers(layers.map(l => l.id === selectedLayerId ? { ...l, color: e.target.value } : l))} style={{ width: '100%', height: '35px' }} />
                                    <button onClick={() => { setLayers(layers.filter(l => l.id !== selectedLayerId)); setSelectedLayerId(null); }} style={{ ...btnStyle, background: '#ef4444', marginTop: '15px' }}>Remove</button>
                                </>
                            ) : (
                                <p style={{ color: '#555', fontSize: '0.8rem' }}>Click a text layer to edit qualities.</p>
                            )}
                        </div>
                    )}
                    {activeTab === 'filters' && (
                        <div style={sectionStyle}>
                             <h3 style={titleStyle}>Insta Presets</h3>
                             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                {Object.keys(FILTER_MODES).map(f => (
                                    <button key={f} onClick={() => setFilter(f)} style={{ padding: '10px 5px', borderRadius: '6px', border: filter === f ? 'none' : '1px solid #333', background: filter === f ? '#4facfe' : '#222', color: 'white', fontSize: '0.7rem', textTransform: 'capitalize' }}>{f}</button>
                                ))}
                             </div>
                        </div>
                    )}
                </div>

                {/* Main View Port */}
                <div style={{ flex: 1, position: 'relative', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '40px' }}>
                    {!imageSrc ? (
                        <div style={{ border: '2px dashed #222', borderRadius: '20px', padding: '80px', cursor: 'pointer' }} onClick={() => document.getElementById('studio-up').click()}>
                            <Upload size={60} color="#4facfe" style={{ margin: '0 auto 15px', opacity: 0.5 }} />
                            <h3>Open Studio</h3>
                            <input id="studio-up" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} />
                        </div>
                    ) : (
                        <div style={{ position: 'relative', maxWidth: '100%', maxHeight: '100%' }}>
                            <div style={{ filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px) ${FILTER_MODES[filter] || ''}`, transform: `rotate(${rotation}deg)` }}>
                                <ReactCrop crop={crop} onChange={c => setCrop(c)} onComplete={c => setCompletedCrop(c)}>
                                    <img ref={imgRef} src={imageSrc} style={{ maxWidth: '100%', maxHeight: '80vh' }} alt="Edit" />
                                </ReactCrop>
                            </div>

                            {/* Text Layer Overlay */}
                            <div style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none' }}>
                                {layers.map(l => (
                                    <Draggable key={l.id} onStart={() => setSelectedLayerId(l.id)} onDrag={(e, data) => setLayers(layers.map(lay => lay.id === l.id ? { ...lay, x: data.x, y: data.y } : lay))}>
                                        <div style={{ position: 'absolute', pointerEvents: 'auto', cursor: 'grab', border: selectedLayerId === l.id ? '2px solid #4facfe' : 'none', padding: '5px' }}>
                                            <span style={{ fontSize: `${l.fontSize}px`, color: l.color, fontFamily: l.fontFamily, whiteSpace: 'nowrap', fontWeight: 'bold' }}>{l.text}</span>
                                        </div>
                                    </Draggable>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`.top-btn { background: #1a1a1a; color: #eee; border: 1px solid #333; padding: 8px 15px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 0.85rem; font-weight: 600; }`}</style>

            <AnimatePresence>
                {resultBlob && (
                    <motion.div initial={{ y: 50 }} animate={{ y: 0 }} style={{ position: 'fixed', bottom: 30, right: 30, zIndex: 200 }}>
                        <ProcessFeedback processing={processing} resultReady={true} onDownload={(n) => { saveFile(resultBlob, n, 'jpg'); setResultBlob(null); }} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const SideTool = ({ icon: Icon, label, active, onClick }) => (
    <div onClick={onClick} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: active ? '#4facfe' : '#555', cursor: 'pointer' }}>
        <div style={{ padding: '15px', borderRadius: '15px', background: active ? 'rgba(79, 172, 254, 0.1)' : 'transparent' }}><Icon size={24} /></div>
        <span style={{ fontSize: '0.6rem', fontWeight: '800' }}>{label}</span>
    </div>
);
const AdjustSlider = ({ label, value, min, max, onChange }) => ( <div style={{ marginBottom: '15px' }}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#888' }}><span>{label}</span><span>{Math.round(value)}</span></div><input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} style={{ width: '100%', accentColor: '#4facfe' }} /></div> );
const sectionStyle = { display: 'flex', flexDirection: 'column', gap: '20px' };
const titleStyle = { fontSize: '0.9rem', fontWeight: 'bold' };
const inputStyle = { width: '100%', padding: '12px', background: '#222', border: '1px solid #333', color: 'white', borderRadius: '8px', marginBottom: '10px' };
const btnStyle = { padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer', color: 'white', fontWeight: 'bold' };

export default PhotoEditor;
