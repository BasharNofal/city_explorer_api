'use strict';

// require statement (importing packages).
let express = require('express');
const cors = require('cors');
// initializations and configurations of the packages.
let app = express();
require('dotenv').config();
app.use(cors());
const PORT = process.env.PORT;

let superagent = require('superagent');
// ROUTES HANDLERS 

app.get('/location', handleLocation);
app.get('/weather', handleWeather);
app.get('*', handleWrongPath)


// Handler functions

function handleLocation(req, res) {
    try {
        let searchQuery = req.query.city;
        getLocationData(searchQuery).then(data =>{
            res.status(200).send(data);
        })
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
    // get the data array from the API

    const query = {
        key: process.env.GEOCODE_API_KEY,
        q: searchQuery,
        limit: '1',
        format: 'json'
    }

    let url = 'https://us1.locationiq.com/v1/search.php';
    return superagent.get(url).query(query).then( data =>{
        try {
            let longitude = data.body[0].lon;
            let latitude = data.body[0].lat;
            let displayName = data.body[0].display_name;
            
            let responseObject = new CityLocation(searchQuery, displayName, latitude, longitude);
            console.log(responseObject);
            return responseObject;
        } catch (error) {
            res.status(500).send('An error occurred ' +error);
        }
    
    }).catch(error =>{
        res.status(500).send('An error occurred while getting the data from API ' + error);
    }) 
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

