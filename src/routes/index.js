const express = require('express');
const router = express.Router();
const request = require('request')
const nodemailer = require('nodemailer')
const pool = require('../database');
const crypto = require('crypto');
const sms = require('../sms.js');


router.get('/', async (req, res) => {
    res.render('index');
});
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
router.post('/confir', async (req, res) => {
    const { reference_sale,
        state_pol,
        response_code_pol,
        payment_method,
        payment_method_type,
        value,
        email_buyer,
        phone,
        additional_value,
        test,
        transaction_date,
        cc_number,
        cc_holder,
        error_code_bank,
        billing_country,
        bank_referenced_name,
        description,
        administrative_fee_tax,
        administrative_fee,
        office_phone,
        response_message_pol,
        error_message_bank,
        shipping_city,
        transaction_id,
        sign,
        tax,
        billing_address,
        payment_method_name,
        pse_bank,
        date,
        nickname_buyer,
        reference_pol,
        currency,
        risk,
        shipping_address,
        bank_id,
        payment_request_state,
        customer_number,
        administrative_fee_base,
        attempts,
        merchant_id,
        exchange_rate,
        shipping_country,
        installments_number,
        franchise,
        payment_method_id,
        extra1,
        extra2,
        antifraudMerchantId,
        extra3,
        nickname_seller,
        ip,
        airline_code,
        billing_city,
        pse_reference1,
        pse_reference3,
        pse_reference2
    } = req.body;
    const r = {
        reference_sale,
        state_pol,
        response_code_pol,
        payment_method,
        payment_method_type,
        value
        //pin : reference_sale || 'samir0',
    };
    const info = await transpoter.sendMail({
        from: "'Suport' <suport@tqtravel.co>",
        to: 's4m1r.5a@gmail.com',
        subject: 'confirmacion de que si sirbe',
        text: `${reference_sale}-${state_pol}-${response_code_pol}-${payment_method}-${payment_method_type}-${value}
        -${email_buyer}-${phone}-${additional_value}-${test}-${transaction_date}-${cc_number}
        -${cc_holder}-${error_code_bank}-${billing_country}- ${bank_referenced_name}-${description}-${administrative_fee_tax}
        -${administrative_fee}-${office_phone}-${response_message_pol}-${error_message_bank}-${shipping_city}
        -${transaction_id}-${sign}-${tax}-${billing_address}-${payment_method_name}-${pse_bank}-${date}-${nickname_buyer}
        -${reference_pol}-${currency}-${risk}-${shipping_address}-${bank_id}-${payment_request_state}-${customer_number}
        -${administrative_fee_base}-${attempts}-${merchant_id}-${exchange_rate}-${shipping_country}-${installments_number}
        -${franchise}-${payment_method_id}-${extra1}-${extra2}-${antifraudMerchantId}-${extra3}-${nickname_seller}-${ip}
        -${airline_code}-${billing_city}-${pse_reference1}-${pse_reference3}-${pse_reference2}`
    });
    sms('573007753983', info.messageId);
    /*console.log(info.messageId);
    
    const pin = await pool.query('SELECT * FROM payu WHERE pin = ?', reference_sale);
    if (pin.length > 0) {
        if (pin.reference_sale)
            await pool.query('UPDATE clientes set ? WHERE movil = ? OR email = ?', [newLink, telephone, buyerEmail]);
    } else {
        await pool.query('INSERT INTO payu SET ? ', r);
    }*/

    //sms('573007753983', reference_sale+' - '+state_pol);     
    //await pool.query('INSERT INTO payu SET ? ', r);
    /*let r = {
        name: 'Samir Saldarriaga',
        movil: '3007753983',
        email: 's4m1r.5a@gmail.com',
        ref: 'S1MJFH544',        
    },
    clave = 'jodete cabron este codigo no esta completo aun-' + r.name + '-' + r.movil + '-' + r.email + '-' + r.ref,
    yave = crypto.createHash('md5').update(clave).digest("hex"),
    url = `https://iux.com.co/x/venta.php?name=${r.name}&movil=${r.movil}&email=${r.email}&ref=${r.ref}&key=${yave}`;
    r.key = yave;
    console.log(url);

    request.post({
        url,
        json: true
    }, (error, res, body) => {
        if (error) {
            console.error(error)
            return
        }
        console.log(`statusCode: ${res.statusCode}`)
        console.log(body)
        //console.log(json);
    })*/
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
router.get('/ad', function (req, res) {
    let r = {
        name: 'Samir Saldarriaga',
        movil: '3007753983',
        email: 's4m1r.5a@gmail.com',
        ref: 'S1MJFH544',
    },
        clave = 'jodete cabron este codigo no esta completo aun-' + r.name + '-' + r.movil + '-' + r.email + '-' + r.ref,
        yave = crypto.createHash('md5').update(clave).digest("hex"),
        url = `https://iux.com.co/x/venta.php?name=${r.name}&movil=${r.movil}&email=${r.email}&ref=${r.ref}&key=${yave}`;
    r.key = yave;
    console.log(url);

    request.post({
        url,
        json: true
    }, (error, res, body) => {
        if (error) {
            console.error(error)
            return
        }
        console.log(`statusCode: ${res.statusCode}`)
        console.log(body)
        //console.log(json);
    })
});
module.exports = router;