var express = require('express');

module.exports = (function() {
  'use strict';
  
  var jwt     = require('jsonwebtoken');
  var router  = express.Router();
  var UsersApi = require('./UsersRout');

  // middleware to use for all places requests
  router.use('/places', function(req, res, next) {
    var token = req.query.token || req.headers['x-access-token'];

    if (token) {
      // verifies secret and checks exp
      jwt.verify(token, app.get('superSecret'), function(err, decoded) {
        if (err) {
          return res.json({ response_code: 1, response_status: 'error', response_message: 'Failed to authenticate token.' });    
        } else {
          // if everything is good, save to request for use in other routes
          req.decoded = decoded;    
          next();
        }
      });

    } else {
      // if there is no token return an error
      return res.status(403).send({ 
        response_code: 1, 
        response_status: 'error', 
        response_message: 'No token provided.' 
      });
    }

  });

  router.get('/', function(req, res) {
    res.json({ response_code: 0, response_status: 'success', response_message: 'Ontoi API is working.' });   
  });

  router.use('/users', UsersApi);

  return router;
})();

