// app/models/User.js

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var BlackListSchema   = new Schema({
  Nombre: {
    type: String,
    require: true
  },
  Apellido: {
    type: String
  },
  Edad: {
    type: Number,
    require: true
  },
  Email: {
    type: String,
    lowercase: true,
    require: true
  },
  Sexo: {
    type: String,
    lowercase: true
  },

  Password: {
    type: String,
    require: true
  }
});

module.exports = mongoose.model('BlackList', BlackListSchema);