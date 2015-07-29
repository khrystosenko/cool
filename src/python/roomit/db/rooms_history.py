from roomit.db import dbcp

@dbcp.roomit
def get_latest_rooms(cursor):
	query = """ SELECT r1.room_id, r1.participants
				FROM `rooms_history` r1
				JOIN ( SELECT `room_id`, MAX(`timestamp`) timestamp
					   FROM `rooms_history`
					   GROUP BY `room_id` 
					 ) r2
				  ON r1.room_id = r2.room_id AND r1.timestamp = r2.timestamp
			"""
	cursor.execute(query)
	data = {}
	for item in cursor.fetchall():
		data[item[0]] = item[1]

	return data

@dbcp.roomit
def insert_history(cursor, data):
	query = """INSERT INTO `rooms_history` (`room_id`, `participants`)
			   VALUES (%s, %s)
			"""
	cursor.executemany(query, data)