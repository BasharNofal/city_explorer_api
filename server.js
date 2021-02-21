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

// Handler functions
function handleLocation (req,res) {
    let searchQuery = req.query.city;
    let locationObject = getLocationData(searchQuery);
    res.status(200).send(locationObject);
}

// Handle data function
function getLocationData (searchQuery){
    // get the data array from the json    
    let locationData = require('./data/location.json');
    
    // Get values for object
    let longitude = locationData[0].lon;
    let latitude = locationData[0].lat;
    let displayName = locationData[0].display_name;
    
    // Create data object
    let responseObject = new CityLocation (searchQuery, displayName, latitude, longitude);
    return responseObject;
} 

// Constructor
function CityLocation (searchQuery, displayName, lat, lon) {
    this.search_query = searchQuery;
    this.formatted_query = displayName;
    this.latitude = lat;
    this.longitude = lon;
}

app.listen(PORT, ()=>{
    console.log('this app is listening on port '+ PORT);
});
