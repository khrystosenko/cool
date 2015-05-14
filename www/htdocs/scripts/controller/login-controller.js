$(function() {

    var API = APP.API;

    var Login = APP.Login;

    Login.login = function(e) {

        e.preventDefault();

        var data = {
                password: $('#inputPassword').val(),
                email: $('#inputEmail').val()
        };

        API.Login(data).done(function(success) {
        
            console.log("success");

        }).fail(function(errors) {
            
            console.log(errors);

        });

        return false;
    };

}());