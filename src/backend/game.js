'use strict';
var logic = require('./logic');

let fs = require('fs');
let words;

fs.readFile('words.json', 'utf8', function (err,data) {
    words = JSON.parse(data);
});

class Game {
    constructor(io, name)
    {
        this.io = io;
        this.name = name;
        this.players = [];

        logic.initialize();
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
