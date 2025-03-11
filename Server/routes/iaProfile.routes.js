const express = require("express");
const router = express.Router();
//const cors = require("cors");
const db = require("../database/config");
//const csrf = require('csurf');
//const config = require('../database/config.json');

//const security = require('../database/security');


// Get All IA Profiles
router.get('/get_profile', (req, res) => {
    db.sequelize.query('CALL sp_iaProfile_getAll()', {
        type: db.sequelize.QueryTypes.SELECT
    }).then((data) => {
        const data_ret = db.MultiQueryResult(data).result0;
        if (data_ret) {
            res.send(data_ret);
        } else {
            res.send(`no_data`);
        }
    }).catch(err => {
        res.send(`Error: ${err}`);
    });
});

// Insert IA Profile
router.post('/insert', async (req, res) => {
    const data = Object.values(req.body);
    try {
        await pool.query('CALL sp_iaProfile_insert(?)', [data]);
        res.json({ message: 'IA Profile inserted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update IA Profile
router.put('/update/:cis_id', async (req, res) => {
    const { cis_id } = req.params;
    const data = Object.values(req.body);
    try {
        await pool.query('CALL sp_iaProfile_update(?, ?)', [cis_id, ...data]);
        res.json({ message: 'IA Profile updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;