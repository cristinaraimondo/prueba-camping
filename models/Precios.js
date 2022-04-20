const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  parcelaAcampar: {
    type: Number,
    required: true,
    default: 160
  },
  personaAcampar: {
    type: Number,
    required: true,
    default: 90
  },
  personaRecreo: {
    type: Number,
    required: true,
    default: 60
  },
  quinchoLocal: {
    type: Number,
    required: true,
    default: 800
  },
  quinchoTurista: {
    type: Number,
    required: true,
    default: 800
  },
  quinchoMunicipal: {
    type: Number,
    required: true,
    default: 400
  },
  quinchoInstitucion: {
    type: Number,
    required: true,
    default: 0
  },
  dormisAcampar: {
    type: [Number],
    required: true,
    default: [380, 540, 760, 920]
  },
  dormisRecreo: {
    type: [Number],
    required: true,
    default: [200, 280, 390, 470]
  }
});

module.exports = mongoose.model('precios', schema);
