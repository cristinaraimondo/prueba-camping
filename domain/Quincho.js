// @ts-check
const sharedConstantes = require('../config/sharedConstantes');
const PreciosActuales = require('./PreciosActuales');

class Quincho {
  constructor(origen) {
    this._origen = origen;
    this._nombre = sharedConstantes.STR_QUINCHO;
  }

  nombre() {
    return this._nombre + ' ' + this._origen;
  }

  precioAcampar(dias, pagan) {
    return dias * PreciosActuales.quincho(this._origen);
  }
  precioRecreo(dias, pagan) {
    return null;
  }
  precioAcamparMasRecreo(dias, pagan) {
    return null;
  }
}

module.exports = Quincho;
