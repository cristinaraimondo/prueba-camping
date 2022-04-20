// @ts-check
const router = require('express').Router();

const PreciosModel = require('../models/Precios');
const PreciosActuales = require('../domain/PreciosActuales');
const val = require('../utils/validaciones');
const hayError400 = require('../utils/hayError400');
const mongoError = require('../utils/mongoError');
const autenticar = require('../config/autenticar');
const log = require('../utils/log');
const objDiff = require('../utils/objDiff');

// @route   GET /api/precios/
// @desc    Devuelve un objeto con todos los precios
//  {dormisAcampar: [<Number>],
//   dormisRecreo: [<Number>],
//   parcelaAcampar: <Number>,
//   personaAcampar: <Number>,
//   personaRecreo: <Number>,
//   quinchoLocal: <Number>,
//   quinchoTurista: <Number>,
//   quinchoMunicipal: <Number>,
//   quinchoInstitucion: <Number>};
// @access  Private
router.get('/', autenticar(), (req, res) => {
  PreciosModel.findOne({}, '-_id -__v')
    .then(items => {
      if (items) {
        return res.json(items);
      } else {
        res.status(500).json({ msgErr: 'Internal: faltan precios!' });
      }
    })
    .catch(err => res.status(500).json(mongoError(err)));
});

// @route   PUT /api/precios/
// @desc    Modifica los precios del sistema
// @access  Private
router.put('/', autenticar(), (req, res) => {
  if (hayError400(val.esPrecios, req.body, res)) return;

  PreciosModel.findOneAndUpdate({}, req.body)
    .then(item => {
      if (item) {
        PreciosActuales.update();
        res.json(item);
        log(req.user.username, 'Modificación precios', objDiff(item, req.body));
      } else {
        res.status(500).json({ msgErr: 'Internal: faltan precios!' });
      }
    })
    .catch(err => res.status(500).json(mongoError(err)));
});

module.exports = router;
