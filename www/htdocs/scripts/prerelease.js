$(document).ready(function() {
	$('#create-room-btn').click(function(e) {
		e.preventDefault();

		var email = $('#stream-link').val().trim();
		$(this).addClass('disabled');

		$.ajax({
			type: 'POST',
			url: '/feedback/',
			data: {
				username: 'prerelease',
				email: $('#stream-link').val(),
				text: 'Subscribe'
			},
			success: function(data) {
				$('#create-room-btn').removeClass('disabled');
				if (data.error_code == 406) {
					return;
				}

				$('#stream-link').val('');
			},
			error: function() {
				$('#create-room-btn').removeClass('disabled');
			}
		});
	});
});