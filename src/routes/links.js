const express = require('express');
//const {Builder, By, Key, until} = require('selenium-webdriver');
const router = express.Router();
const crypto = require('crypto');
const pool = require('../database');
const { isLoggedIn, isLogged, Admins } = require('../lib/auth');
const sms = require('../sms.js');
const { registro, Contactos } = require('../keys');
const request = require('request');
const axios = require('axios');
const moment = require('moment');
const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const cron = require("node-cron");
const accountSid = 'AC0db7285fa004f3706457d39b73e8bb37';
const authToken = '28e8f6c7f5108bae9c8d834620a96986';
const client = require('twilio')(accountSid, authToken);

/*cron.schedule("33 20 * * *", async () => {
    var options = {
        method: 'POST',
        url: 'https://eu89.chat-api.com/instance107218/sendMessage?token=5jn3c5dxvcj27fm0',
        form: {
            "phone": '',
            "body": ''
        }
    };
    var confir = 0;
    var datos = `_LISTA DE *CLIENTES*_`;
    for (var i = 0; i < 3; i++) {
        datos += `\n_*Cuentas a vencer ${i == 0 ? 'hoy' : i == 1 ? 'mañana' : 'pasado mañana'} ${moment().add(i, 'days').startOf("days").format('ll')}*_\n\n`;
        const cliente = await pool.query(`SELECT c.nombre, p.producto, v.correo, v.movildecompra, v.client
        FROM ventas v INNER JOIN products p ON v.product = p.id_producto INNER JOIN clientes c ON v.client = c.id WHERE 
        v.fechadevencimiento = ? `, moment().add(i, 'days').startOf("days").format('YYYY-MM-DD'));
        if (cliente.length > 0) {
            confir = 2
            let m = new Date()
            cliente.map((x, p) => {
                pool.query(`SELECT * FROM ventas WHERE client = ${x.client} AND MONTH(fechadevencimiento) BETWEEN ${m.getMonth()} AND 12`)
                    .then(function () {
                        options.form.body = `_Hola *${x.nombre.split(" ")[0]}* tu suscripsion a *NETFLIX* terminara ${i == 0 ? 'hoy' : i == 1 ? 'mañana' : 'pasado mañana'} *${moment().add(i, 'days').startOf("days").format('ll')}*. Realiza el pago oportuno de tu cuenta *${x.correo}* para que no te quedes sin servicio.._ \n\n_Recuerda que si pagas despues de tu fecha de corte ya no podras conservar la misma cuenta se te asignara una nueva_ \n\n_Si quieres conocer las formas de pago escribenos al *3012673944*_\n
                            *RedFlix..*`;
                        options.form.phone = '57' + x.movildecompra
                        request(options, function (error, response, body) {
                            if (error) return console.error('Failed: %s', error.message);
                            console.log('Success: ', body);
                        });
                        datos += `_*${x.nombre.toLowerCase()}* email: *${x.correo}* tel: *${x.movildecompra}*_\n`;
                    })
                    .catch(function () {
                        datos += `_*${x.nombre.toLowerCase()}* email: *${x.correo}* tel: *${x.movildecompra} PAGO*_\n`;
                    });
            });
        }
    }
    if (confir === 2) {
        datos += '\n_Informes *RedFlix...*_'
        options.form.phone = '573012673944'
        options.form.body = datos
        request(options, function (error, response, body) {
            if (error) return console.error('Failed: %s', error.message);
            console.log('Success: ', body);
        });
    };
});*/
cron.schedule("17 10 * * *", async () => {
    var options = {
        method: 'POST',
        url: 'https://eu89.chat-api.com/instance107218/sendMessage?token=5jn3c5dxvcj27fm0',
        form: {
            "phone": '',
            "body": ''
        }
    };
    var confir = 0;
    var datos = `_LISTA DE *CLIENTES*_`;
    for (var i = 0; i < 3; i++) {
        datos += `\n_*Cuentas a vencer ${i == 0 ? 'hoy' : i == 1 ? 'mañana' : 'pasado mañana'} ${moment().add(i, 'days').startOf("days").format('ll')}*_\n\n`;
        const cliente = await pool.query(`SELECT c.nombre, p.producto, v.correo, v.movildecompra, v.client
        FROM ventas v INNER JOIN products p ON v.product = p.id_producto INNER JOIN clientes c ON v.client = c.id WHERE 
        v.fechadevencimiento = ? `, moment().add(i, 'days').startOf("days").format('YYYY-MM-DD'));
        if (cliente.length > 0) {
            confir = 2
            let m = new Date()
            cliente.map((x, p) => {
                options.form.body = `_Hola *${x.nombre.split(" ")[0]}* tu suscripsion a *NETFLIX* terminara ${i == 0 ? 'hoy' : i == 1 ? 'mañana' : 'pasado mañana'} *${moment().add(i, 'days').startOf("days").format('ll')}*. Realiza el pago oportuno de tu cuenta *${x.correo}* para que no te quedes sin servicio.._ \n\n_Recuerda que si pagas despues de tu fecha de corte ya no podras conservar la misma cuenta se te asignara una nueva_ \n\n_Si quieres conocer las formas de pago escribenos al *3012673944*_\n
                            *RedFlix..*`;
                options.form.phone = '57' + x.movildecompra
                request(options, function (error, response, body) {
                    if (error) return console.error('Failed: %s', error.message);
                    console.log('Success: ', body);
                });
                datos += `_*${x.nombre.toLowerCase()}* email: *${x.correo}* tel: *${x.movildecompra}*_\n`;
            });
        }
    }
    if (confir === 2) {
        datos += '\n_Informes *RedFlix...*_'
        options.form.phone = '573012673944'
        options.form.body = datos
        request(options, function (error, response, body) {
            if (error) return console.error('Failed: %s', error.message);
            console.log('Success: ', body);
        });
    };
});

router.get('/prueba', (req, res) => {

    var options = {
        method: 'POST',
        url: 'https://sbapi.bancolombia.com/v1/security/oauth-otp-pymes/oauth2/token',
        headers:
        {
            accept: 'application/json',
            'content-type': 'application/x-www-form-urlencoded',
            authorization: 'Basic base64(37eb1267-6c33-46b1-a76f-33a553fd812f:rT5yY5fH0eR1oL0oI0tV1rX2hS6hU0mH3yG3mW4jU0wD5aC2mP)'
        },
        form:
        {
            grant_type: 'client_credentials',
            client_id: '37eb1267-6c33-46b1-a76f-33a553fd812f',
            client_secret: 'rT5yY5fH0eR1oL0oI0tV1rX2hS6hU0mH3yG3mW4jU0wD5aC2mP',
            scope: 'https://sbapi.bancolombia.com/v2/operations/cross-product/payments/payment-order/transfer/action/registry'
        }
    };

    request(options, function (error, response, body) {
        if (error) return console.error('Failed: %s', error.message);

        console.log('Success: ', body);
    });

    res.send(true);
});

router.get('/add', isLoggedIn, (req, res) => {
    res.render('links/add');
});

//////////////////* PRODUCTOS */////////////////////
router.get('/productos', Admins, (req, res) => {
    res.render('links/productos');
});
router.post('/productos', Admins, async (req, res) => {
    const fila = await pool.query('SELECT * FROM products WHERE usuario = ?', req.user.id);
    respuesta = { "data": fila };
    res.send(respuesta);
});

/////////////////////////////////////////////////////

router.get('/social', isLoggedIn, (req, res) => {
    var options = {
        method: 'POST',
        url: 'https://sbapi.bancolombia.com/v1/security/oauth-otp-pymes/oauth2/token',
        headers:
        {
            accept: 'application/json',
            'content-type': 'application/x-www-form-urlencoded',
            //authorization:  'MzdlYjEyNjctNmMzMy00NmIxLWE3NmYtMzNhNTUzZmQ4MTJmOnNUNnJYMndINGlMNGpKOHFROGVWNmJMNWlKOGNNMmdTMWVMOHNZMnBZMGhMNXZYNGVN'
        },
        form:
        {
            grant_type: 'client_credentials',
            client_id: '37eb1267-6c33-46b1-a76f-33a553fd812f',
            client_secret: 'sT6rX2wH4iL4jJ8qQ8eV6bL5iJ8cM2gS1eL8sY2pY0hL5vX4eM',
            scope: 'SOAT Search'
        }
    };

    request(options, function (error, response, body) {
        if (error) return console.error('Failed: %s', error.message);

        console.log('Success: ', body);
    });
    res.render('links/social');
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
    res.send(cliente);
});
//////////////* REPORTES *//////////////////////////////////
router.get('/reportes', isLoggedIn, async (req, res) => {
    const proveedores = await pool.query('SELECT * FROM proveedores');
    res.render('links/reportes', { proveedores });
});
router.post('/proveedores', isLoggedIn, async (req, res) => {
    const { evento, idv, idp, plan, clave, nombre, correo, hora, corte } = req.body;
    var e;
    if (idp) {
        const horas = await pool.query('SELECT anular FROM ventas WHERE id = ?', idv);
        if (horas[0].anular !== null) {
            hms = horas[0].anular.split(":");
            hm = hora.split(":");
            a = hms[0];
            b = hms[1];
            c = hm[0];
            d = hm[1];
            c > a ? e = 11 : e = (d - b);
        } else {
            e = 11;
        }
        if (e > 9) {
            const proveedores = await pool.query('SELECT * FROM proveedores WHERE id = ?', idp);
            console.log(proveedores[0])
            const { movil } = proveedores[0];
            var options = {
                method: 'POST',
                url: 'https://eu89.chat-api.com/instance107218/sendMessage?token=5jn3c5dxvcj27fm0',
                form: {
                    "phone": '57' + movil,
                    "body": `_Evento: *${evento}*_\n_Nombre: *${nombre}*_\n_Email: *${correo}*_${clave ? '\n_Clave: *' + clave + '*_' : ''}\n_Pantallas: *${plan.slice(5, -16)}*_${corte ? '\n_Corte: *' + moment(corte).format('ll') + '*_' : ''}
            \n*RedFlix..*`
                }
            };
            var dat
            evento === 'Restablecer contraseña' ? dat = { anular: hora } : dat = { proveedor: idp };
            await pool.query('UPDATE ventas set ? WHERE id = ?', [dat, idv]);

            request(options, function (error, response, body) {
                if (error) return console.error('Failed: %s', error.message);
                console.log('Success: ', body);
            });
            res.send({ estado: true, min: true });
        } else {
            res.send({ estado: true, min: false });
        }
    } else {
        res.send({ estado: false, min: false });
    }
});
router.put('/reportes', isLoggedIn, async (req, res) => {
    const { id_venta, correo, clave, clien, smss, movil, fechadevencimiento, fechadeactivacion } = req.body
    const venta = { correo, descripcion: ID(3) + clave }
    if (fechadeactivacion) {
        venta.fechadeactivacion = fechadeactivacion
        venta.fechadevencimiento = fechadevencimiento
    };
    const cliente = await pool.query('SELECT * FROM clientes WHERE id = ?', clien);
    const nombre = cliente[0].nombre.split(" ")
    const msg = `${nombre[0]} tu usuario sera ${correo} clave ${clave}, ${smss}`
    const msg2 = `Hola de nuevo *${nombre[0]}* tu usuario es: *${correo}* y tu contraseña: *${clave}*, recuerda seguir nuestras indicaciones. Estaremos atentos a cualquier solicitud
    *RedFlix..*`
    var options = {
        method: 'POST',
        url: 'https://eu89.chat-api.com/instance107218/sendMessage?token=5jn3c5dxvcj27fm0',
        form: {
            "phone": '57' + movil,
            "body": msg2
        }
    };
    client.messages
        .create({
            from: 'whatsapp:+14155238886',
            body: msg2,
            to: 'whatsapp:+573007753983'
        })
        .then(message => console.log(message.sid));
    sms('57' + movil, msg);
    await pool.query('UPDATE ventas set ? WHERE id = ?', [venta, id_venta]);

    request(options, function (error, response, body) {
        if (error) return console.error('Failed: %s', error.message);

        console.log('Success: ', body);
        datos = response
    });
    res.send(true);
});
router.post('/reportes/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    if (id == 'table2') {

        d = req.user.admin > 0 ? '' : 'v.vendedor = ? AND';

        sql = `SELECT v.id, v.fechadecompra, c.id cliente, v.pin, c.nombre, v.cajero, p.producto, v.correo, v.fechadeactivacion, v.fechadevencimiento, v.movildecompra, 
        v.anular, v.descripcion, v.proveedor FROM ventas v INNER JOIN products p ON v.product = p.id_producto INNER JOIN clientes c ON v.client = c.id WHERE ${d} 
        v.product != 25 AND YEAR(v.fechadecompra) = YEAR(CURDATE()) AND MONTH(v.fechadecompra) BETWEEN 1 and 12`
        const ventas = await pool.query(sql, req.user.id);
        respuesta = { "data": ventas };
        res.send(respuesta);

    } else if (id == 'table3') {

        d = req.user.id == 15 ? '' : 't.acreedor = ?  AND';

        sql = `SELECT t.id, u.fullname, us.id tu, us.fullname venefactor, 
        t.fecha, t.monto, m.metodo, t.creador, t.estado idestado, e.estado, t.recibo, r.id idrecarga, 
        r.transaccion, r.fecha fechtrans, r.saldoanterior, r.numeroventas FROM transacciones t 
        INNER JOIN users u ON t.remitente = u.id INNER JOIN users us ON t.acreedor = us.id 
        INNER JOIN recargas r ON r.transaccion = t.id INNER JOIN metodos m ON t.metodo = m.id 
        INNER JOIN estados e ON t.estado = e.id WHERE ${d} YEAR(t.fecha) = YEAR(CURDATE()) 
        AND MONTH(t.fecha) BETWEEN 1 and 12`

        const solicitudes = await pool.query(sql, req.user.id);
        respuesta = { "data": solicitudes };
        res.send(respuesta);

    } else if (id == 'table4') {

        /*d = req.user.id == 15 ? '' : 'v.vendedor = ? AND';

        sql = `SELECT v.id, v.fechadecompra, p.producto, v.transaccion, u.fullname, t.fecha fechsolicitud, 
        t.monto, m.metodo, t.estado FROM ventas v INNER JOIN products p ON v.product = p.id_producto 
        INNER JOIN transacciones t ON v.transaccion = t.id INNER JOIN users u ON t.acreedor = u.id INNER JOIN metodos m ON t.metodo = m.id
        WHERE ${d} v.product = 25 AND YEAR(v.fechadecompra) = YEAR(CURDATE()) 
        AND MONTH(v.fechadecompra) BETWEEN 1 and 12`

        const ventas = await pool.query(sql, req.user.id);
        respuesta = { "data": ventas };
        res.send(respuesta);*/

        d = req.user.admin > 0 ? '' : 'v.vendedor = ? AND';

        sql = `SELECT v.id, v.fechadecompra, c.nombre, v.vendedor, v.cajero, p.producto, v.rango, p.precio, p.utilidad, r.comision, p.utilidad * r.comision / 100 neta
        FROM ventas v INNER JOIN products p ON v.product = p.id_producto INNER JOIN rangos r ON v.rango = r.id
        INNER JOIN clientes c ON v.client = c.id WHERE ${d} v.product != 25 AND YEAR(v.fechadecompra) = YEAR(CURDATE()) AND MONTH(v.fechadecompra) BETWEEN 1 and 12`
        const ventas = await pool.query(sql, req.user.id);
        respuesta = { "data": ventas };
        res.send(respuesta);
    }

});
router.post('/cobro', isLoggedIn, async (req, res) => {
    const { vendedor } = req.body;
    const persona = await pool.query(`SELECT * FROM users WHERE id = ?`, vendedor);
    res.send(persona);
});
router.put('/cobro', isLoggedIn, async (req, res) => {
    const { vendedor, primera, utilidad, ultima, fechaun, total, fechado, precio, neto, movil, rango, id, fecha } = req.body
    const cobro = {
        fecha, ventas: total, facturas: primera + '-' + ultima,
        fechas: fechaun + '_' + fechado, contratista: id,
        noutilidad: utilidad - neto, utilidad: neto,
        redflix: precio - neto, total: precio
    }

    var options = {
        method: 'POST',
        url: 'https://eu89.chat-api.com/instance107218/sendMessage?token=5jn3c5dxvcj27fm0',
        form: {
            "phone": '57' + movil,
            "body": `_Reportes de *venta*_ \n_De_ *${fechaun}* \n_a_ *${fechado}* \n_Contratista:_ *${vendedor}* \n_Rango:_ *${rango}* \n_Facturas de la_ *${primera}* _a la_ *${ultima}* \n_Numero de ventas:_ *${total}* \n_Utilidad no generada:_ *${Moneda(utilidad - neto)}* \n_Utilida generada:_ *${Moneda(neto)}* \n_RedFlix:_ *${Moneda(precio - neto)}* \n_Total:_ *${Moneda(precio)}* \n
             *RedFlix..*`
        }
    };
    client.messages
        .create({
            from: 'whatsapp:+14155238886',
            body: `_Reportes de *venta*_ \n_De_ *${fechaun}* \n_a_ *${fechado}* \n_Contratista:_ *${vendedor}* \n_Facturas de la_ *${primera}* _a la_ *${ultima}* \n_Numero de ventas:_ *${total}* \n_Utilidad no generada:_ *${Moneda(utilidad - neto)}* \n_Utilida generada:_ *${Moneda(neto)}* \n_RedFlix:_ *${Moneda(precio - neto)}* \n_Total:_ *${Moneda(precio)}* \n
            *RedFlix..*`,
            to: 'whatsapp:+573007753983'
        })
        .then(message => console.log(message.sid));

    sms('57' + movil, `Reportes de venta de la ${primera} a la ${ultima} Numero de ventas ${total} Utilida generada ${Moneda(neto)} Total ${Moneda(precio)} RedFlix`);

    request(options, function (error, response, body) {
        if (error) return console.error('Failed: %s', error.message);
        console.log('Success: ', body);
    });
    await pool.query('INSERT INTO reportes SET ?', cobro);
    res.send(true);
});
////////////////////////////* SOAT *////////////////////////////////////////
router.post('/soat', isLoggedIn, (req, res) => {
    var options = {
        method: 'GET',
        url: 'https://sbapi.bancolombia.com/v1/reference-data/party/party-data-management/vehicles/EXC98E',
        headers:
        {
            accept: 'application/vnd.bancolombia.v1+json',
            authorization: 'Bearer sT6rX2wH4iL4jJ8qQ8eV6bL5iJ8cM2gS1eL8sY2pY0hL5vX4eM'
        }
    };

    request(options, function (error, response, body) {
        if (error) return console.error('Failed: %s', error.message);

        console.log('Success: ', body);
    });
});
//////////////* SOLICITUDES || CONSULTAS *//////////////////////////////////
router.get('/solicitudes', isLoggedIn, (req, res) => {
    res.render('links/solicitudes');
});
router.post('/solicitudes', isLoggedIn, async (req, res) => {
    const solicitudes = await pool.query(`SELECT t.id, u.fullname, us.id tu, us.fullname venefactor, t.fecha, t.monto, m.metodo, t.creador, t.estado idestado, e.estado, t.recibo 
    FROM transacciones t INNER JOIN users u ON t.remitente = u.id INNER JOIN users us ON t.acreedor = us.id INNER JOIN metodos m ON t.metodo = m.id 
    INNER JOIN estados e ON t.estado = e.id WHERE t.remitente = ? OR t.acreedor = ?`, [req.user.id, req.user.id]);
    //YEAR(v.fechadecompra) = YEAR(CURDATE()) AND MONTH(v.fechadecompra) BETWEEN 1 AND 12
    respuesta = { "data": solicitudes };
    res.send(respuesta);
});
router.put('/solicitudes', isLoggedIn, async (req, res) => {
    const { id, estado, mg, monto } = req.body;
    const result = await rango(req.user.id);
    const sald = await saldo('', result, req.user.id, monto);

    if (sald === 'NO') {
        res.send(false);
    } else {
        const d = { estado }
        await pool.query('UPDATE transacciones set ? WHERE id = ?', [d, id]);
        res.send(true);
    }
});
router.post('/cuenta', isLoggedIn, async (req, res) => {
    const { desti, bank } = req.body;
    if (bank !== undefined) {
        const banco = await pool.query(`SELECT * FROM bancos WHERE id_banco = ?`, bank);
        console.log(bank)
        res.send(banco);
    } else {
        const cuentas = await pool.query(`SELECT DISTINCT cuenta FROM transferencias WHERE destinatario = ?`, desti);
        res.send(cuentas);
    }
})
router.post('/cedulav', isLoggedIn, async (req, res) => {
    const { cedula, o } = req.body;
    const APPID_CEDULA = '408';
    const TOKEN_CEDULA = '3cd80102dd1dbb7ba19c58a34eb1b05c';

    function En(datos) {
        res.send(datos);
    };
    var getCI = (cedula) => {
        request({
            url: 'https://cuado.co:444/api/v1?app_id=' + APPID_CEDULA + '&token=' + TOKEN_CEDULA + '&cedula=' + cedula,
            json: true,
            rejectUnauthorized: false
        }, function (error, response, body) {
            var datos;
            if (!error && response.statusCode === 200) {
                if (body.data)
                    datos = body.data;
                else
                    datos = body.error_str;
            } else {
                datos = 'Error de coneccion';
            }
            En(datos)
            return datos
        });
    }
    const documento = await pool.query(`SELECT DISTINCT * FROM clientes WHERE documento = ?`, cedula);

    if (documento.length && o != 1) {
        const dat = await pool.query(`SELECT * FROM transferencias t INNER JOIN clientes c ON t.destinatario = c.id WHERE t.remitente = ? GROUP BY t.destinatario`, documento[0].id);
        res.send([documento, dat]);
    } else if (documento.length && o == 1) {
        const dato = await pool.query(`SELECT DISTINCT * FROM transferencias t INNER JOIN clientes c ON t.destinatario = c.id WHERE t.destinatario = ?`, documento[0].id);
        res.send([documento, dato]);
    } else {
        getCI(cedula)
    }

});
/////////////* VENTAS */////////////////////////////////////
router.get('/ventas2', isLoggedIn, async (req, res) => {
    res.render('links/ventas2');
});
router.get('/ventas', isLoggedIn, async (req, res) => {
    const result = await rango(req.user.id);
    console.log(result)
    res.render('links/ventas');
});
router.post('/ventas', isLoggedIn, async (req, res) => {
    const SCOPES = [
        'https://www.googleapis.com/auth/contacts'
    ];
    const TOKEN_PATH = 'token.json';
    const { prod, product, nombre, user, movil, nompro, contacto, fechadecompra } = req.body;
    const result = await rango(req.user.id);
    const usua = await usuario(req.user.id);
    var sald;

    if (product.charAt(2) !== "") {

        sald = await saldo(product.split(" ")[1], result, req.user.id);

    } else {

        sald = await saldo(product, result, req.user.id);
    }

    let cel = movil.replace(/-/g, "")

    if (cel.length !== 10) {

        req.flash('error', 'Numero movil invalido');
        res.redirect('/links/ventas');

    } else if (sald === 'NO') {

        req.flash('error', 'Transacción no realizada, saldo insuficiente');
        res.redirect('/links/ventas');

    } else {

        if (prod == 'IUX') {
            let producto = product.split(" "),
                pin = producto[0] + ID(8)
            const venta = {
                fechadecompra,
                pin,
                vendedor: usua,
                cajero: req.user.fullname,
                idcajero: req.user.id,
                product: producto[1],
                rango: result,
                movildecompra: cel
            }
            await pool.query('INSERT INTO ventas SET ? ', venta);
            sms('57' + cel, 'Bienvenido a IUX, ingrese a https://iux.com.co/app/login y canjea este Pin ' + pin);
            req.flash('success', 'Pin generado exitosamente');
            res.redirect('/links/ventas');

        } else if (product == '' || nombre == '' || movil == '') {

            req.flash('error', 'Existe un un error en la solicitud');
            res.redirect('/links/ventas');

        } else if (prod == 'NTFX') {

            var idcontacto = '';
            let nombr = nombre.split(" ");
            var correo = nombre.replace(/ /g, "").slice(0, 9) + ID(3) + '@yopmail.com';
            correo = correo.toLowerCase();
            const venta2 = {
                fechadecompra,
                vendedor: usua,
                cajero: req.user.fullname,
                idcajero: req.user.id,
                client: user,
                product,
                correo,
                rango: result,
                movildecompra: cel
            }
            const clite = await pool.query('SELECT * FROM ventas WHERE client = ?', user);
            if (clite.length > 0) {
                venta2.descripcion = clite[0].descripcion
                venta2.correo = clite[0].correo
            }
            var persona = {};
            var person = {
                "resource": {
                    "names": [{ "familyName": nombre.toUpperCase() }],
                    "emailAddresses": [{ "value": correo }],
                    "phoneNumbers": [{ "value": cel, "type": "Personal" }],
                    "organizations": [{ "name": "RedFlix", "title": "Cliente" }]
                }
            };
            const uy = async function () {
                var options = {
                    method: 'POST',
                    url: 'https://eu89.chat-api.com/instance107218/sendMessage?token=5jn3c5dxvcj27fm0',
                    form: {
                        "phone": '57' + cel,
                        "body": ''
                    }
                };
                var dat = {
                    from: 'whatsapp:+14155238886',
                    body: '',
                    to: 'whatsapp:+573007753983'
                }
                const cliente = await pool.query('SELECT * FROM ventas WHERE client = ? AND fechadevencimiento >= ?', [user, fechadecompra]);
                if (cliente.length) {
                    fech = moment(cliente[0].fechadevencimiento).format('YYYY-MM-DD');
                    venta2.fechadevencimiento = fech;
                    sms('57' + cel, `${nombr[0].toUpperCase()} tu actual membresia aun no vence, el dia ${fech} activaremos esta recarga que estas realizando, para mas info escribenos al 3012673944. RedFlix`);
                    options.form.body = `*${nombr[0].toUpperCase()}* tu actual membresia aun no vence, el dia *${fech}* activaremos esta recarga que estas realizando el dia de hoy. Pra mas informacion escribenos al *3012673944* *_RedFlix..._*`
                    dat.body = `*${nombr[0].toUpperCase()}* tu actual membresia aun no vence, el dia *${fech}* activaremos esta recarga que estas realizando el dia de hoy. Pra mas informacion escribenos al *3012673944* *_RedFlix..._*`
                } else {
                    sms('57' + cel, `${nombr[0].toUpperCase()} adquiriste ${prod} ${nompro} en el lapso del día recibirás  tus datos. Si tenes alguna duda escríbenos al 3012673944 Whatsapp. RedFlix`);
                    options.form.body = `Felicidades *${nombr[0].toUpperCase()}* tu pago fue exitoso, en el lapso del diá te enviaremos los datos de tu cuenta, recuerda nuestras recomendaciones para que no presentes problemas con la cuenta \n \n° *No cambies el correo ni la contraseña* \n \n° *Usted tiene derecho a ${nompro}, no intentar conectar mas de los adquiridos* \n \n° *Netflix en muchos casos le restablecera la contraseña cuando detecta un ingreso sospechoso (no necesariamente es malo). Esto sucede cuando se abre en una IP diferente a la que se abrio inicialmente* \n \n° *Si usted no respeta nuestras recomendaciones puede verse perjudicado.* \n \nPra mas informacion escribenos al *3012673944* *_RedFlix..._*`
                    dat.body = `Felicidades *${nombr[0].toUpperCase()}* tu pago fue exitoso, en el lapso del diá te enviaremos los datos de tu cuenta, recuerda nuestras recomendaciones para que no presentes problemas con la cuenta \n \n° *No cambies el correo ni la contraseña* \n \n° *Usted tiene derecho a ${nompro}, no intentar conectar mas de los adquiridos* \n \n° *Netflix en muchos casos le restablecera la contraseña cuando detecta un ingreso sospechoso (no necesariamente es malo). Esto sucede cuando se abre en una IP diferente a la que se abrio inicialmente* \n \n° *Si usted no respeta nuestras recomendaciones puede verse perjudicado.* \n \nPra mas informacion escribenos al *3012673944* *_RedFlix..._*  \n \n${nombre.toUpperCase()} \n${cel} \n${req.user.fullname}`
                }
                await pool.query('INSERT INTO ventas SET ? ', venta2);
                ////// mensajes Twilio ///////////

                client.messages
                    .create(dat)
                    .then(message => console.log(message.sid));

                ////////////////////////////////////////////////
                request(options, function (error, response, body) {
                    if (error) return console.error('Failed: %s', error.message);

                    console.log('Success: ', body);
                    datos = response
                });
                req.flash('success', 'Transacción realizada correctamente');
                res.redirect('/links/ventas');
            }
            if (!user || !contacto) {
                await fs.readFile('credentials.json', (err, content) => {
                    if (err) return console.log('Error loading client secret file:', err);
                    authorize(JSON.parse(content), crearcontacto);
                });
                var contact = async function () {
                    if (idcontacto) {
                        clearInterval(time);
                        if (!user) {
                            persona = { nombre: nombre.toUpperCase(), movil: cel, email1: correo, email3: idcontacto };
                            const clien = await pool.query('INSERT INTO clientes SET ? ', persona);
                            venta2.client = clien.insertId;
                        } else if (!contacto) {
                            const persona = { nombre: nombre.toUpperCase(), email3: idcontacto };
                            await pool.query('UPDATE clientes set ? WHERE id = ?', [persona, user]);
                        }
                        uy();
                    };
                }
                let time = await setInterval(contact, 10);
            } else {
                uy();
            }

            function authorize(credentials, callback) {
                const { client_secret, client_id, redirect_uris } = Contactos;
                const oAuth2Client = new google.auth.OAuth2(
                    client_id, client_secret, redirect_uris);

                // Comprueba si previamente hemos almacenado un token.
                fs.readFile(TOKEN_PATH, (err, token) => {
                    if (err) return getNewToken(oAuth2Client, callback);
                    oAuth2Client.setCredentials(JSON.parse(token));
                    callback(oAuth2Client);
                });
            }
            function getNewToken(oAuth2Client, callback) {
                const authUrl = oAuth2Client.generateAuthUrl({
                    access_type: 'offline',
                    scope: SCOPES,
                });
                console.log('Autorice esta aplicación visitando esta url: ', authUrl);
                const rl = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout,
                });
                rl.question('Ingrese el código de esa página aquí: ', (code) => {
                    rl.close();
                    oAuth2Client.getToken(code, (err, token) => {
                        if (err) return console.error('Error retrieving access token', err);
                        oAuth2Client.setCredentials(token);
                        // Almacenar el token en el disco para posteriores ejecuciones del programa
                        fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                            if (err) return console.error(err);
                            console.log('Token almacenado en', TOKEN_PATH);
                        });
                        callback(oAuth2Client);
                    });
                });
            }
            function crearcontacto(auth) {
                const service = google.people({ version: 'v1', auth });
                service.people.createContact(person, (err, res) => {
                    if (err) return console.error('La API devolvió un ' + err);
                    idcontacto = res.data.resourceName;
                    console.log("Response", res.data.resourceName);
                });
            }
        }
    }
});
router.post('/transferencia', isLoggedIn, async (req, res) => {
    const y = req.body;
    const range = await rango(req.user.id);
    const usua = await usuario(req.user.id);
    const dinero = await saldo('', range, req.user.id, y.monto.replace(/\./g, ''));

    if (dinero === 'NO') {
        req.flash('error', 'Transacción no realizada, saldo insuficiente');
        res.redirect('/links/ventas');
    } else {
        if (!y.remitente.length) {
            const clien = { nombre: y.nombre[0], movil: y.movil[0].replace(/-/g, ""), documento: y.documento[0] };
            const u = await pool.query('INSERT INTO clientes SET ? ', clien);
            y.remitente = u.insertId;
        }
        if (isNaN(y.nombre[1])) {
            const client = { nombre: y.nombre[1], movil: y.movil[1].replace(/-/g, ""), documento: y.documento[1] };
            const p = await pool.query('INSERT INTO clientes SET ? ', client);
            y.nombre[1] = p.insertId;
        }
        const trans = {
            cuenta: y.cuenta,
            banco: y.banco[0],
            remitente: y.remitente,
            destinatario: y.nombre[1],
            tasa: y.tasa,
            monto: y.monto.replace(/\./g, ''),
            cambio: y.cambio.replace(/\./g, ''),
            utilidad: y.utilidads[0],
            uneta: y.utilidads[1]
        };
        const vnta = await pool.query('INSERT INTO transferencias SET ? ', trans);
        const venta = {
            fechadecompra: new Date(),
            pin: y.cuenta,
            vendedor: usua,
            cajero: req.user.fullname,
            idcajero: req.user.id,
            product: 30,
            rango: range,
            movildecompra: y.movil[0].replace(/-/g, ""),
            transferencia: vnta.insertId
        }
        await pool.query('INSERT INTO ventas SET ? ', venta);
        req.flash('success', 'Transacción realizada correctamente');
        res.redirect('/links/ventas');
    }
});
//////////////////////* RECARGAS *//////////////////////////
router.post('/patro', isLoggedIn, async (req, res) => {
    const { quien } = req.body;
    if (quien == "Patrocinador") {
        const fila = await pool.query('SELECT pi.id, p.usuario FROM pines p INNER JOIN pines pi ON p.usuario = pi.acreedor WHERE p.id = ?', req.user.pin);
        res.send(fila);
    }
});
router.get('/recarga', isLoggedIn, (req, res) => {
    res.render('links/recarga');
});
router.post('/recarga', isLoggedIn, async (req, res) => {
    const { monto, metodo, id, quien, pin } = req.body;
    const Transaccion = {
        acreedor: req.user.id,
        fecha: new Date(),
        monto,
        metodo,
        creador: req.user.id,
    };
    if (monto < 600000) {
        Transaccion.rango = 5;
    } else if (monto >= 600000 || monto < 1500000) {
        Transaccion.rango = 4;
    } else if (monto >= 1500000 || monto < 3000000) {
        Transaccion.rango = 3;
    } else if (monto >= 3000000 || monto < 10000000) {
        Transaccion.rango = 2;
    } else if (monto >= 10000000) {
        Transaccion.rango = 1;
    }
    if (quien === 'Patrocinador') {
        Transaccion.remitente = id;
    } else if (quien === 'Redflix') {
        Transaccion.remitente = 15;
        Transaccion.recibo = pin;
    } else {
        const quins = await pool.query('SELECT * FROM pines WHERE id = ?', pin);
        if (quins.length) {
            Transaccion.remitente = quins[0].acreedor;
        } else {
            req.flash('error', 'ID no existe porfavor verifique el ID que esta ingresando e intentelo nuevamente');
            res.redirect('/links/recarga');
        };
    };
    await pool.query('INSERT INTO transacciones SET ? ', Transaccion);
    req.flash('success', 'Solicitud de saldo exitosa exitosa');
    res.redirect('/links/recarga');
});
/////////////////////////* AFILIACION *////////////////////////////////////////
router.post('/afiliado', async (req, res) => {
    const result = await rango(req.user.id);
    const sald = await saldo(26, result, req.user.id);
    const { movil, cajero } = req.body, pin = ID(13);

    if (sald !== 'NO' || cajero !== undefined) {

        const usua = await usuario(req.user.id);
        const nuevoPin = {
            id: pin,
            categoria: 1,
            usuario: req.user.id
        }
        var cel = movil.replace(/-/g, "");
        if (cajero !== undefined) {
            nuevoPin.categoria = 2
        } else {
            const venta = {
                fechadecompra: new Date(),
                pin,
                vendedor: usua,
                cajero: req.user.fullname,
                idcajero: req.user.id,
                product: 26,
                rango: result,
                movildecompra: cel
            }
            await pool.query('INSERT INTO ventas SET ? ', venta);
        }
        await pool.query('INSERT INTO pines SET ? ', nuevoPin);

        var options = {
            method: 'POST',
            url: 'https://eu89.chat-api.com/instance107218/sendMessage?token=5jn3c5dxvcj27fm0',
            form: {
                "phone": '57' + movil,
                "body": `*_¡ Felicidades !_* \n_ya eres parte de nuestro equipo_ *_RedFlix_* _tu_ *ID* _es_ *_${pin}_* \n
                *_Registrarte_* _en:_\n*https://redflixx.herokuapp.com/signup?id=${pin}* \n\n_¡ Si ya te registraste ! y lo que quieres es iniciar sesion ingresa a_ \n*http://redflixx.herokuapp.com/signin* \n\nPara mas informacion puedes escribirnos al *3012673944* \n\n*Bienvenido a* *_RedFlix..._* _la mejor empresa de entretenimiento y contenido digital del país_`
            }
        };
        var dat = {
            from: 'whatsapp:+14155238886',
            body: `_Se creo un nuevo registo con el movil_ *${pin}* \n\n*_RedFlix_*`,
            to: 'whatsapp:+573007753983'
        }
        ////// mensajes Twilio ///////////
        client.messages
            .create(dat)
            .then(message => console.log(message.sid));

        ////////////////////* chat-api *////////////////////////////
        request(options, function (error, response, body) {
            if (error) return console.error('Failed: %s', error.message);
            console.log('Success: ', body);
        });

        sms('57' + movil, `Felicidades ya eres parte de nuestro equipo RedFlix ingresa a https://redflixx.herokuapp.com/signup?id=${pin} y registrarte o canjeando este ID ${pin} de registro`);
        req.flash('success', 'Pin enviado satisfactoriamente, comuniquese con el afiliado para que se registre');
        res.redirect('/tablero');
    } else if (sald === 'NO') {

        req.flash('error', 'Afiliacion no realizada, saldo insuficiente');
        res.redirect('/links/recarga');

    }
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
///////////////////////* */////////////////////////////////////////////////////////
router.post('/canjear', async (req, res) => {
    const { pin } = req.body;
    const rows = await pool.query(`SELECT v.pin, v.client, p.producto, p.precio, p.dias 
    FROM ventas v INNER JOIN products p ON v.product = p.id_producto WHERE pin = ?`, pin);
    if (rows.length > 0 && rows[0].client === null) {
        res.send(rows);
    } else if (rows.length > 0 && rows[0].client !== null) {
        res.send('Este pin ya fue canjeado!');
    } else {
        res.send('Pin invalido!');
    }
});
router.post('/cliente', async (req, res) => {
    let respuesta = "",
        dat;
    const { telephone, buyerFullName, buyerEmail, merchantId, amount, referenceCode, actualizar } = req.body;

    var nombre = normalize(buyerFullName).toUpperCase();
    const newLink = {
        nombre: nombre,
        movil: telephone,
        email: buyerEmail
    };
    let url = `https://iux.com.co/x/venta.php?name=${buyerFullName}&movil=${telephone}&email=${buyerEmail}&ref=cliente&actualiza=${actualizar}`;
    request({
        url,
        json: true
    }, async (error, res, body) => {
        if (error) {
            console.error(error);
            return;
        }

        if (body.length > 0) {
            dat = await body.map((re) => {
                if (re.id === telephone && re.email === buyerEmail) {
                    respuesta = `Todo bien`;
                } else if (re.email !== buyerEmail && re.id === telephone) {
                    respuesta += `Esta cuenta <mark>${buyerEmail}</mark> no coincide con movil <mark>${telephone}</mark>, la cuenta regitrada con este movil es <mark>${re.email}</mark>. `;
                } else if (re.id !== telephone && re.email === buyerEmail) {
                    respuesta += `Este movil <mark>${telephone}</mark> no coincide con la cuenta <mark>${re.email}</mark> el movil registrado con esta cuenta es <mark>${re.id}</mark>. `;
                } else {
                    respuesta = `Todo bien`;
                }
                return re;
            });
        } else {
            respuesta = `Todo bien`;
        }
    });
    var saludo = async function () {
        if (respuesta !== "") {
            clearInterval(time);
            if (respuesta === 'Todo bien') {
                const rows = await pool.query('SELECT * FROM clientes WHERE movil = ? OR email = ?', [telephone, buyerEmail]);
                if (rows.length > 0) {
                    await pool.query('UPDATE clientes SET ? WHERE movil = ? OR email = ?', [newLink, telephone, buyerEmail]);
                } else {
                    await pool.query('INSERT INTO clientes SET ? ', newLink);
                }
                var pin = referenceCode + ID(8),
                    //APIKey = '4Vj8eK4rloUd272L48hsrarnUA',
                    APIKey = 'pGO1M3MA7YziDyS3jps6NtQJAg',
                    key = APIKey + '~' + merchantId + '~' + pin + '~' + amount + '~COP',
                    hash = crypto.createHash('md5').update(key).digest("hex"),
                    cdo;
                cdo = [hash, pin, dat];
                res.send(cdo);
            } else {
                res.send(['smg', respuesta, dat]);
            }
        }
    };
    let time = setInterval(saludo, 500);
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
async function usuario(id) {
    const usuario = await pool.query(`SELECT p.categoria, p.usuario FROM pines p WHERE p.acreedor = ? `, id);
    if (usuario.length > 0 && usuario[0].categoria == 2) {
        return usuario[0].usuario;
    } else {
        return id
    }
};
async function saldo(producto, rango, id, monto) {
    var operacion;
    if (!producto && monto) {
        operacion = monto;
    } else if (!producto && !monto) {
        return 'NO'
    } else {
        const produ = await pool.query(`SELECT precio, utilidad, stock FROM products WHERE id_producto = ?`, producto);
        const rang = await pool.query(`SELECT comision FROM rangos WHERE id = ?`, rango);
        operacion = produ[0].precio - (produ[0].utilidad * rang[0].comision / 100);
    }
    const saldo = await pool.query(`SELECT IF(saldoactual < ${operacion} OR saldoactual IS NULL,'NO','SI') Respuesta FROM users WHERE id = ? `, id);
    return saldo[0].Respuesta
};
async function rango(id) {
    if (id == 15) { return 1 }
    let m = new Date(),
        month = Math.sign(m.getMonth() - 2) > 0 ? m.getMonth() - 2 : 1,
        d, meses = 0,
        mes = 0,
        reportes = new Array(4);
    ////////////* busqueda de ventatas de los ultimos 3 meses *///////////////////////////////////////////////////    
    const reporte = await pool.query(`SELECT MONTH(v.fechadecompra) Mes, COUNT(*) CantMes, SUM(p.precio) venta, SUM(p.utilidad) utilidad
    FROM ventas v 
    INNER JOIN users u ON v.vendedor = u.id
    INNER JOIN products p ON v.product = p.id_producto
    WHERE v.vendedor = ?
        AND YEAR(v.fechadecompra) = YEAR(CURDATE()) 
        AND MONTH(v.fechadecompra) BETWEEN ${month} and 12
    GROUP BY MONTH(v.fechadecompra)
    ORDER BY 1`, id);
    ////////////* busqueda de recargas de saldo de los ultimos 3 meses *///////////////////////////////////////////////////  
    const reporte2 = await pool.query(`SELECT MONTH(t.fecha) Mes, COUNT(*) CanTrans, SUM(t.monto) monto
    FROM transacciones t     
    WHERE t.acreedor = ? AND t.metodo != 5
        AND YEAR(t.fecha) = YEAR(CURDATE()) 
        AND MONTH(t.fecha) BETWEEN ${month} and 12
    GROUP BY MONTH(t.fecha)
    ORDER BY 1`, id);
    ////////////* venta del mes actual */////////////////////////////////////////////////// 
    if (reporte.length > 0 || reporte2.length > 0) {
        await reporte.filter((repor) => {
            return repor.Mes === m.getMonth() + 1;
        }).map((repor) => {
            if (repor.CantMes >= 1 && repor.CantMes <= 49) {
                d = `${repor.Mes} ${repor.CantMes} 5`
                return reportes[0] = 5;
            } else if (repor.CantMes >= 50 && repor.CantMes <= 99) {
                return reportes[0] = 4;
            } else if (repor.CantMes >= 100 && repor.CantMes <= 199) {
                return reportes[0] = 3;
            } else if (repor.CantMes >= 200 && repor.CantMes <= 499) {
                return reportes[0] = 2;
            } else if (repor.CantMes >= 500) {
                return reportes[0] = 1;
            }
        });
        if (!reportes[0]) {
            reportes[0] = 6;
        };
        ////////////*  venta de los ultimos 2 meses mas el actual  */////////////////////////////////////////////////// 
        await reporte.filter((re) => {
            return re.Mes !== m.getMonth() + 1;
        }).map((re) => {
            mes += re.CantMes;
        });
        if (mes >= 1 && mes <= 59) {
            reportes[1] = 5;
        } else if (mes >= 60 && mes <= 149) {
            reportes[1] = 4;
        } else if (mes >= 150 && mes <= 299) {
            reportes[1] = 3;
        } else if (mes >= 300 && mes <= 1499) {
            reportes[1] = 2;
        } else if (mes >= 1500) {
            reportes[1] = 1;
        } else {
            reportes[1] = 6;
        }
        ////////////* rango por recargas de saldo del mes actual */////////////////////////////////////////////////// 
        await reporte2.filter((re) => {
            return re.Mes !== m.getMonth() + 1;
        }).map((re) => {
            meses += re.monto;
        });
        if (meses <= 50000) {
            reportes[2] = 5;
        } else if (meses >= 1500000 && meses <= 4999900) {
            reportes[2] = 4;
        } else if (meses >= 5000000 && meses <= 9999900) {
            reportes[2] = 3;
        } else if (meses >= 10000000 && meses <= 19999900) {
            reportes[2] = 2;
        } else if (meses >= 20000000) {
            reportes[2] = 1;
        } else {
            reportes[2] = 6;
        }
        ////////////* rango por recargas de saldo de los ultimos 3 meses */////////////////////////////////////////////////// 
        await reporte2.filter((rep) => {
            return rep.Mes === m.getMonth() + 1;
        }).map((rep) => {
            if (rep.monto <= 50000) {
                return reportes[3] = 5;
            } else if (rep.monto >= 600000 && rep.monto <= 1499900) {
                return reportes[3] = 4;
            } else if (rep.monto >= 1500000 && rep.monto <= 2999900) {
                return reportes[3] = 3;
            } else if (rep.monto >= 3000000 && rep.monto <= 4999900) {
                return reportes[3] = 2;
            } else if (rep.monto >= 5000000) {
                return reportes[3] = 1;
            } else {
                return reportes[3] = 6;
            }
        });
        console.log(reportes)
        if (!reportes[3]) {
            reportes[3] = 6;
        };
        return Math.min(...reportes);
    } else {
        return 5;
    };
};
var normalize = (function () {
    var from = "ÃÀÁÄÂÈÉËÊÌÍÏÎÒÓÖÔÙÚÜÛãàáäâèéëêìíïîòóöôùúüûÑñÇç",
        to = "AAAAAEEEEIIIIOOOOUUUUaaaaaeeeeiiiioooouuuuNnCc",
        mapping = {};

    for (var i = 0, j = from.length; i < j; i++)
        mapping[from.charAt(i)] = to.charAt(i);

    return function (str) {
        var ret = [];
        for (var i = 0, j = str.length; i < j; i++) {
            var c = str.charAt(i);
            if (mapping.hasOwnProperty(str.charAt(i)))
                ret.push(mapping[c]);
            else
                ret.push(c);
        }
        return ret.join('');
    }

})();
async function Desendentes(id) {
    let reportes = new Array(4)
    let linea = '', lDesc = '';

    const lineaUno = await pool.query(`SELECT acreedor FROM pines WHERE pines.usuario = ?`, id);
    await lineaUno.map((primera) => { lDesc += ` OR pi.acreedor = ${primera.acreedor}`; linea += ` OR pines.usuario = ${primera.acreedor}` });
    const reporte = await pool.query(`SELECT YEAR(v.fechadecompra) Año, MONTH(v.fechadecompra) Mes, COUNT(*) CantMes, ((p.utilidad*r.comision/100)*100/p.utilidad) Porcentag, SUM((p.utilidad*r.comision/100)) Comision, SUM(p.precio) venta, SUM(p.utilidad) utilidad
    FROM ventas v 
    INNER JOIN clientes c ON v.client = c.id 
    INNER JOIN users u ON v.vendedor = u.id
    INNER JOIN products p ON v.product = p.id_producto
    INNER JOIN rangos r ON v.rango = r.id
    INNER JOIN pines pi ON u.pin = pi.id
    WHERE pi.acreedor = 1${lDesc}
    AND MONTH(v.fechadecompra) BETWEEN 1 and 12
    GROUP BY YEAR(v.fechadecompra), MONTH(v.fechadecompra) ASC
    ORDER BY 1`);

    const lineaDos = await pool.query(`SELECT acreedor FROM pines WHERE pines.usuario = 1${linea}`);
    lDesc = '', linea = '';
    await lineaDos.map((primera) => { lDesc += ` OR pi.acreedor = ${primera.acreedor}`; linea += ` OR pines.usuario = ${primera.acreedor}` });
    const reporte2 = await pool.query(`SELECT YEAR(v.fechadecompra) Año, MONTH(v.fechadecompra) Mes, COUNT(*) CantMes, SUM(((p.utilidad*90/100)-(p.utilidad*r.comision/100))) Rango, SUM(p.precio) venta, SUM(p.utilidad) utilidad
    FROM ventas v 
    INNER JOIN clientes c ON v.client = c.id 
    INNER JOIN users u ON v.vendedor = u.id
    INNER JOIN products p ON v.product = p.id_producto
    INNER JOIN rangos r ON v.rango = r.id
    INNER JOIN pines pi ON u.pin = pi.id
    WHERE pi.acreedor = 1${lDesc}
    AND MONTH(v.fechadecompra) BETWEEN 1 and 12
    GROUP BY YEAR(v.fechadecompra), MONTH(v.fechadecompra) ASC
    ORDER BY 1`);

    const lineaTres = await pool.query(`SELECT acreedor FROM pines WHERE pines.usuario =  1${linea}`);
    lDesc = '', linea = '';
    await lineaTres.map((primera) => { lDesc += ` OR pi.acreedor = ${primera.acreedor}` });
    const reporte3 = await pool.query(`SELECT YEAR(v.fechadecompra) Año, MONTH(v.fechadecompra) Mes, COUNT(*) CantMes, SUM(((p.utilidad*90/100)-(p.utilidad*r.comision/100))) Rango, SUM((p.utilidad*r.comision/100)) Comision, SUM(p.precio) venta, SUM(p.utilidad) utilidad
    FROM ventas v 
    INNER JOIN clientes c ON v.client = c.id 
    INNER JOIN users u ON v.vendedor = u.id
    INNER JOIN products p ON v.product = p.id_producto
    INNER JOIN rangos r ON v.rango = r.id
    INNER JOIN pines pi ON u.pin = pi.id
    WHERE pi.acreedor = 1${lDesc}
    AND MONTH(v.fechadecompra) BETWEEN 1 and 12
    GROUP BY YEAR(v.fechadecompra), MONTH(v.fechadecompra) ASC
    ORDER BY 1`);
    mapa = [reporte, reporte2, reporte3]
    if (reporte.length > 0) {
        await mapa.map((r) => {
            console.log(r)
        });

        /*await reporte.filter((re) => {
            return re.Mes !== m.getMonth() + 1;
        }).map((re) => {
            
        });*/

        return Math.min(...reportes);
    } else {
        return 5;
    };
};
function Moneda(valor) {
    valor = valor.toString().split('').reverse().join('').replace(/(?=\d*\.?)(\d{3})/g, '$1.');
    valor = valor.split('').reverse().join('').replace(/^[\.]/, '');
    return valor;
}
module.exports = router;