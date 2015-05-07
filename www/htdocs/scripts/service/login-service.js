$(function() {

    var API = APP.API;

    API.Login = function(data) {

        return $.ajax({
            url: "/auth/login/",
            type: "POST",
            data: data,
            dataType: "json"
        });

    };

}());
