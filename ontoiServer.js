// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express(); // define our app using express
var bodyParser = require('body-parser');
var mongoose   = require('mongoose');
var jwt        = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config     = require('./config'); // get our config file

var Place         = require('./app/models/Place');
var User          = require('./app/models/User');
var UserPlaceRate = require('./app/models/UserPlaceRate');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port
mongoose.connect(config.database);
app.set('superSecret', config.secret); // secret variable

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

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
    // if there is no token
    // return an error
    return res.status(403).send({ 
      response_code: 1, 
      response_status: 'error', 
      response_message: 'No token provided.' 
    });
  }

});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });   
});

// more routes for our API will happen here

// on routes that end in /bears
// ----------------------------------------------------
router.route('/users/register')

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

router.route('/users/login')

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
            var token = jwt.sign(user, app.get('superSecret'), {
              expiresInMinutes: 1440 // expires in 24 hours
            });

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

router.route('/users/logout')

;

router.route('/places/nearby')

  .get(function(req, res) {
    res.json(req.decoded);
  })

;

router.route('/places/:place_id/rate')

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

router.route('/places/add')

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

// on routes that end in /bears/:bear_id
// ----------------------------------------------------
// router.route('/bears/:bear_id')

//     // get the bear with that id (accessed at GET http://localhost:8080/api/bears/:bear_id)
//     .get(function(req, res) {
//         Bear.findById(req.params.bear_id, function(err, bear) {
//             if (err)
//                 res.send(err);
//             res.json(bear);
//         });
//     })

//     .put(function(req, res) {

//         // use our bear model to find the bear we want
//         Bear.findById(req.params.bear_id, function(err, bear) {

//             if (err)
//                 res.send(err);

//             bear.name = req.body.name;  // update the bears info

//             // save the bear
//             bear.save(function(err) {
//                 if (err)
//                     res.send(err);

//                 res.json({ message: 'Bear updated!' });
//             });

//         });
//     })

//     .delete(function(req, res) {
//         Bear.remove({
//             _id: req.params.bear_id
//         }, function(err, bear) {
//             if (err)
//                 res.send(err);

//             res.json({ message: 'Successfully deleted' });
//         });
//     })
// ;


// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);