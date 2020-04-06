'use strict';
// Load Environment Variables from the .env file
require('dotenv').config();
// Application Dependencies
const express = require('express');
const cors = require('cors');

// Application Setup
const PORT = process.env.PORT || 4000;
const app = express();
const superagent = require('superagent');
app.use(cors());
// API Routes
app.get('/', (request, response) => {
  response.status(200).send('It Works!');
});
// app.get('/bad', (request, response) => {
//   throw new Error('oh nooooo!');
// });
app.get('/location', locationHandler);
function locationHandler(request, response) {
  const city = request.query.city;
  superagent(
    `https://eu1.locationiq.com/v1/search.php?key=${process.env.GEOCODE_API_KEY}&q=${city}&format=json`
  )
    .then((res) => {
      const geoData = res.body;
      const locationData = new Location(city, geoData);
      response.status(200).json(locationData);
    })
    .catch((err) => errorHandler(err, request, response));
}

app.get('/weather', weatherHandler());
function weatherHandler(request, response) {
  superagent(
    `https://api.weatherbit.io/v2.0/forecast/daily?city=${request.query.search_query}&key=${process.env.WEATHER_API_KEY}`
  )
    .then((weatherRes) => {
      console.log(weatherRes);
      const weatherSummaries = weatherRes.body.data.map((val) => {
        return new Weather(val);
      });
      response.status(200).json(weatherSummaries);
    })
    .catch((err) => errorHandler(err, request, response));
}

app.use('*', notFoundHandler);
//The constructor function of the Location
function Location(city, geoData) {
  this.search_query = city;
  this.formatted_query = geoData[0].display_name;
  this.latitude = geoData[0].lat;
  this.longitude = geoData[0].lon;
}
//The constructor function of the Weather
function Weather(city,val){
  this.forecast=val.weather.description;
  this.time= new Date (val.valid_date).toString().slice(0,15);
}
// HELPER FUNCTIONS
function notFoundHandler(request, response) {
  response.status(404).send('NOT FOUND!!');
}
function errorHandler(error, request, response) {
  response.status(500).send(error);
}
// Make sure the server is listening for requests
app.listen(PORT, () => console.log(`the server is up and running on ${PORT}`));
