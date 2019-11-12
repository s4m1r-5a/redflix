const express = require('express');
//const {Builder, By, Key, until} = require('selenium-webdriver');
const router = express.Router();
const crypto = require('crypto');
const pool = require('../database');
const { isLoggedIn } = require('../lib/auth');
const sms = require('../sms.js');
const { registro } = require('../keys');


router.get('/add', isLoggedIn, (req, res) => {
    res.render('links/add');
});
router.get('/calendar', isLoggedIn, (req, res) => {
    console.log('si llega');
    res.render('links/calendar');
});
router.get('/ventas', isLoggedIn, (req, res) => {
    res.render('links/ventas');
});
router.get('/social', isLoggedIn, (req, res) => {
    res.render('links/social');
});
router.get('/recarga', isLoggedIn, (req, res) => {
    res.render('links/recarga');
});

router.post('/add', async (req, res) => {
    const { title, url, description } = req.body;
    const newLink = {
        title,
        url,
        description,
        user_id: req.user.id
    };
    await pool.query('INSERT INTO links set ?', [newLink]);
    req.flash('success', 'Link Saved Successfully');
    res.redirect('/links');
});
router.post('/movil', async (req, res) => {
    const { movil } = req.body;    
    const cliente = await pool.query('SELECT * FROM clientes WHERE movil = ?', movil);
    //console.log(req.body);
    res.send(cliente);
});
router.post('/ventas', async (req, res) => {
    const { prod, producto, nombre, user, movil } = req.body;
    if(prod == 'IUX'){
        let cel = movil.replace(/-/g, "");
        const venta = {
            producto,
            pin,
            movil : cel
        }
        //await pool.query('INSERT INTO transaccion SET ? ', newLink);
        req.flash('success', 'Pin generado exitosamente');
        res.redirect('/links/ventas');
    } else if(producto == '' || nombre == '' || movil == ''){
        req.flash('error', 'Existe un un error en la solicitud');
        res.redirect('/links/ventas'); 
    } else {
        const venta = {
            vendedor: req.user.id,
            cliente: user,
            producto,            
            rango: req.user.rango           
        }
        //await pool.query('INSERT INTO transaccion SET ? ', newLink);
        console.log(venta);
        req.flash('success', 'Solicitud exitosa');
        res.redirect('/links/ventas');
    }      
});
router.post('/patro', async (req, res) => {
    const { quien } = req.body;
    if (quien == "Patrocinador") {
        const fila = await pool.query('SELECT * FROM pines WHERE id = ?', req.user.pin);
        res.send(fila);
    }
});

router.post('/recarga', async (req, res) => {
    const { monto, metodo, id } = req.body;
    const newLink = {
        remitente: id,
        acreedor: req.user.id,
        monto,
        metodo,
        creador: req.user.id,
    };
    await pool.query('INSERT INTO transaccion SET ? ', newLink);
    req.flash('success', 'Solicitud exitosa');
    res.render('/links/recarga');
});

router.post('/id', async (req, res) => {
    const { pin } = req.body;    
    const rows = await pool.query('SELECT * FROM pines WHERE id = ?', pin);
    if (rows.length > 0 && rows[0].acreedor === null) {
        registro.pin = pin;
        res.send('Exitoso');
    } else {
        res.send('Pin de registro invalido, comuniquese con su distribuidor!');
    }
});
router.post('/canjear', async (req, res) => {
    const { pin } = req.body;    
    const rows = await pool.query(`SELECT v.pin, p.producto, p.precio, p.dias 
    FROM ventas v INNER JOIN products p ON v.product = p.id WHERE pin = ?`, pin);
    if (rows.length > 0) {        
        res.send(rows);
    } else {
        res.send('Pin invalido!');
    }
});
router.post('/iux', async (req, res) => {
    console.log(req.body);
    /*const { pin } = req.body;
    const rows = await pool.query('SELECT * FROM pines WHERE id = ?', pin);
    console.log(rows);
    if (rows.length > 0) {
        //res.send("este pin es invalido"); AND 
        res.send({ rows });
    } else {
        res.send('Pin de registro invalido, comuniquese con su distribuidor!');
        req.flash('error', 'Id de registro incorrecto');
    }*/
});

router.post('/afiliado', async (req, res) => {
    const { movil, cajero } = req.body, pin = ID(13);
    const nuevoPin = {
        id : pin,
        categoria : 1,
        usuario : req.user.id
    }
    console.log(pin);
    if (cajero !== undefined){
        console.log(pin);
        nuevoPin.categoria = 2
    }
    await pool.query('INSERT INTO pines SET ? ', nuevoPin);
    sms('57' + movil, 'Bienvenido a RedFlix tu ID sera ' + pin);
    req.flash('success', 'Pin del afiliado exitoso');
    res.redirect('/tablero');
});

router.post('/cliente', async (req, res) => {
    const { telephone, buyerFullName, buyerEmail, merchantId, amount, referenceCode } = req.body;
    console.log(buyerFullName)
    var nombre = buyerFullName.toUpperCase();
    const newLink = {
        nombre: nombre,
        movil: telephone,
        email: buyerEmail
    };
    const rows = await pool.query('SELECT * FROM clientes WHERE movil = ? OR email = ?', [telephone, buyerEmail]);
    if (rows.length > 0) {
        await pool.query('UPDATE clientes set ? WHERE movil = ? OR email = ?', [newLink, telephone, buyerEmail]);
    } else {
        await pool.query('INSERT INTO clientes SET ? ', newLink);
    }
    var pin = referenceCode + ID(8),
        //APIKey = '4Vj8eK4rloUd272L48hsrarnUA',
        APIKey = 'pGO1M3MA7YziDyS3jps6NtQJAg',
        key = APIKey + '~' + merchantId + '~' + pin + '~' + amount + '~COP',
        hash = crypto.createHash('md5').update(key).digest("hex"),
        cdo;
    cdo = [hash, pin];
    res.send(cdo);
});

router.get('/', isLoggedIn, async (req, res) => {
    const links = await pool.query('SELECT * FROM links WHERE user_id = ? ', [req.user.id]);
    res.render('links/list', { links });
});

router.get('/delete/:id', async (req, res) => {
    const { id } = req.params;
    await pool.query('DELETE FROM links WHERE ID = ?', [id]);
    req.flash('success', 'Link Removed Successfully');
    res.redirect('/links');
});

router.get('/edit/:id', async (req, res) => {
    const links = await pool.query('SELECT * FROM links WHERE id = ?', [id]);
    const { id } = req.params;
    console.log(links);
    res.render('/links/edit', { link: links[0] });
});

router.post('/edit/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description, url } = req.body;
    const newLink = {
        title,
        description,
        url
    };
    await pool.query('UPDATE links set ? WHERE id = ?', [newLink, id]);
    req.flash('success', 'Link Updated Successfully');
    res.redirect('/links');
});

//"a0Ab1Bc2Cd3De4Ef5Fg6Gh7Hi8Ij9Jk0KLm1Mn2No3Op4Pq5Qr6Rs7St8Tu9Uv0Vw1Wx2Xy3Yz4Z"
function ID(lon) {
    let chars = "0A1B2C3D4E5F6G7H8I9J0KL1M2N3O4P5Q6R7S8T9U0V1W2X3Y4Z",
    code = "";
    for (x = 0; x < lon; x++) {
        let rand = Math.floor(Math.random() * chars.length);
        code += chars.substr(rand, 1);
    };
    return code;
};

module.exports = router;