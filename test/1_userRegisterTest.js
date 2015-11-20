var should = require('should');
var assert = require('assert');
var config = require('../config');
var request = require('supertest');
var mongoose = require('mongoose');

var User = require('../app/models/User');

describe('UserRegistration', function() {
  var url = 'http://localhost:' + config.port;

  before(function(done) {
    mongoose.connect(config.database);              
    done();
  });

  describe('Missing required information', function() {
    it('should return error trying to save without required information', 
      function(done) {

        var user = new User({
          Nombre    : "ontoi_tdd",  // set the User Nombre (comes from the request)
          Apellido  : "ontoi_tdd",  // set the User Apellido (comes from the request)
          Edad      : 1,  // set the User Edad (comes from the request)
          Sexo      : "",  // set the User Sexo (comes from the request)
          Password  : "ontoi_tdd"  // set the User Sexo (comes from the request)
        });

        request(url)
          .post('/api/users/register')
          .send(user)
            // end handles the response
          .end(function(err, res) {
            if (err) {
              throw err;
            }
            
            res.body.should.have.property('response_message').be.equal('Missing required information.');
            done();
          });

      });
  });

  describe('Registering new user.', function() {
    it('should return success trying to save a user', 
      function(done) {

        var user = new User({
          Nombre    : "ontoi_tdd",  // set the User Nombre (comes from the request)
          Apellido  : "ontoi_tdd",  // set the User Apellido (comes from the request)
          Email     : "tdd@ontoi.com",
          Edad      : 1,  // set the User Edad (comes from the request)
          Sexo      : "",  // set the User Sexo (comes from the request)
          Password  : "ontoi_tdd"  // set the User Sexo (comes from the request)
        });

        request(url)
          .post('/api/users/register')
          .send(user)
            // end handles the response
          .end(function(err, res) {
            if (err) {
              throw err;
            }
            
            res.body.should.have.property('response_message').be.equal('User successfully created.');
            done();
          });

      });
  });

  describe('Duplicate Email', function() {
    it('should return error trying to save duplicate email', 
      function(done) {

        var user = new User({
          Nombre    : "ontoi_tdd",  // set the User Nombre (comes from the request)
          Apellido  : "ontoi_tdd",  // set the User Apellido (comes from the request)
          Edad      : 1,  // set the User Edad (comes from the request)
          Email     : "tdd@ontoi.com",  // set the User Email (comes from the request)
          Sexo      : "",  // set the User Sexo (comes from the request)
          Password  : "ontoi_tdd"  // set the User Sexo (comes from the request)
        });

        request(url)
          .post('/api/users/register')
          .send(user)
            // end handles the response
          .end(function(err, res) {
            if (err) {
              throw err;
            }

            res.body.should.have.property('response_message').be.equal('User already exist.');
            done();
          });

      });
  });

  after(function(done) {
    mongoose.connection.close();
    done();
  });

});