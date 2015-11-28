$(document).ready(function() {
  $('.stream').click(function(e) {
    e.preventDefault();

    $.ajax({
      type: 'POST',
      url: '/room/create/',
      data: {
        service: PLATFORM,
        channel: CHANNEL,
      },
      success: function(data) {
        console.log(data);
        if (data.error) {

        } else {
            window.location.href = '/room/' + data.name;
        }
      }, error: function() {

      }
    });
  });
});