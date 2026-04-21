const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const oracledb = require('oracledb');
require('dotenv').config();

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname));

// Database Configuration (Update these with your details)
const dbConfig = {
    user: process.env.DB_USER || "your_username",
    password: process.env.DB_PASSWORD || "your_password",
    connectString: process.env.DB_CONN || "localhost:1521/xe"
};

// --- API Routes ---

// Fetch all events for Students
app.get('/api/events', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(`SELECT * FROM events`, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) await connection.close();
    }
});

// Admin: Add a new event
app.post('/api/add-event', async (req, res) => {
    const { name, date, time, venue, image } = req.body;
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        await connection.execute(
            `INSERT INTO events (name, event_date, event_time, venue, image_url) VALUES (:1, :2, :3, :4, :5)`,
            [name, date, time, venue, image || "https://via.placeholder.com/260x170"],
            { autoCommit: true }
        );
        res.redirect('/CommiteeDashboard.html');
    } catch (err) {
        res.status(500).send("Database Error: " + err.message);
    } finally {
        if (connection) await connection.close();
    }
});

// Standard Page Routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.post('/api/login', (req, res) => res.redirect('/ViewEvents.html'));
app.post('/api/admin-login', (req, res) => res.redirect('/CommiteeDashboard.html'));

app.listen(PORT, () => {
    console.log(`System running at http://localhost:${PORT}`);
});