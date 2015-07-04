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
            link: $('#sender-link').val()
            // username: $('#sender-game').val(),
            // username: $('#sender-language').val()
        };

        $('.createError').hide();
         
        API.CreateRoom(data).done(function(success) {

            console.log("success");
            if(success.error){
                $('.createError').show();
            }
            else {
                $('.createError').hide();
                window.location.href = '/room/?id='+success.id;
            }

        }).fail(function(errors) {

            console.log(errors);

        });

        return false;
    };

}());
