// ======================================================
// Winter 2022 CSS 497 Capstone Project
// Lisa Waranowitz
// ======================================================
// sqldb.js
// MySQL
// ======================================================

const mysql = require('mysql');
const util = require('util');
const bcrypt = require('bcrypt');
const secrets = require('./secrets').secrets;

console.log("MySQL Connection setup...");
const con = mysql.createConnection({
    host: "localhost",
    user: "lisa",
    password: secrets[0],
    database: "loc_database"
});

const query = util.promisify(con.query).bind(con);
console.log("MySQL Connection setup complete.");

module.exports = {
  insertUser : async function(username, password) {
    try {
      var post = {username: username, password: password};
      await query("INSERT INTO users SET ?", post);
    } catch(error) {
      console.error(error);
      return -1;
    }
  },
  insertStrength : async function(username, city, countrycode, strength) {
    try {
      var post = {id: username, city: city, countrycode: countrycode, strength: strength};
      await query("INSERT INTO strengths SET ?", post);
    } catch(error) {
      console.error(error);
      return -1;
    }
  },
  getStrengthsAroundCity : async function(cities, countrycode) {
    try {
      var params = [];
      var q = "SELECT strength FROM strengths WHERE city = ?";
      for(let i = 0; i < cities.length - 1; i++) {
        q += " or city = ?";
        params.push(cities[i]);
      }
      params.push(cities[cities.length]);
      params.push(countrycode);
      var strengths = [];
      var results = await query(q + ' and countrycode = ?', params);
      var rows = JSON.parse(JSON.stringify(results));
      rows.forEach(function(row) {
        strengths.push(row.strength);
      });
      return strengths;
    } catch(error) {
      console.error(error);
      throw error;
    }
  },
  findUser : async function(username) {
    try {
      var results = await query('SELECT * from users where username = ?', [username]);
      var rows = JSON.parse(JSON.stringify(results));
      return rows[0].password;
    } catch(error) {
      console.log("user " + username + " was not found");
      return -1;
    }
  },
  disconnectFromDB : async function() {
    console.log("disconnecting from MySQL database...");
    await con.end();
    console.log("disconnected.");
  },
  testConnectionToDB : async function() {
    try {
      var rows = await query("SELECT * FROM strengths");
      return rows;
    } catch(error) {
      console.error(error);
    }
  }
};
