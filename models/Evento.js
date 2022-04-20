const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  fecha: {
    type: Date,
    required: true,
    index: true
  },
  username: {
    type: String,
    required: true
  },
  descripcion: {
    type: String,
    required: true
  },
  objeto: {}
});

module.exports = mongoose.model('eventos', schema);
