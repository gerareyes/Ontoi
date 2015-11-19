// app/models/UserPlaceRate.js

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var UserPlaceRateSchema   = new Schema({
  Nombre: {
    type: String,
    require: true
  },
  Apellido: {
    type: String,
    require: true
  },
  Email: {
    type: String,
    require: true
  },
  Rate: {
    type: Number,
    require: true
  }
});

module.exports = mongoose.model('UserPlaceRate', UserPlaceRateSchema);