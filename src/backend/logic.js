'use strict';

let fs = require('fs');
let ParsedScore = null;
let Logic = {};

fs.readFile(__dirname + '/score.json', 'utf8', function (err, data) {
    if(err) console.log(err);
    ParsedScore = JSON.parse(data);
});


Logic.calculateStringScore = function(string) {
    let i = string.length;
    let score = 0;

    var calculateCharacterScore = function( char ) {
        if ( ParsedScore.hasOwnProperty(char) ) {
            return ParsedScore[char];
        }

        return 0;
    };

    while (i--) {
      score += calculateCharacterScore( string.charAt(i) );
    }

    return score;
};

module.exports = Logic;
