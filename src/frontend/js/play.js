var socket = io();

$( document ).ready(function() {
    $("#mainForm").hide();

    var name = document.location.search;
    name = name.match(/\?name=(.*)/);


    console.log(name[1]);
    // connect on socket IO
    socket.emit('join', name[1]);

    socket.on('start', function(word){
        $("#mainForm").show();
        $("#readyContainer").hide();
    });
});

function submit()
{
    var input = $("#playerInput").val();
    socket.emit('word', input);
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
