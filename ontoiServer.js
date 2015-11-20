// OntoiServer2.js

// BASE SETUP
// =============================================================================

// Required the packages.
var express    = require('express');
var bodyParser = require('body-parser');
var mongoose   = require('mongoose');
var config     = require('./config');
var router     = require('./app/routs/RoutConfiguration');
var app        = express();

var port = process.env.PORT || 8080;    // set port.

mongoose.connect(config.database);      // Connect to database.

app.set('superSecret', config.secret);  // secret variable.
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Ontoi API on port ' + port);