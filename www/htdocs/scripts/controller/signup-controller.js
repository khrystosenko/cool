/*!
 * Start Bootstrap - Agency Bootstrap Theme (http://startbootstrap.com)
 * Code licensed under the Apache License v2.0.
 * For details, see http://www.apache.org/licenses/LICENSE-2.0.
 */

// jQuery for page scrolling feature - requires jQuery Easing plugin
// $(function() {
//     $('a.page-scroll').bind('click', function(event) {
//         var $anchor = $(this);
//         $('html, body').stop().animate({
//             scrollTop: $($anchor.attr('href')).offset().top
//         }, 1500, 'easeInOutExpo');
//         event.preventDefault();
//     });
// });

// // Highlight the top nav as scrolling occurs
// $('body').scrollspy({
//     target: '.navbar-fixed-top'
// })

// // Closes the Responsive Menu on Menu Item Click
// $('.navbar-collapse ul li a').click(function() {
//     $('.navbar-toggle:visible').click();
// });

$(function() {

    var API = APP.API;

    var Signup = APP.Signup;

    Signup.signup = function(e) {

        e.preventDefault();

        var data = {
                username: $('#inputName').val(),
                password: $('#inputPassword').val(),
                repassword: $('#inputRePassword').val(),
                email: $('#inputEmail').val()
        };

        API.Signup(data).done(function(success) {
        
            console.log("success");

        }).fail(function(errors) {

            $scope.errors = errors;

            console.log(errors);

        });

        return false;
    };

}());
