const express = require('express');
const router = express.Router();
const pool = require('../database');
router.get('/', async (req, res) => {
    res.render('index');
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

    if (r.transactionState == 4) {
        const links = await pool.query('SELECT * FROM clientes WHERE email = ?', r.buyerEmail);
        if (links.length > 0) {
            r.nombre = links[0].nombre;
            r.movil = links[0].movil;
            r.estado = 'success';
            r.msg = "Transacción aprobada";
            //console.log(r);
        }
        res.render('respuesta', r);
    } else if (r.transactionState == 6) {
        r.msg = "Transacción rechazada";
        r.estado = 'danger';
        res.render('respuesta', r);
    } else if (r.transactionState == 104) {
        r.msg = "Error";
        r.estado = 'danger';
        res.render('respuesta', r);
    } else if (r.transactionState == 7) {
        r.msg = "Transacción pendiente";
        r.estado = 'warning';
        res.render('respuesta', r);
    } else {
        res.render('planes');   
        //res.render('respuesta', r);
    }
});

module.exports = router;