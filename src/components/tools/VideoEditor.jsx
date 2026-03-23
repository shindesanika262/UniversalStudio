import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import Cropper from 'react-easy-crop';
import { 
    Upload, Play, Pause, Download, X, Scissors, Layers, 
    Sliders, Crop as CropIcon, Film, Video as VideoIcon, 
    Music, Sparkles, PlayCircle, Settings, Type, Plus, Trash2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProcessFeedback, { saveFile } from '../ui/ProcessFeedback';

const VideoEditor = ({ onClose }) => {
    // Media State
    const [videoSrc, setVideoSrc] = useState(null);
    const [videoFile, setVideoFile] = useState(null);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);

    // FFmpeg State
    const [loaded, setLoaded] = useState(false);
    const ffmpegRef = useRef(new FFmpeg());
    const [message, setMessage] = useState('Initializing Pro Engine...');

    // Tools & Layers
    const [activeTab, setActiveTab] = useState('trim'); // trim, text, export
    const [layers, setLayers] = useState([]);
    const [selectedLayerId, setSelectedLayerId] = useState(null);

    // Processing State
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [resultBlob, setResultBlob] = useState(null);

    // Edit Parameters
    const [startTime, setStartTime] = useState(0);
    const [endTime, setEndTime] = useState(10);
    const [quality, setQuality] = useState('medium');

    const videoRef = useRef(null);

    const load = async () => {
        const ffmpeg = ffmpegRef.current;
        ffmpeg.on('log', ({ message }) => setMessage(message));
        ffmpeg.on('progress', ({ progress }) => setProgress(Math.round(progress * 100)));

        try {
            await ffmpeg.load({
                coreURL: await toBlobURL(`https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js`, 'text/javascript'),
                wasmURL: await toBlobURL(`https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.wasm`, 'application/wasm'),
            });
            
            // Pre-load a font for Text Overlay
            const fontUrl = 'https://raw.githubusercontent.com/vitogit/fonts/master/arial.ttf';
            await ffmpeg.writeFile('font.ttf', await fetchFile(fontUrl));
            
            setLoaded(true);
            setMessage('Studio Ready');
        } catch (e) {
            console.error(e);
            setMessage('Engine Initialization Failed');
        }
    };

    useEffect(() => { load(); }, []);

    const handleUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setVideoFile(file);
            setVideoSrc(URL.createObjectURL(file));
        }
    };

    const handleLoadedMetadata = (e) => {
        setDuration(e.target.duration);
        setEndTime(e.target.duration);
    };

    const addTextLayer = () => {
        const newLayer = {
            id: Date.now(),
            type: 'text',
            text: 'EDIT THIS TEXT',
            x: 20, y: 20,
            fontSize: 48,
            color: 'white'
        };
        setLayers([...layers, newLayer]);
        setSelectedLayerId(newLayer.id);
        setActiveTab('text');
    };

    const updateLayer = (id, updates) => {
        setLayers(layers.map(l => l.id === id ? { ...l, ...updates } : l));
    };

    const processVideo = async () => {
        if (!loaded) return;
        setProcessing(true);
        const ffmpeg = ffmpegRef.current;

        try {
            await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile));
            
            // Build Filter Chain
            let filters = [];
            layers.forEach(l => {
                if (l.type === 'text') {
                    // drawtext filter: escapes for characters if needed
                    const escapedText = l.text.replace(/'/g, "'\\\\\\''"); 
                    filters.push(`drawtext=fontfile=/font.ttf:text='${escapedText}':x=${l.x}:y=${l.y}:fontsize=${l.fontSize}:fontcolor=${l.color}`);
                }
            });

            let cmd = ['-i', 'input.mp4'];
            if (startTime > 0) cmd.push('-ss', startTime.toString());
            if (endTime < duration) cmd.push('-to', endTime.toString());

            if (filters.length > 0) {
                cmd.push('-vf', filters.join(','));
            }

            let crf = quality === 'high' ? '18' : (quality === 'low' ? '28' : '23');
            cmd.push('-c:v', 'libx264', '-crf', crf, '-preset', 'ultrafast', '-c:a', 'copy', 'output.mp4');

            await ffmpeg.exec(cmd);
            const data = await ffmpeg.readFile('output.mp4');
            setResultBlob(new Blob([data.buffer], { type: 'video/mp4' }));
        } catch (e) {
            console.error(e);
            alert('Studio Export Failed');
        } finally {
            setProcessing(false);
        }
    };

    const selectedLayer = layers.find(l => l.id === selectedLayerId);

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: '#0a0a0a', zIndex: 1000, display: 'flex', color: 'white'
        }}>
            {/* Header Top */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '60px', background: '#111', borderBottom: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', zIndex: 100 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <VideoIcon size={24} color="#f093fb" />
                    <span style={{ fontWeight: '600' }}>Video Pro Studio</span>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={addTextLayer} className="top-btn"><Plus size={16}/> Text Overlay</button>
                    <button onClick={processVideo} style={{ background: '#f093fb', color: 'white', border: 'none', padding: '8px 25px', borderRadius: '6px', fontWeight: 'bold' }}>Render & Save</button>
                    <X color="#666" size={24} onClick={onClose} style={{ cursor: 'pointer', marginLeft: '10px' }} />
                </div>
            </div>

            {/* Navigation Side */}
            <div style={{ width: '80px', marginTop: '60px', background: '#111', borderRight: '1px solid #333', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '20px', gap: '25px' }}>
                <SideTool icon={Scissors} label="Trim" active={activeTab === 'trim'} onClick={() => setActiveTab('trim')} />
                <SideTool icon={Type} label="Text" active={activeTab === 'text'} onClick={() => setActiveTab('text')} />
                <SideTool icon={Settings} label="Export" active={activeTab === 'export'} onClick={() => setActiveTab('export')} />
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginTop: '60px' }}>
                <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                    {/* Tool Configurations */}
                    <div style={{ width: '300px', background: '#161616', borderRight: '1px solid #333', padding: '25px', overflowY: 'auto' }}>
                        {activeTab === 'trim' && (
                            <div style={sectionStyle}>
                                <h3>Trimming</h3>
                                <AdjustSlider label="Start Seek" value={startTime} min={0} max={duration} step={0.1} onChange={setStartTime} unit="s" />
                                <AdjustSlider label="End Seek" value={endTime} min={0} max={duration} step={0.1} onChange={setEndTime} unit="s" />
                            </div>
                        )}
                        {activeTab === 'text' && (
                            <div style={sectionStyle}>
                                <h3>{selectedLayer ? 'Text Layer' : 'Select a Layer'}</h3>
                                {selectedLayer ? (
                                    <>
                                        <input 
                                            type="text" value={selectedLayer.text} 
                                            onChange={(e) => updateLayer(selectedLayerId, { text: e.target.value })}
                                            style={inputStyle} 
                                        />
                                        <AdjustSlider label="Font Size" value={selectedLayer.fontSize} min={10} max={200} onChange={(v) => updateLayer(selectedLayerId, { fontSize: v })} />
                                        <AdjustSlider label="X Pos" value={selectedLayer.x} min={0} max={1920} onChange={(v) => updateLayer(selectedLayerId, { x: v })} />
                                        <AdjustSlider label="Y Pos" value={selectedLayer.y} min={0} max={1080} onChange={(v) => updateLayer(selectedLayerId, { y: v })} />
                                        
                                        <button onClick={() => setLayers(layers.filter(l => l.id !== selectedLayerId))} style={{ background: '#ef4444', border: 'none', padding: '10px', borderRadius: '8px', color: 'white', fontWeight: 'bold' }}>Delete Layer</button>
                                    </>
                                ) : (
                                    <p style={{ color: '#666', fontSize: '0.8rem' }}>Add a text overlay from the top bar to start designing.</p>
                                )}
                            </div>
                        )}
                        {activeTab === 'export' && (
                            <div style={sectionStyle}>
                                <h3>Project Settings</h3>
                                <label style={{ fontSize: '0.8rem' }}>Engine Mode</label>
                                <select value={quality} onChange={(e) => setQuality(e.target.value)} style={inputStyle}>
                                    <option value="high">4K/FHD Production</option>
                                    <option value="medium">Standard Export</option>
                                    <option value="low">Social Media Draft</option>
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Stage Workspace */}
                    <div style={{ flex: 1, position: 'relative', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {!videoSrc ? (
                            <div style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => document.getElementById('vid-main-up').click()}>
                                <Upload size={80} color="#f093fb" style={{ margin: '0 auto 20px' }} />
                                <h3>Drop Video Clip</h3>
                                <p style={{ color: '#666' }}>Framer-optimized studio engine</p>
                                <input id="vid-main-up" type="file" accept="video/*" style={{ display: 'none' }} onChange={handleUpload} />
                            </div>
                        ) : (
                            <div style={{ position: 'relative' }}>
                                <video
                                    ref={videoRef} src={videoSrc} controls onLoadedMetadata={handleLoadedMetadata}
                                    style={{ maxHeight: '80vh', maxWidth: '100%', borderRadius: '12px' }}
                                />
                                {/* Preview Layers on Top of Video */}
                                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                                    {layers.map(l => (
                                        <div 
                                            key={l.id} 
                                            onClick={(e) => { e.stopPropagation(); setSelectedLayerId(l.id); setActiveTab('text'); }}
                                            style={{ 
                                                position: 'absolute', 
                                                left: `${l.x}px`, top: `${l.y}px`, 
                                                color: l.color, fontSize: `${l.fontSize / 2}px`, 
                                                fontWeight: 'bold', pointerEvents: 'auto', 
                                                cursor: 'pointer', border: selectedLayerId === l.id ? '2px solid #f093fb' : 'none' 
                                            }}
                                        >
                                            {l.text}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Timeline Strip */}
                <div style={{ height: '120px', background: '#111', borderTop: '1px solid #333', padding: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', fontSize: '0.7rem' }}>
                        <PlayCircle size={14} color="#f093fb" /> PRODUCTION TIMELINE
                    </div>
                    <div style={{ height: '30px', background: '#222', borderRadius: '4px', position: 'relative' }}>
                        {duration > 0 && (
                            <div style={{
                                position: 'absolute',
                                left: `${(startTime / duration) * 100}%`,
                                width: `${((endTime - startTime) / duration) * 100}%`,
                                height: '100%', background: 'rgba(240, 147, 251, 0.4)',
                                borderLeft: '2px solid #f093fb', borderRight: '2px solid #f093fb'
                            }} />
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .top-btn {
                    background: #2a2a2a; color: white; border: 1px solid #444; 
                    padding: 8px 12px; borderRadius: 6px; cursor: pointer;
                    display: flex; align-items: center; gap: 8px; font-weight: 500;
                }
            `}</style>

            <AnimatePresence>
                {(processing || resultBlob) && (
                    <motion.div initial={{ y: 50 }} animate={{ y: 0 }} style={{ position: 'fixed', bottom: 30, right: 30, zIndex: 200 }}>
                        <ProcessFeedback
                            processing={processing} progress={progress} resultReady={!!resultBlob}
                            defaultFilename="studio-production"
                            onDownload={(name) => { saveFile(resultBlob, name, 'mp4'); setResultBlob(null); }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const SideTool = ({ icon: Icon, label, active, onClick }) => (
    <div onClick={onClick} style={{ 
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', 
        color: active ? '#f093fb' : '#666', cursor: 'pointer'
    }}>
        <div style={{ padding: '12px', borderRadius: '12px', background: active ? 'rgba(240, 147, 251, 0.1)' : 'transparent' }}>
            <Icon size={24} />
        </div>
        <span style={{ fontSize: '0.65rem', fontWeight: 'bold' }}>{label}</span>
    </div>
);

const AdjustSlider = ({ label, value, min, max, step = 1, onChange, unit = '' }) => (
    <div style={{ marginBottom: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.75rem', color: '#888' }}>
            <span>{label}</span>
            <span>{value.toFixed(1)}{unit}</span>
        </div>
        <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} style={{ width: '100%', accentColor: '#f093fb' }} />
    </div>
);

const sectionStyle = { display: 'flex', flexDirection: 'column', gap: '15px' };
const inputStyle = { width: '100%', padding: '12px', background: '#222', color: 'white', border: '1px solid #333', borderRadius: '8px', fontSize: '0.9rem' };

export default VideoEditor;
