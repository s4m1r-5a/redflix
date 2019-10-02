const express = require('express');
const router = express.Router();
const pool = require('../database');
const crypto = require('crypto');
const sms = require('../sms.js');


router.get('/', async (req, res) => {
    res.render('index');
});
router.post('/confir', async (req, res) => {
    const { reference_sale, transaction_id, state_pol } = req.body;
    const r = {
        pin : reference_sale || 'samir0',
        transaccion	: transaction_id || 'samir0',
        estado : state_pol || 'samir0'
    };
    sms('573007753983', reference_sale);
    //await pool.query('INSERT INTO payu SET ? ', r);    
});
router.get(`/planes`, async (req, res) => {
    const r = {
        transactionState: req.query.transactionState || 'samir0',
        referenceCode: req.query.referenceCode || 'samir1',
        reference_pol: req.query.reference_pol || 'samir2',
        polPaymentMethod: req.query.polPaymentMethod || 'samir3',
        lapPaymentMethodType: req.query.lapPaymentMethodType || 'samir4',
        TX_VALUE: req.query.TX_VALUE || 'samir5',
        buyerEmail: req.query.buyerEmail || 's4m1r.5a@gmail.com',
        processingDate: req.query.processingDate || 'samir7',
        description: req.query.description || 'samir8',
        mensaje: req.query.message || 'samir9',
        msg: '',
        estado: ''
    }
    let venta,
        c = req.query.iux || '';

    if (c == 'ir') {
        res.render('respuesta');
    } else {
        const links = await pool.query('SELECT * FROM clientes WHERE email = ?', r.buyerEmail);
        if (links.length > 0) {
            r.nombre = links[0].nombre;
            r.movil = links[0].movil;
            venta = {
                fechadecompra: new Date(),
                pin: r.referenceCode,
                puntodeventa: 'IUX',
                vendedor: 15,
                client: links[0].id,
                cajero: 'PAYU',
                product: 2
            }
            let clave = 'jodete cabron este codigo no esta completo aun-' + r.nombre + '-' + r.movil + '-' + r.buyerEmail + '-' + r.referenceCode,
                yave = crypto.createHash('md5').update(clave).digest("hex");
            r.llave = yave
        }

        if (r.transactionState == 4) {
            r.estado = 'success';
            r.msg = "aprobada";
            await pool.query('INSERT INTO ventas SET ? ', venta);
            res.render('respuesta', r);
        } else if (r.transactionState == 6) {
            r.msg = "rechazada";
            r.estado = 'danger';
            res.render('respuesta', r);
        } else if (r.transactionState == 104) {
            r.msg = "Error";
            r.estado = 'danger';
            res.render('respuesta', r);
        } else if (r.transactionState == 7) {
            r.msg = "pendiente";
            r.estado = 'warning';
            await pool.query('INSERT INTO clientes SET ? ', venta);
            res.render('respuesta', r);
        } else {
            res.render('planes');
        }
    }
});

module.exports = router;