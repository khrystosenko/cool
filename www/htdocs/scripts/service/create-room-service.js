$(function() {

    var API = APP.API;

    API.CreateRoom = function(data) {

        return $.ajax({
            url: "/room/create/",
            type: "POST",
            data: data,
            dataType: "json"
        });

    };

}());
