var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

io.on('connection', function(){ /* … */ });

app.use(express.static(__dirname + '/../frontend'));

server.listen(process.env.PORT || 8000);
