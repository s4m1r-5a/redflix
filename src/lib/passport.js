const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
//const val = require('./navegacion.js');
const pool = require('../database');
const helpers = require('./helpers');

passport.use('local.signin', new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, username, password, done) => {
  const rows = await pool.query(`SELECT * FROM users u WHERE u.username = ?`, [username]);
  if (rows.length > 0) {
    const user = rows[0];
    const validPassword = await helpers.matchPassword(password, user.password)
    if (validPassword) {
      done(null, user, req.flash('success', 'Bienvenido ' + user.fullname));
    } else {
      done(null, false, req.flash('error', 'Incorrect Password'));
    }
  } else {
    return done(null, false, req.flash('error', 'The Username does not exists.'));
  }
}));

passport.use('local.signup', new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, username, password, done) => {  
  const {tipodoc, document, fullname, pin, movil } = req.body;
  let newUser = {
    tipodoc,
    document,
    fullname,
    pin,
    movil,
    username,
    password
  };
  newUser.password = await helpers.encryptPassword(password);
  // Saving in the Database
  const result = await pool.query('INSERT INTO users SET ? ', newUser);
  console.log(result);
  newUser.id = result.insertId;
  return done(null, newUser);
}));

passport.serializeUser((user, done) => {
  done(null, user.id); 
});

passport.deserializeUser(async (id, done) => {
  const rows = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
  done(null, rows[0]);
});

/*SELECT u.id,
  u.pin,
  u.fullname,
  u.movil,
  u.username,
  u.password,
  u.transaccion,
  u.recarga,
  p.usuario,
  p.fechactivacion,
  c.categoria,
  t.remitente,
  t.fecha, t.monto,
  m.metodo, e.estado,
  t.aprobada,
  r.venta_mes,
  r.saldo, g.rango,
  g.comision,
  g.ventas,
  g.recargas,
  r.ventasaldo,
  r.acreditadas,
  r.creditomax
  FROM users u 
  INNER JOIN pines p ON u.pin = p.id 
  INNER JOIN categoria c ON p.categoria = c.id 
  INNER JOIN transaccion t ON u.transaccion = t.id 
  INNER JOIN estados e ON t.estado = e.id
  INNER JOIN recargas r ON u.recarga = r.id 
  INNER JOIN metodos m ON t.metodo = m.id 
  INNER JOIN rangos g ON r.rango = g.id            
  WHERE u.username = ?*/