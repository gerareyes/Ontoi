var express = require('express');

module.exports = (function() {
  'use strict';

  var router  = express.Router();
  var config  = require('../../config');
  var jwt     = require('jsonwebtoken');
  var mongoose = require('mongoose');

  var User    = require('../../app/models/User');
  var Place   = require('../../app/models/Place');
  var UserPlaceRate   = require('../../app/models/UserPlaceRate');

  // middleware to use for all places requests
  router.use('/', function(req, res, next) {
    var token = req.query.token || req.headers['x-access-token'];

    if (token) {
      // verifies secret and checks exp
      jwt.verify(token, config.secret, function(err, decoded) {
        if (err) {
          return res.json({ response_code: 1, response_status: 'error', response_message: 'Failed to authenticate token.' });
        } else {
          User.findOne({ TokensExpired: {$in:[token]} }, function(err, user) {
            if (user) {
              return res.json({ response_code: 1, response_status: 'error', response_message: 'Failed to authenticate token.' });
            }
            else {
              // if everything is good, save to request for use in other routes
              req.decoded = decoded;    
              next();
            }
          });
          
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

  router.route('/nearby')
    .get(function(req, res) {
      res.json(req.decoded);
    })
  ;

  router.route('/add')

    .post(function(req, res) {

      var place = new Place({
        Nombre      : req.body.Nombre,  // set the User Nombre (comes from the request)
        Descripcion : req.body.Descripcion,  // set the User Apellido (comes from the request)
        Ubicacion   : req.body.Ubicacion,  // set the User Edad (comes from the request)
      });

      // save the place and check for errors
      place.save(function(err) {
          if (err)
              res.send({ response_code: 1, response_status: 'error', response_message: 'Missing required information'});

          res.json({ response_code: 0, response_status: 'success', response_message: 'Place successfully created'});
      });

    })

  ;

  router.route('/:place_id/rate')

    .put(function(req, res) {
      var isValidObjectId = new RegExp("^[0-9a-fA-F]{24}$");

      if (!isValidObjectId.test(req.params.place_id)) {
        res.send({ response_code: 1, response_status: 'error', response_message: "Invalid Place." });
      }
      else {
        if (isNaN(req.body.Rate)) {
          res.send({ response_code: 1, response_status: 'error', response_message: 'Only numbers are allowed.' });
        }
        else if (req.body.Rate < 0 || req.body.Rate > 5) {
          res.send({ response_code: 1, response_status: 'error', response_message: 'Only a number between 0-5 is allowed.' });
        }
        else {
          var _id = mongoose.Types.ObjectId(req.params.place_id);
          var userPlaceRate = new UserPlaceRate({
              Nombre: req.decoded.Nombre,
              Apellido: req.decoded.Apellido,
              Email: req.decoded.Email,
              Rate: req.body.Rate
            });
          Place.findByIdAndUpdate({ _id: _id }, { $addToSet: { Rate: userPlaceRate } }, { safe: true, upsert: true }, function (err, result) {
            if (err)
              res.send({ response_code: 1, response_status: 'error', response_message: 'Missing required information'});

            res.json({ response_code: 0, response_status: 'success', response_message: 'Place successfully rated'});
          });
        }
      }
    })
  ;

  return router;
})();