const jwt = require("jsonwebtoken");
const db = require("../database/config");
// const jwt = require("jsonwebtoken"); // comment double entry
require('dotenv').config()

let security = {};

security.verifyAutheticity = (req, res, next) => {
    const bearerHeader = req.headers[process.env.HEADERKEY];
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        jwt.verify(bearerToken, process.env.PUBLICVAPIDKEY, (err, decoded) => {
            if (err) {
                res.set('Content-Type', 'text/plain')
                res.send({ error: true, message: "Error Code 502: Forbidden Access. Please re-login" });
            } else {
                if (decoded.data) {
                    db.sequelize.query('CALL sp_user_login(:username, :password)', {
                        replacements: {
                            username: decoded.data.username,
                            password: decoded.data.password
                        }
                    }).then(data => {
                        if (data.length > 0) {
                            next();
                        } else {
                            res.set('Content-Type', 'text/plain')
                            res.send({ error: true, message: "Error Code 505: Forbidden Access. Please re-login" });
                        }
                    }).catch(err => {
                        res.send({ error: true, message: `Error 504: ${err}` });
                    });
                } else {
                    res.send({ error: true, message: "Error Code 503: Forbidden Access. Please re-login" });
                }
            }
        });
    } else {
        res.set('Content-Type', 'text/plain')
        res.send({ error: true, message: "Error Code 501: Forbidden Access. Please re-login" });
    }
}

security.verifyCSRF = (err, req, res, next) => {
    if (err.code !== 'EBADCSRFTOKEN') return next(err)
    res.status(401).send({ error: true, message: "csrf-533-252: Token expired or not is not found. Please reload form" });
}

module.exports = security;