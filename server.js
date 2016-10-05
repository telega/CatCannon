require('dotenv').config();
var hashtag = '#KanyeWest';
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Twitter = require('twitter');

var options = {
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN_KEY,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
};

tClient = new Twitter(options);

var clients = [];

app.use(express.static('public'));

app.get('/', function(req, res){
  res.sendFile(__dirname+'/public/index.html');
});

io.on('connection', function(socket){
	//console.log('new client: ' + socket.id);
  clients.push(socket);
  socket.on('disconnect', function(){
  	var i = clients.indexOf(socket);
  	clients.splice(i,1);
  	//console.log('removed client:' + socket.id);
  });
});

tClient.stream('statuses/filter', {track: hashtag},  function(stream) {
  stream.on('data', function(tweet) {
      for (c in clients){
        clients[c].emit('fire', tweet.text);
      }
  });

  stream.on('error', function(error) {
    console.log(error);
  });
});


http.listen(3000, function(){
  console.log('listening on *:3000');
});
