//@ts-check
const sharedConstantes = require('./sharedConstantes');
/* Constantes globales del sistema */

module.exports = {
  MONGO_URL: 'mongodb://localhost:27017/camping', // default mongodb location
  PORT: 4400,
  WS_PORT: 4401,
  TOKEN_EXPIRES_IN: 28800, //seconds, 8 hs
  SECRET_OR_KEY: 'secret',
  MONGO_ERR_DUPLICATE_KEY: 11000
};
