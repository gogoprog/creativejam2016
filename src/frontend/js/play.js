var socket = io();
var mainForm = null;
var readyContainer = null;
var resultsContainer = null;
var background = null;

$( document ).ready(function() {
    mainForm = $("#mainForm");
    waitingForOtherPlayers = $("#waitingForOtherPlayers");
    readyContainer = $("#readyContainer");
    resultsContainer = $("#results");
    background = $("body");

    mainForm.hide();
    waitingForOtherPlayers.hide();
    resultsContainer.hide();

    var name = document.location.search;
    name = name.match(/\?name=(.*)/);


    console.log(name[1]);
    // connect on socket IO
    socket.emit('join', name[1]);

    socket.on('start', function(word){
        mainForm.show();
        $("input[type=text]", mainForm ).val("");
        readyContainer.hide();

        $('#win').hide();
        $('#lose').hide();
    });

    socket.on('result', function(result){
        console.log('result');
        console.log(result);

        resultsContainer.show();
        readyContainer.show();

        $("#readyBtn")
            .removeClass("btn-success")
            .addClass("btn-warning")
            .on("click", onReady );

        waitingForOtherPlayers.hide();

        var el;
        if ( result.win ) {
            //background.css("background-color", "green");
            el = $('#win');

        } else {
            //background.css("background-color", "red");
            el = $('#lose');
        }

        el.show();
        el.addClass('zoomInDown');
        el.addClass('animated');

        mainForm.hide();

        $("#score").text( result.score );
        // show results ( + win if you won ) and ready button. flow repeats.
    });

    $('#win').hide();
    $('#lose').hide();
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
