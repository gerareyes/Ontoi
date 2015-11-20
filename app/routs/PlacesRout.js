var express = require('express');

module.exports = (function() {
  'use strict';

  var router  = express.Router();
  var config  = require('../../config');
  var jwt     = require('jsonwebtoken');
  var mongoose = require('mongoose');

  var User    = require('../../app/models/User');
  var Place   = require('../../app/models/Place');
  var Visitor   = require('../../app/models/Visitor');
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

  router.route('/checkin_count')
    .get(function(req, res) {
      Place.aggregate(
        [
          {$unwind: '$Visitors'},
          {$match: {'Visitors.Email': req.decoded.Email}},
          {$group: {_id:{_id:"$_id", Nombre:"$Nombre", Descripcion:"$Descripcion", Rate:"$Rate", Ubicacion: "$Ubicacion"}, count: {$sum:1}}},
          {$project: {_id:"$_id._id",Nombre:"$_id.Nombre",Descripcion:"$_id.Descripcion", Rate:"$_id.Rate", Ubicacion: "$_id.Ubicacion", count:"$count"}},
          {$sort: {count:1}}
        ],
        function (err, result) {
          res.json({ response_code: 0, response_status: 'success', response_message: result});
        }
      );
    })
  ;

  router.route('/nearby')
    .post(function(req, res) {
      Place.find({
        Ubicacion: {
          $near:{
              $geometry: {type: 'Point', coordinates:[req.body.Longitud, req.body.Latitud]}
          }
        }
      }).limit(5).exec(
      function (err, result) {
        res.json({ response_code: 0, response_status: 'success', response_message: result});
      });
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

  router.use('/:place_id', function(req, res, next) {
    var isValidObjectId = new RegExp("^[0-9a-fA-F]{24}$");

    if (!isValidObjectId.test(req.params.place_id)) {
      res.send({ response_code: 1, response_status: 'error', response_message: "Invalid Place." });
    }
    else {
      next();
    }
  });

  router.route('/:place_id/rate')

    .put(function(req, res) {
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
    })
  ;

  function checkout (objectId, email) {
    Place.findOne( { _id: objectId }, { Visitors: { $elemMatch: { Email: email, CheckOut: null } } }, function (err, result){
      
      if (!result.Visitors.length) {
        return 1;
      }
      else{
        var currentTime = new Date();
        var timeSpent = currentTime - result.Visitors[0].CheckIn;

        Place.update(
          { _id: objectId, "Visitors.CheckOut": null }, 
          {$set:{"Visitors.$.CheckOut": currentTime, "Visitors.$.TimeSpent": timeSpent}},
          function (err, result) {
            return 0;
          }
        );
      }
    });
  }

  router.route('/:place_id/checkout')
    .put(function(req, res) {
      var _id = mongoose.Types.ObjectId(req.params.place_id);

      if (checkout(_id,req.decoded.Email)) {
        res.send({ response_code: 1, response_status: 'error', response_message: 'CheckIn record not found.'});
      }
      else {
        res.json({ response_code: 0, response_status: 'success', response_message: 'Checkout successfully.'});
      }
    })
  ;

  router.route('/:place_id/checkin')
    
    .put(function(req, res) {
      var _id = mongoose.Types.ObjectId(req.params.place_id);

      checkout(_id,req.decoded.Email);

      var visitor = new Visitor({
        Email: req.decoded.Email,
        CheckIn: new Date()
      });

      Place.findByIdAndUpdate({ _id: _id }, { $addToSet: { Visitors: visitor } }, { safe: true, upsert: true }, function (err, result) {
        if (err)
          res.send({ response_code: 1, response_status: 'error', response_message: 'Missing required information'});

        res.json({ response_code: 0, response_status: 'success', response_message: ''});
      });
    })
  ;

  router.route('/:place_id/time_spent')
    
    .get(function(req, res) {
      var _id = mongoose.Types.ObjectId(req.params.place_id);

      Place.aggregate(
        [
          {$match: {_id : _id} },
          {$unwind: '$Visitors'},
          {$match: {'Visitors.Email': req.decoded.Email}},
          {$group:{'_id':'$_id','timeSpent': {'$sum': '$Visitors.TimeSpent'}}}
        ],
        function (err, result) {
          res.json({ response_code: 0, response_status: 'success', response_message: result[0].timeSpent});
        }
      );
    })
  ;

  return router;
})();