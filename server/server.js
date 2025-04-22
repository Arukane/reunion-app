const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Database
const db = new sqlite3.Database(path.join(__dirname, '../db/database.sqlite'));

// Initialize tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS passcodes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS attendees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    confirmed_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// Get current passcode
app.get('/api/passcode', (req, res) => {
  db.get(`SELECT code FROM passcodes ORDER BY created_at DESC LIMIT 1`, (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ passcode: row?.code || null });
  });
});

// Generate new passcode
app.post('/api/passcode', (req, res) => {
  const newCode = generateRandomPasscode();
  db.run(`INSERT INTO passcodes (code) VALUES (?)`, [newCode], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    db.run(`DELETE FROM attendees`); // clear old attendees
    res.json({ passcode: newCode });
  });
});

// Confirm attendance
app.post('/api/attend', (req, res) => {
  const { first_name, last_name, passcode } = req.body;

  if (!first_name || !last_name || !passcode) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.get(`SELECT code FROM passcodes ORDER BY created_at DESC LIMIT 1`, (err, row) => {
    if (err) return res.status(500).json({ error: err.message });

    if (!row || row.code !== passcode) {
      return res.status(401).json({ error: 'Invalid passcode' });
    }

    db.run(`INSERT INTO attendees (first_name, last_name) VALUES (?, ?)`,
      [first_name, last_name],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
      });
  });
});

// Get confirmed attendees
app.get('/api/attendees', (req, res) => {
  db.all(`SELECT first_name, last_name FROM attendees ORDER BY confirmed_at ASC`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ attendees: rows });
  });
});

// Utility function
function generateRandomPasscode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
  let passcode = '';
  for (let i = 0; i < length; i++) {
    passcode += chars[Math.floor(Math.random() * chars.length)];
  }
  return passcode;
}

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
