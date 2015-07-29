from roomit.db import rooms_history

def update_rooms(rooms):
	data_to_insert = []
	latest_rooms = rooms_history.get_latest_rooms()
	for room in rooms:
		if room['room'] not in latest_rooms or latest_rooms[room['room']] != room['num_participants']:
			data_to_insert.append((room['room'], room['num_participants']))

	rooms_history.insert_history(data_to_insert)