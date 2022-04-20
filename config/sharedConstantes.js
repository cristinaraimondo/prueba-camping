/*
  Constantes que son compartidas entre el cliente y el servidor
*/

module.exports = {
  CAPACIDADES_DORMIS: [2, 4, 6, 8],

  STR_OPERADOR: 'operador',
  STR_ADMINISTRADOR: 'administrador',
  STR_DIRECTOR: 'director',
  get STR_ROLES() {
    return [this.STR_OPERADOR, this.STR_ADMINISTRADOR, this.STR_DIRECTOR];
  },

  STR_PARCELA: 'parcela',
  STR_DORMI: 'dormi',
  STR_QUINCHO: 'quincho',
  STR_CONTINGENTE: 'contingente',
  get STR_ALQUILABLES() {
    return [
      this.STR_PARCELA,
      this.STR_DORMI,
      this.STR_QUINCHO,
      this.STR_CONTINGENTE
    ];
  },

  STR_ACAMPAR: 'acampar',
  STR_RECREO: 'recreo',
  STR_ACAMPARMASRECREO: 'acampar+recreo',
  get STR_ACCIONES() {
    return [this.STR_ACAMPAR, this.STR_RECREO, this.STR_ACAMPARMASRECREO];
  },

  STR_LOCAL: 'local',
  STR_TURISTA: 'turista',
  STR_MUNICIPAL: 'municipal',
  STR_INSTITUCION: 'institucion',
  get STR_ORIGENES() {
    return [
      this.STR_LOCAL,
      this.STR_TURISTA,
      this.STR_MUNICIPAL,
      this.STR_INSTITUCION
    ];
  },

  STR_EFECTIVO: 'efectivo',
  STR_TARJETA: 'tarjeta',
  get STR_FORMAS_DE_PAGO() {
    return [this.STR_EFECTIVO, this.STR_TARJETA];
  },

  WS_STR_UPDATE_STATUS: 'updateStatus',

  PROVINCIAS: [
    'CAPITAL',
    'BUENOS AIRES',
    'CATAMARCA',
    'CHACO',
    'CHUBUT',
    'CORDOBA',
    'CORRIENTES',
    'ENTRE RIOS',
    'FORMOSA',
    'JUJUY',
    'LA PAMPA',
    'LA RIOJA',
    'MENDOZA',
    'MISIONES',
    'NEUQUEN',
    'RIO NEGRO',
    'SALTA',
    'SAN JUAN',
    'SAN LUIS',
    'SANTA CRUZ',
    'SANTA FE',
    'SANTIGO DEL ESTERO',
    'TIERRA DEL FUEGO',
    'TUCUMAN'
  ]
};
