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

    mainScreenEmit(e, data)
    {
        if('mainScreenSocket' in this)
        {
            this.mainScreenSocket.emit(e, data);
        }
    }

    setMainScreen(socket)
    {
        this.mainScreenSocket = socket;
    }

    addPlayer(socket)
    {
        socket.join(this.name);
        this.players.push(socket);
        this.emit('join', "player joined " + this.name);
        this.mainScreenEmit('players', this.players.length);

        socket.index = this.players.length - 1;
        socket.totalScore = 0;

        let that = this;
        socket.on('word', function(data) {
            if(that.state == State.WAITING_FOR_WORDS)
            {
                that.onWord(socket, data);
                if(!that.firstWord)
                {
                    that.firstWord = true;
                    let currentWord = that.currentWord;
                    setTimeout(function(){
                        if(that.state == State.WAITING_FOR_WORDS && that.currentWord == currentWord)
                        {
                            that.showDown();
                        }
                    },5000);
                }
            }
        });

        socket.on('disconnect', function(){
            var index = that.players.indexOf(socket);
            if(index != -1)
            {
                that.players.splice(index, 1);
                that.state = State.WAITING_FOR_PLAYERS;
                for(var p in that.players)
                {
                    that.players[p].index = p;
                }
            }
        });

        socket.on('ready', function(name){
            socket.ready = true;

            if(name !== undefined)
            {
                socket.name = name;
                that.mainScreenEmit('playerName', {index:socket.index, name:name});
            }

            if(that.state == State.WAITING_FOR_PLAYERS)
            {
                let ready = true;

                for(var p in that.players)
                {
                    if(!that.players[p].ready)
                    {
                        ready = false;
                        break;
                    }
                }

                if(ready)
                {
                    that.start();
                }
            }
        });
    }

    start()
    {
        console.log('Start');
        this.firstWord = false;
        this.currentWord = words.en[0];
        this.playerWords = Array(this.players.length);
        for(var p in this.players) this.playerWords[p] = '';
        this.emit('start', this.currentWord);
        this.mainScreenEmit('start', this.currentWord);
        this.state = State.WAITING_FOR_WORDS;
    }

    onWord(socket, word)
    {
        console.log(word, 'from', socket.index);
        this.playerWords[socket.index] = word;

        let completed = true;
        for(var p in this.playerWords)
        {
            if(this.playerWords[p] === '')
            {
                completed = false;
                break;
            }
        }

        if(completed)
        {
            this.showDown();
        }
    }

    showDown()
    {
        console.log('ShowDown');
        let scores = [];
        this.state = State.SHOWDOWN;
        let bestScore = 0;
        let winners = [];

        for(let p in this.players)
        {
            let score = Logic.calculateStringScore(this.playerWords[p]);
            scores.push(score);

            if(score > bestScore)
            {
                winners = [p];
                bestScore = score;
            }
            else if(score == bestScore)
            {
                winners.push(p);
            }

            this.players[p].totalScore += score;
        }

        let allResults = [];

        for(let p in this.players)
        {
            let result = {
                score: scores[p],
                totalScore: this.players[p].totalScore,
                win: (winners.indexOf(p) != -1)
            };

            this.players[p].emit('result', result);

            allResults.push(result);
            this.players[p].ready = false;
        }

        this.mainScreenEmit('results', allResults);

        this.state = State.WAITING_FOR_PLAYERS;
    }
}

module.exports = Game;
