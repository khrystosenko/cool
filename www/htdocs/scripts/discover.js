var currentGameID,
	currentSearch;

function streamSuccessCallback(data) {
	console.log(data);
}

function streamErrorCallback(error) {

}

function getStreams(game, search) {
	data = {
		game: game
	}

	search = search.trim();
	if (search) {
		data.stream = search
	}

	$.ajax({
		type: 'GET',
		data: data,
		url: '/search/',
		success: streamSuccessCallback,
		error: streamErrorCallback
	})
}

function DiscoverHandler() {
	this.offset = 0;
	this.limit = 25;

	this.getStreams = function(game, search) {

	}

	this.init = function() {

	}

}

$(document).ready(function() {
	currentSearch = $('#stream_search input').val();
	currentGameID = $('#game_filter a.active').attr('data-game-id');

	$('#game_filter a').click(function(e) {
		var gameID = $(this).attr('data-game-id');
		if (gameID == currentGameID) {
			return;
		}

		currentGameID = gameID;
		getStreams(gameID, currentSearch);
	});

	$('#stream_search label').click(function(e) {
		var search = $('#stream_search input').val();
		if (search == currentSearch) {
			return;
		}

		currentSearch = search;
		getStreams(currentGameID, search);
	});
});