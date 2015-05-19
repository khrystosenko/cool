(function() {

    var API = APP.API;

    var CreateRoom = APP.CreateRoom;

    var startChat = function() {
        $.ajax({
            type: "POST",
            url: 'http://localhost:9999/chat',
            data: JSON.stringify({}),
            cache: false,
            success: function() {

            },
            error: function() {

            },
        });
    };

    $(document).on('appRouteChange', function(){
        console.log(Nav.getParam());
        // startChat();
        Sockets.connectSocket();

    })

    CreateRoom.createRoom = function(e) {

        e.preventDefault();

        var data = {
            // username: $('#sender-name').val(),
            username: $('#sender-link').val()
            // username: $('#sender-game').val(),
            // username: $('#sender-language').val()
        };

        API.CreateRoom(data).done(function(success) {

            console.log("success");

        }).fail(function(errors) {

            console.log(errors);

        });

        return false;
    };

}());
