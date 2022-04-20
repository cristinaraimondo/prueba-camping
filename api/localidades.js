// @ts-check
const router = require('express').Router();

const constantes = require('../config/constantes');
const LocalidadModel = require('../models/Localidad');
const mongoError = require('../utils/mongoError');
const autenticar = require('../config/autenticar');
const val = require('../utils/validaciones');
const hayError400 = require('../utils/hayError400');
const log = require('../utils/log');

// @route   GET /api/localidades/
// @desc    Devuelve todas las localidades. Las localidades son de la forma
//          { nombre: <String>,
//            provincia: <String>};
// @access  Private
router.get('/', autenticar(), (req, res) => {
  LocalidadModel.find({}, '-_id -__v')
    .sort('nombre provincia')
    .then(items => res.json(items))
    .catch(err => res.status(500).json(mongoError(err)));
});

// @route   GET /api/localidades/count/
// @desc    Devuelve la cantidad total de localidades
// @access  Private
router.get('/count/', autenticar(), (req, res) => {
  LocalidadModel.estimatedDocumentCount()
    .then(cant => res.json(cant))
    .catch(err => res.status(500).json(mongoError(err)));
});

// @route   GET /api/localidades/paged/:pageSize/:page
// @desc    Devuelve pageSize localidades, salteando (page-1)*pageSize anteriores
// @access  Private
router.get('/paged/:pageSize/:page', autenticar(), (req, res) => {
  if (hayError400(val.esNumeroNaturalSinCero, req.params.pageSize, res)) return;
  if (hayError400(val.esNumeroNaturalSinCero, req.params.page, res)) return;
  const pageSize = parseInt(req.params.pageSize, 10);
  const skipped = pageSize * (parseInt(req.params.page, 10) - 1);

  LocalidadModel.find({}, '-_id -__v')
    .sort('nombre provincia')
    .skip(skipped)
    .limit(pageSize)
    .then(items => res.json(items))
    .catch(err => res.status(500).json(mongoError(err)));
});

// @route   POST /api/localidades/
// @desc    Agrega un localidad
// @access  Private
router.post('/', autenticar(), (req, res) => {
  if (hayError400(val.esLocalidad, req.body, res)) return;

  new LocalidadModel(req.body)
    .save()
    .then(item => {
      res.status(201).json(item);
      log(req.user.username, 'Alta localidad', item);
    }) // OK. Created

    .catch(err => {
      if (err.code === constantes.MONGO_ERR_DUPLICATE_KEY) {
        res.status(403).json({
          errMsg: req.body.nombre + ' ya está cargada'
        });
      } else res.status(500).json(mongoError(err));
    });
});

// @route   DELETE /api/localidades/:nombre/:provincia
// @desc    Borra una localidad con el nombre y provincia dadas
// @access  Private
router.delete('/:nombre/:provincia', autenticar(), (req, res) => {
  if (hayError400(val.esNombreLocalidad, req.params.nombre, res)) return;
  if (hayError400(val.esProvincia, req.params.provincia, res)) return;

  LocalidadModel.findOneAndRemove({
    nombre: req.params.nombre,
    provincia: req.params.provincia
  })
    .then(item => {
      if (item) {
        res.status(204).json(item); //OK. No content
        log(req.user.username, 'Baja localidad', item);
      } else {
        res.status(404).json({ errMsg: req.params.nombre + ` no encontrado` });
      }
    })
    .catch(err => res.status(500).json(mongoError(err)));
});

// @route   GET /api/localidades/matching/:txt
// @desc    devuelve las localidades cuyo nombre empieza con txt
// @access  Private
router.get('/matching/:txt', autenticar(), (req, res) => {
  if (hayError400(val.startsNombreLocalidad, req.params.txt, res)) return;

  LocalidadModel.find({ nombre: { $regex: req.params.txt } }, '-_id -__v')
    .sort('nombre provincia')
    .then(items => res.json(items))
    .catch(err => res.status(500).json(mongoError(err)));
});

module.exports = router;
