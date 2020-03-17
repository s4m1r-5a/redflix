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
const val = require('../navegacion.js');
const sms = require('./sms.js');
const { database, Contactos } = require('./keys');
const crypto = require('crypto')
const nodemailer = require('nodemailer')

const transpoter = nodemailer.createTransport({
  host: 'smtp.hostinger.co',
  port: 587,
  secure: false,
  auth: {
    user: 'suport@tqtravel.co',
    pass: '123456789'
  },
  tls: {
    rejectUnauthorized: false
  }
})

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
app.use(bodyParser.urlencoded({ extended: false }));
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

// Global variables
app.use((req, res, next) => {
  app.locals.message = req.flash('message');
  app.locals.success = req.flash('success');
  app.locals.info = req.flash('info');
  app.locals.warning = req.flash('warning');
  app.locals.error = req.flash('error');
  app.locals.regis = req.regis;
  app.locals.user = req.user;
  next();
});

// Routes
app.use(require('./routes/index'));
app.use(require('./routes/authentication'));
app.use('/links', require('./routes/links'));
app.use(require('../navegacion'));

// Public
app.use(express.static(path.join(__dirname, 'public')));

// Starting
app.listen(app.get('port'), () => {
  console.log('Server is in port', app.get('port'));

});
/*
function listConnectionNames(auth) {
  const service = google.people({ version: 'v1', auth });
  service.people.connections.list({
    resourceName: 'people/me',
    pageSize: 10,
    personFields: 'names,emailAddresses,events,addresses,residences,phoneNumbers,organizations,ageRanges',
  }, (err, res) => {
    if (err) return console.error('The API returned an error: ' + err);
    const connections = res.data.connections;
    if (connections) {
      connections.forEach((person) => {
        //console.log(person);
        if (person.names && person.organizations && person.organizations[0].name === 'RedFlix' && person.phoneNumbers && person.phoneNumbers.length > 0) {
          console.log(person.names[0].displayName, person.phoneNumbers[0].canonicalForm, person.organizations[0].name);
        } else {
          console.log('No display name found for connection.');
        }
      });
    } else {
      console.log('No connections found.');
    }
  });
}
function crearcontacto(auth) {
  const service = google.people({ version: 'v1', auth });
  service.people.createContact({
    "resource": {
      "names": [
        {
          "familyName": "euliecer gaitan"
        }
      ],
      "emailAddresses": [
        {
          "value": "euliecer@yopmail.com"
        }
      ],
      "phoneNumbers": [
        {
          "value": "3007753982",
          "type": "Personal"
        }
      ],
      "organizations": [
        {
          "name": "RedFlix",
          "title": "Cliente"
        }
      ]
    }
  }, (err, res) => {
    if (err) return console.error('La API devolvió un ' + err);
    console.log("Response", res);
  });
}
function consultar(auth) {
  const service = google.people({ version: 'v1', auth });
  service.people.get({
    resourceName: 'people/c4346095922586713777',
    personFields: 'names,emailAddresses,events,addresses,residences,phoneNumbers,organizations,ageRanges',
  }, (err, res) => {
    if (err) return console.error('La API devolvió un ' + err);
    console.log("Persona", res.data.resourceName);
  });
}*/