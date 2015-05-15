$(function() {

    var API = APP.API;

    var Login = APP.Login;

    Login.login = function(e) {

        e.preventDefault();

        var data = {
                username: $('#sender-name').val(),
                password: $('#user-pass').val()
        };

        API.Login(data).done(function(success) {
        
            console.log("success");

        }).fail(function(errors) {
            
            console.log(errors);

        });

        return false;
    };

}());