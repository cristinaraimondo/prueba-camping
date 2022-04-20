const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  nombre: {
    type: String,
    required: true
  },
  rol: {
    type: String,
    default: 'operador',
    required: true
  },
  password: {
    type: String,
    default: ''
  },
  tienePassword: {
    type: Boolean,
    default: false,
    required: true
  },
  estaActivo: {
    type: Boolean,
    default: true,
    required: false
  }
});

module.exports = mongoose.model('usuarios', schema);
