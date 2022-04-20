// @ts-check
const sharedConstantes = require('../config/sharedConstantes');
const PreciosActuales = require('./PreciosActuales');

class Contingente {
  constructor() {
    this._nombre = sharedConstantes.STR_CONTINGENTE;
  }

  nombre() {
    return this._nombre;
  }

  precioAcampar(dias, pagan) {
    return dias * pagan * PreciosActuales.personaAcampar();
  }
  precioRecreo(dias, pagan) {
    return pagan * PreciosActuales.personaRecreo();
  }
  precioAcamparMasRecreo(dias, pagan) {
    return this.precioAcampar(dias, pagan) + this.precioRecreo(1, pagan);
  }
}

module.exports = Contingente;
