const express = require('express');
const morgan = require('morgan');
const path = require('path');
const exphbs = require('express-handlebars');
const session = require('express-session');
const validator = require('express-validator');
const passport = require('passport');
const flash = require('connect-flash');
const MySQLStore = require('express-mysql-session')(session);
const bodyParser = require('body-parser');
//const {Builder, By, Key, until} = require('selenium-webdriver');
const val = require('../navegacion.js');
const sms = require('./sms.js');
const { database } = require('./keys');
const crypto = require('crypto')


// Intializations
const app = express();
require('./lib/passport');

// Settings
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs({
  defaultLayout: 'main',
  layoutsDir: path.join(app.get('views'), 'layouts'),
  partialsDir: path.join(app.get('views'), 'partials'),
  extname: '.hbs',
  helpers: require('./lib/handlebars')
}))
app.set('view engine', '.hbs');

// Middlewares : significa cada ves que el usuario envia una peticion
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(session({
  secret: 'faztmysqlnodemysql',
  resave: false,
  saveUninitialized: false,
  store: new MySQLStore(database)
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(validator());
/*app.get('/navega', (req, res, next)=>{
  res.end('hola mundo');
  var idd = val.navegar('casperjs netflix.js');
  res.end(idd);
  console.log('hjfdñhñfgd');
});*/

// Global variables
app.use((req, res, next) => {
  app.locals.message = req.flash('message');
  app.locals.success = req.flash('success');
  app.locals.info = req.flash('info');
  app.locals.warning = req.flash('warning');
  app.locals.error = req.flash('error');
  app.locals.user = req.user;
  next();
});

// Routes
app.use(require('./routes/index'));
app.use(require('./routes/authentication'));
app.use('/links', require('./routes/links'));
app.use(require('../navegacion'));
//app.use(require('./sms'));

// Public
app.use(express.static(path.join(__dirname, 'public')));
//sms('573007753983', 'Mensaje de prueba');
// Starting
app.listen(app.get('port'), () => {
  console.log('Server is in port', app.get('port'));
  
});
