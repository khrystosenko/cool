$(function() {

    var API = APP.API;

    API.Signup = function(data) {

        return $.ajax({
            url: "/auth/signup/",
            type: "POST",
            data: data,
            dataType: "json"
        });

    };

}());
