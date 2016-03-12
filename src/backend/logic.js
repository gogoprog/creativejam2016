'use strict';

let fs = require('fs');
let ParsedScore = null;
let Logic = {};
let CorrectWords = [];

fs.readFile(__dirname + '/score.json', 'utf8', function (err, data) {
    if(err) console.log(err);
    ParsedScore = JSON.parse(data);
});

Logic.setCorrectWords = function(data) {
    CorrectWords = data;
};

Logic.calculateStringScore = function(string) {
    if ( CorrectWords.indexOf(string.toLowerCase()) > -1 ) {
        let i = string.length;
        let score = 0;

        var calculateCharacterScore = function( char ) {
            if ( ParsedScore.alphabet.hasOwnProperty(char) ) {
                return ParsedScore.alphabet[char];
            }

            return 0;
        };

        while (i--) {
          score += calculateCharacterScore( string.charAt(i) );
        }

        return score;
    }

    return 0;
};

module.exports = Logic;
