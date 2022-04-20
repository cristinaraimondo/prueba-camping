// @ts-check
const router = require('express').Router();

const diasToPeriodoFecha = require('../utils/diasToPeriodoFecha');
const mongoError = require('../utils/mongoError');
const val = require('../utils/validaciones');
const hayError400 = require('../utils/hayError400');
const autenticar = require('../config/autenticar');

const EventoModel = require('../models/Evento');

// @route   GET /api/alquileresConsultas/agregadosPorLocalidadVendidosEntre/:diaInicio/:diaFin
// @desc    Devuelve data agregada por localidad de los los alquileres vendidos entre dos dias dados
// @access  Private
router.get('/eventosEntre/:diaInicio/:diaFin', autenticar(), (req, res) => {
  const diasIyF = [req.params.diaInicio, req.params.diaFin];
  if (hayError400(val.esPeriodo, diasIyF, res)) return;

  const { fechaInicio, fechaFin } = diasToPeriodoFecha(diasIyF);
  const consulta = {
    fecha: { $gte: fechaInicio, $lte: fechaFin }
  };

  EventoModel.find(consulta, '-__v')
    .then(items => res.json(items))
    .catch(err => res.status(500).json(mongoError(err)));
});

module.exports = router;
