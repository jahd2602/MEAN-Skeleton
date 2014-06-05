var express = require('express'),
 	morgan  = require('morgan'),
 	bodyParser = require('body-parser');


module.exports = function(app, config) {
	app.set('views', config.rootPath + '/server/views');
	app.set('view engine', 'jade');
	app.use(bodyParser())
	app.use(morgan())
	morgan({ format: 'dev', immediate: true })
	app.use(express.static(config.rootPath + '/public'));
};