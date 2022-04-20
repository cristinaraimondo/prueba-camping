// @ts-check
const ConfigOtrosModel = require('../models/ConfigOtros');
const DormiModel = require('../models/Dormi');
const OcupacionModel = require('../models/Ocupacion');

class OcupacionDiaria {
  constructor() {
    this.totales = {
      total_dormi: 0,
      total_parcela: 0,
      total_quincho: 0,
      total_contingente: 0,
      ocupados_dormi: 0,
      ocupados_parcela: 0,
      ocupados_quincho: 0,
      ocupados_contingente: 0,
      numerosDormisOcupados: []
    };
  }

  // Los totales casi nunca se actualizan, por lo que lo actualizo bajo pedido
  async updateTotales() {
    try {
      const config = await ConfigOtrosModel.findOne({});
      this.totales.total_dormi = await DormiModel.countDocuments({});
      this.totales.total_parcela = config.cantParcelas;
      this.totales.total_quincho = config.cantQuinchos;
      this.totales.total_contingente = config.cantContingentes;
    } catch (err) {
      console.error('Error en updateTotales de OcupacionDiaria');
    }
  }

  // Esta consulta devuelve un objeto de la siguiente forma:
  //  {  total_<alquilable>    = <Number>
  //     ocupados_<alquilable> = <Number>  con alquilable = "dormi", "parcela", "quincho", "contingente"
  //    ...
  //    numerosDormisOcupados = [<Number>]
  //  }
  async getOcupacion(fecha) {
    let res = { ...this.totales };
    try {
      const ocupacion = await OcupacionModel.findOne({ fecha });
      if (ocupacion) {
        res.ocupados_dormi = ocupacion.dormi.length;
        res.ocupados_parcela = ocupacion.parcela.length;
        res.ocupados_quincho = ocupacion.quincho.length;
        res.ocupados_contingente = ocupacion.contingente.length;
        res.numerosDormisOcupados = ocupacion.dormi.map(d => d.numero);
      } else {
        res.ocupados_dormi = 0;
        res.ocupados_parcela = 0;
        res.ocupados_quincho = 0;
        res.ocupados_contingente = 0;
        res.numerosDormisOcupados = [];
      }
      return res;
    } catch (err) {
      console.error('Error en getOcupacion de OcupacionDiaria');
    }
  }

  async hayAlquilableLibre(strAlquilable, fecha, dormiNumero) {
    const ocupacion = await this.getOcupacion(fecha);
    if (dormiNumero) {
      return !ocupacion.numerosDormisOcupados.includes(dormiNumero);
    } else {
      const ocupados = ocupacion['ocupados_' + strAlquilable];
      const total = ocupacion['total_' + strAlquilable];

      return total > ocupados;
    }
  }
}

module.exports = new OcupacionDiaria();
