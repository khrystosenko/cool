$(function() {

    var API = APP.API;

    API.Signup = function() {

        return $.ajax({
            url: "/auth/signup/",
            type: "POST",
            data: {
                username: 'ivanokil2',
                password: '12345qwe12',
                repassword: '12345qwe12',
                email: 'kkhrystosenk2@gmail.com'
            },
            dataType: "json"
        });

    };

}());
