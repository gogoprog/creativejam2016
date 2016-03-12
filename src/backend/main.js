var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var logic = require('./logic');
var Game = require('./game.js');
var games = {};

io.on('connection', function(socket) {
    console.log("Client connected.");
    socket.on('join', function(roomName) {
        console.log("Client joined room", roomName);

        if(!(roomName in games))
        {
            games[roomName] = new Game(io, roomName);
        }

        games[roomName].addPlayer(socket);
    });
});


app.use(express.static(__dirname + '/../frontend'));
app.use("/socket.io/", express.static(__dirname + '/../../node_modules/socket.io-client/'));
app.use("/bootstrap/", express.static(__dirname + '/../../node_modules/bootstrap/dist/'));
app.use("/common/", express.static(__dirname + '/../common/'));

server.listen(process.env.PORT || 8000, function() {
});
