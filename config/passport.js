//@ts-check
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const mongoose = require('mongoose');
const Usuario = mongoose.model('usuarios');
const constantes = require('../config/constantes');

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = constantes.SECRET_OR_KEY;

module.exports = passport => {
  passport.use(
    new JwtStrategy(opts, (jwt_payload, done) => {
      Usuario.findById(jwt_payload.id)
        .then(usuario => {
          if (usuario) {
            return done(null, usuario);
          }
          return done(null, false);
        })
        .catch(err => {
          console.error('Error procesando passport.use');
          console.error(err);
        });
    })
  );
};
