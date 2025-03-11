const express = require("express");
const mysql = require("mysql2");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
app.use(express.json());

// Database connection
const db = mysql.createPool({
    host: "192.185.48.158",
    user: "bisublar_nias",
    password: "BISUBlarrNIAs2!",
    database: "bisublar_nias",
    connectionLimit: 10
});

// User Registration
app.post("/register", async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.query("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashedPassword], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "User registered successfully" });
    });
});

// User Login
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    
    db.query("SELECT * FROM users WHERE username = ?", [username], async (err, results) => {
        if (err || results.length === 0) return res.status(401).json({ error: "Invalid credentials" });
        
        const isMatch = await bcrypt.compare(password, results[0].password);
        if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });
        
        const token = jwt.sign({ id: results[0].id }, "secret", { expiresIn: "1h" });
        res.json({ token });
    });
});

app.listen(3000, () => console.log("Server running on port 3000"));