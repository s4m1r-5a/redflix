const express = require('express');
const router = express.Router();
const pool = require('../database');

const passport = require('passport');
const { isLoggedIn } = require('../lib/auth');

// SIGNUP
router.get('/signup', (req, res) => {
  res.render('auth/signup');
});

router.post('/signup', passport.authenticate('local.signup', {
  successRedirect: '/tablero',
  failureRedirect: '/signup',
  failureFlash: true
}));

// SINGIN
router.get('/signin', (req, res) => {
  res.render('auth/signin');
});

router.post('/signin', (req, res, next) => {
  req.check('username', 'Username is Required').notEmpty();
  req.check('password', 'Password is Required').notEmpty();
  const errors = req.validationErrors();
  if (errors.length > 0) {
    req.flash('error', errors[0].msg);
    res.redirect('/signin');
  }
  passport.authenticate('local.signin', {
    successRedirect: '/tablero',
    failureRedirect: '/signin',
    failureFlash: true
  })(req, res, next);
});

router.get('/logout', (req, res) => {
  req.logOut();
  res.redirect('/');
});

router.get('/profile', isLoggedIn, (req, res) => {
  res.render('profile');
});
router.get('/tablero', isLoggedIn, async (req, res) => {
  const links = await pool.query(`SELECT MONTH(v.fechadecompra) Mes, COUNT(*) CantMes, SUM(p.precio) venta, SUM(p.utilidad) utilidad
  FROM ventas v 
  INNER JOIN clientes c ON v.client = c.id 
  INNER JOIN users u ON v.vendedor = u.id
  INNER JOIN products p ON v.product = p.id
  INNER JOIN pines pi ON u.pin = pi.id
  WHERE u.id = ?
      AND YEAR(v.fechadecompra) = YEAR(CURDATE()) 
      AND MONTH(v.fechadecompra) BETWEEN 1 and 12
  GROUP BY MONTH(v.fechadecompra)
  ORDER BY 1 `, [req.user.id]);
  res.render('tablero', { links });
});
router.post('/tablero2', isLoggedIn, async (req, res) => {
  //SELECT MONTH(v.fechadecompra) Mes, COUNT(*) CantMes, FORMAT(SUM(p.precio),2) venta
  const links = await pool.query(`SELECT MONTH(v.fechadecompra) Mes, COUNT(*) CantMes, SUM(p.precio) venta, SUM(p.utilidad) utilidad, c.nombre usari
  FROM ventas v 
  INNER JOIN clientes c ON v.client = c.id 
  INNER JOIN users u ON v.vendedor = u.id
  INNER JOIN products p ON v.product = p.id
  INNER JOIN pines pi ON u.pin = pi.id
  WHERE pi.usuario = ?
      AND YEAR(v.fechadecompra) = YEAR(CURDATE()) 
      AND MONTH(v.fechadecompra) BETWEEN 1 and 12
  GROUP BY MONTH(v.fechadecompra)
  ORDER BY 1`, [req.user.id]);
    res.send(links);
    console.log(links);
});

module.exports = router;
