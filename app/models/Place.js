// app/models/Place.js

var mongoose     = require('mongoose');
var UserPlaceRate = require('./UserPlaceRate');
var Schema       = mongoose.Schema;

var PlaceSchema   = new Schema({
  Nombre: {
    type: String,
    require: true
  },
  Descripcion: {
    type: String
  },
  Ubicacion: {
    Latitud: {
      type: Number,
      require: true
    },
    Longitud: {
      type: Number,
      require: true
    }
  },
  Rate: [UserPlaceRate]
});

module.exports = mongoose.model('Place', PlaceSchema);