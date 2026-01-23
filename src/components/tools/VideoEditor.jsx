import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import Cropper from 'react-easy-crop';
import { Upload, Play, Pause, Download, X, Scissors, Layers, Sliders, Crop as CropIcon } from 'lucide-react';
import ProcessFeedback, { saveFile } from '../ui/ProcessFeedback';

const VideoEditor = ({ onClose }) => {
    // Media State
    const [videoSrc, setVideoSrc] = useState(null);
    const [videoFile, setVideoFile] = useState(null);
    const [duration, setDuration] = useState(0);

    // FFmpeg State
    const [loaded, setLoaded] = useState(false);
    const ffmpegRef = useRef(new FFmpeg());
    const [message, setMessage] = useState('Loading FFmpeg...');

    // Tools State
    const [activeTab, setActiveTab] = useState('trim'); // trim, crop, export

    // Processing State
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [resultBlob, setResultBlob] = useState(null);

    // Edit Parameters
    // Crop
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    // Trim
    const [startTime, setStartTime] = useState(0);
    const [endTime, setEndTime] = useState(10);
    // Export
    const [resolution, setResolution] = useState('original'); // 240p, ... 4k
    const [quality, setQuality] = useState('medium'); // low (crf 28), medium (23), high (18)

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const load = async () => {
        const ffmpeg = ffmpegRef.current;
        ffmpeg.on('log', ({ message }) => {
            console.log(message);
            setMessage(message);
        });
        ffmpeg.on('progress', ({ progress }) => {
            setProgress(Math.round(progress * 100));
        });

        try {
            // Load from local public/ffmpeg folder to ensure header compatibility
            await ffmpeg.load({
                coreURL: await toBlobURL(`/ffmpeg/ffmpeg-core.js`, 'text/javascript'),
                wasmURL: await toBlobURL(`/ffmpeg/ffmpeg-core.wasm`, 'application/wasm'),
            });
            setLoaded(true);
            setMessage('Ready');
        } catch (e) {
            console.error(e);
            setMessage('Failed to load FFmpeg (Check CORS/Headers)');
        }
    };

    useEffect(() => {
        load();
    }, []);

    const handleUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setVideoFile(file);
            setVideoSrc(URL.createObjectURL(file));
            // Reset edit states
            setStartTime(0);
            setEndTime(10); // Default, will update on metadata load
        }
    };

    const handleLoadedMetadata = (e) => {
        setDuration(e.target.duration);
        setEndTime(e.target.duration);
    };

    const processVideo = async () => {
        if (!loaded) return;
        setProcessing(true);
        setProgress(0);
        const ffmpeg = ffmpegRef.current;

        try {
            await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile));

            let filters = [];

            // 1. Crop
            if (activeTab === 'crop' || croppedAreaPixels) {
                // Ensure even numbers for codec compatibility
                const w = Math.floor(croppedAreaPixels.width / 2) * 2;
                const h = Math.floor(croppedAreaPixels.height / 2) * 2;
                const x = Math.floor(croppedAreaPixels.x);
                const y = Math.floor(croppedAreaPixels.y);
                filters.push(`crop=${w}:${h}:${x}:${y}`);
            }

            // 2. Scale (Resolution)
            if (resolution !== 'original') {
                let scaleW = -2; // Keep aspect ratio
                let scaleH = -2;
                if (resolution === '4k') scaleH = 2160;
                else if (resolution === '1080p') scaleH = 1080;
                else if (resolution === '720p') scaleH = 720;
                else if (resolution === '480p') scaleH = 480;
                else if (resolution === '240p') scaleH = 240;

                // If crop exists, we scale AFTER crop? usually yes.
                // FFmpeg filter chain: crop=...,scale=...
                filters.push(`scale=-2:${scaleH}`);
            }

            // 3. Trim
            // We use input seeking (-ss) for speed, but for frame accuracy inside filter complex involves 'trim'.
            // Simple approach: Input options

            const filterStr = filters.length > 0 ? filters.join(',') : null;

            // Build command
            // Note: ffmpeg.exec takes array of strings
            let cmd = [];
            cmd.push('-i', 'input.mp4');

            // Trim (using seeking on input is faster but doing it here ensures consistent sync with filters in some versions, 
            // but standard is -ss before -i for input seeking, or -ss after for output seeking.
            // Using output seeking is safer for transcoding)
            if (startTime > 0) cmd.push('-ss', startTime.toString());
            if (endTime < duration) cmd.push('-to', endTime.toString());

            if (filterStr) {
                cmd.push('-vf', filterStr);
            }

            // Quality (CRF)
            let crf = '23';
            if (quality === 'high') crf = '18';
            if (quality === 'low') crf = '28';
            cmd.push('-c:v', 'libx264', '-crf', crf, '-preset', 'ultrafast');
            // ultrafast for browser speed, though bigger file size

            cmd.push('output.mp4');

            await ffmpeg.exec(cmd);

            const data = await ffmpeg.readFile('output.mp4');
            setResultBlob(new Blob([data.buffer], { type: 'video/mp4' }));
        } catch (e) {
            console.error(e);
            alert('Processing Failed');
        } finally {
            setProcessing(false);
        }
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

            {!videoSrc ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{
                        border: '2px dashed #666', borderRadius: '20px', padding: '60px',
                        textAlign: 'center', cursor: 'pointer', color: 'white'
                    }} onClick={() => document.getElementById('new-vid-up').click()}>
                        <Upload size={60} color="#f093fb" />
                        <h2>Upload Media</h2>
                        <p>{loaded ? 'Engine Ready' : message}</p>
                        <input id="new-vid-up" type="file" accept="video/*" style={{ display: 'none' }} onChange={handleUpload} />
                    </div>
                </div>
            ) : (
                <>
                    {/* Main Area */}
                    <div style={{ flex: 1, position: 'relative', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {activeTab === 'crop' ? (
                            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                <Cropper
                                    video={videoSrc}
                                    crop={crop}
                                    zoom={zoom}
                                    aspect={undefined}
                                    onCropChange={setCrop}
                                    onCropComplete={onCropComplete}
                                    onZoomChange={setZoom}
                                />
                            </div>
                        ) : (
                            <video
                                src={videoSrc}
                                controls
                                onLoadedMetadata={handleLoadedMetadata}
                                style={{ maxHeight: '80vh', maxWidth: '90%' }}
                            />
                        )}
                    </div>

                    {/* Sidebar */}
                    <div style={{ width: '320px', background: '#1a1a1a', borderLeft: '1px solid #333', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', background: '#222', padding: '5px', borderRadius: '10px' }}>
                            <TabIcon icon={Scissors} active={activeTab === 'trim'} onClick={() => setActiveTab('trim')} />
                            <TabIcon icon={CropIcon} active={activeTab === 'crop'} onClick={() => setActiveTab('crop')} />
                            <TabIcon icon={Sliders} active={activeTab === 'export'} onClick={() => setActiveTab('export')} />
                        </div>

                        {activeTab === 'trim' && (
                            <div style={sectionStyle}>
                                <h3>Trim Video</h3>
                                <label>Start: {startTime}s</label>
                                <input type="range" min={0} max={duration} step={0.1} value={startTime} onChange={(e) => setStartTime(Number(e.target.value))} style={{ width: '100%' }} />

                                <label>End: {endTime}s</label>
                                <input type="range" min={0} max={duration} step={0.1} value={endTime} onChange={(e) => setEndTime(Number(e.target.value))} style={{ width: '100%' }} />
                                <p style={{ fontSize: '0.8rem', color: '#888' }}>Duration: {(endTime - startTime).toFixed(1)}s</p>
                            </div>
                        )}

                        {activeTab === 'crop' && (
                            <div style={sectionStyle}>
                                <h3>Crop</h3>
                                <p style={{ fontSize: '0.8rem', color: '#888' }}>Drag/Zoom on the video area</p>
                                <label>Zoom: {zoom}x</label>
                                <input type="range" min={1} max={3} step={0.1} value={zoom} onChange={(e) => setZoom(e.target.value)} style={{ width: '100%' }} />
                            </div>
                        )}

                        {activeTab === 'export' && (
                            <div style={sectionStyle}>
                                <h3>Export Settings</h3>
                                <label>Resolution</label>
                                <select value={resolution} onChange={(e) => setResolution(e.target.value)} style={inputStyle}>
                                    <option value="original">Original</option>
                                    <option value="4k">4K (UHD)</option>
                                    <option value="1080p">1080p (FHD)</option>
                                    <option value="720p">720p (HD)</option>
                                    <option value="480p">480p (SD)</option>
                                    <option value="240p">240p (Low)</option>
                                </select>

                                <label>Quality</label>
                                <select value={quality} onChange={(e) => setQuality(e.target.value)} style={inputStyle}>
                                    <option value="high">High</option>
                                    <option value="medium">Medium</option>
                                    <option value="low">Low (Fast)</option>
                                </select>
                            </div>
                        )}

                        <div style={{ marginTop: 'auto' }}>
                            <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '10px' }}>{message}</p>
                            <button onClick={processVideo} disabled={!loaded || processing} style={{ ...btnStyle, background: '#f093fb', color: 'white', width: '100%', justifyContent: 'center', opacity: (!loaded || processing) ? 0.5 : 1 }}>
                                {processing ? `Rendering... ${progress}%` : 'Export Video'}
                            </button>
                            <ProcessFeedback
                                processing={processing}
                                progress={progress}
                                resultReady={!!resultBlob}
                                defaultFilename="edited-video"
                                onDownload={(name) => {
                                    if (resultBlob) {
                                        saveFile(resultBlob, name, 'mp4');
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

const TabIcon = ({ icon: Icon, active, onClick }) => (
    <div onClick={onClick} style={{
        padding: '10px', borderRadius: '8px', cursor: 'pointer',
        background: active ? '#f093fb' : 'transparent',
        color: active ? 'white' : '#888'
    }}>
        <Icon size={20} />
    </div>
);

const sectionStyle = { display: 'flex', flexDirection: 'column', gap: '15px', color: 'white' };
const inputStyle = { width: '100%', padding: '10px', background: '#333', color: 'white', border: 'none', borderRadius: '5px' };
const btnStyle = { padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' };

export default VideoEditor;
