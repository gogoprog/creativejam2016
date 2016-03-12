'use strict';

class Game {
    constructor(io, name)
    {
        this.io = io;
        this.name = name;
        this.players = [];
    }

    addPlayer(socket)
    {
        this.players.push(socket);
        this.io.to(this.name).emit('join', "player join");
    }
}

module.exports = Game;
