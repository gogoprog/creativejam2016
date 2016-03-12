'use strict';

let normalizeSearch = require('normalize-for-search');
var request = require('request-promise');

class SynonymAntonym {

  constructor(api_key) {
    if (api_key) {
      this.api_key = api_key;
    } else {
      throw new Error("No api key passed");
    }
  }

  lookup(word, language) {
      console.log( `http://thesaurus.altervista.org/thesaurus/v1?word=${word}&language=${language}&key=${this.api_key}&output=json` );
    return request({
        method: "GET",
        url: `http://thesaurus.altervista.org/thesaurus/v1?word=${word}&language=${language}&key=${this.api_key}&output=json`,
        json: {}
    });
  }

  getWordData(word, language, callback) {
      var that = this;
    this.lookup(word, language).then( function(data) {
        var synonyms = [];
        for( let i = 0; i < data.response.length; ++i ) {
            synonyms = synonyms.concat( data.response[i].list.synonyms.split("|") );
        }

        let antonym = null;
        for ( let i = synonyms.length -1; i > 0; --i ) {
            synonyms[i] = normalizeSearch(synonyms[i]);
            let index = synonyms[i].search("(antonym)");
            if( index > -1 ) {
                antonym = synonyms.splice( i, 1 )[0];
                antonym = antonym.substring( 0, index - 1 ).trim();
            }
        }

        if ( antonym ) {
            console.log( "Found antonyms: " + antonym );
            that.lookup(antonym, language).then( function(data) {
                console.log( data );
                var antonyms = [];
                for( let i = 0; i < data.response.length; ++i ) {
                    antonyms = antonyms.concat( data.response[i].list.synonyms.split("|") );
                }

                for ( let i = antonyms.length -1; i > 0; --i ) {
                    antonyms[i] = normalizeSearch(antonyms[i]);
                    let index = antonyms[i].search("(antonym)");
                    if( index > -1 ) {
                        antonyms.splice( i, 1 );
                    }
                }

                callback( { "synonyms" : synonyms, "antonyms" : antonyms } );
            } );
        } else {
            callback( { "synonyms" : synonyms } );
        }
    } );
  }
}
module.exports = SynonymAntonym;
