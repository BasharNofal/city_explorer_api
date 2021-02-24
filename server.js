'use strict';

// require statement (importing packages).
const express = require('express');
const cors = require('cors');
const pg = require('pg');
let longitude = 0;
let latitude = 0;
let searchQuery = '';
let offset = 0;
let limit = 5;

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
app.get('/parks', handleParks);
app.get('/movies',handleMovies);
app.get('/yelp',handleYelp);

app.get('*', handleWrongPath);


// Handler functions

function handleLocation(req, res) {
    try {
        searchQuery = req.query.city;        // console.log(req.query);
        getLocationData(searchQuery, res).then(data => {
            res.status(200).send(data);
        })
    } catch (error) {
        res.status(500).send('An error occurred ' + error)
    }
}

function handleWeather(req, res) {
    try {
        // console.log('weather query ',req.query.city);
        getWeatherData(res).then(data => {
            res.status(200).send(data);
        });
    } catch (error) {
        res.status(500).send('An error occurred ' + error)
    }
}

function handleParks(req, res) {
    getParksData(res).then(data => {
        res.status(200).send(data);
    })
}

function handleMovies(req,res) {
    getMoviesData(res).then(data=>{
        res.status(200).send(data);
    })
}

function handleYelp(req,res) {
    getYelpData(res).then(data =>{
        res.status(200).send(data);
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
            // console.log(data.body);
            let longitude = data.body[0].lon;
            let latitude = data.body[0].lat;
            let displayName = data.body[0].display_name;

            let responseObject = new CityLocation(searchQuery, displayName, latitude, longitude);
            // console.log(responseObject);
            // console.log(locationArray);

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
        lat: latitude,
        lon: longitude,
        days: '10'
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
    const query = {
        parkCode: '200',
        api_key: process.env.PARKS_API_KEY,
        limit: '4',
        q: searchQuery
    }
    console.log(searchQuery);
    let url = "https://developer.nps.gov/api/v1/parks";

    return superagent.get(url).query(query).then(info => {
        try {
            // console.log(info.body);
            let arrayOfParksInfo = info.body.data.map(element => {
                let name = element.fullName;
                let description = element.description;
                let fees = element.fees[0];
                let address = element.addresses[0];
                let url = element.url

                // console.log({name},{address},{url},{fees},{description}, 'parkks');
                // console.log(new ParkInfo(name, address, fees, description, url));
                return new ParkInfo(name, address, fees, description, url);
            })
            // console.log(arrayOfParksInfo);
            return arrayOfParksInfo;
        } catch (error) {
            res.status(500).send('an error occurred while getting data from API ' + error);
        }

    }).catch(error => {
        res.status(500).send(error);
    })
}

function getMoviesData(res) {
    const query = {
        api_key: process.env.MOVIE_API_KEY,
        query: searchQuery
    }
    // console.log(searchQuery);
    let url = 'https://api.themoviedb.org/3/search/movie?'
    
    return superagent.get(url).query(query).then(info=>{
        try {
            // console.log(info.body);
            let arrayOfMoviesInfo = info.body.results.map(element => {
                let name = element.original_title;
                let overview = element.overview;
                let voteAverage = element.vote_average;
                let voteCount = element.vote_count;
                let imageUrl = element.poster_path;
                let popularity = element.popularity;
                let releaseDate = element.release_date; 

                return new MoviesInfo(name, overview, voteAverage, voteCount, imageUrl, popularity, releaseDate);
            })
            // console.log(arrayOfMoviesInfo);
            return arrayOfMoviesInfo;
        } catch (error) {
            res.status(500).send('an error occurred while getting data from API ' + error);
        }

    }).catch(error => {
        res.status(500).send(error);
    })
}

function getYelpData(res) {

    const query = {
        location: searchQuery,
        term: 'restaurants',
        offset:offset,
        limit:5,
    }
    let url= 'https://api.yelp.com/v3/businesses/search'
    
    return superagent.get(url).set('Authorization',`Bearer ${process.env.YELP_API_KEY}`).query(query).then(data=>{
        try {
            // console.log(info.body);
            let arrayOfYelpInfo = data.body.businesses.map(element => {
                let name = element.name;
                let imageUrl = element.image_url;
                let url = element.url;
                let price = element.price;
                let rating = element.rating; 

                return new YelpInfo(name, imageUrl, price, rating, url);
            })
            offset += 5;

            // console.log(offset,limit);
            // console.log(arrayOfYelpInfo);
            return arrayOfYelpInfo;
        } catch (error) {
            res.status(500).send('an error occurred while getting data from API ' + error);
        }

    }).catch(error => {
        res.status(500).send(error);
    })
}
// WRONG PATH HANDLING FUNCTION

function handleWrongPath(req,res) {
    res.status(404).send('THE PATH THAT YOU TRYING TO REACH DOES NOT EXIST ');
}


// Constructors
function CityLocation(searchQuery, displayName, lat, lon) {
    this.search_query = searchQuery;
    this.formatted_query = displayName;
    this.latitude = lat;
    this.longitude = lon;
    latitude = lat;
    longitude = lon;
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

function MoviesInfo(name, overview, voteAverage, voteCount, imageUrl, popularity, releaseDate) {
    this.title = name;
    this.overview = overview;
    this.average_votes = voteAverage;
    this.total_votes = voteCount;
    this.image_url = imageUrl;
    this.popularity = popularity;
    this.released_on = releaseDate;
}

function YelpInfo(name, imageUrl, price, rating, url) {
    this.name = name;
    this.image_url = imageUrl;
    this.price = price; 
    this.rating = rating;
    this.url = url
}

app.listen(PORT, () => {
    console.log('this app is listening on port ' + PORT);
});

// client.connect().then(() => {
//     app.listen(PORT, () => {
//         console.log('this app is listening on port ' + PORT);
//     });
// }).catch(error => {
//     console.log('An error occurred while getting data from the database ' + error);
// })


