const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  cantParcelas: {
    type: Number,
    default: 184,
    required: true
  },
  cantQuinchos: {
    type: Number,
    default: 1,
    required: true
  },
  cantContingentes: {
    type: Number,
    default: 20,
    required: true
  },

  maxDiasAlquiler: {
    type: Number,
    default: 14,
    required: true
  },
  maxDiasAlquilabilidad: {
    type: Number,
    default: 30,
    required: true
  }
});

module.exports = mongoose.model('configOtros', schema);
