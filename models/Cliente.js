const mongoose = require('mongoose');

// Les saco los _id al subesquema
const LocalidadSubSchema = { ...require('./Localidad').schema, _id: false };

const schema = new mongoose.Schema({
  dni: {
    type: String,
    required: true,
    unique: true
  },
  nombre: {
    type: String,
    required: true
  },
  apellido: {
    type: String,
    required: true
  },
  aviso: {
    type: String,
    default: ''
  },
  localidad: {
    type: LocalidadSubSchema,
    required: true
  },
  vehiculo: {
    dominio: { type: String, default: '' },
    marca: { type: String, default: '' }
  }
});

module.exports = mongoose.model('cliente', schema);
