'use strict';

//  In this step i load the Environment Variables from the .env file
require('dotenv').config();

// Dependencies
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
//  Setup My Application
const PORT = process.env.PORT;
const app = express();
app.use(cors());

app.get('/', (request, response) => {
  response.send('Home Page!');
});

// Route Definitions
app.get('/location', locationHandler);
app.get('/weather', weatherHandler);
app.get('/trails',trailsHandler);
app.use('*', notFoundHandler);
app.use(errorHandler);

// Route Handlers
function locationHandler(request, response) {
  const city = request.query.city;
  let key = process.env.GEOCODE_API_KEY;
  superagent(
    `https://eu1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json`
  )
    .then((res) => {
      const geoData = res.body;
      const locationData = new Location(city, geoData);
      response.status(200).json(locationData);
    })
    .catch((err) => errorHandler(err, request, response));
}

function Location(city, geoData) {
  this.search_query = city;
  this.formatted_query = geoData[0].display_name;
  this.latitude = geoData[0].lat;
  this.longitude = geoData[0].lon;
}

function weatherHandler(request, response) {
  let key2 = process.env.WEATHER_API_KEY;
  superagent(
    `https://api.weatherbit.io/v2.0/forecast/daily?city=${request.query.search_query}&key=${key2}`
  )
    .then((weatherRes) => {
      console.log(weatherRes);
      const weatherSummaries = weatherRes.body.data.map((day) => {
        return new Weather(day);
      });
      response.status(200).json(weatherSummaries);
    })
    .catch((err) => errorHandler(err, request, response));
}

function Weather(day) {
  this.forecast = day.weather.description;
  this.time = new Date(day.valid_date).toString().slice(0, 15);
}

function trailsHandler(request,response){
  let lat = request.query.latitude;
  let lon = request.query.longitude;
  let key3 = process.env.TRAIL_API_KEY;

  superagent(
    `https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lon}&maxDistance=10&key=${key3}`
  )
    .then((trailsRes)=>{
      const trailsSummaries = trailsRes.body.trails.map((val)=>{
        return new Trails (val);
      });
      response.status(200).json(trailsSummaries);})
    .catch((err)=> errorHandler(err, request, response));
}
function Trails (val){
  this.name = val[0].name;
  this.location = val[0].location;
  this.length = val[0].length;
  this.stars = val[0].stars;
  this.star_votes = val[0].starVotes;
  this.summary = val[0].summary;
  this.trail_url = val[0].url;
  this.conditions = val[0].conditionDetails;
  this.condition_date = new Date (val[0].conditionDate).toString().slice(3,14);
  this.condition_time = new Date (val[0].conditionDate).toString().slice(15,24);
}

function notFoundHandler(request, response) {
  response.status(404).send('404 NOT FOUND');
}

function errorHandler(error, request, response) {
  response.status(500).send(error);
}

// Make sure the server is listening for requests
app.listen(PORT, () => console.log(`App is listening on ${PORT}`));
