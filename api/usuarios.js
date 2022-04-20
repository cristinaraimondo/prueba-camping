// @ts-check
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UsuarioModel = require('../models/Usuario');
const sharedConstantes = require('../config/sharedConstantes');
const constantes = require('../config/constantes');
const mongoError = require('../utils/mongoError');
const autenticar = require('../config/autenticar');
const val = require('../utils/validaciones');
const hayError400 = require('../utils/hayError400');
const omit = require('../utils/omit');
const log = require('../utils/log');
const objDiff = require('../utils/objDiff');
const getClientIP = require('../utils/getClientIP');

// @route   GET /api/usuarios/
// @desc    Devuelve todos los usuarios del sistema, que son objetos
//          {username: <String>
//           nombre:   <String>,
//           rol:      <String>,
//           tienePassword: <Boolean>}
// @access  Private
router.get('/', autenticar(), (req, res) => {
  UsuarioModel.find({}, 'username nombre rol tienePassword estaActivo -_id')
    .sort('username')
    .then(items => res.json(items))
    .catch(err => res.status(500).json(mongoError(err)));
});

// @route   POST /api/usuarios/
// @desc    Agrega un usuario, sin clave
//          {username: <String>
//           nombre:   <String>,
//           rol:      <String>,
//           tienePassword: <Boolean> OPCIONAL, IGNORADO}
// @access  Private
router.post('/', autenticar(), (req, res) => {
  if (hayError400(val.esUsuario, req.body, res)) return;

  new UsuarioModel(omit(req.body, ['tienePassword']))
    .save()
    .then(item => {
      res.status(201).json(item);
      log(req.user.username, 'Nuevo usuario', item);
    }) // OK. Created
    .catch(err => {
      if (err.code === constantes.MONGO_ERR_DUPLICATE_KEY) {
        res.status(403).json({
          errMsg: 'Ya existe un usuario con username ' + req.body.username
        });
      } else res.status(500).json(mongoError(err));
    });
});

// @route   DELETE /api/usuarios/:username
// @desc    Borra un usuario con el username dado
// @access  Private
router.delete('/:username', autenticar(), (req, res) => {
  if (hayError400(val.esUsername, req.params.username, res)) return;

  UsuarioModel.findOne({ username: req.params.username })
    .then(async item => {
      if (item) {
        if (
          item.rol === sharedConstantes.STR_ADMINISTRADOR &&
          (await cantidadDeAdministradores()) <= 1
        ) {
          errorUnicoAdministrador(res, req.params.username);
        } else {
          UsuarioModel.findByIdAndRemove(item.id).then(() => {
            res.status(204).json(item);
            log(req.user.username, 'Borrar usuario', item);
          }); //OK. No content
        }
      } else {
        res
          .status(404)
          .json({ errMsg: `Usuario ${req.params.username} no encontrado` });
      }
    })
    .catch(err => res.status(500).json(mongoError(err)));
});

// @route   PUT /api/usuarios/
// @desc    Modifica el nombre y el rol del usuario. TienePassword es ignorado
// @access  Private
router.put('/', autenticar(), (req, res) => {
  if (hayError400(val.esUsuario, req.body, res)) return;
  let cambios = omit(req.body, ['username', 'tienePassword']);

  UsuarioModel.findOne({ username: req.body.username })
    .then(async item => {
      if (item) {
        if (
          item.rol === sharedConstantes.STR_ADMINISTRADOR &&
          (req.body.rol !== sharedConstantes.STR_ADMINISTRADOR ||
            !req.body.estaActivo) &&
          (await cantidadDeAdministradores()) <= 1
        ) {
          errorUnicoAdministrador(res, req.body.username);
        } else {
          UsuarioModel.findOneAndUpdate(
            { username: req.body.username },
            cambios
          ).then(() => {
            res.status(204).json(item);
            log(req.user.username, 'Modif. usuario', objDiff(item, req.body));
          });
        }
      } else {
        res
          .status(404)
          .json({ errMsg: `No se encontró usuario ${req.body.username}` });
      }
    })
    .catch(err => res.status(500).json(mongoError(err)));
});

// @route   POST /api/usuarios/setPassword/
// @desc    Setea una clave para un usuario que no la tenga
// @access  Public
router.post('/setPassword', (req, res) => {
  if (hayError400(val.esLogin, req.body, res)) return;
  const username = req.body.username;

  UsuarioModel.findOne({ username }).then(usuario => {
    if (!usuario || usuario.password) {
      return res
        .status(401)
        .json({ errMsg: 'Usuario no encontrado o con clave' });
    }

    const hash = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(5));
    UsuarioModel.findOneAndUpdate(
      { username },
      { password: hash, tienePassword: true }
    )
      .then(usr => {
        res.json(usr);
        log(username, 'Seteo de clave');
      })
      .catch(err => res.status(500).json(mongoError(err)));
  });
});

// @route   POST /api/usuarios/resetPassword/
// @desc    Resetea la clave de un usuario
// @access  Private
router.post('/resetPassword/', autenticar(), (req, res) => {
  if (hayError400(val.esObjUsername, req.body, res)) return;

  let cambios = {
    tienePassword: false,
    password: ''
  };

  UsuarioModel.findOneAndUpdate({ username: req.body.username }, cambios)
    .then(item => {
      if (item) {
        res.json(item);
        log(
          req.user.username,
          'Reset clave',
          omit(objDiff(item, cambios), ['password'])
        );
      } else {
        res
          .status(404)
          .json({ errMsg: `No se encontró usuario ${req.body.username}` });
      }
    })
    .catch(err => res.status(500).json(mongoError(err)));
});

// @route   POST /api/usuarios/login/
// @desc    Procesa el login de usuario y devuelve un token JWT firmado
// @access  Public
router.post('/login', (req, res) => {
  if (hayError400(val.esLogin, req.body, res)) return;
  const username = req.body.username;

  UsuarioModel.findOne({ username })
    .then(usuario => {
      if (!usuario || usuario.password === '' || !usuario.estaActivo) {
        error401(res);
        return log(
          'SYSTEM',
          'Login fallado por usuario inexistente o desactivado o clave vacía'
        );
      }

      bcrypt.compare(req.body.password, usuario.password).then(isMatch => {
        if (isMatch) {
          const payload = {
            id: usuario.id,
            nombre: usuario.nombre,
            rol: usuario.rol
          };

          jwt.sign(
            payload,
            constantes.SECRET_OR_KEY,
            { expiresIn: constantes.TOKEN_EXPIRES_IN },
            (err, token) => {
              res.json('Bearer ' + token);
              log(usuario.username, 'Login desde ' + getClientIP(req));
            }
          );
        } else {
          error401(res);
          return log('SYSTEM', 'Login fallado por clave erronea');
        }
      });
    })
    .catch(err => res.status(500).json(mongoError(err)));
});

//---------------- Funciones auxiliares ------------

// Calcula la cantidad de administradores activos
async function cantidadDeAdministradores() {
  return await UsuarioModel.countDocuments({
    rol: sharedConstantes.STR_ADMINISTRADOR,
    estaActivo: true
  });
}

function errorUnicoAdministrador(res, username) {
  res.status(403).json({
    errMsg: `No se puede borrar ${username}. Es el único administrador del sistema`
  });
}

function error401(res) {
  return res
    .status(401)
    .json({ errMsg: 'Nombre de usuario o clave incorrecta' });
}

module.exports = router;
