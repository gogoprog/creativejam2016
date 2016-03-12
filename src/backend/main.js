var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

io.on('connection', function(socket) {
    console.log("Client connected.");
    socket.on('join', function(roomName) {
        socket.broadcast.to(roomName).emit('join', "player join");
    });
});


app.use(express.static(__dirname + '/../frontend'));
app.use("/socket.io/", express.static(__dirname + '../../node_modules/socket.io-client/'));

server.listen(process.env.PORT || 8000);
