'use strict';
var logic = require('./logic');
var os = require('os');
var qrcode = require('qrcode');

class Game {
    constructor(io, name)
    {
        this.io = io;
        this.name = name;
        this.players = [];

        logic.initialize();

        // new room. Generate QR code for this room.

        var interfaces = os.networkInterfaces();
        var addresses = [];
        for (var k in interfaces) {
            for (var k2 in interfaces[k]) {
                var address = interfaces[k][k2];
                if (address.family === 'IPv4' && !address.internal) {
                    addresses.push(address.address);
                }
            }
        }

        if ( addresses.length > 0 ) {
            this.emit('ip', addresses[0]);
        }

        qrcode.toDataURL( addresses[0] + "login/?name=" + name, function(err, url) {
            console.log(url);
        } );

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
