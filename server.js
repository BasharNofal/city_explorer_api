'use strict';

// require statement (importing packages).
let express = require('express');
const cors = require('cors');
// initializations and configurations of the packages.
let app = express();
require('dotenv').config();
app.use(cors());
const PORT = process.env.PORT;

// ROUTES HANDLERS 

app.get('/location', handleLocation);
app.get('/weather', handleWeather);
app.get('*', handleWrongPath)


// Handler functions

function handleLocation(req, res) {
    try {
        let searchQuery = req.query.city;
        let locationObject = getLocationData(searchQuery);
        res.status(200).send(locationObject);
    } catch (error) {
        res.status(500).send('An error occurred ' + error)
    }
}

function handleWeather(req, res) {
    try {
        let searchQuery = req.query;
        let weatherAndDateObject = getWeatherData();
        res.status(200).send(weatherAndDateObject);
    } catch (error) {
        res.status(500).send('An error occurred '+ error)
    }
}


// Handle data functions

function getWeatherData(searchQuery) {

    let locationWeatherAndDate = require('./data/weather.json');
    let arrayOfWeatherAndDate = locationWeatherAndDate.data.map(element => {

        let forecast = element.weather.description;
        let date = element.datetime;
        // console.log(date);
        let newDateFormat = new Date(date).toString().slice(' ', 15);
        return new CityWeather(forecast, newDateFormat);
        // console.log(forecast);
    });
    console.log(arrayOfWeatherAndDate);
    return arrayOfWeatherAndDate;
}

function getLocationData(searchQuery) {
    // get the data array from the json    
    let locationData = require('./data/location.json');

    // Get values for object
    let longitude = locationData[0].lon;
    let latitude = locationData[0].lat;
    let displayName = locationData[0].display_name;

    // Create data object
    let responseObject = new CityLocation(searchQuery, displayName, latitude, longitude);
    return responseObject;
}


// WRONG PATH HANDLING FUNCTION

function handleWrongPath(req, res) {
    res.status(404).send('THE PATH THAT YOU TRYING TO REACH DOES NOT EXIST ');
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

