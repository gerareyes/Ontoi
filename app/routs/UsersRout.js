var express = require('express');

module.exports = (function() {
  'use strict';

  var router  = express.Router();
  var config  = require('../../config');
  var jwt     = require('jsonwebtoken');
  var User    = require('../../app/models/User');

  router.use('/register', function(req, res, next) {
    if (!req.body.Nombre || !req.body.Edad || !req.body.Email || !req.body.Password) {
      res.send({ response_code: 1, response_status: 'error', response_message: 'Missing required information'});
    }
    else {
      User.findOne({ Email: req.body.Email }, 
        function(err, user) {

          if (err) throw err;

          if (user) {
            res.json({ response_code: 1, response_status: 'error', response_message: 'User already exist.'});
          }
          else {
            next();
          }
      });
    }
  });

  router.route('/register')

    // register a user (accessed at POST http://localhost:8080/api/users/register)
    .post(function(req, res) {
      // create a new instance of the User model
      var user = new User({
        Nombre    : req.body.Nombre,  // set the User Nombre (comes from the request)
        Apellido  : req.body.Apellido,  // set the User Apellido (comes from the request)
        Edad      : req.body.Edad,  // set the User Edad (comes from the request)
        Email     : req.body.Email,  // set the User Email (comes from the request)
        Sexo      : req.body.Sexo,  // set the User Sexo (comes from the request)
        Password  : req.body.Password  // set the User Sexo (comes from the request)
      });

      // save the user and check for errors
      user.save(function(err) {
        if (err)
          res.send({ response_code: 1, response_status: 'error', response_message: 'Missing required information'});

        res.json({ response_code: 0, response_status: 'success', response_message: 'User successfully created'});
      });
    })
  ;

  router.route('/login')

    .post(function(req, res) {

      User.findOne({ Email: req.body.Email }, 
        function(err, user) {
          
          if (err) throw err;

          if (!user) {
            res.json({ response_code: 1, response_status: 'error', response_message: 'Authentication failed. User not found.'});
          } 
          else if (user) {
            if (user.Password !== req.body.Password) {
              res.json({ response_code: 1, response_status: 'error', response_message: 'Authentication failed. Wrong password.' });
            } 
            else {
              var 
                tokensExpired = [ ],
                isExpired = false,
                timeNow = Math.floor(Date.now() / 1000)
              ; 
              while(token = user.TokensExpired.pop()) {
                var decoded = jwt.decode(token);
                if (timeNow < decoded.exp) {
                  tokensExpired.push(token);
                }
              }

              user.TokensExpired = tokensExpired;
              user.save();

              var token = jwt.sign({
                Email: user.Email, 
                Nombre: user.Nombre,
                Apellido: user.Apellido
              }, config.secret, { expiresIn: '24h' });

              // return the information including token as JSON
              res.json({
                response_code: 0,
                response_status: 'success',
                response_message: 'User successfully authenticated.',
                token: token
              });
            }
          }

      });

    })
  ;

  router.route('/logout')

    .post(function(req, res) {
      var token = req.query.token || req.headers['x-access-token'];

      if (token) {
        // verifies secret and checks exp
        jwt.verify(token, config.secret, function(err, decoded) {
          if (err) {
            return res.json({ response_code: 1, response_status: 'error', response_message: 'Failed to authenticate token.' });    
          } else {
            // if everything is good, save to request for use in other routes
            User.findOneAndUpdate({ Email: decoded.Email }, { $addToSet: { TokensExpired: token } }, 
              { safe: true, upsert: false }, 
              function (err, result) {
                res.json({
                  response_code: 0,
                  response_status: 'success',
                  response_message: 'You have been safely logged out.'
                });
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
    })

  ;
  return router;
})();