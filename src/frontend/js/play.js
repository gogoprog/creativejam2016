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
    });
});

function submit()
{
    var input = $("#playerInput").val();
    socket.emit('word', input);
}

function onReady( elem )
{
    $(elem)
        .removeClass("btn-warning")
        .addClass("btn-success")
        .off();
    socket.emit('ready');
}
