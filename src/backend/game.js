'use strict';
var Logic = require('./logic');
var SynonymAntonym = require('./synonym_antonym');

let fs = require('fs');
let words;

var wordData = new SynonymAntonym('ryigBKZzAXACmbtHda2s');

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
        this.Language = "fr_FR";
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

    setLanguage(language)
    {
        this.Language = language;
    }

    addPlayer(socket)
    {
        socket.join(this.name);
        this.players.push(socket);
        this.emit('join', "player joined " + this.name);
        this.mainScreenEmit('players', this.players.length);

        socket.index = this.players.length - 1;
        socket.totalScore = 0;
        socket.ready = false;

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
                console.log('User left', socket.name || '?');

                that.players.splice(index, 1);

                for(var p in that.players)
                {
                    that.players[p].index = p;
                }

            }

            that.mainScreenEmit('players', that.players.length);

            that.checkReceivedWords();
        });

        socket.on('ready', function(name){
            if(!socket.ready)
            {
                socket.ready = true;
                console.log('User is ready', name || socket.name);

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
            }
        });
    }

    start()
    {
        console.log('Start');
        this.firstWord = false;
        let w = words[this.Language];
        this.currentWord = w[Math.floor(Math.random()*w.length)];
        console.log("Current word: " + this.currentWord );

        for(var p in this.players)
        {
            this.players[p].word = '';
            this.players[p].playing = true;
        }
        var that = this;
        wordData.getWordData(this.currentWord, this.Language, function(data) {
            let type = "synonym";
            if ( data.anthonyms ) {
                if ( Math.random() > 0.5 ) {
                    that.correctWords = data.antonyms;
                    type = "antonym";
                }  else {
                    that.correctWords = data.synonyms;
                }
            } else {
                that.correctWords = data.synonyms;
            }
            var result_object = {};
            result_object.word = that.currentWord;
            result_object.type = type;
            that.emit('start', result_object);
            that.mainScreenEmit('start', result_object);
            that.state = State.WAITING_FOR_WORDS;
        });
    }

    onWord(socket, word)
    {
        console.log(word, 'from', socket.name);
        socket.word = word;
        this.mainScreenEmit('playerWord', {index:socket.index, word:word});

        this.checkReceivedWords();
    }

    checkReceivedWords()
    {
        let completed = true;
        for(var p in this.players)
        {
            if(this.players[p].playing && this.players[p].word === '')
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

        Logic.setCorrectWords(this.correctWords);
        for(let p in this.players)
        {
            let score = Logic.calculateStringScore(this.players[p].word);
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
        console.log('WAITING_FOR_PLAYERS');
    }
}

module.exports = Game;
