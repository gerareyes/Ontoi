module.exports = function (req, res) {
  var config  = require('../../../config');
  var jwt     = require('jsonwebtoken');
  var User    = require('../../../app/models/User');

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
          var token = jwt.sign(user, config.secret, {
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
};