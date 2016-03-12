'use strict';

var ParsedScore = null;

function initialize()
{
    ParsedScore = JSON.parse('/common/score.json');
}

function calculateStringScore( string ) {
    let i = string.length;
    let score = 0;

    calculateCharacterScore = function( char ) {
        if ( ParsedScore.hasOwnProperty(char) ) {
            return ParsedScore[char];
        }

        return 0;
    };

    while (i--) {
      score += calculateCharacterScore( string.charAt(i) );
    }

    return score;
}

module.exports.initialize = initialize;
module.exports.calculateStringScore = calculateStringScore;
