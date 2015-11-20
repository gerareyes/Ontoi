var should = require('should');
var assert = require('assert');
var config = require('../config');
var request = require('supertest');
var mongoose = require('mongoose');

var User = require('../app/models/User');

describe('UserLogin', function() {
  var url = 'http://localhost:' + config.port;

  before(function(done) {
    mongoose.connect(config.database);              
    done();
  });

  describe('Bad login', function() {
    it('Try to login with wrong username', 
      function(done) {

        var user = new User({
          Email      : "tdd2@ontoi.com",  // set the User Sexo (comes from the request)
          Password  : "123"  // set the User Sexo (comes from the request)
        });

        request(url)
          .post('/api/users/login')
          .send(user)
            // end handles the response
          .end(function(err, res) {
            if (err) {
              throw err;
            }
            
            res.body.should.have.property('response_message').be.equal('Authentication failed. User not found.');
            done();
          });
    });

    it('Try to login with wrong password', 
      function(done) {

        var user = new User({
          Email      : "tdd@ontoi.com",  // set the User Sexo (comes from the request)
          Password  : "123"  // set the User Sexo (comes from the request)
        });

        request(url)
          .post('/api/users/login')
          .send(user)
            // end handles the response
          .end(function(err, res) {
            if (err) {
              throw err;
            }
            
            res.body.should.have.property('response_message').be.equal('Authentication failed. Wrong password.');
            done();
          });
    });
  });

  describe('Successfully login', function() {
    it('Try to login with the correct username and password', 
      function(done) {

        var user = new User({
          Email      : "tdd@ontoi.com",  // set the User Sexo (comes from the request)
          Password  : "ontoi_tdd"  // set the User Sexo (comes from the request)
        });

        request(url)
          .post('/api/users/login')
          .send(user)
            // end handles the response
          .end(function(err, res) {
            if (err) {
              throw err;
            }
            
            res.body.should.have.property('response_message').be.equal('User successfully authenticated.');
            done();
          });
    });
  });

  after(function(done) {
    mongoose.connection.close();
    done();
  });

});