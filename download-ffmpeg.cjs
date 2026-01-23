const fs = require('fs');
const https = require('https');
const path = require('path');

const dir = path.join(__dirname, 'public', 'ffmpeg');

if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

const files = [
    {
        url: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js',
        name: 'ffmpeg-core.js'
    },
    {
        url: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.wasm',
        name: 'ffmpeg-core.wasm'
    }
];

files.forEach(file => {
    const filePath = path.join(dir, file.name);
    const fileStream = fs.createWriteStream(filePath);
    https.get(file.url, (response) => {
        response.pipe(fileStream);
        fileStream.on('finish', () => {
            fileStream.close();
            console.log(`Downloaded ${file.name}`);
        });
    }).on('error', (err) => {
        console.error(`Error downloading ${file.name}:`, err.message);
    });
});
