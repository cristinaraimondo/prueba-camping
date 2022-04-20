const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true
  },
  provincia: {
    type: String,
    required: true
  }
});

// Indexo univacamente nombre+provincia para que actuen como clave compuesta
schema.index({ nombre: 1, provincia: 1 }, { unique: true });

module.exports = mongoose.model('localidades', schema);
