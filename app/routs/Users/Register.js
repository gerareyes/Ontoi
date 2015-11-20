module.exports = function(req, res) {
  var config  = require('../../../config');
  var jwt     = require('jsonwebtoken');
  var User    = require('../../../app/models/User');
  
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
    
};

