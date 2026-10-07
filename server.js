const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware configurations - Safely serves everything inside your public folder
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Connect to the SQLite Database file safely
const db = new sqlite3.Database(path.join(__dirname, 'database.db'), (err) => {
    if (err) console.error("❌ Database connection failed:", err.message);
    else console.log("✔ Connected to SQLite database.");
});

// Setup users table structure and automatically maintain your account entry records
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        balance REAL DEFAULT 0.00
    )`, (err) => {
        if (!err) {
            console.log("✔ Users data matrix initialized safely.");
            
            // 🟢 PERMANENT PROFILE ENGINE OVERRIDE: Automatically spawns your credentials if wiped!
            const targetUsername = "johnrevansll04";
            const targetPassword = "yoursecurepasswordhere"; // Change this to your exact login password string
            const preciseBalance = parseFloat((19849.375).toFixed(2)); // Matches your dashboard assets metric

            db.run(
                `INSERT OR IGNORE INTO users (username, password, balance) VALUES (?, ?, ?)`,
                [targetUsername, targetPassword, preciseBalance],
                (insertErr) => {
                    if (!insertErr) {
                        console.log(`🔒 Static Profile System Active: Managed account entry "${targetUsername}" secured seamlessly.`);
                    }
                }
            );
        }
    });
});

// Temporary global variable to track session state for development
let loggedInUserId = null; 

// ==========================================================================
// 🚀 API ENDPOINTS IMPLEMENTATIONS
// ==========================================================================

// 1. User Account Registration Flow
app.post('/api/signup', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required fields." });
    }

    // Set a clean fixed starter balance value for your practice dashboard
    const starterBalance = parseFloat((6749.375).toFixed(2)); 
    const query = `INSERT INTO users (username, password, balance) VALUES (?, ?, ?)`;

    db.run(query, [username, password, starterBalance], function (err) {
        if (err) {
            console.error("SQL Insertion Failure Context:", err.message);
            if (err.message.includes("UNIQUE constraint failed")) {
                return res.status(400).json({ error: "Username already exists." });
            }
            return res.status(500).json({ error: `Database internal error: ${err.message}` });
        }
        
        loggedInUserId = this.lastID; // Establish user session
        console.log(`👤 New user created successfully! ID: ${this.lastID}, Username: ${username}, Balance: $${starterBalance}`);
        res.status(201).json({ success: true, message: "Account verified." });
    });
});

// 2. User Dashboard Authentication Verification Logins
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const query = `SELECT * FROM users WHERE username = ? AND password = ?`;

    db.get(query, [username, password], (err, user) => {
        if (err) {
            return res.status(500).json({ error: "Internal server error reading database." });
        }
        if (!user) {
            return res.status(401).json({ error: "Invalid username or password configuration." });
        }
        
        loggedInUserId = user.id; // Log user session in
        console.log(`🔑 User "${user.username}" logged in successfully.`);
        res.json({ success: true, message: "Access granted." });
    });
});
// 3. Dynamic Balance Fetch Route
app.get('/api/balance', (req, res) => {
    if (!loggedInUserId) {
        return res.status(401).json({ error: "Unauthorized access. Please register or sign in." });
    }

    const query = `SELECT balance FROM users WHERE id = ?`;
    db.get(query, [loggedInUserId], (err, row) => {
        if (err || !row) {
            return res.status(500).json({ error: "Could not safely pull balance records." });
        }
        res.json({ balance: row.balance });
    });
});

// 4. Secure Logout Actions
app.post('/api/logout', (req, res) => {
    loggedInUserId = null;
    res.json({ success: true });
});

// 5. Secure Fund Transfers API Endpoint Engine
app.post('/api/transfer', (req, res) => {
    const { recipient, amount } = req.body;

    if (!loggedInUserId) {
        return res.status(401).json({ error: "Unauthorized session access." });
    }
    
    if (!recipient || !amount || amount <= 0) {
        return res.status(400).json({ error: "Invalid username parameters or amount metric." });
    }

    db.get(`SELECT * FROM users WHERE id = ?`, [loggedInUserId], (err, sender) => {
        if (err || !sender) return res.status(500).json({ error: "Could not safely verify your user balance." });

        if (sender.username === recipient) {
            return res.status(400).json({ error: "You cannot transfer funds to your own profile identity username." });
        }
        if (sender.balance < amount) {
            return res.status(400).json({ error: "Insufficient safe balance available to execute wire." });
        }

        db.get(`SELECT * FROM users WHERE username = ?`, [recipient], (err, targetUser) => {
            if (err || !targetUser) {
                return res.status(404).json({ error: `Recipient user profile identity "${recipient}" does not exist.` });
            }

            const senderNewBalance = sender.balance - amount;
            const targetNewBalance = targetUser.balance + amount;

            db.serialize(() => {
                db.run(`UPDATE users SET balance = ? WHERE id = ?`, [senderNewBalance, loggedInUserId]);
                db.run(`UPDATE users SET balance = ? WHERE username = ?`, [targetNewBalance, recipient], (err) => {
                    if (err) return res.status(500).json({ error: "Transaction processing loop failure." });

                    console.log(`💸 Wire Complete! $${amount} sent from "${sender.username}" to "${recipient}".`);
                    res.json({ 
                        success: true, 
                        message: `Successfully sent $${amount.toFixed(2)} to ${recipient}!`,
                        newBalance: senderNewBalance
                    });
                });
            });
        });
    }); 
});

// ==========================================================================
// 🔴 FALLBACK ROUTING LAYER & MASTER SERVERS
// ==========================================================================

// 🟢 Delivers your balance dashboard layout file when explicitly requested
app.get('/dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// 🟢 MASTER FALLBACK: Directs any unmatched browser address paths to load your Skyscrapers welcome index.html cleanly!
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Server running smoothly on http://localhost:${PORT}`);
});