//@ts-check
/*  Construyo mi propio middleware para Express que primero llama a passport para
    verificar que sea un usuario del sistema y luego este modulo se encarga de verificar
    que tenga (dependiendo del rol asignado) permisos para usar la API
*/

const sharedConstantes = require('./sharedConstantes');
const passport = require('passport');
const ope = sharedConstantes.STR_OPERADOR;
const adm = sharedConstantes.STR_ADMINISTRADOR;
const dir = sharedConstantes.STR_DIRECTOR;

const permisos = {
  // ---------------- Dormis -----------------------
  'GET /api/dormis/': [adm, dir],
  'GET /api/dormis/:numero': [adm],
  'POST /api/dormis/': [adm, dir],
  'DELETE /api/dormis/:numero': [adm, dir],
  'PUT /api/dormis/': [adm, dir],
  'GET /api/dormis/disponibilidad/:dia/:cantDias': [adm, ope, dir],

  // ---------------- Localidades ------------------
  'GET /api/localidades/': [adm, ope],
  'GET /api/localidades/count/': [adm, ope],
  'GET /api/localidades/paged/:pageSize/:page': [adm, ope],
  'POST /api/localidades/': [adm, ope],
  'DELETE /api/localidades/:nombre/:provincia': [adm, ope],
  'GET /api/localidades/matching/:txt': [adm, ope],

  //----------------- Precios ----------------------
  'GET /api/precios/': [adm, dir],
  'PUT /api/precios/': [adm, dir],

  //----------------- Usuarios ---------------------
  'GET /api/usuarios/': [adm, ope, dir],
  'POST /api/usuarios/': [adm, dir],
  'DELETE /api/usuarios/:username': [adm, dir],
  'PUT /api/usuarios/': [adm, dir],
  'POST /api/usuarios/resetPassword/': [adm, dir],
  //"POST /api/usuarios/setPassword/":[adm]  -- publica
  //"POST /api/usuarios/login/":[adm]  -- publica

  //----------------- ConfigOtros ------------------
  'GET /api/configOtros/': [adm, dir],
  'PUT /api/configOtros/': [adm, dir],

  //----------------- Clientes ---------------------
  'GET /api/clientes/': [adm, ope],
  'GET /api/clientes/count/': [adm, ope],
  'GET /api/clientes/paged/:pageSize/:page': [adm, ope],
  'GET /api/clientes/:dni': [adm],
  'POST /api/clientes/': [adm, ope],
  'DELETE /api/clientes/:dni': [adm, ope],
  'PUT /api/clientes/': [adm, ope],
  'POST /api/clientes/upsert/': [adm, ope],
  'GET /api/clientes/matching/:dni': [adm, ope],

  //----------------- Alquileres -------------------
  'POST /api/alquileres/calcularImporte': [adm, ope],
  'POST /api/alquileres/': [adm, ope],
  'GET /api/alquileres/:id': [adm, ope, dir],
  'PUT /api/alquileres/:id/:diaDesde/:cantDias': [adm, ope],
  'DELETE /api/alquileres/:id': [adm], // **SOLO PARA TESTS**
  'POST /api/alquileres/testing': [adm], // **SOLO PARA TESTS**

  //----------------- AlquileresConsultas ----------
  'POST /api/alquileresConsultas/vendidosEntre/': [adm, ope, dir],
  'GET /api/alquileresConsultas/agregadosPorLocalidadVendidosEntre/:diaInicio/:diaFin': [
    adm,
    dir
  ],
  'GET /api/alquileresConsultas/vigentes/:dia': [adm, ope],
  //GET /api/alquilerConsulta/ocupacionCamping/:dia  --publica

  //----------------- Auditoria -------------------
  'GET /api/auditoria/eventosEntre/:diaInicio/:diaFin': [adm, dir]
};

module.exports = function autenticar() {
  return [
    passport.authenticate('jwt', { session: false }),
    function(req, res, next) {
      const prepend = req.originalUrl
        .split('/')
        .slice(0, 3)
        .join('/');
      const path = req.method + ' ' + prepend + req.route.path;

      if (
        req.user.rol &&
        permisos[path] &&
        permisos[path].includes(req.user.rol)
      ) {
        next();
      } else {
        const strRol = req.user.rol ? req.user.rol.toUpperCase() + ' ' : '';
        console.log(`${strRol}sin permiso para ruta: "${path}"`);
        res.status(401).json({ errMsg: 'No tiene permisos para ' + path });
      }
    }
  ];
};
