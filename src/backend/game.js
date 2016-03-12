'use strict';
var Logic = require('./logic');

let fs = require('fs');
let words;

fs.readFile(__dirname + '/words.json', 'utf8', function (err,data) {
    if(err) console.log(err);
    words = JSON.parse(data);
});

let State = {
    WAITING_FOR_PLAYERS: 0,
    WAITING_FOR_WORDS: 1,
    SHOWDOWN: 2
};

class Game {
    constructor(io, name)
    {
        this.io = io;
        this.name = name;
        this.players = [];
        this.state = State.WAITING_FOR_PLAYERS;
    }

    emit(e, data)
    {
        this.io.to(this.name).emit(e, data);
    }

    addPlayer(socket)
    {
        socket.join(this.name);
        this.players.push(socket);
        this.emit('join', "player joined " + this.name);

        socket.index = this.players.length - 1;

        if(this.state == State.WAITING_FOR_PLAYERS && this.players.length > 1)
        {
            this.start();
        }

        let that = this;
        socket.on('word', function(data) {
            that.onWord(socket, data);
        });

        socket.on('disconnect', function(){
            this.players.splice(this.players.indexOf(socket), 1);
            this.state = State.WAITING_FOR_PLAYERS;
        });
    }

    start()
    {
        this.currentWord = words.en[0];
        this.playerWords = Array(this.players.length);
        for(var p in this.players) this.playerWords[p] = null;
        this.emit('start', this.currentWord);
        this.state = State.WAITING_FOR_WORDS;
    }

    onWord(socket, word)
    {
        console.log(word, 'from', socket.index);
        this.playerWords[socket.index] = word;

        let completed = true;
        for(var p in this.playerWords)
        {
            if(this.playerWords[p] === null)
            {
                completed = false;
            }
        }

        if(completed)
        {
            this.state = State.SHOWDOWN;
        }
    }
}

module.exports = Game;
