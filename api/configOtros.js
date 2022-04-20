// @ts-check
const router = require('express').Router();
const wsServer = require('./webSocket');

const ConfigActual = require('../domain/ConfigActual');
const OcupacionDiaria = require('../domain/OcupacionDiaria');
const mongoError = require('../utils/mongoError');
const ConfigOtrosModel = require('../models/ConfigOtros');
const val = require('../utils/validaciones');
const hayError400 = require('../utils/hayError400');
const autenticar = require('../config/autenticar');
const log = require('../utils/log');
const objDiff = require('../utils/objDiff');

// @route   GET /api/configOtros/
// @desc    Devuelve un objeto de la forma
//           {cantContingentes: 1,
//            cantParcelas: 184,
//            cantQuinchos: 1,
//            maxDiasAlquiler: 14
//            maxDiasAlquilabilidad: 30
//            };
// @access  Private
router.get('/', autenticar(), (req, res) => {
  ConfigOtrosModel.findOne({}, '-_id -__v')
    .then(items => {
      if (items) {
        return res.json(items);
      } else {
        res
          .status(500)
          .json({ msgErr: 'Internal: faltan configuraciones adicionales!' });
      }
    })
    .catch(err => res.status(500).json(mongoError(err)));
});

// @route   PUT /api/configOtros/
// @desc    Modifica las configuraciones adicionales del sistema. Los cambios pueden ser parciales
// @access  Private
router.put('/', autenticar(), (req, res) => {
  if (hayError400(val.esConfigOtros, req.body, res)) return;

  ConfigOtrosModel.findOneAndUpdate({}, req.body)
    .then(item => {
      if (item) {
        wsServer.broadcastUpdateOcupacion();
        ConfigActual.update();
        OcupacionDiaria.updateTotales();
        res.json(item);
        log(req.user.username, 'Cambio configuración', objDiff(item, req.body));
      } else {
        res
          .status(500)
          .json({ msgErr: 'Internal: faltan configuraciones adicionales!' });
      }
    })
    .catch(err => res.status(500).json(mongoError(err)));
});

module.exports = router;
