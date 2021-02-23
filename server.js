'use strict';

// require statement (importing packages).
const express = require('express');
const cors = require('cors');
const pg = require('pg');

// initializations and configurations of the packages.
const app = express();
require('dotenv').config();
app.use(cors());
const PORT = process.env.PORT;

const superagent = require('superagent');
const { query } = require('express');
const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

// ROUTES HANDLERS 
app.get('/location', handleLocation);
app.get('/weather', handleWeather);
app.get('/parks', handleParks)
app.get('*', handleWrongPath)


// Handler functions

function handleLocation(req, res) {
    try {
        let searchQuery = req.query.city;
        getLocationData(searchQuery, res).then(data => {
            res.status(200).send(data);
        })
    } catch (error) {
        res.status(500).send('An error occurred ' + error)
    }
}

function handleWeather(req, res) {
    try {
        req.query;
        getWeatherData(res).then(info => {
            res.status(200).send(info);
        });
    } catch (error) {
        res.status(500).send('An error occurred ' + error)
    }
}

function handleParks(req, res) {
    req.query;
    getParksData(res).then(data => {
        res.status(200).send(data)
    })
}

// Handle data functions


function getLocationData(searchQuery, res) {
    // get the data array from the API



    const query = {
        key: process.env.GEOCODE_API_KEY,
        q: searchQuery,
        limit: '1',
        format: 'json'
    }

    let url = 'https://us1.locationiq.com/v1/search.php';
    return superagent.get(url).query(query).then(data => {
        try {
            console.log(data.body);
            let longitude = data.body[0].lon;
            let latitude = data.body[0].lat;
            let displayName = data.body[0].display_name;

            let responseObject = new CityLocation(searchQuery, displayName, latitude, longitude);
            // console.log(responseObject);

            let dbQuery = `INSERT INTO city_location(city_name,longitude,latitude) VALUES ($1,$2,$3) RETURNING *`;
            let safeValues = [displayName, longitude, latitude];

            client.query(dbQuery, safeValues).then(data => {
                console.log('data returned back from db ', data.rows);
            }).catch(error => {
                console.log('error ' + error);
            })

            return responseObject;
        } catch (error) {
            res.status(500).send('An error occurred ' + error);
        }

    }).catch(error => {
        res.status(500).send('An error occurred while getting the data from API ' + error);
    })
}

function getWeatherData(res) {

    const query = {
        key: process.env.WEATHER_API_KEY,
        lat: '35.7796',
        lon: '-78.6382',
        days: '3'
    }

    let url = 'https://api.weatherbit.io/v2.0/forecast/daily';

    return superagent.get(url).query(query).then(info => {
        try {
            let arrayOfWeatherAndDate = info.body.data.map(element => {
                let forecast = element.weather.description;
                // console.log(forecast);
                let date = element.datetime;
                // console.log(date);
                let newDateFormat = new Date(date).toString().slice(' ', 15);
                return new CityWeather(forecast, newDateFormat);
            })
            return arrayOfWeatherAndDate;
        } catch (error) {
            res.status(500).send('an error occurred while getting data from API ' + error);
        }

    }).catch(error => {
        res.status(500).send(error);
    })
}

function getParksData(res) {
    // const query = {
    //     key: process.env.PARKS_API_KEY,
    //     parkCode: '200',
    //     limit: '4',
    //     q: 'seattle'
    // }
    let url = "https://developer.nps.gov/api/v1/parks?parkCode=200&limit=4&api_key=N1og32F6bjJp7kZ4eePVpz0tWTj8OxNq4t0Effvg&q=seattle";

    return superagent.get(url).then(info => {
        try {
            let arrayOfParksInfo = info.body.data.map(element => {
                let name = element.fullName;
                let description = element.description;
                let fees = element.fees;
                let address = element.addresses[0];
                let url = element.url

                // console.log({name},{address},{url},{fees},{description});
                return new ParkInfo(name, address, fees, description, url);
            })
            console.log(arrayOfParksInfo);
            return arrayOfParksInfo;
        } catch (error) {
            res.status(500).send('an error occurred while getting data from API ' + error);
        }

    }).catch(error => {
        res.status(500).send(error);
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

function ParkInfo(name, address, fees, description, url) {
    this.name = name;
    this.address = address;
    this.fees = fees;
    this.description = description;
    this.url = url;
}

// app.listen(PORT, () => {
//     console.log('this app is listening on port ' + PORT);
// });

client.connect().then(() => {
    app.listen(PORT, () => {
        console.log('this app is listening on port ' + PORT);
    });
}).catch(error => {
    console.log('An error occurred while getting data from the database ' + error);
})


