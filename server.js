'use strict';

// require statement (importing packages).
let express = require('express');
const cors = require('cors');
// initializations and configurations of the packages.
let app = express();
require('dotenv').config();
app.use(cors());
const PORT = process.env.PORT;

// 
app.get('/location', handleLocation);
app.get('/weather', handleWeather);

// console.log(1);
function handleWeather(req, res) {
    let searchQuery = req.query;
    let weatherAndDateObject = getWeatherData();
    res.status(200).send(weatherAndDateObject);
}

function getWeatherData(searchQuery){

    let arrayOfWeatherAndDate=[];
    let locationWeatherAndDate = require('./data/weather.json');
    
    locationWeatherAndDate.data.forEach(element => {
        
        let forecast = element.weather.description;
        let date = element.datetime;
        console.log(date);
        let newDateFormat = new Date(date).toString().slice(' ',15);
        let newObject = new CityWeather(forecast, newDateFormat);
        console.log(forecast);

        arrayOfWeatherAndDate.push(newObject);
        console.log(arrayOfWeatherAndDate);
    });
    return arrayOfWeatherAndDate;
}



// Handler functions
function handleLocation(req, res) {
    let searchQuery = req.query.city;
    let locationObject = getLocationData(searchQuery);
    res.status(200).send(locationObject);
}

// Handle data function
function getLocationData(searchQuery) {
    // get the data array from the json   
    console.log(1); 
    let locationData = require('./data/location.json');

    // Get values for object
    let longitude = locationData[0].lon;
    let latitude = locationData[0].lat;
    let displayName = locationData[0].display_name;

    // Create data object
    let responseObject = new CityLocation(searchQuery, displayName, latitude, longitude);
    return responseObject;
}

// Constructors
function CityLocation(searchQuery, displayName, lat, lon) {
    this.search_query = searchQuery;
    this.formatted_query = displayName;
    this.latitude = lat;
    this.longitude = lon;
}

function CityWeather(forecast, date) {
    this.forecast = forecast;
    this.time = date;
}

app.listen(PORT, () => {
    console.log('this app is listening on port ' + PORT);
});
