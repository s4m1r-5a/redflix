var casper = require('casper').create();

//var url = casper.cli.args;

casper.start(casper.cli.args, function () {
    this.echo("I'm loaded.");
});

casper.then(function () {
    this.echo("getCurrentUrl " + this.getCurrentUrl());
    this.echo("title " + this.getTitle());
    this.capture('prueba.png');
});
casper.run(function () {
    this.echo(casper.cli.args);
    this.exit(); // <--- don't forget me! https://iux.com.co/x/venta.php
});