
var playUrl = "";
var roomIsCreated = false;
var playerModel;

function createRoom() {
    'use strict';

    let room_name = guid();

    let socket = io();

    socket.on('join', function(msg){
        console.log('join: ' + msg);
    });

    socket.on('start', function(word){
        $('#word').text(word.word);
        $('#type').text(word.type);
    });

    socket.on('players', function(count){
        setPlayerCount(count);
    });

    socket.on('playerName', function(data){
        console.log(data);
        $('.playerName').eq(data.index).text(data.name);
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

function setPlayerCount(count)
{
    console.log('setPlayerCount', count);
    var container = $('#players');
    var currentCount = container.children().size();

    if(currentCount < count)
    {
        for(var i=0; i<count - currentCount; i++)
        {
            var element = playerModel.clone();
            container.append(element);
            element.show();
        }
    }
    else if(currentCount > count)
    {
        for(var j=0; j<currentCount - count; j++)
        {
            container.children().last().remove();
        }
    }
}

$(function(){
    playerModel = $('#playerModel');
    playerModel.hide();
});
