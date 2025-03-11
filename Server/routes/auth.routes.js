// auth.routes.js
const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require("../database/config"); 
const router = express.Router();
const security = require('../database/security');
//const { parse } = require("dotenv/types");
const path = require('path');
const baseUrl = require('../database/config.json');
const e = require("express");

// Register Route
router.post('/register', async (req, res) => {
    const { email, password, username, role } = req.body;
    if (!email || !password || !username || !role) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        await pool.query('CALL sp_user_register(?, ?, ?, ?)', [email, hashedPassword, username, role]);
        res.json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }
    try {
        const [rows] = await pool.query('CALL sp_user_login(?)', [email]);
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const user = rows[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        res.json({ message: 'User logged in successfully', userId: user.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;