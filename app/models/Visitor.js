// app/models/Visitor.js

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var VisitorSchema   = new Schema({
  Email: {
    type: String
  },
  CheckIn: {
    type: Date
  },
  CheckOut: {
    type: Date
  },
  TimeSpent: {
    type: Number
  }
});

module.exports = mongoose.model('Visitor', VisitorSchema);