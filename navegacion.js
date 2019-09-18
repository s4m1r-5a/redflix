const express = require('express');
const router = express.Router();
const execSync = require('child_process').execSync;

router.post('/navegar', async (req, res) => {
    const { pin, usermane, password } = req.body;
    const newLink = {
        pin,
        usermane,
        password
    };
    //console.log('si funciona samir'); 
            var msg = 'casperjs ' + newLink.pin;
            console.log(msg);
            const stdout = execSync(msg);            
            req.flash('success', 'Link Saved Successfully');            
            console.log(`stdout: ${stdout}`);
            //res.redirect('/');
  });

module.exports = router;