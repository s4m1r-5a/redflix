const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    res.render('index');
});
router.get('/planes', async (req, res) => {
    res.render('planes');
});

module.exports = router;