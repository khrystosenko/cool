$(function() {

    var API = APP.API;

    API.FeedbackSend = function(data) {

        return $.ajax({
            url: "/feedback/",
            type: "POST",
            data: data,
            dataType: "json"
        });

    };

}());
