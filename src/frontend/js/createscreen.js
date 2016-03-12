
var playUrl = "";
var roomIsCreated = false;

function createRoom() {
    'use strict';

    let room_name = guid();

    let socket = io();

    socket.on('join', function(msg){
        console.log('join: ' + msg);
    });

    var qrcodedraw = new QRCodeLib.QRCodeDraw();

    playUrl = document.location.origin + "/play.html?name=" + room_name;
    roomIsCreated = true;
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
