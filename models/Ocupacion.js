const mongoose = require('mongoose');

//IMPORTANTE: el nombre de los campos alquilables se corresponden con sharedConstantes.ALQUILABLES
const schema = new mongoose.Schema({
  fecha: {
    type: Date,
    required: true,
    unique: true
  },
  dormi: [
    {
      numero: Number,
      alquiler: { type: mongoose.Schema.Types.ObjectId },
      _id: false
    }
  ],
  parcela: [
    {
      numero: Number,
      alquiler: { type: mongoose.Schema.Types.ObjectId },
      _id: false
    }
  ],
  quincho: [
    {
      numero: Number,
      alquiler: { type: mongoose.Schema.Types.ObjectId },
      _id: false
    }
  ],
  contingente: [
    {
      numero: Number,
      alquiler: { type: mongoose.Schema.Types.ObjectId },
      _id: false
    }
  ]
});

module.exports = mongoose.model('ocupaciones', schema);
