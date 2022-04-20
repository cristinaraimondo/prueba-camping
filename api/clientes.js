// @ts-check
const router = require('express').Router();

const ClienteModel = require('../models/Cliente');
const mongoError = require('../utils/mongoError');
const omit = require('../utils/omit');
const isSubobject = require('../utils/isSubobject');
const constantes = require('../config/constantes');
const autenticar = require('../config/autenticar');
const val = require('../utils/validaciones');
const hayError400 = require('../utils/hayError400');
const log = require('../utils/log');
const objDiff = require('../utils/objDiff');

// @route   GET /api/clientes/
// @desc    Devuelve todos los clientes ordenados alfabeticamente
// @access  Private
router.get('/', autenticar(), (req, res) => {
  ClienteModel.find({}, '-_id -__v')
    .sort('apellido nombre')
    .then(items => res.json(items))
    .catch(err => res.status(500).json(mongoError(err)));
});

// @route   GET /api/clientes/count/
// @desc    Devuelve la cantidad total de clientes
// @access  Private
router.get('/count/', autenticar(), (req, res) => {
  ClienteModel.estimatedDocumentCount()
    .then(cant => res.json(cant))
    .catch(err => res.status(500).json(mongoError(err)));
});

// @route   GET /api/clientes/paged/:pageSize/:page
// @desc    Devuelve pageSize clientes, salteando (page-1)*pageSize anteriores
// @access  Private
router.get('/paged/:pageSize/:page', autenticar(), (req, res) => {
  if (hayError400(val.esNumeroNaturalSinCero, req.params.pageSize, res)) return;
  if (hayError400(val.esNumeroNaturalSinCero, req.params.page, res)) return;
  const pageSize = parseInt(req.params.pageSize, 10);
  const skipped = pageSize * (parseInt(req.params.page, 10) - 1);

  ClienteModel.find({}, '-_id -__v')
    .sort('apellido nombre')
    .skip(skipped)
    .limit(pageSize)
    .then(items => res.json(items))
    .catch(err => res.status(500).json(mongoError(err)));
});

// @route   GET /api/clientes/:dni
// @desc    Devuelve el cliente con el DNI dado
// @access  Private
router.get('/:dni', autenticar(), (req, res) => {
  if (hayError400(val.esDNI, req.params.dni, res)) return;

  ClienteModel.findOne({ dni: req.params.dni }, '-_id -__v')
    .then(item => {
      if (item) {
        res.json(item);
      } else {
        noEncontrado404(res, req.params.dni);
      }
    })
    .catch(err => res.status(500).json(mongoError(err)));
});

// @route   POST /api/clientes/
// @desc    Agrega un cliente
// @access  Private
router.post('/', autenticar(), (req, res) => {
  if (hayError400(val.esCliente, req.body, res)) return;

  new ClienteModel(req.body)
    .save()
    .then(item => {
      res.status(201).json(item);
      log(req.user.username, 'Nuevo cliente', item);
    }) // OK. Created
    .catch(err => {
      if (err.code === constantes.MONGO_ERR_DUPLICATE_KEY) {
        res.status(403).json({
          errMsg: 'Ya existe cliente con DNI ' + req.body.dni
        });
      } else res.status(500).json(mongoError(err));
    });
});

// @route   DELETE /api/clientes/:dni
// @desc    Borra un cliente con el DNI dado
// @access  Private
router.delete('/:dni', autenticar(), (req, res) => {
  if (hayError400(val.esDNI, req.params.dni, res)) return;

  ClienteModel.findOneAndRemove({ dni: req.params.dni })
    .then(item => {
      if (item) {
        res.status(204).json(item); //OK. No content
        log(req.user.username, 'Cliente borrado', item);
      } else {
        noEncontrado404(res, req.params.dni);
      }
    })
    .catch(err => res.status(500).json(mongoError(err)));
});

// @route   PUT /api/clientes/
// @desc    Modifica los datos de un cliente
// @access  Private
router.put('/', autenticar(), (req, res) => {
  if (hayError400(val.esCliente, req.body, res)) return;

  ClienteModel.findOneAndUpdate({ dni: req.body.dni }, omit(req.body, ['dni']))
    .then(item => {
      if (item) {
        res.json(item);
        log(
          req.user.username,
          'Modificación de un cliente',
          objDiff(item, req.body)
        );
      } else {
        noEncontrado404(res, req.body.dni);
      }
    })
    .catch(err => res.status(500).json(mongoError(err)));
});

// @route   POST /api/clientes/upsert/
// @desc    Si el cliente ya existe lo modifica, sino lo crea
// @access  Private
router.post('/upsert/', autenticar(), (req, res) => {
  if (hayError400(val.esCliente, req.body, res)) return;

  ClienteModel.findOneAndUpdate({ dni: req.body.dni }, omit(req.body, ['dni']))
    .then(item => {
      if (item) {
        res.json(!isSubobject(item, req.body));
        log(req.user.username, 'Upsert(m) cliente', objDiff(item, req.body));
      } else {
        new ClienteModel(req.body)
          .save() // Uso dos llamadas porque el upsert no soporta todas las validaciones
          .then(() => {
            res.status(201).json(true);
            log(req.user.username, 'Upsert(a) cliente', req.body);
          });
      }
    })
    .catch(err => res.status(500).json(mongoError(err)));
});

// @route   GET /api/clientes/matching/:dni
// @desc    retorna los clientes cuyo dni empieza con dni ordenados alfabeticamente
// @access  Private
router.get('/matching/:dni', autenticar(), (req, res) => {
  if (hayError400(val.startsDNI, req.params.dni, res)) return;

  ClienteModel.find(
    { dni: { $regex: new RegExp(`^${req.params.dni}`) } },
    '-_id -__v'
  )
    .sort('apellido nombre')
    .then(items => res.status(200).json(items))
    .catch(err => res.status(500).json(mongoError(err)));
});

// -------------------------- Funciones auxiliares ---------------------------

function noEncontrado404(res, dni) {
  res.status(404).json({ errMsg: 'No se encontró cliente con DNI ' + dni });
}

module.exports = router;
