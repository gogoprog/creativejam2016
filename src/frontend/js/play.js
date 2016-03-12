$( document ).ready(function() {
    'use strict';

    let name = document.location.search;
    name = name.match(/\?name=(.*)/);

    let socket = io();

    console.log(name[1]);
    // connect on socket IO
    socket.emit('join', name[1]);

});
