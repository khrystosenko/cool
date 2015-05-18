$(function() {

    var API = APP.API;

    var TextChat = APP.TextChat;

    TextChat.sendMessageT = function(e) {

        e.preventDefault();

        var msg = $('#m').val();

        network.send('chat message', msg);

        $('#m').val('');

        return false;
    };

}());
