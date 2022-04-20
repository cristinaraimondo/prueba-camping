// @ts-check
const router = require('express').Router();

const wsServer = require('./webSocket');
const constantes = require('../config/constantes');
const fechaMasDias = require('../utils/fechaMasDias');
const diaToFecha = require('../utils/diaToFecha');
const omit = require('../utils/omit');
const DormiModel = require('../models/Dormi');
const OcupacionModel = require('../models/Ocupacion');
const mongoError = require('../utils/mongoError');
const val = require('../utils/validaciones');
const hayError400 = require('../utils/hayError400');
const autenticar = require('../config/autenticar');
const log = require('../utils/log');
const objDiff = require('../utils/objDiff');

// @route   GET /api/dormis/
// @desc    Devuelve todos los dormis ordenados numericamente. Son objetos de la forma
//          { numero: <Integer>,
//            capacidad: <Integer>}
// @access  Private
router.get('/', autenticar(), (req, res) => {
  DormiModel.find({}, '-_id -__v')
    .sort('numero')
    .then(items => res.json(items))
    .catch(err => res.status(500).json(mongoError(err)));
});

// @route   GET /api/dormis/:numero
// @desc    Devuelve el dormi con el numero dado
// @access  Private
router.get('/:numero', autenticar(), (req, res) => {
  if (hayError400(val.esNumeroNaturalSinCero, req.params.numero, res)) return;

  DormiModel.findOne({ numero: req.params.numero }, '-_id -__v')
    .then(item => {
      if (item) {
        res.json(item);
      } else {
        noEncontrado404(res, req.params.numero);
      }
    })
    .catch(err => res.status(500).json(mongoError(err)));
});

// @route   POST /api/dormis/
// @desc    Agrega un dormi
// @access  Private
router.post('/', autenticar(), (req, res) => {
  if (hayError400(val.esDormi, req.body, res)) return;

  new DormiModel(req.body)
    .save()
    .then(item => {
      wsServer.broadcastUpdateOcupacion();
      res.status(201).json(item);
      log(req.user.username, 'Alta dormi', item);
    })
    .catch(err => {
      if (err.code === constantes.MONGO_ERR_DUPLICATE_KEY) {
        res.status(403).json({
          errMsg: 'Ya existe un dormi con número ' + req.body.numero
        });
      } else res.status(500).json(mongoError(err));
    });
});

// @route   DELETE /api/dormis/:numero
// @desc    Borra un dormi con el numero dado
// @access  Private
router.delete('/:numero', autenticar(), (req, res) => {
  if (hayError400(val.esNumeroNaturalSinCero, req.params.numero, res)) return;

  DormiModel.findOneAndRemove({ numero: req.params.numero })
    .then(item => {
      if (item) {
        wsServer.broadcastUpdateOcupacion();
        res.status(204).json(item); //OK. No content
        log(req.user.username, 'Baja dormi', item);
      } else {
        noEncontrado404(res, req.params.numero);
      }
    })
    .catch(err => res.status(500).json(mongoError(err)));
});

// @route   PUT /api/dormis/
// @desc    Modifica un dormi
// @access  Private
router.put('/', autenticar(), (req, res) => {
  if (hayError400(val.esDormi, req.body, res)) return;

  DormiModel.findOneAndUpdate(
    { numero: req.body.numero },
    omit(req.body, ['numero'])
  )
    .then(item => {
      if (item) {
        res.json(item);
        log(req.user.username, 'Modificación dormi', objDiff(item, req.body));
      } else {
        noEncontrado404(res, req.body.numero);
      }
    })
    .catch(err => res.status(500).json(mongoError(err)));
});

// @route   GET /api/dormis/disponibilidad/:dia/:cantDias
// @desc    Devuelve la disponibilidad de los dormis en un dia dado
// @access  Private
// {numero:     <numero>,
//  capacidad : <numero>,
//  alquileres: [ObjectId]
// }
router.get('/disponibilidad/:dia/:cantDias', autenticar(), (req, res) => {
  if (hayError400(val.esDia, req.params.dia, res)) return;
  if (hayError400(val.esNumeroNaturalSinCero, req.params.cantDias, res)) return;

  consultarDisponibilidad(diaToFecha(req.params.dia), req.params.cantDias)
    .then(dormis => res.json(dormis))
    .catch(err => res.status(500).json(mongoError(err)));
});

// ---------------------------- Funciones auxiliares ---------------------

async function consultarDisponibilidad(fecha, cantDias) {
  // Calculo todos dormis
  let todosLosDormis = await DormiModel.find({})
    .sort('numero')
    .select({ numero: true, capacidad: true, _id: false })
    .exec();

  // Por cada dia, agrego los alquileres
  for (let i = 0; i < cantDias; i++) {
    let ocupacionDormis = await OcupacionModel.findOne({
      fecha: fechaMasDias(fecha, i)
    })
      .select({ dormi: true, _id: false })
      .exec();

    let dormisOcupados = ocupacionDormis ? ocupacionDormis.dormi : [];

    dormisOcupados.forEach(dormi => {
      let idx = todosLosDormis.findIndex(d => d.numero === dormi.numero);
      if (idx >= 0) {
        todosLosDormis[idx] = {
          numero: dormi.numero,
          capacidad: todosLosDormis[idx].capacidad,
          alquileres: todosLosDormis[idx].alquileres
            ? [...todosLosDormis[idx].alquileres, dormi.alquiler]
            : [dormi.alquiler]
        };
      }
    });
  }
  return todosLosDormis;
}

// -------------------------- Funciones auxiliares ---------------------------

function noEncontrado404(res, numero) {
  res.status(404).json({ errMsg: 'No se encontró dormi con número ' + numero });
}

module.exports = router;
