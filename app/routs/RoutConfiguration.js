var express = require('express');

module.exports = (function() {
  'use strict';
  
  var router  = express.Router();
  var UsersRout = require('./UsersRout');
  var PlacesRout = require('./PlacesRout');

  router.get('/', function(req, res) {
    res.json({ response_code: 0, response_status: 'success', response_message: 'Ontoi API is working.' });   
  });

  router.use('/users', UsersRout);
  router.use('/places', PlacesRout);

  return router;
})();

