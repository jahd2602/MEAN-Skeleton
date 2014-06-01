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
Message.findOne(function (err, msg) {
  if (err) return console.error(err);
  mongoMessage = msg.message;
});


// JSON API
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
			console.log("added " +message);
		} else {
			console.log(err);
		}
	});
	res.json(message);
});

// catch-all GET - defer routing to angular
app.get('*', function(req, res) {
	res.render('index', {
		mongoMessage: mongoMessage
	});
});

// GO GO GO
var port = process.env.PORT || 3030;
app.listen(port);
console.log("Listening on port " + port + "...");