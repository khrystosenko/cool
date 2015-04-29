/*!
 * Start Bootstrap - Agency Bootstrap Theme (http://startbootstrap.com)
 * Code licensed under the Apache License v2.0.
 * For details, see http://www.apache.org/licenses/LICENSE-2.0.
 */

// jQuery for page scrolling feature - requires jQuery Easing plugin

var lang;

function onload() {
    $(function() {
        $('a.page-scroll').bind('click', function(event) {
            var $anchor = $(this);
            $('html, body').stop().animate({
                scrollTop: $($anchor.attr('href')).offset().top
            }, 1500, 'easeInOutExpo');
            event.preventDefault();
        });
    });

    // Highlight the top nav as scrolling occurs
    $('body').scrollspy({
        target: '.navbar-fixed-top'
    })

    // Closes the Responsive Menu on Menu Item Click
    $('.navbar-collapse ul li a').click(function() {
        $('.navbar-toggle:visible').click();
    });

    if (lang.lang == 'en') {
        $('#lang_en').hide();
        $('#lang_ru').show();
    } else {
        $('#lang_ru').hide();
        $('#lang_en').show();
    }

    $(function() {

        $("input,textarea").jqBootstrapValidation({
            preventSubmit: true,
            submitError: function($form, event, errors) {
                console.log(errors);
                // additional error messages or events
            },
            submitSuccess: function($form, event) {
                event.preventDefault(); // prevent default submit behaviour
                // get values from FORM
                var name = $("input#name").val();
                var email = $("input#email").val();
                var phone = $("input#phone").val();
                var message = $("textarea#message").val();
                var firstName = name; // For Success/Failure Message
                // Check for white space in name for Success/Fail message
                if (firstName.indexOf(' ') >= 0) {
                    firstName = name.split(' ').slice(0, -1).join(' ');
                }
                $.ajax({
                    url: "/mail/contact_me.php",
                    type: "POST",
                    data: {
                        name: name,
                        phone: phone,
                        email: email,
                        message: message
                    },
                    cache: false,
                    success: function() {
                        // Success message
                        $('#success').html("<div class='alert alert-success'>");
                        $('#success > .alert-success').html("<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;")
                            .append("</button>");
                        $('#success > .alert-success')
                            .append("<strong>Your message has been sent. </strong>");
                        $('#success > .alert-success')
                            .append('</div>');

                        //clear all fields
                        $('#contactForm').trigger("reset");
                    },
                    error: function() {
                        // Fail message
                        $('#success').html("<div class='alert alert-danger'>");
                        $('#success > .alert-danger').html("<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;")
                            .append("</button>");
                        $('#success > .alert-danger').append("<strong>Sorry " + firstName + ", it seems that my mail server is not responding. Please try again later!");
                        $('#success > .alert-danger').append('</div>');
                        //clear all fields
                        $('#contactForm').trigger("reset");
                    },
                })
            },
            filter: function() {
                return $(this).is(":visible");
            },
        });

        $("a[data-toggle=\"tab\"]").click(function(e) {
            e.preventDefault();
            $(this).tab("show");
        });
    });


    /*When clicking on Full hide fail/success boxes */
    $('#name').focus(function() {
        $('#success').html('');
    });

}

var loadTemplate = function(templatePath) {

    var deferred = $.Deferred();

    $.ajax({

        url: '/html/' + templatePath + '.html',
        type: 'GET',
        cache: false

    }).done(function(html) {

        deferred.resolve(Mustache.render(html, getMs()));

    }).fail(deferred.reject);

    return deferred.promise();

};

$(function() {

    lang = $.parseParams(window.location.search.slice(1) || 'lang=en');

    $.get('/langs/lang_' + $.parseParams(window.location.search.slice(1) || 'lang=en').lang + '.json').then(function(res) {

        localeMessages = res;

        loadTemplate('index-raw').then(function(res) {

            $('#_body').html(res);

            onload();

        });

    });

});

var setLang = function(code) {

    window.location.href = '?lang=' + code + window.location.hash;

};

var getMs = function() {

    return localeMessages;

};
/**
 * $.parseParams - parse query string paramaters into an object.
 */
(function(cash) {
    var re = /([^&=]+)=?([^&]*)/g;
    var decodeRE = /\+/g; // Regex for replacing addition symbol with a space
    var decode = function(str) {
        return decodeURIComponent(str.replace(decodeRE, " "));
    };
    $.parseParams = function(query) {
        var params = {},
            e;
        while (e = re.exec(query)) {
            var k = decode(e[1]),
                v = decode(e[2]);
            if (k.substring(k.length - 2) === '[]') {
                k = k.substring(0, k.length - 2);
                (params[k] || (params[k] = [])).push(envy);
            } else params[k] = v;
        }
        return params;
    };
})(jQuery);
