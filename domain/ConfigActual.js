// @ts-check
const ConfigOtrosModel = require('../models/ConfigOtros');
const fechaMasDias = require('../utils/fechaMasDias');

// Este creo un wrapper objeto Precios de la base de datos para poder mandarle mensajes
class ConfigActual {
  constructor() {
    this.config = null; // No debe ser llamada en el constructor
  }

  update() {
    ConfigOtrosModel.findOne().then(res => (this.config = res));
  }

  maxFechaAlquilabilidad() {
    return fechaMasDias(new Date(), this.config.maxDiasAlquilabilidad);
  }
  maxDiasAlquiler() {
    return this.config.maxDiasAlquiler;
  }
}

module.exports = new ConfigActual();
