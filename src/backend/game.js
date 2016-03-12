'use strict';
var Logic = require('./logic');

let fs = require('fs');
let words;

fs.readFile(__dirname + '/words.json', 'utf8', function (err,data) {
    if(err) console.log(err);
    words = JSON.parse(data);
});

class Game {
    constructor(io, name)
    {
        this.io = io;
        this.name = name;
        this.players = [];
    }

    emit(e, data)
    {
        this.io.to(this.name).emit(e, data);
    }

    addPlayer(socket)
    {
        socket.join(this.name);
        this.players.push(socket);
        this.emit('join', "player join");
    }
}

module.exports = Game;
