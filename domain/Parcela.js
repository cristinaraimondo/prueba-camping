// @ts-check
const sharedConstantes = require('../config/sharedConstantes');
const PreciosActuales = require('./PreciosActuales');

class Parcela {
  constructor(capacidad) {
    this._nombre = sharedConstantes.STR_PARCELA;
  }

  nombre() {
    return this._nombre;
  }

  precioAcampar(dias, pagan) {
    return (
      dias *
      (PreciosActuales.parcelaAcampar() +
        pagan * PreciosActuales.personaAcampar())
    );
  }
  precioRecreo(dias, pagan) {
    return pagan * PreciosActuales.personaRecreo();
  }
  precioAcamparMasRecreo(dias, pagan) {
    return this.precioAcampar(dias, pagan) + this.precioRecreo(1, pagan);
  }
}

module.exports = Parcela;
