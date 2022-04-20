// @ts-check
const PreciosActuales = require('./PreciosActuales');
const ConfigActual = require('./ConfigActual');
const OcupacionDiaria = require('./OcupacionDiaria');
const sharedConstantes = require('../config/sharedConstantes');

const Parcela = require('./Parcela');
const Dormi = require('./Dormi');
const Quincho = require('./Quincho');
const Contingente = require('./Contingente');

// Hago del dispatching de alguno de los tres mensajes (precioRecreo/...) a los alquilables
function calcularImporteOcupacion(
  alquilable,
  accion,
  pagan,
  dias,
  capacidad,
  origen
) {
  const elAlquilable = construirAlquilable(alquilable, capacidad, origen);

  if (!elAlquilable || !accion) {
    return null;
  } else {
    switch (accion) {
      case sharedConstantes.STR_ACAMPAR:
        return elAlquilable.precioAcampar(dias, pagan);
      case sharedConstantes.STR_RECREO:
        return elAlquilable.precioRecreo(dias, pagan);
      case sharedConstantes.STR_ACAMPARMASRECREO:
        return elAlquilable.precioAcamparMasRecreo(dias, pagan);
      default:
        return null;
    }
  }
}

function init() {
  console.info('Inicializo objetos del dominio.');
  console.info('ESCUCHANDO...');

  PreciosActuales.update();
  ConfigActual.update();
  OcupacionDiaria.updateTotales();
}

//----------------------- Funciones auxiliares --------------------

// Si es posible, construyo un alquilable con los datos de la consulta
function construirAlquilable(alquilable, capacidad, origen) {
  switch (alquilable) {
    case sharedConstantes.STR_PARCELA:
      return new Parcela();
    case sharedConstantes.STR_DORMI:
      return capacidad ? new Dormi(capacidad) : null;
    case sharedConstantes.STR_CONTINGENTE:
      return new Contingente();
    case sharedConstantes.STR_QUINCHO:
      return origen ? new Quincho(origen) : null;
    default:
      return null;
  }
}

module.exports = { calcularImporteOcupacion, init };
