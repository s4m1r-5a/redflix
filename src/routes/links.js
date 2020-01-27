const express = require('express');
//const {Builder, By, Key, until} = require('selenium-webdriver');
const router = express.Router();
const crypto = require('crypto');
const pool = require('../database');
const { isLoggedIn, isLogged, Admins } = require('../lib/auth');
const sms = require('../sms.js');
const { registro } = require('../keys');
const request = require('request')
const moment = require('moment');

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
    console.log(respuesta)
    res.send(respuesta);
});

/////////////////////////////////////////////////////
router.get('/calendar', isLoggedIn, (req, res) => {
    console.log('si llega');
    res.render('links/calendar');
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
//////////////* REPORTES *//////////////////////////////////
router.get('/reportes', Admins, (req, res) => {
    //Desendentes(15)
    res.render('links/reportes');
});
router.post('/reportes', Admins, async (req, res) => {
    const ventas = await pool.query(`SELECT * FROM ventas v INNER JOIN products p ON v.product = p.id_producto 
    WHERE YEAR(v.fechadecompra) = YEAR(CURDATE()) AND MONTH(v.fechadecompra) BETWEEN 1 and 12`);
    respuesta = { "data": ventas };
    res.send(respuesta);
});
//////////////* SOLICITUDES *//////////////////////////////////
router.get('/solicitudes', isLoggedIn, (req, res) => {
    res.render('links/solicitudes');
});
router.post('/solicitudes', isLoggedIn, async (req, res) => {
    const solicitudes = await pool.query(`SELECT t.id, u.fullname, us.id tu, us.fullname venefactor, t.fecha, t.monto, m.metodo, t.creador, t.estado idestado, e.estado, t.recibo 
    FROM transacciones t INNER JOIN users u ON t.remitente = u.id INNER JOIN users us ON t.acreedor = us.id INNER JOIN metodos m ON t.metodo = m.id 
    INNER JOIN estados e ON t.estado = e.id WHERE t.remitente = ? OR t.acreedor = ?`,[req.user.id, req.user.id]);
    //YEAR(v.fechadecompra) = YEAR(CURDATE()) AND MONTH(v.fechadecompra) BETWEEN 1 AND 12
    respuesta = { "data": solicitudes };
    res.send(respuesta);
});
router.put('/solicitudes', isLoggedIn, async (req, res) => {
    const {id, estado, mg} = req.body
    const d = {estado}
    console.log(req.body)
    await pool.query('UPDATE transacciones set ? WHERE id = ?', [d, id]);
    res.send(mg);
});
/////////////* VENTAS */////////////////////////////////////
router.get('/ventas', isLoggedIn, (req, res) => {
    res.render('links/ventas');
});
router.put('/ventas', isLoggedIn, async (req, res) => {
    const { id_venta, correo, clave, client, smss, movil, fechadevencimiento, fechadeactivacion } = req.body
    const venta = { correo, fechadeactivacion, fechadevencimiento }
    const cliente = await pool.query('SELECT * FROM clientes WHERE id = ?', client);
    const nombre = cliente[0].nombre.split(" ")
    const msg = `${nombre[0]} tu usuario sera ${correo} clave ${clave}, ${smss}`
    sms('57' + movil, msg);
    await pool.query('UPDATE ventas set ? WHERE id = ?', [venta, id_venta]);
    res.send(true);
});
router.post('/ventas', isLoggedIn, async (req, res) => {
    const { prod, product, nombre, user, movil, nompro } = req.body;
    const result = await rango(req.user.id);
    const usua = await usuario(req.user.id);
    const sald = await saldo(27, result, req.user.id);
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
                fechadecompra: new Date(),
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
            let nombr = nombre.split(" ");
            var correo = nombre.replace(/ /g, "").slice(0, 9) + ID(3) + '@yopmail.com';
            correo = correo.toLowerCase();
            const venta2 = {
                fechadecompra: new Date(),
                vendedor: usua,
                cajero: req.user.fullname,
                idcajero: req.user.id,
                client: user,
                product,
                correo,
                rango: result,
                movildecompra: cel
            }
            const cliente = await pool.query('SELECT * FROM ventas WHERE client = ? AND fechadevencimiento >= ?', [user, new Date()]);
            if (cliente.length) {
                fech = moment(cliente[0].fechadevencimiento).format('YYYY-MM-DD');
                venta2.fechadevencimiento = fech;
                sms('57' + cel, `${nombr[0].toUpperCase()} tu actual membresia aun no vence, el dia ${fech} activaremos esta recarga que estas realizando, para mas info escribenos al 3012673944. RedFlix`);
            } else {
                sms('57' + cel, `${nombr[0].toUpperCase()} adquiriste ${prod} ${nompro} en el lapso del día recibirás  tus datos. Si tenes alguna duda escríbenos al 3012673944 Whatsapp. RedFlix`);
            }
            await pool.query('INSERT INTO ventas SET ? ', venta2);
            req.flash('success', 'Transacción realizada correctamente');
            res.redirect('/links/ventas');
        }
    }
});
//////////////////////* RECARGAS *//////////////////////////
router.post('/patro', isLoggedIn, async (req, res) => {
    const { quien } = req.body;
    if (quien == "Patrocinador") {
        const fila = await pool.query('SELECT * FROM pines WHERE id = ?', req.user.pin);
        res.send(fila);
    }
});
router.post('/recarga', isLoggedIn, async (req, res) => {
    console.log(req.body)
    console.log()
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
    } else if (monto >= 600000 || monto < 1500000 ) {
        Transaccion.rango = 4;
    } else if (monto >= 1500000 || monto < 3000000 ) {
        Transaccion.rango = 3;
    } else if (monto >= 3000000 || monto < 10000000 ) {
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
/////////////////////////* *////////////////////////////////////////
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
    const rows = await pool.query(`SELECT v.pin, v.client, p.producto, p.precio, p.dias 
    FROM ventas v INNER JOIN products p ON v.product = p.id_producto WHERE pin = ?`, pin);
    console.log(rows)
    if (rows.length > 0 && rows[0].client === null) {
        res.send(rows);
    } else if (rows.length > 0 && rows[0].client !== null) {
        res.send('Este pin ya fue canjeado!');
    } else {
        res.send('Pin invalido!');
    }
});

router.post('/afiliado', async (req, res) => {
    const { movil, cajero } = req.body, pin = ID(13);
    const nuevoPin = {
        id: pin,
        categoria: 1,
        usuario: req.user.id
    }
    console.log(pin);
    if (cajero !== undefined) {
        console.log(pin);
        nuevoPin.categoria = 2
    }
    await pool.query('INSERT INTO pines SET ? ', nuevoPin);
    sms('57' + movil, 'Bienvenido a RedFlix tu ID sera ' + pin);
    req.flash('success', 'Pin del afiliado exitoso');
    res.redirect('/tablero');
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
        //console.log(Array.isArray(body))
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
async function usuario(id) {
    const usuario = await pool.query(`SELECT p.categoria, p.usuario FROM pines p WHERE p.acreedor = ? `, id);
    if (usuario.length > 0 && usuario[0].categoria == 2) {
        console.log(usuario[0].usuario)
        return usuario[0].usuario;
    } else {
        console.log(id)
        return id
    }
};
async function saldo(producto, rango, id) {
    const produ = await pool.query(`SELECT precio, utilidad, stock FROM products WHERE id_producto = ?`, producto);
    const rang = await pool.query(`SELECT comision FROM rangos WHERE id = ?`, rango);
    const operacion = produ[0].precio - (produ[0].utilidad * rang[0].comision / 100);
    const saldo = await pool.query(`SELECT IF(saldoactual < ${operacion} OR saldoactual IS NULL,'NO','SI') Respuesta FROM users WHERE id = ? `, id);
    return saldo[0].Respuesta
};
async function rango(id) {
    let m = new Date(),
        month = m.getMonth() - 2,
        d, meses = 0,
        mes = 0,
        reportes = new Array(4);
    const reporte = await pool.query(`SELECT MONTH(v.fechadecompra) Mes, COUNT(*) CantMes, SUM(p.precio) venta, SUM(p.utilidad) utilidad, c.nombre usari
    FROM ventas v 
    INNER JOIN clientes c ON v.client = c.id 
    INNER JOIN users u ON v.vendedor = u.id
    INNER JOIN products p ON v.product = p.id_producto
    INNER JOIN pines pi ON u.pin = pi.id
    WHERE pi.acreedor = ?
        AND YEAR(v.fechadecompra) = YEAR(CURDATE()) 
        AND MONTH(v.fechadecompra) BETWEEN ${month} and 12
    GROUP BY MONTH(v.fechadecompra)
    ORDER BY 1`, id);
    const reporte2 = await pool.query(`SELECT MONTH(t.fecha) Mes, COUNT(*) CanTrans, SUM(t.monto) monto
    FROM transacciones t     
    WHERE t.acreedor = ?
        AND YEAR(t.fecha) = YEAR(CURDATE()) 
        AND MONTH(t.fecha) BETWEEN ${month} and 12
    GROUP BY MONTH(t.fecha)
    ORDER BY 1`, id);

    if (reporte.length > 0) {
        await reporte.filter((repor) => {
            return repor.Mes === m.getMonth() + 1;
            //return repor.Mes === 9;
        }).map((repor) => {
            if (repor.CantMes >= 1 && repor.CantMes <= 19) {
                d = `${repor.Mes} ${repor.CantMes} 5`
                return reportes[0] = 5;
            } else if (repor.CantMes >= 20 && repor.CantMes <= 49) {
                return reportes[0] = 4;
            } else if (repor.CantMes >= 50 && repor.CantMes <= 99) {
                return reportes[0] = 3;
            } else if (repor.CantMes >= 100 && repor.CantMes <= 499) {
                return reportes[0] = 2;
            } else if (repor.CantMes >= 500) {
                return reportes[0] = 1;
            }
        });
        if (!reportes[0]) {
            reportes[0] = 6;
        };
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

        await reporte2.filter((re) => {
            return re.Mes !== m.getMonth() + 1;
        }).map((re) => {
            meses += re.monto;
        });
        if (meses <= 999000) {
            reportes[2] = 5;
        } else if (meses >= 1000000 && meses <= 2999000) {
            reportes[2] = 4;
        } else if (meses >= 3000000 && meses <= 4999000) {
            reportes[2] = 3;
        } else if (meses >= 5000000 && meses <= 14999000) {
            reportes[2] = 2;
        } else if (meses >= 15000000) {
            reportes[2] = 1;
        } else {
            reportes[2] = 6;
        }
        await reporte2.filter((rep) => {
            return rep.Mes === m.getMonth() + 1;
        }).map((rep) => {
            if (rep.monto <= 599000) {
                return reportes[3] = 5;
            } else if (rep.monto >= 600000 && rep.monto <= 1499000) {
                return reportes[3] = 4;
            } else if (rep.monto >= 1500000 && rep.monto <= 2999000) {
                return reportes[3] = 3;
            } else if (rep.monto >= 3000000 && rep.monto <= 9999000) {
                return reportes[3] = 2;
            } else if (rep.monto >= 10000000) {
                return reportes[3] = 1;
            } else {
                return reportes[3] = 6;
            }
        });
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
    //console.log(reporte)

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
    //console.log(reporte2)

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
    //console.log(reporte3)
    mapa = [reporte, reporte2, reporte3]
    //console.log(mapa) 
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
module.exports = router;