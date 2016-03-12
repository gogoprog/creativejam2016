
var playUrl = "";
var roomIsCreated = false;

function createRoom() {
    'use strict';

    let room_name = guid();

    let socket = io();

    socket.on('join', function(msg){
        console.log('join: ' + msg);
    });

    socket.on('start', function(word){
        $('#word').text(word);
    });

    socket.on('players', function(count){
        console.log('players', count);
    });

    socket.on('results', function(results){
        console.log('results');
        console.log(results);
    });

    socket.emit('mainScreen', room_name);

    var qrcodedraw = new QRCodeLib.QRCodeDraw();

    playUrl = document.location.origin + "/play.html?name=" + room_name;
    console.log(playUrl);
    roomIsCreated = true;
    qrcodedraw.scale = 8;
    qrcodedraw.draw(document.getElementById('qrcode-region'), playUrl, function(error,canvas){
      if(error){
         return console.log('Error: ',error);
      }
      console.log('success!');
    });

    // note: Must return false to prevent default behaviour
    return false;
}

function closeLobby()
{
    if( roomIsCreated ) {
        window.location = playUrl;
    }
}

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}
