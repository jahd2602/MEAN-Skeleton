var express = require('express'),
 	morgan  = require('morgan'),
 	bodyParser = require('body-parser'),
 	mongoose = require('mongoose'); 


var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';
var app = express();

app.set('views', __dirname + '/server/views');
app.set('view engine', 'jade');
app.use(bodyParser())
app.use(morgan())
morgan({ format: 'dev', immediate: true })
app.use(express.static(__dirname + '/public'));

// MongoDB setup
mongoose.connect('mongodb://test:test@ds053188.mongolab.com:53188/hello');
var db = mongoose.connection;
var messageSchema = mongoose.Schema({message: String});
db.on('error', console.error.bind(console, 'connection error....'));
db.once('open', function callback() {
	console.log('MongoDB Online!');
})
var Message = mongoose.model('Message', messageSchema);

// JSON API
app.get('/api/:id', function(req, res){
	Message.find({ _id: req.params.id }, function (err, msg) {
			mongo = msg;
			res.json(mongo);
	});
});

app.get('/api', function(req, res){
	Message.find(function (err, msg) {
			mongo = msg;
			res.json(mongo);
	});
});

app.post('/api', function(req, res){
	var message = new Message({
		message : req.body.message
	});	
	message.save(function (err) {
		if (!err) {
			console.log("added " + message);
		}
	});
	res.json(message);
});

app.delete('/api/:id', function(req, res) {
	Message.remove({ _id: req.params.id }, function(err) {
    	if (!err) {
            console.log("deleted "+ req.params.id);
    	}
	});
	res.json({'_id': req.params.id});
});

// catch-all GET - defer routing to angular
app.get('*', function(req, res) {
	res.render('index', {});
});

// GO GO GO
var port = process.env.PORT || 3030;
app.listen(port);
console.log("Listening on port " + port + "...");