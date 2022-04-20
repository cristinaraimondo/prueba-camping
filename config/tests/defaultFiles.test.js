/* Testeo que los archivos que se cargan automaticamente cuando se crea la base
   de datos tenga información válida
*/
const defaultDormis = require('../defaultDormis');
const defaultLocalidades = require('../defaultLocalidades');
const defaultClientes = require('../defaultClientes');
const defaultUsuarios = require('../defaultUsuarios');
const validaciones = require('../../utils/validaciones');
const omit = require('../../utils/omit');

describe('Testeo los archivos que se cargan por defecto en la DB', () => {
  test('Testeo defaultDormis', () => {
    defaultDormis.every(i =>
      expect(validaciones.esDormi(i)).toHaveProperty('isOk', true)
    );
  });

  test('Testeo defaultLocalidades', () => {
    defaultLocalidades.every(i =>
      expect(validaciones.esLocalidad(i)).toHaveProperty('isOk', true)
    );
  });

  test('Testeo defaultClientes', () => {
    defaultClientes.every(i =>
      expect(validaciones.esCliente(i)).toHaveProperty('isOk', true)
    );
  });

  test('Testeo defaultUsuarios', () => {
    defaultUsuarios
      .map(i => omit(i, ['password']))
      .every(i =>
        expect(validaciones.esUsuario(i)).toHaveProperty('isOk', true)
      );
  });
});
