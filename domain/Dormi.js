// @ts-check
const sharedConstantes = require('../config/sharedConstantes');
const PreciosActuales = require('./PreciosActuales');

class Dormi {
  constructor(capacidad) {
    this._capacidad = capacidad;
    this._nombre = sharedConstantes.STR_DORMI;
  }

  nombre() {
    return this._nombre + ' para ' + this._capacidad;
  }

  precioAcampar(dias, pagan) {
    return dias * PreciosActuales.acamparDormiPara(this._capacidad);
  }

  precioRecreo(dias, pagan) {
    return PreciosActuales.recreoDormiPara(this._capacidad);
  }

  precioAcamparMasRecreo(dias, pagan) {
    return this.precioAcampar(dias, pagan) + this.precioRecreo(1, pagan);
  }
}

module.exports = Dormi;
