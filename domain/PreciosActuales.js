// @ts-check
const PreciosModel = require('../models/Precios');
const sharedConstantes = require('../config/sharedConstantes');

// Este creo un wrapper objeto Precios de la base de datos para poder mandarle mensajes
class PreciosActuales {
  constructor() {
    this.precios = null; // No debe ser llamada en el constructor
  }

  update() {
    PreciosModel.findOne().then(res => (this.precios = res));
  }

  acamparDormiPara(capacidad) {
    return this.precios.dormisAcampar[this._capacidadToIndex(capacidad)];
  }
  recreoDormiPara(capacidad) {
    return this.precios.dormisRecreo[this._capacidadToIndex(capacidad)];
  }
  parcelaAcampar() {
    return this.precios.parcelaAcampar;
  }
  personaAcampar() {
    return this.precios.personaAcampar;
  }
  personaRecreo() {
    return this.precios.personaRecreo;
  }
  quincho(origen) {
    switch (origen) {
      case sharedConstantes.STR_LOCAL:
        return this.precios.quinchoLocal;
      case sharedConstantes.STR_TURISTA:
        return this.precios.quinchoTurista;
      case sharedConstantes.STR_MUNICIPAL:
        return this.precios.quinchoMunicipal;
      case sharedConstantes.STR_INSTITUCION:
        return this.precios.quinchoInstitucion;
    }
  }
  _capacidadToIndex(capacidad) {
    return sharedConstantes.CAPACIDADES_DORMIS.indexOf(capacidad);
  }
}

module.exports = new PreciosActuales();
