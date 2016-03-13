
var playUrl = "";
var roomIsCreated = false;
var playerModel;
var language;
var aniJSCanvasNotifier;
var playerContainer;
var receivedWordCount;

function createRoom() {
    'use strict';

    let room_name = guid();

    let socket = io();

    socket.on('join', function(msg){
        console.log('join: ' + msg);
    });

    socket.on('start', function(word){
        // move the qr code.
        aniJSCanvasNotifier.dispatchEvent('hideCustom');


        $('#word').text(word.word);
        $('#type').text(word.type);

        playerContainer.children().data('word', '');
        $('.playerWord').text('?');
        $('.playerWordPosition').text('?');

        receivedWordCount = 0;
        playerContainer.children().removeClass("ready");

    });

    socket.on('players', function(count){
        setPlayerCount(count);
    });

    socket.on('playerName', function(data){
        console.log('playerName', data);
        $('.playerName').eq(data.index).text(data.name);
    });

    socket.on('playerReady', function(data) {
        playerContainer.children().eq(data).addClass("ready");
    });

    socket.on('playerWord', function(data){
        console.log('playerWord', data);
        playerContainer.children().eq(data.index).data('word', data.word);
        $('.playerWordPosition').eq(data.index).text(++receivedWordCount);
    });

    socket.on('results', function(results){
        console.log('results');
        fillPlayersData(results);
    });

    language = $("#languageSelector").val();
    socket.emit('mainScreen', { "name" : room_name, "language": language } );

    var qrcodedraw = new QRCodeLib.QRCodeDraw();

    $("#qrcode-region").show();

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
    var container = playerContainer;
    var currentCount = playerContainer.children().size();

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

function fillPlayersData(results)
{
    var totalScores = $('.totalScore');
    var words = $('.playerWord');

    for(var r in results)
    {
        var result = results[r];
        totalScores.eq(r).text(result.totalScore);
    }

    playerContainer.children().each(function(index){
        console.log(index);
        console.log($(this));
        if ($(this).data('word')) {
            words.eq(index).text($(this).data('word'));
        }
    });
}

$(function(){
    playerModel = $('#playerModel');
    playerModel.hide();

    AniJS.run();
    //Obtaining the Notifier
    aniJSCanvasNotifier = AniJS.getNotifier('CanvasCustom');

    //Obtaining the default helper
    var animationHelper = AniJS.getHelper();

    //Defining afterAnimationFunction
    animationHelper.moveCanvas = function(e, animationContext){
        console.log(e);

        var qrcode = $("#qrcode-region");
        qrcode.width( qrcode.width() / 2 );
        qrcode.height( qrcode.height() / 2 );
        $("#createSection").hide();
        $("#gameSection").show();
        aniJSCanvasNotifier.dispatchEvent('showCustom');
    };
    $("#qrcode-region").hide();
    $("#gameSection").hide();
    playerContainer = $('#players');
});
