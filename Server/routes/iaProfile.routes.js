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
// Insert IA Profile
app.post("/insert", (req, res) => {
    const { name, position, contact } = req.body;
    db.query("CALL InsertIAProfile(?, ?, ?)", [name, position, contact], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "IA profile added successfully" });
    });
});

// Update IA Profile
app.put("/update", (req, res) => {
    const { id, name, position, contact } = req.body;
    db.query("CALL UpdateIAProfile(?, ?, ?, ?)", [id, name, position, contact], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "IA profile updated successfully" });
    });
});

app.listen(3000, () => console.log("Server running on port 3000"));