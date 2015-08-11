$(function() {

    var API = APP.API;

    var Feedback = APP.Feedback;

    Feedback.send = function(e) {
        $('#feedback-error').hide();
        $('#feedback-success').hide();

        e.preventDefault();
        var data = {
            username: $('#feedback-name').val() || $('#premium-name').val(),
            email: $('#feedback-email').val() || $('#premium-email').val(),
            text: $('#feedback-text').val() || 'premium'
        };

        API.FeedbackSend(data).done(function(success) {
            $('#feedback-name').val('');
            $('#feedback-email').val('');
            $('#premium-name').val('');
            $('#premium-email').val('');
            $('#feedback-text').val('');
            $('#feedback-success').show();
            $('#get-premium').modal('hide');

        }).fail(function(errors) {
            $('#feedback-error').text(serverError);
            $('#feedback-error').show();
        });

        return false;
    };

}());