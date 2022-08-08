// ======================================================
// Winter 2022 CSS 497 Capstone Project
// Lisa Waranowitz
// ======================================================
// location.js
// 2 APIs
// ======================================================

const axios = require('axios').default;
const secrets = require('./secrets').secrets;

module.exports = {
    nearestCities : async function(city, countrycode) {
        try {
            var lonlat = await getLonLat(city, countrycode);
            var nearestCities = await getNearestCities(lonlat[0],lonlat[1]);
            console.log("Got the following nearest cities: " + nearestCities);
            return nearestCities;
        } catch(error) {
            console.error(error);
        }
    }
};

async function getNearestCities(lon, lat) {
    var data = [];
    try {
        var options = {
            method: 'GET',
        url: 'https://geocodeapi.p.rapidapi.com/GetNearestCities',
            params: {range: '0', longitude: lon, latitude: lat},
            headers: {
                'x-rapidapi-host': 'geocodeapi.p.rapidapi.com',
                'x-rapidapi-key': secrets[1]
            }
        };
        var response = await axios.request(options);
        for (let i = 0; i < response.data.length; i++) {
            data.push(response.data[i].City);
        }
        return data;
    } catch(error) {
        console.error(error);
    }
}

async function getLonLat(city, countrycode) {
    var data = [];
    try {
        var response = await axios.get('https://api.openweathermap.org/geo/1.0/direct?q=' + city + "," + countrycode + '&limit=1&appid=' + secrets[2]);
        data.push(response.data[0].lon);
        data.push(response.data[0].lat);
        return data;
    } catch (error) {
        console.error(error);
    }
}
