var socket = io();
var mainForm = null;
var readyContainer = null;

$( document ).ready(function() {
    mainForm = $("#mainForm");
    waitingForOtherPlayers = $("#waitingForOtherPlayers");
    readyContainer = $("#readyContainer");

    mainForm.hide();
    waitingForOtherPlayers.hide();

    var name = document.location.search;
    name = name.match(/\?name=(.*)/);


    console.log(name[1]);
    // connect on socket IO
    socket.emit('join', name[1]);

    socket.on('start', function(word){
        mainForm.show();
        readyContainer.hide();
    });

    socket.on('result', function(result){
        console.log('result');
        console.log(result);

        waitingForOtherPlayers.hide();
        // show results ( + win if you won ) and ready button. flow repeats.
    });
});

function submitAnswer()
{
    var input = $("#playerInput").val();
    socket.emit('word', input);

    mainForm.hide();
    waitingForOtherPlayers.show();
}

function onReady()
{
    $("#readyBtn")
        .removeClass("btn-warning")
        .addClass("btn-success")
        .off();

    var playerNameElement = $("#playerName");
    if ( playerNameElement.length ) {
        var playerName = playerNameElement.val();
        socket.emit('ready', playerName);
        playerNameElement.remove();
        $("label[for=playerName]").remove();
    } else {
        socket.emit('ready');
    }

}
