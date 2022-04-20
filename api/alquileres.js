// @ts-check
const router = require('express').Router();
const wsServer = require('./webSocket');

const sharedConstantes = require('../config/sharedConstantes');
const fechaMasDias = require('../utils/fechaMasDias');
const diaToFecha = require('../utils/diaToFecha');
const fechaToDia = require('../utils/fechaToDia');
const mongoError = require('../utils/mongoError');
const val = require('../utils/validaciones');
const hayError400 = require('../utils/hayError400');
const autenticar = require('../config/autenticar');
const log = require('../utils/log');

const Dominio = require('../domain/Dominio');
const ConfigActual = require('../domain/ConfigActual');
const OcupacionDiaria = require('../domain/OcupacionDiaria');
const AlquilerModel = require('../models/Alquiler');
const OcupacionModel = require('../models/Ocupacion');
const DormiModel = require('../models/Dormi');

// @route   POST /api/alquileres/calcularImporte
// @desc    Recibe una consulta de una posible ocupación y devuelve el importe que costaria la misma
// {  alquilable: <String>,
//     accion: <String>,
//     pagan: <Number>,
//     dias: <Number>,
//     capacidad: <OPCIONAL Number>
//     origen: <OPCIONAL String>}
// @access  Private
router.post('/calcularImporte', autenticar(), (req, res) => {
  if (hayError400(val.esConsultaCalcularImporte, req.body, res)) return;

  try {
    const importe = Dominio.calcularImporteOcupacion(
      req.body.alquilable,
      req.body.accion,
      req.body.pagan,
      req.body.dias,
      req.body.capacidad,
      req.body.origen
    );
    res.json(importe);
  } catch (err) {
    res.status(500).json({
      msgErr: 'Error desconocido calculando importe',
      errorOriginal: err
    });
  }
});

// @route   POST /api/alquileres/
// @desc    Registro un alquiler
// @access  Private
router.post('/', autenticar(), async (req, res) => {
  if (hayError400(val.esAlquiler, req.body, res)) return;

  const alquiler = { ...req.body };
  alquiler.fechaInicio = diaToFecha(req.body.diaInicio);
  alquiler.fechaVenta = new Date();
  alquiler.usuario = req.user.username;

  if (alquiler.fechaInicio > ConfigActual.maxFechaAlquilabilidad()) {
    return res.status(400).json({
      errMsg: `No se acepta hacer alquileres más alla del ${fechaToDia(
        ConfigActual.maxFechaAlquilabilidad()
      )}`
    });
  }

  if (alquiler.dias > ConfigActual.maxDiasAlquiler()) {
    return res.status(400).json({
      errMsg: `No se puede alquilar por más de ${ConfigActual.maxDiasAlquiler()} días`
    });
  }

  if (
    alquiler.alquilable === sharedConstantes.STR_DORMI &&
    (!val.esDormi(alquiler.dormi) || !(await existeDormi(alquiler.dormi)))
  ) {
    return res
      .status(400)
      .json({ errMsg: `No existe dormi con los datos dados` });
  }

  if (!(await alquilableEstaDisponible(alquiler))) {
    return res.status(406).json({ errMsg: `El lugar ya no está disponible` });
  }

  const importe = Dominio.calcularImporteOcupacion(
    alquiler.alquilable,
    alquiler.accion,
    alquiler.pagan,
    alquiler.dias,
    alquiler.dormi ? alquiler.dormi.capacidad : null,
    alquiler.origen
  );

  if (!(importe === alquiler.importe)) {
    return res.status(406).json({
      errMsg: `El importe computado (${importe}) no es ${alquiler.importe}`
    });
  }

  try {
    res.json(await alquilar(alquiler));
    log(req.user.username, 'Nuevo alquiler', alquiler);
  } catch (err) {
    res.status(500).json({ errMsg: 'No se pudo registrar alquiler' });
  }
});

// @route   POST /api/alquileres/testing
// @desc    Registro un alquiler sin validad. SOLO PARA SER USADO EN TESTING
// @access  Private
router.post('/testing', autenticar(), async (req, res) => {
  const alquiler = { ...req.body };
  alquiler.fechaInicio = diaToFecha(req.body.diaInicio);
  alquiler.fechaVenta = diaToFecha(req.body.diaInicio);
  alquiler.usuario = req.user.username;
  alquiler.cliente.aviso = '*** ALQUILER PARA TESTEO ***';
  alquiler.importe = Dominio.calcularImporteOcupacion(
    alquiler.alquilable,
    alquiler.accion,
    alquiler.pagan,
    alquiler.dias,
    alquiler.dormi ? alquiler.dormi.capacidad : null,
    alquiler.origen
  );

  try {
    res.json(await alquilar(alquiler));
  } catch (err) {
    res.status(500).json({ errMsg: 'No se pudo registrar alquiler' });
  }
});

// @route   GET /api/alquileres/:id
// @desc    Devuelve el alquiler con el id dado
// @access  Private
router.get('/:id', autenticar(), (req, res) => {
  if (hayError400(val.esMongoId, req.params.id, res)) return;

  AlquilerModel.findById(req.params.id, '-__v')
    .then(item => {
      if (item) {
        res.json(item);
      } else {
        res.status(404).json({
          errMsg: 'No se encontró alquiler con id ' + req.params.id
        });
      }
    })
    .catch(err => res.status(500).json(mongoError(err)));
});

// @route   DELETE /api/alquileres/:id
// @desc    Borra un alquiler. PENSADO SOLO PARA TESTING
// @access  Private
router.delete('/:id', autenticar(), (req, res) => {
  if (hayError400(val.esMongoId, req.params.id, res)) return;

  AlquilerModel.findByIdAndRemove(req.params.id)
    .then(item => {
      if (item) {
        deregistrarOcupaciones(item);
        res.json(item);
        log(req.user.username, 'ALQUILER BORRADO', item);
      } else {
        res.status(404).json({
          errMsg: 'No se encontró alquiler con id ' + req.params.id
        });
      }
    })
    .catch(err => res.status(500).json(mongoError(err)));
});

// @route   PUT /api/alquileres/:id/:diaDesde/:cantDias
// @desc    CHECKOUT. Libera ocupación para el alquiler con id :id
//          a partir de la fecha :diaDesde, por :cantDias,
//          y marca el alquiler como "noVigente"
// @access  Private
/*
  TODO:
    - consultar si la ruta de la api es aceptable o si R quiere cambiarla
    - ver si PUT es lo más adecuado para este caso
    - ver si los códigos res.status sirven o si hay que cambairlos
*/
router.put('/:id/:diaDesde/:cantDias', autenticar(), async (req, res) => {
  if (hayError400(val.esMongoId, req.params.id, res)) return;
  if (hayError400(val.esDia, req.params.diaDesde, res)) return;
  if (hayError400(val.esNumeroNaturalSinCero, req.params.cantDias)) return;

  try {
    const item = await AlquilerModel.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          noVigente: true
        }
      },
      {
        new: true,
        rawResult: true
      }
    );

    if (item) {
      await deregistrarOcupacionesEnPeriodo(
        item.value,
        diaToFecha(req.params.diaDesde),
        req.params.cantDias
      );
      res.json(item);
      log(req.user.username, 'Salida anticipada', item);
    } else {
      res.status(404).json({
        errMsg: 'No se encontró alquiler con id ' + req.params.id
      });
    }
  } catch (err) {
    // console.log(err)
    res.status(500).json(mongoError(err));
  }
});

//---------------------------------- Funciones auxiliares -----------------------

// Veo que el dormi exista en la DB con los datos indicados
async function existeDormi(dormi) {
  try {
    const item = await DormiModel.findOne({ numero: dormi.numero });
    return item.capacidad === dormi.capacidad;
  } catch (err) {
    return false;
  }
}

// Determina si el alquilable está disponible
async function alquilableEstaDisponible(alquiler) {
  const dormiNumero =
    alquiler.alquilable == sharedConstantes.STR_DORMI && alquiler.dormi
      ? alquiler.dormi.numero
      : null;
  let res = true;
  for (let i = 0; i < alquiler.dias; i++) {
    const fecha = fechaMasDias(alquiler.fechaInicio, i);
    res =
      res &&
      (await OcupacionDiaria.hayAlquilableLibre(
        alquiler.alquilable,
        fecha,
        dormiNumero
      ));
  }

  return res;
}

//----------- Registro de ocupaciones

// Hago los asientos del alquiler, en alquileres y ocupaciones
async function alquilar(alquiler) {
  const alquilerRegistrado = await new AlquilerModel(alquiler).save();
  await registrarOcupaciones(alquilerRegistrado);
  return alquilerRegistrado._id;
}

// Asiento cada uno de los dias la ocupacion del alquiler
async function registrarOcupaciones(alquiler) {
  for (let i = 0; i < alquiler.dias; i++) {
    const fecha = fechaMasDias(alquiler.fechaInicio, i);
    await registrarOcupacion(alquiler, fecha);
  }
}

// Asiento UN dia de la ocupacion del alquiler
async function registrarOcupacion(alquiler, fecha) {
  // Si no existe la ocupacion la creo
  let item = await OcupacionModel.findOne({ fecha }).exec();
  if (!item) {
    item = await new OcupacionModel({
      fecha,
      dormi: [],
      parcela: [],
      quincho: [],
      contingente: []
    }).save();
  }

  let numeroAlquilable =
    alquiler.alquilable === sharedConstantes.STR_DORMI
      ? alquiler.dormi.numero
      : 0;

  // Cambio solamente el array que necesito en la base de datos
  let cambio = {
    [alquiler.alquilable]: { numero: numeroAlquilable, alquiler: alquiler._id }
  };
  await OcupacionModel.findByIdAndUpdate(item._id, { $push: cambio });

  if (fechaToDia(fecha) === fechaToDia(new Date())) {
    wsServer.broadcastUpdateOcupacion();
  }
}

//----------- De-registro de ocupaciones

// Elimino la ocupación de cada uno de los dias del alquiler
async function deregistrarOcupaciones(alquiler) {
  for (let i = 0; i < alquiler.dias; i++) {
    const fecha = fechaMasDias(alquiler.fechaInicio, i);
    await deregistrarOcupacion(alquiler, fecha);
  }
}

// Elimina ocupación para el alquiler en cada día del período de cantDias desde fechaDesde
async function deregistrarOcupacionesEnPeriodo(alquiler, fechaDesde, cantDias) {
  for (let i = 0; i < cantDias; i++) {
    const fecha = fechaMasDias(fechaDesde, i);
    await deregistrarOcupacion(alquiler, fecha);
  }
}

// Elimino el asiento de UN día de la ocupacion del alquiler
async function deregistrarOcupacion(alquiler, fecha) {
  let item = await OcupacionModel.findOne({ fecha }).exec();
  // Cambio solamente el array que necesito en la base de datos
  let cambio = { [alquiler.alquilable]: { alquiler: alquiler._id } };
  item = await OcupacionModel.findByIdAndUpdate(
    item._id,
    { $pull: cambio },
    { new: true }
  );

  if (fechaToDia(fecha) === fechaToDia(new Date())) {
    wsServer.broadcastUpdateOcupacion();
  }
}

module.exports = router;
