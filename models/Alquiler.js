const mongoose = require('mongoose');

// Les saco los _id a los subesquemas
const ClienteSubschema = { ...require('./Cliente').schema, _id: false };
const DormiSubschema = { ...require('./Dormi').schema, _id: false };

const schema = new mongoose.Schema({
  fechaVenta: {
    type: Date,
    required: true,
    index: true
  },
  fechaInicio: {
    type: Date,
    required: true
  },
  diaInicio: {
    type: String,
    required: true
  },
  dias: {
    type: Number,
    required: true
  },
  cliente: {
    type: ClienteSubschema,
    required: true
  },
  alquilable: {
    type: String,
    required: true
  },
  accion: {
    type: String,
    required: true
  },
  pagan: {
    type: Number,
    required: true
  },
  ingresan: {
    type: Number,
    required: true
  },
  importe: {
    type: Number,
    required: true
  },
  formaDePago: {
    type: String,
    required: true
  },
  usuario: {
    type: String,
    required: true
  },
  dormi: {
    type: DormiSubschema,
    required: false
  },
  origen: {
    type: String,
    required: false
  },
  noVigente: {
    type: Boolean,
    required: false,
  },
});

module.exports = mongoose.model('alquileres', schema);
