'use strict';

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
