// ======================================================
// Winter 2022 CSS 497 Capstone Project
// Lisa Waranowitz
// ======================================================
// app.js
// server implementation
// ======================================================

const express = require('express');
const http = require('http');
const bcrypt = require('bcrypt');
const path = require("path");
const jQuery = require('jquery');
const loc = require('./location');
const sql = require('./sqldb');
const readline = require('readline');
const hostname = '127.0.0.1';
const port = 3000;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const app = express();
const server = http.createServer(app);
app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, './public')));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});

app.post('/registerloc', async (req, res) => {
    let city = req.body.city;
    let countrycode = req.body.countrycode;
    try {
        var nearestCities = await loc.nearestCities(city, countrycode);
        var strengths = await sql.getStrengthsAroundCity(nearestCities, countrycode);
        res.render('registration', {data: {strengths: strengths, city: city, countrycode: countrycode}});
    } catch(error) {
        console.error(error);
        res.send(error);
    }
});

app.post('/register', async (req, res) => {
    try {
        let hashPassword = await bcrypt.hash(req.body.password, 10);
        let newUser = {
            username: req.body.username,
            password: hashPassword,
            verdict: req.body.verdict,
            city: req.body.city,
            countrycode: req.body.countrycode
        };
        let hashUsername = await bcrypt.hash(newUser.username, 10);
        
        var res1 = await sql.insertUser(newUser.username, newUser.password);
        if(res1 == -1) {
            res.send("<div align ='center'><h2>Username already used</h2></div><br><br><div align='center'><a href='./registration-1.html'>Register again</a></div>");
            return;
        }
        var res2 = await sql.insertStrength(hashUsername, newUser.city, newUser.countrycode, newUser.verdict);
        if(res2 == -1) {
            res.send("<div align ='center'><h2>Username already used</h2></div><br><br><div align='center'><a href='./registration-1.html'>Register again</a></div>");
            return;
        }
        res.send("<div align ='center'><h2>Registration successful</h2></div><br><br><div align='center'><a href='./login.html'>login</a></div><br><br><div align='center'><a href='./registration-1.html'>Register another user</a></div>");
    } catch(error) {
        console.error(error);
        res.send(error);
    }
});

app.post('/login', async (req, res) => {
    try {
        var stored_pass = await sql.findUser(req.body.username);
        if (stored_pass == -1) {
            res.send("<div align ='center'><h2>Invalid username or password</h2></div><br><br><div align ='center'><a href='./login.html'>login again</a></div>");
            return;
        }
        const passwordMatch = await bcrypt.compare(req.body.password, stored_pass);
        if(passwordMatch) {
            let username = req.body.username;
            res.send(`<div align ='center'><h2>login successful</h2></div><br><br><br><div align ='center'><h3>Hello ${username}</h3></div><br><br><div align='center'><a href='./login.html'>logout</a></div>`);
            return;
        } else {
            res.send("<div align ='center'><h2>Invalid username or password</h2></div><br><br><div align ='center'><a href='./login.html'>login again</a></div>");
            return;
        }
    } catch {
        res.status(500).send("Internal server error");
    } 
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

rl.on('close', function () {
    console.log('closing server...');
    server.close(async (error) => {
        if(error) {
            console.error(error);
            process.exit(1);
        }
        await sql.disconnectFromDB();
        console.log('done, bye!');
        process.exit(0);
    });
});

