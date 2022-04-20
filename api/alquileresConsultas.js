// @ts-check
const router = require('express').Router();

const diasToPeriodoFecha = require('../utils/diasToPeriodoFecha');
const diaToFecha = require('../utils/diaToFecha');
const mongoError = require('../utils/mongoError');
const val = require('../utils/validaciones');
const hayError400 = require('../utils/hayError400');
const autenticar = require('../config/autenticar');
const omit = require('../utils/omit');
const fechaMenosDias = require('../utils/fechaMenosDias')

const AlquilerModel = require('../models/Alquiler');
const OcupacionDiaria = require('../domain/OcupacionDiaria');
const ConfigOtrosModel = require('../models/ConfigOtros')


// @route   GET /api/alquilerConsulta/ocupacionCamping/:dia
// @desc    Devuelve un objeto con la cantidad de alquilables ocupados y totales del dia dado
// @access  Public
router.get('/ocupacionCamping/:dia', (req, res) => {
  if (hayError400(val.esDia, req.params.dia, res)) return;
  const fecha = diaToFecha(req.params.dia);

  OcupacionDiaria.getOcupacion(fecha)
    .then(ocupacion => res.json(omit(ocupacion, ['numerosDormisOcupados'])))
    .catch(err => res.status(500).json({ msgErr: 'Desconocido' }));
});

// @route   POST /api/alquileresConsultas/vendidosEntre/
// @desc    Devuelve los alquileres vendidos entre dos dias dados y que tiene mas condiciones
//          Recibe un objeto de la forma:
//            {  diaInicio: <String>,
//               diaFin:    <String>,
//               dni:       <String>,
//               nombre:    <String>,
//               apellido:  <String>,
//               dominio:   <String>
//               usuario:   <String>
//             }
// @access  Private
router.post('/vendidosEntre/', autenticar(), (req, res) => {
  if (hayError400(val.esConsultaVendidosEntre, req.body, res)) return;
  const diasIyF = [req.body.diaInicio, req.body.diaFin];

  const { fechaInicio, fechaFin } = diasToPeriodoFecha(diasIyF);
  const consulta = {
    fechaVenta: { $gte: fechaInicio, $lte: fechaFin }
  };
  if (req.body.dni) consulta['cliente.dni'] = { $regex: req.body.dni };
  if (req.body.usuario) consulta['usuario'] = req.body.usuario;
  if (req.body.nombre) consulta['cliente.nombre'] = { $regex: req.body.nombre };
  if (req.body.apellido)
    consulta['cliente.apellido'] = { $regex: req.body.apellido };
  if (req.body.dominio)
    consulta['cliente.vehiculo.dominio'] = { $regex: req.body.dominio };

  AlquilerModel.find(consulta, '-__v')
    .then(items => {
      res.json(items)}
    )
    .catch(err => res.status(500).json(mongoError(err)));
});

// @route   GET /api/alquileresConsultas/agregadosPorLocalidadVendidosEntre/:diaInicio/:diaFin
// @desc    Devuelve data agregada por localidad de los los alquileres vendidos entre dos dias dados
// @access  Private
router.get(
  '/agregadosPorLocalidadVendidosEntre/:diaInicio/:diaFin',
  autenticar(),
  (req, res) => {
    const diasIyF = [req.params.diaInicio, req.params.diaFin];
    if (hayError400(val.esPeriodo, diasIyF, res)) return;

    let { fechaInicio, fechaFin } = diasToPeriodoFecha(diasIyF);
    AlquilerModel.aggregate([
      {
        $match: {
          fechaVenta: { $gte: fechaInicio, $lte: fechaFin }
        }
      },
      {
        $group: {
          _id: {
            localidad: '$cliente.localidad.nombre',
            provincia: '$cliente.localidad.provincia'
          },
          cantidad: { $sum: 1 },
          ingresan: { $sum: '$ingresan' },
          importe: { $sum: '$importe' }
        }
      },
      {
        $project: {
          _id: false,
          localidad: '$_id.localidad',
          provincia: '$_id.provincia',
          cantidad: true,
          ingresan: true,
          importe: true
        }
      },
      { $sort: { cantidad: -1, localidad: 1 } }
    ])
      .then(items => res.json(items))
      .catch(err => res.status(500).json(mongoError(err)));
  }
);

// @route   GET /api/alquileresConsultas/vigentes/:dia
// @desc    Devuelve los alquileres vigentes en la fecha indicada
// @access  Private
router.get('/vigentes/:dia', autenticar(), async (req, res) => {
  const dia = req.params.dia
  if (hayError400(val.esDia, dia, res)) return

  try {
    const fecha = diaToFecha(dia)
    const config = await ConfigOtrosModel.findOne({})
    const minFechaInicio = fechaMenosDias(fecha, config.maxDiasAlquilabilidad)
    const items = await AlquilerModel.aggregate([
      {
        $match: {
          fechaInicio: {
            $gte: minFechaInicio
          }
        }
      },
      {
        $addFields: {
          cmp_value: {  // cmp(dias, (fecha - fechaInicio) expresada en días)
            $cmp: [
              '$dias',
              {
                $divide: [
                  {
                    $subtract: [
                      fecha,
                      '$fechaInicio'
                    ]
                  },
                  86400000  // 1000 * 60 * 60 * 24; traducción de ms a días
                ]
              }          
            ],
          },
        },
      }, 
      {
        $match: {
          $and: [
            {
              noVigente: {
                $ne: true
              }
            },
            {
              $or: [
                {
                  fechaInicio: {
                    $gte: fecha
                  }
                },
                {
                  cmp_value: {
                    $gt: 0
                  }
                }
              ]            
            }
          ]
        }
      },
      {
        $sort: {
          fechaInicio: 1,
        }
      }
    ])
    res.json(items)
  
  } catch(err) {
    // console.log(err)
    res.status(500).json(mongoError(err))
  }
})

module.exports = router;
