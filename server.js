const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
// const session = require("express-session");
const path = require('path');

require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;
const corsOptions = {
    origin: true,
    credentials: true,
}
const timezone = 'Asia/Manila';
process.env.TZ = timezone;

app.use(bodyParser.json());
app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
// app.use(session({ secret: process.env.PUBLICVAPIDKEY, resave: false, saveUninitialized: false }))

const Template = require('./routes/template.routes');
const auth = require('./routes/Auth.routes'); //mao ni akong gi add

// File Upload API
const fileUpload = require('express-fileupload');
app.use(fileUpload());
app.use(express.static('public'));
// Email Sender


app.use("/template", Template);
app.use("/auth", auth); //mao ni akong gi add

app.get('/', function (req, res) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Welcome developer! Build Date: 01232023');
});

// app.use(function (req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
// });

// comment this if production
// app.post('/samplepost', function (req, res) {
//     res.statusCode = 200;
//     res.setHeader('Content-Type', 'text/plain');
//     res.end('This is a post!');
// });

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});