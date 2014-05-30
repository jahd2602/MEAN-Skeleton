var express = require('express'),
 	stylus = require('stylus'),
 	morgan  = require('morgan'),
 	bodyParser = require('body-parser'),
 	mongoose = require('mongoose'); 


var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';
var app = express();


function compile(str, path) {
	return stylus(str).set('filename', path);
}


app.set('views', __dirname + '/server/views');
app.set('view engine', 'jade');

app.use(bodyParser())
app.use(morgan())
morgan({ format: 'dev', immediate: true })


app.use(stylus.middleware(
	{
		src: __dirname + '/public',
		compile: compile
	}
));


app.use(express.static(__dirname + '/public'));

mongoose.connect('mongodb://test:test@ds053188.mongolab.com:53188/hello');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error....'));
db.once('open', function callback() {
	console.log('nero db opened');
})

var messageSchema = mongoose.Schema({message: String});
var Message = mongoose.model('Message', messageSchema);
/*
var test = new Message({ message: 'MongoDB Online' });
test.save(function (err, save) {
  if (err) return console.error(err);
  console.log("saved "+save);
});
*/

Message.findOne(function (err, msg) {
  if (err) return console.error(err);
  mongoMessage = msg.message
  console.log("db message: "+msg.message);
});

app.get('/view', function(req, res) {
	console.log("Inside View");
	res.render('index', {
		mongoMessage: mongoMessage
	})
});

app.get('*', function(req, res) {
	res.render('index', {
		mongoMessage: mongoMessage
	})

});

var port = process.env.PORT || 3030;
app.listen(port);
console.log("Listening on port " + port + "...");

