const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  numero: {
    type: Number,
    required: true,
    unique: true
  },
  capacidad: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('dormis', schema);
