
var playUrl = "";
var roomIsCreated = false;

function createRoom() {
    'use strict';

    let room_name = $("#roomName").val();

    let socket = io();

    socket.emit('join', room_name);

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
