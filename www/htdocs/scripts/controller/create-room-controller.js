(function() {

    var API = APP.API;

    var CreateRoom = APP.CreateRoom;

    $(document).on('appRouteChange', function(){
        console.log(Nav.getParam());
        Sockets.connectSocket();

    })

    CreateRoom.createRoom = function(e) {

        e.preventDefault();

        var data = {
            // username: $('#sender-name').val(),
            link: $('#sender-link').val(),
            name: $('#sender-name').val()
            // username: $('#sender-game').val(),
            // username: $('#sender-language').val()
        };

        $('.createError').hide();
         
        API.CreateRoom(data).done(function(data) {

            if(data.error){
                $('#create_room_' + data.field).show();
            }
            else {
                $('.createError').hide();
                window.location.href = '/room/' + data.name;
            }

        }).fail(function(errors) {

            console.log(errors);

        });

        return false;
    };

}());
