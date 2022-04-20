const sharedConstantes = require('./sharedConstantes');

module.exports = [
  {
    username: 'admin',
    nombre: 'ADMINISTRADOR',
    password: '$2a$05$AgUEOwzKFju6x2nb/p4meu7SaLUjZKV7VPKW//CZ0ONAm1IhUyRh.',
    tienePassword: true,
    rol: sharedConstantes.STR_ADMINISTRADOR
  },
  {
    username: 's.araquistain',
    nombre: 'SOLEDAD DE ARAQUISTAIN',
    password: '',
    tienePassword: false,
    rol: sharedConstantes.STR_OPERADOR
  },
  {
    username: 'j.yohuston',
    nombre: 'JULIA YOHUSTON',
    password: '',
    tienePassword: false,
    rol: sharedConstantes.STR_OPERADOR
  },
  {
    username: 's.giribaldi',
    nombre: 'SILVIA GIRIBALDI',
    password: '',
    tienePassword: false,
    rol: sharedConstantes.STR_OPERADOR
  },
  {
    username: 's.suarez',
    nombre: 'SALVADOR SUAREZ',
    password: '',
    tienePassword: false,
    rol: sharedConstantes.STR_OPERADOR
  },
  {
    username: 'r.arluna',
    nombre: 'ROBERTO ARLUNA',
    password: '',
    tienePassword: false,
    rol: sharedConstantes.STR_OPERADOR
  },
  {
    username: 'p.sola',
    nombre: 'PABLO SOLA',
    password: '',
    tienePassword: false,
    rol: sharedConstantes.STR_DIRECTOR
  }
];
