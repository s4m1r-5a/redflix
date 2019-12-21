const express = require('express');
//const {Builder, By, Key, until} = require('selenium-webdriver');
const router = express.Router();
const crypto = require('crypto');
const pool = require('../database');
const { isLoggedIn } = require('../lib/auth');
const sms = require('../sms.js');
const { registro } = require('../keys');
const request = require('request')

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

router.post('/add', async(req, res) => {
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
router.post('/movil', async(req, res) => {
    const { movil } = req.body;
    const cliente = await pool.query('SELECT * FROM clientes WHERE movil = ?', movil);
    //console.log(req.body);
    res.send(cliente);
});
router.post('/ventas', async(req, res) => {
    const { prod, product, nombre, user, movil } = req.body;
    const result = await rango(req.user.id);
    const usua = await usuario(req.user.id);
    const sald = await saldo(27, result, req.user.id);
    let cel = movil.replace(/-/g, ""),
        producto = product.split(" "),
        pin = producto[0] + ID(8)

    if (cel.length !== 10) {
        req.flash('error', 'Numero movil invalido');
        res.redirect('/links/ventas');
    } else if (sald === 'NO') {
        req.flash('error', 'Transacción no realizada, saldo insuficiente');
        res.redirect('/links/ventas');
    } else {
        if (prod == 'IUX') {
            const venta = {
                    pin,
                    vendedor: usua,
                    cajero: req.user.fullname,
                    idcajero: req.user.id,
                    product: producto[1],
                    rango: result,
                    movildecompra: cel
                }
                //console.log(venta)            
            await pool.query('INSERT INTO ventas SET ? ', venta);
            sms('57' + cel, 'Bienvenido a IUX, ingrese a https://iux.com.co/app y canjea este Pin ' + pin);
            req.flash('success', 'Pin generado exitosamente');
            res.redirect('/links/ventas');
        } else if (producto == '' || nombre == '' || movil == '') {
            req.flash('error', 'Existe un un error en la solicitud');
            res.redirect('/links/ventas');
        } else {
            const venta2 = {
                    vendedor: req.user.id,
                    cliente: user,
                    product,
                    rango: req.user.rango
                }
                //await pool.query('INSERT INTO transaccion SET ? ', newLink);
            console.log(venta);
            req.flash('error', 'Transacción no realizada');
            res.redirect('/links/ventas');
        }
    }
});
router.post('/patro', async(req, res) => {
    const { quien } = req.body;
    if (quien == "Patrocinador") {
        const fila = await pool.query('SELECT * FROM pines WHERE id = ?', req.user.pin);
        res.send(fila);
    }
});

router.post('/recarga', async(req, res) => {
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

router.post('/id', async(req, res) => {
    const { pin } = req.body;
    const rows = await pool.query('SELECT * FROM pines WHERE id = ?', pin);
    if (rows.length > 0 && rows[0].acreedor === null) {
        registro.pin = pin;
        res.send('Exitoso');
    } else {
        res.send('Pin de registro invalido, comuniquese con su distribuidor!');
    }
});
router.post('/canjear', async(req, res) => {
    const { pin } = req.body;
    const rows = await pool.query(`SELECT v.pin, v.client, p.producto, p.precio, p.dias 
    FROM ventas v INNER JOIN products p ON v.product = p.id WHERE pin = ?`, pin);
    console.log(rows)
    if (rows.length > 0 && rows[0].client === null) {
        res.send(rows);
    } else if (rows.length > 0 && rows[0].client !== null) {
        res.send('Este pin ya fue canjeado!');
    } else {
        res.send('Pin invalido!');
    }
});
router.post('/iux', async(req, res) => {
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

router.post('/afiliado', async(req, res) => {
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

router.post('/cliente', async(req, res) => {
    let respuesta = "",
        dat;
    const { telephone, buyerFullName, buyerEmail, merchantId, amount, referenceCode, actualizar } = req.body;

    var nombre = normalize(buyerFullName).toUpperCase();
    const newLink = {
        nombre: nombre,
        movil: telephone,
        email: buyerEmail
    };
    console.log(newLink);
    let url = `https://iux.com.co/x/venta.php?name=${buyerFullName}&movil=${telephone}&email=${buyerEmail}&ref=cliente&actualiza=${actualizar}`;
    request({
        url,
        json: true
    }, async(error, res, body) => {
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
    var saludo = async function() {
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

router.get('/', isLoggedIn, async(req, res) => {
    const links = await pool.query('SELECT * FROM links WHERE user_id = ? ', [req.user.id]);
    res.render('links/list', { links });
});

router.get('/delete/:id', async(req, res) => {
    const { id } = req.params;
    await pool.query('DELETE FROM links WHERE ID = ?', [id]);
    req.flash('success', 'Link Removed Successfully');
    res.redirect('/links');
});

router.get('/edit/:id', async(req, res) => {
    const links = await pool.query('SELECT * FROM links WHERE id = ?', [id]);
    const { id } = req.params;
    console.log(links);
    res.render('/links/edit', { link: links[0] });
});

router.post('/edit/:id', async(req, res) => {
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
    const produ = await pool.query(`SELECT precio, utilidad, stock FROM products WHERE id = ?`, producto);
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
    INNER JOIN products p ON v.product = p.id
    INNER JOIN pines pi ON u.pin = pi.id
    WHERE pi.usuario = ?
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
var normalize = (function() {
    var from = "ÃÀÁÄÂÈÉËÊÌÍÏÎÒÓÖÔÙÚÜÛãàáäâèéëêìíïîòóöôùúüûÑñÇç",
        to = "AAAAAEEEEIIIIOOOOUUUUaaaaaeeeeiiiioooouuuuNnCc",
        mapping = {};

    for (var i = 0, j = from.length; i < j; i++)
        mapping[from.charAt(i)] = to.charAt(i);

    return function(str) {
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

var reemplazarAcentos = function(cadena) {
    var chars = {
        "á": "a",
        "é": "e",
        "í": "i",
        "ó": "o",
        "ú": "u",
        "à": "a",
        "è": "e",
        "ì": "i",
        "ò": "o",
        "ù": "u",
        "ñ": "n",
        "Á": "A",
        "É": "E",
        "Í": "I",
        "Ó": "O",
        "Ú": "U",
        "À": "A",
        "È": "E",
        "Ì": "I",
        "Ò": "O",
        "Ù": "U",
        "Ñ": "N"
    }
    var expr = /[áàéèíìóòúùñ]/ig;
    var res = cadena.replace(expr, function(e) { return chars[e] });
    return res;
}
module.exports = router;